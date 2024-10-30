import { sql } from "@vercel/postgres";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  let params = request.nextUrl.searchParams;

  if (request.headers.get("key") !== process.env.ADMIN_KEY) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  let query =
    await sql`SELECT stream, incurred, recieved, recieved_at FROM pay_backup ORDER BY created_at DESC`;

  return Response.json(query.rows);
}
