"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import { thaiLaborItems } from "@/lib/data";
import { fmtDate } from "@/lib/docs";
import { useI18n } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { usePortal } from "@/lib/store";
import DemoFill from "@/components/DemoFill";
import { useConfirm } from "@/components/ConfirmDialog";
import { fillDemoThaiLabor } from "@/lib/demo";
import MockPdf from "./MockPdf";

const TASK_ID = "thai-labor-standard";

export default function ThaiLaborFlow() {
  const { db, mutate, toast } = usePortal();
  const { t } = useI18n();
  const confirm = useConfirm();
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const flow = db.onboarding.thaiLabor as { accepted: Record<number, string>; step?: number };
  const accepted = flow.accepted || {};
  const total = thaiLaborItems.length;
  const doneCount = thaiLaborItems.filter((item) => accepted[item.id]).length;
  const availableStep = Math.min(doneCount, total - 1);
  const activeStep = Number.isInteger(flow.step) ? Math.max(0, Math.min(flow.step as number, availableStep)) : availableStep;
  const item = thaiLaborItems[activeStep];
  const isAccepted = Boolean(accepted[item.id]);

  const setStep = (step: number) => {
    if (step < 0 || step > availableStep) return toast("Accept the current item before continuing.");
    mutate((d) => void (d.onboarding.thaiLabor.step = step));
    headingRef.current?.focus({ preventScroll: true });
  };

  const accept = () => {
    if (isAccepted) return;
    mutate((d) => {
      d.onboarding.thaiLabor.step = activeStep;
      d.onboarding.thaiLabor.accepted[item.id] = new Date().toISOString();
      d.onboarding.tasks[TASK_ID] = Object.keys(d.onboarding.thaiLabor.accepted).length;
    });
    toast(t("Item {id} accepted. Progress: {n}/{total}.", { id: item.id, n: Math.min(doneCount + 1, total), total }));
  };

  return (
    <>
      {doneCount < total && <DemoFill onFill={() => mutate(fillDemoThaiLabor)} />}
      <div className="notice">{t("Review one item at a time. You must accept each item before continuing, and you can go back to earlier items at any time. Progress is saved only in this browser.")}</div>
      <nav className="learning-stepper" aria-label={t("Learning items")}>
        {thaiLaborItems.map((entry, index) => (
          <button
            className={`learning-step ${index === activeStep ? "selected" : ""}`}
            key={entry.id}
            disabled={index > availableStep}
            aria-current={index === activeStep ? "step" : undefined}
            onClick={() => setStep(index)}
          >
            <span className="learning-step-number">{accepted[entry.id] ? "✓" : entry.id}</span>
            <span>{t(entry.title).replace(/^\d+\.\s*/, "")}</span>
          </button>
        ))}
      </nav>
      <div className="learning-modules">
        <article className="card learning-module">
          <div className="learning-module-heading">
            <div>
              <span className="eyebrow">{t("ITEM {id}/{total}", { id: item.id, total })} · {item.kind === "video" ? t("VIDEO") : t("PDF DOCUMENT")}</span>
              <h3 tabIndex={-1} ref={headingRef}>{t(item.title)}</h3>
            </div>
            <Badge status={isAccepted ? "Completed" : "In Progress"} />
          </div>
          {item.kind === "video" ? (
            <div className="learning-video-placeholder">
              {item.videoId ? (
                <iframe
                  className="learning-video-embed"
                  title={item.title}
                  src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(item.videoId)}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              ) : (
                <>
                  <span aria-hidden="true">▶</span>
                  <strong>{t(item.title)}</strong>
                  <p>{t("Add the YouTube video ID in lib/data.ts to enable the in-page preview.")}</p>
                </>
              )}
            </div>
          ) : (
            <MockPdf title={t(item.title)} fileName={item.fileName || "document.pdf"} pages={item.pages || 1} />
          )}
          <label className="commitment-row">
            <input id={`accept-${item.id}`} type="checkbox" checked={isAccepted} disabled={isAccepted} onChange={accept} />
            <span>{item.kind === "pdf" ? t("I have read this document and acknowledge it. (Accept {id})", { id: item.id }) : t("I have watched this video and acknowledge it. (Accept {id})", { id: item.id })}</span>
          </label>
          {isAccepted && <p className="mock-note">{t("Accepted on {date}", { date: fmtDate(accepted[item.id]) })}</p>}
        </article>
      </div>
      <div className="wizard-footer learning-navigation">
        <button className="button" onClick={() => setStep(activeStep - 1)} disabled={activeStep === 0}>{t("Back")}</button>
        <span className="mock-note">{t("Item {n} of {total}", { n: activeStep + 1, total })}</span>
        {activeStep < total - 1 ? (
          <button className="button primary" onClick={() => setStep(activeStep + 1)} disabled={!isAccepted}>{t("Next →")}</button>
        ) : (
          <button
            className="button primary"
            onClick={async () => {
              if (!(await confirm({ message: "Submit your TLS e-Learning?", confirmLabel: "Submit" }))) return;
              toast("TLS e-Learning completed.");
              router.push(routes.onboarding);
            }}
            disabled={doneCount < total}
          >
            {t("Submit")}
          </button>
        )}
      </div>
    </>
  );
}
