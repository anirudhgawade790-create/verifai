'use client';
import { useEffect, useMemo, useState } from 'react';

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  institutionId?: string;
};

type AppRow = { id: string; status: string };

export default function Admin() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [apps, setApps] = useState<AppRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/users').then((r) => {
        if (r.status === 403) { setAccessDenied(true); return { users: [] }; }
        return r.ok ? r.json() : { users: [] };
      }),
      fetch('/api/applications').then((r) => r.ok ? r.json() : { applications: [] }),
    ]).then(([userData, appData]) => {
      setUsers(
        (userData.users || []).map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          institutionId: u.institutionId,
        }))
      );
      setApps(
        (appData.applications || []).map((a: any) => ({
          id: a.id,
          status: a.status,
        }))
      );
    }).finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const active = apps.filter((a) => !['Draft', 'Rejected', 'Approved'].includes(a.status)).length;
    return { totalUsers: users.length, activeApps: active };
  }, [users, apps]);

  function roleBadgeClass(role: string) {
    return role.toLowerCase().replaceAll(' ', '-');
  }

  if (accessDenied) {
    return (
      <>
        <div className="page-heading">
          <div>
            <div className="breadcrumb">WORKSPACE / ADMIN</div>
            <h1>Administration</h1>
          </div>
        </div>
        <div className="panel" style={{ textAlign: 'center', padding: 32 }}>
          <p style={{ fontSize: 18, marginBottom: 8 }}>🔒</p>
          <h2>Access Restricted</h2>
          <p>Administration is restricted to Super Admin accounts.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="breadcrumb">WORKSPACE / ADMIN</div>
          <h1>Administration</h1>
          <p>User management and system settings</p>
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
          <div className="stat"><div className="stat-icon s1"><span>👤</span></div><div><span>Total Users</span><strong>{stats.totalUsers}</strong></div></div>
          <div className="stat"><div className="stat-icon s2"><span>▦</span></div><div><span>Active Applications</span><strong>{stats.activeApps}</strong></div></div>
          <div className="stat"><div className="stat-icon s6"><span>🏫</span></div><div><span>Institutions</span><strong>4</strong></div></div>
          <div className="stat"><div className="stat-icon s3"><span>◉</span></div><div><span>System</span><strong>Operational</strong></div></div>
        </div>
      )}

      <section className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-head"><h2>Users</h2></div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Institution ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td><b>{u.name}</b></td>
                  <td>{u.email}</td>
                  <td><span className={`badge ${roleBadgeClass(u.role)}`}>{u.role}</span></td>
                  <td>{u.institutionId || '—'}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="secondary"
                      onClick={() => window.alert('Demo: User deactivation is not persisted in this prototype.')}
                    >
                      Deactivate
                    </button>
                    <button
                      className="secondary"
                      onClick={() => window.alert('Demo: Role changes are not persisted in this prototype.')}
                    >
                      Change Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && users.length === 0 && <div className="empty">No users found</div>}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><h2>System Settings</h2></div>
        <dl className="facts">
          <div>
            <dt>Session Secret</dt>
            <dd>Demo environment — set VERIFAI_SESSION_SECRET in production (see .env.example)</dd>
          </div>
          <div>
            <dt>Next.js Version</dt>
            <dd>15.x</dd>
          </div>
          <div>
            <dt>Database</dt>
            <dd>JSON flat-file (data/applications.json)</dd>
          </div>
        </dl>
      </section>
    </>
  );
}
