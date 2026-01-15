import { NextRequest, NextResponse } from "next/server";
import { canUserAccess, ProtectedResource } from "../../utils/auth";
import { validateCsrf } from "../../utils/csrf";
import {
  createAccountHolder,
  getAllAccountHolders,
  setAdditionalScopesToAccountHolder,
  setPaymentMethodsToAccountHolder,
} from "./utils";

export async function POST(request: NextRequest) {
  try {
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    if (!canUserAccess(request, ProtectedResource.MANAGE_ACCOUNT_HOLDERS)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { username, password, paymentMethods, additionalScopes } =
      await request.json();

    // Create user
    const user = await createAccountHolder(username, password);
    if (!user.id) {
      return NextResponse.json(
        { message: "Failed to create user." },
        { status: 500 }
      );
    }

    // Add payment methods
    if (Array.isArray(paymentMethods) && paymentMethods.length > 0) {
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
    }

    // Add additional scopes
    if (Array.isArray(additionalScopes) && additionalScopes.length > 0) {
      const addedScopes = await setAdditionalScopesToAccountHolder(
        user.id,
        additionalScopes
      );

      if (!addedScopes) {
        return NextResponse.json(
          { message: "Failed to add additional scopes" },
          { status: 500 }
        );
      }
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
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

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
    const csrfError = validateCsrf(request);
    if (csrfError) return csrfError;

    if (!canUserAccess(request, ProtectedResource.MANAGE_ACCOUNT_HOLDERS)) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { id, paymentMethods, additionalScopes } = await request.json();

    if (
      !id ||
      !Array.isArray(paymentMethods) ||
      !Array.isArray(additionalScopes)
    ) {
      return NextResponse.json(
        { message: "Invalid payload." },
        { status: 400 }
      );
    }

    const sanitizedMethods = paymentMethods
      .filter((method: unknown): method is string => typeof method === "string")
      .map((method) => method.trim())
      .filter(Boolean);

    const uniqueMethods = Array.from(new Set(sanitizedMethods));

    const validScopeValues = Object.values(ProtectedResource) as string[];
    const sanitizedScopes = additionalScopes
      .filter((scope: unknown): scope is string => typeof scope === "string")
      .map((scope) => scope.trim())
      .filter((scope): scope is ProtectedResource =>
        validScopeValues.includes(scope)
      );

    const uniqueScopes = Array.from(new Set(sanitizedScopes));

    const updatedMethods = await setPaymentMethodsToAccountHolder(
      Number(id),
      uniqueMethods
    );

    if (!updatedMethods) {
      return NextResponse.json(
        { message: "Failed to update payment methods." },
        { status: 500 }
      );
    }

    const updatedScopes = await setAdditionalScopesToAccountHolder(
      Number(id),
      uniqueScopes
    );

    if (!updatedScopes) {
      return NextResponse.json(
        { message: "Failed to update additional scopes." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Account holder updated successfully." },
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
