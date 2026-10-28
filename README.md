<div align="center">

<br/>

```
██╗   ██╗███████╗██████╗ ██╗███████╗ █████╗ ██╗
██║   ██║██╔════╝██╔══██╗██║██╔════╝██╔══██╗██║
██║   ██║█████╗  ██████╔╝██║█████╗  ███████║██║
╚██╗ ██╔╝██╔══╝  ██╔══██╗██║██╔══╝  ██╔══██║██║
 ╚████╔╝ ███████╗██║  ██║██║██║     ██║  ██║██║
  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚═╝╚═╝     ╚═╝  ╚═╝╚═╝
```

### AI-Powered Document Verification & Compliance Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![SIH 2026](https://img.shields.io/badge/SIH_2026-SIH26261-FF6B35?style=for-the-badge)](https://sih.gov.in/)

<br/>

> **Built for Smart India Hackathon 2026**  
> Ministry of Education · AICTE · Problem ID: SIH26261

<br/>

</div>

---

## 🚀 What is VERIFAI?

VERIFAI is an intelligent verification platform designed for **AICTE** and affiliated educational institutions. It combines AI-assisted OCR, fraud-risk scoring, and automated compliance monitoring to transform a slow, manual document review process into a fast, transparent, and evidence-backed workflow.

```
Institution submits docs  →  AI extracts & compares  →  Risk score generated
         ↓                                                       ↓
  Officer reviews findings  →  Approves / Rejects  →  Audit trail logged
```

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Build for production
npm run build

# 3. Start the server
npm start

# Open → http://localhost:3000
```

> **Dev mode** (with hot reload): `npm run dev`

---

## 🔑 Demo Accounts

> All accounts → Password: **`Verifai@2026`**

| Role | Email | What they can do |
|------|-------|-----------------|
| 🔍 **AICTE Officer** | `officer@aicte.demo` | Review apps, verify docs, approve/reject |
| 🏛️ **Institution Admin** | `institution@aicte.demo` | Submit apps, upload docs, track status |
| 📋 **Auditor** | `auditor@aicte.demo` | Read-only audit trail & reports |
| ⚙️ **Super Admin** | `admin@aicte.demo` | Full platform access, user management |

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🤖 AI Document Verification
- Mock OCR field extraction
- Field-by-field comparison
- Mismatch & fraud detection
- Confidence scoring per document

</td>
<td width="50%">

### 🛡️ Fraud Risk Engine
- Risk score 0–100
- High / Medium / Low findings
- Evidence-linked explanations
- Explainable AI results

</td>
</tr>
<tr>
<td>

### ✅ Compliance Monitoring
- Automated AICTE requirement checks
- Expired certificate detection
- Missing document alerts
- Institution-wise compliance score

</td>
<td>

### 📊 Analytics Dashboard
- Real-time stats from live data
- Recharts: Pie, Bar, Area charts
- Monthly verification trends
- High-risk case prioritization

</td>
</tr>
<tr>
<td>

### 🔄 Application Workflow
- Multi-step submission form
- Status: Draft → Approved/Rejected
- Officer observations
- Resubmission support

</td>
<td>

### 🔒 Security & Audit
- HMAC-SHA256 session cookies
- Role-based access control
- Immutable audit trail
- Input & file validation

</td>
</tr>
</table>

---

## 🗺️ Screens

| # | Screen | Route | Roles |
|---|--------|-------|-------|
| 1 | Login | `/login` | All |
| 2 | Dashboard | `/dashboard` | All |
| 3 | Applications List | `/applications` | All |
| 4 | Application Detail | `/applications/[id]` | All |
| 5 | New Application | `/applications/new` | Institution Admin |
| 6 | AI Verification Workspace | `/verification` | Officer, Admin |
| 7 | Institutions Directory | `/institutions` | Officer, Admin |
| 8 | Compliance Monitoring | `/compliance` | All |
| 9 | Documents Browser | `/documents` | All |
| 10 | Reports & Analytics | `/reports` | All |
| 11 | Notifications | `/notifications` | All |
| 12 | Audit Trail | `/audit` | All |
| 13 | Administration | `/admin` | Super Admin |

---

## 🏗️ Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│                      VERIFAI Stack                       │
├─────────────────┬───────────────────┬───────────────────┤
│    Frontend     │      Backend      │    Data / AI      │
│                 │                   │                   │
│  Next.js 15     │  Next.js API      │  JSON flat file   │
│  React 19       │  Routes           │  (auto-seeded)    │
│  TypeScript     │  HMAC-SHA256      │                   │
│  Custom CSS     │  Auth cookies     │  Mock OCR         │
│  Recharts       │  RBAC middleware  │  adapter          │
│  Lucide Icons   │  Input validation │  Risk engine      │
└─────────────────┴───────────────────┴───────────────────┘
```

---

## 📁 Project Structure

```
e:\sih 2026 2.0\
│
├── app/
│   ├── (app)/              ← All authenticated pages
│   │   ├── layout.tsx      ← Shared Shell (sidebar stays stable)
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
│   ├── (auth)/login/       ← Login page
│   └── api/                ← All backend API routes
│
├── components/             ← 14 UI components
│   ├── Shell.tsx           ← Sidebar + topbar layout
│   ├── Dashboard.tsx       ← Recharts analytics
│   ├── ApplicationDetail.tsx
│   ├── VerificationWorkspace.tsx
│   ├── ComplianceMonitor.tsx
│   └── ...
│
├── lib/
│   ├── auth.ts             ← Session cookie logic
│   ├── rbac.ts             ← Role permissions
│   ├── types.ts            ← TypeScript types
│   └── data/
│       ├── repository.ts   ← JSON read/write layer
│       └── seed.ts         ← 6 demo apps, 4 institutions, 7 users
│
└── data/
    └── applications.json   ← Live database (auto-created on first run)
```

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/login` | ❌ | Sign in |
| `POST` | `/api/auth/logout` | ❌ | Sign out |
| `GET` | `/api/auth/session` | ✅ | Current user |
| `GET` | `/api/applications` | ✅ | List applications |
| `POST` | `/api/applications` | ✅ | Create application |
| `GET` | `/api/applications/[id]` | ✅ | Application detail |
| `PATCH` | `/api/applications/[id]/status` | ✅ | Update status |
| `POST` | `/api/applications/[id]/observations` | ✅ | Add observation |
| `POST` | `/api/applications/[id]/documents/upload` | ✅ | Upload document |
| `GET` | `/api/institutions` | ✅ | List institutions |
| `GET` | `/api/users` | ✅ Super Admin | List users |

---

## 🌍 Environment Variables

Create `.env.local` (optional — demo works without it):

```env
VERIFAI_SESSION_SECRET=your-super-secret-key-minimum-32-chars
```

---

## ⚠️ Honest Limitations

- 🔬 **OCR is mocked** — All extracted data is synthetic demo data, clearly labeled in UI
- 🗄️ **JSON database** — Not suitable for production; replace with PostgreSQL/Supabase
- 🔗 **No external APIs** — DigiLocker, MCA21, etc. not connected
- 🤖 **No real ML model** — Risk scores are rule-based on finding severity

---

## 🗺️ Production Roadmap

```
Demo (Now)          →    v1.0                →    v2.0
──────────────           ──────────────           ──────────────
Mock OCR                 PaddleOCR / Textract     ML Fraud Detection
JSON flat file           Supabase PostgreSQL       Real-time collab
Rule-based risk          DigiLocker API           Mobile app
Static seed data         Live institution DB       LLM analysis
```

---

## 📜 License

Built for **Smart India Hackathon 2026** · Problem ID **SIH26261**  
AICTE · Ministry of Education · Government of India

---

<div align="center">

Made with ❤️ for SIH 2026

**[Dashboard](http://localhost:3000/dashboard)** · **[Login](http://localhost:3000/login)** · **[API](http://localhost:3000/api/applications)**

</div>
#   v e r i f a i  
 