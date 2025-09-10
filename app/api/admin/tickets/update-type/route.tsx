import { TicketType } from "@/app/api/utils/ticket-types";
import { sql } from "@vercel/postgres";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  if (process.env.ADMIN_KEY === undefined || !process.env.ADMIN_KEY) {
    return Response.json(
      { message: "Key is not set. Contact the maintainer." },
      { status: 500 }
    );
  }

  if (request.headers.get("key") !== process.env.ADMIN_KEY) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    let { id, type } = await request.json();
    if (!Object.values(TicketType).includes(type)) {
      return Response.json({ message: "Invalid type." }, { status: 400 });
    }
    let q =
      await sql`UPDATE attendees SET type = ${type} WHERE id = ${id} AND type NOT IN ('speaker') AND paid = false RETURNING *`;
    if (q.rowCount === 0) {
      return Response.json({ message: "Invalid request" }, { status: 400 });
    }
    return Response.json({ message: "Success" });
  } catch (e) {
    console.error(e);
    return Response.json({ message: "Invalid request" }, { status: 400 });
  }
}
