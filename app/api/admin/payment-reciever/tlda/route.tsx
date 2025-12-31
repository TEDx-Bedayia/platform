import { canUserAccess, ProtectedResource } from "@/app/api/utils/auth";
import { validateCsrf } from "@/app/api/utils/csrf";
import { NextResponse, type NextRequest } from "next/server";
import { pay } from "../main";

export const maxDuration = 15;

export async function GET(request: NextRequest) {
  const csrfError = validateCsrf(request);
  if (csrfError) return csrfError;

  let params = request.nextUrl.searchParams;

  if (!canUserAccess(request, ProtectedResource.PAYMENT_DASHBOARD, "TLDA")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let from = params.get("from");
  if (from === null) {
    return NextResponse.json(
      { message: "Username of Sender is required." },
      { status: 400 }
    );
  }

  let amount = params.get("amount");
  if (amount === null) {
    return NextResponse.json(
      { message: "Amount is required." },
      { status: 400 }
    );
  }

  let date = params.get("date");
  if (date === null) {
    return NextResponse.json({ message: "Date is required." }, { status: 400 });
  }

  from = "TLDA@" + from.trim().toLowerCase();

  let id_if_needed = params.get("identification");
  if (id_if_needed !== null) id_if_needed = id_if_needed.trim();
  else id_if_needed = "";

  return await pay(from, amount, date, id_if_needed);
}
