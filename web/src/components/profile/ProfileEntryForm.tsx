"use client";

import type { FormEvent } from "react";
import { useEffect, useRef } from "react";
import DemoFill from "@/components/DemoFill";

export interface EntryField {
  name: string;
  label: string;
  value?: string;
  /** Input type, or the list of options for a select. */
  type?: string | string[];
}

interface Props {
  fields: EntryField[];
  submitLabel: string;
  onSubmit: (values: Record<string, string>) => void;
  onCancel: () => void;
  /** When set, the form is shown in a modal dialog with this title. */
  title?: string;
}

export default function ProfileEntryForm({ fields, submitLabel, onSubmit, onCancel, title }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const formId = `profile-form-${fields[0]?.name ?? "entry"}`;

  const cancelRef = useRef(onCancel);
  useEffect(() => {
    cancelRef.current = onCancel;
  });

  useEffect(() => {
    if (!title) return;
    formRef.current?.querySelector<HTMLElement>("input,select")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && cancelRef.current();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [title]);
  // The inputs are uncontrolled, so the demo values are written straight to the DOM.
  const fillDemo = () => {
    for (const { name, label, type = "text" } of fields) {
      const el = formRef.current?.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
      if (!el) continue;
      el.value = Array.isArray(type) ? type[0] : type === "email" ? "demo@asteron.example" : type === "tel" ? "0812345678" : type === "date" ? "2026-12-31" : type === "number" ? "1" : `Demo ${label}`;
    }
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const values: Record<string, string> = {};
    new FormData(e.currentTarget).forEach((value, key) => {
      values[key] = String(value);
    });
    onSubmit(values);
  };

  const form = (
    <form id={formId} className="form-grid" onSubmit={submit} ref={formRef}>
      <div style={{ gridColumn: "1/-1" }}><DemoFill onFill={fillDemo} /></div>
      {fields.map(({ name, label, value = "", type = "text" }) => (
        <div className="form-field" key={name}>
          <label htmlFor={`profile-${name}`}>{label}</label>
          {Array.isArray(type) ? (
            <select className="field-control" id={`profile-${name}`} name={name} defaultValue={value} required>
              {type.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input className="field-control" id={`profile-${name}`} name={name} type={type} defaultValue={value} required />
          )}
        </div>
      ))}
      {!title && (
        <div className="wizard-footer" style={{ gridColumn: "1/-1" }}>
          <button type="button" className="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="button primary" type="submit">
            {submitLabel}
          </button>
        </div>
      )}
    </form>
  );

  if (!title) return form;

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal-dialog entry-dialog" role="dialog" aria-modal="true" aria-labelledby={`${formId}-title`}>
        <button type="button" className="modal-close" aria-label="Close" onClick={onCancel}>
          ×
        </button>
        <div className="modal-body">
          <h2 id={`${formId}-title`}>{title}</h2>
          {form}
        </div>
        <div className="modal-footer">
          <button type="button" className="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="button primary" type="submit" form={formId}>
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
