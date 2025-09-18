import { TICKET_WINDOW } from "@/app/metadata";
import { sql } from "@vercel/postgres";
import { type NextRequest } from "next/server";
import { sendEmail } from "../admin/payment-reciever/eTicketEmail";
import { safeRandUUID } from "../admin/payment-reciever/main";
import { sendBookingConfirmation } from "../utils/email-helper";
import {
  checkPhone,
  checkSafety,
  generateRandomString,
  handleMisspelling,
  verifyEmail,
  verifyPaymentMethod,
} from "../utils/input-sanitization";
import { TicketType } from "../utils/ticket-types";

// email, name, phone, paymentMethod
export async function POST(request: NextRequest) {
  if (new Date() < TICKET_WINDOW[0] || new Date() > TICKET_WINDOW[1]) {
    if (process.env.ADMIN_KEY !== "dev")
      return Response.json(
        { message: "Ticket sales are currently closed." },
        { status: 400 }
      );
  }
  let body: any;
  try {
    body = await request.json();
  } catch (error) {
    return Response.json(
      { message: "Please provide a valid JSON body." },
      { status: 400 }
    );
  }

  let paymentMethod: string, name, email, phone, add, code;
  try {
    name = body.name?.toString().trim();
    email = body.email?.toString().trim().toLowerCase();
    phone = body.phone?.toString().trim();
    paymentMethod = body.paymentMethod?.toString().trim()!;
    add = body.additionalFields;
    if (body.code) code = body.code?.toString().trim();
  } catch (error) {
    return Response.json(
      { message: "Please fill out all required fields." },
      { status: 400 }
    );
  }

  if (add != undefined && add[paymentMethod.toLowerCase()] != undefined)
    paymentMethod += "@" + add[paymentMethod.toLowerCase()].trim();

  try {
    return await submitOneTicket(email!, name!, phone!, paymentMethod, code);
  } catch (error) {
    return Response.json({ message: "Error occurred." }, { status: 400 });
  }
}

async function submitOneTicket(
  email: string,
  name: string,
  phone: string,
  paymentMethod: string | undefined,
  code: string | undefined = undefined
) {
  email = handleMisspelling(email);
  if (!verifyEmail(email)) {
    return Response.json(
      {
        message: "Please enter a valid email address.",
      },
      { status: 400 }
    );
  }

  if (
    email === undefined ||
    name === undefined ||
    phone === undefined ||
    paymentMethod === undefined
  ) {
    return Response.json(
      { message: "Please fill out all required fields." },
      { status: 400 }
    );
  }

  paymentMethod = await verifyPaymentMethod(paymentMethod);
  if (paymentMethod === undefined || paymentMethod.split("@").length > 2) {
    return Response.json(
      { message: "Please enter a valid payment method." },
      { status: 400 }
    );
  }

  if (phone[0] == "+") {
    phone = phone.slice(1);
  }
  if (phone.length === 11) {
    phone = "2" + phone;
  } else if (phone.length === 13) {
    phone = phone.slice(1);
  }

  if (!checkPhone(phone)) {
    return Response.json({ message: "Invalid Phone Number." }, { status: 400 });
  }

  if (!checkSafety(name)) {
    return Response.json({ message: "Invalid Name." }, { status: 400 });
  }

  let id;
  try {
    let res = await sql.query(
      `INSERT INTO attendees (email, full_name, payment_method, phone, type) VALUES ($1::text, $2::text, $3::text, $4::text, $5::text) RETURNING *;`,
      [
        email,
        name,
        paymentMethod,
        phone,
        code ? TicketType.DISCOUNTED : TicketType.INDIVIDUAL,
      ]
    );
    id = res.rows[0].id;
  } catch (error) {
    return Response.json(
      {
        message: "Error occurred. Please try again or contact us for help.",
      },
      { status: 400 }
    );
  }

  if (code) {
    let result =
      await sql`UPDATE rush_hour SET code = NULL, attendee_id = ${id} WHERE code = ${code} RETURNING processed;`;
    if (result.rows[0].processed === true) {
      let uuid = await safeRandUUID();
      await sql`UPDATE attendees SET paid = TRUE, uuid = ${uuid} WHERE id = ${id} AND paid = FALSE RETURNING *`;
      await sendEmail(email, name, uuid, id);
    }

    return Response.json(
      {
        message: result.rows[0].processed
          ? `The ticket was sent to your email! Congratulations for your Rush Hour Ticket!`
          : `Our team is reviewing rush hour payments at this moment. Your ticket will be sent to your email once the payment is confirmed.`,
        success: true,
      },
      { status: 200 }
    );
  }

  try {
    // send payment details and next steps.
    if (paymentMethod == "CASH") {
      await sendBookingConfirmation(
      paymentMethod,
      name,
      email,
      id,
      TicketType.INDIVIDUAL
      );
    }
    
  } catch (error) {
    // failed to send confirmation.. delete email so person can try again.
    await sql`DELETE FROM attendees WHERE id = ${id}`;
    await sql`SELECT setval('attendees_id_seq', (SELECT MAX(id) FROM attendees));`;
    console.error(
      "[CRITICAL ERROR] Sending email failed. Deleting attendee record."
    );
    console.error(error);
    return Response.json(
      {
        message:
          "Error Occurred. Please try again or contact us for help: SMTP_ERR_001.",
      },
      { status: 400 }
    );
  }
  return Response.json(
    {
      message: `Ticket Booked Successfully! Please check your email to continue.${
        paymentMethod === "CASH"
          ? ` Your Attendee ID is ${id}. Use it to pay at the school office.`
          : ""
      }`,
      success: true,
    },
    { status: 200 }
  );
}

export async function GET() {
  // Return number of tickets and number of paid tickets
  let query = await sql`SELECT COUNT(*) FROM attendees;`;
  let query2 = await sql`SELECT COUNT(*) FROM attendees WHERE paid = true;`;
  let query3 =
    await sql`SELECT COUNT(*) FROM attendees WHERE paid = true AND type IN ('individual', 'group', 'teacher', 'discounted');`;
  return Response.json(
    {
      total: query.rows[0].count,
      paid: query2.rows[0].count,
      actual: query3.rows[0].count,
    },
    { status: 200 }
  );
}
