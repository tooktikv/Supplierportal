"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import { riskAssessmentMessage, riskAssessmentState, riskTopics, taskCount } from "@/lib/onboarding";
import { routes } from "@/lib/routes";
import { usePortal } from "@/lib/store";

export default function RiskTab() {
  const { db } = usePortal();
  const router = useRouter();
  const state = riskAssessmentState(db);

  let body;
  if (state !== "required") {
    body = (
      <div className="table-empty">
        <div className="empty-icon">◈</div>
        <h3>{state === "pending" ? "Pending questionnaire" : "Assessment not required"}</h3>
        <p>{riskAssessmentMessage(db)}</p>
        <button className="button" disabled>
          Assessment unavailable
        </button>
      </div>
    );
  } else if (taskCount(db, "sustainability-risk")) {
    body = (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Risk area</th>
              <th>Supplier response</th>
              <th>Assessment status</th>
            </tr>
          </thead>
          <tbody>
            {riskTopics.map(([key, label]) => (
              <tr key={key}>
                <td>
                  <strong>{label}</strong>
                </td>
                <td>{db.onboarding.riskAnswers[key] || "Not answered"}</td>
                <td>
                  <Badge status="Completed" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  } else {
    body = (
      <div className="table-empty">
        <div className="empty-icon">◈</div>
        <h3>Assessment not submitted</h3>
        <p>Complete the sustainability risk assessment task to see your saved responses.</p>
        <button className="button primary" onClick={() => router.push(routes.task("sustainability-risk"))}>
          Start assessment
        </button>
      </div>
    );
  }

  return (
    <>
      <h2>Sustainability risk assessment</h2>
      {body}
    </>
  );
}
