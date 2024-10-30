import { IPN, PHONE, TELDA, TICKET_WINDOW, YEAR } from "@/app/metadata";
import { sql } from "@vercel/postgres";
import { promises } from "fs";
import { type NextRequest } from "next/server";
import nodemailer from "nodemailer";
import path from "path";
import { price } from "../price/prices";
import {
  checkSafety,
  generateRandomString,
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

  try {
    let emails = [email1, email2, email3, email4];
    let names = [name1, name2, name3, name4];
    let resp = await submitTickets(emails, names, phone, paymentMethod);
    if (resp.status != 200) {
      return resp;
    }

    try {
      await sql`INSERT INTO groups (email1, email2, email3, email4) VALUES (${email1}, ${email2}, ${email3}, ${email4});`;
    } catch (error) {
      await sql`DELETE FROM attendees WHERE email = ${email1} OR email = ${email2} OR email = ${email3} OR email = ${email4};`;
      return Response.json(
        { message: "Error submitting group." },
        { status: 500 }
      );
    }

    try {
      await sendBookingConfirmation(email1, name1, paymentMethod);
      await sendBookingConfirmation(email2, name2, paymentMethod);
      await sendBookingConfirmation(email3, name3, paymentMethod);
      await sendBookingConfirmation(email4, name4, paymentMethod);
    } catch (e) {
      console.error("[CRITICAL ERROR] LESS SECURE APP NOT TURNED ON FOR GMAIL");
      return Response.json(
        { message: "Error Occurred. Please try again or contact us for help." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.log(error);
    await sql`DELETE FROM attendees WHERE email = ${email1} OR email = ${email2} OR email = ${email3} OR email = ${email4};`;
    return Response.json(
      { message: "Error submitting group." },
      { status: 500 }
    );
  }

  return Response.json({
    success: true,
    message:
      "Tickets Submitted Successfully! Please check your emails for confirmations and payment details.",
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
    paymentDetails = `Please proceed with your Mobile Wallet payment to ${PHONE}. The price for your entire group ticket (4 people) is: ${
      price.group * 4
    } EGP. Make sure to pay the exact due amount at once to avoid delays.`;
  } else if (paymentMethod.split("@")[0] === "CASH") {
    paymentDetails = `Please proceed with your cash payment to Bedayia's Office. Make sure you tell them the email address that has received this message to avoid confusion, <strong>${email}</strong>. The price for your entire group ticket (4 people) is: ${
      price.group * 4
    } EGP. Make sure to pay the exact due amount at once to avoid delays.`;
  } else if (paymentMethod.split("@")[0] === "TLDA") {
    paymentDetails = `Please proceed with your Telda transfer to the following account: ${TELDA}. The price for your entire group ticket (4 people) is: ${
      price.group * 4
    } EGP. Make sure to pay the exact due amount at once to avoid delays.`;
  } else if (paymentMethod.split("@")[0] === "IPN") {
    paymentDetails = `Please proceed with your Instapay Transfer to the following account: ${IPN}. The price for your entire group ticket (4 people) is: ${
      price.group * 4
    } EGP. Make sure to pay the exact due amount at once to avoid delays.`;
  }

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
  transporter.sendMail({
    from: `"TEDx'${YEAR} eTicket System" <tedxyouth@bedayia.com>`,
    to: email,
    subject: "Regarding your eTicket.",
    html: personalizedHtml,
  });
  return Response.json(
    {
      message: "Ticket Booked! Please check your email for confirmation.",
      success: true,
    },
    { status: 200 }
  );
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

  if (paymentMethod === undefined) {
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

  if (!checkSafety(phone)) {
    return Response.json({ message: "Invalid Phone Number." }, { status: 400 });
  }

  let query =
    await sql`SELECT * FROM attendees WHERE email = ${emails[0]} OR email = ${emails[1]} OR email = ${emails[2]} OR email = ${emails[3]};`;

  let errTxt = "";
  let errTxt2 = "";
  if (query.rows.length > 0) {
    if (query.rows.length == 1) {
      errTxt = "There's a registered attendee with ";
    } else {
      errTxt = "There are attendees with ";
    }
  }
  for (let i = 0; i < query.rows.length; i++) {
    let email = query.rows[i].email;
    const email1 = email.split("@")[0].split("+")[0];
    const email2 = email.split("@")[1];
    let add = "ot";
    if (email.split("+").length > 1) {
      add = add + generateRandomString(3);
    }

    errTxt += `${names[emails.indexOf(email)]}'s email`;

    errTxt2 += `${email1}+${add}@${email2}`;
    if (i != query.rows.length - 1) {
      errTxt += ", ";
      errTxt2 += ", ";
    }
  }
  if (errTxt != "") {
    return Response.json(
      {
        message:
          errTxt +
          ". Please change their email(s) to " +
          errTxt2 +
          " respectively if you wish to proceed.",
      },
      { status: 400 }
    );
  }

  //TODO EXTRA CHECKS IF NEEDED

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
