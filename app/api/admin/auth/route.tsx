import cookie from "cookie";
import { NextRequest, NextResponse } from "next/server";
import { signToken, UserRole, verifyToken } from "../../utils/auth";

export async function POST(request: NextRequest) {
  try {
    // Artificial delay to simulate a slow server
    await new Promise((resolve) => setTimeout(resolve, 2000));

    let params = await request.formData();

    let username = params.get("username")?.toString();
    if (username === null || username === "" || username === undefined) {
      return Response.json({ message: "Error." }, { status: 400 });
    }

    let password = params.get("password")?.toString();
    if (password === null || password === "" || password === undefined) {
      return Response.json({ message: "Error." }, { status: 400 });
    }

    if (
      params.get("name")?.toString().toLowerCase().trim() === "school office" &&
      username === process.env.SKLOFFICE &&
      password === process.env.SKLOFFICEPASS &&
      process.env.SKLOFFICE &&
      process.env.SKLOFFICEPASS
    ) {
      const token = signToken({
        role: UserRole.SCHOOL_OFFICE,
        methods: ["CASH"],
      });
      const response = NextResponse.json({ role: UserRole.SCHOOL_OFFICE });
      response.headers.set(
        "Set-Cookie",
        cookie.serialize("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })
      );

      return response;
    }

    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD &&
      params.get("name")?.toString().trim() === process.env.MAINTAINER &&
      process.env.ADMIN_USERNAME &&
      process.env.ADMIN_PASSWORD
    ) {
      const token = signToken({ role: UserRole.ADMIN });
      const response = NextResponse.json({ role: UserRole.ADMIN });
      response.headers.set(
        "Set-Cookie",
        cookie.serialize("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })
      );

      return response;
    }

    if (
      username === process.env.MARKETING_USERNAME &&
      password === process.env.MARKETING_PASSWORD &&
      params.get("name")?.toString().toLowerCase().trim() === "marketing" &&
      process.env.MARKETING_USERNAME &&
      process.env.MARKETING_PASSWORD
    ) {
      const token = signToken({ role: UserRole.MARKETING_HEAD });
      const response = NextResponse.json({ role: UserRole.MARKETING_HEAD });
      response.headers.set(
        "Set-Cookie",
        cookie.serialize("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })
      );

      return response;
    }

    return Response.json({ message: "Invalid Credentials." }, { status: 403 });
  } catch (error) {
    return Response.json(
      {
        message:
          "An error occurred during authentication. Please try again later.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({}, { status: 401 });
    }

    const decoded = verifyToken(token) as {
      role: UserRole;
      methods?: string[];
    };

    return NextResponse.json(
      { role: decoded.role, methods: decoded.methods },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({}, { status: 401 });
  }
}
