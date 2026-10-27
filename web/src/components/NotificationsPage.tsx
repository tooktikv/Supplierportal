"use client";

import { Badge, PageHeading } from "@/components/ui";
import { useSampleActions } from "@/components/sample-requests/useSampleActions";
import { fmtDate } from "@/lib/docs";
import { usePortal } from "@/lib/store";

const NOTIFY_STATUSES = ["Action Required", "Resubmission Required", "Approved", "Rejected", "Under Review"];

const titleFor = (status: string) =>
  status === "Action Required"
    ? "Response requested"
    : status === "Approved"
      ? "Evaluation completed"
      : status === "Rejected"
        ? "Evaluation result"
        : "Request status updated";

export default function NotificationsPage() {
  const { db } = usePortal();
  const { requestAction } = useSampleActions();
  const notes = db.requests.filter((r) => NOTIFY_STATUSES.includes(r.status)).sort((a, b) => b.updated.localeCompare(a.updated));

  return (
    <>
      <PageHeading title="Notifications" desc="Recent updates about your supplier onboarding and sample requests." />
      <div className="card section-card">
        <div className="activity-list">
          {notes.length ? (
            notes.map((r) => (
              <div className="activity" key={r.id}>
                <span className="activity-dot"></span>
                <div style={{ flex: 1 }}>
                  <strong>
                    {titleFor(r.status)} · {r.name}
                  </strong>
                  <small>
                    {r.id} · {fmtDate(r.updated)} · {r.feedback || `Status: ${r.status}`}
                  </small>
                </div>
                <Badge status={r.status} />
                <button className="text-link" onClick={() => requestAction(r.id)}>
                  View →
                </button>
              </div>
            ))
          ) : (
            <div className="table-empty">
              <div className="empty-icon">♧</div>
              <h3>You’re all caught up</h3>
              <p>There are no new supplier portal updates.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
