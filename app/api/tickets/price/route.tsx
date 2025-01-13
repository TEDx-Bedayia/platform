import { NextRequest } from "next/server";
import { TicketType } from "../../utils/ticket-types";
import { price } from "./prices";

export async function GET(request: NextRequest) {
  let params = request.nextUrl.searchParams;

  let type = params.get("type");
  if (type === null) {
    return Response.json(
      { message: "Type of ticket is required." },
      { status: 400 }
    );
  }

  let total = 0;
  if (type === TicketType.INDIVIDUAL) {
    total = price.individual;
  } else if (type === TicketType.GROUP) {
    total = price.group * 4;
  } else {
    return Response.json({ message: "Invalid ticket type." }, { status: 400 });
  }

  return Response.json({ total }, { status: 200 });
}
