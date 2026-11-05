"use client";

import { useState } from "react";
import { COMPANY } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { usePortal } from "@/lib/store";

export default function CocScreen() {
  const { mutate, toast } = usePortal();
  const { t } = useI18n();
  const [accepted, setAccepted] = useState(false);

  const start = () => {
    if (!accepted) return toast("กรุณายอมรับ CoC และ T&D");
    mutate((d) => {
      d.registration.cocAccepted = true;
      d.registration.cocAt = new Date().toISOString();
    });
  };

  return (
    <div className="reg-coc-wrap">
      <section className="card reg-section">
        <header className="reg-section-head">
          <span className="reg-sec-num">§</span>
          <div className="reg-section-title">
            <h2>{t("ข้อกำหนดและเงื่อนไข (CoC / T&D)")}</h2>
            <p>{t("อ่านและยอมรับก่อนเริ่มลงทะเบียนข้อมูลผู้ขาย")}</p>
          </div>
        </header>
        <div className="notice">{t("เข้าสู่ระบบด้วย {email} · ผู้ขายใหม่ต้องยอมรับ CoC และ T&D ก่อนลงทะเบียนข้อมูลผู้ขาย", { email: COMPANY.email })}</div>
        <div className="policy-document policy-preview" role="region" aria-label="CoC and T&amp;D">
          <h4>{t("จรรยาบรรณคู่ค้าธุรกิจ (Code of Conduct)")}</h4>
          <ul className="lesson-points">
            <li>{t("ดำเนินธุรกิจอย่างซื่อสัตย์ โปร่งใส และไม่เสนอหรือรับผลประโยชน์ที่ไม่เหมาะสม")}</li>
            <li>{t("เคารพสิทธิมนุษยชนและปฏิบัติต่อแรงงานอย่างเป็นธรรม")}</li>
            <li>{t("ดูแลความปลอดภัยและสิ่งแวดล้อมในการดำเนินงาน")}</li>
          </ul>
          <h4>{t("ข้อกำหนดและเงื่อนไขการใช้งาน (Terms & Conditions)")}</h4>
          <ul className="lesson-points">
            <li>{t("ข้อมูลที่ลงทะเบียนต้องถูกต้อง เป็นปัจจุบัน และสามารถตรวจสอบได้")}</li>
            <li>{t("บริษัทสามารถขอเอกสารเพิ่มเติมและตรวจสอบข้อมูลของผู้ขายได้")}</li>
            <li>{t("ผู้ขายรับผิดชอบการรักษาความลับของบัญชีผู้ใช้งาน")}</li>
          </ul>
          <p className="mock-note">{t("เนื้อหาตัวอย่างสำหรับต้นแบบ ไม่ใช่ข้อกำหนดทางกฎหมายจริง")}</p>
        </div>
        <label className="commitment-row">
          <input id="reg-coc" type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
          <span>
            {t("Accept CoC and T&D")} <span className="required">*</span>
          </span>
        </label>
        <div className="reg-actions">
          <button className="button primary" id="reg-coc-start" disabled={!accepted} onClick={start}>
            {t("ยอมรับและเริ่มลงทะเบียน")}
          </button>
        </div>
      </section>
    </div>
  );
}
