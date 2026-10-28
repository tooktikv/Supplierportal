"use client";

import { useState } from "react";
import { Badge } from "@/components/ui";
import { useConfirm } from "@/components/ConfirmDialog";
import { fmtDate, todayIso } from "@/lib/docs";
import { usePortal } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import DemoFill from "@/components/DemoFill";
import { fillDemoGhg } from "@/lib/demo";
import { emptyCfo, emptyCfp, emptyGhg, ghgErrors, MASTER_UNITS, SCOPE3_CATEGORIES, type CfoEntry, type CfpEntry, type GhgRecord } from "@/lib/srm";
import { AddButton, Footer, Input, Radios, Section, Upload } from "./fields";
import RecordList from "./RecordList";

const num = (value: string) => Number(value) || 0;
const fmtTotal = (value: number) => value.toLocaleString("en-US", { maximumFractionDigits: 2 });

export default function GhgTab() {
  const { db, mutate, toast } = usePortal();
  const { t } = useI18n();
  const confirm = useConfirm();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const records = db.srm.ghg;
  const ghg = records.find((item) => item.id === editingId);

  const update = (change: (value: GhgRecord) => void) => {
    setErrors({});
    mutate((d) => {
      const current = d.srm.ghg.find((item) => item.id === editingId);
      if (!current) return;
      change(current);
      current.status = "Draft";
      current.updated = todayIso();
    });
  };
  const add = () => {
    const created = emptyGhg();
    mutate((d) => void d.srm.ghg.unshift(created));
    setErrors({});
    setEditingId(created.id);
  };
  const remove = async (id: string) => {
    if (!(await confirm({ title: "Delete record", message: "Delete this GHG certification record?", confirmLabel: "Delete", tone: "danger" }))) return;
    mutate((d) => void (d.srm.ghg = d.srm.ghg.filter((entry) => entry.id !== id)));
    toast("Record deleted.");
  };
  const patchCfo = (id: string, change: (entry: CfoEntry) => void) => update((draft) => { const entry = draft.cfo.find((item) => item.id === id); if (entry) change(entry); });
  const patchCfp = (id: string, change: (entry: CfpEntry) => void) => update((draft) => { const entry = draft.cfp.find((item) => item.id === id); if (entry) change(entry); });

  const submit = async () => {
    if (!ghg) return;
    const next = ghgErrors(ghg);
    setErrors(next);
    if (Object.keys(next).length) return toast("Complete the highlighted fields before submitting.");
    if (!(await confirm({ message: "Submit your GHG emission reduction data?", confirmLabel: "Submit" }))) return;
    mutate((d) => {
      const current = d.srm.ghg.find((item) => item.id === ghg.id);
      if (current) Object.assign(current, { status: "Submitted", updated: todayIso() });
    });
    toast("GHG emission reduction data submitted.");
    setEditingId(null);
  };

  const cfo = (entry: CfoEntry, key: "certNo" | "scopeDate" | "scope1" | "scope2" | "scope3" | "production") => ({
    name: `${entry.id}-${key}`, value: entry[key], error: errors[`${entry.id}.${key}`], onChange: (value: string) => patchCfo(entry.id, (draft) => void (draft[key] = value)),
  });
  const cfp = (entry: CfpEntry, key: "certNo" | "product" | "perUnit" | "period") => ({
    name: `${entry.id}-${key}`, value: entry[key], error: errors[`${entry.id}.${key}`], onChange: (value: string) => patchCfp(entry.id, (draft) => void (draft[key] = value)),
  });
  const removeButton = (onClick: () => void) => <button className="button" onClick={onClick}>{t("Remove set")}</button>;

  if (!ghg) {
    const rows = records.map((item) => {
      const sets = item.type === "CFO" ? item.cfo : item.type === "CFP" ? item.cfp : [];
      const first = sets[0];
      const detail = item.type === "CFO"
        ? `${fmtTotal(item.cfo.reduce((sum, entry) => sum + num(entry.scope1) + num(entry.scope2) + num(entry.scope3), 0))} tCO2e`
        : item.type === "CFP" ? item.cfp.map((entry) => entry.product).filter(Boolean).join(", ") || "—" : "—";
      return {
        id: item.id, updated: item.updated, status: item.status,
        cells: [
          <strong key="type">{item.type === "CFO" ? t("Organizational (CFO)") : item.type === "CFP" ? t("Product (CFP)") : t("Not selected")}</strong>,
          <span key="cert">{first?.certNo || "—"}{sets.length > 1 && <small>{t("{n} certification sets", { n: sets.length })}</small>}</span>,
          first?.standard || "—",
          detail,
        ],
      };
    });
    return (
      <RecordList title="GHG emission reduction" description="Carbon Footprint certifications (CFO / CFP) you have reported. Create a record to add or update one." addLabel="+ Create GHG record"
        headings={["Certification type", "Certificate no.", "Standard", "Emissions / product"]} rows={rows}
        emptyTitle="No GHG records yet" emptyText="Create a record to report your Carbon Footprint certification."
        onAdd={add} onEdit={(id) => { setErrors({}); setEditingId(id); }} onDelete={remove} />
    );
  }

  return (
    <div className="reg-main">
      <DemoFill onFill={() => update(fillDemoGhg)} />
      <Section num={1} title="Carbon Footprint certification" hint="Changes are saved automatically as a draft until you submit." extra={<Badge status={ghg.status} />}>
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

      <Footer note={ghg.status === "Submitted" ? t("Submitted on {date}", { date: fmtDate(ghg.updated) }) : t("Not submitted")}>
        <button className="button" onClick={() => setEditingId(null)}>{t("Back to list")}</button>
        <button className="button primary" onClick={submit}>{t("Submit")}</button>
      </Footer>
    </div>
  );
}
