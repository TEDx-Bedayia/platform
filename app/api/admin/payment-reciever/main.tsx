import { Applicant } from "@/app/admin/types/Applicant";
import { sql } from "@vercel/postgres";
import { randomUUID } from "crypto";
import { TicketType } from "../../../ticket-types";
import { price } from "../../tickets/price/prices";
import { ResponseCode } from "../../utils/response-codes";
import { sendEmail } from "./eTicketEmail";

export async function safeRandUUID() {
  let uuid = randomUUID();
  let query = await sql`SELECT * FROM attendees WHERE uuid = ${uuid}`;
  while (query.rows.length !== 0) {
    uuid = randomUUID();
    query = await sql`SELECT * FROM attendees WHERE uuid = ${uuid}`;
  }
  return uuid;
}

export async function pay(
  from: string,
  amount: string,
  date: string,
  id_if_needed: string
) {
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

  const client = await sql.connect();

  if (parseInt(amount) < 0) {
    const [first, ...rest] = from.split("@");
    const parsedFrom = first + "@" + rest.join(" ");

    await client.sql`INSERT INTO pay_backup (stream, incurred, recieved, recieved_at) VALUES (${parsedFrom}, 0, ${amount}, ${date})`;
    client.release();
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
  let query = await client.query(
    `SELECT * FROM attendees WHERE payment_method = '${from}' AND paid = false` +
      toAdd
  );

  if (query.rows.length === 0) {
    client.release();
    return Response.json(
      {
        message:
          "Not found. Try Again or Refund (Ticket isn't marked as paid yet).",
      },
      { status: 400 }
    );
  }

  if (
    from === "CASH" &&
    query.rows[0].type == TicketType.GROUP &&
    query.rows.length == 1
  ) {
    let xx =
      await client.sql`SELECT * FROM groups WHERE id1 = ${query.rows[0].id} OR id2 = ${query.rows[0].id} OR id3 = ${query.rows[0].id} OR id4 = ${query.rows[0].id}`;
    if (xx.rows.length === 0) {
      client.release();
      return Response.json(
        {
          message:
            "Not found. Try Again or Refund (Ticket isn't marked as paid yet).",
        },
        { status: 400 }
      );
    }
    query = await client.query(
      `SELECT * FROM attendees WHERE payment_method = 'CASH' AND paid = false AND id = '${xx.rows[0].id1}' OR id = '${xx.rows[0].id2}' OR id = '${xx.rows[0].id3}' OR id = '${xx.rows[0].id4}'`
    );
  }

  let unpaid: any[] = [];
  for (let i = 0; i < query.rows.length; i++) {
    let row = query.rows[i];
    if (row.paid === false) {
      row.price = price.getPrice(row.type, row.payment_method);
      unpaid.push(row);
    }
  }

  if (unpaid.length === 0) {
    client.release();
    return Response.json({ message: "Nobody to pay for." }, { status: 400 });
  }

  let total = 0;
  let containsIndv = false;
  let containsGroup = false;
  for (let i = 0; i < unpaid.length; i++) {
    total += unpaid[i].price;
    if (unpaid[i].type != TicketType.GROUP) {
      containsIndv = true;
    } else {
      containsGroup = true;
    }
  }

  if (
    parseInt(amount) < total &&
    parseInt(amount) >= price.individual &&
    containsIndv &&
    id_if_needed === ""
  ) {
    let found = unpaid;
    let groupMembers = {} as { [key: string]: Applicant[] };
    let processedIDs = new Set<string>();

    if (containsGroup) {
      for (let i = 0; i < unpaid.length; i++) {
        if (
          unpaid[i].type === TicketType.GROUP &&
          !processedIDs.has(unpaid[i].id)
        ) {
          const group =
            await client.sql`SELECT * FROM groups WHERE id1 = ${unpaid[i].id} OR id2 = ${unpaid[i].id} OR id3 = ${unpaid[i].id} OR id4 = ${unpaid[i].id}`;
          if (group.rows.length === 0) {
            client.release();
            return Response.json(
              {
                message:
                  "Not found. Try Again or Refund (Ticket isn't marked as paid yet). #3687",
              },
              { status: 400 }
            );
          }
          let grpMemberIDs = [
            group.rows[0].id1,
            group.rows[0].id2,
            group.rows[0].id3,
            group.rows[0].id4,
          ].filter((id) => id !== unpaid[i].id);

          processedIDs.add(group.rows[0].id1);
          processedIDs.add(group.rows[0].id2);
          processedIDs.add(group.rows[0].id3);
          processedIDs.add(group.rows[0].id4);

          found = found.filter((x) => !grpMemberIDs.includes(x.id));

          const grpMembersQuery = await client.query(
            `SELECT * FROM attendees WHERE id IN (${grpMemberIDs.join(
              ","
            )}) AND payment_method = '${from}' AND paid = false`
          );

          groupMembers[unpaid[i].id] = [];
          grpMembersQuery.rows.forEach((member) => {
            groupMembers[unpaid[i].id].push(member as Applicant);
          });
        }
      }
    }
    found = found.map((x) => {
      x.ticket_type = x.type;
      return x;
    });
    client.release();
    return Response.json(
      {
        message: "Not enough money to pay for all tickets. Identify using IDs.",
        found,
        groupMembers,
      },
      { status: ResponseCode.TICKET_AMBIGUITY }
    );
  }

  if (id_if_needed !== "") {
    let queryio = "";
    id_if_needed.split(",").forEach((id) => {
      queryio += `id = '${id}' OR `;
    });
    queryio = queryio.slice(0, -4);
    query = await client.query(
      `SELECT * FROM attendees WHERE payment_method = '${from}' AND ${queryio} AND paid = false`
    );

    unpaid = [];
    for (let i = 0; i < query.rows.length; i++) {
      let row = query.rows[i];
      if (row.paid === false) {
        row.price = price.getPrice(row.type, row.payment_method);
        unpaid.push(row);
      }
    }

    let originalUnpaidLength = unpaid.length;

    for (let i = 0; i < originalUnpaidLength; i++) {
      let row = unpaid[i];
      // If the row is a group ticket get the other emails as well
      if (row.type === TicketType.GROUP) {
        const group =
          await client.sql`SELECT * FROM groups WHERE id1 = ${row.id} OR id2 = ${row.id} OR id3 = ${row.id} OR id4 = ${row.id}`;
        if (group.rows.length === 0) {
          client.release();
          return Response.json(
            {
              message:
                "Not found. Try Again or Refund (Ticket isn't marked as paid yet).",
            },
            { status: 400 }
          );
        }
        const groupMembers = [
          group.rows[0].id1,
          group.rows[0].id2,
          group.rows[0].id3,
          group.rows[0].id4,
        ];

        queryio = "";
        groupMembers.forEach((id) => {
          if (id != row.id) queryio += `id = '${id}' OR `;
        });
        queryio = queryio.slice(0, -4);
        query = await client.query(
          `SELECT * FROM attendees WHERE payment_method = '${from}' AND ${queryio} AND paid = false`
        );

        for (let i = 0; i < query.rows.length; i++) {
          let row = query.rows[i];
          if (row.paid === false) {
            row.price = price.getPrice(row.type, row.payment_method);
            unpaid.push(row);
          }
        }
      }
    }

    if (unpaid.length === 0) {
      client.release();
      return Response.json({ message: "Nobody to pay for." }, { status: 400 });
    }

    total = 0;
    for (let i = 0; i < unpaid.length; i++) {
      total += unpaid[i].price;
    }
  }

  let paid = 0;
  let paidFor = [];
  let uniqueGroupsToPayFor = [];
  let uniqueGroupsToPayForData: { [key: string]: string[] } = {};

  try {
    for (let i = 0; i < unpaid.length; i++) {
      if (unpaid[i].type == TicketType.GROUP) continue;

      paid += unpaid[i].price;
      if (paid <= parseInt(amount)) {
        let randUUID = await safeRandUUID();
        try {
          await client.sql`UPDATE attendees SET paid = true, uuid = ${randUUID} WHERE id = ${unpaid[i].id}`;
        } catch (e) {
          paid -= unpaid[i].price;
          client.release();
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
        if (unpaid[i].type == TicketType.GROUP) {
          let group =
            await client.sql`SELECT * FROM groups WHERE id1 = ${unpaid[i].id} OR id2 = ${unpaid[i].id} OR id3 = ${unpaid[i].id} OR id4 = ${unpaid[i].id}`;
          if (group.rows.length === 0) {
            client.release();
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
              group.rows[0].id1 as string,
              group.rows[0].id2 as string,
              group.rows[0].id3 as string,
              group.rows[0].id4 as string,
            ];
          }
        }
      }

      const groupIDs = Object.keys(uniqueGroupsToPayForData);

      if (
        groupIDs.length * price.group * 4 > parseInt(amount) &&
        parseInt(amount) >= price.individual &&
        groupIDs.length != 1
      ) {
        let found: any[] = [];
        let groupMembers: { [key: string]: Applicant[] } = {};
        groupIDs.forEach((id) => {
          found.push(
            ...unpaid.filter((x) => uniqueGroupsToPayForData[id][0] === x.id)
          );
          groupMembers[uniqueGroupsToPayForData[id][0]] = unpaid.filter(
            (x) =>
              uniqueGroupsToPayForData[id].includes(x.id) &&
              !found.includes(x.id)
          );
        });
        found = found.map((x) => {
          x.ticket_type = x.type;
          return x;
        });
        client.release();
        return Response.json(
          {
            message:
              "Not enough money to pay for all tickets. Identify using IDs.",
            found,
            groupMembers,
          },
          { status: ResponseCode.TICKET_AMBIGUITY }
        );
      }

      for (let i = 0; i < groupIDs.length; i++) {
        const groupID = groupIDs[i];
        const groupMembers = uniqueGroupsToPayForData[groupID];
        paid += price.group * 4;

        if (paid <= parseInt(amount)) {
          // Collect all rows to update
          const rowsToUpdate = unpaid.filter((x) =>
            groupMembers.includes(x.id)
          );

          let safeUUIDs: { [key: number]: string } = {};
          for (let j = 0; j < rowsToUpdate.length; j++) {
            safeUUIDs[rowsToUpdate[j].id as number] = await safeRandUUID();
          }

          // Generate UUIDs and prepare the data for bulk update
          const updates = rowsToUpdate.map((row) => ({
            id: row.id as number,
            uuid: safeUUIDs[row.id as number],
          }));

          // Extract ids and uuids from updates for use in the SQL query
          const ids = updates.map((u) => u.id);
          const uuids = updates.map((u) => u.uuid);

          // Batch SQL Update
          try {
            await client.query(
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
            paid -= price.group * 4;
            console.error(e);
            client.release();
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
    if (paid != 0 && paid <= total && paid <= parseInt(amount)) {
      if (parseInt(amount) != 0) {
        await client.sql`INSERT INTO pay_backup (stream, incurred, recieved, recieved_at) VALUES (${from}, ${paid}, ${amount}, ${date})`;
      }
    } else if (paid == 0) {
      client.release();
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
        await sendEmail(
          paidFor[i].email,
          paidFor[i].full_name,
          paidFor[i].uuid,
          paidFor[i].id
        );
      }
    } catch (e) {
      client.release();
      return Response.json(
        { message: "Err #9194. Contact Support or Try Again." },
        { status: 500 }
      );
    }
    const totalPrice = paidFor.reduce((sum, item) => sum + item.price, 0);
    if (totalPrice != paid) {
      console.error(
        "OH NO! INSANE ERROR! HUGE ERROR! MASSIVE ERROR! main.tsx line 282"
      );
      client.release();
      return Response.json(
        {
          message:
            "Err #9184. Contact Support or Try Again. (Total price doesn't match paid amount)",
        },
        { status: 500 }
      );
    }
    client.release();
    return Response.json(
      { refund: false, paid, accepted: paidFor },
      { status: 200 }
    );
  } catch (e) {
    client.release();
    return Response.json(e, { status: 500 });
  }
}
