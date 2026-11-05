"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { todayIso } from "@/lib/docs";
import { useI18n } from "@/lib/i18n";
import { isRegRequired, regFieldError, regId, regOptions, type RegData, type RegFieldSpec } from "@/lib/registration";
import type { FileMeta } from "@/lib/types";

/** Everything a RegField needs from its owner (registration wizard or site modal) for one scope. */
export interface RegFormApi {
  scope: string;
  data: RegData;
  showError: (k: string) => boolean;
  input: (k: string, value: string) => void;
  set: (k: string, value: string) => void;
  check: (k: string, checked: boolean) => void;
  blur: (k: string) => void;
  dateNative: (k: string, iso: string) => void;
  files: (k: string, files: File[]) => void;
  removeFile: (k: string, index: number) => void;
  fileExpiry: (k: string, index: number, value: string) => void;
}

export function focusFirstRegError(root: ParentNode = document) {
  const node = root.querySelector<HTMLElement>(".reg-field.has-error");
  node?.scrollIntoView({ block: "center" });
  node?.querySelector<HTMLElement>("input:not([type=hidden]),select,textarea")?.focus({ preventScroll: true });
}

function FileControl({ field, form, id, star }: { field: RegFieldSpec; form: RegFormApi; id: string; star: boolean }) {
  const { t } = useI18n();
  const [over, setOver] = useState(false);
  const val = form.data[field.k];
  const files: FileMeta[] = Array.isArray(val) ? val : [];
  const img = field.kind === "img";
  const full = files.length >= 5;

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = "";
    form.files(field.k, picked);
  };

  return (
    <div className={`doc-card ${files.length ? "done" : ""}`}>
      <div className="doc-card-head">
        <span className="doc-icon">{img ? "▣" : "▤"}</span>
        <div>
          <strong>
            {t(field.label)}
            {star && <span className="required"> *</span>}
          </strong>
          <small>{img ? t("PNG หรือ JPG") : "PDF"} · {t("สูงสุด 5 MB ต่อไฟล์ · สูงสุด 5 ไฟล์")}</small>
          {field.note && <small className="doc-note">{t(field.note)}</small>}
        </div>
        <span className="doc-state">{files.length ? t("✓ อัปโหลดแล้ว {n}/5", { n: files.length }) : star ? t("ยังไม่ได้อัปโหลด") : t("ไม่บังคับ")}</span>
      </div>
      <label className={`doc-drop ${full ? "full" : ""} ${over ? "over" : ""}`} onDragEnter={() => setOver(true)} onDragLeave={() => setOver(false)} onDrop={() => setOver(false)}>
        <input type="file" id={id} multiple accept={img ? ".png,.jpg,.jpeg" : ".pdf"} aria-label={t(field.label)} onChange={onPick} disabled={full} />
        <span className="doc-drop-icon">↑</span>
        <span>
          <b>{full ? t("อัปโหลดครบ 5 ไฟล์แล้ว") : <>{t("ลากไฟล์มาวาง หรือ")} <u>{t("เลือกไฟล์")}</u></>}</b>
        </span>
      </label>
      {files.length > 0 && (
        <div className="file-list">
          {files.map((x, i) => (
            <div className="file-row" key={x.uid || `${x.name}-${i}`}>
              <span className="file-ico">{x.name.split(".").pop()!.toUpperCase().slice(0, 4)}</span>
              <span className="file-name">
                {x.name}
                <small>{((x.size || 0) / 1024).toFixed(0)} KB</small>
              </span>
              <button type="button" aria-label={t("Remove {name}", { name: x.name })} onClick={() => form.removeFile(field.k, i)}>
                {t("Remove")}
              </button>
              {!img && form.scope === "reg" && (
                <label className="file-expiry">
                  {t("วันหมดอายุเอกสาร")}{field.expiryRequired ? <span className="required"> *</span> : ` ${t("(ถ้ามี)")}`}
                  <input type="date" required={field.expiryRequired} aria-invalid={field.expiryRequired && form.showError(field.k) && !x.expiry ? true : undefined} min={todayIso()} value={x.expiry || ""} onChange={(e) => form.fileExpiry(field.k, i, e.target.value)} />
                </label>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RegField({ field: f, form }: { field: RegFieldSpec; form: RegFormApi }) {
  const { t } = useI18n();
  const nativeDate = useRef<HTMLInputElement>(null);
  const d = form.data;
  const scope = form.scope;
  const dis = Boolean(f.dis?.(d));
  const ro = Boolean(f.ro?.(d));
  const id = regId(scope, f.k);
  const val = d[f.k] ?? "";
  const span = f.span || (f.t === "file" ? (scope === "reg" ? 2 : 4) : ["textarea", "checkbox"].includes(f.t) ? 4 : 1);
  const err = form.showError(f.k) ? regFieldError(f, d) : "";
  const opts = regOptions(f, d);
  const star = isRegRequired(f, d);
  const starEl = star ? <span className="required"> *</span> : null;
  const textEvents = {
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => form.input(f.k, e.target.value),
    onBlur: () => form.blur(f.k),
  };

  let control;
  if (f.t === "select") {
    control = (
      <select className="field-control" id={id} disabled={dis} value={val} onChange={(e) => form.set(f.k, e.target.value)} onBlur={() => form.blur(f.k)}>
        <option value="">{t(f.ph || "Choose")}</option>
        {opts.map((o) => (
          <option key={o} value={o}>
            {t(o)}
          </option>
        ))}
      </select>
    );
  } else if (f.t === "radio") {
    control = (
      <div className="reg-radio-row" role="radiogroup" aria-label={t(f.label)}>
        {opts.map((o) => (
          <label className="reg-radio" key={o}>
            <input type="radio" name={id} value={o} checked={val === o} onChange={(e) => form.set(f.k, e.target.value)} />
            <span>{t(o)}</span>
          </label>
        ))}
      </div>
    );
  } else if (f.t === "textarea") {
    control = <textarea className="field-control" id={id} rows={4} placeholder={f.ph ? t(f.ph) : ""} value={val} {...textEvents} />;
  } else if (f.t === "date") {
    control = (
      <div className="reg-date">
        <input className="field-control" id={id} type="text" inputMode="numeric" value={val} placeholder={f.ph ? t(f.ph) : ""} autoComplete="off" {...textEvents} />
        <button
          type="button"
          className="reg-date-button"
          aria-label={t("เลือกวันที่")}
          onClick={() => {
            const native = nativeDate.current;
            if (native?.showPicker) native.showPicker();
            else native?.focus();
          }}
        >
          ▦
        </button>
        <input type="date" className="reg-date-native" id={`${id}-native`} ref={nativeDate} tabIndex={-1} aria-hidden="true" onChange={(e) => form.dateNative(f.k, e.target.value)} />
      </div>
    );
  } else if (f.t === "file") {
    control = <FileControl field={f} form={form} id={id} star={star} />;
  } else if (f.t === "checkbox") {
    control = (
      <label className="reg-check">
        <input type="checkbox" id={id} checked={Boolean(val)} onChange={(e) => form.check(f.k, e.target.checked)} />
        <span>
          {t(f.label)}
          {starEl}
          {f.note && <small className="reg-check-note">{t(f.note)}</small>}
        </span>
      </label>
    );
  } else {
    control = (
      <input
        className="field-control"
        id={id}
        type="text"
        inputMode={(f.mode || "text") as "text"}
        value={val}
        placeholder={f.ph ? t(f.ph) : ""}
        autoComplete="off"
        disabled={dis}
        readOnly={ro}
        {...textEvents}
      />
    );
  }

  return (
    <div className={`form-field reg-field reg-s${span} ${err ? "has-error" : ""}`} data-reg-field={`${scope}|${f.k}`}>
      {f.t !== "checkbox" && f.t !== "file" && (
        <label htmlFor={id}>
          {t(f.label)}
          {starEl}
        </label>
      )}
      {control}
      <span className="form-error">{err}</span>
    </div>
  );
}
