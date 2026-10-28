"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, PageHeading } from "@/components/ui";
import { addRequestDocuments, todayIso } from "@/lib/docs";
import { useI18n } from "@/lib/i18n";
import { transition } from "@/lib/policy";
import { routes } from "@/lib/routes";
import { buyerRequestOf, canSubmitSample, sampleDocumentsRequired, sampleSubmissionErrors, sampleSubmissionOf, type SampleSubmission } from "@/lib/sample-request-flow";
import { usePortal } from "@/lib/store";
import { useConfirm } from "@/components/ConfirmDialog";
import DemoFill from "@/components/DemoFill";
import { demoSampleSubmission } from "@/lib/demo";
import type { RequestRec } from "@/lib/types";
import BuyerRequestBrief from "./BuyerRequestBrief";
import FormField from "./FormField";
import UploadBox from "./UploadBox";

function SubmissionEditor({ request }: { request: RequestRec }) {
  const { db, mutate, toast } = usePortal();
  const { t } = useI18n();
  const router = useRouter();
  const confirm = useConfirm();
  const [submission, setSubmission] = useState(() => ({
    siteName: db.profile.factories[0]?.name || db.profile.company,
    siteAddress: db.profile.factories[0]?.address || db.profile.site,
    contactPhone: db.profile.phone,
    ...structuredClone(sampleSubmissionOf(request, db.profile.contact, db.profile.email)),
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof SampleSubmission, string>>>({});
  const onsite = buyerRequestOf(request).reviewMode === "Onsite";
  const documentsRequired = sampleDocumentsRequired(request);
  const editable = canSubmitSample(request);

  const update = <Key extends keyof SampleSubmission>(key: Key, value: SampleSubmission[Key]) => {
    setSubmission((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };
  const field = (key: Exclude<keyof SampleSubmission, "files">) => ({
    name: key, value: submission[key], onChange: (value: string) => update(key, value), hasError: Boolean(errors[key]), error: errors[key],
  });

  const save = async (submit: boolean) => {
    if (!editable) return;
    if (submit) {
      const nextErrors = sampleSubmissionErrors(request, submission);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length) {
        toast("Complete the highlighted sample information for the requested review method.");
        const first = Object.keys(nextErrors)[0];
        document.querySelector<HTMLElement>(`[data-field="${first}"] input, [data-field="${first}"] textarea`)?.focus();
        return;
      }
      if (!(await confirm({ message: "Submit your sample information for Buyer request {id}?", vars: { id: request.id }, confirmLabel: "Submit" }))) return;
    }
    let saved = false;
    mutate((draft) => {
      const current = draft.requests.find((item) => item.id === request.id);
      if (!current || !canSubmitSample(current)) return;
      current.buyerRequest = structuredClone(buyerRequestOf(current));
      if (current.supplierSubmission?.submittedAt) {
        current.supplierSubmissionHistory = current.supplierSubmissionHistory || [];
        current.supplierSubmissionHistory.push(structuredClone(current.supplierSubmission));
      }
      current.supplierSubmission = structuredClone(submission);
      delete current.supplierSubmission.submittedAt;
      current.updated = todayIso();
      if (submit) {
        current.supplierSubmission.submittedAt = new Date().toISOString();
        current.quantity = submission.quantity;
        current.unit = submission.unit;
        current.specification = submission.specification;
        current.files = structuredClone(submission.files);
        transition(current, "Under Review");
        current.history[current.history.length - 1][0] = onsite ? "Onsite sample proposal submitted for Buyer review" : "Digital sample documents submitted for Buyer review";
        addRequestDocuments(draft, current);
      } else {
        if (current.status === "Awaiting Submission") transition(current, "Draft");
        current.history.push(["Supplier response draft saved", new Date().toISOString()]);
      }
      saved = true;
    });
    if (!saved) return toast("This request is no longer editable. Open the latest request details.");
    toast(submit ? "Sample submitted. Awaiting Buyer review." : "Response draft saved. Nothing has been sent to Buyer.");
    router.push(submit ? routes.sample(request.id) : routes.samples);
  };

  return (
    <>
      <PageHeading title="Provide sample information" desc={`${request.id} · ${request.name}`} action={<button className="button" onClick={() => router.push(routes.samples)}>{t("Back to requests")}</button>} />
      {!editable ? <div className="notice">{t("This request has already been submitted.")} <button className="text-link" onClick={() => router.push(routes.sample(request.id))}>{t("View details")}</button></div> : (
        <>
          <DemoFill onFill={() => { setErrors({}); setSubmission((current) => ({ ...current, ...demoSampleSubmission(current, { onsite, documentsRequired }) })); }} />
          <div className="sample-response-layout">
            <aside className="sample-request-context"><BuyerRequestBrief request={request} /><Badge status={request.status} /></aside>
            <div className="sample-response-fields">
              {request.feedback && <div className="notice warning"><strong>{t("Buyer feedback")}</strong><p className="sample-copy">{t(request.feedback)}</p>{request.requiredCorrections && <p className="sample-copy">{t(request.requiredCorrections)}</p>}</div>}
              <section className="sample-form-section">
                <h2>{t("Sample product")}</h2>
                <div className="form-grid">
                  <FormField label="Sample product name" {...field("productName")} required />
                  <FormField label="Supplier product code / model" {...field("productCode")} required />
                  <FormField label="Specification / technical details" {...field("specification")} required textarea full />
                  {onsite && <>
                    <FormField label="Sample quantity" {...field("quantity")} type="number" min="0.01" required />
                    <FormField label="Unit of measure" {...field("unit")} required placeholder="pieces, kg, sets…" />
                  </>}
                  <FormField label="Batch / lot number" {...field("batch")} />
                  <FormField label="Differences from Buyer requirements" {...field("deviations")} textarea full />
                </div>
              </section>
              <section className="sample-form-section" data-field="files">
                <h2>{t("Sample documents")} {documentsRequired ? <span className="required">*</span> : <small className="helper">{t("(optional)")}</small>}</h2>
                <UploadBox files={submission.files} helper="Specification, catalog, test report or COA · PDF, DOCX, JPG or PNG · max 10 MB per file" labelRemove
                  onAdd={(files) => update("files", [...submission.files, ...files])}
                  onExpiry={(index, expiry) => update("files", submission.files.map((file, position) => position === index ? { ...file, expiry } : file))}
                  onRemove={(index) => update("files", submission.files.filter((_, position) => position !== index))} />
                {errors.files && <p className="sample-field-error" role="alert">{t(errors.files)}</p>}
              </section>
              {onsite && <section className="sample-form-section">
                <h2>{t("Proposed onsite review")}</h2>
                <p className="helper">{t("Pending Buyer review and appointment confirmation. Time is local to the site.")}</p>
                <div className="form-grid">
                  <FormField label="Site / factory name" {...field("siteName")} required full />
                  <FormField label="Onsite review address" {...field("siteAddress")} required textarea full />
                  <FormField label="Proposed visit date" {...field("visitDate")} type="date" min={todayIso()} required />
                  <FormField label="Proposed visit time (site local time)" {...field("visitTime")} type="time" required />
                  <FormField label="Access / safety requirements" {...field("visitNotes")} textarea full />
                </div>
              </section>}
              <section className="sample-form-section">
                <h2>{onsite ? t("Onsite coordinator") : t("Supplier contact")}</h2>
                <div className="form-grid">
                  <FormField label="Contact name" {...field("contactName")} required />
                  <FormField label="Contact email" {...field("contactEmail")} type="email" required />
                  {onsite && <FormField label="Onsite contact phone" {...field("contactPhone")} type="tel" required />}
                  <FormField label="Message to Buyer" {...field("notes")} textarea full />
                </div>
              </section>
            </div>
          </div>
          <div className="sample-submit-bar"><button className="button" onClick={() => save(false)}>{t("Save draft")}</button><button className="button primary" onClick={() => save(true)}>{t("Submit to Buyer")}</button></div>
        </>
      )}
    </>
  );
}

export default function SampleSubmissionForm({ id }: { id: string }) {
  const { db } = usePortal();
  const router = useRouter();
  const request = db.requests.find((item) => item.id === id);
  useEffect(() => { if (!request) router.replace(routes.samples); }, [request, router]);
  return request ? <SubmissionEditor key={request.id} request={request} /> : null;
}