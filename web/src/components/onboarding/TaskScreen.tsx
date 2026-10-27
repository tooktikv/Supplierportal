"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import LearningFlow from "@/components/onboarding/LearningFlow";
import RiskAssessment from "@/components/onboarding/RiskAssessment";
import SupplierQuestionnaire from "@/components/onboarding/SupplierQuestionnaire";
import ThaiLaborFlow from "@/components/onboarding/ThaiLaborFlow";
import ThaiCommitmentForm from "@/components/onboarding/ThaiCommitmentForm";
import ThaiAssessmentForm from "@/components/onboarding/ThaiAssessmentForm";
import { Badge, PageHeading } from "@/components/ui";
import { onboardingTasks, taskBlockedMessage, taskCount } from "@/lib/onboarding";
import { routes } from "@/lib/routes";
import { useI18n } from "@/lib/i18n";
import { usePortal } from "@/lib/store";

export default function TaskScreen({ taskId }: { taskId: string }) {
  const { db, toast } = usePortal();
  const { t } = useI18n();
  const router = useRouter();
  const warned = useRef(false);
  const task = onboardingTasks.find((item) => item.id === taskId);
  const blockedMessage = task ? taskBlockedMessage(db, task.id) : "This task is not available.";

  useEffect(() => {
    if (!blockedMessage) return;
    if (!warned.current) {
      warned.current = true;
      toast(blockedMessage);
    }
    router.replace(routes.onboarding);
  }, [blockedMessage, router, toast]);

  if (!task || blockedMessage) return null;

  const done = taskCount(db, task.id);
  const progress = (done / task.required) * 100;

  return (
    <>
      <div className="breadcrumbs" style={{ marginBottom: 11 }}>
        <button className="text-link" onClick={() => router.push(routes.onboarding)}>
          {t("Supplier Onboarding")}
        </button>{" "}
        / <strong>{t(task.category)}</strong>
      </div>
      <PageHeading title={t(task.title)} desc={t(task.description)} />
      <div className="task-detail-layout">
        <div className="card section-card task-detail-card">
          <div className="section-title">
            <div>
              <div className="eyebrow">{t(task.category)}</div>
              <h2>{t(task.title)}</h2>
            </div>
            <Badge status={done >= task.required ? "Completed" : "In Progress"} />
          </div>
          <div className="task-progress detail-progress">
            <span>
              {t("Progress · {done}/{required}", { done, required: task.required })}
            </span>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
          {done >= task.required && (
            <div className="result-banner">
              <strong>{t("Activity completed")}</strong>
              <br />
              {t("Your progress is saved in this browser. This prototype does not transmit answers to an internal system.")}
            </div>
          )}
          {task.id === "sourcing-policy" ? <LearningFlow /> : task.id === "thai-labor-standard" ? <ThaiLaborFlow /> : task.id === "thai-labor-commitment" ? <ThaiCommitmentForm /> : task.id === "thai-labor-assessment" ? <ThaiAssessmentForm /> : task.id === "sustainability-risk" ? <RiskAssessment /> : <SupplierQuestionnaire done={done} />}
        </div>
      </div>
    </>
  );
}
