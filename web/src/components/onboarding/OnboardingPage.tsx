"use client";

import { useRouter } from "next/navigation";
import RegistrationTaskCard from "@/components/registration/RegistrationTaskCard";
import { BuyerInterestBanner } from "@/components/BuyerInterest";
import DemoOnboardingTools from "@/components/DemoOnboardingTools";
import { Badge, PageHeading } from "@/components/ui";
import {
  onboardingStages,
  onboardingTasks,
  registrationDone,
  requiredOnboardingTasks,
  riskAssessmentState,
  SOURCING_GROUP,
  taskBlockedMessage,
  taskCount,
  THAI_LABOR_GROUP,
} from "@/lib/onboarding";
import { routes } from "@/lib/routes";
import { useI18n } from "@/lib/i18n";
import { usePortal } from "@/lib/store";

export default function OnboardingPage() {
  const { db, toast } = usePortal();
  const { t } = useI18n();
  const router = useRouter();
  const registered = registrationDone(db);
  const stages = onboardingStages(db);
  const taskGroups = [SOURCING_GROUP, THAI_LABOR_GROUP].map((group) => ({ group, tasks: onboardingTasks.filter((task) => task.group === group) }));
  const required = new Set(requiredOnboardingTasks(db).map((task) => task.id));

  const openTask = (id: string) => {
    const blockedMessage = taskBlockedMessage(db, id);
    if (blockedMessage) return toast(blockedMessage);
    router.push(routes.task(id));
  };

  return (
    <>
      <PageHeading title={t("Supplier Onboarding")} desc={t("Follow your supplier registration, task completion, and evaluation progress.")} />
      <BuyerInterestBanner />
      <DemoOnboardingTools />
      {!registered && (
        <div className="notice warning">
          {t("Start with")} <strong>{t("Supplier Registration")}</strong> {t("in Your tasks. The other tasks and menus unlock after your registration is submitted.")}
        </div>
      )}
      <div className="onboarding-layout">
        <section className="card section-card">
          <div className="section-title">
            <h2>{t("Onboarding stages")}</h2>
            <Badge status={stages.every((s) => s.status === "Completed") ? "Completed" : "In Progress"} />
          </div>
          <div className="onboarding-stepper">
            {stages.map((s, i) => (
              <div className={`onboarding-stage ${s.status === "In Progress" ? "stage-active" : ""}`} key={s.title}>
                <span className={`stage-marker ${s.status === "Completed" ? "stage-done" : ""}`}>{s.status === "Completed" ? "✓" : i + 1}</span>
                <div className="stage-copy">
                  <strong>{t(s.title)}</strong>
                  <small>{t(s.description, s.vars)}</small>
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
              <h2>{t("Your tasks")}</h2>
              <small>{t("Activities required during supplier pre-screening.")}</small>
            </div>
          </div>
          {!registered && <RegistrationTaskCard />}
          {taskGroups.map(({ group, tasks }) => {
            const nextUp = tasks.find((task) => !taskBlockedMessage(db, task.id) && taskCount(db, task.id) < task.required);
            const cards = tasks.map((task, index) => {
            const done = taskCount(db, task.id);
            const isRisk = task.id === "sustainability-risk";
            const blockedMessage = taskBlockedMessage(db, task.id);
            const disabled = Boolean(blockedMessage);
            const complete = done >= task.required;
            const blockedStatus = !registered
              ? "Pending registration"
              : isRisk && riskAssessmentState(db) === "not-required"
                ? "Not required"
                : "Locked";
            const description = disabled
              ? blockedMessage
              : isRisk
                ? "Your Inherent Risk is rated High in some areas. Complete the assessment for each of them."
                : task.description;
            return (
              <article className={`task-card ${disabled ? "task-disabled" : ""} ${nextUp?.id === task.id ? "task-next" : ""}`} key={task.id}>
                <div className={`task-step ${complete ? "done" : ""}`} aria-label={t("Step {n}", { n: index + 1 })}>{complete ? "✓" : index + 1}</div>
                <div className="task-content">
                  <span className="eyebrow">{t("Step {n} · {category}", { n: index + 1, category: t(task.category) })}{task.conditional ? ` · ${t("only if a risk is rated High")}` : ""}</span>
                  <h3>{t(task.title)}</h3>
                  <p>{t(description)}</p>
                  {disabled ? (
                    <Badge status={blockedStatus} />
                  ) : (
                    <div className="task-progress">
                      <span>
                        {t("Completed {done}/{required}", { done, required: task.required })}
                      </span>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${(done / task.required) * 100}%` }} />
                      </div>
                    </div>
                  )}
                </div>
                <button className={`button ${disabled || complete ? "" : "primary"}`} onClick={() => openTask(task.id)} disabled={disabled}>
                  {disabled ? (blockedStatus === "Not required" ? t("Not required") : t("Locked")) : complete ? t("Review") : t("View details")}
                  {disabled ? "" : " →"}
                </button>
              </article>
            );
            });
            const groupTasks = tasks.filter((task) => required.has(task.id));
            const groupDone = groupTasks.filter((task) => taskCount(db, task.id) >= task.required).length;
            return (
              <div className="task-group" key={group}>
                <div className="task-group-head">
                  <h3>{t(group)}</h3>
                  <small>{t("{done} of {total} completed · complete the steps in order, each step unlocks the next", { done: groupDone, total: groupTasks.length })}</small>
                </div>
                {cards}
              </div>
            );
          })}
        </section>
      </div>
    </>
  );
}
