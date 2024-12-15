import { IPN, PHONE, TELDA, TICKET_WINDOW, YEAR } from "@/app/metadata";
import { sql } from "@vercel/postgres";
import { promises } from "fs";
import { type NextRequest } from "next/server";
import nodemailer from "nodemailer";
import path from "path";
import { price } from "./price/prices";
import {
  checkPhone,
  checkSafety,
  generateRandomString,
  verifyEmail,
  verifyPaymentMethod,
} from "./utils";

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

  //TODO EXTRA CHECKS IF NEEDED

  try {
    await sql.query(
      `INSERT INTO attendees (email, full_name, payment_method, phone, type) VALUES ($1::text, $2::text, $3::text, $4::text, $5::text);`,
      [email, name, paymentMethod, phone, "individual"]
    );

    const filePath = path.join(process.cwd(), "public/booked.html"); // path to booked.html
    const htmlContent = await promises.readFile(filePath, "utf8");

    let paymentDetails = "";
    if (paymentMethod.split("@")[0] === "VFCASH") {
      paymentDetails = `Please proceed with your Mobile Wallet payment to <strong>${PHONE}</strong>. After your payment, send us a WhatsApp or SMS message from the phone you will pay with, <strong>${
        paymentMethod.split("@")[1]
      }</strong>, stating your email address: <strong>${email}</strong> to confirm your payment.`;
    } else if (paymentMethod.split("@")[0] === "CASH") {
      paymentDetails = `Please proceed with your cash payment to Bedayia's Office. Make sure you tell them the email address that has received this message to avoid confusion: <strong>${email}</strong>.`;
    } else if (paymentMethod.split("@")[0] === "TLDA") {
      paymentDetails = `Please proceed with your Telda transfer to the following account: <strong>${TELDA}</strong>. Make sure to include a comment with your email address: <strong>${email}</strong>.`;
    } else if (paymentMethod.split("@")[0] === "IPN") {
      paymentDetails = `Please proceed with your InstaPay Transfer to the following account: <strong>${IPN}</strong>. Make sure to include a comment with your email address if possible: <strong>${email}</strong>.`;
    }

    paymentDetails += ` The price for your ticket is: <strong>${price.individual} EGP</strong>. Make sure to pay the exact due amount at once to avoid delays or confusion.`;

    // Replace placeholders in the HTML
    const personalizedHtml = htmlContent
      .replace("${name}", name)
      .replace("${vfcash}", paymentDetails)
      .replaceAll("${year}", YEAR.toString());

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"TEDxBedayia'${YEAR} eTicket System" <tedxyouth@bedayia.com>`,
      to: email,
      subject: "Regarding your eTicket.",
      html: personalizedHtml,
    });

    return Response.json(
      {
        message: `Ticket Booked! Please check your email for confirmation.`,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
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
}
