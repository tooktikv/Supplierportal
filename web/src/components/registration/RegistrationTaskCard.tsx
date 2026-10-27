"use client";

import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { usePortal } from "@/lib/store";

export default function RegistrationTaskCard() {
  const { db } = usePortal();
  const router = useRouter();
  const r = db.registration;
  const started = r.cocAccepted;
  const pct = started ? Math.round(((r.step - 1) / 4) * 100) : 0;

  return (
    <article className="task-card">
      <div className="task-icon">✎</div>
      <div className="task-content">
        <span className="eyebrow">Registration · Required first</span>
        <h3>Supplier Registration</h3>
        <p>Register your company information to create your supplier profile. All other tasks and menus unlock after you submit.</p>
        <div className="task-progress">
          <span>{started ? `Step ${r.step} of 4` : "Not started"}</span>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
      <button className="button primary" onClick={() => router.push(routes.registration)}>
        {started ? "Continue" : "Start registration"} →
      </button>
    </article>
  );
}
