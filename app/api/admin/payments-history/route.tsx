import { sql } from "@vercel/postgres";
import { type NextRequest } from "next/server";
import { getPaymentMethods } from "../../tickets/payment-methods/payment-methods";

export async function GET(request: NextRequest) {
  if (
    request.headers.get("key") !== process.env.ADMIN_KEY ||
    !process.env.ADMIN_KEY
  ) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  let query =
    await sql`SELECT stream, incurred, recieved, recieved_at FROM pay_backup ORDER BY created_at DESC`;

  let pM = await getPaymentMethods();

  return Response.json(
    query.rows.map((row) => ({
      stream:
        row.stream.toString().split("@")[0] !== "CASH"
          ? pM.find(
              (method) =>
                method.identifier === row.stream.toString().split("@")[0]
            )?.displayName +
            " — " +
            row.stream.toString().split("@")[1]
          : "Office — " +
            row.stream.toString().split("@")[1].replaceAll(" ", "@"),
      incurred: row.incurred,
      recieved: row.recieved,
      recieved_at: row.recieved_at,
    }))
  );
}
