import type { Application, Database, Document, DocumentStatus } from "../types";

const now = "2026-10-28T12:00:00.000Z";
const institutions = [
  { id: "inst-001", name: "Vidya Meridian Institute of Technology", type: "College" as const, state: "Maharashtra" },
  { id: "inst-002", name: "Northstar School of Engineering", type: "College" as const, state: "Tamil Nadu" },
  { id: "inst-003", name: "Aarohan State University", type: "University" as const, state: "Karnataka" },
  { id: "inst-004", name: "Eastern Research Institute", type: "College" as const, state: "West Bengal" },
];

const users = [
  { id: "usr-super", name: "Asha Menon", email: "admin@aicte.demo", password: "Verifai@2026", role: "Super Admin" as const },
  { id: "usr-officer", name: "Kabir Rao", email: "officer@aicte.demo", password: "Verifai@2026", role: "AICTE Officer" as const },
  { id: "usr-inst-1", name: "Neha Kapoor", email: "institution@aicte.demo", password: "Verifai@2026", role: "Institution Admin" as const, institutionId: "inst-001" },
  { id: "usr-inst-2", name: "Dev Narayan", email: "admin2@demo.institution", password: "Verifai@2026", role: "Institution Admin" as const, institutionId: "inst-002" },
  { id: "usr-inst-3", name: "Maya Iyer", email: "admin3@demo.institution", password: "Verifai@2026", role: "Institution Admin" as const, institutionId: "inst-003" },
  { id: "usr-inst-4", name: "Ishita Sen", email: "admin4@demo.institution", password: "Verifai@2026", role: "Institution Admin" as const, institutionId: "inst-004" },
  { id: "usr-auditor", name: "Ravi Deshmukh", email: "auditor@aicte.demo", password: "Verifai@2026", role: "Auditor" as const },
];

const app = (values: Omit<Application, "documents" | "findings" | "compliance" | "observations" | "audit">): Application => ({
  ...values,
  documents: [],
  findings: [],
  compliance: [],
  observations: [],
  audit: [{ id: `audit-${values.id}-created`, action: "status_changed", actorId: values.ownerId, details: `Synthetic application created with status ${values.status}.`, createdAt: values.submittedAt }],
});

const document = (application: Application, values: { name: string; type: string; status: DocumentStatus; filename: string; uploader: string; size: number; institutionName?: string }): Document => ({
  id: `doc-${application.id.toLowerCase()}`,
  applicationId: application.id,
  name: values.name,
  filename: values.filename,
  type: values.type,
  status: values.status,
  mimeType: "application/pdf",
  size: values.size,
  uploadedAt: application.submittedAt,
  uploadedBy: values.uploader,
  extracted: {
    "Institution": values.institutionName ?? application.institutionName,
    "Academic year": "2026–27",
    "Programme": application.programme,
  },
  mock: true,
  mockExtraction: {
    mode: "mock",
    status: "Demo processing complete",
    label: "SYNTHETIC DEMO DATA — not for verification",
    institutionName: values.institutionName ?? application.institutionName,
    documentType: values.type,
    confidence: values.status === "Verified" ? 0.96 : 0.72,
  },
});

const cases = [
  { id: "APP-2026-001", name: "B.Tech Computer Science Extension", institutionId: "inst-001", programme: "B.Tech – Computer Science and Engineering", status: "Under Review", submittedAt: "2026-09-12T08:30:00.000Z", ownerId: "usr-inst-1", auditor: true, document: { name: "AICTE approval letter", type: "Approval Letter", status: "Verified", filename: "approval-letter-2026.pdf", uploader: "usr-inst-1", size: 482100 }, finding: undefined },
  { id: "APP-2026-002", name: "AI and Data Science Programme Approval", institutionId: "inst-002", programme: "B.Tech – Artificial Intelligence & Data Science", status: "Verification Pending", submittedAt: "2026-09-18T10:15:00.000Z", ownerId: "usr-inst-2", auditor: true, document: { name: "Faculty roster and qualifications", type: "Faculty Roster", status: "Mismatch Detected", filename: "faculty-roster-2026.pdf", uploader: "usr-inst-2", size: 731000 }, finding: ["Faculty count differs from application declaration", "Medium", "Open", "Submitted roster lists 38 faculty; application declares 42."] },
  { id: "APP-2026-003", name: "New MBA Programme", institutionId: "inst-003", programme: "MBA – Innovation and Entrepreneurship", status: "Submitted", submittedAt: "2026-10-02T09:45:00.000Z", ownerId: "usr-inst-3", auditor: false, document: { name: "Infrastructure and facilities report", type: "Infrastructure Report", status: "Verification Pending", filename: "infrastructure-report-2026.pdf", uploader: "usr-inst-3", size: 1050000 }, finding: undefined },
  { id: "APP-2026-004", name: "Mechanical Engineering Capacity Renewal", institutionId: "inst-004", programme: "B.Tech – Mechanical Engineering", status: "Observations Raised", submittedAt: "2026-08-21T11:00:00.000Z", ownerId: "usr-inst-4", auditor: true, document: { name: "Laboratory equipment inventory", type: "Equipment Inventory", status: "Manual Review Required", filename: "mechanical-lab-inventory-2026.pdf", uploader: "usr-inst-4", size: 918000 }, finding: ["Lab capacity evidence requires review", "High", "Open", "Inventory details require manual confirmation by the assigned officer."] },
  { id: "APP-2026-005", name: "Intake Expansion Review", institutionId: "inst-001", programme: "MCA – 120 additional seats", status: "Approved", submittedAt: "2026-06-14T07:20:00.000Z", ownerId: "usr-inst-1", auditor: true, document: { name: "Fire safety certificate", type: "Safety Certificate", status: "Expired", filename: "fire-safety-certificate-2024.pdf", uploader: "usr-inst-1", size: 343000 }, finding: ["Fire safety certificate has expired", "High", "Open", "Certificate validity ended on 31 March 2026."] },
  { id: "APP-2026-006", name: "Applied Sciences Programme Revision", institutionId: "inst-002", programme: "M.Sc – Applied Sciences", status: "Rejected", submittedAt: "2026-07-03T13:10:00.000Z", ownerId: "usr-inst-2", auditor: false, document: { name: "Institutional identity and accreditation", type: "Accreditation Certificate", status: "Verified", filename: "accreditation-certificate-2026.pdf", uploader: "usr-inst-2", size: 625000 }, finding: undefined },
] as const;

export const demoData: Database = {
  institutions,
  users,
  applications: cases.map((item, index) => {
    const institution = institutions.find((value) => value.id === item.institutionId)!;
    const application = app({
      id: item.id,
      name: item.name,
      institutionId: item.institutionId,
      institutionName: institution.name,
      programme: item.programme,
      status: item.status,
      submittedAt: item.submittedAt,
      updatedAt: now,
      ownerId: item.ownerId,
      ...(item.auditor ? { assignedAuditorId: "usr-auditor" } : {}),
    });
    const evidence = document(application, { ...item.document, institutionName: index === 1 ? "Northstar Institute of Engineering" : undefined });
    const finding = item.finding ? [{
      id: `find-${item.id.toLowerCase()}`,
      title: item.finding[0],
      severity: item.finding[1] as "Low" | "Medium" | "High",
      status: item.finding[2] as "Open" | "Resolved",
      description: item.finding[3],
      createdAt: now,
      evidenceDocumentId: evidence.id,
    }] : [];
    const compliance = [
      {
        id: `comp-${index}-evidence`,
        requirement: `${item.document.type} evidence review`,
        status: (evidence.status === "Verified" ? "Compliant" : evidence.status === "Verification Pending" || evidence.status === "Manual Review Required" ? "Not Assessed" : "Non-compliant") as "Compliant" | "Non-compliant" | "Not Assessed",
        evidenceDocumentId: evidence.id,
      },
      {
        id: `comp-${index}-declaration`,
        requirement: "Institutional declarations complete",
        status: (index === 2 ? "Not Assessed" : "Compliant") as "Compliant" | "Not Assessed",
      },
    ];
    return { ...application, documents: [evidence], findings: finding, compliance };
  }),
};