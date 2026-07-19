import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/$/, "");
}

/** Cross-site (FE and API on different hosts) needs SameSite=None + Secure. */
const isProduction =
  process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

const sameSiteEnv = process.env.COOKIE_SAME_SITE?.toLowerCase();
const sameSite = (sameSiteEnv ??
  (isProduction ? "none" : "lax")) as "strict" | "lax" | "none";

const secure =
  process.env.COOKIE_SECURE !== undefined
    ? process.env.COOKIE_SECURE === "true"
    : isProduction || sameSite === "none";

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
    secure,
    sameSite,
    /** Required for cross-site cookies in Chromium when FE ≠ API host. */
    partitioned: sameSite === "none",
    path: "/auth",
  },
  clientOrigin: normalizeOrigin(
    process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
  ),
} as const;
