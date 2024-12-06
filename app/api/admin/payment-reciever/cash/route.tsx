import { type NextRequest } from "next/server";
import { pay } from "../main";

export async function GET(request: NextRequest) {
  let params = request.nextUrl.searchParams;

  if (
    process.env.ADMIN_KEY === undefined ||
    !process.env.ADMIN_KEY ||
    !process.env.SKL_OFFICE ||
    process.env.SKL_OFFICE === undefined
  ) {
    return Response.json(
      { message: "Key is not set. Contact the maintainer." },
      { status: 500 }
    );
  }

  if (
    request.headers.get("key") !== process.env.ADMIN_KEY &&
    request.headers.get("key") !== process.env.SKL_OFFICE
  ) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  let from = params.get("email");
  if (from === null) {
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

  from = "CASH@" + from.trim();

  return await pay(from, amount, date);
}
