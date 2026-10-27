"use client";

import { useState } from "react";
import { Badge } from "@/components/ui";
import { fmtDate } from "@/lib/docs";
import { usePortal } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import DemoFill from "@/components/DemoFill";
import { fillDemoGovernance } from "@/lib/demo";
import { govErrors, type GovState } from "@/lib/srm";
import { Footer, Input, Radios, Section, Upload } from "./fields";

export default function GovernanceTab() {
  const { db, mutate, toast } = usePortal();
  const { t } = useI18n();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const gov = db.srm.governance;

  const update = (change: (value: GovState) => void) => {
    setErrors({});
    mutate((d) => {
      change(d.srm.governance);
      d.srm.governance.submittedAt = undefined;
    });
  };

  const submit = () => {
    const next = govErrors(gov);
    setErrors(next);
    if (Object.keys(next).length) return toast("Complete the highlighted fields before submitting.");
    mutate((d) => void (d.srm.governance.submittedAt = new Date().toISOString()));
    toast("Governance information submitted.");
  };

  return (
    <div className="reg-main">
      <DemoFill onFill={() => update(fillDemoGovernance)} />
      <Section num={1} title="แนวร่วมต่อต้านคอร์รัปชั่น (CAC)" hint="Changes are saved automatically as a draft until you submit." extra={<Badge status={gov.submittedAt ? "Submitted" : "Draft"} />}>
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
      <Footer note={gov.submittedAt ? t("Submitted on {date}", { date: fmtDate(gov.submittedAt) }) : t("Not submitted")}>
        <button className="button primary" onClick={submit}>{t("Submit")}</button>
      </Footer>
    </div>
  );
}
