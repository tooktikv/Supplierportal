"use client";

import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";

const GREEN = ["Approved", "Completed", "Verified", "Current", "Satisfied", "Buyer interested", "Low"];
const AMBER = ["Awaiting Submission", "Action Required", "Awaiting Sample", "Expiring Soon", "Pending", "Required", "Medium"];
const BLUE = ["Under Review", "Submitted"];
const RED = ["Rejected", "Failed", "High"];

/** Same colour rules as the mock-up's badge(). */
export function Badge({ status }: { status: string }) {
  const { t } = useI18n();
  const color = GREEN.includes(status) ? "green" : BLUE.includes(status) ? "blue" : AMBER.includes(status) ? "amber" : RED.includes(status) ? "red" : "gray";
  return <span className={`status ${color}`}>{t(status)}</span>;
}

export function PageHeading({ title, desc, action }: { title: ReactNode; desc: ReactNode; action?: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="page-heading">
      <div>
        <h1>{typeof title === "string" ? t(title) : title}</h1>
        <p>{typeof desc === "string" ? t(desc) : desc}</p>
      </div>
      {action}
    </div>
  );
}

export function Metric({ label, value, icon, note = "" }: { label: string; value: ReactNode; icon: string; note?: string }) {
  return (
    <div className="card metric">
      <div className="metric-top">
        {label}
        <span className="metric-icon">{icon}</span>
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

export function InfoItem({ label, value }: { label: string; value?: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="info-item">
      <label>{t(label)}</label>
      <strong>{(typeof value === "string" ? t(value) : value) || "—"}</strong>
    </div>
  );
}
