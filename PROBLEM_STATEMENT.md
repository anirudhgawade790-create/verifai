# Problem Statement & Solution — SIH 2026

## Problem Statement ID: SIH26261

**Organization:** All India Council for Technical Education (AICTE)  
**Ministry:** Ministry of Education, Government of India  
**Category:** Software  
**Theme:** Smart Education

---

## Problem Statement

> **"Design and develop an AI-powered platform for automated application validation, document authentication, and regulatory compliance monitoring for AICTE and affiliated educational institutions."**

### Background

AICTE receives thousands of applications annually from technical institutions seeking:
- New programme approvals
- Intake capacity expansions
- Accreditation renewals
- Regulatory compliance certifications

Currently, the verification process is:
- **Manual and time-consuming** — officers physically verify each document
- **Error-prone** — inconsistencies and fraudulent documents slip through
- **Opaque** — institutions have no visibility into verification status
- **Untracked** — no immutable audit trail of decisions

### Core Challenges

1. **Document Fraud** — Forged certificates, altered approval letters, expired accreditations
2. **Data Inconsistency** — Mismatch between submitted data and supporting documents
3. **Compliance Gaps** — Missing or expired mandatory certificates
4. **Manual Bottlenecks** — Officers overwhelmed with volume, no intelligent triage
5. **Lack of Traceability** — Decisions made without documented evidence chain

---

## Our Solution: VERIFAI

### Approach

VERIFAI provides an end-to-end intelligent verification platform that:

1. **Automates document intake** with structured validation
2. **Applies AI/OCR analysis** to extract and compare document fields
3. **Generates transparent risk scores** with evidence-backed explanations
4. **Enforces compliance rules** automatically against AICTE requirements
5. **Maintains an immutable audit trail** for every decision
6. **Empowers officers** with AI-assisted triage, not AI replacement

### Key Innovation Points

| Challenge | VERIFAI Solution |
|-----------|-----------------|
| Document fraud | Risk scoring with finding-level evidence |
| Data inconsistency | Field-by-field comparison of extracted vs declared data |
| Compliance gaps | Automated checklist against configurable requirements |
| Manual bottleneck | AI triage surfaces high-risk cases first |
| Lack of traceability | Cryptographically-signed audit trail |

---

## System Architecture

```
┌─────────────────────────────────────────────────┐
│                   VERIFAI Platform               │
├──────────────┬──────────────┬───────────────────┤
│   Frontend   │   Backend    │   Data / AI       │
│  Next.js 15  │  API Routes  │  JSON DB + OCR    │
│  React 19    │  Auth (HMAC) │  Mock Adapter     │
│  TypeScript  │  RBAC        │  Risk Engine      │
└──────────────┴──────────────┴───────────────────┘
```

---

## Role-Based User Journeys

### Institution Administrator
1. Register and login to VERIFAI
2. Create new application with institution details
3. Upload supporting documents (PDF, JPG, PNG)
4. Track real-time verification status
5. Respond to officer observations and clarifications
6. Receive approval/rejection notification

### AICTE Verification Officer
1. View dashboard with prioritized pending cases
2. Open AI Verification Workspace for each application
3. Review OCR-extracted fields vs declared data
4. Examine risk findings with evidence
5. Mark findings as confirmed/dismissed
6. Approve, reject, or request additional information
7. All decisions automatically logged in audit trail

### Auditor
1. Access read-only view of all verified applications
2. Review complete audit trail per application
3. Generate compliance reports
4. Export evidence for regulatory review

### Super Admin
1. Manage institutions and user accounts
2. Configure compliance requirements
3. View platform-wide analytics
4. Monitor system health and security events

---

## AI & Document Verification Approach

### What VERIFAI Does (Demo Mode)

```
Document Upload
      ↓
File Validation (type, size, format)
      ↓
Mock OCR Extraction (structured field extraction)
      ↓
Field Comparison (extracted vs application data)
      ↓
Finding Generation (mismatches, missing fields)
      ↓
Risk Score Calculation
  High findings  → +30 points each
  Medium findings → +15 points each
  Low findings   → +5 points each
  Max score: 100
      ↓
Compliance Check (against AICTE requirements)
      ↓
Verification Report (with evidence)
```

### Honest Limitations (Demo)
- OCR is **mocked** — no real PaddleOCR/Tesseract connected
- No external verification API (MCA21, DigiLocker, etc.)
- All "extracted" data is synthetic demo data
- Risk scores are illustrative, not forensic
- Clearly labeled throughout UI: **"SYNTHETIC DEMO DATA"**

### Production Extension Path
- Replace mock OCR with **PaddleOCR** or **AWS Textract**
- Connect to **DigiLocker API** for official document verification
- Integrate **MCA21** for company/institution registration checks
- Add **ML model** for image tampering detection
- Deploy on **Supabase** (PostgreSQL + Auth + Storage)

---

## Compliance Framework

VERIFAI checks applications against:

1. Evidence document submission (approval letters, accreditation certs)
2. Institutional declarations completeness
3. Certificate validity dates (expired document detection)
4. Faculty count consistency (declared vs documented)
5. Infrastructure evidence (lab inventory, facilities report)
6. Financial compliance records

---

## Security Measures

- HMAC-SHA256 signed session cookies (httpOnly, sameSite)
- Role-based access control on every API route
- Input validation on all endpoints
- File type and size validation on uploads
- No plaintext passwords in production
- Audit trail cannot be modified by regular users

---

## Impact & Scalability

| Metric | Manual Process | With VERIFAI |
|--------|---------------|--------------|
| Average review time | 5–7 days | < 24 hours |
| Document fraud detection | Manual spot-check | Automated for every submission |
| Compliance tracking | Spreadsheets | Real-time dashboard |
| Audit trail | Paper-based | Digital, immutable |
| Officer capacity | ~50 apps/month | ~500+ apps/month |

---

## Team

**Project:** VERIFAI  
**Hackathon:** Smart India Hackathon 2026  
**Problem ID:** SIH26261  
**Domain:** EdTech / GovTech / AI
