import { EVENT_DATE } from "@/app/metadata";
import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  if (req.headers.get("key") !== process.env.ADMIN_KEY) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (
    req.nextUrl.searchParams.get("verification") !== process.env.DESTRUCTIVE_KEY
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (new Date() <= EVENT_DATE && process.env.ADMIN_KEY !== "dev") {
    return NextResponse.json(
      { message: "Event has not concluded yet." },
      { status: 400 }
    );
  }

  try {
    await sql`DELETE FROM attendees`;
    await sql`DELETE FROM pay_backup`;
    await sql`DELETE FROM groups`;
    await sql`ALTER SEQUENCE attendees_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE groups_id_seq RESTART WITH 1`;
    return NextResponse.json({ message: "Data deleted." }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error occurred." }, { status: 400 });
  }
}
