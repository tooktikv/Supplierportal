"use client";

import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import DemoFill from "@/components/DemoFill";
import { Footer, Input, Radios, Section } from "@/components/srm/fields";
import { supplierQuestionnaire } from "@/lib/data";
import { fillDemoQuestionnaire } from "@/lib/demo";
import { pushDocument, todayIso, trackFile } from "@/lib/docs";
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

export default function SupplierQuestionnaire({ done }: { done: number }) {
  const { db, mutate, toast } = usePortal();
  const router = useRouter();
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
        toast(`${file.name} is not a PDF file.`);
        continue;
      }
      if (file.size > MAX_PDF_BYTES) {
        toast(`${file.name} exceeds the 5 MB limit.`);
        continue;
      }
      accepted.push(trackFile(file, "application/pdf"));
    }
    const remaining = limit - (response.files || []).length;
    if (accepted.length > remaining) toast(`This question allows up to ${limit} file${limit === 1 ? "" : "s"}.`);
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
    if (!["Yes", "No"].includes(answers[key]?.answer)) return;
    mutate((d) => void (d.onboarding.questionnaireAnswers[key].note = value.slice(0, 5000)));
  };

  const submit = () => {
    if (!questionnaireAvailable(db)) return toast(taskBlockedMessage(db, "supplier-questionnaire"));
    if (taskCount(db, "supplier-questionnaire")) return toast("The questionnaire has already been submitted.");
    if (!complete) return toast("Answer every required question and attach the conditional PDF documents before submitting.");
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
    // Same rule as riskAssessmentState() once the questionnaire counts as submitted.
    const riskRequired = supplierQuestionnaire.some(([key, , type]) => type !== "system" && answers[key]?.answer === "No");
    toast(
      riskRequired
        ? "Questionnaire submitted. Risk identified: complete the Sustainability Risk Assessment."
        : "Questionnaire submitted. No additional risk assessment is required.",
    );
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
      {!locked && <DemoFill onFill={() => mutate((d) => fillDemoQuestionnaire(d))} secondary={{ label: "Fill with a risk (one No answer)", onFill: () => mutate((d) => fillDemoQuestionnaire(d, true)) }} />}
      <div className="card section-card qn-summary">
        <div className="qn-summary-top">
          <div>
            <h2>{answered} / {userQuestions.length} answered</h2>
            <p className="helper">Answer Yes or No. When Yes is selected, provide the required PDF evidence. Files are represented by metadata only in this browser and are not uploaded.</p>
          </div>
        </div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${(answered / userQuestions.length) * 100}%` }} /></div>
      </div>

      {supplierQuestionnaire.map(([key, question, documents, maxFiles], index) => {
        const title = stripNumber(question);
        if (documents === "system") {
          const value = questionnaireSystemAnswer(db, key);
          return (
            <Section key={key} num={index + 1} title={title} hint="System generated · not editable" extra={<Badge status={value || "Pending"} />}>
              {null}
            </Section>
          );
        }
        const response = answers[key] || { answer: "", documentType: "", files: [], note: "" };
        const limit = maxFiles || 1;
        const files: FileMeta[] = response.files || [];
        const note: string = response.note || "";
        const ok = questionDone(key, documents, limit);
        return (
          <Section key={key} num={index + 1} title={title} extra={<Badge status={ok ? "Completed" : "Pending"} />}>
            <Radios name={`qn-${key}`} label="Your answer" required options={["Yes", "No"] as const} value={response.answer || ""} disabled={locked} onChange={(value) => setAnswer(key, value)} />
            {response.answer === "Yes" && Array.isArray(documents) && (
              <Input name={`qn-${key}-doctype`} label="Document type" type="select" options={documents} value={response.documentType || ""} placeholder="Select a document type" required disabled={locked} onChange={(value) => setDocumentType(key, value)} />
            )}
            {response.answer === "Yes" && (
              <div className="form-field reg-field reg-s4">
                <div className={`doc-card ${files.length ? "done" : ""}`}>
                  <div className="doc-card-head">
                    <span className="doc-icon">▤</span>
                    <div>
                      <strong>Supporting document <span className="required">*</span></strong>
                      <small>PDF only · maximum 5 MB per file · up to {limit} file{limit === 1 ? "" : "s"}</small>
                    </div>
                    <span className="doc-state">{files.length ? `✓ Uploaded ${files.length}/${limit}` : "Not uploaded"}</span>
                  </div>
                  <label className={`doc-drop ${files.length >= limit || locked ? "full" : ""}`}>
                    <input type="file" accept=".pdf,application/pdf" multiple={limit > 1} aria-label="Supporting document" onChange={(e) => addFiles(key, e)} disabled={locked || files.length >= limit} />
                    <span className="doc-drop-icon">↑</span>
                    <span><b>{files.length >= limit ? `Maximum ${limit} file${limit === 1 ? "" : "s"} uploaded` : <>Drag a file here or <u>choose a file</u></>}</b></span>
                  </label>
                  {files.length > 0 && (
                    <div className="file-list">
                      {files.map((file, fileIndex) => (
                        <div className="file-row" key={file.uid || `${file.name}-${fileIndex}`}>
                          <span className="file-ico">PDF</span>
                          <span className="file-name">{file.name}<small>{((file.size || 0) / 1024).toFixed(0)} KB</small></span>
                          <button type="button" aria-label={`Remove ${file.name}`} onClick={() => removeFile(key, fileIndex)} disabled={locked}>Remove</button>
                          <label className="file-expiry">
                            Expiry date
                            <input type="date" min={todayIso()} value={file.expiry || ""} disabled={locked} onChange={(e) => setExpiry(key, fileIndex, e.target.value)} />
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {response.answer && (
              <Input name={`qn-${key}-note`} label="Note" type="textarea" value={note} hint={`Optional · ${note.length}/5000 characters`} disabled={locked} onChange={(value) => setNote(key, value)} />
            )}
          </Section>
        );
      })}

      <Footer note={`${answered} of ${userQuestions.length} supplier responses completed · Conditional documents: ${complete ? "complete" : "incomplete"}`}>
        <button className="button primary" onClick={submit} disabled={!complete || locked}>Submit questionnaire</button>
      </Footer>
    </div>
  );
}
