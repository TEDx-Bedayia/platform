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
    const qrCodeImage = await QRCode.toDataURL(uuid, { width: 300 });

    // Convert Base64 string to Buffer for serving as an image
    const base64Data = qrCodeImage.replace(/^data:image\/png;base64,/, "");
    const imgBuffer = Buffer.from(base64Data, "base64");

    // Return the QR code as a JSON response
    return new NextResponse(imgBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
      },
    });
  } catch (error) {
    console.error("QR Code generation error:", error);
    return NextResponse.json({ error: "An Error Occurred" }, { status: 502 });
  }
}
