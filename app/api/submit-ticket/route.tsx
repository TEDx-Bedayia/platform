import { sql } from "@vercel/postgres";
import { type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = body.name;
  const email = body.email;
  const phone = body.phone;
  const paymentMethod = body.paymentMethod;
  if (!name || !email || !phone || !paymentMethod) {
    return Response.json(
      { message: "Please fill out all required fields" },
      { status: 400 }
    );
  }
  //TODO EXTRA CHECKS + EMAIL DOESN'T EXIST IN DB
  //TODO DATA BASE SAVE LOGIC
  return Response.json({
    message: `Ticket submitted successfully for ${name} / ${email}`,
  });
}

export async function GET() {
  let query = await sql`SELECT * FROM attendees WHERE id = 1;`;
  let name = query.rows[0];
  return Response.json(name);
}
