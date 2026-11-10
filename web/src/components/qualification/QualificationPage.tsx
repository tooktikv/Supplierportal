"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge, PageHeading } from "@/components/ui";
import { fmtDate } from "@/lib/docs";
import { useI18n } from "@/lib/i18n";
import { displayOutcome, inBucket, latestResult, QSL_BUCKETS, type QslBucket, type QslRequest } from "@/lib/qsl";
import { listRequests } from "@/lib/qsl-service";
import { routes } from "@/lib/routes";
import { usePortal } from "@/lib/store";
import { OutcomeBadge } from "./parts";

const actionLabel = (request: QslRequest) =>
  request.status === "Requested" ? "Open request" : request.status === "Draft" ? "Continue draft" : request.status === "Additional Information Required" ? "Respond" : request.status === "Result Released" ? "View result" : "View details";

export default function QualificationPage() {
  const { db } = usePortal();
  const { t } = useI18n();
  const router = useRouter();
  const [bucket, setBucket] = useState<QslBucket>("All");
  const all = listRequests(db);
  const rows = all.filter((request) => inBucket(request, bucket)).sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1));

  return (
    <>
      <PageHeading title="Qualification & Skill Rate Card" desc="Complete the skill rate card Buyers ask for. SLM uses it to assess your qualification and tier." />
      <div className="document-tabs" role="tablist" aria-label={t("Qualification request status")}>
        {QSL_BUCKETS.map((tab) => (
          <button key={tab} className={`document-tab ${bucket === tab ? "selected" : ""}`} role="tab" aria-selected={bucket === tab} onClick={() => setBucket(tab)}>
            {t(tab)}<span>{all.filter((request) => inBucket(request, tab)).length}</span>
          </button>
        ))}
      </div>
      <div className="card table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {["Reference", "Requesting Buyer", "Product category / Scope", "Requested on", "Due date", "Status", "Outcome / Tier", "Actions"].map((heading) => <th key={heading}>{t(heading)}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((request) => {
                const outcome = displayOutcome(request);
                const result = latestResult(request);
                return (
                  <tr key={request.id}>
                    <td><strong>{request.id}</strong></td>
                    <td>{request.buyer}</td>
                    <td><strong>{t(request.productCategory)}</strong><small>{request.scope}</small></td>
                    <td>{fmtDate(request.requestedAt)}</td>
                    <td>{fmtDate(request.dueDate)}</td>
                    <td><Badge status={request.status} /></td>
                    <td>{outcome ? <><OutcomeBadge outcome={outcome} />{result?.tier && outcome !== "Expired" ? <small>{result.tier}</small> : null}</> : "—"}</td>
                    <td><button className={`button small ${["Requested", "Draft", "Additional Information Required"].includes(request.status) ? "primary" : ""}`} onClick={() => router.push(routes.qualificationDetail(request.id))}>{t(actionLabel(request))}</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="table-empty">
              <div className="empty-icon">◫</div>
              <h3>{all.length ? t("No matching qualification requests") : t("No qualification requests yet")}</h3>
              <p>{all.length ? t("There are no requests in this group.") : t("No Buyer has asked for a skill rate card yet.")}</p>
              {all.length ? <button className="button" onClick={() => setBucket("All")}>{t("View all requests")}</button> : null}
            </div>
          )}
        </div>
        <div className="table-footer">
          <span>{t("Showing {n} of {total} requests", { n: rows.length, total: all.length })}</span>
          <span>{t("Mock supplier data · saved in this browser")}</span>
        </div>
      </div>
    </>
  );
}
