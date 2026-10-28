'use client';
import { useEffect, useState } from 'react';

type NotifType = 'risk' | 'expired' | 'pending' | 'audit';
type NotifPriority = 'high' | 'medium' | 'low';

type Notif = {
  id: number;
  type: NotifType;
  priority: NotifPriority;
  title: string;
  body: string;
  appId: string;
  createdAt: string;
  read: boolean;
};

type FilterTab = 'All' | 'Unread' | 'High Priority';

const TYPE_ICON: Record<NotifType, string> = {
  risk: '⚠️',
  expired: '⌛',
  pending: '◷',
  audit: '✓',
};

export default function Notifications() {
  const [notifState, setNotifState] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabFilter, setTabFilter] = useState<FilterTab>('All');

  useEffect(() => {
    fetch('/api/applications')
      .then((r) => r.ok ? r.json() : { applications: [] })
      .then((d) => {
        const apps: any[] = d.applications || [];
        const raw: Omit<Notif, 'id' | 'read'>[] = [];

        for (const app of apps) {
          const findings: any[] = app.findings || [];
          for (const f of findings) {
            if (f.severity === 'High') {
              raw.push({
                type: 'risk',
                priority: 'high',
                title: 'High-risk finding',
                body: `${f.title || 'Finding'} — ${app.id}`,
                appId: app.id,
                createdAt: f.createdAt || app.submittedAt || new Date().toISOString(),
              });
            }
          }

          const docs: any[] = app.documents || [];
          for (const doc of docs) {
            if (doc.status === 'Expired') {
              raw.push({
                type: 'expired',
                priority: 'high',
                title: 'Expired document',
                body: `${doc.name || 'Document'} in ${app.id}`,
                appId: app.id,
                createdAt: doc.uploadedAt || app.submittedAt || new Date().toISOString(),
              });
            }
          }

          const submittedAt = app.submittedAt || app.submitted;
          if (app.status === 'Submitted' && submittedAt && Date.now() - Date.parse(submittedAt) > 3 * 86400000) {
            raw.push({
              type: 'pending',
              priority: 'medium',
              title: 'Awaiting review',
              body: `${app.id} has been submitted for over 3 days`,
              appId: app.id,
              createdAt: submittedAt,
            });
          }
        }

        // Recent audit entries (top 5 across all apps)
        const allAudit: { entry: any; appId: string }[] = [];
        for (const app of apps) {
          for (const e of (app.audit || [])) {
            if (e.action === 'status_changed') {
              allAudit.push({ entry: e, appId: app.id });
            }
          }
        }
        allAudit.sort((a, b) => (b.entry.createdAt || '').localeCompare(a.entry.createdAt || ''));
        for (const { entry, appId } of allAudit.slice(0, 5)) {
          raw.push({
            type: 'audit',
            priority: 'low',
            title: 'Status updated',
            body: entry.details || 'Status change recorded',
            appId,
            createdAt: entry.createdAt || new Date().toISOString(),
          });
        }

        // Sort by createdAt desc
        raw.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

        setNotifState(raw.map((n, i) => ({ ...n, id: i, read: false })));
      })
      .finally(() => setLoading(false));
  }, []);

  function markRead(id: number) {
    setNotifState((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  function markAllRead() {
    setNotifState((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const visible = notifState.filter((n) => {
    if (tabFilter === 'Unread') return !n.read;
    if (tabFilter === 'High Priority') return n.priority === 'high';
    return true;
  });

  const unreadCount = notifState.filter((n) => !n.read).length;
  const highCount = notifState.filter((n) => n.priority === 'high').length;

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="breadcrumb">WORKSPACE / NOTIFICATIONS</div>
          <h1>Notifications</h1>
          <p>System alerts and activity updates</p>
        </div>
        <button className="secondary" onClick={markAllRead}>Mark all read</button>
      </div>

      <div className="stat-grid" style={{ marginBottom: 16 }}>
        <div className="stat"><div className="stat-icon s1"><span>▦</span></div><div><span>Total</span><strong>{notifState.length}</strong></div></div>
        <div className="stat"><div className="stat-icon s2"><span>◉</span></div><div><span>Unread</span><strong>{unreadCount}</strong></div></div>
        <div className="stat"><div className="stat-icon s5"><span>△</span></div><div><span>High Priority</span><strong>{highCount}</strong></div></div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['All', 'Unread', 'High Priority'] as FilterTab[]).map((t) => (
          <button
            key={t}
            className={tabFilter === t ? 'primary compact' : 'secondary'}
            onClick={() => setTabFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <section className="panel">
        {!loading && visible.length === 0 && (
          <div className="empty">No notifications to show</div>
        )}
        {visible.map((n) => (
          <div
            key={n.id}
            className={`notif-item${n.read ? '' : ' unread'}`}
            style={{ cursor: 'pointer' }}
            onClick={() => markRead(n.id)}
          >
            <span style={{ fontSize: 20, marginRight: 12 }}>{TYPE_ICON[n.type]}</span>
            <div style={{ flex: 1 }}>
              <strong>{n.title}</strong>
              <p style={{ margin: '2px 0 0', fontSize: 13, color: '#555' }}>{n.body}</p>
              <small style={{ color: '#888' }}>{new Date(n.createdAt).toLocaleString('en-IN')}</small>
            </div>
            <span className={`severity ${n.priority}`} style={{ alignSelf: 'flex-start' }}>{n.priority}</span>
          </div>
        ))}
      </section>
    </>
  );
}
