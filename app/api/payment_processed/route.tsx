import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "../admin/payment-reciever/eTicketEmail";
import { safeRandUUID } from "../admin/payment-reciever/main";

type Primitive = string | number | boolean | null | undefined;

/**
 * Safely gets a nested value from an object using dot-separated path.
 */
function getNestedValue<T extends Record<string, any>>(
  obj: T,
  path: string
): Primitive {
  return path
    .split(".")
    .reduce<any>((acc, key) => (acc != null ? acc[key] : undefined), obj);
}

/**
 * Given an object and an array of dot-separated keys,
 * returns a concatenated string of values in lexicographic key order.
 */
function stringifyValues<T extends Record<string, any>>(
  obj: T,
  keys: string[]
): string {
  return [...keys]
    .sort() // sort lexicographically
    .map((key) => {
      const value = getNestedValue(obj, key);
      return value != null ? String(value) : "";
    })
    .join("");
}

export async function POST(request: NextRequest) {
  const client = await sql.connect();
  try {
    // ensure the request is coming from Paymob by HMAC authentication
    const fields = [
      "amount_cents",
      "created_at",
      "currency",
      "error_occured",
      "has_parent_transaction",
      "id",
      "integration_id",
      "is_3d_secure",
      "is_auth",
      "is_capture",
      "is_refunded",
      "is_standalone_payment",
      "is_voided",
      "order.id",
      "owner",
      "pending",
      "source_data.pan",
      "source_data.sub_type",
      "source_data.type",
      "success",
    ];
    // if a field has a dot in its name, it means it's a nested field in the JSON object

    const searchParams = request.nextUrl.searchParams;
    const receivedHmac = searchParams.get("hmac");

    // step 1: Sort the parameters received in the callback in lexicographical order based on their keys.
    const payload = await request.json();
    const transaction = payload.obj;

    // step 2: Depending on the type of callback received, concatenate the values of the keys/parameters into a single string. This string will be used to calculate the HMAC in the next step.
    const hmacString = stringifyValues(transaction, fields);

    // step 3: Compute the HMAC using the SHA-512 hashing algorithm and the secret key provided by Paymob. The computed HMAC should be in hexadecimal format.
    const encoder = new TextEncoder();
    const keyData = encoder.encode(process.env.HMAC_SECRET || "");
    const hmacKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign(
      "HMAC",
      hmacKey,
      encoder.encode(hmacString)
    );

    const computedHmac = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (computedHmac !== receivedHmac) {
      return new Response("Invalid Attempt", { status: 401 });
    }

    const orderId = transaction.order.id;

    if (
      transaction.success &&
      !transaction.data.merchant.toString().startsWith("TEST")
    ) {
      // update the payment status in the database using the orderId & check if user already paid then don't do anything
      let members;
      try {
        members = await client.sql`
          SELECT * FROM attendees WHERE payment_method = ${
            "CARD@" + orderId
          } AND paid = FALSE;
        `;
      } catch (error) {
        console.error("Database query error:", error);
        client.release();
        return new Response("Database Error", { status: 500 });
      }

      if ((members.rowCount || 0) > 0) {
        const ids = members.rows.map((row: any) => parseInt(row.id));
        // const arrayLiteral = `{${ids.join(",")}}`;

        const uuids: string[] = [];
        for (let i = 0; i < ids.length; i++) {
          uuids.push(await safeRandUUID());
        }

        const result = await client.query(
          `UPDATE attendees SET paid = true, uuid = data.uuid FROM ( SELECT unnest($1::int[]) AS id, unnest($2::uuid[]) AS uuid ) AS data WHERE attendees.id = data.id RETURNING *;`,
          [ids, uuids] // Parameters passed as arrays
        );
        const updated = result.rowCount === ids.length;

        if (updated) {
          for (let member of result.rows) {
            // send email to each member
            await sendEmail(
              member.email,
              member.full_name,
              member.uuid,
              member.id
            );
          }

          await client.sql`INSERT INTO pay_backup (stream, incurred, recieved, recieved_at) VALUES (${
            "CARD@" + orderId
          }, ${transaction.amount_cents / 100}, ${
            transaction.amount_cents / 100
          }, ${transaction.created_at}::timestamptz);`;
        } else {
          console.error(`Failed to update payment status for order ${orderId}`);
        }
      } else {
        console.log(`No unpaid attendees found for order ${orderId}`);
      }
    } else {
      // no marking needed if payment declined
    }

    client.release();
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error processing payment callback:", error);
    client.release();
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // request is coming from client... check the payment status and respond accordingly
  const searchParams = request.nextUrl.searchParams;
  if (searchParams.get("success") === "true") {
    return NextResponse.redirect("https://tedxbedayia.com/book/success");
  }

  return NextResponse.redirect("https://tedxbedayia.com/book/failure");
}
