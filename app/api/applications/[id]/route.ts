import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getApplication } from "@/lib/data/repository";
import { canViewApplication } from "@/lib/rbac";
import { jsonError, serializeApplication } from "@/lib/api";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const { id } = await context.params;
    const application = await getApplication(id);
    if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    if (!canViewApplication(user, application)) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    return NextResponse.json({ application: serializeApplication(application) });
  } catch (error) {
    return jsonError(error);
  }
}
