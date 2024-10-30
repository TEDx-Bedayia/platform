import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

// Handler for GET requests
export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ uuid: string }>;
  }
) {
  // Check if the request is coming from official app.
  if (request.headers.get("key") !== process.env.APP_KEY) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }
  const uuid = (await params).uuid; // Extract the 'uuid' parameter

  // Check Against Database
  let query = await sql`SELECT * FROM attendees WHERE uuid = ${uuid}`;

  if (query.rowCount === 0) {
    return NextResponse.json({ error: "Applicant not found" }, { status: 400 });
  }
}
