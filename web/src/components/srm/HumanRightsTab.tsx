"use client";

import { useState } from "react";
import { Badge } from "@/components/ui";
import { useConfirm } from "@/components/ConfirmDialog";
import { fmtDate, todayIso } from "@/lib/docs";
import { usePortal } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import DemoFill from "@/components/DemoFill";
import { fillDemoHumanRights } from "@/lib/demo";
import { dmy, emptyHr, HR_STANDARDS, hrAllErrors, type HrRecord } from "@/lib/srm";
import { Footer, Input, Radios, Section, Upload } from "./fields";
import RecordList from "./RecordList";

export default function HumanRightsTab() {
  const { db, mutate, toast } = usePortal();
  const { t } = useI18n();
  const confirm = useConfirm();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const records = db.srm.humanRights;
  const entry = records.find((item) => item.id === editingId);

  const update = (change: (value: HrRecord) => void) => {
    setErrors({});
    mutate((d) => {
      const current = d.srm.humanRights.find((item) => item.id === editingId);
      if (!current) return;
      change(current);
      current.status = "Draft";
      current.updated = todayIso();
    });
  };
  const add = () => {
    const created = emptyHr();
    mutate((d) => void d.srm.humanRights.unshift(created));
    setErrors({});
    setEditingId(created.id);
  };
  const remove = async (id: string) => {
    if (!(await confirm({ title: "Delete record", message: "Delete this human rights certification record?", confirmLabel: "Delete", tone: "danger" }))) return;
    mutate((d) => void (d.srm.humanRights = d.srm.humanRights.filter((item) => item.id !== id)));
    toast("Record deleted.");
  };

  const submit = async () => {
    if (!entry) return;
    const next = hrAllErrors(entry);
    setErrors(next);
    if (Object.keys(next).length) return toast("Complete the highlighted fields before submitting.");
    if (!(await confirm({ message: "Submit your human rights certification?", confirmLabel: "Submit" }))) return;
    mutate((d) => {
      const current = d.srm.humanRights.find((item) => item.id === entry.id);
      if (current) Object.assign(current, { status: "Submitted", updated: todayIso() });
    });
    toast("Human rights certification submitted.");
    setEditingId(null);
  };

  if (!entry) {
    const rows = records.map((item) => ({
      id: item.id, updated: item.updated, status: item.status,
      cells: [
        <strong key="std">{item.standard === "อื่น ๆ" ? item.other || item.standard : item.standard || t("Not selected")}</strong>,
        dmy(item.expiry),
        item.files[0]?.name || "—",
      ],
    }));
    return (
      <RecordList title="Human rights certifications" description="Human rights certifications you have reported. Create a record for each certification." addLabel="+ Create certification"
        headings={["Certification standard", "Expiry date", "Document"]} rows={rows}
        emptyTitle="No certifications yet" emptyText="Create a record to report a human rights certification."
        onAdd={add} onEdit={(id) => { setErrors({}); setEditingId(id); }} onDelete={remove} />
    );
  }

  const patch = (_id: string, change: (value: HrRecord) => void) => update(change);

  return (
    <div className="reg-main">
      <DemoFill onFill={() => update(fillDemoHumanRights)} />
      <Section num={1} title="Human rights certification" hint="Changes are saved automatically as a draft until you submit." extra={<Badge status={entry.status} />}>
        <Radios name={`${entry.id}-standard`} label="มาตรฐานการรับรองด้านสิทธิมนุษยชนที่บริษัทของท่านได้รับ" required options={HR_STANDARDS} value={entry.standard} error={errors[`${entry.id}.standard`]}
          onChange={(value) => patch(entry.id, (draft) => { draft.standard = value; if (value !== "อื่น ๆ") draft.other = ""; })} />
        {entry.standard === "อื่น ๆ" && <Input name={`${entry.id}-other`} label="ระบุมาตรฐานอื่น ๆ" value={entry.other} required error={errors[`${entry.id}.other`]} onChange={(value) => patch(entry.id, (draft) => void (draft.other = value))} />}
        <Input name={`${entry.id}-expiry`} label="วันที่การรับรองหมดอายุ" type="date" value={entry.expiry} required error={errors[`${entry.id}.expiry`]} onChange={(value) => patch(entry.id, (draft) => void (draft.expiry = value))} />
        <Upload name={`${entry.id}-files`} label="แนบเอกสารการรับรอง" files={entry.files} max={1} required error={errors[`${entry.id}.files`]} onChange={(files) => patch(entry.id, (draft) => void (draft.files = files))} />
      </Section>
      <Footer note={entry.status === "Submitted" ? t("Submitted on {date}", { date: fmtDate(entry.updated) }) : t("Not submitted")}>
        <button className="button" onClick={() => setEditingId(null)}>{t("Back to list")}</button>
        <button className="button primary" onClick={submit}>{t("Submit")}</button>
      </Footer>
    </div>
  );
}
