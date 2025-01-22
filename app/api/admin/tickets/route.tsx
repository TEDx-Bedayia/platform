import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

export async function GET(request: NextRequest) {
  // Check Admin Perms
  if (
    request.headers.get("key") !== process.env.ADMIN_KEY ||
    !process.env.ADMIN_KEY
  ) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { rows } =
    await sql`SELECT email FROM attendees WHERE paid = false AND type NOT 'speaker';`;
  let emails = "";
  rows.forEach((row) => {
    emails += row.email + ", ";
  });

  return NextResponse.json({ emails }, { status: 200 });
}
