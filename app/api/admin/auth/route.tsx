import cookie from "cookie";
import { NextRequest, NextResponse } from "next/server";
import { signToken, UserRole, verifyToken } from "../../utils/auth";
import { getAccountHolderInfo } from "../manage-account-holders/utils";

export async function POST(request: NextRequest) {
  try {
    // Artificial delay to simulate a slow server
    await new Promise((resolve) => setTimeout(resolve, 2000));

    let params = await request.formData();

    let username = params.get("username")?.toString();
    if (
      username === null ||
      username === "" ||
      username === undefined ||
      !username
    ) {
      return Response.json({ message: "Error." }, { status: 400 });
    }

    let password = params.get("password")?.toString();
    if (
      password === null ||
      password === "" ||
      password === undefined ||
      !password
    ) {
      return Response.json({ message: "Error." }, { status: 400 });
    }

    if (
      process.env.SKLOFFICE &&
      process.env.SKLOFFICEPASS &&
      params.get("name")?.toString().toLowerCase().trim() === "school office" &&
      username === process.env.SKLOFFICE &&
      password === process.env.SKLOFFICEPASS
    ) {
      const token = signToken(
        {
          role: UserRole.SCHOOL_OFFICE,
          methods: ["CASH"],
        },
        "28d"
      );
      const response = NextResponse.json({
        role: UserRole.SCHOOL_OFFICE,
        methods: ["CASH"],
      });
      response.headers.set(
        "Set-Cookie",
        cookie.serialize("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 28, // 28 days
        })
      );

      return response;
    }

    if (
      process.env.ADMIN_USERNAME &&
      process.env.ADMIN_PASSWORD &&
      process.env.MAINTAINER &&
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD &&
      params.get("name")?.toString().trim() === process.env.MAINTAINER
    ) {
      const token = signToken({ role: UserRole.ADMIN });
      const response = NextResponse.json({ role: UserRole.ADMIN });
      response.headers.set(
        "Set-Cookie",
        cookie.serialize("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })
      );

      return response;
    }

    if (
      process.env.MARKETING_USERNAME &&
      process.env.MARKETING_PASSWORD &&
      username === process.env.MARKETING_USERNAME &&
      password === process.env.MARKETING_PASSWORD &&
      params.get("name")?.toString().toLowerCase().trim() === "marketing"
    ) {
      const token = signToken({ role: UserRole.MARKETING_HEAD }, "14d");
      const response = NextResponse.json({ role: UserRole.MARKETING_HEAD });
      response.headers.set(
        "Set-Cookie",
        cookie.serialize("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 14, // 14 days
        })
      );

      return response;
    }

    if (
      params.get("name")?.toString().toLowerCase().trim() === "account holder"
    ) {
      const accountHolder = await getAccountHolderInfo(username, password);
      if (!accountHolder) {
        return Response.json(
          { message: "Invalid Credentials." },
          { status: 403 }
        );
      }

      const token = signToken(
        {
          role: UserRole.PAYMENT_HANDLER,
          methods: accountHolder.allowed_methods,
        },
        "14d"
      );
      const response = NextResponse.json({
        role: UserRole.PAYMENT_HANDLER,
        methods: accountHolder.allowed_methods,
      });
      response.headers.set(
        "Set-Cookie",
        cookie.serialize("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 14, // 14 days
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
