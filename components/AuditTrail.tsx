'use client';
import { useEffect, useMemo, useState } from 'react';

type AuditEntry = {
  id: string;
  action: string;
  actor: string;
  at: string;
  details: string;
  appId: string;
  institutionName: string;
};

type ViewMode = 'table' | 'timeline';

function formatAction(action: string) {
  switch (action) {
    case 'status_changed': return 'Status Change';
    case 'observation_added': return 'Observation Added';
    case 'document_uploaded': return 'Document Uploaded';
    default: return action;
  }
}

export default function AuditTrail() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  useEffect(() => {
    fetch('/api/applications')
      .then((r) => r.ok ? r.json() : { applications: [] })
      .then((d) => {
        const apps: any[] = d.applications || [];
        const flat: AuditEntry[] = apps.flatMap((a) =>
          (a.audit || []).map((e: any) => ({
            id: e.id,
            action: e.action,
            actor: e.actor || e.actorId || 'System',
            at: e.at || e.createdAt || '',
            details: e.details || '',
            appId: a.id,
            institutionName: a.institutionName || a.institution || 'Institution',
          }))
        );
        flat.sort((a, b) => b.at.localeCompare(a.at));
        setEntries(flat);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => ({
    total: entries.length,
    statusChanges: entries.filter((e) => e.action === 'status_changed').length,
    observations: entries.filter((e) => e.action === 'observation_added').length,
    uploads: entries.filter((e) => e.action === 'document_uploaded').length,
  }), [entries]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const matchQuery =
        e.appId.toLowerCase().includes(query.toLowerCase()) ||
        e.actor.toLowerCase().includes(query.toLowerCase()) ||
        e.details.toLowerCase().includes(query.toLowerCase());
      const matchAction = actionFilter === 'All' || e.action === actionFilter;
      return matchQuery && matchAction;
    });
  }, [entries, query, actionFilter]);

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="breadcrumb">WORKSPACE / AUDIT</div>
          <h1>Audit Trail</h1>
          <p>Immutable activity log across all applications</p>
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
          <div className="stat"><div className="stat-icon s1"><span>▦</span></div><div><span>Total Events</span><strong>{stats.total}</strong></div></div>
          <div className="stat"><div className="stat-icon s2"><span>↔</span></div><div><span>Status Changes</span><strong>{stats.statusChanges}</strong></div></div>
          <div className="stat"><div className="stat-icon s6"><span>✎</span></div><div><span>Observations</span><strong>{stats.observations}</strong></div></div>
          <div className="stat"><div className="stat-icon s3"><span>⬆</span></div><div><span>Uploads</span><strong>{stats.uploads}</strong></div></div>
        </div>
      )}

      <div className="filters" style={{ marginBottom: 16 }}>
        <label className="search">
          ⌕
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search App ID, actor or details"
          />
        </label>
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
          <option>All</option>
          <option value="status_changed">status_changed</option>
          <option value="observation_added">observation_added</option>
          <option value="document_uploaded">document_uploaded</option>
        </select>
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
          <button
            className={viewMode === 'table' ? 'primary compact' : 'secondary'}
            onClick={() => setViewMode('table')}
          >
            Table
          </button>
          <button
            className={viewMode === 'timeline' ? 'primary compact' : 'secondary'}
            onClick={() => setViewMode('timeline')}
          >
            Timeline
          </button>
        </div>
      </div>

      {viewMode === 'table' && (
        <section className="panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>App ID</th>
                  <th>Actor</th>
                  <th>Details</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr key={`${e.id}-${i}`}>
                    <td><b>{formatAction(e.action)}</b></td>
                    <td>{e.appId}</td>
                    <td>{e.actor}</td>
                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.details.length > 80 ? e.details.slice(0, 80) + '…' : e.details}
                    </td>
                    <td>{e.at ? new Date(e.at).toLocaleString('en-IN') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && filtered.length === 0 && <div className="empty">No audit events match the current filters</div>}
          </div>
        </section>
      )}

      {viewMode === 'timeline' && (
        <section className="panel">
          {!loading && filtered.length === 0 && <div className="empty">No audit events match the current filters</div>}
          <div className="timeline">
            {filtered.map((e, i) => (
              <div key={`${e.id}-${i}`}>
                <i />
                <div>
                  <b>{formatAction(e.action)}</b>
                  <p>{e.actor} · {e.at ? new Date(e.at).toLocaleString('en-IN') : '—'}</p>
                  <p>{e.details}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
