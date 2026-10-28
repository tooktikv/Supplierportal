"use client";

import { InfoItem, PageHeading } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

const FAQ = [
  ["Does an approved sample mean I’m qualified?", "No. Sample approval is only one possible onboarding gate."],
  ["Can I mark my sample as received?", "No. An authorized internal evaluator confirms physical receipt."],
  ["Are attachments sent to Northstar?", "No. This prototype simulates file selection only."],
];

export default function HelpPage() {
  const { t } = useI18n();
  return (
    <>
      <PageHeading title="Help & Support" desc="Get assistance with supplier registration, sample requests, and documents." />
      <div className="dashboard-grid">
        <div className="card section-card">
          <h2>{t("Contact supplier support")}</h2>
          <p style={{ color: "var(--muted)", fontSize: 11, lineHeight: 1.6 }}>
            {t("For account updates, onboarding questions, or help with sample submissions, contact the supplier support team.")}
          </p>
          <div className="info-grid" style={{ margin: "17px 0" }}>
            <InfoItem label="Email" value="supplier.support@northstar.example" />
            <InfoItem label="Phone" value="+1 (800) 555-0194" />
            <InfoItem label="Support hours" value="Monday–Friday, 8:00 AM–5:00 PM PT" />
          </div>
          <a className="button primary" href="mailto:supplier.support@northstar.example">
            {t("Email supplier support")}
          </a>
        </div>
        <div className="card section-card">
          <h2>{t("Common questions")}</h2>
          <div className="activity-list">
            {FAQ.map(([q, a]) => (
              <div className="activity" key={q}>
                <div>
                  <strong>{t(q)}</strong>
                  <small>{t(a)}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
