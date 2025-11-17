import { NextRequest } from "next/server";
import { canUserAccess, ProtectedResource } from "../../utils/auth";
import {
  addPaymentMethodsToAccountHolder,
  createAccountHolder,
  getAllAccountHolders,
} from "./utils";

export async function POST(request: NextRequest) {
  try {
    if (!canUserAccess(request, ProtectedResource.MANAGE_ACCOUNT_HOLDERS)) {
      return Response.json({ message: "Unauthorized." }, { status: 401 });
    }

    const { username, password, paymentMethods } = await request.json();

    // Create user
    const user = await createAccountHolder(username, password);
    if (!user.id) {
      return Response.json(
        { message: "Failed to create user." },
        { status: 500 }
      );
    }

    // Add payment methods
    const addedMethods = await addPaymentMethodsToAccountHolder(
      user.id,
      paymentMethods
    );

    if (!addedMethods) {
      return Response.json(
        { message: "Failed to add payment methods" },
        { status: 500 }
      );
    }

    return Response.json(
      { message: "Account holder created successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in POST /manage-account-holders", err);
    return Response.json({ message: "Internal server error" }, { status: 500 });
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

    return Response.json({ accountHolders }, { status: 200 });
  } catch (err) {
    console.error("Error in GET /manage-account-holders", err);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
