import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET;

// Extend NextRequest to include user property
interface CustomNextRequest extends NextRequest {
  user?: any; // Define the type of user as needed
}

export async function middleware(req: CustomNextRequest) {
  console.log("REQQQQQUESSSSTTTTT", req);
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api")) {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    try {
      if (!SECRET_KEY) {
        throw new Error("JWT_SECRET is not defined");
      }
      const user = jwt.verify(token, SECRET_KEY);
      req.user = user; // Attach user to the request for later use
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api).*)"], // Updated to match all backend calls
};
