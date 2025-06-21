import { price } from "@/app/api/tickets/price/prices";
import { sql } from "@vercel/postgres";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  if (
    process.env.ADMIN_KEY === undefined ||
    !process.env.ADMIN_KEY ||
    !process.env.MARKETING_KEY ||
    process.env.MARKETING_KEY === undefined
  ) {
    return Response.json(
      { message: "Key is not set. Contact the maintainer." },
      { status: 500 }
    );
  }

  if (
    request.headers.get("key") !== process.env.ADMIN_KEY &&
    request.headers.get("key") !== process.env.MARKETING_KEY
  ) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    let { rows } =
      await sql`SELECT * FROM rush_hour WHERE processed = FALSE ORDER BY created_at DESC`;

    if (rows.length === 0) {
      return Response.json({ activity: [] }, { status: 200 });
    }
    rows = rows.map((row) => ({
      memberId: row.marketing_member_id,
      attendeeId: row.attendee_id,
      createdAt: row.created_at,
    }));

    let idsOrNull = rows
      .map((row) => row.attendeeId)
      .filter((x) => x != null)
      .join(",");

    let attendees = await sql.query(
      `SELECT id, type FROM attendees WHERE id IN (${idsOrNull})`
    );

    rows = rows.map((row) => {
      const attendee = attendees.rows.find(
        (attendee) => attendee.id === row.attendeeId
      );
      return {
        ...row,
        price: attendee
          ? price.getPrice(attendee.type, "CASH")
          : price.discounted,
      };
    });

    return Response.json({ activity: rows }, { status: 200 });
  } catch (error) {
    console.error("Error fetching member activity:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
