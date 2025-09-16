import { NextResponse } from "next/server";
import { getPaymentMethods } from "./payment-methods";

export async function GET() {
  return NextResponse.json({
    paymentMethods: getPaymentMethods(),
  });
}
