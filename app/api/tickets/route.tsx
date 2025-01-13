import { TICKET_WINDOW } from "@/app/metadata";
import { sql } from "@vercel/postgres";
import { type NextRequest } from "next/server";
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
      { message: "Please provide a valid JSON body.", error: error },
      { status: 400 }
    );
  }

  let paymentMethod: string, name, email, phone, add;
  try {
    name = body.name?.toString().trim();
    email = body.email?.toString().trim().toLowerCase();
    phone = body.phone?.toString().trim();
    paymentMethod = body.paymentMethod?.toString().trim()!;
    add = body.additionalFields;
  } catch (error) {
    return Response.json(
      { message: "Please fill out all required fields." },
      { status: 400 }
    );
  }

  if (add != undefined && add[paymentMethod.toLowerCase()] != undefined)
    paymentMethod += "@" + add[paymentMethod.toLowerCase()].trim();

  try {
    return await submitOneTicket(email!, name!, phone!, paymentMethod);
  } catch (error) {
    return Response.json({ message: "Error occurred." }, { status: 400 });
  }
}

async function submitOneTicket(
  email: string,
  name: string,
  phone: string,
  paymentMethod: string | undefined
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

  let query = await sql`SELECT * FROM attendees WHERE email = ${email};`;
  const email1 = email.split("@")[0].split("+")[0];
  const email2 = email.split("@")[1];
  let add = "a";
  if (email.split("+").length > 1) {
    add = add + generateRandomString(3);
  }
  if (query.rows.length > 0) {
    return Response.json(
      {
        message: `An attendee with this email already exists. If you'd still like to book a ticket with the same email, please set the email to: ${email1}+${add}@${email2}. You will recieve your ticket on ${email1}@${email2} normally.`,
      },
      { status: 400 }
    );
  }

  let id;
  try {
    let res = await sql.query(
      `INSERT INTO attendees (email, full_name, payment_method, phone, type) VALUES ($1::text, $2::text, $3::text, $4::text, $5::text) RETURNING *;`,
      [email, name, paymentMethod, phone, TicketType.INDIVIDUAL]
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

  try {
    // send payment details and next steps.
    await sendBookingConfirmation(
      paymentMethod,
      name,
      email,
      id,
      TicketType.INDIVIDUAL
    );
  } catch (error) {
    // failed to send confirmation.. delete email so person can try again.
    await sql`DELETE FROM attendees WHERE email = ${email}`;
    console.error("[CRITICAL ERROR] LESS SECURE APP NOT TURNED ON FOR GMAIL");
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
      message: `Ticket Booked! Check your email to continue.`,
      success: true,
    },
    { status: 200 }
  );
}

export async function GET() {
  // Return number of tickets and number of paid tickets
  let query = await sql`SELECT COUNT(*) FROM attendees;`;
  let query2 = await sql`SELECT COUNT(*) FROM attendees WHERE paid = true;`;
  return Response.json(
    {
      total: query.rows[0].count,
      paid: query2.rows[0].count,
    },
    { status: 200 }
  );
}
