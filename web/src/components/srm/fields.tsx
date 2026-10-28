"use client";

import type { ReactNode } from "react";
import { kb } from "@/components/sample-requests/sample-utils";
import { trackFile } from "@/lib/docs";
import { useI18n } from "@/lib/i18n";
import { usePortal } from "@/lib/store";
import type { FileMeta } from "@/lib/types";

const MAX_BYTES = 5 * 1024 * 1024;
type Span = 1 | 2 | 3 | 4;

/** Numbered form card, same structure as the registration sections. */
export function Section({ num, title, hint, extra, children }: { num?: number; title: ReactNode; hint?: ReactNode; extra?: ReactNode; children: ReactNode }) {
  const { t } = useI18n();
  return (
    <section className="card reg-section">
      <header className="reg-section-head">
        {num ? <span className="reg-sec-num">{num}</span> : null}
        <div className="reg-section-title">
          <h2>{typeof title === "string" ? t(title) : title}</h2>
          {hint ? <p>{typeof hint === "string" ? t(hint) : hint}</p> : null}
        </div>
        {extra ? <div className="srm-head-extra">{extra}</div> : null}
      </header>
      <div className="reg-grid">{children}</div>
    </section>
  );
}

function Field({ label, name, span = 2, required, error, hint, children }: { label: ReactNode; name: string; span?: Span; required?: boolean; error?: string; hint?: string; children: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className={`form-field reg-field reg-s${span} ${error ? "has-error" : ""}`} data-field={name}>
      <label htmlFor={name}>{typeof label === "string" ? t(label) : label}{required && <span className="required"> *</span>}</label>
      {children}
      {hint && <small>{t(hint)}</small>}
      <span className="form-error" role={error ? "alert" : undefined}>{error ? t(error) : error}</span>
    </div>
  );
}

interface InputProps {
  name: string;
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "date" | "month" | "textarea" | "select";
  options?: readonly string[];
  placeholder?: string;
  span?: Span;
  required?: boolean;
  error?: string;
  hint?: string;
  disabled?: boolean;
}

export function Input({ name, label, value, onChange, type = "text", options, placeholder, span, required, error, hint, disabled }: InputProps) {
  const { t } = useI18n();
  const control =
    type === "select" ? (
      <select className="field-control" id={name} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
        <option value="">{t(placeholder || "Select")}</option>
        {options?.map((option) => <option key={option} value={option}>{t(option)}</option>)}
      </select>
    ) : type === "textarea" ? (
      <textarea className="field-control" id={name} rows={3} value={value} disabled={disabled} placeholder={placeholder ? t(placeholder) : undefined} onChange={(e) => onChange(e.target.value)} />
    ) : (
      <input className="field-control" id={name} type={type} value={value} disabled={disabled} placeholder={placeholder ? t(placeholder) : undefined} autoComplete="off" onChange={(e) => onChange(e.target.value)} />
    );
  return <Field label={label} name={name} span={span ?? (type === "textarea" ? 4 : 2)} required={required} error={error} hint={hint}>{control}</Field>;
}

export function Radios<T extends string>({ name, label, options, value, onChange, span, required, error, hint, disabled, renderLabel }: {
  name: string; label: ReactNode; options: readonly T[]; value: string; onChange: (value: T) => void; span?: Span; required?: boolean; error?: string; hint?: string; disabled?: boolean;
  /** Overrides the visible text of an option; the stored value stays unchanged. */
  renderLabel?: (option: T) => string;
}) {
  const { t } = useI18n();
  return (
    <Field label={label} name={name} span={span ?? 4} required={required} error={error} hint={hint}>
      <div className="reg-radio-row" role="radiogroup" aria-label={typeof label === "string" ? t(label) : name}>
        {options.map((option) => (
          <label className="reg-radio" key={option}>
            <input type="radio" name={name} checked={value === option} disabled={disabled} onChange={() => onChange(option)} />
            <span>{renderLabel ? renderLabel(option) : t(option)}</span>
          </label>
        ))}
      </div>
    </Field>
  );
}

/** PDF-only upload card: up to `max` files, 5 MB each. */
export function Upload({ name, label, files, max, onChange, span = 4, required, error, hint }: {
  name: string; label: string; files: FileMeta[]; max: number; onChange: (files: FileMeta[]) => void; span?: Span; required?: boolean; error?: string; hint?: string;
}) {
  const { toast } = usePortal();
  const { t } = useI18n();
  const full = files.length >= max;
  const add = (list: FileList | null) => {
    if (!list?.length) return;
    if (files.length + list.length > max) return toast(t(max > 1 ? "Upload up to {max} PDF files." : "Upload up to 1 PDF file.", { max }));
    const picked: FileMeta[] = [];
    for (const file of Array.from(list)) {
      if (!/\.pdf$/i.test(file.name) || (file.type && file.type !== "application/pdf")) return toast(`${file.name}: ${t("only PDF files are accepted.")}`);
      if (file.size > MAX_BYTES) return toast(`${file.name}: ${t("each file must be 5 MB or smaller.")}`);
      picked.push(trackFile(file, "application/pdf"));
    }
    onChange([...files, ...picked]);
  };
  return (
    <div className={`form-field reg-field reg-s${span} ${error ? "has-error" : ""}`} data-field={name}>
      <div className={`doc-card ${files.length ? "done" : ""}`}>
        <div className="doc-card-head">
          <span className="doc-icon">▤</span>
          <div>
            <strong>{t(label)}{required && <span className="required"> *</span>}</strong>
            <small>{hint ? t(hint) : max === 1 ? t("PDF · 1 file · max 5 MB") : t("PDF · up to {max} files · max 5 MB per file", { max })}</small>
          </div>
          <span className="doc-state">{files.length ? t("✓ Uploaded {n}/{max}", { n: files.length, max }) : required ? t("Not uploaded") : t("Optional")}</span>
        </div>
        <label className={`doc-drop ${full ? "full" : ""}`}>
          <input type="file" accept=".pdf,application/pdf" multiple={max > 1} disabled={full} aria-label={t(label)} onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
          <span className="doc-drop-icon">↑</span>
          <span><b>{full ? t("Maximum {max} files uploaded", { max }) : <>{t("Drag a file here or")} <u>{t("choose a file")}</u></>}</b></span>
        </label>
        {files.length > 0 && (
          <div className="file-list">
            {files.map((file, index) => (
              <div className="file-row" key={file.uid || `${file.name}-${index}`}>
                <span className="file-ico">PDF</span>
                <span className="file-name">{file.name}<small>{kb(file.size)} KB</small></span>
                <button type="button" aria-label={`${t("Remove")} ${file.name}`} onClick={() => onChange(files.filter((_, position) => position !== index))}>{t("Remove")}</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <span className="form-error" role={error ? "alert" : undefined}>{error ? t(error) : error}</span>
    </div>
  );
}

/** Dashed full-width add action used between repeatable sets. */
export function AddButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button type="button" className="srm-add" onClick={onClick}>{children}</button>;
}

/** Sticky-free footer card with a status note and the main actions. */
export function Footer({ note, children }: { note?: ReactNode; children: ReactNode }) {
  return (
    <div className="card srm-footer">
      <span className="reg-footer-note">{note}</span>
      <div className="srm-footer-actions">{children}</div>
    </div>
  );
}
