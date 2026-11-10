"use client";

import { useState } from "react";
import { fmtDate } from "@/lib/docs";
import { useI18n } from "@/lib/i18n";
import { levelName, type QslRequest, type QslSubmission } from "@/lib/qsl";
import { usePortal } from "@/lib/store";
import { InfoItem } from "@/components/ui";
import type { TabCtx } from "./ctx";
import { StatusTimeline } from "./OverviewTab";
import { Block, timeLabel } from "./parts";

/** Read-only copy of what was sent, including the profile as it was on the submission date. */
function Snapshot({ request, submission }: { request: QslRequest; submission: QslSubmission }) {
  const { t } = useI18n();
  const { response, profile } = submission;
  return (
    <div style={{ marginTop: 14, display: "grid", gap: 14 }}>
      <div className="info-grid">
        <InfoItem label="Currency" value={response.currency} />
        <InfoItem label="Rate basis" value={response.rateBasis ? t(response.rateBasis) : ""} />
        <InfoItem label="Rates effective from" value={response.effectiveFrom ? fmtDate(response.effectiveFrom) : ""} />
        <InfoItem label="Rates valid until" value={response.validUntil ? fmtDate(response.validUntil) : ""} />
      </div>
      <div className="table-wrap">
        <table style={{ minWidth: 640 }}>
          <thead><tr>{["Skill", "Self-rating", "Rate lines (level × headcount @ rate)"].map((h) => <th key={h}>{t(h)}</th>)}</tr></thead>
          <tbody>
            {request.criteria.map((item) => {
              const skill = response.skills[item.id];
              if (!skill) return null;
              return (
                <tr key={item.id}>
                  <td><strong>{item.name}</strong></td>
                  <td>{skill.offered === "Yes" ? `${skill.selfRating} · ${t(levelName(request, skill.selfRating))}` : t("Not offered")}</td>
                  <td>{skill.lines.map((line) => `L${line.level} × ${line.headcount} @ ${Number(line.rate).toLocaleString()}`).join(" · ") || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div>
        <strong style={{ fontSize: 11 }}>{t("Evidence snapshot")}</strong>
        <div className="file-list">
          {response.evidence.length === 0 && <small>{t("No evidence linked yet.")}</small>}
          {response.evidence.map((ref) => <div className="file-row" key={ref.id}><span className="file-name">{ref.docName} · v{ref.version}<small>{ref.fileNames.join(", ")}</small></span></div>)}
        </div>
      </div>
      <p className="mock-note">{t("Profile snapshot: {sites} site(s), {categories} categor(ies), {certs} certification(s), captured {date}.", { sites: profile.sites.length, categories: profile.categories.length, certs: profile.certifications.length, date: fmtDate(profile.capturedAt) })}</p>
    </div>
  );
}

export default function HistoryTab({ ctx }: { ctx: TabCtx }) {
  const { t } = useI18n();
  const { db } = usePortal();
  const { request } = ctx;
  const [open, setOpen] = useState<string | null>(null);
  const audit = db.qsl.audit.filter((entry) => entry.requestId === request.id && entry.supplierId === db.profile.id);

  return (
    <div className="reg-main">
      <Block title="Submissions and revisions">
        {request.submissions.length === 0 ? <small>{t("Nothing submitted yet.")}</small> : (
          <div className="table-wrap">
            <table style={{ minWidth: 640 }}>
              <thead><tr>{["Reference", "Type", "Submitted on", "Submitted by", "Revises", ""].map((h, index) => <th key={index}>{t(h)}</th>)}</tr></thead>
              <tbody>
                {request.submissions.slice().reverse().flatMap((item) => [
                  <tr key={item.ref}>
                    <td><strong>{item.ref}</strong><small>V{item.version}</small></td>
                    <td>{t(item.kind)}</td>
                    <td>{fmtDate(item.submittedAt)} · {timeLabel(item.submittedAt)}</td>
                    <td>{item.submittedBy}<small>{t(item.role)}</small></td>
                    <td>{item.revisesVersion ? `V${item.revisesVersion}` : "—"}</td>
                    <td><button className="button small" onClick={() => setOpen(open === item.ref ? null : item.ref)}>{t(open === item.ref ? "Hide" : "View snapshot")}</button></td>
                  </tr>,
                  open === item.ref ? <tr key={`${item.ref}-detail`}><td colSpan={6}><Snapshot request={request} submission={item} /></td></tr> : null,
                ])}
              </tbody>
            </table>
          </div>
        )}
      </Block>
      {request.infoRequests.length > 0 && (
        <Block title="Additional information requests">
          <div className="activity-list">
            {request.infoRequests.slice().reverse().map((info) => (
              <div className="activity" key={info.id}>
                <span className="activity-dot" />
                <div>
                  <strong>{fmtDate(info.requestedAt)} · {info.from}</strong>
                  <small>{t("{n} item(s)", { n: info.items.length })} · {info.status === "Open" ? t("Waiting for your reply") : t("Answered in V{n} on {date}", { n: info.respondedVersion ?? "", date: fmtDate(info.respondedAt) })}</small>
                </div>
              </div>
            ))}
          </div>
        </Block>
      )}
      <Block title="Status history"><StatusTimeline ctx={ctx} /></Block>
      <Block title="Activity log">
        {audit.length === 0 ? <small>{t("No activity recorded yet.")}</small> : (
          <div className="table-wrap">
            <table style={{ minWidth: 640 }}>
              <thead><tr>{["Date", "Action", "By", "Reference", "Previous → New"].map((h) => <th key={h}>{t(h)}</th>)}</tr></thead>
              <tbody>
                {audit.map((entry) => (
                  <tr key={entry.id}>
                    <td>{fmtDate(entry.at)}<small>{timeLabel(entry.at)}</small></td>
                    <td><strong>{t(entry.action)}</strong></td>
                    <td>{entry.by}<small>{t(entry.role)}</small></td>
                    <td>{entry.ref}</td>
                    <td>{entry.prev || entry.next ? `${entry.prev ?? "—"} → ${entry.next ?? "—"}` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Block>
    </div>
  );
}
