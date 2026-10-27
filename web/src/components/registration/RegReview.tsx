"use client";

import { InfoItem } from "@/components/ui";
import { REG_STEP1, regCatFields, regDocFields, type RegData, type RegFieldSpec } from "@/lib/registration";
import type { Db } from "@/lib/types";

function reviewValue(f: RegFieldSpec, data: RegData): string | null {
  if ((f.show && !f.show(data)) || f.dis?.(data)) return null;
  const v = data[f.k];
  if (f.t === "file") return (v || []).map((x: { name: string }) => x.name).join(", ") || "—";
  if (f.t === "checkbox") return v ? "ยืนยันแล้ว" : "ไม่ได้เลือก";
  return v || "—";
}

function Block({ title, fields, data, step, onGo }: { title: string; fields: RegFieldSpec[]; data: RegData; step: number; onGo: (step: number) => void }) {
  return (
    <section className="card reg-section">
      <header className="reg-section-head">
        <div className="reg-section-title">
          <h2>{title}</h2>
        </div>
        <button className="button" onClick={() => onGo(step)}>
          แก้ไข
        </button>
      </header>
      <div className="info-grid">
        {fields.map((f) => {
          const v = reviewValue(f, data);
          return v === null ? null : <InfoItem key={f.k} label={f.label.replace(/ \(ไม่บังคับ\)$/, "")} value={v} />;
        })}
      </div>
    </section>
  );
}

export default function RegReview({ registration, onGo }: { registration: Db["registration"]; onGo: (step: number) => void }) {
  const d = registration.data;
  return (
    <>
      {REG_STEP1.map((s) => (
        <Block key={s.title} title={s.title} fields={s.fields} data={d} step={1} onGo={onGo} />
      ))}
      <Block title="เอกสารสำคัญ" fields={regDocFields(d)} data={d} step={2} onGo={onGo} />
      {registration.categories.map((c, i) => (
        <Block key={i} title={`กลุ่มสินค้าที่ ${i + 1}`} fields={regCatFields()} data={c} step={3} onGo={onGo} />
      ))}
    </>
  );
}
