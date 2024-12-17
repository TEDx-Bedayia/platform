import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}

export async function GET() {
  return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}
