import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { canUserAccess, ProtectedResource } from "../../utils/auth";
import { sendBookingConfirmation } from "../../utils/email-helper";
import { sendEmail } from "../payment-reciever/eTicketEmail";
import { safeRandUUID } from "../payment-reciever/main";

export async function POST(request: NextRequest) {
  if (!canUserAccess(request, ProtectedResource.TICKET_DASHBOARD)) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id, email } = await request.json();

  try {
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

    if (
      result.rows[0].paid === false &&
      result.rows[0].payment_method.toString().split("@")[0] === "CASH"
    ) {
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
