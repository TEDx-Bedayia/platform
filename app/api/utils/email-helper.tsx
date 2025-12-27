import { promises } from "fs";
import nodemailer from "nodemailer";
import path from "path";
import { EARLY_BIRD_UNTIL, EVENT_DATE, PHONE, YEAR } from "../../metadata";
import { isGroup, TicketType } from "../../ticket-types";
import { price } from "../tickets/prices";

export async function sendBookingConfirmation(
  paymentMethod: string,
  name: string,
  email: string,
  ID: string,
  ticketType: TicketType,
  paymentUrl: string | undefined = undefined
) {
  const filePath = path.join(process.cwd(), "public/booked.html"); // path to booked.html
  const htmlContent = await promises.readFile(filePath, "utf8");

  let paymentDetails = "";
  if (paymentMethod.split("@")[0] === "CASH") {
    paymentDetails = `Please proceed with your cash payment to Bedayia's Office. Make sure you tell them your Attendee ID: <strong>${ID}</strong>.`;
  }

  let pricingDesc = isGroup(ticketType)
    ? `The price for your entire group ticket (4 people) is: <strong>${
        price.getPrice(
          ticketType,
          new Date(),
          paymentMethod.split("@")[0].toLowerCase()
        ) * 4
      } EGP</strong>. Make sure you as the group leader pay the exact due amount at once to avoid delays. You can't pay for each ticket separately.`
    : `The price for your ticket is: <strong>${price.getPrice(
        ticketType,
        new Date(),
        paymentMethod.split("@")[0].toLowerCase()
      )} EGP</strong>. Make sure to pay the exact due amount at once to avoid delays or confusion.`;

  if (EARLY_BIRD_UNTIL && new Date() < EARLY_BIRD_UNTIL) {
    pricingDesc += `<br/><br/>Note: You are eligible for the Early Bird discount if you pay before ${EARLY_BIRD_UNTIL.toLocaleDateString()}! Thank you for booking early.`;
  }

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
