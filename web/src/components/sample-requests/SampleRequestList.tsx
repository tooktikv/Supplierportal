"use client";

import { useState } from "react";
import { Badge, PageHeading } from "@/components/ui";
import { fmtDate } from "@/lib/docs";
import { buyerRequestOf, inSampleBucket, SAMPLE_BUCKETS, type SampleBucket } from "@/lib/sample-request-flow";
import { usePortal } from "@/lib/store";
import { useSampleActions } from "./useSampleActions";

type SortKey = "id" | "created" | "updated";

const actionLabel = (status: string) =>
  status === "Awaiting Submission" ? "Provide sample" : status === "Draft"
    ? "Continue draft"
    : status === "Action Required"
      ? "Provide sample"
      : status === "Resubmission Required"
        ? "Resubmit"
        : ["Approved", "Rejected"].includes(status)
          ? "View Result"
          : "View Details";

export default function SampleRequestList() {
  const { db } = usePortal();
  const { requestAction } = useSampleActions();
  const [bucket, setBucket] = useState<SampleBucket>("All");
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" }>({ key: "created", direction: "desc" });

  const rows = db.requests
    .filter((request) => inSampleBucket(request, bucket))
    .sort((a, b) => {
      const av = a[sort.key] || "";
      const bv = b[sort.key] || "";
      return (av > bv ? 1 : av < bv ? -1 : 0) * (sort.direction === "asc" ? 1 : -1);
    });

  const toggleSort = (key: SortKey) => setSort((s) => ({ key, direction: s.key === key && s.direction === "asc" ? "desc" : "asc" }));

  return (
    <>
      <PageHeading
        title="Sample Request"
        desc="Sample requests from Buyer and your sample submissions."
      />
      <div className="document-tabs" role="tablist" aria-label="Sample request status">
        {SAMPLE_BUCKETS.map((tab) => <button key={tab} className={`document-tab ${bucket === tab ? "selected" : ""}`} role="tab" aria-selected={bucket === tab} onClick={() => setBucket(tab)}>
          {tab}<span>{db.requests.filter((request) => inSampleBucket(request, tab)).length}</span>
        </button>)}
      </div>
      <div className="card table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  <button className="sort-button" onClick={() => toggleSort("id")}>
                    Request ID ↕
                  </button>
                </th>
                <th>Product / Sample</th>
                <th>Buyer</th>
                <th>Buyer review</th>
                <th>
                  <button className="sort-button" onClick={() => toggleSort("created")}>
                    Requested on ↕
                  </button>
                </th>
                <th>Response due</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.id}</strong>
                  </td>
                  <td>
                    <strong>{r.name}</strong>
                    <small>{r.code || "No product code"}</small>
                    <small>{r.category}</small>
                  </td>
                  <td>{buyerRequestOf(r).buyer}</td>
                  <td>{buyerRequestOf(r).reviewMode === "Onsite" ? "Onsite review" : "Digital documents"}</td>
                  <td>{fmtDate(buyerRequestOf(r).requestedAt)}</td>
                  <td>{fmtDate(buyerRequestOf(r).dueDate)}</td>
                  <td>
                    <Badge status={r.status} />
                  </td>
                  <td>
                    <button className="text-link" onClick={() => requestAction(r.id)}>
                      {actionLabel(r.status)} →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? (
            <div className="table-empty">
              <div className="empty-icon">◫</div>
              <h3>{db.requests.length ? "No matching sample requests" : "No sample requests yet"}</h3>
              <p>{db.requests.length ? "There are no requests in this status." : "No sample requests have been received from Buyer."}</p>
              {db.requests.length ? (
                <button className="button" onClick={() => setBucket("All")}>
                  View all requests
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="table-footer">
          <span>
            Showing {rows.length} of {db.requests.length} requests
          </span>
          <span>Mock supplier data · saved in this browser</span>
        </div>
      </div>
    </>
  );
}
