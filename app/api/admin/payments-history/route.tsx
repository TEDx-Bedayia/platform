import { sql } from "@vercel/postgres";
import { type NextRequest } from "next/server";
import { getPaymentMethods } from "../../../payment-methods";
import { canUserAccess, ProtectedResource } from "../../utils/auth";
import { validateCsrf } from "../../utils/csrf";

export async function GET(request: NextRequest) {
  const csrfError = validateCsrf(request);
  if (csrfError) return csrfError;

  if (!canUserAccess(request, ProtectedResource.PAYMENT_LOGS)) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  let query =
    await sql`SELECT stream, incurred, recieved, created_at FROM pay_backup ORDER BY created_at DESC`;

  let pM = getPaymentMethods();

  return Response.json(
    query.rows.map((row) => ({
      stream:
        row.stream.toString().split("@")[0] !== "CARD"
          ? row.stream.toString().split("@")[0] !== "CASH"
            ? row.stream.toString().split("@")[0] !== "Marketing"
              ? pM.find(
                  (method) =>
                    method.identifier === row.stream.toString().split("@")[0]
                )?.displayName +
                " — " +
                row.stream.toString().split("@")[1]
              : "Marketing — " +
                row.stream.toString().split("@")[1].replaceAll(" ", "@")
            : "Office — " +
              row.stream.toString().split("@")[1].replaceAll(" ", "@")
          : "Card — " +
            row.stream.toString().split("@")[1].replaceAll(" ", "@"),
      incurred: row.incurred,
      recieved: row.recieved,
      created_at: row.created_at,
    }))
  );
}
