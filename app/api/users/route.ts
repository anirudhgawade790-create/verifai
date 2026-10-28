import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getUsers } from "@/lib/data/repository";
import { jsonError } from "@/lib/api";
import { requireRole } from "@/lib/rbac";

export async function GET() {
  try {
    const user = await getSessionUser();
    try { requireRole(user, ["Super Admin"]); } catch (error) { return jsonError(error); }
    const users = await getUsers();
    return NextResponse.json({ users: users.map(({ password: _p, ...u }) => u) });
  } catch (error) {
    return jsonError(error);
  }
}
