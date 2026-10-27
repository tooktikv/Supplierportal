"use client";

import { useRouter } from "next/navigation";
import { DEMO_TOOLS, fillDemoRegistration } from "@/lib/demo";
import { useI18n } from "@/lib/i18n";
import { applyRegistration } from "@/lib/registration";
import { routes } from "@/lib/routes";
import { usePortal } from "@/lib/store";

/** TEMPORARY developer shortcuts for quick demos; remove with lib/demo.ts. */
export default function DemoRegistrationTools({ mode }: { mode: "fill" | "skip" }) {
  const { db, mutate, toast } = usePortal();
  const { t } = useI18n();
  const router = useRouter();
  if (!DEMO_TOOLS || db.registration.status === "Submitted") return null;

  const fill = () => {
    mutate(fillDemoRegistration);
    toast("Demo data filled. Use Next to review each step.");
  };
  const skip = () => {
    mutate((draft) => {
      fillDemoRegistration(draft);
      applyRegistration(draft);
    });
    toast("Registration submitted with demo data.");
    router.push(routes.onboarding);
  };

  return mode === "fill" ? (
    <div className="notice demo-tools">
      <span><strong>{t("Demo shortcut (temporary)")}</strong> · {t("Fill every registration step with sample data so you can click Next.")}</span>
      <div className="demo-tools-actions">
        <button className="button small" onClick={fill}>{t("Fill demo data")}</button>
        <button className="button small primary" onClick={skip}>{t("Skip registration (demo)")}</button>
      </div>
    </div>
  ) : (
    <button className="button small demo-skip" onClick={skip} title={t("Demo shortcut (temporary)")}>{t("Skip registration (demo)")}</button>
  );
}
