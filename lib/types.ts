export type Role = "Super Admin" | "AICTE Officer" | "Institution Admin" | "Auditor";
export type ApplicationStatus =
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Verification Pending"
  | "Approved"
  | "Rejected"
  | "Observations Raised"
  | "In Review"
  | "Clarification Requested"
  | "Verified"
  | "Completed";
export type DocumentStatus = "Verified" | "Expired" | "Mismatch Detected" | "Verification Pending" | "Manual Review Required";

export interface Institution {
  id: string;
  name: string;
  type: "University" | "College";
  state: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  institutionId?: string;
}

export interface Document {
  id: string;
  applicationId: string;
  name: string;
  filename: string;
  type: string;
  status: DocumentStatus;
  extracted: Record<string, string>;
  mock: boolean;
  mimeType: "application/pdf" | "image/jpeg" | "image/png";
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  mockExtraction: {
    mode: "mock";
    status: "Demo processing complete";
    label: "SYNTHETIC DEMO DATA — not for verification";
    institutionName?: string;
    documentType?: string;
    confidence: number;
  };
}

export interface Finding {
  id: string;
  title: string;
  severity: "Low" | "Medium" | "High";
  status: "Open" | "Resolved";
  description: string;
  evidenceDocumentId?: string;
  createdAt: string;
}

export interface ComplianceItem {
  id: string;
  requirement: string;
  status: "Compliant" | "Non-compliant" | "Not Assessed";
  evidenceDocumentId?: string;
}

export interface Observation {
  id: string;
  authorId: string;
  message: string;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  action: "status_changed" | "observation_added" | "document_uploaded";
  actorId: string;
  details: string;
  createdAt: string;
}

export interface Application {
  id: string;
  name: string;
  institutionId: string;
  institutionName: string;
  programme: string;
  status: ApplicationStatus;
  submittedAt: string;
  updatedAt: string;
  ownerId: string;
  assignedAuditorId?: string;
  documents: Document[];
  findings: Finding[];
  compliance: ComplianceItem[];
  observations: Observation[];
  audit: AuditEntry[];
}

export interface Database {
  institutions: Institution[];
  users: User[];
  applications: Application[];
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  institutionId?: string;
}
