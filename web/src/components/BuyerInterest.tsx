"use client";

import { Badge } from "@/components/ui";
import { fmtDate } from "@/lib/docs";
import { useI18n } from "@/lib/i18n";
import { buyerInterested } from "@/lib/onboarding";
import { usePortal } from "@/lib/store";

export const BUYER_INTEREST_STATUS = "Buyer interested";

/** Compact badge for places that are always on screen (sidebar, profile). */
export function BuyerInterestBadge() {
  const { db } = usePortal();
  return buyerInterested(db) ? <Badge status={BUYER_INTEREST_STATUS} /> : null;
}

/** Highlight shown at the top of the first page once a Buyer has marked this supplier as interesting. */
export function BuyerInterestBanner() {
  const { db } = usePortal();
  const { t } = useI18n();
  if (!buyerInterested(db)) return null;
  const { buyer, at } = db.onboarding.buyerInterest;
  return (
    <div className="card interest-banner" role="status">
      <span className="interest-icon" aria-hidden="true">★</span>
      <div>
        <strong>{t("You have received a Buyer’s interest")}</strong>
        <p>
          {t("{buyer} is interested in your company. Keep your profile and documents up to date while the Buyer follows up.", { buyer: buyer || t("A Buyer") })}
          {at ? ` · ${fmtDate(at)}` : ""}
        </p>
      </div>
      <Badge status={BUYER_INTEREST_STATUS} />
    </div>
  );
}
