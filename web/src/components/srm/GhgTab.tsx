"use client";

import { useState } from "react";
import { Badge } from "@/components/ui";
import { fmtDate } from "@/lib/docs";
import { usePortal } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import DemoFill from "@/components/DemoFill";
import { fillDemoGhg } from "@/lib/demo";
import { emptyCfo, emptyCfp, ghgErrors, MASTER_UNITS, SCOPE3_CATEGORIES, type CfoEntry, type CfpEntry, type GhgState } from "@/lib/srm";
import { AddButton, Footer, Input, Radios, Section, Upload } from "./fields";

export default function GhgTab() {
  const { db, mutate, toast } = usePortal();
  const { t } = useI18n();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const ghg = db.srm.ghg;

  const update = (change: (value: GhgState) => void) => {
    setErrors({});
    mutate((d) => {
      change(d.srm.ghg);
      d.srm.ghg.submittedAt = undefined;
    });
  };
  const patchCfo = (id: string, change: (entry: CfoEntry) => void) => update((draft) => { const entry = draft.cfo.find((item) => item.id === id); if (entry) change(entry); });
  const patchCfp = (id: string, change: (entry: CfpEntry) => void) => update((draft) => { const entry = draft.cfp.find((item) => item.id === id); if (entry) change(entry); });

  const submit = () => {
    const next = ghgErrors(ghg);
    setErrors(next);
    if (Object.keys(next).length) return toast("Complete the highlighted fields before submitting.");
    mutate((d) => void (d.srm.ghg.submittedAt = new Date().toISOString()));
    toast("GHG emission reduction data submitted.");
  };

  const cfo = (entry: CfoEntry, key: "certNo" | "scopeDate" | "scope1" | "scope2" | "scope3" | "production") => ({
    name: `${entry.id}-${key}`, value: entry[key], error: errors[`${entry.id}.${key}`], onChange: (value: string) => patchCfo(entry.id, (draft) => void (draft[key] = value)),
  });
  const cfp = (entry: CfpEntry, key: "certNo" | "product" | "perUnit" | "period") => ({
    name: `${entry.id}-${key}`, value: entry[key], error: errors[`${entry.id}.${key}`], onChange: (value: string) => patchCfp(entry.id, (draft) => void (draft[key] = value)),
  });
  const removeButton = (onClick: () => void) => <button className="button" onClick={onClick}>{t("Remove set")}</button>;

  return (
    <div className="reg-main">
      <DemoFill onFill={() => update(fillDemoGhg)} />
      <Section num={1} title="Carbon Footprint certification" hint="Changes are saved automatically as a draft until you submit." extra={<Badge status={ghg.submittedAt ? "Submitted" : "Draft"} />}>
        <Radios name="ghg-type" label="ประเภทของการรับรอง Carbon Footprint" required options={["CFO", "CFP"] as const} value={ghg.type} error={errors.type}
          hint="CFO = Carbon Footprint ขององค์กร · CFP = Carbon Footprint ของผลิตภัณฑ์" onChange={(value) => update((draft) => void (draft.type = value))} />
      </Section>

      {ghg.type === "CFO" && ghg.cfo.map((entry, index) => (
        <Section key={entry.id} num={index + 2} title={t("Organizational Carbon Footprint (CFO) · set {n}", { n: index + 1 })} extra={ghg.cfo.length > 1 ? removeButton(() => update((draft) => void (draft.cfo = draft.cfo.filter((item) => item.id !== entry.id)))) : undefined}>
          <Input {...cfo(entry, "certNo")} label="เลขที่ใบรับรอง (Certification Number)" required placeholder="TGO CFO FYXX-XX-XXX" hint="Max 255 characters" />
          <Radios name={`${entry.id}-standard`} label="มาตรฐานการรับรอง Carbon Footprint" span={2} required options={["อบก. (TGO)", "ISO 14064"] as const} value={entry.standard} error={errors[`${entry.id}.standard`]}
            onChange={(value) => patchCfo(entry.id, (draft) => void (draft.standard = value))} />
          <Input {...cfo(entry, "scopeDate")} label="ขอบเขตข้อมูลที่ใช้คำนวณ" type="date" span={1} required />
          <Input {...cfo(entry, "scope1")} label="Scope 1 (tCO2e)" span={1} required placeholder="0.00" />
          <Input {...cfo(entry, "scope2")} label="Scope 2 (tCO2e)" span={1} required placeholder="0.00" />
          <Input {...cfo(entry, "scope3")} label="Scope 3 (tCO2e)" span={1} required placeholder="0.00" />
          <Input name={`${entry.id}-scope3Category`} label="หมวดหมู่การปล่อยก๊าซเรือนกระจกขอบเขตที่ 3" type="select" options={SCOPE3_CATEGORIES} value={entry.scope3Category} required placeholder="Choose a category"
            error={errors[`${entry.id}.scope3Category`]} onChange={(value) => patchCfo(entry.id, (draft) => void (draft.scope3Category = value))} />
          <Input {...cfo(entry, "production")} label="ปริมาณการผลิตรวม" span={1} required placeholder="0.00" hint="Total production, not only what is delivered to CPF" />
          <Input name={`${entry.id}-unit`} label="หน่วยนับ" type="select" span={1} options={MASTER_UNITS} value={entry.unit} required placeholder="Choose" error={errors[`${entry.id}.unit`]}
            onChange={(value) => patchCfo(entry.id, (draft) => void (draft.unit = value))} />
          <Upload name={`${entry.id}-files`} label="แนบเอกสารการรับรอง" files={entry.files} max={1} required error={errors[`${entry.id}.files`]} onChange={(files) => patchCfo(entry.id, (draft) => void (draft.files = files))} />
        </Section>
      ))}
      {ghg.type === "CFO" && <AddButton onClick={() => update((draft) => void draft.cfo.push(emptyCfo()))}>{t("+ Add organizational Carbon Footprint for a previous period")}</AddButton>}

      {ghg.type === "CFP" && ghg.cfp.map((entry, index) => (
        <Section key={entry.id} num={index + 2} title={t(entry.kind === "product" ? "Product Carbon Footprint (CFP) · set {n} (additional product)" : index > 0 ? "Product Carbon Footprint (CFP) · set {n} (previous period)" : "Product Carbon Footprint (CFP) · set {n}", { n: index + 1 })}
          extra={ghg.cfp.length > 1 ? removeButton(() => update((draft) => void (draft.cfp = draft.cfp.filter((item) => item.id !== entry.id)))) : undefined}>
          <Input {...cfp(entry, "certNo")} label="เลขที่ใบรับรอง (Certification Number)" required placeholder="TGO CFP FYXX-XX-XXX" hint="Max 255 characters" />
          <Radios name={`${entry.id}-standard`} label="มาตรฐานการรับรอง Carbon Footprint" span={2} required options={["อบก. (TGO)", "ISO 14067"] as const} value={entry.standard} error={errors[`${entry.id}.standard`]}
            onChange={(value) => patchCfp(entry.id, (draft) => void (draft.standard = value))} />
          <Input {...cfp(entry, "product")} label="ผลิตภัณฑ์ที่ได้รับการรับรอง Carbon Footprint of Product" type="textarea" required hint="Max 5000 characters" />
          <Input {...cfp(entry, "perUnit")} label="ปริมาณการปล่อยก๊าซเรือนกระจกต่อหน่วยผลิตภัณฑ์ (tCO2e)" required placeholder="0.00" />
          <Radios name={`${entry.id}-scope`} label="ขอบเขตการประเมิน Carbon Footprint ของผลิตภัณฑ์" span={2} required options={["B2B", "B2C"] as const} value={entry.scope} error={errors[`${entry.id}.scope`]}
            onChange={(value) => patchCfp(entry.id, (draft) => void (draft.scope = value))} />
          <Input {...cfp(entry, "period")} label="Period ที่การรับรองมีผล" type="date" required />
          <Radios name={`${entry.id}-unit`} label="หน่วยนับของผลิตภัณฑ์ที่ได้รับการรับรอง" span={2} required options={MASTER_UNITS} value={entry.unit} error={errors[`${entry.id}.unit`]}
            onChange={(value) => patchCfp(entry.id, (draft) => void (draft.unit = value))} />
          <Upload name={`${entry.id}-files`} label="แนบเอกสารการรับรอง" files={entry.files} max={1} required error={errors[`${entry.id}.files`]} onChange={(files) => patchCfp(entry.id, (draft) => void (draft.files = files))} />
        </Section>
      ))}
      {ghg.type === "CFP" && (
        <div className="srm-actions">
          <AddButton onClick={() => update((draft) => void draft.cfp.push(emptyCfp("period")))}>{t("+ Add product Carbon Footprint for a previous period")}</AddButton>
          <AddButton onClick={() => update((draft) => void draft.cfp.push(emptyCfp("product")))}>{t("+ Add another certified product")}</AddButton>
        </div>
      )}

      <Footer note={ghg.submittedAt ? t("Submitted on {date}", { date: fmtDate(ghg.submittedAt) }) : t("Not submitted")}>
        <button className="button primary" onClick={submit}>{t("Submit")}</button>
      </Footer>
    </div>
  );
}
