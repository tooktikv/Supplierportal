"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeading } from "@/components/ui";
import { addRequestDocuments, fmtDate } from "@/lib/docs";
import { isPhysical, transition } from "@/lib/policy";
import { routes } from "@/lib/routes";
import { usePortal } from "@/lib/store";
import { useConfirm } from "@/components/ConfirmDialog";
import type { FileMeta } from "@/lib/types";
import FormField from "./FormField";
import { RESPONSE_STATUSES } from "./sample-utils";
import UploadBox from "./UploadBox";

const stripFile = ({ name, size, type, expiry }: FileMeta): FileMeta => ({ name, size, type, expiry });

export default function RespondForm({ id }: { id: string }) {
  const { db, mutate, toast } = usePortal();
  const router = useRouter();
  const confirm = useConfirm();
  const [comments, setComments] = useState("");
  const [commentError, setCommentError] = useState(false);
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [quantity, setQuantity] = useState<string>();
  const [delivery, setDelivery] = useState<string>();
  const submitted = useRef(false);
  const r = db.requests.find((x) => x.id === id);
  const available = Boolean(r && RESPONSE_STATUSES.includes(r.status));

  useEffect(() => {
    if (!available && !submitted.current) router.replace(routes.samples);
  }, [available, router]);

  if (!r || !available) return null;
  const resubmit = r.status === "Resubmission Required";

  const submitResponse = async () => {
    const text = comments.trim();
    if (!text) {
      setCommentError(true);
      toast("Add a response comment before submitting.");
      return;
    }
    if (!(await confirm({ message: "Submit this response to the internal review team?", confirmLabel: "Submit" }))) return;
    const updatedQuantity = quantity ?? r.quantity ?? "";
    const updatedDelivery = delivery ?? r.instructions ?? "";
    submitted.current = true;
    mutate((d) => {
      const req = d.requests.find((x) => x.id === id);
      if (!req) return;
      req.revisions = req.revisions || [];
      req.revisions.push({ date: new Date().toISOString(), comments: text, files: files.map(stripFile), quantity: updatedQuantity, delivery: updatedDelivery });
      if (files.length) {
        req.files = [...(req.files || []), ...files.map(stripFile)];
        addRequestDocuments(d, req, files);
      }
      if (isPhysical(req.type)) {
        if (updatedQuantity) req.quantity = updatedQuantity;
        if (updatedDelivery) req.instructions = updatedDelivery;
      }
      req.feedback = "";
      req.requiredCorrections = "";
      transition(req, "Under Review");
    });
    toast("Your response has been submitted.");
    router.push(routes.sample(id));
  };

  return (
    <>
      <PageHeading
        title={resubmit ? "Submit revised information" : "Respond to evaluator feedback"}
        desc={`${r.id} · ${r.name}`}
        action={
          <button className="button subtle" onClick={() => router.push(routes.sample(r.id))}>
            Cancel
          </button>
        }
      />
      <div className="detail-layout">
        <div className="card wizard-card">
          <h2>Evaluator feedback</h2>
          <div className="feedback">
            <strong>Requested changes</strong>
            {r.feedback || r.requiredCorrections || "Please provide the requested information."}
            <br />
            <br />
            <strong>Required corrections</strong>
            {r.requiredCorrections || "Review feedback and provide an update."}
          </div>
          <div className="notice warning" style={{ marginTop: 14 }}>
            Your original request and previous decisions will be preserved. Your supplier response does not approve or reject the sample.
          </div>
          <div className="form-grid">
            <div className={`form-field full ${commentError ? "has-error" : ""}`}>
              <label htmlFor="response-comments">
                Response comments <span className="required">*</span>
              </label>
              <textarea
                id="response-comments"
                className="field-control"
                rows={4}
                placeholder="Describe the updates you are providing..."
                value={comments}
                onChange={(e) => {
                  setComments(e.target.value);
                  setCommentError(false);
                }}
              />
              <span className="form-error">Add a response comment before submitting.</span>
            </div>
            <div className="form-field full">
              <label>Updated attachments</label>
              <UploadBox
                files={files}
                helper="PDF, DOCX, JPG or PNG · max 10 MB per file. Mock attachment selection only."
                onAdd={(added) => setFiles((list) => [...list, ...added])}
                onExpiry={(i, value) => setFiles((list) => list.map((f, j) => (j === i ? { ...f, expiry: value } : f)))}
                onRemove={(i) => setFiles((list) => list.filter((_, j) => j !== i))}
              />
            </div>
            {isPhysical(r.type) ? (
              <>
                <div className="form-divider">Revised physical sample information</div>
                <FormField label="Updated sample quantity" name="responseQuantity" type="number" value={quantity ?? r.quantity ?? ""} onChange={setQuantity} />
                <FormField label="Updated delivery / handling notes" name="responseDelivery" textarea full value={delivery ?? r.instructions ?? ""} onChange={setDelivery} />
              </>
            ) : null}
          </div>
          <div className="wizard-footer">
            <span className="mock-note">Linked to original request {r.id}</span>
            <button className="button primary" onClick={submitResponse}>
              {resubmit ? "Submit Resubmission" : "Submit Response"}
            </button>
          </div>
        </div>
        <aside className="card detail-section">
          <h2>Change summary</h2>
          <div className="activity-list">
            {(r.revisions || []).length ? (
              (r.revisions || []).map((v, i) => (
                <div className="activity" key={`${v.date}-${i}`}>
                  <span className="activity-dot" />
                  <div>
                    <strong>Previous response {i + 1}</strong>
                    <small>
                      {fmtDate(v.date)} · {v.files?.length || 0} updated file(s)
                    </small>
                  </div>
                </div>
              ))
            ) : (
              <p className="mock-note">No previous responses. This will be the first revision.</p>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
