import { NextRequest, NextResponse } from "next/server";
import { canUserAccess, ProtectedResource } from "../../utils/auth";
import {
  createAccountHolder,
  getAllAccountHolders,
  setPaymentMethodsToAccountHolder,
} from "./utils";

export async function POST(request: NextRequest) {
  try {
    if (!canUserAccess(request, ProtectedResource.MANAGE_ACCOUNT_HOLDERS)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { username, password, paymentMethods } = await request.json();

    // Create user
    const user = await createAccountHolder(username, password);
    if (!user.id) {
      return NextResponse.json(
        { message: "Failed to create user." },
        { status: 500 }
      );
    }

    // Add payment methods
    const addedMethods = await setPaymentMethodsToAccountHolder(
      user.id,
      paymentMethods
    );

    if (!addedMethods) {
      return NextResponse.json(
        { message: "Failed to add payment methods" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Account holder created successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in POST /manage-account-holders", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!canUserAccess(request, ProtectedResource.MANAGE_ACCOUNT_HOLDERS)) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const accountHolders = await getAllAccountHolders();

    return NextResponse.json({ accountHolders }, { status: 200 });
  } catch (err) {
    console.error("Error in GET /manage-account-holders", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!canUserAccess(request, ProtectedResource.MANAGE_ACCOUNT_HOLDERS)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { id, paymentMethods } = await request.json();

    if (!id || !Array.isArray(paymentMethods)) {
      return NextResponse.json(
        { message: "Invalid payload. Provide id and paymentMethods." },
        { status: 400 }
      );
    }

    const sanitizedMethods = paymentMethods
      .filter((method: unknown): method is string => typeof method === "string")
      .map((method) => method.trim())
      .filter(Boolean);

    const uniqueMethods = Array.from(new Set(sanitizedMethods));

    const updated = await setPaymentMethodsToAccountHolder(
      Number(id),
      uniqueMethods
    );

    if (!updated) {
      return NextResponse.json(
        { message: "Failed to update payment methods." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Payment methods updated." },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in PATCH /manage-account-holders", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
