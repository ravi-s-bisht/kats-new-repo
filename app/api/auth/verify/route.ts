import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    return NextResponse.json({
      token: token,
      role: decoded.role,
      user: decoded.user,
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
