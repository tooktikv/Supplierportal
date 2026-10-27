"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge, InfoItem } from "@/components/ui";
import { fmtDate } from "@/lib/docs";
import { gateOf, needsSample } from "@/lib/policy";
import { routes } from "@/lib/routes";
import { usePortal } from "@/lib/store";
import { kb } from "./sample-utils";
import { useSampleActions } from "./useSampleActions";
import { buyerRequestOf, canSubmitSample } from "@/lib/sample-request-flow";
import BuyerRequestBrief from "./BuyerRequestBrief";

const timeFmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

export default function SampleDetails({ id }: { id: string }) {
  const { db } = usePortal();
  const router = useRouter();
  const { editDraft } = useSampleActions();
  const r = db.requests.find((x) => x.id === id);

  useEffect(() => {
    if (!r) router.replace(routes.samples);
  }, [r, router]);

  if (!r) return null;
  const outcome = r.evaluationOutcome || r.outcome;
  const onsite = buyerRequestOf(r).reviewMode === "Onsite";
  const backToList = () => router.push(routes.samples);
  const revisions = r.revisions || [];

  return (
    <>
      <div className="detail-top">
        <div>
          <div className="breadcrumbs" style={{ marginBottom: 11 }}>
            <button className="text-link" onClick={backToList}>
              Sample Request
            </button>{" "}
            / {r.id}
          </div>
          <div className="detail-title">
            <h1>{r.name}</h1>
            <Badge status={r.status} />
          </div>
          <p style={{ color: "var(--muted)", fontSize: 11, margin: "6px 0 0" }}>
            {r.id} · {r.category} · {onsite ? "Onsite review" : "Digital document review"}
          </p>
        </div>
        <div className="footer-right">
          {canSubmitSample(r) ? (
            <>
              <button className="button" onClick={() => editDraft(r.id)}>
                {r.status === "Draft" ? "Edit draft" : "Provide sample information"}
              </button>
            </>
          ) : (
            <button className="button" onClick={backToList}>
              Back to list
            </button>
          )}
        </div>
      </div>
      {r.status === "Under Review" && <div className="notice">Awaiting Buyer review.{onsite ? " Your proposed onsite visit is not confirmed until Buyer accepts the appointment." : " Your sample details and documents have been sent for review."}</div>}
      <div className="detail-layout">
        <div className="detail-main">
          <div className="card detail-section">
            <BuyerRequestBrief request={r} />
          </div>
          {r.supplierSubmission && <div className="card detail-section">
            <h2>Supplier sample information</h2>
            <div className="info-grid">
              <InfoItem label="Sample product name" value={r.supplierSubmission.productName} />
              <InfoItem label="Supplier product code / model" value={r.supplierSubmission.productCode} />
              <InfoItem label="Specification" value={r.supplierSubmission.specification} />
              <InfoItem label="Batch / lot" value={r.supplierSubmission.batch} />
              <InfoItem label="Differences from Buyer requirements" value={r.supplierSubmission.deviations} />
              <InfoItem label="Supplier contact" value={`${r.supplierSubmission.contactName} · ${r.supplierSubmission.contactEmail}`} />
              <InfoItem label="Message to Buyer" value={r.supplierSubmission.notes} />
              <InfoItem label="Submitted on" value={r.supplierSubmission.submittedAt ? fmtDate(r.supplierSubmission.submittedAt) : "Draft — not sent to Buyer"} />
              <InfoItem label="Last updated" value={fmtDate(r.updated)} />
            </div>
          </div>}
          {onsite && r.supplierSubmission ? (
            <div className="card detail-section">
              <h2>Proposed onsite review</h2>
              <div className="info-grid">
                <InfoItem label="Sample quantity" value={`${r.supplierSubmission.quantity} ${r.supplierSubmission.unit}`} />
                <InfoItem label="Site / factory" value={r.supplierSubmission.siteName} />
                <InfoItem label="Onsite review address" value={r.supplierSubmission.siteAddress} />
                <InfoItem label="Proposed visit date" value={fmtDate(r.supplierSubmission.visitDate)} />
                <InfoItem label="Proposed time (site local time)" value={r.supplierSubmission.visitTime} />
                <InfoItem label="Onsite contact" value={r.supplierSubmission.contactName} />
                <InfoItem label="Onsite contact phone" value={r.supplierSubmission.contactPhone} />
                <InfoItem label="Access / safety requirements" value={r.supplierSubmission.visitNotes} />
              </div>
              <p className="mock-note" style={{ margin: "14px 0 0" }}>
                Proposed appointment only; Buyer confirmation is required.
              </p>
            </div>
          ) : null}
          {!onsite || r.supplierSubmission || (r.files || []).length ? (
            <div className="card detail-section">
              <h2>Sample documents & specifications</h2>
              <div className="info-grid">
                <InfoItem label="Product specification" value={r.specification} />
                <InfoItem label="Technical description" value={r.digitalDescription} />
                <InfoItem label="Reference URL" value={r.url} />
              </div>
              <div className="file-list">
                {(r.files || []).length ? (
                  (r.files || []).map((f, i) => (
                    <div className="file-row" key={f.uid || `${f.name}-${i}`}>
                      <span>
                        ▤ &nbsp;{f.name}{" "}
                        <small>
                          {f.type || "file"} · {kb(f.size)} KB
                        </small>
                      </span>
                      <span className="mock-note">Browser-only mock file</span>
                    </div>
                  ))
                ) : (
                  <small>No digital attachments</small>
                )}
              </div>
            </div>
          ) : null}
          {outcome ? (
            <div className="card detail-section">
              <h2>Evaluation result</h2>
              <div className={`result-banner ${outcome === "Rejected" ? "rejected" : ""}`}>
                <strong>{outcome === "Approved" ? "Evaluation approved" : outcome === "Rejected" ? "Evaluation rejected" : "Evaluation update"}</strong>
                <br />
                {r.feedback || "An internal evaluator recorded this result."}
                <br />
                <small>Decision date: {fmtDate(r.decisionDate)}</small>
              </div>
            </div>
          ) : null}
          {r.feedback && !r.outcome ? (
            <div className="card detail-section">
              <h2>Evaluator feedback</h2>
              <div className="feedback">
                <strong>{canSubmitSample(r) ? "Action requested" : "Previous Buyer feedback"}</strong>
                {r.feedback}
                {r.requiredCorrections ? (
                  <>
                    <br />
                    <br />
                    <strong>Requested corrections</strong>
                    {r.requiredCorrections}
                  </>
                ) : null}
              </div>
            </div>
          ) : null}
          {revisions.length ? (
            <div className="card detail-section">
              <h2>Responses & revisions</h2>
              {revisions
                .slice()
                .reverse()
                .map((v, i) => (
                  <div className="activity" key={`${v.date}-${i}`}>
                    <span className="activity-dot" />
                    <div>
                      <strong>
                        Revision {revisions.length - i} · {fmtDate(v.date)}
                      </strong>
                      <small>
                        {v.comments || "Information updated"} · {v.files?.length || 0} attachment(s)
                      </small>
                    </div>
                  </div>
                ))}
            </div>
          ) : null}
        </div>
        <aside className="detail-side">
          <div className="card detail-section">
            <h2>Request timeline</h2>
            <div className="timeline">
              {(r.history || [])
                .slice()
                .reverse()
                .map((h, i) => (
                  <div className="timeline-event" key={`${h[1]}-${i}`}>
                    <strong>{h[0]}</strong>
                    <small>
                      {fmtDate(h[1])} · {timeFmt.format(new Date(h[1]))}
                    </small>
                  </div>
                ))}
            </div>
          </div>
          <div className="card detail-section">
            <h2>Submission overview</h2>
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                <span>Current status</span>
                <Badge status={r.status} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                <span>Sample required</span>
                <strong>{needsSample(r.category) ? "Yes" : "No — exempt"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                <span>Sample gate</span>
                <strong>{gateOf(r)}</strong>
              </div>
            </div>
          </div>
          <p className="mock-note">Mock workflow only. Procurement evaluation and physical receipt are not connected to a live system.</p>
        </aside>
      </div>
    </>
  );
}
