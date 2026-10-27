"use client";

import { useState } from "react";
import { Badge, PageHeading } from "@/components/ui";
import { fmtDate } from "@/lib/docs";
import { buyerRequestOf, inSampleBucket, SAMPLE_BUCKETS, type SampleBucket } from "@/lib/sample-request-flow";
import { usePortal } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
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

const needsAction = (status: string) => ["Awaiting Submission", "Draft", "Action Required", "Resubmission Required"].includes(status);

export default function SampleRequestList() {
  const { db } = usePortal();
  const { t } = useI18n();
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
        title={t("Sample Request")}
        desc={t("Sample requests from Buyer and your sample submissions.")}
      />
      <div className="document-tabs" role="tablist" aria-label={t("Sample request status")}>
        {SAMPLE_BUCKETS.map((tab) => <button key={tab} className={`document-tab ${bucket === tab ? "selected" : ""}`} role="tab" aria-selected={bucket === tab} onClick={() => setBucket(tab)}>
          {t(tab)}<span>{db.requests.filter((request) => inSampleBucket(request, tab)).length}</span>
        </button>)}
      </div>
      <div className="card table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  <button className="sort-button" onClick={() => toggleSort("id")}>
                    {t("Request ID")} ↕
                  </button>
                </th>
                <th>{t("Product / Sample")}</th>
                <th>{t("Buyer")}</th>
                <th>{t("Buyer review")}</th>
                <th>
                  <button className="sort-button" onClick={() => toggleSort("created")}>
                    {t("Requested on")} ↕
                  </button>
                </th>
                <th>{t("Response due")}</th>
                <th>{t("Status")}</th>
                <th>{t("Actions")}</th>
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
                    <small>{r.code || t("No product code")}</small>
                    <small>{t(r.category)}</small>
                  </td>
                  <td>{buyerRequestOf(r).buyer}</td>
                  <td>{buyerRequestOf(r).reviewMode === "Onsite" ? t("Onsite review") : t("Digital documents")}</td>
                  <td>{fmtDate(buyerRequestOf(r).requestedAt)}</td>
                  <td>{fmtDate(buyerRequestOf(r).dueDate)}</td>
                  <td>
                    <Badge status={r.status} />
                  </td>
                  <td>
                    <button className={`button small ${needsAction(r.status) ? "primary" : ""}`} onClick={() => requestAction(r.id)}>
                      {t(actionLabel(r.status))}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? (
            <div className="table-empty">
              <div className="empty-icon">◫</div>
              <h3>{db.requests.length ? t("No matching sample requests") : t("No sample requests yet")}</h3>
              <p>{db.requests.length ? t("There are no requests in this status.") : t("No sample requests have been received from Buyer.")}</p>
              {db.requests.length ? (
                <button className="button" onClick={() => setBucket("All")}>
                  {t("View all requests")}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="table-footer">
          <span>
            {t("Showing {n} of {total} requests", { n: rows.length, total: db.requests.length })}
          </span>
          <span>{t("Mock supplier data · saved in this browser")}</span>
        </div>
      </div>
    </>
  );
}
