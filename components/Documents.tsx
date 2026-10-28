'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Status } from './Dashboard';

type DocRow = {
  id: string;
  name: string;
  type: string;
  status: string;
  filename: string;
  mock: boolean;
  uploadedAt: string;
  size: number;
  appId: string;
  institutionName: string;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + 'B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + 'KB';
  return (bytes / 1048576).toFixed(1) + 'MB';
}

export default function Documents() {
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetch('/api/applications')
      .then((r) => r.ok ? r.json() : { applications: [] })
      .then((d) => {
        const apps: any[] = d.applications || [];
        const flat: DocRow[] = apps.flatMap((a) =>
          (a.documents || []).map((doc: any) => ({
            id: doc.id,
            name: doc.name || doc.type || 'Document',
            type: doc.type || 'Document',
            status: doc.status,
            filename: doc.filename || doc.name || 'file.pdf',
            mock: doc.mock !== false,
            uploadedAt: doc.uploadedAt || a.submittedAt || a.submitted || '',
            size: doc.size || 0,
            appId: a.id,
            institutionName: a.institutionName || a.institution || 'Institution',
          }))
        );
        setDocs(flat);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => ({
    total: docs.length,
    verified: docs.filter((d) => d.status === 'Verified').length,
    expired: docs.filter((d) => d.status === 'Expired').length,
    pending: docs.filter((d) => d.status === 'Verification Pending' || d.status === 'Manual Review Required').length,
  }), [docs]);

  const filtered = useMemo(() => {
    return docs.filter((d) => {
      const matchQuery =
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.institutionName.toLowerCase().includes(query.toLowerCase());
      const matchStatus = statusFilter === 'All' || d.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [docs, query, statusFilter]);

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="breadcrumb">WORKSPACE / DOCUMENTS</div>
          <h1>Documents</h1>
          <p>All uploaded documents across applications</p>
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
          <div className="stat"><div className="stat-icon s1"><span>▦</span></div><div><span>Total</span><strong>{stats.total}</strong></div></div>
          <div className="stat"><div className="stat-icon s3"><span>✓</span></div><div><span>Verified</span><strong>{stats.verified}</strong></div></div>
          <div className="stat"><div className="stat-icon s4"><span>⌛</span></div><div><span>Expired</span><strong>{stats.expired}</strong></div></div>
          <div className="stat"><div className="stat-icon s2"><span>◷</span></div><div><span>Pending</span><strong>{stats.pending}</strong></div></div>
        </div>
      )}

      <section className="panel">
        <div className="filters" style={{ marginBottom: 12 }}>
          <label className="search">
            ⌕
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or institution"
            />
          </label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All</option>
            <option>Verified</option>
            <option>Expired</option>
            <option>Verification Pending</option>
            <option>Mismatch Detected</option>
            <option>Manual Review Required</option>
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>App ID</th>
                <th>Institution</th>
                <th>Type</th>
                <th>Status</th>
                <th>Uploaded</th>
                <th>Size</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id}>
                  <td>
                    {d.name}
                    {d.mock && <span className="badge" style={{ marginLeft: 6, fontSize: 10 }}>MOCK</span>}
                  </td>
                  <td>
                    <Link href={`/applications/${encodeURIComponent(d.appId)}`}>
                      {d.appId}
                    </Link>
                  </td>
                  <td>{d.institutionName}</td>
                  <td>{d.type}</td>
                  <td><Status value={d.status} /></td>
                  <td>{d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString('en-IN') : '—'}</td>
                  <td>{formatSize(d.size)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && <div className="empty">No documents match the current filters</div>}
        </div>
      </section>
    </>
  );
}
