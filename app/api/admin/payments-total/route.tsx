import { sql } from "@vercel/postgres";
import { type NextRequest } from "next/server";
import { TicketType } from "../../../ticket-types";
import { price } from "../../tickets/prices";
import { canUserAccess, ProtectedResource } from "../../utils/auth";

export async function GET(request: NextRequest) {
  if (!canUserAccess(request, ProtectedResource.PAYMENT_LOGS)) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    let query = await sql.query(`SELECT SUM(
    CASE 
        WHEN type = '${TicketType.INDIVIDUAL}' THEN ${price.individual}
        WHEN type = '${TicketType.GROUP}' THEN ${price.group}
        WHEN type = '${TicketType.DISCOUNTED}' THEN ${price.discounted}
        WHEN type = '${TicketType.TEACHER}' THEN ${price.teacher}
        WHEN type = '${TicketType.INDIVIDUAL_EARLY_BIRD}' THEN ${price.individual_early_bird}
        WHEN type = '${TicketType.GROUP_EARLY_BIRD}' THEN ${price.group_early_bird}
        ELSE 0
    END
    ) AS total_price
    FROM attendees WHERE paid = true;`);

    let totalDiscountedCodes =
      await sql`SELECT COUNT(code) FROM rush_hour WHERE processed = TRUE`;

    return Response.json({
      total:
        query.rows[0].total_price != undefined
          ? query.rows[0].total_price
          : 0 + totalDiscountedCodes.rows[0].count * price.discounted,
    });
  } catch (error) {
    return Response.json({ message: "Error occurred." }, { status: 400 });
  }
}
