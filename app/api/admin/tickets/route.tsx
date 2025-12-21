import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { canUserAccess, ProtectedResource } from "../../utils/auth";

export async function POST() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

// Custom GET to fetch all unpaid tickets' emails for marketing purposes
export async function GET(request: NextRequest) {
  // Check Admin Perms
  if (!canUserAccess(request, ProtectedResource.SUPER_ADMIN)) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { rows } =
    await sql`SELECT email FROM attendees WHERE paid = false AND type NOT IN ('speaker', 'discounted', 'giveaway');`;
  let emails = "";
  rows.forEach((row) => {
    emails += row.email + ", ";
  });

  return NextResponse.json({ emails }, { status: 200 });
}
