import { EVENT_DATE, INDIVIDUAL_TICKET_PRICE } from "@/app/metadata";
import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { safeRandUUID } from "../../admin/payment-reciever/main";

// CORS headers for Usher App access
function corsHeaders(): Headers {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "POST");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  return headers;
}

// Handler for POST requests — register and immediately admit a walk-in attendee
export async function POST(request: NextRequest) {
  const headers = corsHeaders();

  // Parse JSON body
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400, headers },
    );
  }

  const name = body.name?.toString().trim();
  const email = body.email?.toString().trim().toLowerCase();
  const phone = body.phone?.toString().trim();
  const key = body.key?.toString().trim();
  const device = body.device?.toString().trim() || "unknown";
  let paymentMethod =
    body.paymentMethod?.toString().trim().toUpperCase() || "CASH";
  const username = body.username?.toString().trim();

  if (username) {
    paymentMethod += "@" + username;
  }

  if (paymentMethod === "TELDA") {
    paymentMethod = "TLDA";
  } else if (paymentMethod === "INSTAPAY") {
    paymentMethod = "IPN";
  }

  // Validate APP_KEY
  if (key !== process.env.APP_KEY || !process.env.APP_KEY) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401, headers },
    );
  }

  // Validate required fields
  if (!name || !email || !phone) {
    return NextResponse.json(
      { error: "Missing required fields: name, email, phone." },
      { status: 400, headers },
    );
  }

  // Event date threshold check (36 hours)
  const THRESHOLD = 36 * 60 * 60 * 1000;
  const currentDate = new Date();
  const eventDate = EVENT_DATE;

  if (
    Math.abs(currentDate.getTime() - eventDate.getTime()) > THRESHOLD &&
    process.env.PAYMOB_TEST_MODE !== "true"
  ) {
    return NextResponse.json(
      { error: `Event not started yet. ${eventDate.toLocaleDateString()}` },
      { status: 400, headers },
    );
  }

  // Use postgres client with transaction for atomicity
  const client = await sql.connect();

  try {
    await client.query("BEGIN");

    // Generate a unique UUID
    const uuid = await safeRandUUID();

    // Insert new attendee as paid & admitted on-door
    const result = await client.query(
      `INSERT INTO attendees (email, full_name, phone, type, payment_method, paid, uuid, sent, admitted_at, admitted_by)
       VALUES ($1, $2, $3, 'individual', $4, TRUE, $5, TRUE, NOW(), $6)
       RETURNING *`,
      [email, name, phone, paymentMethod, uuid, device],
    );

    await client.query(
      `INSERT INTO pay_backup (stream, incurred, recieved, recieved_at) VALUES ($1, $2, $2, NOW())`,
      [paymentMethod, INDIVIDUAL_TICKET_PRICE],
    );

    await client.query("COMMIT");

    return NextResponse.json(
      { success: true, applicant: result.rows[0] },
      { status: 200, headers },
    );
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("On-door ticket error:", error);
    return NextResponse.json(
      { error: "An Error Occurred." },
      { status: 502, headers },
    );
  } finally {
    client.release();
  }
}

// Handle preflight OPTIONS request for CORS
export async function OPTIONS() {
  const headers = corsHeaders();
  return new Response(null, { status: 204, headers });
}
