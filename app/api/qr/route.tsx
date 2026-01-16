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
    // Generate QR code directly as a buffer
    const qrBuffer = await QRCode.toBuffer(uuid, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 300,
    });

    // Return the QR code as an image response
    return new NextResponse(new Uint8Array(qrBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
      },
    });
  } catch (error) {
    console.error("QR Code generation error: ", error);
    return NextResponse.json({ error: "An Error Occurred" }, { status: 502 });
  }
}
