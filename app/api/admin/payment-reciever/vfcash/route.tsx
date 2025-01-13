import { type NextRequest } from "next/server";
import { pay } from "../main";

export const maxDuration = 15;

export async function GET(request: NextRequest) {
  let params = request.nextUrl.searchParams;

  if (
    request.headers.get("key") !== process.env.ADMIN_KEY ||
    !process.env.ADMIN_KEY
  ) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  let from = params.get("from");
  if (from === null) {
    return Response.json(
      { message: "Phone Number of Sender is required." },
      { status: 400 }
    );
  }

  let amount = params.get("amount");
  if (amount === null) {
    return Response.json({ message: "Amount is required." }, { status: 400 });
  }

  let date = params.get("date");
  if (date === null) {
    return Response.json({ message: "Date is required." }, { status: 400 });
  }

  from = "VFCASH@" + from.trim();

  let email_if_needed = params.get("email_id");
  if (email_if_needed !== null) email_if_needed = email_if_needed.trim();
  else email_if_needed = "";

  return await pay(from, amount, date, email_if_needed);
}
