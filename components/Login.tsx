"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const demos: [string, string, string][] = [
  ["officer@aicte.demo", "Verifai@2026", "Officer"],
  ["institution@aicte.demo", "Verifai@2026", "Institution Admin"],
  ["auditor@aicte.demo", "Verifai@2026", "Auditor"],
  ["admin@aicte.demo", "Verifai@2026", "Super Admin"],
];

export default function Login() {
  const [email, setEmail] = useState(demos[0][0]);
  const [password, setPassword] = useState("Verifai@2026");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (r.ok) {
      router.replace("/dashboard");
    } else {
      setError("Invalid credentials. Use a demo account below.");
      setBusy(false);
    }
  }

  return (
    <main className="login-wrap">
      {/* Left art panel */}
      <section className="login-art">
        <div className="govseal">INDIA</div>
        <div className="login-copy">
          <div className="eyebrow">AICTE · MINISTRY OF EDUCATION</div>
          <h1>
            Evidence-based decisions.<br />
            <span>Trust, made traceable.</span>
          </h1>
          <p>
            VERIFAI supports authorized officials with explainable document
            validation and regulatory intelligence for institutional compliance.
          </p>
        </div>

        {/* Feature highlights */}
        <div style={{ marginTop: 40, display: "grid", gap: 16 }}>
          {[
            ["🔍", "AI Document Verification", "OCR extraction with fraud-risk scoring"],
            ["✓", "Compliance Monitoring", "Automated checks against regulatory requirements"],
            ["◷", "Immutable Audit Trail", "Every decision logged and traceable"],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: "rgba(255,255,255,0.1)",
                display: "grid", placeItems: "center",
                fontSize: 16, flexShrink: 0,
              }}>{icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#e8f0fb" }}>{title}</div>
                <div style={{ fontSize: 12, color: "#8db4d4", marginTop: 2 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="login-metric">
          <b>Human oversight</b>
          <span>Final decisions remain with competent authorities.</span>
        </div>
      </section>

      {/* Right form panel */}
      <section className="login-panel">
        <div className="login-brand">
          <div className="brand-mark" style={{ background: "var(--navy)", color: "#fff" }}>V</div>
          <div>
            <strong style={{ color: "var(--navy)" }}>VERIFAI</strong>
            <small style={{ color: "#8c99aa" }}>Verification Intelligence</small>
          </div>
        </div>

        <div className="login-form">
          <div className="form-kicker">SECURE GOVERNMENT WORKSPACE</div>
          <h2>Welcome back</h2>
          <p>Sign in to continue to the verification console.</p>

          <form onSubmit={submit}>
            <label>
              Email address
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ fontSize: 15 }}
              />
            </label>

            <label>
              Password
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ fontSize: 15, paddingRight: 44, width: "100%" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none",
                    color: "#8a96a7", cursor: "pointer", fontSize: 13,
                    padding: 0,
                  }}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {error && <div className="alert">{error}</div>}

            <button className="primary" disabled={busy} style={{ width: "100%", height: 46, fontSize: 15, marginTop: 8 }}>
              {busy ? "Signing in…" : "Sign in securely"}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="demo-roles" style={{ marginTop: 24 }}>
            <span style={{ width: "100%", color: "#8c98a9", fontSize: 11, textTransform: "uppercase", letterSpacing: "1px" }}>
              Demo accounts — click to fill
            </span>
            {demos.map(([a, p, label]) => (
              <button
                key={a}
                onClick={() => { setEmail(a); setPassword(p); setError(""); }}
                style={{
                  border: "1px solid #dde4ed", borderRadius: 20,
                  background: email === a ? "#edf3ff" : "#fff",
                  color: email === a ? "#155eef" : "#53657d",
                  fontSize: 12, padding: "6px 14px",
                  cursor: "pointer", fontWeight: email === a ? 700 : 400,
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="password" style={{ fontSize: 12, marginTop: 20 }}>
            Prototype · Password: <code style={{ color: "#52647c" }}>Verifai@2026</code>
          </div>
        </div>
      </section>
    </main>
  );
}
