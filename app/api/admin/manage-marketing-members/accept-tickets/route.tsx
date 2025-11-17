import { canUserAccess, ProtectedResource } from "@/app/api/utils/auth";
import { sql } from "@vercel/postgres";
import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { sendEmail } from "../../payment-reciever/eTicketEmail";

export async function POST(request: NextRequest) {
  if (!canUserAccess(request, ProtectedResource.MARKETING_DASHBOARD)) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { memberId, date, paid } = body;

    const dateObj = new Date(
      `${date.slice(6, 10)}-${date.slice(3, 5)}-${date.slice(0, 2)}`
    );

    if (!memberId || !date) {
      return Response.json(
        { message: "Member ID and Date are required." },
        { status: 400 }
      );
    }

    let client = await sql.connect();
    const result = await client.query(
      `UPDATE rush_hour SET processed = TRUE WHERE marketing_member_id = $1 AND created_at::date = $2 AND processed = FALSE RETURNING *`,
      [memberId, dateObj]
    );

    let stream = "Marketing@" + memberId;

    client.sql`INSERT INTO pay_backup (stream, incurred, recieved, recieved_at) VALUES (${stream}, ${paid}, ${paid}, NOW())`;

    await Promise.all(
      result.rows.map(async (row) => {
        try {
          const attendeeId = row.attendee_id;
          if (attendeeId) {
            const attendee = await client.query(
              `UPDATE attendees SET paid = TRUE, uuid = $1, sent = TRUE WHERE id = $2 AND paid = FALSE RETURNING *`,
              [randomUUID(), attendeeId]
            );

            await sendEmail(
              attendee.rows[0].email,
              attendee.rows[0].full_name,
              attendee.rows[0].uuid
            );
          }
        } catch (error) {
          console.error(
            "[MANAGE MARKETNG] Error processing attendee ID:",
            row.attendee_id,
            error
          );
        }
      })
    );

    client.release();

    return Response.json({ message: "Success." }, { status: 200 });
  } catch (error) {
    console.error("Error accepting ticket:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
