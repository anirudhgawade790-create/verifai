import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSessionUser } from "@/lib/auth";
import { getApplication, updateApplication } from "@/lib/data/repository";
import { canManageApplication } from "@/lib/rbac";
import { jsonError, serializeApplication } from "@/lib/api";
import type { ApplicationStatus } from "@/lib/types";

const statuses: ApplicationStatus[] = ["Draft", "Submitted", "Under Review", "Verification Pending", "Approved", "Rejected", "Observations Raised", "In Review", "Clarification Requested", "Verified", "Completed"];

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const { id } = await context.params;
    const application = await getApplication(id);
    if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    if (!canManageApplication(user, application)) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    let body: { status?: unknown };
    try { body = await request.json() as { status?: unknown }; }
    catch { return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 }); }
    if (typeof body.status !== "string" || !statuses.includes(body.status as ApplicationStatus)) {
      return NextResponse.json({ error: "Invalid application status" }, { status: 400 });
    }
    const updatedAt = new Date().toISOString();
    const status = body.status as ApplicationStatus;
    const updated = await updateApplication(id, (current) => ({
      ...current,
      status,
      updatedAt,
      audit: [...current.audit, { id: randomUUID(), action: "status_changed", actorId: user.id, details: `Status changed from ${current.status} to ${status}.`, createdAt: updatedAt }],
    }));
    if (!updated) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    return NextResponse.json({ application: serializeApplication(updated) });
  } catch (error) { return jsonError(error); }
}