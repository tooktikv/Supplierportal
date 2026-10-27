"use client";

import { useState } from "react";
import { COMPANY } from "@/lib/data";
import { usePortal } from "@/lib/store";

export default function CocScreen() {
  const { mutate, toast } = usePortal();
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
            <h2>ข้อกำหนดและเงื่อนไข (CoC / T&amp;D)</h2>
            <p>อ่านและยอมรับก่อนเริ่มลงทะเบียนข้อมูลผู้ขาย</p>
          </div>
        </header>
        <div className="notice">เข้าสู่ระบบด้วย {COMPANY.email} · ผู้ขายใหม่ต้องยอมรับ CoC และ T&amp;D ก่อนลงทะเบียนข้อมูลผู้ขาย</div>
        <div className="policy-document policy-preview" role="region" aria-label="CoC and T&amp;D">
          <h4>จรรยาบรรณคู่ค้าธุรกิจ (Code of Conduct)</h4>
          <ul className="lesson-points">
            <li>ดำเนินธุรกิจอย่างซื่อสัตย์ โปร่งใส และไม่เสนอหรือรับผลประโยชน์ที่ไม่เหมาะสม</li>
            <li>เคารพสิทธิมนุษยชนและปฏิบัติต่อแรงงานอย่างเป็นธรรม</li>
            <li>ดูแลความปลอดภัยและสิ่งแวดล้อมในการดำเนินงาน</li>
          </ul>
          <h4>ข้อกำหนดและเงื่อนไขการใช้งาน (Terms &amp; Conditions)</h4>
          <ul className="lesson-points">
            <li>ข้อมูลที่ลงทะเบียนต้องถูกต้อง เป็นปัจจุบัน และสามารถตรวจสอบได้</li>
            <li>บริษัทสามารถขอเอกสารเพิ่มเติมและตรวจสอบข้อมูลของผู้ขายได้</li>
            <li>ผู้ขายรับผิดชอบการรักษาความลับของบัญชีผู้ใช้งาน</li>
          </ul>
          <p className="mock-note">เนื้อหาตัวอย่างสำหรับต้นแบบ ไม่ใช่ข้อกำหนดทางกฎหมายจริง</p>
        </div>
        <label className="commitment-row">
          <input id="reg-coc" type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
          <span>
            Accept CoC and T&amp;D <span className="required">*</span>
          </span>
        </label>
        <div className="reg-actions">
          <button className="button primary" id="reg-coc-start" disabled={!accepted} onClick={start}>
            ยอมรับและเริ่มลงทะเบียน
          </button>
        </div>
      </section>
    </div>
  );
}
