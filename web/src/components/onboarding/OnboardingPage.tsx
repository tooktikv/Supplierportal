"use client";

import { useRouter } from "next/navigation";
import RegistrationTaskCard from "@/components/registration/RegistrationTaskCard";
import { Badge, PageHeading } from "@/components/ui";
import {
  onboardingGate,
  onboardingStages,
  onboardingTasks,
  registrationDone,
  riskAssessmentState,
  taskBlockedMessage,
  taskCount,
} from "@/lib/onboarding";
import { routes } from "@/lib/routes";
import { usePortal } from "@/lib/store";

export default function OnboardingPage() {
  const { db, toast } = usePortal();
  const router = useRouter();
  const registered = registrationDone(db);
  const stages = onboardingStages(db);

  const openTask = (id: string) => {
    const blockedMessage = taskBlockedMessage(db, id);
    if (blockedMessage) return toast(blockedMessage);
    router.push(routes.task(id));
  };

  return (
    <>
      <PageHeading title="Supplier Onboarding" desc="Follow your supplier registration, task completion, and evaluation progress." />
      {!registered && (
        <div className="notice warning">
          Start with <strong>Supplier Registration</strong> in Your tasks. The other tasks and menus unlock after your registration is submitted.
        </div>
      )}
      <div className="onboarding-layout">
        <section className="card section-card">
          <div className="section-title">
            <h2>Onboarding stages</h2>
            <Badge status="In Progress" />
          </div>
          <div className="onboarding-stepper">
            {stages.map((s, i) => (
              <div className={`onboarding-stage ${s.status === "In Progress" ? "stage-active" : ""}`} key={s.title}>
                <span className={`stage-marker ${s.status === "Completed" ? "stage-done" : ""}`}>{s.status === "Completed" ? "✓" : i + 1}</span>
                <div className="stage-copy">
                  <strong>{s.title}</strong>
                  <small>{s.description}</small>
                </div>
                <span className="stage-state">
                  <Badge status={s.status} />
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="card section-card task-section">
          <div className="section-title">
            <div>
              <h2>Your tasks</h2>
              <small>Activities required during supplier pre-screening.</small>
            </div>
          </div>
          {!registered && <RegistrationTaskCard />}
          {onboardingTasks.map((task) => {
            const done = taskCount(db, task.id);
            const isRisk = task.id === "sustainability-risk";
            const blockedMessage = taskBlockedMessage(db, task.id);
            const disabled = Boolean(blockedMessage);
            const blockedStatus = !registered
              ? "Pending registration"
              : isRisk
                ? riskAssessmentState(db) === "pending"
                  ? "Pending questionnaire"
                  : "Not required"
                : "Pending learning";
            const description = disabled
              ? blockedMessage
              : isRisk
                ? "Risk identified in your questionnaire. Complete this additional assessment."
                : task.description;
            return (
              <article className={`task-card ${disabled ? "task-disabled" : ""}`} key={task.id}>
                <div className="task-icon">{task.icon}</div>
                <div className="task-content">
                  <span className="eyebrow">{task.category}</span>
                  <h3>{task.title}</h3>
                  <p>{description}</p>
                  {disabled ? (
                    <Badge status={blockedStatus} />
                  ) : (
                    <div className="task-progress">
                      <span>
                        Completed {done}/{task.required}
                      </span>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${(done / task.required) * 100}%` }} />
                      </div>
                    </div>
                  )}
                </div>
                <button className={`button ${disabled || done >= task.required ? "" : "primary"}`} onClick={() => openTask(task.id)} disabled={disabled}>
                  {disabled ? (blockedStatus === "Not required" ? "Not required" : "Unavailable") : done >= task.required ? "Review" : "View details"}
                  {disabled ? "" : " →"}
                </button>
              </article>
            );
          })}
        </section>
      </div>
      <div className="notice" style={{ marginTop: 15 }}>
        Sample approval is a category-dependent gate only. It does not automatically mean your supplier qualification is complete. Current sample gate: <Badge status={onboardingGate(db)} />
      </div>
    </>
  );
}
