"use client";

import { useI18n } from "@/lib/i18n";

interface FormFieldProps {
  label: string;
  name: string;
  value: string | undefined;
  onChange: (value: string) => void;
  required?: boolean;
  hint?: string;
  error?: string;
  hasError?: boolean;
  full?: boolean;
  select?: string[];
  textarea?: boolean;
  type?: string;
  readOnly?: boolean;
  placeholder?: string;
  min?: string;
}

export default function FormField({
  label,
  name,
  value,
  onChange,
  required,
  hint,
  error = "Please complete this field.",
  hasError,
  full,
  select,
  textarea,
  type = "text",
  readOnly,
  placeholder,
  min,
}: FormFieldProps) {
  const { t } = useI18n();
  const current = value || "";
  let control;
  if (select) {
    control = (
      <select className="field-control" id={name} value={current} onChange={(e) => onChange(e.target.value)}>
        <option value="">{t(placeholder || "Choose a category")}</option>
        {select.map((c) => (
          <option key={c} value={c}>{t(c)}</option>
        ))}
      </select>
    );
  } else if (textarea) {
    control = <textarea className="field-control" id={name} placeholder={placeholder && t(placeholder)} value={current} onChange={(e) => onChange(e.target.value)} />;
  } else {
    control = (
      <input className="field-control" id={name} type={type} value={current} readOnly={readOnly} placeholder={placeholder && t(placeholder)} min={min} onChange={(e) => onChange(e.target.value)} />
    );
  }
  return (
    <div className={`form-field ${full ? "full" : ""} ${hasError ? "has-error" : ""}`} data-field={name}>
      <label htmlFor={name}>
        {t(label)}
        {required ? <span className="required"> *</span> : null}
      </label>
      {control}
      {hint ? <small>{t(hint)}</small> : null}
      <span className="form-error">{t(error)}</span>
    </div>
  );
}
