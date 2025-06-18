import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { sendBookingConfirmation } from "../../utils/email-helper";
import { sendEmail } from "../payment-reciever/eTicketEmail";
import { safeRandUUID } from "../payment-reciever/main";

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
      await sql`
        UPDATE groups
        SET 
          email1 = CASE WHEN email1 = ${oldEmail} THEN ${email} ELSE email1 END,
          email2 = CASE WHEN email2 = ${oldEmail} THEN ${email} ELSE email2 END,
          email3 = CASE WHEN email3 = ${oldEmail} THEN ${email} ELSE email3 END,
          email4 = CASE WHEN email4 = ${oldEmail} THEN ${email} ELSE email4 END
        WHERE 
          email1 = ${oldEmail} OR 
          email2 = ${oldEmail} OR 
          email3 = ${oldEmail} OR 
          email4 = ${oldEmail}
      `;
    }

    if (result.rows[0].paid === false) {
      await sendBookingConfirmation(
        result.rows[0].payment_method,
        result.rows[0].full_name,
        email,
        result.rows[0].id,
        result.rows[0].type
      );
    } else {
      const newUUID = await safeRandUUID();
      await sql`
        UPDATE attendees
        SET uuid = ${newUUID}
        WHERE id = ${id} AND paid = true`;

      await sendEmail(
        email,
        result.rows[0].full_name,
        newUUID,
        result.rows[0].id
      );
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
