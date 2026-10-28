import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSessionUser } from "@/lib/auth";
import { createApplication, getApplications } from "@/lib/data/repository";
import { canViewApplication } from "@/lib/rbac";
import { badRequest, jsonError, serializeApplication } from "@/lib/api";
import type { Application } from "@/lib/types";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const applications = await getApplications();
    return NextResponse.json({ applications: applications.filter((application) => canViewApplication(user, application)).map(serializeApplication) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    let body: { institutionName?: unknown; institutionId?: unknown; programme?: unknown; category?: unknown; ownerId?: unknown };
    try { body = await request.json(); } catch { return badRequest("Request body must be valid JSON"); }
    const { institutionName, institutionId, programme, category, ownerId } = body;
    if (typeof institutionName !== "string" || !institutionName.trim()) return badRequest("institutionName is required");
    if (typeof institutionId !== "string" || !institutionId.trim()) return badRequest("institutionId is required");
    if (typeof programme !== "string" || !programme.trim()) return badRequest("programme is required");
    if (typeof category !== "string" || !category.trim()) return badRequest("category is required");
    if (typeof ownerId !== "string" || !ownerId.trim()) return badRequest("ownerId is required");
    const existing = await getApplications();
    const id = `APP-${new Date().getFullYear()}-${String(existing.length + 1).padStart(3, "0")}`;
    const now = new Date().toISOString();
    const application: Application = {
      id,
      name: programme.trim(),
      institutionId: institutionId.trim(),
      institutionName: institutionName.trim(),
      programme: programme.trim(),
      status: "Draft",
      submittedAt: now,
      updatedAt: now,
      ownerId: ownerId.trim(),
      documents: [],
      findings: [],
      compliance: [],
      observations: [],
      audit: [{ id: randomUUID(), action: "status_changed", actorId: ownerId.trim(), details: "Application created as Draft.", createdAt: now }],
    };
    const created = await createApplication(application);
    return NextResponse.json({ application: serializeApplication(created) }, { status: 201 });
  } catch (error) { return jsonError(error); }
}
