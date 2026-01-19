import { canUserAccess, ProtectedResource } from "@/app/api/utils/auth";
import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

// Handler for GET requests - exports ALL tickets
export async function GET(request: NextRequest) {
  if (!canUserAccess(request, ProtectedResource.TICKET_DASHBOARD)) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // SQL query to fetch ALL attendees (no pagination)
    const result = await sql.query(
      `SELECT id, full_name, email, type AS "ticket_type", 
              payment_method, paid, admitted_at, sent, phone, created_at, uuid
       FROM attendees
       ORDER BY id DESC`
    );

    // Return all applicants as JSON
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching applicants for export:", error);
    return NextResponse.json(
      { error: "Database query failed" },
      { status: 500 }
    );
  }
}
