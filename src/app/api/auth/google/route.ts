import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

// One-time OAuth2 flow to get refresh token for Google services.
// 1. Visit /api/auth/google to start
// 2. Authorize in Google
// 3. Copy the refresh_token from the response
// 4. Add it to .env.local as GOOGLE_REFRESH_TOKEN

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI ?? "http://localhost:3000/api/auth/google";

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in .env.local" },
      { status: 500 }
    );
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  // Step 2: Exchange authorization code for tokens
  if (code) {
    try {
      const { tokens } = await oauth2.getToken(code);
      return NextResponse.json({
        message: "Success! Copy the refresh_token below to your .env.local",
        refresh_token: tokens.refresh_token,
        access_token: tokens.access_token,
        note: "Only the refresh_token is needed in .env.local",
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Token exchange failed", detail: String(error) },
        { status: 400 }
      );
    }
  }

  // Step 1: Redirect to Google consent screen
  const authUrl = oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

  return NextResponse.redirect(authUrl);
}
