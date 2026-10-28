'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Status } from './Dashboard';

type Finding = { severity: string };
type AppRow = {
  id: string;
  institution: string;
  status: string;
  submittedAt: string;
  findings: Finding[];
};

const STATE_MAP: Record<string, string> = {
  'Vidya Meridian Institute of Technology': 'Maharashtra',
  'Northstar School of Engineering': 'Tamil Nadu',
  'Aarohan State University': 'Karnataka',
  'Eastern Research Institute': 'West Bengal',
};

function calcRisk(findings: Finding[]) {
  return Math.min(100, findings.reduce((s, f) => s + (f.severity === 'High' ? 30 : f.severity === 'Medium' ? 15 : 5), 0));
}

function riskLevel(score: number) {
  return score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low';
}

export default function Reports() {
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetch('/api/applications')
      .then((r) => r.ok ? r.json() : { applications: [] })
      .then((d) => {
        setApps(
          (d.applications || []).map((a: any) => ({
            id: a.id,
            institution: a.institutionName || a.institution || 'Institution',
            status: a.status,
            submittedAt: a.submittedAt || a.submitted || '',
            findings: a.findings || [],
          }))
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return apps.filter((a) => {
      if (statusFilter !== 'All' && a.status !== statusFilter) return false;
      if (riskFilter !== 'All' && riskLevel(calcRisk(a.findings)) !== riskFilter.toLowerCase()) return false;
      if (dateFrom && a.submittedAt && a.submittedAt < dateFrom) return false;
      if (dateTo && a.submittedAt && a.submittedAt > dateTo + 'T23:59:59') return false;
      return true;
    });
  }, [apps, statusFilter, riskFilter, dateFrom, dateTo]);

  const stats = useMemo(() => ({
    total: filtered.length,
    approved: filtered.filter((a) => a.status === 'Approved').length,
    rejected: filtered.filter((a) => a.status === 'Rejected').length,
    highRisk: filtered.filter((a) => riskLevel(calcRisk(a.findings)) === 'high').length,
  }), [filtered]);

  const barData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of filtered) {
      const state = STATE_MAP[a.institution] || 'Other';
      counts[state] = (counts[state] || 0) + 1;
    }
    return Object.entries(counts).map(([state, count]) => ({ state, count }));
  }, [filtered]);

  function exportCSV() {
    const header = 'ID,Institution,Status,Risk,Findings,Submitted';
    const rows = filtered.map((a) => {
      const risk = riskLevel(calcRisk(a.findings));
      return [a.id, `"${a.institution}"`, a.status, risk, a.findings.length, a.submittedAt].join(',');
    });
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'verifai-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="breadcrumb">WORKSPACE / REPORTS</div>
          <h1>Reports</h1>
          <p>Analytics and export tools for application data</p>
        </div>
        <button className="primary compact" onClick={exportCSV}>⬇ Export CSV</button>
      </div>

      {loading ? (
        <div className="stat-grid">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="stat skeleton" style={{ minHeight: 80, background: '#f0f2f5', borderRadius: 8 }} />
          ))}
        </div>
      ) : (
        <div className="stat-grid">
          <div className="stat"><div className="stat-icon s1"><span>▦</span></div><div><span>Total (filtered)</span><strong>{stats.total}</strong></div></div>
          <div className="stat"><div className="stat-icon s3"><span>✓</span></div><div><span>Approved</span><strong>{stats.approved}</strong></div></div>
          <div className="stat"><div className="stat-icon s4"><span>✕</span></div><div><span>Rejected</span><strong>{stats.rejected}</strong></div></div>
          <div className="stat"><div className="stat-icon s5"><span>△</span></div><div><span>High Risk</span><strong>{stats.highRisk}</strong></div></div>
        </div>
      )}

      <div className="filters" style={{ marginBottom: 16 }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>All</option>
          {['Submitted', 'Under Review', 'Verification Pending', 'Observations Raised', 'Approved', 'Rejected'].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
          <option>All</option>
          <option value="high">High Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="low">Low Risk</option>
        </select>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ padding: '6px 10px' }} placeholder="From" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ padding: '6px 10px' }} placeholder="To" />
      </div>

      <section className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-head"><h2>Applications by State</h2></div>
        <div style={{ height: 220, padding: '8px 0' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f4" />
              <XAxis dataKey="state" tick={{ fontSize: 11, fill: '#8793a4' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8793a4' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#155eef" radius={[3, 3, 0, 0]} name="Applications" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>App ID</th>
                <th>Institution</th>
                <th>Status</th>
                <th>Risk</th>
                <th>Findings</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const score = calcRisk(a.findings);
                const level = riskLevel(score);
                return (
                  <tr key={a.id}>
                    <td><b>{a.id}</b></td>
                    <td>{a.institution}</td>
                    <td><Status value={a.status} /></td>
                    <td><span className={`risk-score ${level}`}>{score}</span></td>
                    <td>{a.findings.length}</td>
                    <td>{a.submittedAt ? new Date(a.submittedAt).toLocaleDateString('en-IN') : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && <div className="empty">No applications match the current filters</div>}
        </div>
      </section>
    </>
  );
}
