import { EVENT_DATE } from "@/app/metadata";
import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

// Handler for GET requests
export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ uuid: string }>;
  },
) {
  // Set CORS headers to allow access from Usher App
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*"); // Allow all origins
  headers.set("Access-Control-Allow-Methods", "GET"); // Allow specific methods
  headers.set("Access-Control-Allow-Headers", "Content-Type, key"); // Allow specific headers

  // Check if the request is coming from official app.
  if (
    request.nextUrl.searchParams.get("key") !== process.env.APP_KEY ||
    !process.env.APP_KEY
  ) {
    return Response.json(
      { message: "Unauthorized" },
      { status: 401, headers: headers },
    );
  }
  const uuid = (await params).uuid; // Extract the 'uuid' parameter
  const deviceUID = request.nextUrl.searchParams.get("device") || "unknown";

  const THRESHOLD = 36 * 60 * 60 * 1000;
  const currentDate = new Date();
  const eventDate = EVENT_DATE;

  // Calculate the absolute difference between the current date and the event date
  if (
    Math.abs(currentDate.getTime() - eventDate.getTime()) > THRESHOLD &&
    process.env.PAYMOB_TEST_MODE !== "true"
  ) {
    return NextResponse.json(
      { error: `Event not started yet. ${eventDate.toLocaleDateString()}` },
      { status: 400, headers: headers },
    );
  }

  // Validate UUID length (minimum 8 characters for partial matching)
  if (uuid.length < 8) {
    return NextResponse.json(
      { error: "UUID must be at least 8 characters." },
      { status: 400, headers: headers },
    );
  }

  // Check if this is a full UUID (36 chars with dashes) or partial
  const isFullUUID = uuid.length === 36;

  // Use postgres client with transaction and row-level locking
  const client = await sql.connect();

  try {
    // Start transaction
    await client.query("BEGIN");

    // Lock matching row(s) to prevent concurrent admission attempts
    // Use exact match for full UUID, prefix match for partial
    let lockResult;
    if (isFullUUID) {
      lockResult = await client.query(
        `SELECT * FROM attendees WHERE uuid = $1 FOR UPDATE LIMIT 2`,
        [uuid],
      );
    } else {
      // Partial UUID: match prefix safely using LEFT(...) and limit locked rows
      lockResult = await client.query(
        `SELECT * FROM attendees
           WHERE LEFT(uuid::text, $2) = $1
           FOR UPDATE
           LIMIT 2`,
        [uuid, uuid.length],
      );
    }

    if (lockResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Applicant not found." },
        { status: 404, headers: headers },
      );
    }

    // Check for multiple matches (only possible with partial UUID)
    if (lockResult.rowCount && lockResult.rowCount > 1) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Multiple tickets found, please insert the full UUID." },
        { status: 400, headers: headers },
      );
    }

    const attendee = lockResult.rows[0];

    // Check if attendee has paid
    if (!attendee.paid) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Applicant has not even paid." },
        { status: 400, headers: headers },
      );
    }

    // Check if already admitted
    if (attendee.admitted_at !== null) {
      // Grace period: allow same device to re-fetch within 2.5 seconds
      const admittedTime = new Date(attendee.admitted_at).getTime();
      if (
        Date.now() - admittedTime < 2.5 * 1000 &&
        attendee.admitted_by === deviceUID
      ) {
        await client.query("COMMIT");
        return NextResponse.json(
          { success: true, applicant: attendee },
          { status: 200, headers: headers },
        );
      }
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Applicant already admitted." },
        { status: 400, headers: headers },
      );
    }

    // Admit the attendee (use attendee.uuid from locked row for partial UUID support)
    const result = await client.query(
      `UPDATE attendees 
       SET admitted_at = NOW(), admitted_by = $1 
       WHERE uuid = $2 
       RETURNING *`,
      [deviceUID, attendee.uuid],
    );

    // Commit transaction
    await client.query("COMMIT");

    return NextResponse.json(
      { success: true, applicant: result.rows[0] },
      { status: 200, headers: headers },
    );
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Error:", error);
    return NextResponse.json(
      { error: "An Error Occurred." },
      { status: 502, headers: headers },
    );
  } finally {
    client.release();
  }
}

export async function OPTIONS() {
  // Handle preflight OPTIONS request to Allow CORS for Usher App
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*"); // Allow all origins
  headers.set("Access-Control-Allow-Methods", "GET"); // Allow specific methods
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allow specific headers

  return new Response(null, {
    status: 204, // No content
    headers: headers,
  });
}
