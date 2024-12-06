import { type NextRequest } from "next/server";
import { pay } from "../main";

export async function GET(request: NextRequest) {
  let params = request.nextUrl.searchParams;

  if (request.headers.get("key") !== process.env.ADMIN_KEY) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  let from = params.get("username");
  if (from === null) {
    return Response.json(
      { message: "Account Number / Name of Sender is required." },
      { status: 400 }
    );
  }

  let email = params.get("email");
  if (email === null) {
    return Response.json(
      { message: "Email of Sender is required." },
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

  from = "IPN@" + from.trim();

  return await pay(from, amount, date);
}
