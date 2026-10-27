"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { todayIso } from "@/lib/docs";
import {
  REG_STEP1,
  applyRegistration,
  isoToRegDate,
  regAddFiles,
  regCatFields,
  regCheckValue,
  regDocFields,
  regFieldsFor,
  regScopeData,
  regSetValue,
  regStepErrors,
  type RegData,
} from "@/lib/registration";
import { routes } from "@/lib/routes";
import { usePortal } from "@/lib/store";
import CocScreen from "./CocScreen";
import RegAside from "./RegAside";
import { focusFirstRegError, type RegFormApi } from "./RegField";
import RegMap, { MAP_KEYS, pickMap, type MapSnap } from "./RegMap";
import RegReview from "./RegReview";
import RegSection from "./RegSection";
import { useRegUi } from "./useRegUi";

export default function RegistrationWizard() {
  const { db, mutate, toast } = usePortal();
  const router = useRouter();
  const ui = useRegUi();
  const [mapSnap, setMapSnap] = useState<MapSnap>(() => pickMap(db.registration.data));
  const r = db.registration;
  const d = r.data;

  useEffect(() => {
    if (ui.focusTick) focusFirstRegError();
  }, [ui.focusTick]);

  if (!r.cocAccepted) return <CocScreen />;

  const formFor = (scope: string): RegFormApi => {
    const data: RegData = regScopeData(db, scope) ?? {};
    const edit = (fn: (target: RegData) => void) =>
      mutate((draft) => {
        const target = regScopeData(draft, scope);
        if (target) fn(target);
      });
    const id = (k: string) => `${scope}|${k}`;
    return {
      scope,
      data,
      showError: (k) => ui.showError(id(k)),
      input: (k, value) => edit((t) => void (t[k] = value)),
      set: (k, value) => {
        edit((t) => regSetValue(regFieldsFor(scope, t), t, k, value));
        ui.touch(id(k));
      },
      check: (k, checked) => {
        edit((t) => regCheckValue(t, k, checked));
        ui.touch(id(k));
      },
      blur: (k) => {
        ui.touch(id(k));
        if (scope === "reg" && MAP_KEYS.includes(k)) setMapSnap(pickMap(data));
      },
      dateNative: (k, iso) => {
        const value = isoToRegDate(iso);
        if (!value) return;
        edit((t) => void (t[k] = value));
        ui.touch(id(k));
      },
      files: (k, files) => {
        const f = regFieldsFor(scope, data).find((x) => x.k === k);
        if (!f || f.t !== "file") return;
        const { list, messages } = regAddFiles(f, Array.isArray(data[k]) ? data[k] : [], files);
        messages.forEach(toast);
        edit((t) => void (t[k] = list));
        ui.touch(id(k));
      },
      removeFile: (k, index) => edit((t) => void (Array.isArray(t[k]) && t[k].splice(index, 1))),
      fileExpiry: (k, index, value) => {
        if (value && value < todayIso()) return toast("วันหมดอายุต้องไม่เป็นวันที่ผ่านมาแล้ว");
        edit((t) => {
          const file = t[k]?.[index];
          if (file) file.expiry = value;
        });
      },
    };
  };

  const reportErrors = (message: string) => {
    ui.setShowAll(true);
    ui.requestFocus();
    toast(message);
  };

  const step = (delta: number) => {
    if (delta > 0 && r.step < 4 && regStepErrors(r, r.step).length) return reportErrors("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วนและถูกต้อง");
    ui.setShowAll(false);
    mutate((draft) => void (draft.registration.step = Math.max(1, Math.min(4, draft.registration.step + delta))));
    window.scrollTo(0, 0);
  };

  const go = (target: number) => {
    if (!Number.isInteger(target) || target < 1 || target >= r.step) return;
    ui.setShowAll(false);
    mutate((draft) => void (draft.registration.step = target));
    window.scrollTo(0, 0);
  };

  const addCategory = () => mutate((draft) => void draft.registration.categories.push({ main: "", sub: "", material: "", details: "", files: [] }));

  const removeCategory = (index: number) => {
    ui.clearTouched();
    mutate((draft) => {
      if (draft.registration.categories.length > 1) draft.registration.categories.splice(index, 1);
    });
  };

  const submit = () => {
    if (r.status === "Submitted") return;
    for (const s of [1, 2, 3]) {
      if (regStepErrors(r, s).length) {
        mutate((draft) => void (draft.registration.step = s));
        return reportErrors("กรุณาตรวจสอบข้อมูลที่ยังไม่ครบถ้วนก่อนส่ง");
      }
    }
    if (!window.confirm("ยืนยันการส่งข้อมูลการลงทะเบียนผู้ขาย?")) return;
    mutate(applyRegistration);
    ui.setShowAll(false);
    ui.clearTouched();
    toast("ลงทะเบียนสำเร็จ ระบบสร้างโปรไฟล์ผู้ขายแล้ว งานอื่นพร้อมใช้งาน");
    router.push(routes.onboarding);
  };

  let body;
  if (r.step === 1) {
    const form = formFor("reg");
    body = REG_STEP1.map((s, i) => (
      <RegSection key={s.title} title={s.title} fields={s.fields} form={form} num={i + 1} id={`reg-sec-${i}`} hint={s.hint} after={s.map ? <RegMap id="reg-map" snap={mapSnap} /> : null} />
    ));
  } else if (r.step === 2) {
    body = (
      <RegSection
        title="เอกสารสำคัญ"
        fields={regDocFields(d)}
        form={formFor("reg")}
        num={1}
        id="reg-sec-0"
        hint={d.companyType === "บุคคลธรรมดา" ? "เอกสารสำหรับบุคคลธรรมดา · ต้นแบบนี้เก็บเฉพาะชื่อไฟล์ในเบราว์เซอร์" : "เอกสารสำหรับนิติบุคคล · ต้นแบบนี้เก็บเฉพาะชื่อไฟล์ในเบราว์เซอร์"}
      />
    );
  } else if (r.step === 3) {
    body = (
      <>
        {r.categories.map((_, i) => (
          <RegSection
            key={i}
            title={`กลุ่มสินค้าที่ ${i + 1}`}
            fields={regCatFields()}
            form={formFor(`cat:${i}`)}
            num={i + 1}
            id={`reg-sec-${i}`}
            extra={
              r.categories.length > 1 ? (
                <button type="button" className="button danger" onClick={() => removeCategory(i)}>
                  ลบกลุ่มสินค้า
                </button>
              ) : null
            }
          />
        ))}
        <div>
          <button type="button" className="button" onClick={addCategory}>
            ＋ เพิ่มกลุ่มสินค้า
          </button>
        </div>
      </>
    );
  } else {
    body = (
      <>
        <div className="notice">ตรวจสอบข้อมูลทั้งหมดก่อนส่ง เมื่อส่งข้อมูลแล้ว ระบบจะสร้างโปรไฟล์ผู้ขายจากข้อมูลนี้</div>
        <RegReview registration={r} onGo={go} />
      </>
    );
  }

  return (
    <div className="reg-layout">
      <RegAside registration={r} onGo={go} />
      <div className="reg-main">
        {body}
        <div className="card reg-footer">
          {r.step > 1 ? (
            <button className="button" onClick={() => step(-1)}>
              ‹ ย้อนกลับ
            </button>
          ) : (
            <span />
          )}
          <span className="reg-footer-note">ขั้นที่ {r.step} จาก 4</span>
          {r.step < 4 ? (
            <button className="button primary" onClick={() => step(1)}>
              ต่อไป ›
            </button>
          ) : (
            <button className="button primary" onClick={submit}>
              ส่งข้อมูล
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
