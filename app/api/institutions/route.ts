import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getInstitutions } from "@/lib/data/repository";
import { jsonError } from "@/lib/api";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const institutions = await getInstitutions();
    return NextResponse.json({ institutions });
  } catch (error) {
    return jsonError(error);
  }
}
