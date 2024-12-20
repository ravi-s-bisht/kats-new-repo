import { NextResponse } from "next/server";

const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
const REDIRECT_URI = `${process.env.BASE_URL}/api/auth/microsoft/callback`;

export async function GET() {
  const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&response_mode=query&scope=openid%20profile%20email%20User.Read`;
  return NextResponse.redirect(authUrl);
}