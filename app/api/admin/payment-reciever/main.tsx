import { sql } from "@vercel/postgres";
import { price } from "../../tickets/price/prices";

export async function pay(from: string, amount: string, date: string) {
  if (parseInt(amount) < 0) {
    return Response.json(
      { message: "Amount must be positive." },
      { status: 400 }
    );
  }
  let identification = "";
  let toAdd = "";
  if (from.split("@")[0] === "CASH") {
    identification = from.split("@").splice(1).join("@");
    from = "CASH";
    toAdd = ` AND email = '${identification}'`;
  }
  let query = await sql.query(
    `SELECT * FROM attendees WHERE payment_method = '${from}'` + toAdd
  );

  if (query.rows.length === 0) {
    return Response.json(
      {
        message:
          "Not found. Try Again or Refund (Ticket isn't marked as paid yet).",
      },
      { status: 400 }
    );
  }

  if (from === "CASH" && query.rows[0].type == "group") {
    let xx =
      await sql`SELECT * FROM groups WHERE email1 = ${query.rows[0].email} OR email2 = ${query.rows[0].email} OR email3 = ${query.rows[0].email} OR email4 = ${query.rows[0].email}`;
    if (xx.rows.length === 0) {
      return Response.json(
        {
          message:
            "Not found. Try Again or Refund (Ticket isn't marked as paid yet).",
        },
        { status: 400 }
      );
    }
    query = await sql.query(
      `SELECT * FROM attendees WHERE payment_method = 'CASH' AND email = '${xx.rows[0].email1}' OR email = '${xx.rows[0].email2}' OR email = '${xx.rows[0].email3}' OR email = '${xx.rows[0].email4}'`
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
    return Response.json({ message: "Nobody to pay for." }, { status: 400 });
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

    if (from == "CASH") {
      from = "CASH@" + identification.replaceAll("@", " ");
    }

    if (paid != 0)
      await sql`INSERT INTO pay_backup (stream, incurred, recieved, recieved_at) VALUES (${from}, ${paid}, ${amount}, ${date})`;
    if (paid == 0) {
      return Response.json(
        {
          message:
            "Nothing was paid. To pay for all tickets: " +
            total +
            " EGP. Paying for only one ticket (or an entire group ticket) is accepted as well.",
        },
        { status: 400 }
      );
    }
    return Response.json({ paid, accepted: paidFor }, { status: 200 });
  } catch (e) {
    return Response.json(e, { status: 500 });
  }
}
