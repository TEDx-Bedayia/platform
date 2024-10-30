import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

// Handler for GET requests
export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ index: string }>;
  }
) {
  const index = parseInt((await params).index, 10) - 1; // Extract and parse the 'index' parameter
  const itemsPerPage = 10; // Number of rows per request

  if (request.headers.get("key") !== process.env.ADMIN_KEY) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Validate index
  if (isNaN(index) || index < 0) {
    return NextResponse.json(
      { error: "Invalid index parameter" },
      { status: 400 }
    );
  }

  const searchParams = request.nextUrl.searchParams.keys();

  const filters: { [key: string]: string } = {
    sent: `sent = ${request.nextUrl.searchParams.get("sent")}`,
    email: `email = '${request.nextUrl.searchParams.get("email")}'`,
    name: `full_name ILIKE '%${request.nextUrl.searchParams.get("name")}%'`,
    paid: `paid = ${request.nextUrl.searchParams.get("paid")}`,
    admitted: `admitted = ${request.nextUrl.searchParams.get("admitted")}`,
  };

  let filterQuery = "WHERE ";
  for (const param of searchParams) {
    if (filters[param]) {
      filterQuery += filters[param] + " AND ";
    }
  }
  if (filterQuery === "WHERE ") {
    filterQuery = "";
  }
  filterQuery = filterQuery.slice(0, -5);

  try {
    // SQL query to fetch paginated applicants using LIMIT and OFFSET
    const result = await sql.query(
      `SELECT id, full_name, email, type AS "ticket_type", 
              payment_method, paid, admitted, sent
       FROM attendees
       ` +
        filterQuery +
        `
       ORDER BY id ASC
       LIMIT $1 OFFSET $2`,
      [itemsPerPage, index * itemsPerPage]
    );

    // If no rows are returned, return an empty array
    if (result.rows.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Return the paginated applicants as JSON
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return NextResponse.json(
      { error: "Database query failed" },
      { status: 500 }
    );
  }
}
