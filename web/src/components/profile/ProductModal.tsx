"use client";

import { useEffect, useState } from "react";
import { Badge, InfoItem } from "@/components/ui";
import { fmtDate } from "@/lib/docs";
import { needsSample } from "@/lib/policy";
import type { DocRecord, FileMeta } from "@/lib/types";
import { Preview } from "./DocumentModal";

/** A registered product category; seeded and older saved records only carry name/code/status. */
export interface ProductRec {
  name: string;
  code?: string;
  status: string;
  main?: string;
  sub?: string;
  material?: string;
  details?: string;
  files?: FileMeta[];
}

export const productMain = (p: ProductRec) => p.main || p.name;

const kb = (size = 0) => (size / 1024).toFixed(0);

export default function ProductModal({ product, onClose }: { product: ProductRec; onClose: () => void }) {
  const [fileIndex, setFileIndex] = useState(0);
  const files = product.files || [];
  const file = files[Math.min(fileIndex, files.length - 1)];
  const main = productMain(product);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lets the watermarked document preview be reused for catalog files.
  const previewDoc: DocRecord = {
    name: product.name,
    type: "Product catalog",
    related: main,
    issue: "",
    expiry: "",
    status: "Pending",
    group: "Registration",
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-dialog preview-dialog" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
        <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <div className="modal-body">
          <div className="doc-modal-head">
            <div>
              <h2 id="product-modal-title">{product.name}</h2>
              <p className="modal-hint">Product category details from your supplier registration</p>
            </div>
            <Badge status={product.status} />
          </div>
          <div className="doc-modal-grid">
            <div className="doc-preview-pane">
              <h3 className="doc-pane-title">Product catalog</h3>
              {file ? (
                <>
                  <div className="preview-caption">
                    <strong>{file.name}</strong>
                    <small>
                      {file.size ? `${kb(file.size)} KB · ` : ""}
                      {files.length} catalog file{files.length === 1 ? "" : "s"}
                    </small>
                  </div>
                  {files.length > 1 && (
                    <div className="preview-files">
                      {files.map((f, i) => (
                        <button
                          key={`${f.uid || f.name}-${i}`}
                          type="button"
                          className={`document-tab ${i === fileIndex ? "selected" : ""}`}
                          onClick={() => setFileIndex(i)}
                        >
                          {f.name}
                        </button>
                      ))}
                    </div>
                  )}
                  <Preview doc={previewDoc} file={file} />
                </>
              ) : (
                <div className="table-empty">
                  <div className="empty-icon">▤</div>
                  <h3>No catalog attached</h3>
                  <p>This category has no catalog file on record.</p>
                </div>
              )}
            </div>
            <aside className="doc-side">
              <h3>Details</h3>
              <div className="info-grid">
                <InfoItem label="Main category (กลุ่มสินค้าหลัก)" value={main} />
                <InfoItem label="Sub category (กลุ่มสินค้าย่อย)" value={product.sub} />
                <InfoItem label="Material group (กลุ่มวัสดุ)" value={product.material} />
                <InfoItem label="Reference" value={product.code} />
                <InfoItem
                  label="Sample requirement"
                  value={needsSample(main) ? "Sample approval may be required" : "Not required"}
                />
                <InfoItem label="Status" value={product.status} />
              </div>
              <h3>Category details (รายละเอียดของกลุ่มสินค้า)</h3>
              <p className="product-details">{product.details || "No additional details were provided."}</p>
              <h3>Catalog files</h3>
              {files.length ? (
                <div className="version-list">
                  {files.map((f, i) => (
                    <button
                      key={`${f.uid || f.name}-${i}`}
                      type="button"
                      className={`version-item ${i === fileIndex ? "selected" : ""}`}
                      aria-pressed={i === fileIndex}
                      onClick={() => setFileIndex(i)}
                    >
                      <span className="version-dot" />
                      <span>
                        <strong>{f.name}</strong>
                        <small>
                          {f.size ? `${kb(f.size)} KB · ` : ""}
                          {f.expiry ? `Expires ${fmtDate(f.expiry)}` : "Catalog file"}
                        </small>
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mock-note">No catalog file attached.</p>
              )}
            </aside>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
