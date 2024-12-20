import axios from "axios";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import db from "@/app/api/db/connection";
import { checkUserInDatabase, registerNewAdmin } from "@/utils/dbHelpers";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID as string;
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET as string;
const REDIRECT_URI = `${
  process.env.BASE_URL as string
}/api/auth/microsoft/callback`;

interface TokenResponse {
  access_token: string;
}

interface UserInfo {
  id: string;
  mail?: string;
  userPrincipalName?: string;
  displayName: string;
  surname: string;
  givenName: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "Authorization code is missing" },
      { status: 400 }
    );
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post<TokenResponse>(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token } = tokenResponse.data;

    // Fetch user information
    const userInfoResponse = await axios.get<UserInfo>(
      "https://graph.microsoft.com/v1.0/me",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    console.log("User info:", userInfoResponse.data);

    const userInfo = {
      data: {
        given_name: userInfoResponse.data?.givenName,
        family_name: userInfoResponse.data?.surname,
        email: userInfoResponse.data.mail,
      },
    };

    console.log("USER INFORRRRR: ", userInfo);

    const email = userInfo.data.email as string;

    const emailUser = await db("users").where({ email }).first();

    if (emailUser) {
      const jwtToken = jwt.sign(
        { email, role: emailUser.role, token: code, user: emailUser },
        JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      return NextResponse.redirect(
        `${process.env.BASE_URL}/microsoft-signin-callback?token=${jwtToken}`
      );
    }

    // Check the email domain
    const isPersonalEmail = ["gmail.com", "yahoo.com", "hotmail.com"].some(
      (domain) => email.endsWith(domain)
    );

    let role: "user" | "admin";
    if (isPersonalEmail) {
      // Check if the user exists in the database (mock implementation)
      const userExists = await checkUserInDatabase(email, "user");
      if (!userExists) {
        // Return response with error message
        return NextResponse.json(
          { error: "User not registered!" },
          { status: 401 }
        );
      }
      role = "user";
    } else {
      // Check if the email is in the admin table (mock implementation)
      const adminExists = await checkUserInDatabase(email, "admin");
      if (!adminExists) {
        // Register as a new admin (mock implementation)
        const company = email.split("@")[1].split(".")[0];
        await registerNewAdmin(email, userInfo, company);
      }
      role = "admin";
    }

    const user = await db("users").where({ email, role }).first();

    // Create a JWT token
    const jwtToken = jwt.sign({ email, role, user }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return NextResponse.redirect(
      `${process.env.BASE_URL}/microsoft-signin-callback?token=${jwtToken}`
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.redirect(
      `${process.env.BASE_URL}/microsoft-signin-callback?error=Authentication failed`
    );
  }
}
