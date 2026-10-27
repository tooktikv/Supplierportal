"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import { learningLessons, learningQuestions, learningVideoId } from "@/lib/data";
import { fmtDate } from "@/lib/docs";
import { routes } from "@/lib/routes";
import { usePortal } from "@/lib/store";

interface QuizResult {
  score: number;
  passed: boolean;
  answers: Record<number, number>;
}

const STEP_TITLES = ["E-learning video", "Consent / Accept document", "Questionnaire"];

function StepHeading({ number, title, complete, available, headingRef }: { number: number; title: string; complete: boolean; available: boolean; headingRef: RefObject<HTMLHeadingElement | null> }) {
  return (
    <div className="learning-module-heading">
      <div>
        <span className="eyebrow">STEP {number}/3</span>
        <h3 id="learning-step-title" tabIndex={-1} ref={headingRef}>
          {title}
        </h3>
      </div>
      <Badge status={complete ? "Completed" : available ? "In Progress" : "Not Started"} />
    </div>
  );
}

export default function LearningFlow() {
  const { db, mutate, toast } = usePortal();
  const router = useRouter();
  const [consentChecked, setConsentChecked] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusOnStep = useRef(false);

  const flow = db.onboarding.learningFlow;
  const result = (flow.result as QuizResult | null) ?? null;
  const locked = !flow.consentAccepted;
  const completed = [Boolean(flow.videoCompleted), Boolean(flow.consentAccepted), Boolean(result?.passed)];
  const availableStep = flow.consentAccepted ? 2 : flow.videoCompleted ? 1 : 0;
  const activeStep = Number.isInteger(flow.step) ? Math.max(0, Math.min(flow.step as number, availableStep)) : availableStep;

  useEffect(() => {
    if (!focusOnStep.current) return;
    focusOnStep.current = false;
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ block: "start" });
  }, [activeStep]);

  const total = learningQuestions.length;
  const passMark = Math.ceil(total * 0.8);
  const answers = flow.answers as Record<number, number>;
  const allAnswered = learningQuestions.every((_, index) => Number.isInteger(answers[index]));

  const setStep = (step: number) => {
    if (!Number.isInteger(step) || step < 0 || step > availableStep) return toast("Complete the current activity before continuing.");
    focusOnStep.current = true;
    mutate((d) => void (d.onboarding.learningFlow.step = step));
  };

  const completeVideo = () => {
    if (flow.videoCompleted) return;
    mutate((d) => {
      d.onboarding.learningFlow.videoCompleted = true;
      d.onboarding.tasks["sourcing-policy"] = 1;
    });
    toast("Demo video completed. Progress: 1/3.");
  };

  const acceptConsent = () => {
    if (!flow.videoCompleted) return toast("Complete the e-learning video first.");
    if (flow.consentAccepted) return;
    if (!consentChecked) return toast("Confirm that you have read and accept the document.");
    mutate((d) => {
      const f = d.onboarding.learningFlow;
      f.consentAccepted = true;
      f.acceptedAt = new Date().toISOString();
      f.policyVersion = "1.0";
      d.onboarding.tasks["sourcing-policy"] = 2;
    });
    toast("Document accepted. Progress: 2/3.");
  };

  const setAnswer = (questionIndex: number, optionIndex: number) => {
    const question = learningQuestions[questionIndex];
    if (!flow.consentAccepted || flow.result) return;
    if (!question || optionIndex < 0 || optionIndex >= question.options.length) return;
    mutate((d) => void (d.onboarding.learningFlow.answers[questionIndex] = optionIndex));
  };

  const submitLesson = () => {
    if (!flow.videoCompleted || !flow.consentAccepted || flow.result) return;
    if (learningQuestions.some((q, index) => !Number.isInteger(answers[index]) || !q.options[answers[index]])) return;
    const score = learningQuestions.reduce((sum, q, index) => sum + (answers[index] === q.answer ? 1 : 0), 0);
    const passed = score >= Math.ceil(learningQuestions.length * 0.8);
    mutate((d) => {
      const f = d.onboarding.learningFlow;
      f.quizVersion = 2;
      f.result = { score, passed, answers: { ...f.answers } };
      d.onboarding.tasks["sourcing-policy"] = passed ? 3 : 2;
    });
  };

  const retryLesson = () => {
    if (!flow.result || flow.result.passed) return;
    mutate((d) => {
      d.onboarding.learningFlow.result = null;
      d.onboarding.learningFlow.answers = {};
    });
  };

  let section: ReactNode;
  if (activeStep === 0) {
    section = (
      <article className="card learning-module">
        <StepHeading number={1} title="E-learning video" complete={completed[0]} available headingRef={headingRef} />
        <div className="learning-video-placeholder">
          {learningVideoId ? (
            <iframe
              className="learning-video-embed"
              title="Sustainable Sourcing Policy and Supplier Guiding Principles video"
              src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(learningVideoId)}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <>
              <span aria-hidden="true">▶</span>
              <strong>Sustainable Sourcing Policy and Supplier Guiding Principles</strong>
              <p>Add the course YouTube video ID in lib/data.ts to enable the in-page preview.</p>
            </>
          )}
        </div>
        <button className="button primary" onClick={completeVideo} disabled={flow.videoCompleted}>
          {flow.videoCompleted ? "Video demo completed" : "Mark video complete (demo)"}
        </button>
      </article>
    );
  } else if (activeStep === 1) {
    section = (
      <article className="card learning-module">
        <StepHeading number={2} title="Consent / Accept document" complete={completed[1]} available={Boolean(flow.videoCompleted)} headingRef={headingRef} />
        <h4>Sustainable Sourcing Policy and Supplier Guiding Principles</h4>
        <div className="policy-document policy-preview" role="region" aria-label="Sustainable sourcing policy preview">
          {learningLessons.map((lesson) => (
            <div key={lesson.id}>
              <h4>{lesson.title}</h4>
              <p className="lesson-summary">{lesson.summary}</p>
              <ul className="lesson-points">
                {lesson.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
          <p className="mock-note">Original prototype policy summary, not an official policy or legal agreement.</p>
        </div>
        <label className="commitment-row">
          <input
            id="policy-consent"
            type="checkbox"
            checked={Boolean(flow.consentAccepted) || consentChecked}
            disabled={!flow.videoCompleted || flow.consentAccepted}
            onChange={(e) => setConsentChecked(e.target.checked)}
          />
          <span>I have read and accept the Sustainable Sourcing Policy and Supplier Guiding Principles (mock version 1.0).</span>
        </label>
        <button className="button primary" onClick={acceptConsent} disabled={!consentChecked || !flow.videoCompleted || flow.consentAccepted}>
          {flow.consentAccepted ? "Document accepted" : "Accept document"}
        </button>
        {flow.consentAccepted && <p className="mock-note">Accepted on {fmtDate(flow.acceptedAt)} · Mock version 1.0</p>}
      </article>
    );
  } else {
    section = (
      <article className="card learning-module">
        <StepHeading number={3} title="Questionnaire" complete={completed[2]} available={!locked} headingRef={headingRef} />
        {result ? (
          <>
            <div className={`quiz-summary ${result.passed ? "passed" : "needs-review"}`}>
              <div className="quiz-score">
                <strong>
                  {result.score}/{total}
                </strong>
                <span>{Math.round((result.score / total) * 100)}%</span>
              </div>
              <div className="quiz-summary-copy">
                <h4>{result.passed ? "Questionnaire passed" : "Not passed"}</h4>
                <p>
                  Pass mark: {passMark}/{total} (80%)
                </p>
              </div>
            </div>
            <div className="quiz-breakdown">
              {learningQuestions.map((question, index) => {
                const ok = result.answers[index] === question.answer;
                return (
                  <div className="quiz-breakdown-row" key={question.text}>
                    <span>
                      {index + 1}. {question.text}
                    </span>
                    <strong className={ok ? "correct-answer" : "incorrect-answer"}>{ok ? "Correct" : "Incorrect"}</strong>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <p className="lesson-summary">Questions from Sustainable Sourcing Policy and Supplier Guiding Principles.</p>
            <div className="quiz-heading">
              <h4>Knowledge check · {total} questions</h4>
              <span>
                Pass mark: {passMark}/{total} (80%)
              </span>
            </div>
            {learningQuestions.map((question, index) => (
              <fieldset className="quiz-question" disabled={locked} key={question.text}>
                <legend>
                  {index + 1}. {question.text}
                </legend>
                <div className="quiz-options">
                  {question.options.map((option, optionIndex) => (
                    <label className="quiz-option" key={option}>
                      <input type="radio" name={`policy-q${index}`} value={optionIndex} checked={answers[index] === optionIndex} onChange={() => setAnswer(index, optionIndex)} />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
            <button className="button primary" onClick={submitLesson} disabled={locked || !allAnswered}>
              Submit answers
            </button>
          </>
        )}
        {result && !result.passed && (
          <button className="button primary" onClick={retryLesson}>
            Try again
          </button>
        )}
      </article>
    );
  }

  return (
    <>
      <div className="notice">Complete one activity at a time, then select Next. Progress and answers are saved only in this browser for this fictional course.</div>
      <nav className="learning-stepper" aria-label="Learning steps">
        {STEP_TITLES.map((title, index) => (
          <button
            className={`learning-step ${index === activeStep ? "selected" : ""}`}
            key={title}
            disabled={index > availableStep}
            aria-current={index === activeStep ? "step" : undefined}
            onClick={() => setStep(index)}
          >
            <span className="learning-step-number">{completed[index] ? "✓" : index + 1}</span>
            <span>{title}</span>
          </button>
        ))}
      </nav>
      <div className="learning-modules">{section}</div>
      <div className="wizard-footer learning-navigation">
        <button className="button" onClick={() => setStep(activeStep - 1)} disabled={activeStep === 0}>
          Back
        </button>
        <span className="mock-note">Step {activeStep + 1} of 3</span>
        {activeStep < 2 ? (
          <button className="button primary" onClick={() => setStep(activeStep + 1)} disabled={!completed[activeStep]}>
            Next →
          </button>
        ) : (
          <button className="button primary" onClick={() => router.push(routes.onboarding)} disabled={!result?.passed}>
            Finish
          </button>
        )}
      </div>
    </>
  );
}
