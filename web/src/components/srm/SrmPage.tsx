"use client";

import { useState } from "react";
import { PageHeading } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import GhgTab from "./GhgTab";
import GovernanceTab from "./GovernanceTab";
import HumanRightsTab from "./HumanRightsTab";
import ProjectTab from "./ProjectTab";

const TABS = ["Project Management", "GHG Emission Reduction", "Human Rights", "Governance"] as const;

export default function SrmPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Project Management");

  return (
    <>
      <PageHeading title={t("Supplier Relationship Management")} desc={t("Report projects and sustainability information: GHG emission reduction, human rights and governance.")} />
      <div className="document-tabs" role="tablist" aria-label={t("SRM sections")}>
        {TABS.map((name) => (
          <button key={name} className={`document-tab ${tab === name ? "selected" : ""}`} role="tab" aria-selected={tab === name} onClick={() => setTab(name)}>
            {t(name)}
          </button>
        ))}
      </div>
      {tab === "Project Management" && <ProjectTab />}
      {tab === "GHG Emission Reduction" && <GhgTab />}
      {tab === "Human Rights" && <HumanRightsTab />}
      {tab === "Governance" && <GovernanceTab />}
    </>
  );
}
