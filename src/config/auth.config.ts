import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const sameSite = (process.env.COOKIE_SAME_SITE ?? "lax") as
  | "strict"
  | "lax"
  | "none";

export const authConfig = {
  accessTokenSecret: requireEnv("JWT_ACCESS_SECRET"),
  refreshTokenSecret: requireEnv("JWT_REFRESH_SECRET"),
  accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  refreshCookie: {
    name: process.env.REFRESH_TOKEN_COOKIE_NAME ?? "refreshToken",
    maxAgeMs: Number(
      process.env.REFRESH_TOKEN_COOKIE_MAX_AGE_MS ?? 7 * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true as const,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite,
    path: "/auth",
  },
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
} as const;
