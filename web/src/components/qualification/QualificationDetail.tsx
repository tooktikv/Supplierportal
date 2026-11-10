"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { currentResponse, displayOutcome, editScope, validateResponse } from "@/lib/qsl";
import { editResponse, getRequest } from "@/lib/qsl-service";
import { routes } from "@/lib/routes";
import CompanyTab from "./CompanyTab";
import { TABS, type TabCtx, type TabKey } from "./ctx";
import EvidenceTab from "./EvidenceTab";
import HistoryTab from "./HistoryTab";
import OverviewTab from "./OverviewTab";
import { OutcomeBadge } from "./parts";
import RateCardTab from "./RateCardTab";
import ResultTab from "./ResultTab";
import SubmitBar from "./SubmitBar";
import { useQsl } from "./useQsl";

export default function QualificationDetail({ id }: { id: string }) {
  const { db, run, allowed } = useQsl();
  const { t } = useI18n();
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("Overview");
  const [showErrors, setShowErrors] = useState(false);
  // Ownership is checked inside getRequest: another supplier's id resolves to nothing.
  const request = getRequest(db, id);

  useEffect(() => {
    if (!request) router.replace(routes.qualification);
  }, [request, router]);

  if (!request) return null;
  const response = currentResponse(request);
  const scope = editScope(request);
  const ctx: TabCtx = {
    request, response, scope,
    validation: validateResponse(db, request, response),
    canEdit: allowed("edit") && scope !== null,
    canUpload: allowed("upload") && scope !== null,
    canSubmit: allowed("submit") && scope !== null,
    showErrors,
    edit: (change) => run((draft) => editResponse(draft, id, change)).ok,
    goTab: setTab,
    reveal: () => setShowErrors(true),
  };
  const outcome = displayOutcome(request);

  return (
    <>
      <div className="detail-top">
        <div>
          <div className="breadcrumbs" style={{ marginBottom: 11 }}>
            <button className="text-link" onClick={() => router.push(routes.qualification)}>{t("Qualification")}</button> / {request.id}
          </div>
          <div className="detail-title">
            <h1>{t(request.productCategory)}</h1>
            <Badge status={request.status} />
            {outcome && <OutcomeBadge outcome={outcome} />}
          </div>
          <p style={{ color: "var(--muted)", fontSize: 11, margin: "6px 0 0" }}>{request.id} · {request.buyer} · {request.scope}</p>
        </div>
        <div className="footer-right">
          {ctx.canEdit ? <button className="button primary" onClick={() => setTab("Rate card")}>{t("Open rate card")}</button> : <button className="button" onClick={() => router.push(routes.qualification)}>{t("Back to list")}</button>}
        </div>
      </div>
      <div className="document-tabs" role="tablist" aria-label={t("Qualification sections")}>
        {TABS.map((name) => (
          <button key={name} className={`document-tab ${tab === name ? "selected" : ""}`} role="tab" aria-selected={tab === name} onClick={() => setTab(name)}>{t(name)}</button>
        ))}
      </div>
      {tab === "Overview" && <OverviewTab ctx={ctx} />}
      {tab === "Rate card" && <><RateCardTab ctx={ctx} />{ctx.canEdit && <div style={{ marginTop: 16 }}><SubmitBar ctx={ctx} /></div>}</>}
      {tab === "Evidence" && <EvidenceTab ctx={ctx} />}
      {tab === "Company & capability" && <CompanyTab ctx={ctx} />}
      {tab === "Result" && <ResultTab ctx={ctx} />}
      {tab === "History" && <HistoryTab ctx={ctx} />}
    </>
  );
}
