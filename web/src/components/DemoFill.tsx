"use client";

import { DEMO_TOOLS } from "@/lib/demo";
import { useI18n } from "@/lib/i18n";
import { usePortal } from "@/lib/store";

/** TEMPORARY developer shortcut that fills a form with sample data; remove with lib/demo.ts. */
export default function DemoFill({ onFill, secondary }: { onFill: () => void; secondary?: { label: string; onFill: () => void } }) {
  const { toast } = usePortal();
  const { t } = useI18n();
  if (!DEMO_TOOLS) return null;
  const run = (fill: () => void) => () => {
    fill();
    toast("Demo data filled.");
  };
  return (
    <div className="notice demo-tools">
      <span><strong>{t("Demo shortcut (temporary)")}</strong> · {t("Fill this form with sample data to speed up the demo.")}</span>
      <div className="demo-tools-actions">
        {secondary && <button type="button" className="button small" onClick={run(secondary.onFill)}>{t(secondary.label)}</button>}
        <button type="button" className="button small primary" onClick={run(onFill)}>{t("Fill demo data")}</button>
      </div>
    </div>
  );
}
