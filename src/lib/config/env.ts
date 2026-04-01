function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  // Twilio
  TWILIO_ACCOUNT_SID: () => getEnv("TWILIO_ACCOUNT_SID"),
  TWILIO_AUTH_TOKEN: () => getEnv("TWILIO_AUTH_TOKEN"),
  TWILIO_PHONE_NUMBER: () => getEnv("TWILIO_PHONE_NUMBER"),

  // LiveKit
  LIVEKIT_API_KEY: () => getEnv("LIVEKIT_API_KEY"),
  LIVEKIT_API_SECRET: () => getEnv("LIVEKIT_API_SECRET"),
  LIVEKIT_URL: () => getEnv("LIVEKIT_URL"),

  // Google
  GOOGLE_CLIENT_ID: () => getEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: () => getEnv("GOOGLE_CLIENT_SECRET"),
  GOOGLE_REDIRECT_URI: () =>
    getEnv("GOOGLE_REDIRECT_URI", "http://localhost:3000/api/auth/google"),
  GOOGLE_REFRESH_TOKEN: () => getEnv("GOOGLE_REFRESH_TOKEN"),
  GOOGLE_SHEET_ID: () => getEnv("GOOGLE_SHEET_ID"),
  GOOGLE_CALENDAR_ID: () => getEnv("GOOGLE_CALENDAR_ID", "primary"),

  // AI
  ANTHROPIC_API_KEY: () => getEnv("ANTHROPIC_API_KEY"),

  // App
  APP_URL: () => getEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
  WEBHOOK_SECRET: () => getEnv("WEBHOOK_SECRET"),
};
