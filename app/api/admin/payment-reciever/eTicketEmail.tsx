import { EVENT_DESC, HOST, PHONE, YEAR } from "@/app/metadata";
import { sql } from "@vercel/postgres";
import { promises } from "fs";
import nodemailer from "nodemailer";
import path from "path";
import QRCode from "qrcode";
import { Resend } from "resend";
import { TicketEmail } from "../../../components/TicketEmail";
const resend = new Resend(process.env.RESEND_API_KEY!);

// Set the 'sent' status of the attendee to true in the database
// If no id is provided, simply return true
async function setSentStatus(id?: string) {
  if (!id) return true;

  const query =
    await sql`UPDATE attendees SET sent = true WHERE id = ${id} RETURNING *`;

  if (query.rowCount === 0) {
    console.error("SQL ERROR; sent = false but it's sent.");
    return false;
  }

  return true;
}

export async function sendEmail(
  email: string,
  name: string,
  uuid: string,
  id?: string
) {
  try {
    const qrBuffer = await QRCode.toBuffer(uuid, {
      errorCorrectionLevel: "H", // High error correction
      margin: 2,
      width: 300,
    });

    const res = await resend.emails.send({
      from: '"TEDxBedayia eTickets" <tickets@tedxbedayia.com>',
      to: email,
      subject: "Your TEDxBedayia ticket is here!",
      react: await TicketEmail({ name, uuid }),
      attachments: [
        {
          contentType: "image/png",
          filename: "ticket-qr.png",
          contentId: "ticket-qr",
          content: qrBuffer,
        },
      ],
    });

    if (!res.error) return setSentStatus(id);
    else console.error("Resend Error: ", res.error);
  } catch (e) {
    console.error("Resend Failed, trying Gmail: ", e);
  }

  const filePath = path.join(process.cwd(), "public/eTicket-template.html");
  const htmlContent = await promises.readFile(filePath, "utf8");

  // Replace placeholders in the HTML
  const personalizedHtml = htmlContent
    .replaceAll("${name}", name)
    .replaceAll("${qrCodeURL}", `${HOST}/api/qr?uuid=${uuid}`)
    .replaceAll("${uuid}", uuid)
    .replaceAll("{EVENT_DESC}", EVENT_DESC)
    .replaceAll("{PHONE}", PHONE)
    .replaceAll("${year}", YEAR.toString());

  try {
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
      from: `"TEDxBedayia eTickets" <tedxyouth@bedayia.com>`,
      to: email,
      attachDataUrls: true,
      subject: `${
        name.split(" ")[0]
      }, your TEDxBedayia'${YEAR} eTicket has Arrived!`,
      html: personalizedHtml,
    });

    return setSentStatus(id);
  } catch (e) {
    console.error("GMAIL OR SQL ERROR: ", e);
    return false;
  }
}
