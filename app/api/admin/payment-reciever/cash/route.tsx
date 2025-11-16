import { price } from "@/app/api/tickets/price/prices";
import { TicketType } from "@/app/ticket-types";
import { sql } from "@vercel/postgres";
import { type NextRequest } from "next/server";
import { sendEmail } from "../eTicketEmail";
import { pay, safeRandUUID } from "../main";

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

  let amount = params.get("amount");
  if (amount === null) {
    return Response.json({ message: "Amount is required." }, { status: 400 });
  }

  let date = params.get("date");
  if (date === null) {
    return Response.json({ message: "Date is required." }, { status: 400 });
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

    let toBePaid = price.getPrice(res.rows[0].type, res.rows[0].payment_method);
    if (res.rows[0].type == TicketType.GROUP) toBePaid = toBePaid * 4;
    if (Number(amount) < toBePaid) {
      return Response.json(
        { message: "Amount is less than the required amount." },
        { status: 400 }
      );
    }

    try {
      if (res.rows[0].type != TicketType.GROUP) {
        let randUUID = await safeRandUUID();
        await sql`UPDATE attendees SET paid = true, uuid = ${randUUID} WHERE id = ${res.rows[0].id}`;
        await sendEmail(
          res.rows[0].email,
          res.rows[0].full_name,
          randUUID,
          res.rows[0].id
        );
      } else {
        let groupMembersIDs =
          await sql`SELECT id1, id2, id3, id4 FROM groups WHERE id1 = ${res.rows[0].id} OR id2 = ${res.rows[0].id} OR id3 = ${res.rows[0].id} OR id4 = ${res.rows[0].id}`;

        let randUUIDs = [];
        for (let i = 0; i < 4 * (groupMembersIDs.rows.length ?? 0); i++) {
          randUUIDs.push(await safeRandUUID());
        }

        let ids = [
          groupMembersIDs.rows.map((row) => row.id1),
          groupMembersIDs.rows.map((row) => row.id2),
          groupMembersIDs.rows.map((row) => row.id3),
          groupMembersIDs.rows.map((row) => row.id4),
        ];

        let accepted = await sql.query(
          `
              UPDATE attendees
              SET paid = true, uuid = data.uuid
              FROM (
                SELECT unnest($1::int[]) AS id, unnest($2::uuid[]) AS uuid
              ) AS data
              WHERE attendees.id = data.id
              RETURNING *
              `,
          [ids, randUUIDs] // Parameters passed as arrays
        );

        accepted.rows.forEach(async (row) => {
          await sendEmail(row.email, row.full_name, row.uuid, row.id);
        });
      }

      await sql`INSERT INTO pay_backup (stream, incurred, recieved, recieved_at) VALUES (${
        "CASH@" + from
      }, ${toBePaid}, ${amount}, ${date})`;
    } catch (e) {
      console.error(e);
      await sql`UPDATE attendees SET paid = false, uuid = NULL WHERE id = ${from}`;
      return Response.json(
        { message: "Err #7109. Contact Support or Try Again." },
        { status: 500 }
      );
    }

    return Response.json({ refund: false, paid: toBePaid }, { status: 200 });
  }

  from = "CASH@" + from.trim();

  return await pay(from, amount, date, params.get("identification") ?? "");
}
