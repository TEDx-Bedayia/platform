import { sql } from "@vercel/postgres";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return Response.json(
      {
        valid: false,
        message: "Username and password are required.",
      },
      { status: 400 }
    );
  }

  if (!process.env.MARKETING_MEMBER_PASSWORD) {
    return Response.json(
      {
        valid: false,
        message:
          "Marketing member credentials are not set. Please contact support.",
      },
      { status: 500 }
    );
  }

  let user =
    await sql`SELECT * FROM marketing_members WHERE username = ${username}`;

  if (
    user.rows.length != 0 &&
    password === process.env.MARKETING_MEMBER_PASSWORD
  ) {
    return Response.json(
      { valid: true, name: user.rows[0].name },
      { status: 200 }
    );
  } else {
    return Response.json({ valid: false }, { status: 401 });
  }
}
