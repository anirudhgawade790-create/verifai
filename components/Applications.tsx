"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Status } from "./Dashboard";

type AppRow = {
  id: string;
  institution: string;
  category: string;
  status: string;
  submitted: string;
  assignedOfficer: string;
};

export default function Applications() {
  const [apps, setApps] = useState<AppRow[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    fetch("/api/applications")
      .then((r) => r.json())
      .then((d) => {
        const list = d.applications || [];
        setApps(
          list.map((a: any) => ({
            id: a.id,
            institution: a.institutionName || a.institution || "Unknown",
            category: a.category || a.programme || "N/A",
            status: a.status,
            submitted: a.submittedAt || a.submitted,
            assignedOfficer: a.assignedOfficer || "Unassigned",
          }))
        );
      })
      .catch(() => setApps([]));
  }, []);

  const visible = useMemo(
    () =>
      apps.filter(
        (a) =>
          (status === "All" || a.status === status) &&
          `${a.id} ${a.institution} ${a.category}`
            .toLowerCase()
            .includes(query.toLowerCase())
      ),
    [apps, query, status]
  );

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="breadcrumb">WORKSPACE / APPLICATIONS</div>
          <h1>Applications</h1>
          <p>Manage institutional submissions and verification cases</p>
        </div>
        <Link className="primary compact" href="/applications/new">
          ＋ New application
        </Link>
      </div>
      <section className="panel">
        <div className="filters">
          <label className="search">
            ⌕
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ID, institution or category"
            />
          </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>All</option>
            {[
              "Submitted",
              "Under Review",
              "Verification Pending",
              "Observations Raised",
              "Approved",
              "Rejected",
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Application</th>
                <th>Institution</th>
                <th>Category</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Assigned officer</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((a) => (
                <tr key={a.id}>
                  <td>
                    <b>{a.id}</b>
                  </td>
                  <td>{a.institution}</td>
                  <td>{a.category}</td>
                  <td>
                    <Status value={a.status} />
                  </td>
                  <td>{new Date(a.submitted).toLocaleDateString("en-IN")}</td>
                  <td>{a.assignedOfficer}</td>
                  <td>
                    <Link
                      className="row-link"
                      href={`/applications/${encodeURIComponent(a.id)}`}
                    >
                      ›
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visible.length && <div className="empty">No matching applications</div>}
        </div>
        <div className="table-foot">
          <span>
            Showing {visible.length} of {apps.length} applications
          </span>
        </div>
      </section>
    </>
  );
}
