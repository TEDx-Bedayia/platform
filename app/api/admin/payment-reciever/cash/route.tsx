import { price } from "@/app/api/tickets/prices";
import { canUserAccess, ProtectedResource } from "@/app/api/utils/auth";
import { validateCsrf } from "@/app/api/utils/csrf";
import { EARLY_BIRD_UNTIL } from "@/app/metadata";
import { TicketType } from "@/app/ticket-types";
import { sql } from "@vercel/postgres";
import { NextResponse, type NextRequest } from "next/server";
import { sendEmail } from "../eTicketEmail";
import { pay, safeRandUUID } from "../main";

export const maxDuration = 15;

export async function GET(request: NextRequest) {
  const csrfError = validateCsrf(request);
  if (csrfError) return csrfError;

  let params = request.nextUrl.searchParams;

  if (!canUserAccess(request, ProtectedResource.PAYMENT_DASHBOARD, "CASH")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let from = params.get("from");
  if (from === null) {
    return NextResponse.json(
      { message: "Email/ID of Sender is required." },
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

  // Check if from is a number (ID)
  if (!isNaN(Number(from))) {
    let res = await sql`SELECT * FROM attendees WHERE id = ${Number(from)}`;

    if (res.rowCount === 0) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    if (res.rows[0].paid) {
      return NextResponse.json(
        { message: "User has already paid." },
        { status: 400 }
      );
    }

    let toBePaid = price.getPrice(
      res.rows[0].type,
      new Date(date),
      res.rows[0].payment_method
    );
    if (res.rows[0].type == TicketType.GROUP) toBePaid = toBePaid * 4;
    if (Number(amount) < toBePaid) {
      return NextResponse.json(
        { message: "Amount is less than the required amount." },
        { status: 400 }
      );
    }

    try {
      if (res.rows[0].type != TicketType.GROUP) {
        let randUUID = await safeRandUUID();
        if (EARLY_BIRD_UNTIL && new Date(date) < EARLY_BIRD_UNTIL) {
          await sql`UPDATE attendees SET paid = true, uuid = ${randUUID}, type = ${TicketType.INDIVIDUAL_EARLY_BIRD} WHERE id = ${res.rows[0].id}`;
        } else {
          await sql`UPDATE attendees SET paid = true, uuid = ${randUUID} WHERE id = ${res.rows[0].id}`;
        }
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
              SET paid = true, uuid = data.uuid${
                EARLY_BIRD_UNTIL && new Date(date) < EARLY_BIRD_UNTIL
                  ? `, type = '${TicketType.GROUP_EARLY_BIRD}'`
                  : ""
              }
              FROM (
                SELECT unnest($1::int[]) AS id, unnest($2::uuid[]) AS uuid
              ) AS data
              WHERE attendees.id = data.id
              RETURNING *
              `,
          [ids, randUUIDs] // Parameters passed as arrays
        );

        for (const row of accepted.rows) {
          await sendEmail(row.email, row.full_name, row.uuid, row.id);
        }
      }

      await sql`INSERT INTO pay_backup (stream, incurred, recieved, recieved_at) VALUES (${
        "CASH@" + from
      }, ${toBePaid}, ${amount}, ${date})`;
    } catch (e) {
      console.error(e);
      await sql`UPDATE attendees SET paid = false, uuid = NULL WHERE id = ${from}`;
      return NextResponse.json(
        { message: "Err #7109. Contact Support or Try Again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { refund: false, paid: toBePaid },
      { status: 200 }
    );
  }

  from = "CASH@" + from.trim();

  return await pay(from, amount, date, params.get("identification") ?? "");
}
