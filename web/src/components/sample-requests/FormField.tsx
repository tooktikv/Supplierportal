"use client";

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
  const current = value || "";
  let control;
  if (select) {
    control = (
      <select className="field-control" id={name} value={current} onChange={(e) => onChange(e.target.value)}>
        <option value="">{placeholder || "Choose a category"}</option>
        {select.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>
    );
  } else if (textarea) {
    control = <textarea className="field-control" id={name} placeholder={placeholder} value={current} onChange={(e) => onChange(e.target.value)} />;
  } else {
    control = (
      <input className="field-control" id={name} type={type} value={current} readOnly={readOnly} placeholder={placeholder} min={min} onChange={(e) => onChange(e.target.value)} />
    );
  }
  return (
    <div className={`form-field ${full ? "full" : ""} ${hasError ? "has-error" : ""}`} data-field={name}>
      <label htmlFor={name}>
        {label}
        {required ? <span className="required"> *</span> : null}
      </label>
      {control}
      {hint ? <small>{hint}</small> : null}
      <span className="form-error">{error}</span>
    </div>
  );
}
