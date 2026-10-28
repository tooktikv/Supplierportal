"use client";

import { useEffect, useState } from "react";
import { Badge, InfoItem } from "@/components/ui";
import { COMPANY } from "@/lib/data";
import {
  DOC_TYPES,
  docSource,
  docVersions,
  documentStatus,
  filePreviews,
  findDocByName,
  fmtDate,
  latestUpload,
  pushDocument,
  todayIso,
  trackFile,
  wmTime,
} from "@/lib/docs";
import { useI18n } from "@/lib/i18n";
import { usePortal } from "@/lib/store";
import type { DocRecord, FileMeta } from "@/lib/types";

interface PendingMeta {
  name: string;
  type: string;
  fixed: boolean;
}

export interface DocModalInit {
  /** Index in db.documents; null for a new document. */
  doc: number | null;
  v: number;
  upload: PendingMeta | null;
}

const ALLOWED_EXT = ["pdf", "docx", "jpg", "jpeg", "png"];
const STAMPS = [0, 1, 2, 3, 4, 5];

const kb = (size = 0) => (size / 1024).toFixed(0);
const extOf = (name: string) => name.split(".").pop()?.toLowerCase() || "";

function ExpiryInput({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  const { toast } = usePortal();
  const { t } = useI18n();
  return (
    <label className="file-expiry">
      {t("Expiry date")}
      <input
        type="date"
        min={todayIso()}
        value={value || ""}
        onChange={(e) => {
          if (e.target.value && e.target.value < todayIso()) return toast("Expiry date cannot be in the past.");
          onChange(e.target.value);
        }}
      />
    </label>
  );
}

export function Preview({ doc, file }: { doc: DocRecord; file: FileMeta }) {
  const { t } = useI18n();
  const url = file.uid ? filePreviews.get(file.uid) : undefined;
  const ext = extOf(file.name);
  const time = wmTime();
  let content;
  if (url && ["png", "jpg", "jpeg"].includes(ext)) {
    // eslint-disable-next-line @next/next/no-img-element
    content = <img className="preview-media" src={url} alt={t("Preview of {name}", { name: file.name })} />;
  } else if (url && ext === "pdf") {
    content = <iframe className="preview-media" title={t("Preview of {name}", { name: file.name })} src={`${url}#toolbar=0&navpanes=0`} />;
  } else {
    content = (
      <div className="preview-paper">
        <h3>{file.name}</h3>
        <p>
          {t(doc.type)} · {t(docSource(doc))}
        </p>
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} style={{ width: i % 4 === 3 ? "62%" : "100%" }} />
        ))}
      </div>
    );
  }
  return (
    <>
      <div className="preview-stage">
        {content}
        <div className="wm-layer" aria-hidden="true">
          {STAMPS.map((n) => (
            <div className="wm-stamp" key={n}>
              <span className="wm-copy">{t("Copy")}</span>
              <small>
                {t("Copied and published by")}
                <br />
                {COMPANY.email}
                <br />
                {time}
              </small>
            </div>
          ))}
        </div>
      </div>
      {!url && (
        <p className="mock-note">
          {t("Mock preview: the original file content is only available in the session where it was uploaded, and seeded records have no file.")}
        </p>
      )}
    </>
  );
}

const expiryText = (files: FileMeta[], t: (text: string, vars?: Record<string, string | number>) => string) => {
  const e = files.map((f) => f.expiry).filter(Boolean).sort()[0];
  return e ? t("Expires {date}", { date: fmtDate(e) }) : t("No expiry");
};

function ViewBody({ doc, v, f, onSelect }: { doc: DocRecord; v: number; f: number; onSelect: (v?: number, f?: number) => void }) {
  const { t } = useI18n();
  const versions = docVersions(doc);
  if (!versions.length)
    return (
      <div className="table-empty">
        <div className="empty-icon">▤</div>
        <h3>{t("No file uploaded yet")}</h3>
        <p>{t("Upload a file to start this document's history.")}</p>
      </div>
    );
  const vi = Math.min(v, versions.length - 1);
  const version = versions[vi];
  const fi = Math.min(f, version.files.length - 1);
  const file = version.files[fi];
  const isCurrent = vi === versions.length - 1;

  return (
    <div className="doc-modal-grid">
      <div className="doc-preview-pane">
        {!isCurrent && (
          <div className="notice warning" style={{ margin: "0 0 10px" }}>
            {t("You are viewing an older version.")}{" "}
            <button type="button" className="text-link" onClick={() => onSelect()}>
              {t("Back to current version")}
            </button>
          </div>
        )}
        <div className="preview-caption">
          <strong>{file.name}</strong>
          <small>
            {t("Version {n}", { n: version.version })} · {file.size ? `${kb(file.size)} KB · ` : ""}
            {file.expiry ? t("expires {date}", { date: fmtDate(file.expiry) }) : t("no expiry")}
          </small>
        </div>
        {version.files.length > 1 && (
          <div className="preview-files">
            {version.files.map((x, n) => (
              <button key={n} type="button" className={`document-tab ${n === fi ? "selected" : ""}`} onClick={() => onSelect(vi, n)}>
                {x.name}
              </button>
            ))}
          </div>
        )}
        <Preview doc={doc} file={file} />
      </div>
      <aside className="doc-side">
        <h3>{t("Details")}</h3>
        <div className="info-grid">
          <InfoItem label="Document type" value={doc.type} />
          <InfoItem label="Upload source" value={docSource(doc)} />
          <InfoItem label="Related to" value={doc.related} />
          <InfoItem label="Latest upload" value={fmtDate(latestUpload(doc))} />
          <InfoItem label="Expiry date" value={fmtDate(doc.expiry === "—" ? "" : doc.expiry)} />
          <InfoItem label="Versions" value={String(versions.length)} />
        </div>
        <h3>{t("Upload history")}</h3>
        <div className="version-list">
          {versions
            .map((x, n) => [x, n] as const)
            .reverse()
            .map(([x, n]) => (
              <button
                key={n}
                type="button"
                className={`version-item ${n === vi ? "selected" : ""}`}
                aria-pressed={n === vi}
                onClick={() => onSelect(n, 0)}
              >
                <span className="version-dot"></span>
                <span>
                  <strong>
                    {t("Version {n}", { n: x.version })}
                    {n === versions.length - 1 && <Badge status="Current" />}
                  </strong>
                  <small>
                    {t("Uploaded {date}", { date: fmtDate(x.date) })} · {t(x.files.length === 1 ? "{n} file" : "{n} files", { n: x.files.length })} · {expiryText(x.files, t)}
                  </small>
                </span>
              </button>
            ))}
        </div>
      </aside>
    </div>
  );
}

interface UploadBodyProps {
  meta: PendingMeta;
  files: FileMeta[];
  onMeta: (meta: PendingMeta) => void;
  onFiles: (files: FileList | null) => void;
  onExpiry: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}

function UploadBody({ meta, files, onMeta, onFiles, onExpiry, onRemove }: UploadBodyProps) {
  const { db } = usePortal();
  const { t } = useI18n();
  const typeOptions = [...new Set([...DOC_TYPES, ...db.documents.map((d) => d.type)])];
  const match = findDocByName(db, meta.name, meta.type);

  return (
    <>
      <div className="form-grid" style={{ alignItems: "start" }}>
        <div className="form-field">
          <label htmlFor="pending-name">
            {t("Document name")}{!meta.fixed && <> <span className="required">*</span></>}
          </label>
          <input
            className="field-control"
            id="pending-name"
            type="text"
            autoComplete="off"
            autoFocus={!meta.fixed}
            value={meta.name}
            placeholder={t("Enter the document name")}
            disabled={meta.fixed}
            onChange={(e) => onMeta({ ...meta, name: e.target.value })}
          />
        </div>
        <div className="form-field">
          <label htmlFor="pending-type">
            {t("Document type")}{!meta.fixed && <> <span className="required">*</span></>}
          </label>
          <select
            className="field-control"
            id="pending-type"
            disabled={meta.fixed}
            value={meta.type}
            onChange={(e) => onMeta({ ...meta, type: e.target.value })}
          >
            <option value="">{t("Select a document type")}</option>
            {typeOptions.map((option) => (
              <option key={option} value={option}>{t(option)}</option>
            ))}
          </select>
        </div>
      </div>
      <small className="helper" style={{ display: "block", minHeight: 15, marginTop: 6 }}>
        {match && !meta.fixed ? t("This document already exists, so the file will be saved as a new version.") : ""}
      </small>
      <label className="doc-drop" style={{ marginTop: 14 }}>
        <input
          type="file"
          multiple
          accept=".pdf,.docx,.jpg,.jpeg,.png"
          aria-label={t("Choose files")}
          onChange={(e) => {
            onFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <span className="doc-drop-icon">↑</span>
        <span>
          <b>
            {t("Drag files here or")} <u>{t("choose files")}</u>
          </b>
          <br />
          <small>{t("PDF, DOCX, JPG or PNG · max 10 MB per file")}</small>
        </span>
      </label>
      {files.length > 0 && (
        <>
          <p className="mock-note" style={{ margin: "12px 0 4px" }}>
            {t("Enter each file's expiry date so the system knows when it expires. Leave it blank if it does not expire.")}
          </p>
          <div className="file-list">
            {files.map((p, i) => (
              <div className="file-row" key={p.uid || i}>
                <span className="file-ico">{extOf(p.name).toUpperCase().slice(0, 4)}</span>
                <span className="file-name">
                  {p.name}
                  <small>{kb(p.size)} KB</small>
                </span>
                <button type="button" onClick={() => onRemove(i)}>
                  {t("Remove")}
                </button>
                <ExpiryInput value={p.expiry} onChange={(v) => onExpiry(i, v)} />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

export default function DocumentModal({ init, onClose }: { init: DocModalInit; onClose: () => void }) {
  const { db, mutate, toast } = usePortal();
  const { t } = useI18n();
  const [docIdx, setDocIdx] = useState(init.doc);
  const [sel, setSel] = useState({ v: init.v, f: 0 });
  const [pending, setPending] = useState<PendingMeta | null>(init.upload);
  const [files, setFiles] = useState<FileMeta[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const doc = docIdx === null ? null : db.documents[docIdx];
  if (docIdx !== null && !doc) return null;

  const uploading = pending !== null;

  const startVersion = () => {
    if (!doc) return;
    setSel({ v: Math.max(0, docVersions(doc).length - 1), f: 0 });
    setPending({ name: doc.name, type: doc.type, fixed: true });
    setFiles([]);
  };

  const cancelUpload = () => {
    setFiles([]);
    setPending(null);
    if (!doc || !docVersions(doc).length) onClose();
  };

  const addFiles = (list: FileList | null) => {
    const added: FileMeta[] = [];
    for (const file of Array.from(list || [])) {
      const ext = extOf(file.name);
      if (file.size > 10 * 1024 * 1024) {
        toast(t("{name} exceeds the 10 MB limit.", { name: file.name }));
        continue;
      }
      if (!ALLOWED_EXT.includes(ext)) {
        toast(t("{name} is not a supported document type.", { name: file.name }));
        continue;
      }
      added.push(trackFile(file, file.type || ext));
    }
    if (added.length) setFiles((cur) => [...cur, ...added]);
  };

  const setExpiry = (i: number, value: string) => setFiles((cur) => cur.map((f, n) => (n === i ? { ...f, expiry: value } : f)));

  const save = () => {
    if (!pending) return;
    const name = pending.name.trim();
    const { type } = pending;
    if (!name) return toast("Enter a document name.");
    if (!type) return toast("Select a document type.");
    if (!files.length) return toast("Choose at least one file.");
    const saved: { index: number; versions: number; name: string }[] = [];
    mutate((draft) => {
      const match = findDocByName(draft, name, type);
      const d = pushDocument(draft, files, { name: match ? match.name : name, type, group: "Manual" });
      if (d) saved.push({ index: draft.documents.indexOf(d), versions: docVersions(d).length, name: d.name });
    });
    const [res] = saved;
    if (!res) return;
    setFiles([]);
    setPending(null);
    setDocIdx(res.index);
    setSel({ v: res.versions - 1, f: 0 });
    toast(
      res.versions > 1
        ? t("Version {n} of “{name}” saved. Earlier uploads are kept in the history.", { n: res.versions, name: res.name })
        : t("“{name}” added. File contents were not saved.", { name: res.name }),
    );
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !uploading) onClose();
      }}
    >
      <div className="modal-dialog preview-dialog" role="dialog" aria-modal="true" aria-labelledby="doc-modal-title">
        <button type="button" className="modal-close" aria-label={t("Close")} onClick={onClose}>
          ×
        </button>
        <div className="modal-body">
          {pending ? (
            <>
              <div className="doc-modal-head">
                <div>
                  <h2 id="doc-modal-title">{pending.fixed ? t("Upload new version · {name}", { name: pending.name }) : t("Add document")}</h2>
                  <p className="modal-hint">
                    {pending.fixed
                      ? t("The current version stays in the upload history.")
                      : t("Use an existing document name to add a new version; earlier uploads stay in that document's history.")}
                  </p>
                </div>
              </div>
              <UploadBody
                meta={pending}
                files={files}
                onMeta={setPending}
                onFiles={addFiles}
                onExpiry={setExpiry}
                onRemove={(i) => setFiles((cur) => cur.filter((_, n) => n !== i))}
              />
            </>
          ) : (
            doc && (
              <>
                <div className="doc-modal-head">
                  <div>
                    <h2 id="doc-modal-title">{t(doc.name)}</h2>
                    <p className="modal-hint">
                      {t(doc.type)} · {t(docSource(doc))}
                    </p>
                  </div>
                  <Badge status={documentStatus(doc)} />
                  <button type="button" className="button" onClick={startVersion}>
                    ＋ {t("Upload new version")}
                  </button>
                </div>
                <ViewBody
                  doc={doc}
                  v={sel.v}
                  f={sel.f}
                  onSelect={(v, f) => setSel({ v: v ?? Math.max(0, docVersions(doc).length - 1), f: f ?? 0 })}
                />
              </>
            )
          )}
        </div>
        <div className="modal-footer">
          {uploading ? (
            <>
              <button type="button" className="button" onClick={cancelUpload}>
                {t("Cancel")}
              </button>
              <button type="button" className="button primary" onClick={save}>
                {t("Save")}
              </button>
            </>
          ) : (
            <button type="button" className="button" onClick={onClose}>
              {t("Close")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
