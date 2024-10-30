import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(req: NextRequest) {
  // Generate QR Code from params
  // Get the "uuid" query parameter from the URL
  const uuid = req.nextUrl.searchParams.get("uuid");

  if (!uuid) {
    return NextResponse.json({ error: "UUID is required" }, { status: 400 });
  }
  try {
    // Generate QR code as a data URL (base64-encoded image)
    const qrCode = await QRCode.toDataURL(uuid);

    // Return the QR code as a JSON response
    return NextResponse.json({ qrCode });
  } catch (error) {
    console.error("QR Code generation error:", error);
    return NextResponse.json({ error: "An Error Occurred" }, { status: 502 });
  }
}
