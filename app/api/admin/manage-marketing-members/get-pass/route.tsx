import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  if (
    process.env.ADMIN_KEY === undefined ||
    !process.env.ADMIN_KEY ||
    !process.env.MARKETING_KEY ||
    process.env.MARKETING_KEY === undefined
  ) {
    return Response.json(
      { message: "Key is not set. Contact the maintainer." },
      { status: 500 }
    );
  }

  if (
    request.headers.get("key") !== process.env.ADMIN_KEY &&
    request.headers.get("key") !== process.env.MARKETING_KEY
  ) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  return Response.json(
    { pass: process.env.MARKETING_MEMBER_PASSWORD },
    { status: 200 }
  );
}
