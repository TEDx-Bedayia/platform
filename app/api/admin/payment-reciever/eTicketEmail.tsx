import { EVENT_DESC, HOST, PHONE, YEAR } from "@/app/metadata";
import { sql } from "@vercel/postgres";
import { promises } from "fs";
import nodemailer from "nodemailer";
import path from "path";
import QRCode from "qrcode";
import { Resend } from "resend";
import { TicketEmail } from "../../../components/TicketEmail";
import { EmailRecipient } from "../../utils/email-helper";
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

async function batchSetSentStatus(ids?: string[]) {
  if (!ids || ids.length === 0) return true;
  const numericIds = ids.map((id) => Number(id)).filter((id) => !isNaN(id));
  if (numericIds.length === 0) return true;

  const query = await sql.query(
    "UPDATE attendees SET sent = true WHERE id = ANY($1::int[]) RETURNING *",
    [numericIds]
  );

  if (query.rowCount !== numericIds.length) {
    console.error(
      `SQL ERROR; expected to update ${numericIds.length} attendees, but updated ${query.rowCount}.`
    );
    return false;
  }

  return true;
}

export async function sendBatchEmail(
  recipients: EmailRecipient[]
): Promise<boolean> {
  try {
    recipients = await Promise.all(
      recipients.map(async (recipient) => {
        const qrBuffer = await QRCode.toBuffer(recipient.uuid, {
          errorCorrectionLevel: "H",
          margin: 2,
          width: 300,
        });

        return {
          fullName: recipient.fullName,
          email: recipient.email,
          id: recipient.id,
          uuid: recipient.uuid,
          qrBuffer,
        };
      })
    );

    const res = await resend.batch.send(
      recipients.map((r) => ({
        from: '"TEDxBedayia eTickets" <tickets@tedxbedayia.com>',
        to: r.email,
        subject: "Your TEDxBedayia ticket is here!",
        react: <TicketEmail name={r.fullName} uuid={r.uuid} />,
        attachments: [
          {
            contentType: "image/png",
            filename: "ticket-qr.png",
            contentId: `ticket-qr-${r.uuid}`,
            content: r.qrBuffer,
          },
        ],
      }))
    );

    if (!res.error)
      return await batchSetSentStatus(recipients.map((r) => r.id));
    else console.error("Resend Error: ", res.error);
  } catch (e) {
    console.error("Resend Failed, trying Gmail: ", e);
  }

  // Fallback to Gmail if Resend fails
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

    const filePath = path.join(process.cwd(), "public/eTicket-template.html");
    const htmlContent = await promises.readFile(filePath, "utf8");

    let success = true;
    for (const recipient of recipients) {
      // Replace placeholders in the HTML
      const personalizedHtml = htmlContent
        .replaceAll("${name}", recipient.fullName)
        .replaceAll("${qrCodeURL}", `${HOST}/api/qr?uuid=${recipient.uuid}`)
        .replaceAll("${uuid}", recipient.uuid)
        .replaceAll("{EVENT_DESC}", EVENT_DESC)
        .replaceAll("{PHONE}", PHONE)
        .replaceAll("${year}", YEAR.toString());

      try {
        await transporter.sendMail({
          from: `"TEDxBedayia eTickets" <tedxyouth@bedayia.com>`,
          to: recipient.email,
          attachDataUrls: true,
          subject: `${
            recipient.fullName.split(" ")[0]
          }, your TEDxBedayia'${YEAR} eTicket has Arrived!`,
          html: personalizedHtml,
        });

        const status = await setSentStatus(recipient.id);
        if (!status) success = false;
      } catch (e) {
        console.error("GMAIL OR SQL ERROR: ", e);
        success = false;
      }
    }
    return success;
  } catch (e) {
    console.error("GMAIL FAILED: ", e);
    return false;
  }
}
