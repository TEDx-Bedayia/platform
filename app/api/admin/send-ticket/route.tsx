import { sql } from "@vercel/postgres";
import { type NextRequest } from "next/server";
import QRCode from "qrcode";
import { sendEmail } from "../payment-reciever/eTicketEmail";

export async function GET(request: NextRequest) {
  let params = request.nextUrl.searchParams;

  if (request.headers.get("key") !== process.env.ADMIN_KEY) {
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

    let qr = await QRCode.toDataURL(q.rows[0].uuid);
    await sendEmail(q.rows[0].email, q.rows[0].full_name, q.rows[0].uuid, qr);
    return Response.json(
      { message: `Email sent to ${q.rows[0].email}.` },
      { status: 200 }
    );
  } catch (error) {
    return Response.json({ message: "Error occurred." }, { status: 400 });
  }
}
