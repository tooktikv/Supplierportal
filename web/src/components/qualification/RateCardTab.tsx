"use client";

import type { ReactNode } from "react";
import DemoFill from "@/components/DemoFill";
import { Field, Input, Radios, Section } from "@/components/srm/fields";
import { fillDemoRateCard } from "@/lib/demo";
import { useI18n } from "@/lib/i18n";
import { emptyLine, emptySkill, inScope, skillGroups, type QslCriterion, type QslResponse, type SkillResponse } from "@/lib/qsl";
import { errorOf, type TabCtx } from "./ctx";

type GeneralKey = "effectiveFrom" | "validUntil" | "leadTimeDays" | "paymentTermsDays" | "overtimeWeekday" | "overtimeHoliday" | "escalationPct" | "notes";

function Tag({ color, children }: { color: "blue" | "amber" | "gray"; children: string }) {
  const { t } = useI18n();
  return <span className={`status ${color}`}>{t(children)}</span>;
}

function SkillSection({ ctx, criterion }: { ctx: TabCtx; criterion: QslCriterion }) {
  const { t } = useI18n();
  const { request, response } = ctx;
  const skill = response.skills[criterion.id] ?? emptySkill();
  const editable = ctx.canEdit && inScope(ctx.scope, criterion.id);
  const key = `skill.${criterion.id}`;
  const update = (change: (value: SkillResponse) => void) => ctx.edit((draft) => void change((draft.skills[criterion.id] ??= emptySkill())));
  const selected = request.ratingScale.find((item) => item.level === Number(skill.selfRating));
  const evidenceCount = response.evidence.filter((ref) => ref.targetId === criterion.id).length;
  const unit = `${response.currency || "—"} / ${response.rateBasis ? t(response.rateBasis) : "—"}`;
  const unusedLevel = request.ratingScale.map((item) => String(item.level)).find((level) => !skill.lines.some((line) => line.level === level)) ?? "";

  return (
    <Section
      num={request.criteria.indexOf(criterion) + 2}
      title={criterion.name}
      hint={criterion.description}
      extra={<><Tag color={criterion.mandatory ? "amber" : "gray"}>{criterion.mandatory ? "Mandatory" : "Optional"}</Tag><Tag color={criterion.source === "Central Standard" ? "blue" : "gray"}>{criterion.source}</Tag></>}
    >
      <div className="reg-s4"><div className="notice" style={{ marginBottom: 0 }}>{criterion.instructions}</div></div>
      <Radios name={`${key}-offered`} label="Does your company offer this skill?" options={["Yes", "No"] as const} value={skill.offered} required disabled={!editable} error={errorOf(ctx, `${key}.offered`)}
        onChange={(value) => update((draft) => void (draft.offered = value))} />
      {skill.offered === "Yes" && (
        <>
          <Field label="Self-rating" name={`${key}-selfRating`} span={2} required error={errorOf(ctx, `${key}.selfRating`)} hint={selected ? selected.description : "Your own rating. SLM verifies it separately."}>
            <select className="field-control" id={`${key}-selfRating`} value={skill.selfRating} disabled={!editable} onChange={(e) => update((draft) => void (draft.selfRating = e.target.value))}>
              <option value="">{t("Select a rating")}</option>
              {request.ratingScale.map((item) => <option key={item.level} value={item.level}>{item.level} · {t(item.name)}</option>)}
            </select>
          </Field>
          <Input name={`${key}-comment`} label="Comments / explanation" type="textarea" value={skill.comment} disabled={!editable} error={errorOf(ctx, `${key}.comment`)} hint="Optional · max 2000 characters"
            onChange={(value) => update((draft) => void (draft.comment = value))} />
          <div className="reg-s4">
            <div className="table-wrap">
              <table style={{ minWidth: 640 }}>
                <thead><tr>{[t("Level"), t("Headcount"), t("Average years of experience"), `${t("Rate")} (${unit})`, ""].map((heading, index) => <th key={index}>{heading}</th>)}</tr></thead>
                <tbody>
                  {skill.lines.map((line) => {
                    const lineKey = `${key}.line.${line.id}`;
                    const cell = (field: "level" | "headcount" | "avgYears" | "rate", control: ReactNode) => {
                      const error = errorOf(ctx, `${lineKey}.${field}`);
                      const warning = field === "rate" ? ctx.validation.warnings[`${lineKey}.rate`] : undefined;
                      return (
                        <td className={error ? "form-field has-error" : "form-field"} style={{ display: "table-cell" }}>
                          {control}
                          {error ? <span className="form-error" role="alert">{t(error)}</span> : warning ? <small>{t(warning)}</small> : null}
                        </td>
                      );
                    };
                    const set = (field: "level" | "headcount" | "avgYears" | "rate") => (value: string) =>
                      update((draft) => {
                        const target = draft.lines.find((item) => item.id === line.id);
                        if (target) target[field] = value;
                      });
                    return (
                      <tr key={line.id}>
                        {cell("level", (
                          <select className="field-control" aria-label={t("Level")} value={line.level} disabled={!editable} onChange={(e) => set("level")(e.target.value)}>
                            <option value="">{t("Select")}</option>
                            {request.ratingScale.map((item) => <option key={item.level} value={item.level}>{item.level} · {t(item.name)}</option>)}
                          </select>
                        ))}
                        {cell("headcount", <input className="field-control" aria-label={t("Headcount")} inputMode="numeric" value={line.headcount} disabled={!editable} onChange={(e) => set("headcount")(e.target.value)} />)}
                        {cell("avgYears", <input className="field-control" aria-label={t("Average years of experience")} inputMode="decimal" value={line.avgYears} disabled={!editable} onChange={(e) => set("avgYears")(e.target.value)} />)}
                        {cell("rate", <input className="field-control" aria-label={t("Rate")} inputMode="decimal" value={line.rate} disabled={!editable} onChange={(e) => set("rate")(e.target.value)} />)}
                        <td>
                          <button type="button" className="button small subtle danger" disabled={!editable} onClick={() => update((draft) => void (draft.lines = draft.lines.filter((item) => item.id !== line.id)))}>{t("Remove")}</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {skill.lines.length === 0 && <div className={`form-field ${errorOf(ctx, `${key}.lines`) ? "has-error" : ""}`} style={{ padding: "10px 12px" }}><small>{t("No rate lines yet.")}</small><span className="form-error" role="alert">{t(errorOf(ctx, `${key}.lines`) ?? "")}</span></div>}
            </div>
            <div className="srm-footer-actions" style={{ marginTop: 10, justifyContent: "flex-start", marginLeft: 0 }}>
              <button type="button" className="button small" disabled={!editable || skill.lines.length >= request.ratingScale.length} onClick={() => update((draft) => void draft.lines.push({ ...emptyLine(), level: unusedLevel }))}>{t("+ Add rate line")}</button>
            </div>
          </div>
          <div className="reg-s4">
            <div className={`form-field ${errorOf(ctx, `${key}.evidence`) ? "has-error" : ""}`}>
              <small>{criterion.evidenceRequired ? t("Evidence required") : t("Evidence optional")}: {t("{n} document(s) linked", { n: evidenceCount })}{" · "}<button type="button" className="text-link" onClick={() => ctx.goTab("Evidence")}>{t("Manage evidence")}</button></small>
              <span className="form-error" role="alert">{t(errorOf(ctx, `${key}.evidence`) ?? "")}</span>
            </div>
          </div>
        </>
      )}
    </Section>
  );
}

export default function RateCardTab({ ctx }: { ctx: TabCtx }) {
  const { t } = useI18n();
  const { request, response } = ctx;
  const generalEditable = ctx.canEdit && inScope(ctx.scope, "general");
  const field = (key: GeneralKey) => ({
    name: `general-${key}`, value: response[key], disabled: !generalEditable, error: errorOf(ctx, `general.${key}`),
    onChange: (value: string) => void ctx.edit((draft) => void (draft[key] = value)),
  });
  const groups = skillGroups(request);

  return (
    <div className="reg-main">
      {ctx.canEdit && ctx.scope === "all" && <DemoFill onFill={() => ctx.edit((draft: QslResponse) => fillDemoRateCard(request, draft))} />}
      {!ctx.canEdit && <div className="notice">{t(ctx.scope ? "Your role is view-only, so this rate card cannot be changed." : "This rate card is read-only because it has been submitted. SLM will ask for a revision if changes are needed.")}</div>}
      {ctx.canEdit && ctx.scope !== "all" && <div className="notice warning">{t("SLM asked for specific changes. Only the items it listed can be edited.")}</div>}
      <Section num={1} title="Commercial terms" hint="Quote your standard list rates before any negotiated discount. SLM compares these terms across suppliers.">
        <Input name="general-currency" label="Currency" type="select" options={request.currencies} value={response.currency} span={1} required disabled={!generalEditable} error={errorOf(ctx, "general.currency")} onChange={(value) => ctx.edit((draft) => void (draft.currency = value))} />
        <Input name="general-rateBasis" label="Rate basis" type="select" options={request.rateBases} value={response.rateBasis} span={1} required disabled={!generalEditable} error={errorOf(ctx, "general.rateBasis")} onChange={(value) => ctx.edit((draft) => void (draft.rateBasis = value as QslResponse["rateBasis"]))} />
        <Input {...field("effectiveFrom")} label="Rates effective from" type="date" span={1} required />
        <Input {...field("validUntil")} label="Rates valid until" type="date" span={1} required />
        <Input {...field("leadTimeDays")} label="Mobilisation lead time (days)" span={1} hint="Optional" />
        <Input {...field("paymentTermsDays")} label="Payment terms (days)" span={1} hint="Optional" />
        <Input {...field("escalationPct")} label="Annual rate escalation (%)" span={1} hint="Optional" />
        <div className="reg-s1" />
        <Input {...field("overtimeWeekday")} label="Overtime multiplier · working day" span={1} hint="Optional · e.g. 1.5" />
        <Input {...field("overtimeHoliday")} label="Overtime multiplier · holiday" span={1} hint="Optional · e.g. 3" />
        <Input {...field("notes")} label="Other terms and conditions" type="textarea" hint="Optional · e.g. travel, tooling or minimum engagement that the rates do not include" />
      </Section>
      {groups.map((group) => (
        <div key={group} className="reg-main">
          <div className="task-group-head"><h3>{t(group)}</h3><small>{t("{n} skill(s)", { n: request.criteria.filter((item) => item.group === group).length })}</small></div>
          {request.criteria.filter((item) => item.group === group).map((criterion) => <SkillSection key={criterion.id} ctx={ctx} criterion={criterion} />)}
        </div>
      ))}
    </div>
  );
}
