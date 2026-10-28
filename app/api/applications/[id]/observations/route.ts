import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getSessionUser } from "@/lib/auth";
import { getApplication, updateApplication } from "@/lib/data/repository";
import { canRaiseObservation } from "@/lib/rbac";
import { jsonError, serializeApplication } from "@/lib/api";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const { id } = await context.params;
    const application = await getApplication(id);
    if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    if (!canRaiseObservation(user, application)) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    let body: { text?: unknown };
    try { body = await request.json() as { text?: unknown }; }
    catch { return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 }); }
    if (typeof body.text !== "string" || body.text.trim().length < 3) {
      return NextResponse.json({ error: "Observation text must be at least 3 characters" }, { status: 400 });
    }
    const text = body.text.trim();
    const createdAt = new Date().toISOString();
    const updated = await updateApplication(id, (current) => ({
      ...current,
      observations: [...current.observations, { id: randomUUID(), authorId: user.id, message: text, createdAt }],
      audit: [...current.audit, { id: randomUUID(), action: "observation_added", actorId: user.id, details: "Observation added by authorized user.", createdAt }],
      updatedAt: createdAt,
    }));
    if (!updated) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    return NextResponse.json({ application: serializeApplication(updated) }, { status: 201 });
  } catch (error) { return jsonError(error); }
}