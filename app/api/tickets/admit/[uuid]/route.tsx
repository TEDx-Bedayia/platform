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
  if (request.nextUrl.searchParams.get("key") !== process.env.APP_KEY) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }
  const uuid = (await params).uuid; // Extract the 'uuid' parameter
  const admitted = request.nextUrl.searchParams.get("admitted") !== "false";

  try {
    // Update the admitted status for the specified applicant
    const result = await sql.query(
      "UPDATE attendees SET admitted = $1 WHERE paid = true AND uuid = $2 RETURNING *",
      [admitted, uuid]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Applicant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, applicant: result.rows[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "An Error Occurred" }, { status: 502 });
  }
}
