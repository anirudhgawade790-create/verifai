'use client';
import { useEffect, useMemo, useState } from 'react';

type Institution = { id: string; name: string; type: string; state: string };
type AppRow = { id: string; institutionId: string; institution: string };

export default function Institutions() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [applications, setApplications] = useState<AppRow[]>([]);
  const [query, setQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/institutions').then((r) => r.ok ? r.json() : { institutions: [] }),
      fetch('/api/applications').then((r) => r.ok ? r.json() : { applications: [] }),
    ]).then(([instData, appData]) => {
      setInstitutions(instData.institutions || []);
      setApplications(
        (appData.applications || []).map((a: any) => ({
          id: a.id,
          institutionId: a.institutionId || '',
          institution: a.institutionName || a.institution || '',
        }))
      );
    }).finally(() => setLoading(false));
  }, []);

  function appCount(inst: Institution) {
    return applications.filter((a) => a.institutionId === inst.id).length;
  }

  const states = useMemo(
    () => ['All', ...Array.from(new Set(institutions.map((i) => i.state))).sort()],
    [institutions]
  );

  const filtered = useMemo(() => {
    return institutions.filter((i) => {
      const matchQuery = i.name.toLowerCase().includes(query.toLowerCase());
      const matchState = stateFilter === 'All' || i.state === stateFilter;
      const matchType = typeFilter === 'All' || i.type === typeFilter;
      return matchQuery && matchState && matchType;
    });
  }, [institutions, query, stateFilter, typeFilter]);

  const stats = useMemo(() => ({
    total: institutions.length,
    universities: institutions.filter((i) => i.type === 'University').length,
    colleges: institutions.filter((i) => i.type === 'College').length,
    states: new Set(institutions.map((i) => i.state)).size,
  }), [institutions]);

  function badgeCls(type: string) {
    return type === 'College' ? 'aicte-officer' : 'institution-admin';
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="breadcrumb">WORKSPACE / INSTITUTIONS</div>
          <h1>Institutions</h1>
          <p>Registered institutions in the verification system</p>
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
          <div className="stat"><div className="stat-icon s2"><span>🎓</span></div><div><span>Universities</span><strong>{stats.universities}</strong></div></div>
          <div className="stat"><div className="stat-icon s3"><span>🏫</span></div><div><span>Colleges</span><strong>{stats.colleges}</strong></div></div>
          <div className="stat"><div className="stat-icon s6"><span>◎</span></div><div><span>States covered</span><strong>{stats.states}</strong></div></div>
        </div>
      )}

      <div className="filters" style={{ marginBottom: 16 }}>
        <label className="search">
          ⌕
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search institutions"
          />
        </label>
        <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}>
          {states.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option>All</option>
          <option>University</option>
          <option>College</option>
        </select>
      </div>

      {!loading && filtered.length === 0 ? (
        <div className="empty">No institutions match the current filters</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {filtered.map((inst) => (
            <div className="panel" key={inst.id}>
              <div className="panel-head">
                <h2 style={{ fontSize: 15 }}>{inst.name}</h2>
                <span className={`badge ${badgeCls(inst.type)}`}>{inst.type}</span>
              </div>
              <dl className="facts">
                <div><dt>State</dt><dd>{inst.state}</dd></div>
                <div><dt>Type</dt><dd>{inst.type}</dd></div>
                <div><dt>ID</dt><dd>{inst.id}</dd></div>
                <div><dt>Applications</dt><dd>{appCount(inst)}</dd></div>
              </dl>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
