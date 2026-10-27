"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import LearningFlow from "@/components/onboarding/LearningFlow";
import RiskAssessment from "@/components/onboarding/RiskAssessment";
import SupplierQuestionnaire from "@/components/onboarding/SupplierQuestionnaire";
import { Badge, PageHeading } from "@/components/ui";
import { onboardingTasks, taskBlockedMessage, taskCount } from "@/lib/onboarding";
import { routes } from "@/lib/routes";
import { usePortal } from "@/lib/store";

export default function TaskScreen({ taskId }: { taskId: string }) {
  const { db, toast } = usePortal();
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
          Supplier Onboarding
        </button>{" "}
        / <strong>{task.category}</strong>
      </div>
      <PageHeading title={task.title} desc={task.description} />
      <div className="task-detail-layout">
        <div className="card section-card task-detail-card">
          <div className="section-title">
            <div>
              <div className="eyebrow">{task.category}</div>
              <h2>{task.title}</h2>
            </div>
            <Badge status={done >= task.required ? "Completed" : "In Progress"} />
          </div>
          <div className="task-progress detail-progress">
            <span>
              Progress · {done}/{task.required}
            </span>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
          {done >= task.required && (
            <div className="result-banner">
              <strong>Activity completed</strong>
              <br />
              Your progress is saved in this browser. This prototype does not transmit answers to an internal system.
            </div>
          )}
          {task.id === "sourcing-policy" ? <LearningFlow /> : task.id === "sustainability-risk" ? <RiskAssessment /> : <SupplierQuestionnaire done={done} />}
        </div>
      </div>
    </>
  );
}
