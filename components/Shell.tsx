"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Session = { id: string; name: string; role: string; institutionId?: string };

type NavItem = { label: string; href: string; icon: string; roles?: string[] };

const navItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: "⌁" },
  { label: "Applications", href: "/applications", icon: "▦" },
  { label: "New Application", href: "/applications/new", icon: "✎", roles: ["Institution Admin"] },
  { label: "AI Verification", href: "/verification", icon: "🔍", roles: ["AICTE Officer", "Super Admin"] },
  { label: "Institutions", href: "/institutions", icon: "⌂", roles: ["Super Admin", "AICTE Officer"] },
  { label: "Compliance", href: "/compliance", icon: "✓" },
  { label: "Documents", href: "/documents", icon: "▧" },
  { label: "Reports", href: "/reports", icon: "≡" },
  { label: "Notifications", href: "/notifications", icon: "♢" },
  { label: "Audit trail", href: "/audit", icon: "◷" },
  { label: "Administration", href: "/admin", icon: "⚙", roles: ["Super Admin"] },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [open, setOpen] = useState(false);

  // Run only once on mount — never re-run on navigation
  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          router.replace("/login");
          return;
        }
        const data = await res.json();
        setSession(data.user ?? data);
      })
      .catch(() => router.replace("/login"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  // Close mobile sidebar on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const visibleNav = navItems.filter(
    (item) => !item.roles || (session && item.roles.includes(session.role))
  );

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">V</div>
          <div>
            <strong>VERIFAI</strong>
            <small>AICTE Intelligence</small>
          </div>
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {visibleNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                pathname === item.href || pathname.startsWith(item.href + "/")
                  ? "active"
                  : ""
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-help">
          <span>Need assistance?</span>
          <p>Verification knowledge base</p>
          <button>Open help centre</button>
        </div>
      </aside>
      {open && (
        <button
          className="scrim"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <main>
        <header className="topbar">
          <button
            className="icon-btn menu"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
          >
            ☰
          </button>
          <div className="context">
            <span>AICTE</span>
            <b>›</b>
            <span>Application Verification</span>
          </div>
          <div className="top-actions">
            <button className="icon-btn" title="Notifications" onClick={() => router.push("/notifications")}>
              ♢
            </button>
            <button className="profile" onClick={logout}>
              <div className="avatar">
                {session?.name
                  ?.split(" ")
                  .map((x) => x[0])
                  .join("")
                  .slice(0, 2) || "--"}
              </div>
              <div>
                <b>{session?.name || "Loading"}</b>
                <small>{session?.role || ""}</small>
              </div>
            </button>
          </div>
        </header>
        <div className="page">{children}</div>
      </main>
    </div>
  );
}
