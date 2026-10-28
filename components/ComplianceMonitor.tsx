'use client';
import { useEffect, useMemo, useState } from 'react';
import { Status } from './Dashboard';

type ComplianceItem = { id: string; status: string };
type AppRow = {
  id: string;
  institution: string;
  category: string;
  status: string;
  updatedAt: string;
  rules: ComplianceItem[];
};

const DEADLINES = [
  { date: '2026-12-31', desc: 'Annual compliance declaration due', days: 64 },
  { date: '2027-01-31', desc: 'Infrastructure audit submission', days: 95 },
  { date: '2027-03-15', desc: 'Faculty qualification verification', days: 138 },
];

function appCompliance(app: AppRow): 'Compliant' | 'Non-compliant' | 'Not Assessed' {
  if (!app.rules || app.rules.length === 0) return 'Not Assessed';
  if (app.rules.every((r) => r.status === 'Compliant')) return 'Compliant';
  if (app.rules.some((r) => r.status === 'Non-compliant')) return 'Non-compliant';
  return 'Not Assessed';
}

function deadlineSeverity(days: number) {
  if (days < 30) return 'high';
  if (days < 90) return 'medium';
  return 'low';
}

export default function ComplianceMonitor() {
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetch('/api/applications')
      .then((r) => r.ok ? r.json() : { applications: [] })
      .then((d) => {
        setApps(
          (d.applications || []).map((a: any) => ({
            id: a.id,
            institution: a.institutionName || a.institution || 'Institution',
            category: a.category || a.programme || 'N/A',
            status: a.status,
            updatedAt: a.updatedAt || a.submittedAt || a.submitted,
            rules: (a.compliance || a.rules || []).map((r: any) => ({
              id: r.id,
              status: r.status,
            })),
          }))
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const compliant = apps.filter((a) => appCompliance(a) === 'Compliant').length;
    const nonCompliant = apps.filter((a) => appCompliance(a) === 'Non-compliant').length;
    const notAssessed = apps.filter((a) => appCompliance(a) === 'Not Assessed').length;
    const rate = apps.length ? Math.round((compliant / apps.length) * 100) : 0;
    return { rate, total: apps.length, issues: nonCompliant, notAssessed };
  }, [apps]);

  const filtered = useMemo(() => {
    if (filter === 'All') return apps;
    return apps.filter((a) => appCompliance(a) === filter);
  }, [apps, filter]);

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="breadcrumb">WORKSPACE / COMPLIANCE</div>
          <h1>Compliance Monitor</h1>
          <p>Regulatory compliance status across all applications</p>
        </div>
      </div>

      {loading ? (
        <div className="stat-grid">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="stat skeleton" style={{ minHeight: 80, background: '#f0f2f5', borderRadius: 8 }} />
          ))}
        </div>
      ) : (
        <div className="stat-grid">
          <div className="stat"><div className="stat-icon s3"><span>◉</span></div><div><span>Compliance Rate</span><strong>{stats.rate}%</strong></div></div>
          <div className="stat"><div className="stat-icon s1"><span>▦</span></div><div><span>Total Apps</span><strong>{stats.total}</strong></div></div>
          <div className="stat"><div className="stat-icon s4"><span>✕</span></div><div><span>Issues</span><strong>{stats.issues}</strong></div></div>
          <div className="stat"><div className="stat-icon s5"><span>?</span></div><div><span>Not Assessed</span><strong>{stats.notAssessed}</strong></div></div>
        </div>
      )}

      <section className="panel" style={{ marginBottom: 16 }}>
        <div className="filters" style={{ marginBottom: 12 }}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option>All</option>
            <option>Compliant</option>
            <option>Non-compliant</option>
            <option>Not Assessed</option>
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>App ID</th>
                <th>Institution</th>
                <th>Programme</th>
                <th>Status</th>
                <th>Compliance</th>
                <th>Issues</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const compliance = appCompliance(a);
                const issues = a.rules.filter((r) => r.status === 'Non-compliant').length;
                return (
                  <tr key={a.id}>
                    <td><b>{a.id}</b></td>
                    <td>{a.institution}</td>
                    <td>{a.category}</td>
                    <td><Status value={a.status} /></td>
                    <td><Status value={compliance} /></td>
                    <td>{issues > 0 ? <span className="severity high">{issues}</span> : <span style={{ color: '#888' }}>0</span>}</td>
                    <td>{a.updatedAt ? new Date(a.updatedAt).toLocaleDateString('en-IN') : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && <div className="empty">No applications match the selected filter</div>}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Upcoming Deadlines</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Date</th><th>Description</th><th>Days Remaining</th></tr>
            </thead>
            <tbody>
              {DEADLINES.map((d) => (
                <tr key={d.date}>
                  <td>{d.date}</td>
                  <td>{d.desc}</td>
                  <td><span className={`severity ${deadlineSeverity(d.days)}`}>{d.days} days</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
