import { NextRequest } from "next/server";

export let price = {
  individual: 100,
  group: 90,
};

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
  if (type === "individual") {
    total = price.individual;
  } else if (type === "group") {
    total = price.group;
  } else {
    return Response.json({ message: "Invalid ticket type." }, { status: 400 });
  }

  return Response.json({ total }, { status: 200 });
}
