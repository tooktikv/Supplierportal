"use client";

import {
  DEMO_TOOLS,
  resetSimulatedStages,
  simulateAnnouncement,
  simulateBuyerInterest,
  simulateEvaluation,
  simulateProcurementReview,
} from "@/lib/demo";
import { useI18n } from "@/lib/i18n";
import { allTasksComplete, buyerInterested, registrationDone } from "@/lib/onboarding";
import { usePortal } from "@/lib/store";

/** TEMPORARY: simulates Buyer-side (SLM) steps until that system exists; remove with lib/demo.ts. */
export default function DemoOnboardingTools() {
  const { db, mutate, toast } = usePortal();
  const { t } = useI18n();
  if (!DEMO_TOOLS || !registrationDone(db)) return null;

  const reviewed = db.onboarding.procurementReview.status === "Completed";
  const announced = db.onboarding.announcement.status === "Completed";
  const evaluated = db.onboarding.evaluation.status === "Completed";
  const interested = buyerInterested(db);
  const mark = (done: boolean) => (done ? "✓ " : "");

  const review = () => {
    mutate(simulateProcurementReview);
    toast("Simulated: procurement review completed.");
  };
  const announce = () => {
    if (!allTasksComplete(db)) return toast("Complete every onboarding task first.");
    mutate(simulateAnnouncement);
    toast("Simulated: pre-screening outcome announced.");
  };
  const evaluate = () => {
    if (!announced) return toast("Announce the pre-screening outcome first.");
    mutate(simulateEvaluation);
    toast("Simulated: supplier evaluation result is ready.");
  };
  const interest = () => {
    mutate(simulateBuyerInterest);
    toast("Simulated: a Buyer is interested in your company.");
  };
  const reset = () => {
    mutate(resetSimulatedStages);
    toast("Simulated stages were reset.");
  };

  return (
    <div className="notice demo-tools">
      <span>
        <strong>{t("Demo shortcut (temporary)")}</strong> · {t("Simulate the Buyer-side (SLM) steps that are not built yet.")}
      </span>
      <div className="demo-tools-actions">
        <button className="button small" onClick={review}>{mark(reviewed)}{t("Procurement review done")}</button>
        <button className="button small" onClick={announce}>{mark(announced)}{t("Announce outcome")}</button>
        <button className="button small" onClick={evaluate}>{mark(evaluated)}{t("Evaluation result")}</button>
        <button className="button small primary" onClick={interest}>{mark(interested)}{t("Buyer is interested")}</button>
        <button className="button small subtle" onClick={reset}>{t("Reset simulation")}</button>
      </div>
    </div>
  );
}
