import { IPN, PHONE, TELDA, TICKET_WINDOW, YEAR } from "@/app/metadata";
import { sql } from "@vercel/postgres";
import { promises } from "fs";
import { type NextRequest } from "next/server";
import nodemailer from "nodemailer";
import path from "path";
import { price } from "../price/prices";
import {
  checkSafety,
  handleMisspelling,
  verifyEmail,
  verifyPaymentMethod,
} from "../utils";

// email1, name1, email2, name2, email3, name3, email4, name4,
// phone, paymentMethod
export async function POST(request: NextRequest) {
  if (new Date() < TICKET_WINDOW[0] || new Date() > TICKET_WINDOW[1]) {
    if (process.env.ADMIN_KEY !== "dev")
      return Response.json(
        { message: "Ticket sales are currently closed." },
        { status: 400 }
      );
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return Response.json(
      { message: "Please provide a valid JSON body.", error: error },
      { status: 400 }
    );
  }

  let paymentMethod, phone;
  let email1, name1;
  let email2, name2;
  let email3, name3;
  let email4, name4;

  try {
    name1 = body.name1?.toString().trim();
    email1 = body.email1?.toString().trim().toLowerCase();
    name2 = body.name2?.toString().trim();
    email2 = body.email2?.toString().trim().toLowerCase();
    name3 = body.name3?.toString().trim();
    email3 = body.email3?.toString().trim().toLowerCase();
    name4 = body.name4?.toString().trim();
    email4 = body.email4?.toString().trim().toLowerCase();

    phone = body.phone?.toString().trim();
    paymentMethod = body.paymentMethod?.toString().trim();
    let add = body.additionalFields;
    if (add != undefined && add[paymentMethod.toLowerCase()] != undefined)
      paymentMethod += "@" + add[paymentMethod.toLowerCase()].trim();
  } catch (error) {
    return Response.json(
      { message: "Please fill out all required fields." },
      { status: 400 }
    );
  }

  if (phone === undefined || paymentMethod === undefined) {
    return Response.json(
      { message: "Please fill out all required fields." },
      { status: 400 }
    );
  }

  let emails = [email1, email2, email3, email4];
  emails = emails.map((email) => handleMisspelling(email));

  try {
    let names = [name1, name2, name3, name4];
    let resp = await submitTickets(emails, names, phone, paymentMethod);
    if (resp.status != 200) {
      return resp;
    }

    try {
      await sql`INSERT INTO groups (email1, email2, email3, email4) VALUES (${emails[0]}, ${emails[1]}, ${emails[2]}, ${emails[3]});`;
    } catch (error) {
      await sql`DELETE FROM attendees WHERE email = ${emails[0]} OR email = ${emails[1]} OR email = ${emails[2]} OR email = ${emails[3]};`;
      return Response.json(
        { message: "Error submitting group." },
        { status: 500 }
      );
    }

    try {
      await sendBookingConfirmation(emails[0], name1, paymentMethod);
      // sendBookingConfirmation(email2, name2, paymentMethod);
      // sendBookingConfirmation(email3, name3, paymentMethod);
      // sendBookingConfirmation(email4, name4, paymentMethod);
    } catch (e) {
      console.error("[CRITICAL ERROR] LESS SECURE APP NOT TURNED ON FOR GMAIL");
      return Response.json(
        {
          message:
            "Error Occurred. Please try again or contact us for help: SMTP_ERR_001.",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.log(error);
    await sql`DELETE FROM attendees WHERE email = ${emails[0]} OR email = ${emails[1]} OR email = ${emails[2]} OR email = ${emails[3]};`;
    return Response.json(
      { message: "Error submitting group." },
      { status: 500 }
    );
  }

  return Response.json({
    success: true,
    message:
      "Tickets Submitted Successfully! Check your email for payment details to continue.",
  });
}

async function sendBookingConfirmation(
  email: string,
  name: string,
  paymentMethod: string
) {
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
    paymentDetails = `Please proceed with your InstaPay Transfer to the following account: <strong>${IPN}</strong>. Please send us a screenshot of your payment along with your email address, <strong>${email}</strong>, on our WhatsApp at <strong>${PHONE}</strong> or as a reply to this message if you don't have WhatsApp.`;
  }

  let pricingDesc = `The price for your entire group ticket (4 people) is: <strong>${price.markup(
    price.group * 4,
    paymentMethod.split("@")[0].toLowerCase()
  )} EGP</strong>. Make sure you as the group leader pay the exact due amount at once to avoid delays. You can't pay for each ticket separately. P.S. Only you have to go through the steps outlined above for payment.`;

  // Replace placeholders in the HTML
  const personalizedHtml = htmlContent
    .replace("${name}", name)
    .replace("${vfcash}", paymentDetails)
    .replace("{pricingDesc}", pricingDesc)
    .replace("{PHONE}", PHONE)
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
}

async function submitTickets(
  emails: any,
  names: any,
  phone: string | undefined,
  paymentMethod: string | undefined
) {
  if (!names || !emails || !phone || !paymentMethod || emails.length != 4) {
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

  for (let i = 0; i < emails.length; i++) {
    if (emails[i] === undefined || names[i] === undefined) {
      return Response.json(
        { message: "Please fill out all required fields." },
        { status: 400 }
      );
    }
    if (!verifyEmail(emails[i])) {
      return Response.json(
        {
          message: "Please enter a valid email address for " + names[i] + ".",
        },
        { status: 400 }
      );
    }

    if (!checkSafety(names[i])) {
      return Response.json(
        { message: "Invalid Name: " + names[i] + "." },
        { status: 400 }
      );
    }
  }

  if (phone[0] == "+") {
    phone = phone.slice(1);
  }

  if (phone.length === 11) {
    phone = "2" + phone;
  } else if (phone.length === 13) {
    phone = phone.slice(1);
  }

  if (!checkSafety(phone)) {
    return Response.json({ message: "Invalid Phone Number." }, { status: 400 });
  }

  let query =
    await sql`SELECT * FROM attendees WHERE email = ${emails[0]} OR email = ${emails[1]} OR email = ${emails[2]} OR email = ${emails[3]};`;

  let errTxt = "";
  if (query.rows.length > 0) {
    if (query.rows.length == 1) {
      errTxt = "There's a registered attendee with ";
    } else {
      errTxt = "There are attendees with ";
    }
  }
  for (let i = 0; i < query.rows.length; i++) {
    let email = query.rows[i].email;

    errTxt += `${names[emails.indexOf(email)]}'s email`;
    if (i != query.rows.length - 1) {
      errTxt += ", ";
    }
  }
  if (errTxt != "") {
    return Response.json(
      {
        message: errTxt + ". Contact us if you believe this is a mistake.",
      },
      { status: 400 }
    );
  }

  let q = "";
  for (let i = 0; i < emails.length; i++) {
    q += `('${emails[i]}', '${names[i]}', '${paymentMethod}', '${phone}', 'group')`;
    if (i != emails.length - 1) {
      q += ", ";
    }
  }

  try {
    await sql.query(
      `INSERT INTO attendees (email, full_name, payment_method, phone, type) VALUES ${q};`
    );

    return Response.json({ success: true });
  } catch (err: any) {
    // console.log(err);
    return Response.json({ success: false }, { status: 500 });
  }
}
