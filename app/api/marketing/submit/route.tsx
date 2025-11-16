import { sql } from "@vercel/postgres";
import { NextRequest } from "next/server";
import { TicketType } from "../../../ticket-types";
import { price } from "../../tickets/price/prices";
import { verifyEmail } from "../../utils/input-sanitization";
import { SQLSettings } from "../../utils/sql-settings";

export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch (error) {
    return Response.json(
      { message: "Please provide a valid JSON body." },
      { status: 400 }
    );
  }

  if (
    request.headers.get("password") !== process.env.MARKETING_MEMBER_PASSWORD
  ) {
    return Response.json(
      { message: "Invalid marketing member credentials." },
      { status: 401 }
    );
  }

  const { name, grade, email, type, ticketCount, paid } = body;

  if (!name || !grade || !email || !type || !ticketCount || !paid) {
    return Response.json(
      { message: "Please fill out all required fields." },
      { status: 400 }
    );
  }

  const note = `${name},${grade}`;

  if (email && !verifyEmail(email)) {
    return Response.json(
      { message: "Please provide a valid email address." },
      { status: 400 }
    );
  }

  if (type !== "discounted" && type !== "individual") {
    return Response.json({ message: "Invalid ticket type." }, { status: 400 });
  }

  if (ticketCount * price.getPrice(type, "CASH") !== paid) {
    return Response.json(
      {
        message:
          "Paid amount does not match ticket(s) price. Total price is " +
          ticketCount * price.getPrice(type, "CASH") +
          " EGP.",
      },
      { status: 400 }
    );
  }

  try {
    const client = await sql.connect();

    let { rows } =
      await client.sql`SELECT id FROM marketing_members WHERE username = ${request.headers.get(
        "username"
      )};`;
    const memberID = rows[0]?.id;
    if (!memberID) {
      client.release();
      return Response.json(
        { message: "Invalid marketing member credentials." },
        { status: 401 }
      );
    }

    let { rows: settingsRows } =
      await client.sql`SELECT value FROM settings WHERE key = ${SQLSettings.RUSH_HOUR_DATE};`;
    const rushHourDate = settingsRows[0]?.value;
    if (!rushHourDate) {
      client.release();
      return Response.json(
        { message: "Rush hour date is not set." },
        { status: 500 }
      );
    }

    const currentDate = new Date();
    // Compare after stripping away time information whether the dates are equal or not
    if (
      type === TicketType.DISCOUNTED &&
      new Date(rushHourDate).setHours(0, 0, 0, 0) !==
        currentDate.setHours(0, 0, 0, 0)
    ) {
      client.release();
      return Response.json(
        { message: "Rush hour is not today." },
        { status: 400 }
      );
    }

    for (let i = 0; i < ticketCount; i++) {
      const result =
        await client.sql`INSERT INTO attendees (full_name, email, payment_method, type, phone)
      VALUES (${name}, ${email.toLowerCase()}, 'CASH', ${type}, '201000000000')
      RETURNING id;`;
      if (result.rows.length === 0) {
        client.release();
        return Response.json(
          { message: "Failed to submit ticket." },
          { status: 500 }
        );
      }
      const attendeeID = result.rows[0].id;
      await client.sql`INSERT INTO rush_hour (marketing_member_id, attendee_id, note)
      VALUES (${memberID}, ${attendeeID}, ${note})
      RETURNING id;`;
    }

    client.release();
  } catch (error) {
    console.error("Error processing marketing ticket submission:", error);
    return Response.json({ message: "Error occurred." }, { status: 400 });
  }
  return Response.json(
    {
      message:
        "Accepted! If there are any errors (e.g. wrong email submitted), please contact your head and keep the cash money.",
      data: { name, grade, email, type, ticketCount },
    },
    { status: 200 }
  );
}
