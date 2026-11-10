"use client";

import { useState } from "react";
import { Field, Input, Radios, Section } from "@/components/srm/fields";
import { DOC_TYPES, docVersions, fmtDate, trackFile } from "@/lib/docs";
import { useI18n } from "@/lib/i18n";
import { inScope, QSL_RULES, validateEvidenceFile, type EvidenceRef } from "@/lib/qsl";
import { attachDocument, docKey, removeEvidence, uploadEvidence } from "@/lib/qsl-service";
import { usePortal } from "@/lib/store";
import type { FileMeta } from "@/lib/types";
import { errorOf, type TabCtx } from "./ctx";
import { useQsl } from "./useQsl";

interface Target { id: string; title: string; description: string; types: string[]; mandatory: boolean; errorKey: string }

function refState(ref: EvidenceRef): { label: string; color: string } {
  const days = ref.expiry ? (new Date(`${ref.expiry}T23:59:59`).getTime() - Date.now()) / 864e5 : Infinity;
  if (days < 0) return { label: "Expired", color: "red" };
  if (days <= QSL_RULES.expiringSoonDays) return { label: "Expiring Soon", color: "amber" };
  return { label: "Valid", color: "green" };
}

function AddEvidence({ ctx, target, replaces, onDone }: { ctx: TabCtx; target: Target; replaces?: string; onDone?: () => void }) {
  const { t } = useI18n();
  const { toast } = usePortal();
  const { db, run } = useQsl();
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [docId, setDocId] = useState("");
  const [form, setForm] = useState({ name: target.title, type: target.types.length === 1 ? target.types[0] : "", issue: "", expiry: "", note: "" });
  const [file, setFile] = useState<FileMeta | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const types = target.types.length ? target.types : DOC_TYPES;
  const attached = new Set(ctx.response.evidence.filter((ref) => ref.targetId === target.id).map((ref) => ref.docId));
  const eligible = db.documents
    .map((doc, index) => ({ doc, id: docKey(db, index) }))
    .filter(({ doc, id }) => types.includes(doc.type) && docVersions(doc).length > 0 && !attached.has(id));
  const set = (key: keyof typeof form) => (value: string) => { setErrors({}); setForm((current) => ({ ...current, [key]: value })); };

  const finish = () => { setDocId(""); setFile(null); setErrors({}); setForm({ ...form, issue: "", expiry: "", note: "" }); onDone?.(); };

  const attach = () => {
    if (!docId) return setErrors({ docId: "Select a document." });
    if (run((draft) => attachDocument(draft, ctx.request.id, target.id, docId, form.note)).ok) { toast("Evidence attached."); finish(); }
  };

  const upload = () => {
    if (!file) return setErrors({ files: "Choose a file." });
    const result = run((draft) => uploadEvidence(draft, ctx.request.id, target.id, { ...form, files: [file], replaces }));
    if (result.ok) { toast("Evidence uploaded."); finish(); }
    else if (result.validation) setErrors(result.validation.errors);
  };

  return (
    <>
      <Radios name={`mode-${target.id}`} label="Add evidence" options={["existing", "new"] as const} value={mode} onChange={(value) => { setErrors({}); setMode(value); }}
        renderLabel={(option) => (option === "existing" ? t("Use a document from Company Profile") : t("Upload a new document"))} />
      {mode === "existing" ? (
        <>
          <Field label="Document" name={`doc-${target.id}`} span={3} error={errors.docId} hint="Documents of the accepted types that are already in your Company Profile.">
            <select className="field-control" id={`doc-${target.id}`} value={docId} onChange={(e) => { setErrors({}); setDocId(e.target.value); }}>
              <option value="">{eligible.length ? t("Select a document") : t("No matching document available")}</option>
              {eligible.map(({ doc, id }) => <option key={id} value={id}>{doc.name} · v{docVersions(doc).length}{doc.expiry && doc.expiry !== "—" ? ` · ${t("Expiry date")} ${fmtDate(doc.expiry)}` : ""}</option>)}
            </select>
          </Field>
          <Input name={`note-${target.id}`} label="Note" value={form.note} span={4} error={errors.note} hint="Optional" onChange={set("note")} />
          <div className="reg-s4"><button type="button" className="button primary" onClick={attach}>{t("Attach document")}</button></div>
        </>
      ) : (
        <>
          <Input name={`name-${target.id}`} label="Document name" value={form.name} span={2} required error={errors.name} hint="Uploading the same name and type adds a new version instead of a duplicate." onChange={set("name")} />
          <Input name={`type-${target.id}`} label="Document type" type="select" options={types} value={form.type} span={2} required error={errors.type} onChange={set("type")} />
          <Input name={`issue-${target.id}`} label="Issue date" type="date" value={form.issue} span={1} error={errors.issue} hint="Optional" onChange={set("issue")} />
          <Input name={`expiry-${target.id}`} label="Expiry date" type="date" value={form.expiry} span={1} error={errors.expiry} hint="Leave empty if it does not expire" onChange={set("expiry")} />
          <Input name={`desc-${target.id}`} label="Description" value={form.note} span={2} error={errors.note} hint="Optional" onChange={set("note")} />
          <Field label="File" name={`file-${target.id}`} span={4} required error={errors.files} hint={`PDF, JPG or PNG · max ${QSL_RULES.maxFileMb} MB`}>
            <input className="field-control" id={`file-${target.id}`} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => {
              const picked = e.target.files?.[0];
              e.target.value = "";
              if (!picked) return;
              const problem = validateEvidenceFile(picked);
              if (problem) { setFile(null); return toast(t(problem, { mb: QSL_RULES.maxFileMb })); }
              setErrors({});
              setFile(trackFile(picked, picked.type || picked.name.split(".").pop() || ""));
            }} />
            {file && <small>{file.name}</small>}
          </Field>
          <div className="reg-s4"><button type="button" className="button primary" onClick={upload}>{t(replaces ? "Replace evidence" : "Upload and attach")}</button></div>
        </>
      )}
    </>
  );
}

function TargetSection({ ctx, target }: { ctx: TabCtx; target: Target }) {
  const { t } = useI18n();
  const { run } = useQsl();
  const { toast } = usePortal();
  const [replacing, setReplacing] = useState<string | null>(null);
  const refs = ctx.response.evidence.filter((ref) => ref.targetId === target.id);
  const editable = ctx.canUpload && ctx.scope !== null && inScope(ctx.scope, target.id);
  const error = errorOf(ctx, target.errorKey);

  return (
    <Section title={target.title} hint={target.description} extra={<span className={`status ${target.mandatory ? "amber" : "gray"}`}>{t(target.mandatory ? "Mandatory" : "Optional")}</span>}>
      <div className={`reg-s4 form-field ${error ? "has-error" : ""}`}>
        {refs.length === 0 ? <small>{t("No evidence linked yet.")}</small> : (
          <div className="file-list">
            {refs.map((ref) => {
              const state = refState(ref);
              const problem = errorOf(ctx, `evidenceRef.${ref.id}`) ?? ctx.validation.warnings[`evidenceRef.${ref.id}`];
              return (
                <div className="file-row" key={ref.id}>
                  <span className="file-name">{ref.docName} · v{ref.version}<small>{t(ref.docType)} · {ref.fileNames.join(", ")}{ref.expiry ? ` · ${t("Expiry date")} ${fmtDate(ref.expiry)}` : ""}</small>{problem ? <small style={{ color: "var(--red)" }}>{t(problem)}</small> : null}</span>
                  <span className={`status ${state.color}`}>{t(state.label)}</span>
                  {editable && (
                    <>
                      <button type="button" onClick={() => setReplacing(replacing === ref.id ? null : ref.id)} style={{ color: "var(--blue)" }}>{t("Replace")}</button>
                      <button type="button" onClick={() => { if (run((draft) => removeEvidence(draft, ctx.request.id, ref.id)).ok) toast("Evidence removed."); }}>{t("Remove")}</button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <span className="form-error" role="alert">{t(error ?? "")}</span>
      </div>
      {editable && (replacing ? <AddEvidence key={replacing} ctx={ctx} target={target} replaces={replacing} onDone={() => setReplacing(null)} /> : <AddEvidence ctx={ctx} target={target} />)}
    </Section>
  );
}

export default function EvidenceTab({ ctx }: { ctx: TabCtx }) {
  const { t } = useI18n();
  const { request, response } = ctx;
  const targets: Target[] = [
    ...request.requiredEvidence.map((item) => ({ id: item.id, title: item.title, description: item.description, types: item.docTypes, mandatory: item.mandatory, errorKey: `evidence.${item.id}` })),
    ...request.criteria.filter((item) => response.skills[item.id]?.offered === "Yes").map((item) => ({
      id: item.id, title: `${item.name} · ${t("skill evidence")}`, description: item.evidenceRequired ? item.instructions : t("Optional proof of this skill, for example certificates or training records."),
      types: item.evidenceTypes, mandatory: item.evidenceRequired, errorKey: `skill.${item.id}.evidence`,
    })),
  ];
  return (
    <div className="reg-main">
      <div className="notice">{t("Evidence is linked to a requirement or skill. Documents are stored once in Company Profile; a submission keeps a snapshot of the version you attached.")}</div>
      {!ctx.canUpload && <div className="notice warning">{t("Your role cannot add or change evidence.")}</div>}
      {targets.map((target) => <TargetSection key={target.id} ctx={ctx} target={target} />)}
    </div>
  );
}
