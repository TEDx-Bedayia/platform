import { sql } from "@vercel/postgres";
import { type NextRequest } from "next/server";
import { getPaymentMethods } from "../../tickets/payment-methods/payment-methods";
import { price } from "../../tickets/price/prices";

export async function GET(request: NextRequest) {
  if (request.headers.get("key") !== process.env.ADMIN_KEY) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    let query = await sql.query(`SELECT SUM(
    CASE 
        WHEN type = 'individual' THEN ${price.individual}
        WHEN type = 'group' THEN ${price.group} 
        ELSE 0
    END
    ) AS total_price
    FROM attendees;`);

    return Response.json({ total: query.rows[0].total_price });
  } catch (error) {
    return Response.json({ message: "Error occurred." }, { status: 400 });
  }
}
