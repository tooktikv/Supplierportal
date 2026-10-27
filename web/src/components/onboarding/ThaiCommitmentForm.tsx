"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "@/components/sample-requests/FormField";
import { kb } from "@/components/sample-requests/sample-utils";
import { fmtDate, pushDocument, trackFile } from "@/lib/docs";
import { routes } from "@/lib/routes";
import { usePortal } from "@/lib/store";
import { useConfirm } from "@/components/ConfirmDialog";
import DemoFill from "@/components/DemoFill";
import { fillDemoCommitment } from "@/lib/demo";
import type { FileMeta } from "@/lib/types";
import MockPdf, { downloadMockPdf } from "./MockPdf";

const TASK_ID = "thai-labor-commitment";
const TITLE = "หนังสือแสดงความมุ่งมั่นของผู้ส่งมอบหรือผู้รับเหมาช่วง";
const FILE_NAME = "F-TLS-02-commitment-letter.pdf";
const MAX_BYTES = 5 * 1024 * 1024;

interface Commitment {
  accepted: boolean;
  acceptedAt?: string;
  method: "" | "Signed" | "Download";
  /** When the document was signed in AXONS Sign (method = Signed). */
  signedAt?: string;
  files: FileMeta[];
  submittedAt?: string;
}

export default function ThaiCommitmentForm() {
  const { db, mutate, toast } = usePortal();
  const router = useRouter();
  const confirm = useConfirm();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const state = db.onboarding.thaiCommitment as Commitment;
  const signer = db.profile.contact;
  const company = db.profile.company;
  const submitted = Boolean(state.submittedAt);

  const update = (change: (value: Commitment) => void) => {
    if (submitted) return;
    setErrors({});
    mutate((d) => change(d.onboarding.thaiCommitment as Commitment));
  };

  const pickFile = (list: FileList | null) => {
    if (!list?.length) return;
    if (list.length > 1) return toast("Upload only 1 PDF file.");
    const file = list[0];
    if (!/\.pdf$/i.test(file.name) || (file.type && file.type !== "application/pdf")) return toast("Only PDF files are accepted.");
    if (file.size > MAX_BYTES) return toast("The file must be 5 MB or smaller.");
    const meta = trackFile(file, "application/pdf");
    update((value) => void (value.files = [meta]));
  };

  const submit = async () => {
    const next: Record<string, string> = {};
    if (!state.accepted) next.accepted = "Accept the commitment letter to continue.";
    if (!state.method) next.method = "Select how you will sign the document.";
    else if (state.method === "Signed" && !state.signedAt) next.signature = "Sign the document in AXONS Sign before submitting.";
    else if (state.method === "Download" && state.files.length !== 1) next.files = "Upload the signed PDF (1 file, max 5 MB).";
    setErrors(next);
    if (Object.keys(next).length) return toast("Complete the highlighted items before submitting.");
    if (!(await confirm({ message: "Submit the signed commitment letter?", confirmLabel: "Submit" }))) return;
    mutate((d) => {
      const value = d.onboarding.thaiCommitment as Commitment;
      value.submittedAt = new Date().toISOString();
      d.onboarding.tasks[TASK_ID] = 1;
      pushDocument(d, value.files, { name: "Commitment letter signature · F-TLS-02", type: "Supplier Declaration", group: "Pre-Screening" });
    });
    toast("Commitment letter submitted.");
    router.push(routes.task("thai-labor-assessment"));
  };

  return (
    <>
      {!submitted && <DemoFill onFill={() => mutate(fillDemoCommitment)} />}
      <div className="notice">Part 2 of มาตรฐานแรงงานไทย (มรท.). Read the letter, accept it and sign it. Progress is saved only in this browser.</div>
      <article className="card learning-module commitment-form">
        <div className="learning-module-heading">
          <div>
            <span className="eyebrow">F-TLS-02</span>
            <h3>{TITLE}</h3>
          </div>
        </div>
        <MockPdf title={TITLE} fileName={FILE_NAME} pages={2} intro={[`ข้าพเจ้า ${signer}`, `ผู้มีอำนาจลงนามของ ${company}`]} />
        <div className="form-grid">
          <FormField label="ชื่อ-นามสกุล ผู้มีอำนาจลงนาม" name="signerName" value={signer} onChange={() => {}} readOnly required hint="Prefilled from your registration." />
          <FormField label="ชื่อบริษัท" name="companyName" value={company} onChange={() => {}} readOnly required hint="Prefilled from your registration." />
        </div>
        <label className="commitment-row">
          <input id="commitment-accept" type="checkbox" checked={state.accepted} disabled={submitted} onChange={(e) => update((value) => { value.accepted = e.target.checked; value.acceptedAt = e.target.checked ? new Date().toISOString() : undefined; })} />
          <span>I have read the commitment letter and accept it. <span className="required">*</span></span>
        </label>
        {errors.accepted && <p className="sample-field-error" role="alert">{errors.accepted}</p>}
        <fieldset className="quiz-question" disabled={submitted || !state.accepted}>
          <legend>วิธีการเซ็นเอกสาร <span className="required">*</span></legend>
          <div className="quiz-options">
            <label className="quiz-option">
              <input type="radio" name="sign-method" value="Signed" checked={state.method === "Signed"} onChange={() => update((value) => { value.method = "Signed"; value.files = []; })} />
              <span>Signed — sign electronically with AXONS Sign</span>
            </label>
            <label className="quiz-option">
              <input type="radio" name="sign-method" value="Download" checked={state.method === "Download"} onChange={() => update((value) => { value.method = "Download"; value.signedAt = undefined; })} />
              <span>Download — download the document and sign it by hand</span>
            </label>
          </div>
        </fieldset>
        {!state.accepted && <p className="mock-note">Accept the letter to choose a signing method.</p>}
        {errors.method && <p className="sample-field-error" role="alert">{errors.method}</p>}
        {state.method === "Signed" && (
          <div className="sample-form-section">
            <h4>Sign with AXONS Sign</h4>
            {state.signedAt ? (
              <>
                <p className="mock-note">✓ Signed in AXONS Sign on {fmtDate(state.signedAt)}</p>
                {!submitted && <button className="button" onClick={() => update((value) => void (value.signedAt = undefined))}>Sign again</button>}
              </>
            ) : (
              <>
                <p className="helper">You will be taken to AXONS Sign to sign this letter. AXONS Sign is not connected in this prototype, so the button below simulates a completed signature.</p>
                <button className="button primary" onClick={() => update((value) => void (value.signedAt = new Date().toISOString()))}>Sign with AXONS Sign (simulated)</button>
              </>
            )}
            {errors.signature && <p className="sample-field-error" role="alert">{errors.signature}</p>}
          </div>
        )}
        {state.method === "Download" && (
          <div className="sample-form-section" data-field="files">
            <h4>Download and upload the signed document <span className="required">*</span></h4>
            <p className="helper">1. Download the letter and sign it by hand. 2. Scan it and upload the signed PDF below.</p>
            <button type="button" className="button small" onClick={() => downloadMockPdf(FILE_NAME, ["F-TLS-02 Commitment letter", "Mock document for the prototype", `Supplier: ${company}`, `Signer: ${signer}`])}>
              ↓ Download document
            </button>
            <div className="upload-box" style={{ marginTop: 14 }}>
              <div className="helper">PDF only · 1 file · max 5 MB</div>
              <input type="file" accept=".pdf,application/pdf" aria-label="Signed commitment letter" disabled={submitted || state.files.length >= 1} onChange={(e) => { pickFile(e.target.files); e.target.value = ""; }} />
              <div className="file-list">
                {state.files.map((file) => (
                  <div className="file-row" key={file.uid || file.name}>
                    <span>▤ &nbsp;{file.name} <small>({kb(file.size)} KB)</small></span>
                    {!submitted && <button type="button" aria-label={`Remove ${file.name}`} onClick={() => update((value) => void (value.files = []))}>Remove</button>}
                  </div>
                ))}
              </div>
            </div>
            {errors.files && <p className="sample-field-error" role="alert">{errors.files}</p>}
          </div>
        )}
        {submitted ? (
          <p className="mock-note">Submitted on {fmtDate(state.submittedAt)} · Signature: {state.method === "Signed" ? "signed in AXONS Sign" : state.method === "Download" ? "signed by hand and uploaded" : "submitted"}</p>
        ) : (
          <div className="wizard-footer">
            <button className="button" onClick={() => router.push(routes.onboarding)}>Back to tasks</button>
            <button className="button primary" onClick={submit}>Submit</button>
          </div>
        )}
      </article>
    </>
  );
}
