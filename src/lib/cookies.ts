import type { CookieOptions, Response } from "express";
import { authConfig } from "../config/auth.config.js";

function refreshCookieOptions(): CookieOptions {
  const { refreshCookie } = authConfig;
  return {
    httpOnly: refreshCookie.httpOnly,
    secure: refreshCookie.secure,
    sameSite: refreshCookie.sameSite,
    path: refreshCookie.path,
    maxAge: refreshCookie.maxAgeMs,
    ...(refreshCookie.partitioned ? { partitioned: true } : {}),
  };
}

export function setRefreshTokenCookie(res: Response, token: string): void {
  const { refreshCookie } = authConfig;
  res.cookie(refreshCookie.name, token, refreshCookieOptions());
}

export function clearRefreshTokenCookie(res: Response): void {
  const { refreshCookie } = authConfig;
  res.clearCookie(refreshCookie.name, {
    httpOnly: refreshCookie.httpOnly,
    secure: refreshCookie.secure,
    sameSite: refreshCookie.sameSite,
    path: refreshCookie.path,
    ...(refreshCookie.partitioned ? { partitioned: true } : {}),
  });
}
