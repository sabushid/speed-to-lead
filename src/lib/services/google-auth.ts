import { google } from "googleapis";
import { env } from "@/lib/config/env";

let authClient: InstanceType<typeof google.auth.OAuth2> | null = null;

export function getGoogleAuth() {
  if (authClient) return authClient;

  const oauth2 = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID(),
    env.GOOGLE_CLIENT_SECRET(),
    env.GOOGLE_REDIRECT_URI()
  );

  oauth2.setCredentials({
    refresh_token: env.GOOGLE_REFRESH_TOKEN(),
  });

  authClient = oauth2;
  return oauth2;
}
