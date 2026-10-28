"use client";

import { useRouter } from "next/navigation";
import DemoFill from "@/components/DemoFill";
import { useConfirm } from "@/components/ConfirmDialog";
import { Footer, Section } from "@/components/srm/fields";
import { Badge } from "@/components/ui";
import { fillDemoRisk } from "@/lib/demo";
import { useI18n } from "@/lib/i18n";
import { highRiskTopics, riskAssessmentMessage, riskAssessmentState, riskTopics, taskCount } from "@/lib/onboarding";
import { inherentRisk, RISK_QUESTIONS, topicAnswered, topicScore } from "@/lib/risk";
import { routes } from "@/lib/routes";
import { usePortal } from "@/lib/store";

export default function RiskAssessment() {
  const { db, mutate, toast } = usePortal();
  const { t, lang } = useI18n();
  const router = useRouter();
  const confirm = useConfirm();
  const answers = db.onboarding.riskAssessment.answers;
  const levels = inherentRisk(db.profile.onboardingCategory);
  const high = highRiskTopics(db);
  const locked = taskCount(db, "sustainability-risk") >= 1;
  const totalQuestions = high.reduce((sum, topic) => sum + RISK_QUESTIONS[topic].length, 0);
  const answered = high.reduce((sum, topic) => sum + RISK_QUESTIONS[topic].filter((_, index) => Number.isInteger(answers[topic]?.[index])).length, 0);
  const complete = high.every((topic) => topicAnswered(topic, answers));
  const pick = (text: { en: string; th: string }) => (lang === "th" ? text.th : text.en);
  const labelOf = (key: string) => riskTopics.find(([topic]) => topic === key)?.[1] ?? key;

  const setAnswer = (topic: string, index: number, option: number) => {
    if (riskAssessmentState(db) !== "required") return toast(riskAssessmentMessage(db));
    if (locked || !high.includes(topic) || !RISK_QUESTIONS[topic]?.[index] || ![0, 1, 2].includes(option)) return;
    if (db.onboarding.riskAssessment.answers[topic]?.[index] === option) return;
    mutate((d) => void (d.onboarding.riskAssessment.answers[topic] = { ...d.onboarding.riskAssessment.answers[topic], [index]: option }));
  };

  const submit = async () => {
    if (riskAssessmentState(db) !== "required") return toast(riskAssessmentMessage(db));
    if (locked) return toast("The assessment has already been submitted.");
    if (!complete) return toast("Answer every question before submitting.");
    if (!(await confirm({ message: "Submit your sustainability risk assessment? You cannot change your answers after submitting.", confirmLabel: "Submit" }))) return;
    mutate((d) => {
      d.onboarding.riskAssessment.submittedAt = new Date().toISOString();
      d.onboarding.tasks["sustainability-risk"] = 1;
    });
    toast("Sustainability risk assessment submitted.");
    requestAnimationFrame(() => document.getElementById("risk-questions")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <div className="reg-main">
      {!locked && (
        <DemoFill
          onFill={() => {
            mutate(fillDemoRisk);
            requestAnimationFrame(() => document.getElementById("risk-questions")?.scrollIntoView({ behavior: "smooth", block: "start" }));
          }}
        />
      )}
      <div className="notice">
        {t("Demo only: Inherent Risk and the assessment score are calculated with mock rules, and the questions are illustrative. The real scoring rules and question bank were not provided.")}
      </div>

      <Section title="Inherent Risk result" hint="Calculated by the system from your product category. A topic assessment is required only for areas rated High.">
        <div className="reg-s4 risk-result">
          {riskTopics.map(([key, name]) => {
            const isHigh = levels[key] === "High";
            const note = isHigh ? t("Assessment required") : t("No assessment required");
            return (
              <div className="risk-result-row" key={key}>
                <strong>{t(name)}</strong>
                <Badge status={levels[key]} />
                <small>{note}</small>
              </div>
            );
          })}
        </div>
      </Section>

      <div id="risk-questions" style={{ scrollMarginTop: 80 }} />
      {high.map((topic, topicIndex) => {
        const score = topicScore(topic, answers);
        if (locked) {
          return (
            <Section key={topic} num={topicIndex + 1} title={labelOf(topic)} extra={<Badge status={score.level} />}>
              <div className="reg-s4">
                <div className={`quiz-summary ${score.level === "Low" ? "passed" : "needs-review"}`}>
                  <div className="quiz-score">
                    <strong>{score.correct}/{score.total}</strong>
                    <span>{Math.round((score.correct / score.total) * 100)}%</span>
                  </div>
                  <div className="quiz-summary-copy">
                    <h4>{t("Calculated risk level: {level}", { level: t(score.level) })}</h4>
                    <p>{t("Low: 4–5 correct · Medium: 3 correct · High: 2 or fewer")}</p>
                  </div>
                </div>
                <div className="quiz-breakdown">
                  {RISK_QUESTIONS[topic].map((item, index) => {
                    const ok = answers[topic]?.[index] === item.answer;
                    return (
                      <div className="quiz-breakdown-row" key={index}>
                        <span>{index + 1}. {pick(item.question)}</span>
                        <strong className={ok ? "correct-answer" : "incorrect-answer"}>{ok ? t("Correct") : t("Incorrect")}</strong>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Section>
          );
        }
        return (
          <Section
            key={topic}
            num={topicIndex + 1}
            title={labelOf(topic)}
            hint={t("{n} questions · choose one answer for each", { n: RISK_QUESTIONS[topic].length })}
            extra={<Badge status={topicAnswered(topic, answers) ? "Completed" : "Pending"} />}
          >
            {RISK_QUESTIONS[topic].map((item, index) => (
              <div className="form-field reg-field reg-s4" key={index}>
                <fieldset className="quiz-question risk-q">
                  <legend>
                    {index + 1}. {pick(item.question)} <span className="required">*</span>
                  </legend>
                  <div className="quiz-options">
                    {item.options.map((option, optionIndex) => {
                      const selected = answers[topic]?.[index] === optionIndex;
                      return (
                        <label className={`quiz-option ${selected ? "is-selected" : ""}`} key={optionIndex}>
                          <input type="radio" name={`risk-${topic}-${index}`} checked={selected} onChange={() => setAnswer(topic, index, optionIndex)} />
                          <span>{pick(option)}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              </div>
            ))}
          </Section>
        );
      })}

      {locked ? (
        <div className="card srm-footer">
          <button className="button" onClick={() => router.push(routes.task("sourcing-policy"))}>
            {t("Back")}
          </button>
          <button className="button primary" onClick={() => router.push(routes.onboarding)}>
            {t("Finish")}
          </button>
        </div>
      ) : (
        <Footer note={t("{answered} of {total} questions answered", { answered, total: totalQuestions })}>
          <button className="button primary" onClick={submit} disabled={!complete}>
            {t("Submit assessment")}
          </button>
        </Footer>
      )}
    </div>
  );
}
