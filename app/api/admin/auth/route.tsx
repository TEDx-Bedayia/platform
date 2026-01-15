import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  ProtectedResource,
  signToken,
  UserRole,
  verifyToken,
} from "../../utils/auth";
import { getAccountHolderInfo } from "../manage-account-holders/utils";

const DAY = 60 * 60 * 24;
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    // Artificial delay to simulate a slow server
    await new Promise((resolve) => setTimeout(resolve, 2000));

    let params = await request.formData();

    let username = params.get("username")?.toString();
    let password = params.get("password")?.toString();
    let accountName = params.get("name")?.toString()?.toLowerCase()?.trim();
    if (!username || !password || !accountName) {
      return NextResponse.json({ message: "Error." }, { status: 400 });
    }

    if (
      process.env.SKLOFFICE &&
      process.env.SKLOFFICEPASS &&
      accountName === "school office" &&
      username === process.env.SKLOFFICE &&
      password === process.env.SKLOFFICEPASS
    ) {
      const data = {
        role: UserRole.SCHOOL_OFFICE,
        methods: ["CASH"],
      };
      const token = signToken(data, "28d");
      cookieStore.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 28 * DAY,
        path: "/",
      });

      return NextResponse.json(data);
    }

    if (
      process.env.ADMIN_USERNAME &&
      process.env.ADMIN_PASSWORD &&
      process.env.MAINTAINER &&
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD &&
      params.get("name")?.toString().trim() === process.env.MAINTAINER
    ) {
      const data = { role: UserRole.ADMIN };
      const token = signToken(data);
      cookieStore.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * DAY,
        path: "/",
      });

      return NextResponse.json(data);
    }

    if (
      process.env.MARKETING_USERNAME &&
      process.env.MARKETING_PASSWORD &&
      username === process.env.MARKETING_USERNAME &&
      password === process.env.MARKETING_PASSWORD &&
      accountName === "marketing"
    ) {
      const data = { role: UserRole.MARKETING_HEAD };
      const token = signToken(data, "14d");
      cookieStore.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 14 * DAY,
        path: "/",
      });

      return NextResponse.json(data);
    }

    if (accountName === "account holder") {
      const accountHolder = await getAccountHolderInfo(username, password);
      if (!accountHolder) {
        return NextResponse.json(
          { message: "Invalid Credentials." },
          { status: 403 }
        );
      }

      const data = {
        role: UserRole.PAYMENT_HANDLER,
        methods: accountHolder.allowed_methods,
        additionalScopes: accountHolder.additional_scopes,
      };
      const token = signToken(data, "14d");
      cookieStore.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 14 * DAY,
        path: "/",
      });

      return NextResponse.json(data);
    }

    return NextResponse.json(
      { message: "Invalid Credentials." },
      { status: 403 }
    );
  } catch (error) {
    return NextResponse.json(
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
      additionalScopes?: ProtectedResource[];
    };

    return NextResponse.json(
      {
        role: decoded.role,
        methods: decoded.methods,
        additionalScopes: decoded.additionalScopes,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({}, { status: 401 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  return NextResponse.json({ message: "Logged out" }, { status: 200 });
}
