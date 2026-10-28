'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Status } from './Dashboard';

type Finding = { id: string; title: string; severity: string; status: string; description?: string; explanation?: string; createdAt?: string };
type ComplianceItem = { id: string; requirement?: string; label?: string; status: string; evidence?: string };
type Observation = { id: string; message?: string; text?: string; createdAt: string };
type Document = { id: string; name: string; type: string; status: string; filename: string; extracted?: Record<string, string>; mock: boolean; mockExtraction?: { label?: string } };
type AuditEntry = { id: string; action: string; actor: string; at: string; details: string };

type AppRow = {
  id: string;
  institution: string;
  category: string;
  status: string;
  submitted: string;
  assignedOfficer: string;
  findings: Finding[];
  documents: Document[];
};

type AppDetail = AppRow & {
  rules: ComplianceItem[];
  observations: Observation[];
  audit: AuditEntry[];
};

const REVIEW_STATUSES = ['Submitted', 'Under Review', 'Verification Pending', 'Observations Raised', 'In Review'];

function calcRisk(findings: { severity: string }[]) {
  return Math.min(100, findings.reduce((s, f) => s + (f.severity === 'High' ? 30 : f.severity === 'Medium' ? 15 : 5), 0));
}

function riskLevel(score: number) {
  return score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low';
}

function normalizeApp(a: any): AppDetail {
  return {
    id: a.id,
    institution: a.institutionName || a.institution || 'Institution',
    category: a.category || a.programme || 'Application',
    status: a.status,
    submitted: a.submittedAt || a.submitted,
    assignedOfficer: a.assignedOfficer || 'Unassigned',
    findings: (a.findings || []).map((f: any) => ({
      id: f.id,
      title: f.title || f.description || 'Finding',
      severity: f.severity || 'Medium',
      status: f.status || 'Open',
      description: f.description || f.explanation || '',
      createdAt: f.createdAt || new Date().toISOString(),
    })),
    documents: (a.documents || []).map((d: any) => ({
      id: d.id,
      name: d.name || d.type || 'Document',
      type: d.type || 'Document',
      status: d.status,
      filename: d.filename || d.name || 'file.pdf',
      extracted: d.extracted || d.metadata || {},
      mock: d.mock !== false,
      mockExtraction: d.mockExtraction,
    })),
    rules: (a.compliance || a.rules || []).map((r: any) => ({
      id: r.id,
      requirement: r.requirement,
      label: r.label || r.requirement,
      status: r.status,
      evidence: r.evidence || '',
    })),
    observations: (a.observations || []).map((o: any) => ({
      id: o.id,
      message: o.message || o.text || '',
      createdAt: o.createdAt,
    })),
    audit: (a.audit || []).map((e: any) => ({
      id: e.id,
      action: e.action,
      actor: e.actor || e.actorId || 'System',
      at: e.at || e.createdAt,
      details: e.details || '',
    })),
  };
}

// ─── LIST VIEW ───────────────────────────────────────────────────────────────

function ListView() {
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/applications')
      .then((r) => r.ok ? r.json() : { applications: [] })
      .then((d) => {
        const list = (d.applications || []).map((a: any) => ({
          id: a.id,
          institution: a.institutionName || a.institution || 'Institution',
          category: a.category || a.programme || 'N/A',
          status: a.status,
          submitted: a.submittedAt || a.submitted,
          assignedOfficer: a.assignedOfficer || 'Unassigned',
          findings: a.findings || [],
          documents: a.documents || [],
        }));
        setApps(list.filter((a: AppRow) => REVIEW_STATUSES.includes(a.status)));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="breadcrumb">WORKSPACE / VERIFICATION</div>
          <h1>AI Verification Workspace</h1>
          <p>Applications requiring officer review</p>
        </div>
      </div>
      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>App ID</th>
                <th>Institution</th>
                <th>Programme</th>
                <th>Status</th>
                <th>Risk Score</th>
                <th>Assigned Officer</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => {
                const score = calcRisk(a.findings);
                const level = riskLevel(score);
                return (
                  <tr key={a.id}>
                    <td><Link href={`/verification/${encodeURIComponent(a.id)}`}><b>{a.id}</b></Link></td>
                    <td>{a.institution}</td>
                    <td>{a.category}</td>
                    <td><Status value={a.status} /></td>
                    <td><span className={`risk-score ${level}`}>{score}</span></td>
                    <td>{a.assignedOfficer}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && apps.length === 0 && <div className="empty">No applications pending verification</div>}
        </div>
      </section>
    </>
  );
}

// ─── DETAIL VIEW ─────────────────────────────────────────────────────────────

function DetailView({ focusId }: { focusId: string }) {
  const [app, setApp] = useState<AppDetail | null>(null);
  const [confirm, setConfirm] = useState<null | 'approve' | 'reject'>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [detailTab, setDetailTab] = useState<'Findings' | 'Compliance' | 'Observations'>('Findings');

  async function loadApp() {
    const r = await fetch(`/api/applications/${focusId}`);
    if (r.ok) {
      const d = await r.json();
      if (d.application) setApp(normalizeApp(d.application));
    }
  }

  useEffect(() => { loadApp(); }, [focusId]);

  async function doApprove() {
    setBusy(true);
    await fetch(`/api/applications/${focusId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Approved' }),
    });
    setNotice('Status updated.');
    setConfirm(null);
    await loadApp();
    setBusy(false);
  }

  async function doReject() {
    setBusy(true);
    await fetch(`/api/applications/${focusId}/observations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: rejectReason }),
    });
    await fetch(`/api/applications/${focusId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Rejected' }),
    });
    setNotice('Status updated.');
    setConfirm(null);
    setRejectReason('');
    await loadApp();
    setBusy(false);
  }

  if (!app) return <div className="panel empty">Loading application…</div>;

  const score = calcRisk(app.findings);
  const level = riskLevel(score);
  const locked = app.status === 'Approved' || app.status === 'Rejected';

  return (
    <>
      <div className="page-heading detail-heading">
        <div>
          <div className="breadcrumb">VERIFICATION / {app.id}</div>
          <h1>{app.institution}</h1>
          <p>{app.category}</p>
        </div>
        <div className="heading-actions">
          <Status value={app.status} />
          <span className={`risk-score ${level}`}>Risk: {score}</span>
          <button className="primary compact" disabled={locked || busy} onClick={() => setConfirm('approve')}>
            Approve
          </button>
          <button className="secondary" disabled={locked || busy} onClick={() => setConfirm('reject')}>
            Reject
          </button>
        </div>
      </div>

      {notice && <div className="notice">✓ {notice}</div>}

      {confirm === 'approve' && (
        <div className="confirm-dialog" onClick={() => setConfirm(null)}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm approval</h3>
            <p>Approve this application? Status will be set to Approved.</p>
            <div className="dialog-actions">
              <button className="secondary" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="primary compact" disabled={busy} onClick={doApprove}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {confirm === 'reject' && (
        <div className="confirm-dialog" onClick={() => setConfirm(null)}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm rejection</h3>
            <p>Reject this application? Provide a reason below (required).</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (min 10 characters)…"
              style={{ width: '100%', marginTop: 8, padding: '8px', minHeight: 80 }}
            />
            <div className="dialog-actions">
              <button className="secondary" onClick={() => setConfirm(null)}>Cancel</button>
              <button
                className="primary compact"
                disabled={busy || rejectReason.trim().length < 10}
                onClick={doReject}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="two-col" style={{ marginTop: 16 }}>
        {/* Left: Documents */}
        <section className="panel">
          <div className="panel-head"><h2>Documents</h2></div>
          {app.documents.length === 0 && <div className="empty">No documents uploaded</div>}
          {app.documents.map((doc) => (
            <div key={doc.id} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <strong>{doc.name}</strong>
                <Status value={doc.status} />
              </div>
              <div className="mock" style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>
                MOCK / DEMO DATA — SYNTHETIC DEMO DATA — not for verification
              </div>
              {doc.extracted && Object.keys(doc.extracted).length > 0 && (
                <dl className="facts">
                  {Object.entries(doc.extracted).map(([k, v]) => (
                    <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                  ))}
                </dl>
              )}
            </div>
          ))}
        </section>

        {/* Right: Tabs */}
        <section className="panel">
          <div className="detail-tabs">
            {(['Findings', 'Compliance', 'Observations'] as const).map((t) => (
              <button key={t} className={detailTab === t ? 'active' : ''} onClick={() => setDetailTab(t)}>{t}</button>
            ))}
          </div>

          {detailTab === 'Findings' && (
            <div className="finding-list" style={{ marginTop: 12 }}>
              {app.findings.length === 0 && <div className="empty">No findings</div>}
              {app.findings.map((f) => (
                <article key={f.id} style={{ marginBottom: 12 }}>
                  <div className={`severity ${f.severity.toLowerCase()}`}>{f.severity}</div>
                  <div>
                    <b>{f.title}</b>
                    <p>{f.description}</p>
                  </div>
                </article>
              ))}
            </div>
          )}

          {detailTab === 'Compliance' && (
            <div className="rule-list" style={{ marginTop: 12 }}>
              {app.rules.length === 0 && <div className="empty">No compliance items</div>}
              {app.rules.map((r) => (
                <div key={r.id} style={{ marginBottom: 10 }}>
                  <Status value={r.status} />
                  <div>
                    <b>{r.label || r.requirement}</b>
                    {r.evidence && <p style={{ fontSize: 12, color: '#666' }}>{r.evidence}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {detailTab === 'Observations' && (
            <div style={{ marginTop: 12 }}>
              {app.observations.length === 0 && <div className="empty">No observations recorded</div>}
              {app.observations.map((o) => (
                <div key={o.id} style={{ marginBottom: 10, padding: '8px', background: '#f8f9fb', borderRadius: 6 }}>
                  <p style={{ margin: 0 }}>{o.message}</p>
                  <small style={{ color: '#888' }}>{new Date(o.createdAt).toLocaleString('en-IN')}</small>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────

export default function VerificationWorkspace({ focusId }: { focusId?: string }) {
  if (focusId) return <DetailView focusId={focusId} />;
  return <ListView />;
}
