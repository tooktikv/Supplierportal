"use client";

import { Fragment, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import DemoFill from "@/components/DemoFill";
import { useConfirm } from "@/components/ConfirmDialog";
import { Footer, Input, Radios, Section } from "@/components/srm/fields";
import { supplierQuestionnaire } from "@/lib/data";
import { fillDemoQuestionnaire } from "@/lib/demo";
import { pushDocument, todayIso, trackFile } from "@/lib/docs";
import { useI18n } from "@/lib/i18n";
import {
  questionnaireAvailable,
  questionnaireComplete,
  questionnaireSystemAnswer,
  taskBlockedMessage,
  taskCount,
} from "@/lib/onboarding";
import { routes } from "@/lib/routes";
import { usePortal } from "@/lib/store";
import type { FileMeta } from "@/lib/types";

const MAX_PDF_BYTES = 5 * 1024 * 1024;
const stripNumber = (question: string) => question.replace(/^\d+\.\s*/, "");
/** Question index where each group of the form starts. */
const GROUPS: Record<number, string> = { 0: "Quality and food safety", 6: "Sustainability", 8: "Other areas" };

export default function SupplierQuestionnaire({ done }: { done: number }) {
  const { db, mutate, toast } = usePortal();
  const { t, lang } = useI18n();
  const router = useRouter();
  const confirm = useConfirm();
  const answers = db.onboarding.questionnaireAnswers;
  const userQuestions = supplierQuestionnaire.filter(([, , type]) => type !== "system");
  const answered = userQuestions.filter(([key]) => ["Yes", "No"].includes(answers[key]?.answer)).length;
  const locked = done >= 1;
  const complete = questionnaireComplete(db);

  const setAnswer = (key: string, value: "Yes" | "No") => {
    if (!questionnaireAvailable(db)) return toast(taskBlockedMessage(db, "supplier-questionnaire"));
    if (taskCount(db, "supplier-questionnaire")) return toast("The questionnaire has already been submitted.");
    mutate((d) => {
      const response = d.onboarding.questionnaireAnswers[key] || { documentType: "", files: [], note: "" };
      response.answer = value;
      if (value === "No") {
        response.documentType = "";
        response.files = [];
      }
      d.onboarding.questionnaireAnswers[key] = response;
    });
  };

  const setDocumentType = (key: string, value: string) => {
    if (taskCount(db, "supplier-questionnaire")) return;
    const documents = supplierQuestionnaire.find(([k]) => k === key)?.[2];
    if (!Array.isArray(documents) || !documents.includes(value)) return;
    if (answers[key]?.answer !== "Yes") return;
    mutate((d) => void (d.onboarding.questionnaireAnswers[key].documentType = value));
  };

  const addFiles = (key: string, event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";
    if (taskCount(db, "supplier-questionnaire")) return;
    const question = supplierQuestionnaire.find(([k]) => k === key);
    const response = answers[key];
    if (!question || !response || response.answer !== "Yes") return;
    const limit = question[3] || 1;
    const accepted: FileMeta[] = [];
    for (const file of selected) {
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
      if (!isPdf) {
        toast(t("{name} is not a PDF file.", { name: file.name }));
        continue;
      }
      if (file.size > MAX_PDF_BYTES) {
        toast(t("{name} exceeds the 5 MB limit.", { name: file.name }));
        continue;
      }
      accepted.push(trackFile(file, "application/pdf"));
    }
    const remaining = limit - (response.files || []).length;
    if (accepted.length > remaining) toast(t(limit === 1 ? "This question allows up to 1 file." : "This question allows up to {limit} files.", { limit }));
    mutate((d) => {
      const r = d.onboarding.questionnaireAnswers[key];
      r.files = [...(r.files || []), ...accepted.slice(0, Math.max(0, remaining))];
    });
  };

  const setExpiry = (key: string, index: number, value: string) => {
    const file = answers[key]?.files?.[index];
    if (!file || taskCount(db, "supplier-questionnaire")) return;
    if (value && value < todayIso()) return toast("Expiry date cannot be in the past.");
    mutate((d) => void (d.onboarding.questionnaireAnswers[key].files[index].expiry = value));
  };

  const removeFile = (key: string, index: number) => {
    if (!answers[key] || taskCount(db, "supplier-questionnaire")) return;
    mutate((d) => void d.onboarding.questionnaireAnswers[key].files.splice(index, 1));
  };

  const setNote = (key: string, value: string) => {
    if (taskCount(db, "supplier-questionnaire")) return;
    mutate((d) => {
      const response = d.onboarding.questionnaireAnswers[key] || { answer: "", documentType: "", files: [], note: "" };
      response.note = value.slice(0, 5000);
      d.onboarding.questionnaireAnswers[key] = response;
    });
  };

  const submit = async () => {
    if (!questionnaireAvailable(db)) return toast(taskBlockedMessage(db, "supplier-questionnaire"));
    if (taskCount(db, "supplier-questionnaire")) return toast("The questionnaire has already been submitted.");
    if (!complete) return toast("Answer every required question and attach the conditional PDF documents before submitting.");
    if (!(await confirm({ message: "Submit your questionnaire? You cannot change your answers after submitting.", confirmLabel: "Submit" }))) return;
    mutate((d) => {
      supplierQuestionnaire.forEach(([key, question]) => {
        const response = d.onboarding.questionnaireAnswers[key];
        if (response?.answer === "Yes")
          pushDocument(d, response.files || [], {
            name: response.documentType || question.replace(/^\d+\.\s*/, ""),
            type: "Questionnaire Evidence",
            group: "Pre-Screening",
          });
      });
      d.onboarding.tasks["supplier-questionnaire"] = 1;
    });
    toast("Questionnaire submitted.");
    router.push(routes.onboarding);
  };

  /** A question is done when it is answered and, for Yes, its documents are in place. */
  const questionDone = (key: string, documents: unknown, limit: number) => {
    const response = answers[key];
    if (!response || !["Yes", "No"].includes(response.answer)) return false;
    if (response.answer === "No") return true;
    const files: FileMeta[] = response.files || [];
    return (!Array.isArray(documents) || Boolean(response.documentType)) && files.length > 0 && files.length <= limit;
  };

  return (
    <div className="reg-main">
      {!locked && <DemoFill onFill={() => mutate((d) => fillDemoQuestionnaire(d))} />}
      <div className="card section-card qn-summary">
        <div className="qn-summary-top">
          <div>
            <h2>{t("{answered} / {total} answered", { answered, total: userQuestions.length })}</h2>
            <p className="helper">{t("Answer Yes or No. When Yes is selected, provide the required PDF evidence. Files are represented by metadata only in this browser and are not uploaded.")}</p>
          </div>
        </div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${(answered / userQuestions.length) * 100}%` }} /></div>
      </div>

      {supplierQuestionnaire.map(([key, question, documents, maxFiles], index) => {
        const title = stripNumber(question);
        const heading = GROUPS[index] ? <h3 className="qn-group">{t(GROUPS[index])}</h3> : null;
        if (documents === "system") {
          const value = questionnaireSystemAnswer(db, key);
          return (
            <Fragment key={key}>
              {heading}
              <Section num={index + 1} title={title} hint="System generated · not editable" extra={<span className={`status ${value === "Yes" ? "green" : "amber"}`}>{lang === "th" ? (value === "Yes" ? "มี" : "ไม่มี") : value}</span>}>
                {null}
              </Section>
            </Fragment>
          );
        }
        const response = answers[key] || { answer: "", documentType: "", files: [], note: "" };
        const limit = maxFiles || 1;
        const files: FileMeta[] = response.files || [];
        const note: string = response.note || "";
        const ok = questionDone(key, documents, limit);
        return (
          <Fragment key={key}>
          {heading}
          <Section num={index + 1} title={title} extra={<Badge status={ok ? "Completed" : "Pending"} />}>
            <Radios name={`qn-${key}`} label="Your answer" required options={["Yes", "No"] as const} value={response.answer || ""} disabled={locked} renderLabel={(option) => (lang === "th" ? (option === "Yes" ? "มี" : "ไม่มี") : option)} onChange={(value) => setAnswer(key, value)} />
            {response.answer === "Yes" && Array.isArray(documents) && (
              <Input name={`qn-${key}-doctype`} label="Document type" type="select" options={documents} value={response.documentType || ""} placeholder="Select a document type" required disabled={locked} onChange={(value) => setDocumentType(key, value)} />
            )}
            {response.answer === "Yes" && (
              <div className="form-field reg-field reg-s4">
                <div className={`doc-card ${files.length ? "done" : ""}`}>
                  <div className="doc-card-head">
                    <span className="doc-icon">▤</span>
                    <div>
                      <strong>{t("Supporting document")} <span className="required">*</span></strong>
                      <small>{t(limit === 1 ? "PDF only · maximum 5 MB per file · up to 1 file" : "PDF only · maximum 5 MB per file · up to {limit} files", { limit })}</small>
                    </div>
                    <span className="doc-state">{files.length ? t("✓ Uploaded {n}/{max}", { n: files.length, max: limit }) : t("Not uploaded")}</span>
                  </div>
                  <label className={`doc-drop ${files.length >= limit || locked ? "full" : ""}`}>
                    <input type="file" accept=".pdf,application/pdf" multiple={limit > 1} aria-label={t("Supporting document")} onChange={(e) => addFiles(key, e)} disabled={locked || files.length >= limit} />
                    <span className="doc-drop-icon">↑</span>
                    <span><b>{files.length >= limit ? t(limit === 1 ? "Maximum 1 file uploaded" : "Maximum {max} files uploaded", { max: limit }) : <>{t("Drag a file here or")} <u>{t("choose a file")}</u></>}</b></span>
                  </label>
                  {files.length > 0 && (
                    <div className="file-list">
                      {files.map((file, fileIndex) => (
                        <div className="file-row" key={file.uid || `${file.name}-${fileIndex}`}>
                          <span className="file-ico">PDF</span>
                          <span className="file-name">{file.name}<small>{((file.size || 0) / 1024).toFixed(0)} KB</small></span>
                          <button type="button" aria-label={t("Remove {name}", { name: file.name })} onClick={() => removeFile(key, fileIndex)} disabled={locked}>{t("Remove")}</button>
                          <label className="file-expiry">
                            {t("Expiry date")}
                            <input type="date" min={todayIso()} value={file.expiry || ""} disabled={locked} onChange={(e) => setExpiry(key, fileIndex, e.target.value)} />
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            <Input name={`qn-${key}-note`} label="Note" type="textarea" value={note} hint={t("Optional · {n}/5000 characters", { n: note.length })} placeholder="Describe additional details about the product or service" disabled={locked} onChange={(value) => setNote(key, value)} />
          </Section>
          </Fragment>
        );
      })}

      <Footer note={t("{n} of {total} supplier responses completed · Conditional documents: {state}", { n: answered, total: userQuestions.length, state: complete ? t("complete") : t("incomplete") })}>
        <button className="button primary" onClick={submit} disabled={!complete || locked}>{t("Submit questionnaire")}</button>
      </Footer>
    </div>
  );
}
