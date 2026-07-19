import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma.js";
import {
  getRefreshTokenExpiryDate,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../lib/tokens.js";
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from "../../lib/cookies.js";
import { authConfig } from "../../config/auth.config.js";

async function issueTokenPair(
  res: Response,
  user: { id: string; email: string; role: "USER" | "ADMIN" },
) {
  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  const refreshToken = signRefreshToken({ sub: user.id });
  const tokenHash = hashToken(refreshToken);
  const expiresAt = getRefreshTokenExpiryDate();

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt,
    },
  });

  setRefreshTokenCookie(res, refreshToken);

  return accessToken;
}

export async function register(req: Request, res: Response) {
  try {
    const { email, password, name, phone } = req.body as {
      email?: string;
      password?: string;
      name?: string;
      phone?: string;
    };

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    if (typeof password !== "string" || password.length < 8) {
      res.status(400).json({ error: "Password must be at least 8 characters" });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name ?? null,
        phone: phone ?? null,
      },
    });

    const accessToken = await issueTokenPair(res, user);

    res.status(201).json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to register" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const accessToken = await issueTokenPair(res, user);

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to login" });
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const cookieName = authConfig.refreshCookie.name;
    const rawToken = req.cookies?.[cookieName] as string | undefined;

    if (!rawToken) {
      res.status(401).json({ error: "Refresh token missing" });
      return;
    }

    let payload: { sub: string };
    try {
      payload = verifyRefreshToken(rawToken);
    } catch {
      clearRefreshTokenCookie(res);
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }

    const tokenHash = hashToken(rawToken);
    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.userId !== payload.sub || stored.expiresAt < new Date()) {
      if (stored) {
        await prisma.refreshToken.delete({ where: { id: stored.id } }).catch(() => {});
      }
      clearRefreshTokenCookie(res);
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }

    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const accessToken = await issueTokenPair(res, stored.user);

    res.json({
      accessToken,
      user: {
        id: stored.user.id,
        email: stored.user.email,
        name: stored.user.name,
        phone: stored.user.phone,
        role: stored.user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to refresh token" });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const cookieName = authConfig.refreshCookie.name;
    const rawToken = req.cookies?.[cookieName] as string | undefined;

    if (rawToken) {
      const tokenHash = hashToken(rawToken);
      await prisma.refreshToken.deleteMany({ where: { tokenHash } });
    }

    clearRefreshTokenCookie(res);
    res.json({ message: "Logged out" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to logout" });
  }
}
