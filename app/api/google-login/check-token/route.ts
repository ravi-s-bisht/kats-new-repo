import { NextResponse } from "next/server";
import db from "../../db/connection";
import {
  authenticateUserToken,
  generateToken,
} from "@/utils/middleware/authMIddleware";
import { cookies } from "next/headers";
import { authenticateToken } from "@/utils/middleware/authMIddleware";

export async function POST(request: Request) {
    try {
      const authHeader = request.headers.get("Authorization");
      const { token } = await request.json();
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Token missing" }, { status: 401 });
      }
    //   const tempToken = authHeader.split(" ")[1]; // Extract the token from the header
      const validatedToken = authenticateUserToken(token);
  
      if (!validatedToken) {
        return NextResponse.json({ error: "Token invalid" }, { status: 401 });
      }
  
      return NextResponse.json(validatedToken);
    } catch (error) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }
  }
  