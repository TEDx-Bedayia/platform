import { type NextRequest } from "next/server";
import { handleMisspelling } from "./tickets/utils";

export async function GET(request: NextRequest) {
  return Response.json({
    message: "Success!",
  });
}
