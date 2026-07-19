import { createHash } from "node:crypto";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { authConfig } from "../config/auth.config.js";

export type AccessTokenPayload = {
  sub: string;
  email: string;
  role: Role;
};

export type RefreshTokenPayload = {
  sub: string;
};

export function signAccessToken(payload: AccessTokenPayload): string {
  const options = {
    expiresIn: authConfig.accessTokenExpiresIn,
  } as SignOptions;
  return jwt.sign(payload, authConfig.accessTokenSecret, options);
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  const options = {
    expiresIn: authConfig.refreshTokenExpiresIn,
  } as SignOptions;
  return jwt.sign(payload, authConfig.refreshTokenSecret, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, authConfig.accessTokenSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, authConfig.refreshTokenSecret) as RefreshTokenPayload;
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function getRefreshTokenExpiryDate(): Date {
  return new Date(Date.now() + authConfig.refreshCookie.maxAgeMs);
}
