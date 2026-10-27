"use client";

import { useState } from "react";
import { Badge } from "@/components/ui";
import { fmtDate } from "@/lib/docs";
import { usePortal } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import DemoFill from "@/components/DemoFill";
import { fillDemoHumanRights } from "@/lib/demo";
import { emptyHr, HR_STANDARDS, hrAllErrors, type HrEntry, type HrState } from "@/lib/srm";
import { AddButton, Footer, Input, Radios, Section, Upload } from "./fields";

export default function HumanRightsTab() {
  const { db, mutate, toast } = usePortal();
  const { t } = useI18n();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const state = db.srm.humanRights;

  const update = (change: (value: HrState) => void) => {
    setErrors({});
    mutate((d) => {
      change(d.srm.humanRights);
      d.srm.humanRights.submittedAt = undefined;
    });
  };
  const patch = (id: string, change: (entry: HrEntry) => void) => update((draft) => { const entry = draft.entries.find((item) => item.id === id); if (entry) change(entry); });

  const submit = () => {
    const next = hrAllErrors(state);
    setErrors(next);
    if (Object.keys(next).length) return toast("Complete the highlighted fields before submitting.");
    mutate((d) => void (d.srm.humanRights.submittedAt = new Date().toISOString()));
    toast("Human rights certification submitted.");
  };

  return (
    <div className="reg-main">
      <DemoFill onFill={() => update(fillDemoHumanRights)} />
      {state.entries.map((entry, index) => (
        <Section key={entry.id} num={index + 1} title={t("Human rights certification {n}", { n: index + 1 })} hint={index === 0 ? "Changes are saved automatically as a draft until you submit." : undefined}
          extra={<>
            {index === 0 && <Badge status={state.submittedAt ? "Submitted" : "Draft"} />}
            {state.entries.length > 1 && <button className="button" onClick={() => update((draft) => void (draft.entries = draft.entries.filter((item) => item.id !== entry.id)))}>{t("Remove")}</button>}
          </>}>
          <Radios name={`${entry.id}-standard`} label="มาตรฐานการรับรองด้านสิทธิมนุษยชนที่บริษัทของท่านได้รับ" required options={HR_STANDARDS} value={entry.standard} error={errors[`${entry.id}.standard`]}
            onChange={(value) => patch(entry.id, (draft) => { draft.standard = value; if (value !== "อื่น ๆ") draft.other = ""; })} />
          {entry.standard === "อื่น ๆ" && <Input name={`${entry.id}-other`} label="ระบุมาตรฐานอื่น ๆ" value={entry.other} required error={errors[`${entry.id}.other`]} onChange={(value) => patch(entry.id, (draft) => void (draft.other = value))} />}
          <Input name={`${entry.id}-expiry`} label="วันที่การรับรองหมดอายุ" type="date" value={entry.expiry} required error={errors[`${entry.id}.expiry`]} onChange={(value) => patch(entry.id, (draft) => void (draft.expiry = value))} />
          <Upload name={`${entry.id}-files`} label="แนบเอกสารการรับรอง" files={entry.files} max={1} required error={errors[`${entry.id}.files`]} onChange={(files) => patch(entry.id, (draft) => void (draft.files = files))} />
        </Section>
      ))}
      <AddButton onClick={() => update((draft) => void draft.entries.push(emptyHr()))}>{t("+ Add another certification")}</AddButton>
      <Footer note={state.submittedAt ? t("Submitted on {date}", { date: fmtDate(state.submittedAt) }) : t("Not submitted")}>
        <button className="button primary" onClick={submit}>{t("Submit")}</button>
      </Footer>
    </div>
  );
}
