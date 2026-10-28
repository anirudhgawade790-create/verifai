import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { addDocument, getApplication, updateApplication } from "@/lib/data/repository";
import { canManageApplication } from "@/lib/rbac";
import { jsonError, serializeApplication } from "@/lib/api";
import type { Document } from "@/lib/types";

const allowed = new Map([
  [".pdf", "application/pdf"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
]);

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const { id } = await context.params;
    const application = await getApplication(id);
    if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    if (!canManageApplication(user, application)) return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return NextResponse.json({ error: "A multipart form-data upload is required" }, { status: 400 });
    }
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Document file is required" }, { status: 400 });
    if (file.size > 15 * 1024 * 1024) return NextResponse.json({ error: "File exceeds the 15 MB limit" }, { status: 413 });

    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    const expectedMime = allowed.get(extension);
    if (!expectedMime || file.type !== expectedMime) {
      return NextResponse.json({ error: "Only PDF, JPG, JPEG or PNG files are accepted" }, { status: 415 });
    }

    const uploadedAt = new Date().toISOString();
    const document: Document = {
      id: randomUUID(),
      applicationId: id,
      name: file.name,
      filename: file.name,
      type: "Unverified upload metadata",
      status: "Verification Pending",
      extracted: {},
      mock: true,
      mimeType: expectedMime as Document["mimeType"],
      size: file.size,
      uploadedAt,
      uploadedBy: user.id,
      mockExtraction: {
        mode: "mock",
        status: "Demo processing complete",
        label: "SYNTHETIC DEMO DATA — not for verification",
        institutionName: application.institutionName,
        documentType: "Unverified upload metadata",
        confidence: 0.72,
      },
    };
    const updated = await addDocument(id, document);
    const auditAdded = await updateApplication(id, (current) => ({
      ...current,
      audit: [...current.audit, { id: randomUUID(), action: "document_uploaded", actorId: user.id, details: `Metadata recorded for ${document.name}; file content was not stored.`, createdAt: uploadedAt }],
    }));
    if (!auditAdded) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    return NextResponse.json({ application: serializeApplication(auditAdded) }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
