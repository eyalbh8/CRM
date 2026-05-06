import type { JwtSignOptions } from "@nestjs/jwt";
import type { CookieOptions } from "express";

export const AUTH_COOKIE_NAME = "proline_access_token";

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set to at least 32 characters");
  }

  return secret;
}

export function getJwtExpiresIn(): JwtSignOptions["expiresIn"] {
  return (process.env.JWT_EXPIRES_IN || "15m") as JwtSignOptions["expiresIn"];
}

export function getAuthCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    maxAge: getCookieMaxAgeMs(),
    path: "/",
    sameSite: getCookieSameSite(),
    secure: isCookieSecure(),
  };
}

function getCookieMaxAgeMs(): number {
  const configured = process.env.JWT_COOKIE_MAX_AGE_MS;

  if (!configured) {
    return 15 * 60 * 1000;
  }

  const parsed = Number(configured);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("JWT_COOKIE_MAX_AGE_MS must be a positive number");
  }

  return parsed;
}

function getCookieSameSite(): CookieOptions["sameSite"] {
  const configured = process.env.JWT_COOKIE_SAME_SITE;

  if (configured === "strict" || configured === "lax" || configured === "none") {
    return configured;
  }

  return "lax";
}

function isCookieSecure(): boolean {
  return process.env.JWT_COOKIE_SECURE === "true" || process.env.NODE_ENV === "production";
}
