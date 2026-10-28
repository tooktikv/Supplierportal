"use client";

import { useState } from "react";
import { Badge } from "@/components/ui";
import { useConfirm } from "@/components/ConfirmDialog";
import { fmtDate, todayIso } from "@/lib/docs";
import { usePortal } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import DemoFill from "@/components/DemoFill";
import { fillDemoGovernance } from "@/lib/demo";
import { dmy, emptyGov, govErrors, type GovRecord } from "@/lib/srm";
import { Footer, Input, Radios, Section, Upload } from "./fields";
import RecordList from "./RecordList";

export default function GovernanceTab() {
  const { db, mutate, toast } = usePortal();
  const { t } = useI18n();
  const confirm = useConfirm();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const records = db.srm.governance;
  const gov = records.find((item) => item.id === editingId);

  const update = (change: (value: GovRecord) => void) => {
    setErrors({});
    mutate((d) => {
      const current = d.srm.governance.find((item) => item.id === editingId);
      if (!current) return;
      change(current);
      current.status = "Draft";
      current.updated = todayIso();
    });
  };
  const add = () => {
    const created = emptyGov();
    mutate((d) => void d.srm.governance.unshift(created));
    setErrors({});
    setEditingId(created.id);
  };
  const remove = async (id: string) => {
    if (!(await confirm({ title: "Delete record", message: "Delete this governance record?", confirmLabel: "Delete", tone: "danger" }))) return;
    mutate((d) => void (d.srm.governance = d.srm.governance.filter((item) => item.id !== id)));
    toast("Record deleted.");
  };

  const submit = async () => {
    if (!gov) return;
    const next = govErrors(gov);
    setErrors(next);
    if (Object.keys(next).length) return toast("Complete the highlighted fields before submitting.");
    if (!(await confirm({ message: "Submit your governance information?", confirmLabel: "Submit" }))) return;
    mutate((d) => {
      const current = d.srm.governance.find((item) => item.id === gov.id);
      if (current) Object.assign(current, { status: "Submitted", updated: todayIso() });
    });
    toast("Governance information submitted.");
    setEditingId(null);
  };

  if (!gov) {
    const rows = records.map((item) => ({
      id: item.id, updated: item.updated, status: item.status,
      cells: [
        item.cac ? t(item.cac) : t("Not answered"),
        item.cac === "Yes" ? dmy(item.cacExpiry) : "—",
        item.coc ? t(item.coc) : t("Not answered"),
      ],
    }));
    return (
      <RecordList title="Governance records" description="Anti-corruption (CAC) membership and Code of Conduct declarations you have reported." addLabel="+ Create governance record"
        headings={["แนวร่วมต่อต้านคอร์รัปชั่น (CAC)", "วันหมดอายุ CAC", "จรรยาบรรณทางธุรกิจ (Code of Conduct)"]} rows={rows}
        emptyTitle="No governance records yet" emptyText="Create a record to report your CAC membership and Code of Conduct."
        onAdd={add} onEdit={(id) => { setErrors({}); setEditingId(id); }} onDelete={remove} />
    );
  }

  return (
    <div className="reg-main">
      <DemoFill onFill={() => update(fillDemoGovernance)} />
      <Section num={1} title="แนวร่วมต่อต้านคอร์รัปชั่น (CAC)" hint="Changes are saved automatically as a draft until you submit." extra={<Badge status={gov.status} />}>
        <Radios name="gov-cac" label="บริษัทของท่านได้ประกาศเจตนารมณ์เข้าร่วมเป็นสมาชิกแนวร่วมต่อต้านคอร์รัปชั่น (CAC) หรือไม่" required options={["Yes", "No"] as const} value={gov.cac} error={errors.cac}
          onChange={(value) => update((draft) => { draft.cac = value; if (value === "No") { draft.cacExpiry = ""; draft.cacFiles = []; } })} />
        {gov.cac === "Yes" && (
          <>
            <Input name="gov-cacExpiry" label="วันที่หมดอายุการเป็นสมาชิก" type="date" value={gov.cacExpiry} required error={errors.cacExpiry} onChange={(value) => update((draft) => void (draft.cacExpiry = value))} />
            <Upload name="cacFiles" label="แนบเอกสารการรับรอง" files={gov.cacFiles} max={1} required error={errors.cacFiles} onChange={(files) => update((draft) => void (draft.cacFiles = files))} />
          </>
        )}
      </Section>
      <Section num={2} title="จรรยาบรรณทางธุรกิจ (Code of Conduct)">
        <Radios name="gov-coc" label="บริษัทของท่านมีการประกาศจรรยาบรรณทางธุรกิจ (Code of Conduct) ที่เกี่ยวข้องกับประเด็นด้านธรรมาภิบาลใช้ภายในองค์กรหรือไม่" required options={["Yes", "No"] as const} value={gov.coc} error={errors.coc}
          onChange={(value) => update((draft) => { draft.coc = value; if (value === "No") draft.cocFiles = []; })} />
        {gov.coc === "Yes" && <Upload name="cocFiles" label="แนบเอกสารจรรยาบรรณทางธุรกิจ (Code of Conduct)" files={gov.cocFiles} max={1} required error={errors.cocFiles} onChange={(files) => update((draft) => void (draft.cocFiles = files))} />}
      </Section>
      <Footer note={gov.status === "Submitted" ? t("Submitted on {date}", { date: fmtDate(gov.updated) }) : t("Not submitted")}>
        <button className="button" onClick={() => setEditingId(null)}>{t("Back to list")}</button>
        <button className="button primary" onClick={submit}>{t("Submit")}</button>
      </Footer>
    </div>
  );
}
