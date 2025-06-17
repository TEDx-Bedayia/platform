import { promises } from "fs";
import nodemailer from "nodemailer";
import path from "path";
import { EVENT_DATE, IPN, PHONE, TELDA, YEAR } from "../../metadata";
import { price } from "../tickets/price/prices";
import { TicketType } from "./ticket-types";

export async function sendBookingConfirmation(
  paymentMethod: string,
  name: string,
  email: string,
  ID: string,
  ticketType: TicketType
) {
  const filePath = path.join(process.cwd(), "public/booked.html"); // path to booked.html
  const htmlContent = await promises.readFile(filePath, "utf8");

  let paymentDetails = "";
  if (paymentMethod.split("@")[0] === "VFCASH") {
    paymentDetails = `Please proceed with your Mobile Wallet payment to <strong>${PHONE}</strong>. After your payment, send us a WhatsApp or SMS message from the phone you will pay with, <strong>${
      paymentMethod.split("@")[1]
    }</strong>, stating your email address: <strong>${email}</strong> to confirm your payment.`;
  } else if (paymentMethod.split("@")[0] === "CASH") {
    paymentDetails = `Please proceed with your cash payment to Bedayia's Office. Make sure you tell them your attendee ID: <strong>${ID}</strong>.`;
  } else if (paymentMethod.split("@")[0] === "TLDA") {
    paymentDetails = `Please proceed with your Telda transfer to the following account: <strong>${TELDA}</strong>. Make sure to include a comment with your email address: <strong>${email}</strong>. You're sending from @${
      paymentMethod.split("@")[1]
    }. If that's incorrect please reply to this message or contact us on WhatsApp as soon as possible.`;
  } else if (paymentMethod.split("@")[0] === "IPN") {
    paymentDetails = `Please proceed with your InstaPay Transfer to the following account: <strong>${IPN}</strong>. Then, please send us a screenshot of your payment with your username <strong>${
      paymentMethod.split("@")[1]
    }@instapay</strong> visible and send your email address, <strong>${email}</strong>, on our WhatsApp at <strong>${PHONE}</strong> or as a reply to this message if you don't have WhatsApp.`;
  }

  let pricingDesc =
    ticketType === TicketType.GROUP
      ? `The price for your entire group ticket (4 people) is: <strong>${
          price.getPrice(
            ticketType,
            paymentMethod.split("@")[0].toLowerCase()
          ) * 4
        } EGP</strong>. Make sure you as the group leader pay the exact due amount at once to avoid delays. You can't pay for each ticket separately.`
      : `The price for your ticket is: <strong>${price.getPrice(
          ticketType,
          paymentMethod.split("@")[0].toLowerCase()
        )} EGP</strong>. Make sure to pay the exact due amount at once to avoid delays or confusion.`;

  // Replace placeholders in the HTML
  const personalizedHtml = htmlContent
    .replaceAll("${name}", name)
    .replace("${vfcash}", paymentDetails)
    .replace("{pricingDesc}", pricingDesc)
    .replaceAll("{PHONE}", PHONE)
    .replaceAll(
      "{DATE}",
      `${EVENT_DATE.getUTCDate()}/${
        EVENT_DATE.getUTCMonth() + 1
      }/${EVENT_DATE.getUTCFullYear()}`
    )
    .replaceAll("${year}", YEAR.toString());

  // const transporter = nodemailer.createTransport({
  //   service: "gmail",
  //   secure: false,
  //   auth: {
  //     user: process.env.EMAIL,
  //     pass: process.env.EMAIL_PASSWORD,
  //   },
  // });

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    },
  });

  await transporter.sendMail({
    from: `"TEDxBedayia'${YEAR} eTicket System" <tedxyouth@bedayia.com>`,
    to: email,
    subject: "Regarding your eTicket.",
    html: personalizedHtml,
  });
}
