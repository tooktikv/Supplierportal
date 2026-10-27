"use client";

import type { FormEvent } from "react";

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
}

export default function ProfileEntryForm({ fields, submitLabel, onSubmit, onCancel }: Props) {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const values: Record<string, string> = {};
    new FormData(e.currentTarget).forEach((value, key) => {
      values[key] = String(value);
    });
    onSubmit(values);
  };

  return (
    <form className="form-grid" onSubmit={submit}>
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
      <div className="wizard-footer" style={{ gridColumn: "1/-1" }}>
        <button type="button" className="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="button primary" type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
