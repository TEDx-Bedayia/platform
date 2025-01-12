import { sql } from "@vercel/postgres";
import { type NextRequest } from "next/server";
import { price } from "../../tickets/price/prices";

export async function GET(request: NextRequest) {
  if (
    request.headers.get("key") !== process.env.ADMIN_KEY ||
    !process.env.ADMIN_KEY
  ) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    let query = await sql.query(`SELECT SUM(
    CASE 
        WHEN type = 'individual' THEN ${price.individual}
        WHEN type = 'group' THEN ${price.group} 
        WHEN type = 'discounted' THEN ${price.discounted}
        ELSE 0
    END
    ) AS total_price
    FROM attendees WHERE paid = true;`);

    return Response.json({
      total:
        query.rows[0].total_price != undefined ? query.rows[0].total_price : 0,
    });
  } catch (error) {
    return Response.json({ message: "Error occurred." }, { status: 400 });
  }
}
