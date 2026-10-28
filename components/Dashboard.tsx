"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

type AppRow = {
  id: string;
  institution: string;
  category: string;
  status: string;
  submitted: string;
  assignedOfficer: string;
  documents: { status: string }[];
  findings: { severity: string }[];
};

const COLORS = ["#155eef", "#18a8a8", "#d89214", "#d86666", "#8b95a5", "#7d77cc"];

const STATUS_COLORS: Record<string, string> = {
  Submitted: "#155eef",
  "Under Review": "#18a8a8",
  "Verification Pending": "#d89214",
  "Observations Raised": "#7d77cc",
  Approved: "#2fa17d",
  Rejected: "#d86666",
};

const weekData = [
  { day: "Mon", checks: 38 },
  { day: "Tue", checks: 52 },
  { day: "Wed", checks: 46 },
  { day: "Thu", checks: 61 },
  { day: "Fri", checks: 43 },
  { day: "Sat", checks: 57 },
  { day: "Sun", checks: 66 },
];

const monthData = [
  { month: "May", submitted: 12, approved: 8, rejected: 2 },
  { month: "Jun", submitted: 18, approved: 14, rejected: 3 },
  { month: "Jul", submitted: 22, approved: 16, rejected: 4 },
  { month: "Aug", submitted: 28, approved: 20, rejected: 5 },
  { month: "Sep", submitted: 35, approved: 26, rejected: 6 },
  { month: "Oct", submitted: 42, approved: 31, rejected: 7 },
];

export default function Dashboard() {
  const [apps, setApps] = useState<AppRow[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(sessionStorage.getItem("verifai-apps") || "[]") as AppRow[]; }
    catch { return []; }
  });
  const [loading, setLoading] = useState(apps.length === 0);

  useEffect(() => {
    fetch("/api/applications", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : { applications: [] })
      .then((d) => {
        const list = (d.applications || []);
        const normalized = list.map((a: any) => ({
          id: a.id,
          institution: a.institutionName || a.institution || "Unknown",
          category: a.category || a.programme || "N/A",
          status: a.status,
          submitted: a.submittedAt || a.submitted,
          assignedOfficer: a.assignedOfficer || "Unassigned",
          documents: a.documents || [],
          findings: a.findings || [],
        }));
        setApps(normalized);
        sessionStorage.setItem("verifai-apps", JSON.stringify(normalized));
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const pending = apps.filter((x) =>
      ["Submitted", "Under Review", "Verification Pending", "Observations Raised"].includes(x.status)
    ).length;
    const approved = apps.filter((x) => x.status === "Approved").length;
    const rejected = apps.filter((x) => x.status === "Rejected").length;
    const highRisk = apps.filter((x) => x.findings.some((f) => f.severity === "High")).length;
    const expiredDocs = apps.filter((x) => x.documents.some((d) => d.status === "Expired")).length;
    const mismatches = apps.filter((x) => x.documents.some((d) => d.status === "Mismatch Detected")).length;
    const complianceRate = apps.length
      ? Math.round((approved / apps.length) * 100)
      : 0;
    return { total: apps.length, pending, approved, rejected, highRisk, expiredDocs, mismatches, complianceRate };
  }, [apps]);

  const statusDist = useMemo(() => {
    const keys = ["Submitted", "Under Review", "Verification Pending", "Observations Raised", "Approved", "Rejected"];
    return keys
      .map((k) => ({ name: k, value: apps.filter((x) => x.status === k).length }))
      .filter((x) => x.value > 0);
  }, [apps]);

  const recentApps = useMemo(
    () => [...apps].sort((a, b) => b.submitted.localeCompare(a.submitted)).slice(0, 6),
    [apps]
  );

  const statItems = [
    { label: "Total applications", value: stats.total, icon: "▦", cls: "s1" },
    { label: "Pending reviews", value: stats.pending, icon: "◷", cls: "s2" },
    { label: "Approved", value: stats.approved, icon: "✓", cls: "s3" },
    { label: "Rejected", value: stats.rejected, icon: "✕", cls: "s4" },
    { label: "High-risk findings", value: stats.highRisk, icon: "△", cls: "s5" },
    { label: "Compliance rate", value: `${stats.complianceRate}%`, icon: "◉", cls: "s6" },
    { label: "Expired documents", value: stats.expiredDocs, icon: "⌛", cls: "s7" },
    { label: "Mismatches detected", value: stats.mismatches, icon: "≠", cls: "s3" },
  ];

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="breadcrumb">WORKSPACE / OVERVIEW</div>
          <h1>Verification overview</h1>
          <p>Application validation and regulatory intelligence — live data</p>
        </div>
        <button className="secondary" onClick={() => location.reload()}>↻ Refresh</button>
      </div>

      {loading ? (
        <div className="stat-grid">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="stat skeleton" style={{ minHeight: 94, background: "#f0f2f5", borderRadius: 8 }} />
          ))}
        </div>
      ) : (
        <div className="stat-grid">
          {statItems.map((s) => (
            <div className="stat" key={s.label}>
              <div className={`stat-icon ${s.cls}`}><span>{s.icon}</span></div>
              <div>
                <span>{s.label}</span>
                <strong>{s.value}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="two-col" style={{ marginBottom: 17 }}>
        <section className="panel">
          <div className="panel-head">
            <div><h2>Status distribution</h2><p>Current portfolio breakdown</p></div>
            <span className="live">LIVE</span>
          </div>
          <div style={{ height: 240, padding: "16px 8px 8px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusDist} dataKey="value" nameKey="name" cx="40%" cy="50%" outerRadius={85} innerRadius={50}>
                  {statusDist.map((entry, i) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [`${v} applications`, ""]} />
                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div><h2>Verification activity</h2><p>Checks completed this week</p></div>
          </div>
          <div style={{ height: 240, padding: "16px 16px 8px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData} barSize={22}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f4" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#8793a4" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#8793a4" }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "#f4f6f9" }} />
                <Bar dataKey="checks" fill="#155eef" radius={[3, 3, 0, 0]} name="Checks" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="panel" style={{ marginBottom: 17 }}>
        <div className="panel-head">
          <div><h2>Monthly trends</h2><p>Submission and decision history</p></div>
        </div>
        <div style={{ height: 200, padding: "16px 16px 8px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthData}>
              <defs>
                <linearGradient id="gSubmitted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#155eef" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#155eef" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gApproved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#18a8a8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#18a8a8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edf0f4" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#8793a4" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#8793a4" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="submitted" stroke="#155eef" fill="url(#gSubmitted)" strokeWidth={2} name="Submitted" />
              <Area type="monotone" dataKey="approved" stroke="#18a8a8" fill="url(#gApproved)" strokeWidth={2} name="Approved" />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel recent">
        <div className="panel-head">
          <div><h2>Recent applications</h2><p>Latest submissions requiring attention</p></div>
          <Link href="/applications">View all →</Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Application</th>
                <th>Institution</th>
                <th>Status</th>
                <th>Risk</th>
                <th>Assigned officer</th>
                <th>Submitted</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {recentApps.map((a) => {
                const highFindings = a.findings.filter((f) => f.severity === "High").length;
                return (
                  <tr key={a.id}>
                    <td><b>{a.id}</b><small>{a.category}</small></td>
                    <td>{a.institution}</td>
                    <td><Status value={a.status} /></td>
                    <td>
                      {highFindings > 0
                        ? <span className="severity high">{highFindings} High</span>
                        : <span className="severity low">Low</span>}
                    </td>
                    <td>{a.assignedOfficer}</td>
                    <td>{new Date(a.submitted).toLocaleDateString("en-IN")}</td>
                    <td>
                      <Link href={`/applications/${encodeURIComponent(a.id)}`} className="row-link">›</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && !recentApps.length && <div className="empty">No applications yet</div>}
        </div>
      </section>
    </>
  );
}

export function Status({ value }: { value: string }) {
  const cls = value.toLowerCase().replaceAll(" ", "-");
  return <span className={`status ${cls}`}><i />{value}</span>;
}
