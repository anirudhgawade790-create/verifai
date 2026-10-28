# VERIFAI — AI-Powered Document Verification Platform

**Smart India Hackathon 2026 · Problem ID: SIH26261**  
Ministry of Education · AICTE · Institutional Compliance Intelligence

---

## Overview

VERIFAI is a full-stack web application that streamlines AICTE's application validation process using AI-assisted document verification, fraud-risk scoring, and automated compliance monitoring.

**The problem:** AICTE receives thousands of institutional applications annually. Manual document review is slow, error-prone, and lacks traceability.

**Our solution:** An intelligent platform where AI assists officers with document analysis, risk scoring, and compliance checks — while keeping final decisions in human hands.

---

## Getting Started

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Production (faster — use for demos)
npm run build
npm start
```

Open → **http://localhost:3000**

---

## Demo Accounts

All accounts use password: `Verifai@2026`

| Role | Email |
|------|-------|
| AICTE Officer | `officer@aicte.demo` |
| Institution Admin | `institution@aicte.demo` |
| Auditor | `auditor@aicte.demo` |
| Super Admin | `admin@aicte.demo` |

---

## Features

- **AI Document Verification** — OCR field extraction with mismatch detection
- **Fraud Risk Scoring** — 0–100 risk score with evidence-backed findings
- **Compliance Monitoring** — Automated checks against AICTE requirements
- **Application Workflow** — Draft → Submitted → Review → Approved / Rejected
- **Audit Trail** — Immutable log of every action and decision
- **Role-Based Access Control** — 4 roles with distinct permissions
- **Analytics Dashboard** — Real-time charts powered by Recharts
- **Reports & CSV Export** — Filterable reports from live data

---

## Screens

| Screen | Route |
|--------|-------|
| Login | `/login` |
| Dashboard | `/dashboard` |
| Applications List | `/applications` |
| Application Detail | `/applications/[id]` |
| New Application (5-step form) | `/applications/new` |
| AI Verification Workspace | `/verification` |
| Institutions Directory | `/institutions` |
| Compliance Monitoring | `/compliance` |
| Documents Browser | `/documents` |
| Reports & Analytics | `/reports` |
| Notifications | `/notifications` |
| Audit Trail | `/audit` |
| Administration | `/admin` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript |
| Backend | Next.js API Routes |
| Database | JSON flat file (auto-seeded) |
| Auth | HMAC-SHA256 signed session cookies |
| Charts | Recharts |
| Styling | Custom CSS — no Tailwind |

---

## Project Structure

```
├── app/
│   ├── (app)/          ← Authenticated pages with shared sidebar layout
│   ├── (auth)/login/   ← Login page
│   └── api/            ← REST API routes
├── components/         ← 14 UI components
├── lib/
│   ├── auth.ts         ← Session logic
│   ├── rbac.ts         ← Role permissions
│   ├── types.ts        ← TypeScript types
│   └── data/           ← Repository + seed data
└── data/
    └── applications.json  ← Live database (auto-created on first run)
```

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/auth/login` | Sign in |
| `GET` | `/api/auth/session` | Current user |
| `GET` | `/api/applications` | List applications |
| `POST` | `/api/applications` | Create application |
| `GET` | `/api/applications/[id]` | Application detail |
| `PATCH` | `/api/applications/[id]/status` | Update status |
| `POST` | `/api/applications/[id]/observations` | Add observation |
| `POST` | `/api/applications/[id]/documents/upload` | Upload document |
| `GET` | `/api/institutions` | List institutions |
| `GET` | `/api/users` | List users (Super Admin only) |

---

## Environment Variables

Create `.env.local` (optional — demo works without it):

```env
VERIFAI_SESSION_SECRET=your-secret-key-minimum-32-characters
```

---

## Important Notes

- All OCR/AI results are **mock demo data**, clearly labeled in the UI
- Data is stored in a local JSON file — not suitable for production
- No external APIs (DigiLocker, MCA21) are connected in demo mode
- For production: replace JSON store with PostgreSQL/Supabase

---

## License

Built for **Smart India Hackathon 2026** · Problem ID **SIH26261**  
AICTE · Ministry of Education · Government of India
