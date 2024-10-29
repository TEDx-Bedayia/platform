import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // This function accepts a username and password, and returns a token (process.env.ADMIN_KEY) if the credentials are valid.

    // Artificial delay to simulate a slow server
    await new Promise((resolve) => setTimeout(resolve, 2000));

    let params = await request.formData();

    let username = params.get("username")?.toString();
    if (username === null) {
      return Response.json(
        { message: "Username is required." },
        { status: 400 }
      );
    }

    let password = params.get("password")?.toString();
    if (password === null) {
      return Response.json(
        { message: "Password is required." },
        { status: 400 }
      );
    }

    if (
      username !== process.env.ADMIN_USERNAME ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return Response.json(
        { message: "Invalid Credentials." },
        { status: 403 }
      );
    }

    if (params.get("name")?.toString() !== process.env.MAINTAINER) {
      return Response.json(
        { message: "Invalid Credentials." },
        { status: 403 }
      );
    }

    return Response.json({ token: process.env.ADMIN_KEY }, { status: 200 });
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
