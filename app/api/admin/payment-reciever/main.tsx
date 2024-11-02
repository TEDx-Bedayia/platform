import { sql } from "@vercel/postgres";
import { randomUUID } from "crypto";
import QRCode from "qrcode";
import { price } from "../../tickets/price/prices";
import { sendEmail } from "./eTicketEmail";

export async function pay(from: string, amount: string, date: string) {
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

  if (parseInt(amount) < 0) {
    await sql`INSERT INTO pay_backup (stream, incurred, recieved, recieved_at) VALUES (${from}, 0, ${amount}, ${date})`;
    return Response.json(
      { refund: true, message: "Refund Inserted." },
      { status: 200 }
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
  let uniqueGroupsToPayFor = [];
  let uniqueGroupsToPayForData: { [key: string]: string[] } = {};

  try {
    for (let i = 0; i < unpaid.length; i++) {
      if (unpaid[i].type == "group") continue;

      paid += unpaid[i].price;
      if (paid <= parseInt(amount)) {
        let randUUID = randomUUID();
        try {
          await sql`UPDATE attendees SET paid = true, uuid = ${randUUID} WHERE id = ${unpaid[i].id}`;
        } catch (e) {
          paid -= unpaid[i].price;
          return Response.json(
            { message: "Err #7109. Contact Support or Try Again." },
            { status: 500 }
          );
        }
        unpaid[i].uuid = randUUID;
        paidFor.push(unpaid[i]);
      } else {
        paid -= unpaid[i].price;
        break;
      }
    }

    // If there are group tickets to pay for
    if (paidFor.length !== unpaid.length) {
      for (let i = 0; i < unpaid.length; i++) {
        if (unpaid[i].type == "group") {
          let group =
            await sql`SELECT * FROM groups WHERE email1 = ${unpaid[i].email} OR email2 = ${unpaid[i].email} OR email3 = ${unpaid[i].email} OR email4 = ${unpaid[i].email}`;
          if (group.rows.length === 0) {
            return Response.json(
              {
                message:
                  "Not found. Try Again or Refund (Ticket isn't marked as paid yet).",
              },
              { status: 400 }
            );
          }
          if (uniqueGroupsToPayFor.indexOf(group.rows[0].grpid) === -1) {
            uniqueGroupsToPayFor.push(group.rows[0].grpid);
            uniqueGroupsToPayForData[group.rows[0].grpid as string] = [
              group.rows[0].email1 as string,
              group.rows[0].email2 as string,
              group.rows[0].email3 as string,
              group.rows[0].email4 as string,
            ];
          }
        }
      }

      const groupIDs = Object.keys(uniqueGroupsToPayForData);

      for (let i = 0; i < groupIDs.length; i++) {
        const groupID = groupIDs[i];
        const groupMembers = uniqueGroupsToPayForData[groupID];
        paid += price.group * 4;

        if (paid <= parseInt(amount)) {
          // Collect all rows to update
          const rowsToUpdate = unpaid.filter((x) =>
            groupMembers.includes(x.email)
          );

          // Generate UUIDs and prepare the data for bulk update
          const updates = rowsToUpdate.map((row) => ({
            id: row.id as number,
            uuid: randomUUID(),
          }));

          // Extract ids and uuids from updates for use in the SQL query
          const ids = updates.map((u) => u.id);
          const uuids = updates.map((u) => u.uuid);

          // Batch SQL Update
          try {
            await sql.query(
              `
              UPDATE attendees
              SET paid = true, uuid = data.uuid
              FROM (
                SELECT unnest($1::int[]) AS id, unnest($2::uuid[]) AS uuid
              ) AS data
              WHERE attendees.id = data.id
              `,
              [ids, uuids] // Parameters passed as arrays
            );

            // Assign new UUIDs to the paidFor array
            updates.forEach((update) => {
              const row = rowsToUpdate.find((r) => r.id === update.id);
              if (row) {
                row.uuid = update.uuid;
                paidFor.push(row);
              }
            });
          } catch (e) {
            paid -= price.group;
            console.error(e);
            return Response.json(
              { message: "Err #7109. Contact Support or Try Again." },
              { status: 500 }
            );
          }
        } else {
          paid -= price.group * 4;
        }
      }
    }

    if (from == "CASH") {
      from = "CASH@" + identification.replaceAll("@", " ");
    }
    if (paid != 0 && paid <= total && paid <= parseInt(amount))
      await sql`INSERT INTO pay_backup (stream, incurred, recieved, recieved_at) VALUES (${from}, ${paid}, ${amount}, ${date})`;
    else if (paid == 0) {
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

    try {
      for (let i = 0; i < paidFor.length; i++) {
        let qr = await QRCode.toDataURL(paidFor[i].uuid, { width: 400 });
        await sendEmail(
          paidFor[i].email,
          paidFor[i].full_name,
          paidFor[i].uuid,
          qr
        );
      }
    } catch (e) {
      return Response.json(
        { message: "Err #9194. Contact Support or Try Again." },
        { status: 500 }
      );
    }
    const totalPrice = paidFor.reduce((sum, item) => sum + item.price, 0);
    if (totalPrice != paid) {
      console.error(
        "OH NO! INSANE ERROR! HUGE ERROR! MASSIVE ERROR! main.tsx line 220"
      );
      return Response.json(
        {
          message:
            "Err #9184. Contact Support or Try Again. (Total price doesn't match paid amount)",
        },
        { status: 500 }
      );
    }
    return Response.json(
      { refund: false, paid, accepted: paidFor },
      { status: 200 }
    );
  } catch (e) {
    return Response.json(e, { status: 500 });
  }
}
