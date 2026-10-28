<div align="center">

<img src="https://img.shields.io/badge/VERIFAI-AI%20Verification%20Platform-0b1f3a?style=for-the-badge&labelColor=155eef" alt="VERIFAI" height="40"/>

<br/><br/>

![Next.js](https://img.shields.io/badge/Next.js_15-black?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript_5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-22b5bf?style=flat-square)
![License](https://img.shields.io/badge/SIH_2026-SIH26261-FF6B35?style=flat-square)

<br/>

### 🏛️ AI-Powered Document Verification & Regulatory Compliance Platform
#### Smart India Hackathon 2026 · Problem ID: **SIH26261** · AICTE · Ministry of Education

<br/>

</div>

---

## 🚀 The Problem

AICTE receives **thousands of institutional applications** annually for programme approvals, intake expansions, and accreditation renewals.

The current process is:
- 🐌 **Slow** — Officers manually verify each document (5–7 days avg)
- ❌ **Error-prone** — Fraudulent and expired documents slip through
- 🔍 **Opaque** — Institutions have no visibility into verification status
- 📄 **Untracked** — No immutable record of decisions and evidence

---

## ✅ Our Solution

VERIFAI automates document intake, extracts fields using OCR, generates transparent risk scores, and maintains an immutable audit trail — while keeping final decisions with authorized human officers.

```
Institution uploads docs
        ↓
   File Validation  →  Mock OCR Extraction  →  Field Comparison
        ↓
   Risk Score (0–100)  →  Compliance Check  →  Officer Review
        ↓
   Approve / Reject / Request Info  →  Audit Trail Logged
```

---

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# For demos — production build is much faster
npm run build
npm start

# For development
npm run dev
```

**Open → http://localhost:3000**

---

## 🔑 Demo Accounts

> All accounts — Password: **`Verifai@2026`**

| Role | Email | Access Level |
|:-----|:------|:------------|
| 🔍 AICTE Officer | `officer@aicte.demo` | Review apps · Approve/Reject · AI Workspace |
| 🏛️ Institution Admin | `institution@aicte.demo` | Submit apps · Upload docs · Track status |
| 📋 Auditor | `auditor@aicte.demo` | Read-only · Audit trail · Reports |
| ⚙️ Super Admin | `admin@aicte.demo` | Full access · User management · Settings |

---

## ✨ Features

### 🤖 AI Document Verification
Mock OCR extraction with field-by-field comparison against application data. Detects mismatches, missing fields, and expired certificates.

### 🛡️ Fraud Risk Engine
Every application gets a **risk score from 0–100**, calculated from findings severity (High = +30, Medium = +15, Low = +5). Each finding comes with evidence and explanation.

### ✅ Compliance Monitoring
Automated checks against configurable AICTE requirements. Tracks Compliant / Non-Compliant / Not Assessed status per institution with deadline alerts.

### 📊 Analytics Dashboard
Real-time stats from live data — PieChart for status distribution, BarChart for weekly activity, AreaChart for monthly trends. All powered by **Recharts**.

### 🔄 Application Workflow
Full lifecycle: **Draft → Submitted → Under Review → Approved / Rejected**. Supports officer observations, clarification requests, and document re-uploads.

### 🔒 Security & Audit Trail
HMAC-SHA256 signed session cookies, role-based access control on every API, and an **immutable audit log** of every action that cannot be modified by regular users.

---

## 🗺️ All 13 Screens

| # | Screen | Route | Who Sees It |
|:-:|:-------|:------|:------------|
| 1 | Login | `/login` | Everyone |
| 2 | Dashboard | `/dashboard` | Everyone |
| 3 | Applications | `/applications` | Everyone |
| 4 | Application Detail | `/applications/[id]` | Everyone |
| 5 | New Application | `/applications/new` | Institution Admin |
| 6 | AI Verification Workspace | `/verification` | Officer · Admin |
| 7 | Institutions Directory | `/institutions` | Officer · Admin |
| 8 | Compliance Monitoring | `/compliance` | Everyone |
| 9 | Documents Browser | `/documents` | Everyone |
| 10 | Reports & Analytics | `/reports` | Everyone |
| 11 | Notifications | `/notifications` | Everyone |
| 12 | Audit Trail | `/audit` | Everyone |
| 13 | Administration | `/admin` | Super Admin |

---

## 🏗️ Tech Stack

| Layer | Technology | Why |
|:------|:-----------|:----|
| Framework | Next.js 15 + React 19 | App Router, API routes, SSR |
| Language | TypeScript 5.9 | Type safety across frontend + backend |
| Styling | Custom CSS | No dependencies, full control |
| Charts | Recharts | Pie, Bar, Area charts |
| Auth | HMAC-SHA256 cookies | Secure, stateless sessions |
| Database | JSON flat file | Zero setup for demo |
| Icons | Lucide React | Consistent icon set |

---

## 📁 Project Structure

```
verifai/
├── app/
│   ├── (app)/                  ← All authenticated pages
│   │   ├── layout.tsx          ← Shared sidebar (mounts once, no flicker)
│   │   ├── dashboard/
│   │   ├── applications/
│   │   ├── verification/
│   │   ├── compliance/
│   │   ├── reports/
│   │   ├── notifications/
│   │   ├── audit/
│   │   ├── institutions/
│   │   ├── documents/
│   │   └── admin/
│   ├── (auth)/login/           ← Login page
│   └── api/                    ← All REST API routes
│
├── components/                 ← 14 UI components
│   ├── Shell.tsx               ← Sidebar + topbar
│   ├── Dashboard.tsx           ← Recharts analytics
│   ├── VerificationWorkspace.tsx
│   ├── ApplicationDetail.tsx
│   ├── ComplianceMonitor.tsx
│   └── ...
│
├── lib/
│   ├── auth.ts                 ← Session cookie logic
│   ├── rbac.ts                 ← Role-based permissions
│   ├── types.ts                ← Shared TypeScript types
│   └── data/
│       ├── repository.ts       ← JSON read/write layer
│       └── seed.ts             ← 6 apps · 4 institutions · 7 users
│
└── data/
    └── applications.json       ← Auto-created on first run
```

---

## 🔌 API Reference

| Method | Endpoint | Auth Required | Description |
|:-------|:---------|:-------------:|:------------|
| `POST` | `/api/auth/login` | — | Sign in |
| `POST` | `/api/auth/logout` | — | Sign out |
| `GET` | `/api/auth/session` | ✅ | Current user info |
| `GET` | `/api/applications` | ✅ | List (role-filtered) |
| `POST` | `/api/applications` | ✅ | Create new application |
| `GET` | `/api/applications/[id]` | ✅ | Detail view |
| `PATCH` | `/api/applications/[id]/status` | ✅ | Update status |
| `POST` | `/api/applications/[id]/observations` | ✅ | Add officer note |
| `POST` | `/api/applications/[id]/documents/upload` | ✅ | Upload document |
| `GET` | `/api/institutions` | ✅ | List institutions |
| `GET` | `/api/users` | ✅ Super Admin | User management |

---

## ⚠️ Demo Limitations

| Feature | Demo Status | Production Path |
|:--------|:-----------:|:----------------|
| OCR / Document extraction | 🟡 Mocked | PaddleOCR / AWS Textract |
| External verification | 🔴 Not connected | DigiLocker / MCA21 API |
| Database | 🟡 JSON file | Supabase PostgreSQL |
| File storage | 🔴 Metadata only | Supabase Storage / S3 |
| ML fraud detection | 🟡 Rule-based | Trained ML model |

> All mock data is clearly labeled **"SYNTHETIC DEMO DATA"** throughout the UI.

---

## 🌍 Environment Variables

Create `.env.local` (optional — demo works without it):

```env
VERIFAI_SESSION_SECRET=your-secret-key-minimum-32-characters
```

---

<div align="center">

Built with ❤️ for **Smart India Hackathon 2026**

**Problem ID: SIH26261** · AICTE · Ministry of Education · Government of India

</div>
