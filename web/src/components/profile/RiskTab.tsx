"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import { riskAssessmentState, riskTopics, taskCount } from "@/lib/onboarding";
import { useI18n } from "@/lib/i18n";
import { inherentRisk, topicScore } from "@/lib/risk";
import { routes } from "@/lib/routes";
import { usePortal } from "@/lib/store";

export default function RiskTab() {
  const { db } = usePortal();
  const { t } = useI18n();
  const router = useRouter();
  const state = riskAssessmentState(db);
  const submitted = taskCount(db, "sustainability-risk") > 0;
  const levels = inherentRisk(db.profile.onboardingCategory);

  return (
    <>
      <h2>
        {t("Sustainability risk assessment")}
        {state === "required" && !submitted && (
          <>
            {" "}
            <button className="button primary" onClick={() => router.push(routes.task("sustainability-risk"))}>
              {t("Start assessment")}
            </button>
          </>
        )}
      </h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t("Risk area")}</th>
              <th>{t("Inherent risk")}</th>
              <th>{t("Assessment result")}</th>
              <th>{t("Assessment status")}</th>
            </tr>
          </thead>
          <tbody>
            {riskTopics.map(([key, label]) => {
              const isHigh = levels[key] === "High";
              const score = topicScore(key, db.onboarding.riskAssessment.answers);
              return (
                <tr key={key}>
                  <td>
                    <strong>{t(label)}</strong>
                  </td>
                  <td>
                    <Badge status={levels[key]} />
                  </td>
                  <td>{isHigh && submitted ? t("{correct}/{total} correct · {level}", { correct: score.correct, total: score.total, level: t(score.level) }) : "—"}</td>
                  <td>
                    <Badge status={!isHigh ? "Not required" : submitted ? "Completed" : "Pending"} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
