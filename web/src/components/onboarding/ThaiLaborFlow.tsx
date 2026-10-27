"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import { thaiLaborItems } from "@/lib/data";
import { fmtDate } from "@/lib/docs";
import { routes } from "@/lib/routes";
import { usePortal } from "@/lib/store";
import DemoFill from "@/components/DemoFill";
import { fillDemoThaiLabor } from "@/lib/demo";
import MockPdf from "./MockPdf";

const TASK_ID = "thai-labor-standard";

export default function ThaiLaborFlow() {
  const { db, mutate, toast } = usePortal();
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
    toast(`Item ${item.id} accepted. Progress: ${Math.min(doneCount + 1, total)}/${total}.`);
  };

  return (
    <>
      {doneCount < total && <DemoFill onFill={() => mutate(fillDemoThaiLabor)} />}
      <div className="notice">Review one item at a time. You must accept each item before continuing, and you can go back to earlier items at any time. Progress is saved only in this browser.</div>
      <nav className="learning-stepper" aria-label="Learning items">
        {thaiLaborItems.map((entry, index) => (
          <button
            className={`learning-step ${index === activeStep ? "selected" : ""}`}
            key={entry.id}
            disabled={index > availableStep}
            aria-current={index === activeStep ? "step" : undefined}
            onClick={() => setStep(index)}
          >
            <span className="learning-step-number">{accepted[entry.id] ? "✓" : entry.id}</span>
            <span>{entry.title.replace(/^\d+\.\s*/, "")}</span>
          </button>
        ))}
      </nav>
      <div className="learning-modules">
        <article className="card learning-module">
          <div className="learning-module-heading">
            <div>
              <span className="eyebrow">ITEM {item.id}/{total} · {item.kind === "video" ? "VIDEO" : "PDF DOCUMENT"}</span>
              <h3 tabIndex={-1} ref={headingRef}>{item.title}</h3>
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
                  <strong>{item.title}</strong>
                  <p>Add the YouTube video ID in lib/data.ts to enable the in-page preview.</p>
                </>
              )}
            </div>
          ) : (
            <MockPdf title={item.title} fileName={item.fileName || "document.pdf"} pages={item.pages || 1} />
          )}
          <label className="commitment-row">
            <input id={`accept-${item.id}`} type="checkbox" checked={isAccepted} disabled={isAccepted} onChange={accept} />
            <span>I have {item.kind === "pdf" ? "read this document" : "watched this video"} and acknowledge it. (Accept {item.id})</span>
          </label>
          {isAccepted && <p className="mock-note">Accepted on {fmtDate(accepted[item.id])}</p>}
        </article>
      </div>
      <div className="wizard-footer learning-navigation">
        <button className="button" onClick={() => setStep(activeStep - 1)} disabled={activeStep === 0}>Back</button>
        <span className="mock-note">Item {activeStep + 1} of {total}</span>
        {activeStep < total - 1 ? (
          <button className="button primary" onClick={() => setStep(activeStep + 1)} disabled={!isAccepted}>Next →</button>
        ) : (
          <button className="button primary" onClick={() => router.push(routes.task("thai-labor-commitment"))} disabled={doneCount < total}>Continue to commitment letter →</button>
        )}
      </div>
    </>
  );
}
