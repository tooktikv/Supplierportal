"use client";

import { useEffect, useRef, useState } from "react";
import { regFieldError, regId, regSetValue, siteRecord, SITE_FIELDS, type RegData } from "@/lib/registration";
import { usePortal } from "@/lib/store";
import RegField, { focusFirstRegError, type RegFormApi } from "@/components/registration/RegField";
import RegMap, { MAP_KEYS, pickMap, type MapSnap } from "@/components/registration/RegMap";
import { useRegUi } from "@/components/registration/useRegUi";

const field = (k: string) => SITE_FIELDS.find((f) => f.k === k)!;

function SiteDialog({ onClose }: { onClose: () => void }) {
  const { mutate, toast } = usePortal();
  const ui = useRegUi();
  const [draft, setDraft] = useState<RegData>({ country: "ไทย" });
  const [mapSnap, setMapSnap] = useState<MapSnap>(() => pickMap({ country: "ไทย" }));
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.getElementById(regId("site", "name"))?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (ui.focusTick && dialogRef.current) focusFirstRegError(dialogRef.current);
  }, [ui.focusTick]);

  const form: RegFormApi = {
    scope: "site",
    data: draft,
    showError: (k) => ui.showError(`site|${k}`),
    input: (k, value) => setDraft((prev) => ({ ...prev, [k]: value })),
    set: (k, value) => {
      setDraft((prev) => {
        const next = { ...prev };
        regSetValue(SITE_FIELDS, next, k, value);
        return next;
      });
      ui.touch(`site|${k}`);
    },
    check: (k, checked) => setDraft((prev) => ({ ...prev, [k]: checked })),
    blur: (k) => {
      ui.touch(`site|${k}`);
      if (MAP_KEYS.includes(k)) setMapSnap(pickMap(draft));
    },
    dateNative: () => {},
    files: () => {},
    removeFile: () => {},
    fileExpiry: () => {},
  };

  const save = () => {
    if (SITE_FIELDS.some((f) => regFieldError(f, draft))) {
      ui.setShowAll(true);
      ui.requestFocus();
      return toast("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วนและถูกต้อง");
    }
    mutate((db) => void db.profile.factories.push(siteRecord(draft)));
    onClose();
    toast("เพิ่มข้อมูลโรงงานเรียบร้อยแล้ว");
  };

  const render = (k: string) => <RegField key={k} field={field(k)} form={form} />;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="site-modal-title" ref={dialogRef}>
        <button type="button" className="modal-close" aria-label="ปิด" onClick={onClose}>
          ×
        </button>
        <div className="modal-body">
          <h2 id="site-modal-title">ที่อยู่โรงงานผู้ผลิตสินค้า</h2>
          <div className="reg-grid">{["name", "country", "address", "province", "district", "subdistrict", "postal"].map(render)}</div>
          <h3 className="modal-subtitle">พิกัดที่ตั้งโรงงานผู้ผลิตสินค้า</h3>
          <p className="modal-hint">กรุณาระบุตำแหน่งที่ตั้งโรงงานผู้ผลิตสินค้าของคุณ</p>
          <div className="reg-grid">{["lat", "lng", "mapQuery"].map(render)}</div>
          <RegMap id="site-map" snap={mapSnap} />
        </div>
        <div className="modal-footer">
          <button type="button" className="button" onClick={onClose}>
            ย้อนกลับ
          </button>
          <button type="button" className="button primary" onClick={save}>
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}

/** Add-manufacturing-site dialog. The draft lives in local state and reaches db.profile.factories only on save. */
export default function SiteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return open ? <SiteDialog onClose={onClose} /> : null;
}
