import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie, publicUser, SESSION_COOKIE } from "@/lib/auth";
import { badRequest, jsonError } from "@/lib/api";
import { findUserByEmail } from "@/lib/data/repository";

export async function POST(request: NextRequest) {
  try {
    let body: { email?: unknown; password?: unknown };
    try {
      body = await request.json() as { email?: unknown; password?: unknown };
    } catch {
      return badRequest("Request body must be valid JSON");
    }
    if (typeof body.email !== "string" || typeof body.password !== "string") return badRequest("Email and password are required");
    const user = await findUserByEmail(body.email.trim());
    if (!user || user.password !== body.password) {
      return NextResponse.json({ error: "Invalid demo credentials" }, { status: 401 });
    }
    const sessionUser = publicUser(user);
    const response = NextResponse.json({ user: sessionUser });
    response.cookies.set(SESSION_COOKIE, createSessionCookie(sessionUser), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return response;
  } catch (error) {
    return jsonError(error);
  }
}
