import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

// Handler for POST requests
export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  if (process.env.ADMIN_KEY === undefined || !process.env.ADMIN_KEY) {
    return Response.json(
      { message: "Key is not set. Contact the maintainer." },
      { status: 500 }
    );
  }

  if (request.headers.get("key") !== process.env.ADMIN_KEY) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const id = parseInt((await params).id, 10); // Extract and parse the 'index' parameter
  const { admitted } = await request.json();

  try {
    // Update the admitted status for the specified applicant
    const result = await sql.query(
      "UPDATE attendees SET admitted = $1 WHERE paid = true AND id = $2 RETURNING *",
      [admitted, id]
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
