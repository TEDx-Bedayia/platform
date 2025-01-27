import { price } from "@/app/api/tickets/price/prices";
import { ResponseCode } from "@/app/api/utils/response-codes";
import { TicketType } from "@/app/api/utils/ticket-types";
import { sql } from "@vercel/postgres";
import { type NextRequest } from "next/server";
import { pay } from "../main";

export const maxDuration = 15;

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

  let from = params.get("from");
  if (from === null) {
    return Response.json(
      { message: "Email/ID of Sender is required." },
      { status: 400 }
    );
  }

  if (!isNaN(Number(from))) {
    let res = await sql`SELECT * FROM attendees WHERE id = ${Number(from)}`;

    if (res.rowCount === 0) {
      return Response.json({ message: "User not found." }, { status: 404 });
    }

    let email = res.rows[0].email;
    let name = res.rows[0].full_name;
    let amount = price.getPrice(res.rows[0].type, res.rows[0].payment_method);
    if (res.rows[0].type == TicketType.GROUP) amount = amount * 4;

    return Response.json(
      {
        email,
        message:
          "Please Check Name: " +
          name +
          `. Also, they should pay ${amount} EGP.`,
      },
      { status: ResponseCode.UPDATE_ID }
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

  return await pay(from, amount, date, "");
}
