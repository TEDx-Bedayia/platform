import { SQLSettings } from "@/app/api/utils/sql-settings";
import { EVENT_DATE } from "@/app/metadata";
import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  if (process.env.ADMIN_KEY === undefined || !process.env.ADMIN_KEY) {
    return Response.json(
      { message: "Key is not set. Contact the maintainer." },
      { status: 500 }
    );
  }

  if (
    req.headers.get("key") !== process.env.ADMIN_KEY ||
    !process.env.ADMIN_KEY ||
    !process.env.DESTRUCTIVE_KEY ||
    req.nextUrl.searchParams.get("verification") === null
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (
    req.nextUrl.searchParams.get("verification")! !==
    process.env.DESTRUCTIVE_KEY
  ) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  if (new Date() <= EVENT_DATE && process.env.ADMIN_KEY !== "dev") {
    return NextResponse.json(
      { message: "Event has not concluded yet." },
      { status: 400 }
    );
  }

  try {
    const client = await sql.connect();
    await client.sql`DELETE FROM groups`;
    await client.sql`DELETE FROM rush_hour`;
    await client.sql`DELETE FROM marketing_members`;
    await client.sql`DELETE FROM attendees`;
    await client.sql`DELETE FROM pay_backup`;
    await client.sql`ALTER SEQUENCE attendees_id_seq RESTART WITH 140`;
    await client.sql`ALTER SEQUENCE groups_grpid_seq RESTART WITH 1`;
    await client.sql`ALTER SEQUENCE marketing_members_id_seq RESTART WITH 1`;
    await client.sql`ALTER SEQUENCE rush_hour_id_seq RESTART WITH 1`;

    await client.sql`UPDATE settings SET value = NULL WHERE key = ${SQLSettings.RUSH_HOUR_DATE}`;
    client.release();
    return NextResponse.json({ message: "Data deleted." }, { status: 200 });
  } catch (error) {
    console.error("Error deleting data:", error);
    return NextResponse.json({ message: "Error occurred." }, { status: 400 });
  }
}
