import { sql } from "@vercel/postgres";
import { type NextRequest } from "next/server";
import { sendEmail } from "../payment-reciever/eTicketEmail";
import { safeRandUUID } from "../payment-reciever/main";

export async function GET(request: NextRequest) {
  let params = request.nextUrl.searchParams;

  if (
    request.headers.get("key") !== process.env.ADMIN_KEY ||
    !process.env.ADMIN_KEY
  ) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  let id = params.get("id");
  if (id === null) {
    return Response.json({ message: "ID is required." }, { status: 400 });
  }

  try {
    let q = await sql`SELECT * FROM attendees WHERE id = ${id}`;
    if (q.rowCount !== 1) {
      return Response.json({ message: "Attendee not found." }, { status: 404 });
    }

    if (q.rows[0].uuid === null && q.rows[0].paid == true) {
      let uuid = await safeRandUUID();
      await sql`UPDATE attendees SET uuid = ${uuid} WHERE id = ${id}`;
      q.rows[0].uuid = uuid;
    }

    await sendEmail(
      q.rows[0].email,
      q.rows[0].full_name,
      q.rows[0].uuid,
      q.rows[0].id
    );
    return Response.json(
      { message: `Email sent to ${q.rows[0].email}.` },
      { status: 200 }
    );
  } catch (error) {
    return Response.json({ message: "Error occurred." }, { status: 400 });
  }
}
