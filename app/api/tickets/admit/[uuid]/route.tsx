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
  // Set CORS headers
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*"); // Allow all origins
  headers.set("Access-Control-Allow-Methods", "GET"); // Allow specific methods
  headers.set("Access-Control-Allow-Headers", "Content-Type, key"); // Allow specific headers

  // Check if the request is coming from official app.
  if (request.nextUrl.searchParams.get("key") !== process.env.APP_KEY) {
    return Response.json(
      { message: "Unauthorized" },
      { status: 401, headers: headers }
    );
  }
  const uuid = (await params).uuid; // Extract the 'uuid' parameter

  try {
    // Update the admitted status for the specified applicant
    const result = await sql.query(
      "UPDATE attendees SET admitted = true WHERE paid = true AND admitted = false AND uuid = $2 RETURNING *",
      [uuid]
    );

    if (result.rowCount === 0) {
      let query = await sql`SELECT * FROM attendees WHERE uuid = ${uuid}`;
      if (query.rowCount === 0) {
        return NextResponse.json(
          { error: "Applicant not found" },
          { status: 404, headers: headers }
        );
      } else if (query.rows[0].admitted) {
        return NextResponse.json(
          { error: "Applicant already admitted" },
          { status: 400, headers: headers }
        );
      } else if (!query.rows[0].paid) {
        return NextResponse.json(
          { error: "Applicant has not paid" },
          { status: 400, headers: headers }
        );
      } else {
        return NextResponse.json(
          { error: "Applicant already admitted" },
          { status: 400, headers: headers }
        );
      }
    }

    return NextResponse.json(
      { success: true, applicant: result.rows[0] },
      { status: 200, headers: headers }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "An Error Occurred" },
      { status: 502, headers: headers }
    );
  }
}

export async function OPTIONS() {
  // Handle preflight OPTIONS request
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*"); // Allow all origins
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE"); // Allow specific methods
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Allow specific headers

  return new Response(null, {
    status: 204, // No content
    headers: headers,
  });
}
