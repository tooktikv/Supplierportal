"use client";

import { riskAssessmentMessage, riskAssessmentState, riskTopics } from "@/lib/onboarding";
import { usePortal } from "@/lib/store";

const LEVELS = ["Low", "Medium", "High"];

export default function RiskAssessment() {
  const { db, mutate, toast } = usePortal();
  const answers = db.onboarding.riskAnswers;
  const count = Object.keys(answers).filter((k) => answers[k]).length;

  const setAnswer = (key: string, value: string) => {
    if (riskAssessmentState(db) !== "required") return toast(riskAssessmentMessage(db));
    if (!riskTopics.some(([topic]) => topic === key) || ![...LEVELS, ""].includes(value)) return;
    mutate((d) => void (d.onboarding.riskAnswers[key] = value));
  };

  const submit = () => {
    if (riskAssessmentState(db) !== "required") return toast(riskAssessmentMessage(db));
    if (riskTopics.some(([key]) => !LEVELS.includes(answers[key]))) return toast("Assess every topic before saving.");
    mutate((d) => void (d.onboarding.tasks["sustainability-risk"] = 1));
    toast("Mock risk assessment saved.");
  };

  return (
    <>
      <div className="notice">
        Demo only: select a risk level for each topic. The supplied requirements call for a system-calculated Inherent Risk result and topic quizzes, but no upstream scoring rules or quiz content were provided.
      </div>
      <div className="card table-card risk-table">
        <div className="risk-header">
          <span>Risk topic</span>
          <span>Risk level · demo</span>
        </div>
        {riskTopics.map(([key, label]) => (
          <div className="risk-row" key={key}>
            <strong>{label}</strong>
            <select className="field-control" aria-label={label} value={answers[key] || ""} onChange={(e) => setAnswer(key, e.target.value)}>
              <option value="">Select a level</option>
              {LEVELS.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <div className="wizard-footer">
        <small className="mock-note">
          {count} of {riskTopics.length} topics assessed
        </small>
        <button className="button primary" onClick={submit} disabled={count < riskTopics.length}>
          Save assessment
        </button>
      </div>
    </>
  );
}
