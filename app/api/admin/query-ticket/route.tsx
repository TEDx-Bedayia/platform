import { sql } from "@vercel/postgres";
import { NextRequest } from "next/server";
import { TicketType } from "../../../ticket-types";
import { price } from "../../tickets/price/prices";

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

  let from = params.get("id");
  if (from === null) {
    return Response.json({ message: "ID is required." }, { status: 400 });
  }

  if (!isNaN(Number(from))) {
    let res = await sql`SELECT * FROM attendees WHERE id = ${Number(from)}`;

    if (res.rowCount === 0) {
      return Response.json({ message: "User not found." }, { status: 404 });
    }

    if (res.rows[0].paid) {
      return Response.json(
        { message: "User has already paid." },
        { status: 400 }
      );
    }

    let email = res.rows[0].email;
    let name = res.rows[0].full_name;
    let amount = price.getPrice(res.rows[0].type, res.rows[0].payment_method);
    if (res.rows[0].type == TicketType.GROUP) amount = amount * 4;

    let type = res.rows[0].type;

    return Response.json(
      {
        email,
        name,
        amount,
        type,
      },
      { status: 200 }
    );
  }
}
