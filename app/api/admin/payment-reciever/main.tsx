import { sql } from "@vercel/postgres";
import { type NextRequest } from "next/server";
import { price } from "../../tickets/price/prices";

export async function pay(from: string, amount: string) {
  let query = await sql`SELECT * FROM attendees WHERE payment_method = ${from}`;

  if (query.rows.length === 0) {
    return Response.json(
      {
        message:
          "Not found. Try Again or Refund (Ticket isn't marked as paid yet).",
      },
      { status: 404 }
    );
  }

  let unpaid = [];
  for (let i = 0; i < query.rows.length; i++) {
    let row = query.rows[i];
    if (row.paid === false) {
      row.price = row.type == "group" ? price.group : price.individual;
      unpaid.push(row);
    }
  }

  if (unpaid.length === 0) {
    return Response.json({ message: "Nobody to pay for." }, { status: 200 });
  }

  let total = 0;
  for (let i = 0; i < unpaid.length; i++) {
    total += unpaid[i].price;
  }

  let paid = 0;
  let paidFor = [];

  try {
    for (let i = 0; i < unpaid.length; i++) {
      if (unpaid[i].type == "group" && parseInt(amount) < price.group * 4)
        continue;

      paid += unpaid[i].price;
      if (paid <= parseInt(amount)) {
        await sql`UPDATE attendees SET paid = true WHERE id = ${unpaid[i].id}`;
        paidFor.push(unpaid[i]);
      } else {
        paid -= unpaid[i].price;
        break;
      }
    }

    if (paid != 0)
      await sql`INSERT INTO pay_backup (stream, incurred, recieved) VALUES (${from}, ${paid}, ${amount})`;
    return Response.json(paidFor, { status: 200 });
  } catch (e) {
    return Response.json(e, { status: 500 });
  }
}
