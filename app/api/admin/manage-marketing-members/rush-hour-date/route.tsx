import { SQLSettings } from "@/app/api/utils/sql-settings";
import { sql } from "@vercel/postgres";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  if (
    process.env.ADMIN_KEY === undefined ||
    !process.env.ADMIN_KEY ||
    !process.env.MARKETING_KEY ||
    process.env.MARKETING_KEY === undefined
  ) {
    return Response.json(
      { message: "Key is not set. Contact the maintainer." },
      { status: 500 }
    );
  }

  if (
    request.headers.get("key") !== process.env.ADMIN_KEY &&
    request.headers.get("key") !== process.env.MARKETING_KEY
  ) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const result =
      await sql`SELECT value FROM settings WHERE key = ${SQLSettings.RUSH_HOUR_DATE};`;
    if (result.rows.length === 0) {
      return Response.json({ rushHourDate: null }, { status: 200 });
    }
    const rushHourDate = result.rows[0].value;
    return Response.json(
      { date: new Date(rushHourDate).toISOString() },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching rush hour date:", error);
    return Response.json(
      { message: "Error fetching rush hour date." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (
    process.env.ADMIN_KEY === undefined ||
    !process.env.ADMIN_KEY ||
    !process.env.MARKETING_KEY ||
    process.env.MARKETING_KEY === undefined
  ) {
    return Response.json(
      { message: "Key is not set. Contact the maintainer." },
      { status: 500 }
    );
  }

  if (
    request.headers.get("key") !== process.env.ADMIN_KEY &&
    request.headers.get("key") !== process.env.MARKETING_KEY
  ) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch (error) {
    return Response.json(
      { message: "Please provide a valid JSON body." },
      { status: 400 }
    );
  }

  if (!body.date) {
    return Response.json(
      { message: "Please provide a valid date." },
      { status: 400 }
    );
  }

  const date = new Date(body.date);

  try {
    await sql`UPDATE settings SET value = ${date.toISOString()} WHERE key = ${
      SQLSettings.RUSH_HOUR_DATE
    };`;
  } catch (error) {
    console.error("Error updating rush hour date:", error);
    return Response.json(
      { message: "Error updating rush hour date." },
      { status: 500 }
    );
  }

  return Response.json(
    { message: "Rush hour date updated successfully.", date },
    { status: 200 }
  );
}
