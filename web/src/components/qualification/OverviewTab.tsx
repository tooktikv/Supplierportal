"use client";

import { Input } from "@/components/srm/fields";
import { Badge, InfoItem } from "@/components/ui";
import { fmtDate } from "@/lib/docs";
import { useI18n } from "@/lib/i18n";
import { latestSubmission, nextAction, STATUS_HELP, type QslInfoRequest } from "@/lib/qsl";
import { acknowledge } from "@/lib/qsl-service";
import { usePortal } from "@/lib/store";
import type { TabCtx, TabKey } from "./ctx";
import { errorOf } from "./ctx";
import { Block, timeLabel } from "./parts";
import { useQsl } from "./useQsl";

export function StatusTimeline({ ctx }: { ctx: TabCtx }) {
  const { t } = useI18n();
  return (
    <div className="timeline">
      {ctx.request.history.slice().reverse().map((entry, index) => (
        <div className="timeline-event" key={`${entry.at}-${index}`}>
          <strong>{t(entry.status)}</strong>
          <small>{fmtDate(entry.at)} · {timeLabel(entry.at)} · {entry.by}{entry.note ? ` · ${entry.note}` : ""}</small>
        </div>
      ))}
    </div>
  );
}

function InfoRequestBlock({ ctx, info }: { ctx: TabCtx; info: QslInfoRequest }) {
  const { t } = useI18n();
  const { request } = ctx;
  const open = info.status === "Open";
  const label = (targetId: string): { name: string; tab: TabKey } => {
    const criterion = request.criteria.find((item) => item.id === targetId);
    if (criterion) return { name: criterion.name, tab: "Rate card" };
    const evidence = request.requiredEvidence.find((item) => item.id === targetId);
    return evidence ? { name: evidence.title, tab: "Evidence" } : { name: t("Commercial terms"), tab: "Rate card" };
  };
  return (
    <Block title="Additional information request" extra={<Badge status={open ? "Action Required" : "Completed"} />}>
      <div className="feedback" style={{ marginBottom: 12 }}>
        <strong>{info.from} · {fmtDate(info.requestedAt)}</strong>
        {info.message}
        <br /><small>{t("Reply by {date}", { date: fmtDate(info.dueDate) })}</small>
      </div>
      {info.items.map((item, index) => {
        const target = label(item.targetId);
        const key = `${info.id}:${index}`;
        const reply = open ? ctx.response.replies[key] ?? "" : "";
        return (
          <div key={key} style={{ marginBottom: 14 }}>
            <strong style={{ fontSize: 11 }}>{index + 1}. {target.name}</strong>
            <p style={{ margin: "4px 0 6px", fontSize: 11, color: "var(--muted)" }}>{item.text} {open && <button className="text-link" onClick={() => ctx.goTab(target.tab)}>{t("Go to {tab}", { tab: t(target.tab) })} →</button>}</p>
            {open && (
              <div className="reg-grid">
                <Input name={`reply-${key}`} label="Your reply" type="textarea" value={reply} disabled={!ctx.canEdit} required error={errorOf(ctx, `reply.${key}`)} onChange={(value) => void ctx.edit((draft) => void (draft.replies[key] = value))} />
              </div>
            )}
          </div>
        );
      })}
      {!open && <small>{t("Answered in revision V{n} on {date}.", { n: info.respondedVersion ?? "", date: fmtDate(info.respondedAt) })}</small>}
    </Block>
  );
}

export default function OverviewTab({ ctx }: { ctx: TabCtx }) {
  const { t } = useI18n();
  const { toast } = usePortal();
  const { run, allowed } = useQsl();
  const { request } = ctx;
  const last = latestSubmission(request);
  const groups = [...new Set(request.criteria.map((item) => item.group))];

  return (
    <div className="detail-layout">
      <div className="detail-main">
        <Block title="Request details">
          <div className="info-grid">
            <InfoItem label="Request reference" value={request.id} />
            <InfoItem label="Requesting Buyer" value={request.buyer} />
            <InfoItem label="Product category" value={t(request.productCategory)} />
            <InfoItem label="Qualification scope" value={request.scope} />
            <InfoItem label="Requested on" value={fmtDate(request.requestedAt)} />
            <InfoItem label="Submission due date" value={fmtDate(request.dueDate)} />
            <InfoItem label="Acknowledged" value={request.acknowledgedAt ? `${fmtDate(request.acknowledgedAt)} · ${request.acknowledgedBy}` : t("Not yet")} />
            <InfoItem label="Next action" value={t(nextAction(request))} />
          </div>
          {!request.acknowledgedAt && request.status === "Requested" && allowed("acknowledge") && (
            <div style={{ marginTop: 14 }}><button className="button" onClick={() => { if (run((draft) => acknowledge(draft, request.id)).ok) toast("Request acknowledged."); }}>{t("Acknowledge request")}</button></div>
          )}
        </Block>
        {last && (
          <Block title="Latest submission">
            <div className="info-grid">
              <InfoItem label="Submission reference" value={last.ref} />
              <InfoItem label="Type" value={last.kind === "Initial" ? "Initial submission" : `Revision of V${last.revisesVersion}`} />
              <InfoItem label="Submitted by" value={`${last.submittedBy} · ${t(last.role)}`} />
              <InfoItem label="Submitted on" value={`${fmtDate(last.submittedAt)} · ${timeLabel(last.submittedAt)}`} />
            </div>
            <div className="notice" style={{ marginTop: 14, marginBottom: 0 }}>{t("A submission is not a qualification decision. SLM verifies your ratings and decides the outcome.")}</div>
          </Block>
        )}
        <Block title="Submission instructions"><p style={{ margin: 0, fontSize: 11, lineHeight: 1.6 }}>{request.instructions}</p></Block>
        {request.infoRequests.slice().reverse().map((info) => <InfoRequestBlock key={info.id} ctx={ctx} info={info} />)}
        <Block title="Skills and evidence required">
          <div className="table-wrap">
            <table style={{ minWidth: 640 }}>
              <thead><tr>{["Skill group", "Skill", "Defined by", "Required", "Evidence"].map((h) => <th key={h}>{t(h)}</th>)}</tr></thead>
              <tbody>
                {groups.flatMap((group) => request.criteria.filter((item) => item.group === group).map((item, index) => (
                  <tr key={item.id}>
                    <td>{index === 0 ? <strong>{t(group)}</strong> : ""}</td>
                    <td><strong>{item.name}</strong><small>{item.description}</small></td>
                    <td>{t(item.source)}</td>
                    <td>{t(item.mandatory ? "Mandatory" : "Optional")}</td>
                    <td>{item.evidenceRequired ? t("Required") : t("Optional")}</td>
                  </tr>
                )))}
                {request.requiredEvidence.map((item) => (
                  <tr key={item.id}><td><strong>{t("Company evidence")}</strong></td><td><strong>{item.title}</strong><small>{item.description}</small></td><td>{t("Central Standard")}</td><td>{t(item.mandatory ? "Mandatory" : "Optional")}</td><td>{t("Required")}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mock-note" style={{ marginTop: 10 }}>{t("Skills, levels, weights and thresholds are set by SLM and cannot be changed here.")}</p>
        </Block>
        <Block title="Rating scale">
          <div className="table-wrap">
            <table style={{ minWidth: 520 }}>
              <thead><tr>{["Level", "Name", "What it means"].map((h) => <th key={h}>{t(h)}</th>)}</tr></thead>
              <tbody>{request.ratingScale.map((item) => <tr key={item.level}><td><strong>{item.level}</strong></td><td>{t(item.name)}</td><td>{item.description}</td></tr>)}</tbody>
            </table>
          </div>
        </Block>
      </div>
      <aside className="detail-side">
        <Block title="Status"><div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10 }}><span>{t("Request status")}</span><Badge status={request.status} /></div>
          <small style={{ color: "var(--muted)", fontSize: 10, lineHeight: 1.5 }}>{t(STATUS_HELP[request.status])}</small>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}><span>{t("Last updated")}</span><strong>{fmtDate(request.updated)}</strong></div>
        </div></Block>
        <Block title="Status history"><StatusTimeline ctx={ctx} /></Block>
        <p className="mock-note">{t("Status and results come from SLM. You cannot change them.")}</p>
      </aside>
    </div>
  );
}
