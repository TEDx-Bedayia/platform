import { sql } from "@vercel/postgres";
import { type NextRequest } from "next/server";
import { pay } from "../admin/payment-reciever/main";
import {
  checkSafety,
  generateRandomString,
  verifyEmail,
  verifyPaymentMethod,
} from "./utils";

// email, name, phone, paymentMethod
export async function POST(request: NextRequest) {
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
    email = body.email?.toString().trim();
    phone = body.phone?.toString().trim();
    paymentMethod = body.paymentMethod?.toString().trim()!;
    add = body.additionalFields;
  } catch (error) {
    return Response.json(
      { message: "Please fill out all required fields." },
      { status: 400 }
    );
  }

  if (add != undefined)
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
  if (paymentMethod === undefined) {
    return Response.json(
      { message: "Please enter a valid payment method." },
      { status: 400 }
    );
  }

  if (!checkSafety(phone)) {
    return Response.json({ message: "Invalid Phone Number." }, { status: 400 });
  }

  if (!checkSafety(name)) {
    return Response.json({ message: "Invalid Name." });
  }

  let query = await sql`SELECT * FROM attendees WHERE email = ${email};`;
  const email1 = email.split("@")[0].split("+")[0];
  const email2 = email.split("@")[1];
  let add = "ot";
  if (email.split("+").length > 1) {
    add = add + generateRandomString(3);
  }
  if (query.rows.length > 0) {
    return Response.json(
      {
        message: `An attendee with this email already exists. If you'd still like to book a ticket with the same email, please set the email to: ${email1}+${add}@${email2}.`,
      },
      { status: 400 }
    );
  }

  //TODO EXTRA CHECKS IF NEEDED

  try {
    await sql.query(
      `INSERT INTO attendees (email, full_name, payment_method, phone, type) VALUES ($1::text, $2::text, $3::text, $4::text, $5::text);`,
      [email, name, paymentMethod, phone, "individual"]
    );

    return Response.json(
      { message: "Ticket submitted.", success: true },
      { status: 200 }
    );
  } catch (error) {
    return Response.json({ message: "Error occurred." }, { status: 400 });
  }
}
