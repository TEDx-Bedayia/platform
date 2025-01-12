import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

// Handler for POST requests
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

  const { id, email } = await request.json();

  try {
    // Update the admitted status for the specified applicant
    const applicant = await sql`SELECT * FROM attendees WHERE id = ${id}`;
    const oldEmail = applicant.rows[0].email;

    const result = await sql.query(
      "UPDATE attendees SET email = $1 WHERE id = $2 RETURNING *",
      [email, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Applicant not found" },
        { status: 404 }
      );
    }

    if (result.rows[0].type === "group") {
      await sql`UPDATE groups SET email = ${email} WHERE email1 = ${oldEmail} OR email2 = ${oldEmail} OR email3 = ${oldEmail} OR email4 = ${oldEmail}`;
    }

    return NextResponse.json(
      { success: true, applicant: result.rows[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "An Error Occurred" }, { status: 502 });
  }
}
