"use client";

import { REG_STEPS, regAsideSections, regStepProgress } from "@/lib/registration";
import type { Db } from "@/lib/types";

export default function RegAside({ registration: r, onGo }: { registration: Db["registration"]; onGo: (step: number) => void }) {
  const sections = regAsideSections(r);
  const { total, ok } = regStepProgress(r, r.step);
  const pct = total ? Math.round((ok / total) * 100) : 100;

  return (
    <aside className="card reg-aside" id="reg-aside">
      <div className="reg-aside-title">ขั้นตอนการลงทะเบียน</div>
      <ol className="reg-steps">
        {REG_STEPS.map((name, i) => {
          const s = i + 1;
          const state = s === r.step ? "current" : s < r.step ? "done" : "";
          return (
            <li className={`reg-step ${state}`} key={name}>
              <button type="button" disabled={s >= r.step} onClick={() => onGo(s)}>
                <span className="reg-step-dot">{s < r.step ? "✓" : s}</span>
                <span>{name}</span>
              </button>
              {s === r.step && sections.length > 0 && (
                <ul className="reg-substeps">
                  {sections.map((x) => (
                    <li key={x.id}>
                      <button type="button" className={x.done ? "done" : ""} onClick={() => document.getElementById(x.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                        <span className="reg-sub-dot">{x.done ? "✓" : ""}</span>
                        <span>{x.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
      {r.step < 4 && (
        <div className="reg-progress">
          <div className="reg-progress-top">
            <span>ช่องที่จำเป็นขั้นนี้</span>
            <strong>
              {ok}/{total}
            </strong>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
      <p className="reg-legend">
        <span className="required">*</span> จำเป็นต้องกรอก · บันทึกอัตโนมัติ
      </p>
    </aside>
  );
}
