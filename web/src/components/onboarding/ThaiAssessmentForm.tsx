"use client";

import { Fragment, useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/sample-requests/FormField";
import { kb } from "@/components/sample-requests/sample-utils";
import { fmtDate, pushDocument, trackFile } from "@/lib/docs";
import { routes } from "@/lib/routes";
import { usePortal } from "@/lib/store";
import { useConfirm } from "@/components/ConfirmDialog";
import DemoFill from "@/components/DemoFill";
import { fillDemoAssessment } from "@/lib/demo";
import { TLS_CRITERIA, TLS_QUESTIONS, tlsErrors, tlsResult, type TlsAnswer, type TlsAssessment } from "@/lib/tls-assessment";

const TASK_ID = "thai-labor-assessment";
const MAX_BYTES = 5 * 1024 * 1024;
const STEPS = ["ข้อมูลทั่วไป", "แบบประเมินตนเอง 21 ข้อ", "สรุปผล"];
const stepOf = (key: string) => (/^q\d+$/.test(key) || key === "notes" ? 1 : 0);

export default function ThaiAssessmentForm() {
  const { db, mutate, toast } = usePortal();
  const router = useRouter();
  const confirm = useConfirm();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const state = db.onboarding.thaiAssessment as TlsAssessment;
  const submitted = Boolean(state.submittedAt);
  const result = tlsResult(state.answers);
  const answered = TLS_QUESTIONS.filter((question) => state.answers[question.n]).length;
  const allErrors = tlsErrors(state);
  const stepDone = [
    !Object.keys(allErrors).some((key) => stepOf(key) === 0),
    result.complete && !Object.keys(allErrors).some((key) => stepOf(key) === 1),
    result.complete,
  ];
  const err = (key: string) => ({ hasError: Boolean(errors[key]), error: errors[key] });

  const update = (change: (value: TlsAssessment) => void) => {
    if (submitted) return;
    setErrors({});
    mutate((d) => change(d.onboarding.thaiAssessment as TlsAssessment));
  };
  const text = (key: "total" | "male" | "female" | "otherStandards" | "notes") => ({
    name: key, value: state[key], onChange: (value: string) => update((draft) => void (draft[key] = value)), ...err(key),
  });

  const pickCertificate = (list: FileList | null) => {
    if (!list?.length) return;
    if (list.length > 1) return toast("Upload only 1 PDF file.");
    const file = list[0];
    if (!/\.pdf$/i.test(file.name) || (file.type && file.type !== "application/pdf")) return toast("Only PDF files are accepted.");
    if (file.size > MAX_BYTES) return toast("The file must be 5 MB or smaller.");
    const meta = trackFile(file, "application/pdf");
    update((draft) => void (draft.certFiles = [meta]));
  };

  const goTo = (next: number) => {
    setStep(next);
    window.scrollTo({ top: 0 });
  };

  const submit = async () => {
    const next = tlsErrors(state);
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      toast(`Complete the highlighted items in "${STEPS[stepOf(first)]}" before submitting.`);
      setStep(stepOf(first));
      return;
    }
    if (!(await confirm({ message: "Submit your F-TLS-01 self-assessment?", confirmLabel: "Submit" }))) return;
    mutate((d) => {
      const value = d.onboarding.thaiAssessment as TlsAssessment;
      value.submittedAt = new Date().toISOString();
      d.onboarding.tasks[TASK_ID] = 1;
      if (value.certified === "มี") pushDocument(d, value.certFiles, { name: "TLS 8001 certificate", type: "Quality Certification", group: "Pre-Screening" });
    });
    toast("Self-assessment submitted.");
    router.push(routes.onboarding);
  };

  return (
    <>
      {!submitted && <DemoFill onFill={() => { setErrors({}); mutate(fillDemoAssessment); }} />}
      <div className="notice">F-TLS-01 · Part 3 of มาตรฐานแรงงานไทย (มรท.). Fill in your details, answer the self-assessment, then review the result. Progress is saved only in this browser.</div>
      <nav className="learning-stepper" aria-label="F-TLS-01 sections">
        {STEPS.map((title, index) => (
          <button className={`learning-step ${index === step ? "selected" : ""}`} key={title} aria-current={index === step ? "step" : undefined} onClick={() => goTo(index)}>
            <span className="learning-step-number">{stepDone[index] ? "✓" : index + 1}</span>
            <span>{title}</span>
          </button>
        ))}
      </nav>

      <article className="card learning-module commitment-form">
        {step === 0 && (
          <>
            <div className="learning-module-heading"><div><span className="eyebrow">SECTION 1/3 · FILL IN</span><h3>ข้อมูลทั่วไป</h3></div></div>
            <div className="form-grid">
              <FormField label="จำนวนพนักงานรวม" {...text("total")} type="number" min="1" required hint="Whole number greater than 0" />
              <FormField label="จำนวนพนักงานชาย" {...text("male")} type="number" min="1" required />
              <FormField label="จำนวนพนักงานหญิง" {...text("female")} type="number" min="1" required hint="Male + female must equal the total" />
            </div>
            <fieldset className="quiz-question" disabled={submitted} data-field="certified">
              <legend>ได้รับการรับรอง TLS 8001 <span className="required">*</span></legend>
              <div className="quiz-options tls-options">
                {(["มี", "ไม่มี"] as const).map((option) => (
                  <label className="quiz-option" key={option}>
                    <input type="radio" name="tls-certified" checked={state.certified === option} onChange={() => update((draft) => { draft.certified = option; if (option === "ไม่มี") draft.certFiles = []; })} />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {errors.certified && <p className="sample-field-error" role="alert">{errors.certified}</p>}
            {state.certified === "มี" && (
              <div className="sample-form-section" data-field="certFiles">
                <h4>Upload TLS 8001 certificate <span className="required">*</span></h4>
                <div className="upload-box">
                  <div className="helper">PDF only · 1 file · max 5 MB</div>
                  <input type="file" accept=".pdf,application/pdf" disabled={submitted || state.certFiles.length >= 1} onChange={(e) => { pickCertificate(e.target.files); e.target.value = ""; }} />
                  <div className="file-list">
                    {state.certFiles.map((file) => (
                      <div className="file-row" key={file.uid || file.name}>
                        <span>▤ &nbsp;{file.name} <small>({kb(file.size)} KB)</small></span>
                        {!submitted && <button type="button" aria-label={`Remove ${file.name}`} onClick={() => update((draft) => void (draft.certFiles = []))}>Remove</button>}
                      </div>
                    ))}
                  </div>
                </div>
                {errors.certFiles && <p className="sample-field-error" role="alert">{errors.certFiles}</p>}
              </div>
            )}
            <FormField label="ได้รับการรับรองมาตรฐานสากล อื่นๆ (ระบุเพิ่มเติม)" {...text("otherStandards")} textarea full hint="Optional · max 5000 characters" />
          </>
        )}

        {step === 1 && (
          <>
            <div className="learning-module-heading"><div><span className="eyebrow">SECTION 2/3 · CHOOSE &amp; NOTE</span><h3>แบบประเมินตนเอง 21 ข้อ</h3></div></div>
            <div className="tls-progress">
              <span>ตอบแล้ว {answered}/{TLS_QUESTIONS.length} ข้อ</span>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${(answered / TLS_QUESTIONS.length) * 100}%` }} /></div>
            </div>
            <p className="helper">ใช่ = 5 คะแนน · ไม่ใช่ = 0 คะแนน · ไม่เกี่ยวข้อง = 5 คะแนน (เลือกได้เฉพาะข้อ 13, 16 และ 20) · ข้อ 21 ไม่นับคะแนน</p>
            <div className="tls-matrix" role="group" aria-label="Self-assessment questions">
              <div className="tls-head" aria-hidden="true"><span>#</span><span>ข้อประเมิน</span><span>ใช่</span><span>ไม่ใช่</span><span>ไม่เกี่ยวข้อง</span></div>
              {TLS_QUESTIONS.map((question, index) => {
                const key = `q${question.n}`;
                return (
                  <Fragment key={question.n}>
                    {question.section !== TLS_QUESTIONS[index - 1]?.section && <div className="tls-group-head">{question.section}</div>}
                    <fieldset className={`tls-row ${errors[key] ? "has-error" : ""} ${state.answers[question.n] ? "answered" : ""}`} id={`tls-${key}`} disabled={submitted}>
                      <legend className="sr-only">ข้อ {question.n}</legend>
                      <span className="tls-num">{question.n}</span>
                      <span className="tls-text">{question.text}{errors[key] && <em className="sample-field-error" role="alert">{errors[key]}</em>}</span>
                      {(["ใช่", "ไม่ใช่", "ไม่เกี่ยวข้อง"] as TlsAnswer[]).map((answer) =>
                        answer === "ไม่เกี่ยวข้อง" && !question.na ? (
                          <span className="tls-cell tls-cell-off" key={answer} aria-hidden="true" />
                        ) : (
                          <label className="tls-cell" key={answer}>
                            <input type="radio" name={`tls-${key}`} aria-label={`ข้อ ${question.n}: ${answer}`} checked={state.answers[question.n] === answer} onChange={() => update((draft) => void (draft.answers[question.n] = answer))} />
                            <span className="tls-opt-label">{answer}</span>
                          </label>
                        ),
                      )}
                    </fieldset>
                  </Fragment>
                );
              })}
            </div>
            <FormField label="หมายเหตุเพิ่มเติม" {...text("notes")} textarea full hint="Optional · max 5000 characters" />
          </>
        )}

        {step === 2 && (
          <>
            <div className="learning-module-heading"><div><span className="eyebrow">SECTION 3/3 · REVIEW</span><h3>สรุปผล</h3></div></div>
            <div className="tls-summary">
              <h4>ผลการประเมิน (คำนวณโดยระบบ)</h4>
              {result.complete ? (
                <div className={`tls-score-card ${result.passed ? "passed" : "failed"}`}>
                  <strong>{result.score}<small>/100</small></strong>
                  <div>
                    <span>ผลประเมิน</span>
                    <b>{result.passed ? "ผ่าน" : "ไม่ผ่าน"}</b>
                    <small>ระดับคะแนน: {result.level}</small>
                  </div>
                </div>
              ) : (
                <div className="notice warning">ตอบแบบประเมินให้ครบ 21 ข้อเพื่อคำนวณคะแนน (ตอบแล้ว {answered}/21) <button className="text-link" onClick={() => goTo(1)}>ไปที่แบบประเมิน →</button></div>
              )}
              <div className="form-grid">
                <FormField label="คะแนนรวมทั้งหมด" name="tls-score" value={result.complete ? String(result.score) : ""} onChange={() => {}} readOnly placeholder="—" />
                <div className="form-field">
                  <label>ผลประเมิน</label>
                  <div className="quiz-options tls-options">
                    {[true, false].map((passed) => (
                      <label className="quiz-option" key={String(passed)}>
                        <input type="radio" disabled checked={result.complete && result.passed === passed} readOnly />
                        <span>{passed ? "ผ่าน" : "ไม่ผ่าน"}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <p className="mock-note">เกณฑ์: {TLS_CRITERIA.map((item) => `${item.label} ${item.level}`).join(" · ")}</p>
            </div>
          </>
        )}

        <div className="wizard-footer">
          {step === 0 ? <button className="button" onClick={() => router.push(routes.onboarding)}>Back to tasks</button> : <button className="button" onClick={() => goTo(step - 1)}>Back</button>}
          <span className="mock-note">{submitted ? `Submitted on ${fmtDate(state.submittedAt)}` : `Section ${step + 1} of ${STEPS.length}`}</span>
          {step < STEPS.length - 1 ? <button className="button primary" onClick={() => goTo(step + 1)}>Next →</button> : submitted ? <button className="button primary" onClick={() => router.push(routes.onboarding)}>Back to tasks</button> : <button className="button primary" onClick={submit}>Submit</button>}
        </div>
      </article>
    </>
  );
}
