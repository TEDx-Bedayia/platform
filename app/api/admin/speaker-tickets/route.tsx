import {
  EVENT_DESC,
  HOST,
  PHONE,
  SPEAKER_FREE_TICKETS,
  YEAR,
} from "@/app/metadata";
import { sql } from "@vercel/postgres";
import { UUID } from "crypto";
import { promises } from "fs";
import { type NextRequest } from "next/server";
import nodemailer from "nodemailer";
import path from "path";
import { TicketType } from "../../utils/ticket-types";
import { safeRandUUID } from "../payment-reciever/main";

export async function GET(request: NextRequest) {
  let params = request.nextUrl.searchParams;

  if (
    request.headers.get("key") !== process.env.ADMIN_KEY ||
    !process.env.ADMIN_KEY
  ) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  let speakerEmail = params.get("speaker");
  if (speakerEmail === null) {
    return Response.json(
      { message: "Speaker's Email is required." },
      { status: 400 }
    );
  }

  let speakerName = params.get("name");
  if (speakerName === null) {
    return Response.json(
      { message: "Speaker's Name is required." },
      { status: 400 }
    );
  }

  try {
    // Create an entry with type speaker and rotating emails (invitation1, invitation2, etc.)
    let values: string[] = [];
    let uuids: UUID[] = [];
    for (let i = 0; i < SPEAKER_FREE_TICKETS; i++) {
      let rotatingEmail = `${speakerEmail.split("@")[0]}+invitation${i + 1}@${
        speakerEmail.split("@")[1]
      }`;

      let uuid = await safeRandUUID();
      uuids.push(uuid);

      values.push(
        `('${rotatingEmail}', '${speakerName.split(" ")[0]}''s Invitation ${
          i + 1
        }', 'CASH', '200000000000', '${
          TicketType.SPEAKER
        }', true, true, '${uuid}')`
      );
    }

    let q = await sql.query(
      `INSERT INTO attendees (email, full_name, payment_method, phone, type, paid, sent, uuid) VALUES ${values.join(
        ", "
      )} RETURNING *`
    );

    if (q.rowCount !== SPEAKER_FREE_TICKETS) {
      return Response.json(
        { message: "Error occurred while adding tickets." },
        { status: 400 }
      );
    }

    // Send email with all tickets to speaker's email
    for (let i = 0; i < SPEAKER_FREE_TICKETS; i++) {
      await sendSpeakerTicket(
        speakerEmail,
        uuids[i],
        `${speakerName}'s Invitation ${i + 1}`,
        speakerName
      );
    }

    return Response.json({ message: `Done.` }, { status: 200 });
  } catch (error) {
    return Response.json(
      { message: "Error occurred. " + error },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}

async function sendSpeakerTicket(
  speakerEmail: string,
  uuid: UUID,
  ticketName: string,
  speakerName: string
) {
  const filePath = path.join(process.cwd(), "public/speaker-eticket.html");
  const htmlContent = await promises.readFile(filePath, "utf8");

  // Replace placeholders in the HTML
  const personalizedHtml = htmlContent
    .replace("${name}", ticketName)
    .replace("${qrCodeURL}", `${HOST}/api/qr?uuid=${uuid}`)
    .replace("${uuid}", uuid)
    .replace("{EVENT_DESC}", EVENT_DESC)
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
      from: `"TEDxBedayia'${YEAR} eTicket System" <tedxyouth@bedayia.com>`,
      to: speakerEmail,
      attachDataUrls: true,
      subject: `${speakerName}, Your Free TEDxBedayia'${YEAR} eTickets have arrived!`,
      html: personalizedHtml,
    });

    return true;
  } catch (e) {
    console.error("LESS SECURE APP NOT TURNED ON FOR GMAIL OR SQL ERROR");
    return false;
  }
}
