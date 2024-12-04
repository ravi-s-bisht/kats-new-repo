import { NextResponse } from "next/server";
import axios from "axios";
import db from "../db/connection";
import {
  authenticateUserToken,
  generateToken,
} from "@/utils/middleware/authMIddleware";
import { cookies } from "next/headers";
import { authenticateToken } from "@/utils/middleware/authMIddleware";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    const userInfo = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    console.log('first userInfo', userInfo);

    const emailDomain = userInfo.data.email.split("@")[1].split(".")[0];
    const role = ["yahoo"].includes(emailDomain) ? "user" : "facility";

    console.log("emailDomain", emailDomain, role);

    let loggedInUser = null;

    const user = await db("users").where({ email: userInfo.data.email }).first();

    if (role == "facility" || user.role == "facility") {
      loggedInUser = await db("users")
        .where({ email: userInfo.data.email })
        .first();
    } else if (role == "user") {
      loggedInUser = await db("users")
        .where({ email: userInfo.data.email, role: "user" })
        .first();
    }

    if (!loggedInUser && role == "user") {
      // Return error message
      return NextResponse.json(
        { error: "User not registered." },
        { status: 404 }
      );
    }

    // if logged in user doesn't exist and role is admin, create a new admin in the database
    if (!loggedInUser && role == "facility") {
      loggedInUser = await db("users")
        .insert({
          email: userInfo.data.email,
          first_name: userInfo.data.given_name,
          last_name: userInfo.data.family_name,
          role: "facility",
          branch_id: 1,
        })
        .returning("*");
    }

    const authToken = generateToken({ ...loggedInUser, role });

    // Create response with user data
    const response = NextResponse.json({
      user: { ...loggedInUser, role, token: authToken },
    });

    // Set HTTP-only cookie with the token
    response.cookies.set({
      name: "token",
      value: authToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.log("error", error);
    return NextResponse.json({ error: "Server error!" }, { status: 50 });
  }
}