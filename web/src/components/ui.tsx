import type { ReactNode } from "react";

const GREEN = ["Approved", "Completed", "Verified", "Current", "Satisfied"];
const AMBER = ["Awaiting Submission", "Action Required", "Awaiting Sample", "Expiring Soon", "Pending", "Required"];
const BLUE = ["Under Review", "Submitted"];
const RED = ["Rejected", "Failed"];

/** Same colour rules as the mock-up's badge(). */
export function Badge({ status }: { status: string }) {
  const color = GREEN.includes(status) ? "green" : BLUE.includes(status) ? "blue" : AMBER.includes(status) ? "amber" : RED.includes(status) ? "red" : "gray";
  return <span className={`status ${color}`}>{status}</span>;
}

export function PageHeading({ title, desc, action }: { title: ReactNode; desc: ReactNode; action?: ReactNode }) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{desc}</p>
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
  return (
    <div className="info-item">
      <label>{label}</label>
      <strong>{value || "—"}</strong>
    </div>
  );
}
