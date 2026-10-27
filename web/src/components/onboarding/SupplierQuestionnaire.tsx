"use client";

import type { ChangeEvent } from "react";
import { Badge } from "@/components/ui";
import { supplierQuestionnaire } from "@/lib/data";
import { pushDocument, todayIso, trackFile } from "@/lib/docs";
import {
  questionnaireAvailable,
  questionnaireComplete,
  questionnaireSystemAnswer,
  taskBlockedMessage,
  taskCount,
} from "@/lib/onboarding";
import { usePortal } from "@/lib/store";
import type { FileMeta } from "@/lib/types";

const MAX_PDF_BYTES = 5 * 1024 * 1024;

export default function SupplierQuestionnaire({ done }: { done: number }) {
  const { db, mutate, toast } = usePortal();
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
  };

  return (
    <>
      <div className="notice">
        Answer Yes or No. When Yes is selected, provide the required PDF evidence. Files are represented by metadata only in this browser and are not uploaded.
      </div>
      <div className="questionnaire-list">
        {supplierQuestionnaire.map(([key, question, documents, maxFiles]) => {
          if (documents === "system") {
            const value = questionnaireSystemAnswer(db, key);
            return (
              <article className="questionnaire-item questionnaire-generated" key={key}>
                <strong>{question}</strong>
                <span>
                  <Badge status={value || "Pending"} />
                </span>
                <small>System generated · not editable</small>
              </article>
            );
          }
          const response = answers[key] || { answer: "", documentType: "", files: [], note: "" };
          const conditional = response.answer === "Yes";
          const limit = maxFiles || 1;
          const files: FileMeta[] = response.files || [];
          const note: string = response.note || "";
          return (
            <article className="questionnaire-item" key={key}>
              <div className="questionnaire-question">
                <strong>{question}</strong>
                <span className="required">*</span>
              </div>
              <div className="questionnaire-answer" role="radiogroup" aria-label={question}>
                {(["Yes", "No"] as const).map((value) => (
                  <label className="questionnaire-choice" key={value}>
                    <input type="radio" name={`onboarding-${key}`} value={value} checked={response.answer === value} onChange={() => setAnswer(key, value)} disabled={locked} />
                    <span>{value}</span>
                  </label>
                ))}
              </div>
              {conditional && (
                <div className="questionnaire-conditional">
                  {Array.isArray(documents) && (
                    <label className="form-field">
                      Document type{" "}
                      <select className="field-control" value={response.documentType || ""} onChange={(e) => setDocumentType(key, e.target.value)} disabled={locked}>
                        <option value="">Select a document type</option>
                        {documents.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <label className="form-field">
                    Supporting document <span className="required">*</span>
                    <span className="helper">
                      PDF only · maximum 5 MB per file · up to {limit} file{limit === 1 ? "" : "s"}
                    </span>
                    <input type="file" accept=".pdf,application/pdf" multiple={limit > 1} onChange={(e) => addFiles(key, e)} disabled={locked} />
                  </label>
                  <div className="file-list">
                    {files.map((file, index) => (
                      <div className="file-row" key={file.uid || `${file.name}-${index}`}>
                        <span>
                          {file.name} <small>({((file.size || 0) / 1024).toFixed(0)} KB)</small>
                        </span>
                        <label className="file-expiry">
                          Expiry date
                          <input type="date" min={todayIso()} value={file.expiry || ""} disabled={locked} onChange={(e) => setExpiry(key, index, e.target.value)} />
                        </label>
                        <button type="button" aria-label={`Remove ${file.name}`} onClick={() => removeFile(key, index)} disabled={locked}>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <label className="form-field questionnaire-note">
                หมายเหตุ
                <textarea className="field-control" maxLength={5000} rows={3} value={note} onChange={(e) => setNote(key, e.target.value)} disabled={locked} />
                <small>{note.length}/5000 characters</small>
              </label>
            </article>
          );
        })}
      </div>
      <div className="wizard-footer">
        <small className="mock-note">
          {answered} of {userQuestions.length} supplier responses completed · Conditional documents: {complete ? "complete" : "incomplete"}
        </small>
        <button className="button primary" onClick={submit} disabled={!complete || locked}>
          Submit questionnaire
        </button>
      </div>
    </>
  );
}
