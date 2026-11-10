"use client";

import { useEffect } from "react";
import { InfoItem } from "@/components/ui";
import { fmtDate } from "@/lib/docs";
import { useI18n } from "@/lib/i18n";
import { displayOutcome, latestResult, STATUS_HELP } from "@/lib/qsl";
import { recordResultViewed } from "@/lib/qsl-service";
import type { TabCtx } from "./ctx";
import { Block, OutcomeBadge } from "./parts";
import { useQsl } from "./useQsl";

/** Only what SLM released: outcome, tier and the verified ratings marked visible. Self-rating is shown beside it, never merged. */
export default function ResultTab({ ctx }: { ctx: TabCtx }) {
  const { t } = useI18n();
  const { db, run } = useQsl();
  const { request } = ctx;
  const result = latestResult(request);
  const outcome = displayOutcome(request);
  const logged = db.qsl.audit.some((entry) => entry.requestId === request.id && entry.action === "View released result" && entry.ref === result?.id);

  useEffect(() => {
    if (result && !logged) run((draft) => recordResultViewed(draft, request.id));
  }, [result, logged, request.id, run]);

  if (!result || !outcome) {
    return (
      <div className="card table-card"><div className="table-empty">
        <div className="empty-icon">◫</div>
        <h3>{t("No result released yet")}</h3>
        <p>{t(STATUS_HELP[request.status])}</p>
      </div></div>
    );
  }

  const basis = request.submissions.find((item) => item.version === result.basedOnVersion);
  const bad = outcome === "Not Qualified" || outcome === "Expired" || outcome === "Suspended";
  const rows = request.criteria.filter((item) => basis?.response.skills[item.id]?.offered === "Yes");

  return (
    <div className="reg-main">
      <div className={`result-banner ${bad ? "rejected" : ""}`} style={{ padding: 16 }}>
        <strong style={{ fontSize: 13 }}>{t(outcome)}{result.tier && outcome !== "Not Qualified" ? ` · ${result.tier}` : ""}</strong>
        <br />
        {outcome === "Expired" ? t("This qualification expired on {date}. A new request is needed.", { date: fmtDate(result.expiryDate) }) : outcome === "Suspended" ? t("This qualification is suspended. Contact the Buyer for the conditions to reinstate it.") : result.tierNote || result.feedback}
      </div>
      <Block title="Qualification result" extra={<OutcomeBadge outcome={outcome} />}>
        <div className="info-grid">
          <InfoItem label="Tier" value={result.tier || "—"} />
          <InfoItem label="Approved product category" value={t(result.approvedCategory)} />
          <InfoItem label="Qualification scope" value={result.approvedScope} />
          <InfoItem label="Released on" value={fmtDate(result.releasedAt)} />
          <InfoItem label="Effective date" value={result.effectiveDate ? fmtDate(result.effectiveDate) : "—"} />
          <InfoItem label="Expiry date" value={result.expiryDate ? fmtDate(result.expiryDate) : "—"} />
          <InfoItem label="Based on submission" value={basis?.ref ?? `V${result.basedOnVersion}`} />
        </div>
      </Block>
      <Block title="Self-rating and verified rating">
        <div className="table-wrap">
          <table style={{ minWidth: 640 }}>
            <thead><tr>{["Skill", "Your self-rating", "Verified rating", "Difference"].map((h) => <th key={h}>{t(h)}</th>)}</tr></thead>
            <tbody>
              {rows.map((item) => {
                const self = Number(basis?.response.skills[item.id].selfRating);
                const verified = result.verified.find((entry) => entry.criterionId === item.id);
                const shown = verified?.visible ? verified.rating : null;
                const gap = shown === null ? null : shown - self;
                return (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong><small>{t(item.group)}</small></td>
                    <td>{self || "—"}</td>
                    <td>{shown ?? <span className="mock-note">{t("Not released to suppliers")}</span>}</td>
                    <td>{gap === null ? "—" : gap === 0 ? t("Same") : gap > 0 ? `+${gap}` : gap}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mock-note" style={{ marginTop: 10 }}>{t("The verified rating is set by SLM after verification. You cannot edit it, and it never replaces your self-rating.")}</p>
      </Block>
      {result.feedback && <Block title="Feedback"><div className="feedback"><strong>{t("Feedback from SLM")}</strong>{result.feedback}</div></Block>}
      <Block title="Result history">
        <div className="table-wrap">
          <table style={{ minWidth: 640 }}>
            <thead><tr>{["Released on", "Outcome", "Tier", "Effective date", "Expiry date", "Based on"].map((h) => <th key={h}>{t(h)}</th>)}</tr></thead>
            <tbody>
              {request.results.slice().reverse().map((item, index) => (
                <tr key={item.id}>
                  <td>{fmtDate(item.releasedAt)}</td>
                  <td>{index === 0 ? <OutcomeBadge outcome={outcome} /> : <span className="status gray">{t("Superseded")}</span>}{index !== 0 && <small>{t(item.outcome)}</small>}</td>
                  <td>{item.tier || "—"}</td>
                  <td>{item.effectiveDate ? fmtDate(item.effectiveDate) : "—"}</td>
                  <td>{item.expiryDate ? fmtDate(item.expiryDate) : "—"}</td>
                  <td>V{item.basedOnVersion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Block>
    </div>
  );
}
