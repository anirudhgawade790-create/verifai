import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { SessionUser } from "./types";

export const SESSION_COOKIE = "verifai_session";

function getSecret(): string {
  const configuredSecret = process.env.VERIFAI_SESSION_SECRET;
  const s = configuredSecret || (process.env.NODE_ENV !== "production"
    ? "development-only-verifai-session-secret"
    : "");
  if (process.env.NODE_ENV === "production" && s.length < 32) {
    throw new Error("VERIFAI_SESSION_SECRET must contain at least 32 characters in production.");
  }
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createSessionCookie(user: SessionUser): string {
  const payload = Buffer.from(JSON.stringify({ ...user, exp: Date.now() + 8 * 60 * 60 * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionCookie(cookie: string | undefined): SessionUser | undefined {
  if (!cookie) return;
  const parts = cookie.split(".");
  if (parts.length !== 2) return;
  const [payload, provided] = parts;
  const expected = sign(payload);
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return;
  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionUser & { exp: number };
    if (!value.exp || value.exp < Date.now()) return;
    const { exp: _exp, ...user } = value;
    return user;
  } catch {
    return;
  }
}

export async function getSessionUser(): Promise<SessionUser | undefined> {
  const cookieStore = await cookies();
  return verifySessionCookie(cookieStore.get(SESSION_COOKIE)?.value);
}

export function publicUser(user: SessionUser | { id: string; name: string; email: string; role: SessionUser["role"]; institutionId?: string }): SessionUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role, institutionId: user.institutionId };
}
