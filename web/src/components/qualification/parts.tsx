"use client";

import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import type { QslDisplayOutcome } from "@/lib/qsl";

const OUTCOME_COLOR: Record<QslDisplayOutcome, string> = { Qualified: "green", Conditional: "amber", "Not Qualified": "red", Expired: "red", Suspended: "red" };

/** Final qualification outcome, shown apart from the request workflow status. */
export function OutcomeBadge({ outcome }: { outcome: QslDisplayOutcome }) {
  const { t } = useI18n();
  return <span className={`status ${OUTCOME_COLOR[outcome]}`}>{t(outcome)}</span>;
}

/** Plain card with a heading; mirrors the detail-section blocks of the sample request page. */
export function Block({ title, children, extra }: { title: string; children: ReactNode; extra?: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="card detail-section">
      <div className="section-title">
        <h2>{t(title)}</h2>
        {extra}
      </div>
      {children}
    </div>
  );
}

export const timeLabel = (iso: string) => new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(iso));
