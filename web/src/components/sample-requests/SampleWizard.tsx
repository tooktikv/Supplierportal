"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { InfoItem, PageHeading } from "@/components/ui";
import { addRequestDocuments, fmtDate, todayIso } from "@/lib/docs";
import { CATEGORIES, isDigital, isPhysical, needsSample, policyFields, requiresApproval, transition } from "@/lib/policy";
import { routes } from "@/lib/routes";
import { usePortal } from "@/lib/store";
import type { FileMeta, RequestRec } from "@/lib/types";
import FormField from "./FormField";
import { createRequestId, kb, newDraftRequest, newSampleForm, stepErrors, WIZARD_NAMES } from "./sample-utils";
import UploadBox from "./UploadBox";

const TYPE_OPTIONS = [
  ["Physical", "Physical sample", "Send a product sample"],
  ["Digital", "Digital sample / specification", "Submit technical files"],
  ["Both", "Both physical and digital", "Send a sample and files"],
];

export default function SampleWizard() {
  const { db, mutate, toast, wizard, setWizard } = usePortal();
  const router = useRouter();
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const initialised = useRef(false);

  // A fresh draft is created only when the wizard is opened without one (e.g. a direct visit).
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    if (!wizard.form) setWizard({ form: newSampleForm(db.profile.company), step: 0 });
  }, [wizard.form, setWizard, db.profile.company]);

  const form = wizard.form;
  if (!form) return null;
  const step = wizard.step;
  const isEdit = Boolean(form.id);
  const files: FileMeta[] = form.files || [];

  const setField = (key: string, value: unknown) => {
    setWizard((w) => (w.form ? { ...w, form: { ...w.form, [key]: value } } : w));
    if (key === "category" || key === "type") setErrors(new Set());
  };
  const setFiles = (next: FileMeta[]) => {
    setField("files", next);
    setErrors(new Set());
  };
  const field = (name: string) => ({ name, value: form[name] as string | undefined, onChange: (v: string) => setField(name, v), hasError: errors.has(name) });

  const validateStep = (s: number) => {
    const e = stepErrors(form, s);
    setErrors(e);
    if (e.size) toast("Please complete the required fields before continuing.");
    return e.size === 0;
  };

  const validateAll = () => {
    const first = [0, 1, 2, 3].find((i) => stepErrors(form, i).size > 0);
    if (first === undefined) return true;
    setWizard((w) => ({ ...w, step: first }));
    validateStep(first);
    toast("Review the highlighted required fields.");
    return false;
  };

  const changeStep = (delta: number) => {
    if (delta > 0 && !validateStep(step)) return;
    setWizard((w) => ({ ...w, step: Math.max(0, Math.min(3, w.step + delta)) }));
    setErrors(new Set());
  };

  const saveDraft = () => {
    const now = todayIso();
    let id = form.id as string;
    if (id) {
      const existing = db.requests.find((r) => r.id === id);
      if (!existing || existing.status !== "Draft") return toast("This draft can no longer be changed.");
      mutate((d) => {
        const index = d.requests.findIndex((r) => r.id === id);
        d.requests[index] = policyFields({ ...d.requests[index], ...form, updated: now } as RequestRec);
      });
    } else {
      id = createRequestId(db);
      const newId = id;
      mutate((d) => {
        d.requests.unshift(newDraftRequest(form, newId, now));
      });
      setField("id", newId);
    }
    toast("Draft saved in this browser.");
    router.push(routes.sample(id));
  };

  const submitRequest = () => {
    if (!validateAll()) return;
    if (!window.confirm(`Submit sample request for “${form.name}”? You can view its status and history after submission.`)) return;
    const now = todayIso();
    let id = form.id as string;
    if (id) {
      const existing = db.requests.find((x) => x.id === id);
      if (!existing || existing.status !== "Draft") return toast("This request is no longer a draft.");
      mutate((d) => {
        const r = d.requests.find((x) => x.id === id);
        if (!r) return;
        Object.assign(r, form);
        transition(r, "Submitted");
        addRequestDocuments(d, r);
      });
    } else {
      id = createRequestId(db);
      const newId = id;
      mutate((d) => {
        const r = newDraftRequest(form, newId, now);
        d.requests.unshift(r);
        transition(r, "Submitted");
        addRequestDocuments(d, r);
      });
    }
    setWizard((w) => ({ ...w, form: null }));
    toast("Sample request submitted successfully.");
    router.push(routes.sample(id));
  };

  const upload = (
    <div className="form-field full">
      <label>Attach supporting documents</label>
      <UploadBox
        files={files}
        helper="PDF, DOCX, JPG or PNG · max 10 MB per file. Attachments are simulated and remain in this browser only."
        labelRemove
        onAdd={(added) => setFiles([...files, ...added])}
        onExpiry={(i, value) => setField("files", files.map((f, j) => (j === i ? { ...f, expiry: value } : f)))}
        onRemove={(i) => setFiles(files.filter((_, j) => j !== i))}
      />
    </div>
  );

  let body;
  if (step === 0) {
    body = (
      <div className="form-grid">
        <FormField label="Supplier company" {...field("supplier")} readOnly hint="Linked to your signed-in supplier account." />
        <FormField label="Product category" {...field("category")} required select={Object.keys(CATEGORIES)} error="Select the product category." />
        <FormField label="Product name" {...field("name")} required error="Enter the product or sample name." />
        <FormField label="Product code / specification reference" {...field("code")} required error="Enter a product code or specification reference." />
        <div className={`form-field full ${errors.has("type") ? "has-error" : ""}`} data-field="type">
          <label>
            Sample submission type <span className="required">*</span>
          </label>
          <div className="radio-options">
            {TYPE_OPTIONS.map(([v, t, d]) => (
              <label className="radio-card" key={v}>
                <input type="radio" name="sampleType" value={v} checked={form.type === v} onChange={() => setField("type", v)} />
                <span>
                  <strong>{t}</strong>
                  <small>{d}</small>
                </span>
              </label>
            ))}
          </div>
          <small>Sample approval requirements depend on the selected product category.</small>
          <span className="form-error">Choose a submission type.</span>
        </div>
        <div className="notice full" style={{ gridColumn: "1/-1" }}>
          {form.category
            ? requiresApproval(form.category)
              ? "This category requires sample approval before the sample gate is satisfied. Supplier onboarding qualification remains a separate decision."
              : needsSample(form.category)
                ? "A sample is required for this category, but sample approval is not a mandatory onboarding gate."
                : "This category is configured as sample-exempt; its sample gate will be recorded as Exempt."
            : "Select a category to see its sample requirement."}
        </div>
      </div>
    );
  } else if (step === 1) {
    body = (
      <div className="form-grid">
        {isPhysical(form.type) ? (
          <>
            <div className="form-divider">Physical sample details</div>
            <FormField label="Sample quantity" {...field("quantity")} required type="number" min="1" error="Enter a quantity greater than zero." />
            <FormField label="Unit of measure" {...field("unit")} required />
            <FormField label="Product description / technical requirements" {...field("description")} required textarea full error="Describe the product or its technical requirements." />
            <FormField label="Sample identification notes" {...field("notes")} textarea full placeholder="Optional handling or identification information" />
          </>
        ) : null}
        {isDigital(form.type) ? (
          <>
            <div className="form-divider">Digital sample / specification</div>
            <FormField label="Product specification" {...field("specification")} required textarea full error="Enter the relevant specification or standard." />
            <FormField label="Technical description" {...field("digitalDescription")} textarea full placeholder="Optional technical detail" />
            <FormField label="Reference URL" {...field("url")} type="url" full placeholder="https://" />
            {upload}
          </>
        ) : null}
      </div>
    );
  } else if (step === 2) {
    body = (
      <div className="form-grid">
        {isPhysical(form.type) ? (
          <>
            <div className="form-divider">Physical sample delivery</div>
            <FormField label="Delivery address" {...field("address")} required textarea full error="Enter the delivery address." />
            <FormField label="Recipient name" {...field("recipient")} required error="Enter the receiving contact." />
            <FormField label="Recipient contact" {...field("contact")} required error="Enter a phone number or email address." />
            <FormField label="Requested delivery date" {...field("deliveryDate")} required type="date" min={todayIso()} error="Select a requested delivery date." />
            <FormField label="Shipping / handling instructions" {...field("instructions")} textarea full placeholder="Optional delivery instructions" />
          </>
        ) : null}
        {isDigital(form.type) ? (
          <>
            <div className="form-divider">Digital documents</div>
            <p className="helper full" style={{ gridColumn: "1/-1" }}>
              Attach datasheets, specifications, product images, certificates, or other supporting evidence. Files are not uploaded to a server.
            </p>
            {upload}
          </>
        ) : null}
      </div>
    );
  } else {
    body = (
      <>
        <div className="notice">
          Review the information before submitting. Your request will be saved to this browser’s mock data. Submission does not record an approval decision.
        </div>
        <div className="content-stack">
          <div className="card detail-section">
            <h2>Supplier & product information</h2>
            <div className="info-grid">
              <InfoItem label="Supplier" value={db.profile.company} />
              <InfoItem label="Product" value={form.name} />
              <InfoItem label="Product code" value={form.code} />
              <InfoItem label="Category" value={form.category} />
              <InfoItem label="Sample type" value={form.type} />
              <InfoItem label="Sample gate" value={needsSample(form.category) ? "Pending internal approval" : "Exempt"} />
            </div>
          </div>
          {isPhysical(form.type) ? (
            <div className="card detail-section">
              <h2>Physical sample & delivery</h2>
              <div className="info-grid">
                <InfoItem label="Quantity" value={`${form.quantity} ${form.unit}`} />
                <InfoItem label="Requested delivery" value={fmtDate(form.deliveryDate)} />
                <InfoItem label="Description" value={form.description} />
                <InfoItem label="Recipient" value={form.recipient} />
                <InfoItem label="Delivery address" value={form.address} />
                <InfoItem label="Contact" value={form.contact || "—"} />
              </div>
            </div>
          ) : null}
          {isDigital(form.type) ? (
            <div className="card detail-section">
              <h2>Digital sample & documents</h2>
              <div className="info-grid">
                <InfoItem label="Product specification" value={form.specification} />
                <InfoItem label="Reference URL" value={form.url || "—"} />
              </div>
              <div className="file-list">
                {files.length ? (
                  files.map((f, i) => (
                    <div className="file-row" key={f.uid || `${f.name}-${i}`}>
                      {f.name} <small>{kb(f.size)} KB</small>
                    </div>
                  ))
                ) : (
                  <small>No attachments selected</small>
                )}
              </div>
            </div>
          ) : null}
          <label className={`declaration ${errors.has("declaration") ? "has-error" : ""}`} data-field="declaration">
            <input type="checkbox" checked={Boolean(form.declaration)} onChange={(e) => setField("declaration", e.target.checked)} />
            <span>
              I confirm that the information provided is accurate and the documents are relevant to this product. <span className="required">*</span>
            </span>
            <span className="form-error">Confirm the declaration before submitting.</span>
          </label>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeading
        title={isEdit ? "Continue Sample Request" : "New Sample Request"}
        desc={`Step ${step + 1} of 4 · ${WIZARD_NAMES[step]}`}
        action={
          <button className="button subtle" onClick={() => router.push(routes.samples)}>
            Cancel
          </button>
        }
      />
      <div className="card wizard-card">
        <div className="wizard-steps">
          {WIZARD_NAMES.map((n, i) => (
            <div className={`wizard-step ${i === step ? "current" : i < step ? "done" : ""}`} key={n}>
              <span>{i < step ? "✓" : i + 1}</span>
              {n}
            </div>
          ))}
        </div>
        {body}
        <div className="wizard-footer">
          <button className="button" onClick={saveDraft}>
            {isEdit ? "Save Draft" : "Save as Draft"}
          </button>
          <div className="footer-right">
            {step > 0 ? (
              <button className="button" onClick={() => changeStep(-1)}>
                Back
              </button>
            ) : null}
            {step < 3 ? (
              <button className="button primary" onClick={() => changeStep(1)}>
                Continue
              </button>
            ) : (
              <button className="button primary" onClick={submitRequest}>
                Submit Request
              </button>
            )}
          </div>
        </div>
        <p className="mock-note" style={{ margin: "12px 0 0" }}>
          Prototype only · no backend or real file upload is connected.
        </p>
      </div>
    </>
  );
}
