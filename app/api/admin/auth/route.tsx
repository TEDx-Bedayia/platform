import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Artificial delay to simulate a slow server
    await new Promise((resolve) => setTimeout(resolve, 2000));

    let params = await request.formData();

    let username = params.get("username")?.toString();
    if (username === null || username === "" || username === undefined) {
      return Response.json({ message: "Error." }, { status: 400 });
    }

    let password = params.get("password")?.toString();
    if (password === null || password === "" || password === undefined) {
      return Response.json({ message: "Error." }, { status: 400 });
    }

    if (
      params.get("name")?.toString().toLowerCase().trim() === "school office" &&
      username === process.env.SKLOFFICE &&
      password === process.env.SKLOFFICEPASS &&
      process.env.SKLOFFICE &&
      process.env.SKLOFFICEPASS
    ) {
      return Response.json(
        { token: process.env.SKL_OFFICE, type: "school" },
        { status: 200 }
      );
    }

    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD &&
      params.get("name")?.toString().trim() === process.env.MAINTAINER &&
      process.env.ADMIN_KEY &&
      process.env.ADMIN_USERNAME &&
      process.env.ADMIN_PASSWORD
    ) {
      return Response.json(
        { token: process.env.ADMIN_KEY, type: "admin" },
        { status: 200 }
      );
    }

    if (
      username === process.env.MARKETING_USERNAME &&
      password === process.env.MARKETING_PASSWORD &&
      params.get("name")?.toString().toLowerCase().trim() ===
        "marketing management" &&
      process.env.MARKETING_KEY &&
      process.env.MARKETING_USERNAME &&
      process.env.MARKETING_PASSWORD
    ) {
      return Response.json(
        { token: process.env.MARKETING_KEY, type: "marketing" },
        { status: 200 }
      );
    }

    return Response.json({ message: "Invalid Credentials." }, { status: 403 });
  } catch (error) {
    return Response.json(
      {
        message:
          "Trying to get into the admin dashboard without permission is haram. I'm not joking. Etaky Rabena. You have great skills to be able to reach this point; great job bgd! Bs don't take saye2at on something tafha zy de :).",
      },
      { status: 500 }
    );
  }
}
