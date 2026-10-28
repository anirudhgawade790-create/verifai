import { NextResponse } from "next/server";
import type { Application, Document } from "./types";

export function serializeDocument(document: Document) {
  return {
    ...document,
    filename: document.filename || document.name,
    extracted: document.extracted || {},
    mock: document.mock ?? true,
  };
}

export function serializeApplication(application: Application) {
  const documents = application.documents.map(serializeDocument);
  return {
    ...application,
    institution: application.institutionName,
    category: application.programme,
    submitted: application.submittedAt,
    assignedOfficer: application.assignedAuditorId ? "AICTE Verification Officer" : "Unassigned",
    documents,
    findings: application.findings.map((finding) => ({
      ...finding,
      explanation: finding.description,
      evidence: documents.find((document) => document.id === finding.evidenceDocumentId)?.name || "No linked evidence document",
    })),
    rules: application.compliance.map((item) => ({
      ...item,
      label: item.requirement,
      evidence: documents.find((document) => document.id === item.evidenceDocumentId)?.name || "Institution declaration",
    })),
    audit: application.audit.map((entry) => ({ ...entry, actor: entry.actorId, at: entry.createdAt })),
  };
}

export function jsonError(error: unknown) {
  const status = error instanceof Object && "status" in error && typeof error.status === "number" ? error.status : 500;
  const message = status >= 500 ? "Internal server error" : error instanceof Error ? error.message : "Request failed";
  return NextResponse.json({ error: message }, { status });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}