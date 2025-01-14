import { EVENT_DESC, HOST, PHONE, YEAR } from "@/app/metadata";
import { sql } from "@vercel/postgres";
import { promises } from "fs";
import nodemailer from "nodemailer";
import path from "path";

export async function sendEmail(email: string, name: string, uuid: string) {
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
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    await transporter.sendMail({
      from: `"TEDxBedayia'${YEAR} eTicket System" <tedxyouth@bedayia.com>`,
      to: email,
      attachDataUrls: true,
      subject: `${
        name.split(" ")[0]
      }, your TEDxBedayia'${YEAR} eTicket has Arrived!`,
      html: personalizedHtml,
    });

    let qq = await sql.query(
      "UPDATE attendees SET sent = true WHERE email = '" +
        email +
        "' RETURNING *"
    );

    if (qq.rowCount === 0) {
      console.error("SQL ERROR; sent = false but it's sent.");
      return false;
    }

    return true;
  } catch (e) {
    console.error("LESS SECURE APP NOT TURNED ON FOR GMAIL OR SQL ERROR");
    return false;
  }
}
