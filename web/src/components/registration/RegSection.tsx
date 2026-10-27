"use client";

import type { ReactNode } from "react";
import type { RegData, RegFieldSpec } from "@/lib/registration";
import RegField, { type RegFormApi } from "./RegField";

interface RegSectionProps {
  title: string;
  fields: RegFieldSpec[];
  form: RegFormApi;
  num?: number;
  id?: string;
  hint?: string;
  extra?: ReactNode;
  after?: ReactNode;
}

export default function RegSection({ title, fields, form, num, id, hint, extra, after }: RegSectionProps) {
  const d: RegData = form.data;
  return (
    <section className="card reg-section" id={id}>
      <header className="reg-section-head">
        {num ? <span className="reg-sec-num">{num}</span> : null}
        <div className="reg-section-title">
          <h2>{title}</h2>
          {hint ? <p>{hint}</p> : null}
        </div>
        {extra}
      </header>
      <div className="reg-grid">
        {fields
          .filter((f) => !f.show || f.show(d))
          .map((f) => (
            <RegField key={f.k} field={f} form={form} />
          ))}
      </div>
      {after}
    </section>
  );
}
