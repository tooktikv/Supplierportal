"use client";

import { useState } from "react";
import SiteModal from "@/components/SiteModal";
import { BuyerInterestBadge } from "@/components/BuyerInterest";
import { Badge, PageHeading } from "@/components/ui";
import { usePortal } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import CompanyInfoTab from "./CompanyInfoTab";
import ContactsTab from "./ContactsTab";
import DocumentModal, { type DocModalInit } from "./DocumentModal";
import DocumentsPanel from "./DocumentsPanel";
import ProductsTab from "./ProductsTab";
import RiskTab from "./RiskTab";
import SitesTab from "./SitesTab";

const TABS = ["Company information", "Contacts", "Manufacturing sites", "Important documents", "Products", "Risk assessment"];

export default function ProfilePage() {
  const { db } = usePortal();
  const { t } = useI18n();
  const p = db.profile;
  const [tab, setTab] = useState(TABS[0]);
  const [editing, setEditing] = useState(false);
  const [addingContact, setAddingContact] = useState(false);
  const [siteOpen, setSiteOpen] = useState(false);
  const [docFilter, setDocFilter] = useState("All");
  const [docModal, setDocModal] = useState<DocModalInit | null>(null);

  const showTab = (next: string) => {
    setTab(next);
    setEditing(false);
    setAddingContact(false);
    setSiteOpen(false);
    setDocModal(null);
  };

  return (
    <>
      <PageHeading title="Company Profile" desc="Your supplier account information is linked to your onboarding record." />
      <div className="card profile-banner">
        <div className="avatar">AS</div>
        <div>
          <h2>{p.company}</h2>
          <p>
            {t("Supplier ID {id}", { id: p.id })} · {p.site}
          </p>
        </div>
        <BuyerInterestBadge />
        <Badge status="Verified" />
      </div>
      <div className="profile-tabs" role="tablist">
        {TABS.map((name) => (
          <button key={name} className={`profile-tab ${tab === name ? "selected" : ""}`} role="tab" aria-selected={tab === name} onClick={() => showTab(name)}>
            {t(name)}
          </button>
        ))}
      </div>
      <div className="card detail-section profile-tab-content">
        {tab === "Company information" && (
          <CompanyInfoTab
            editing={editing}
            onEdit={() => {
              setEditing(true);
              setAddingContact(false);
            }}
            onCancel={() => setEditing(false)}
            onSaved={() => setEditing(false)}
          />
        )}
        {tab === "Contacts" && (
          <ContactsTab
            adding={addingContact}
            onAdd={() => {
              setAddingContact(true);
              setEditing(false);
            }}
            onCancel={() => setAddingContact(false)}
            onSaved={() => setAddingContact(false)}
          />
        )}
        {tab === "Manufacturing sites" && <SitesTab onAdd={() => setSiteOpen(true)} />}
        {tab === "Important documents" && <DocumentsPanel filter={docFilter} onFilter={setDocFilter} onOpen={setDocModal} />}
        {tab === "Products" && <ProductsTab />}
        {tab === "Risk assessment" && <RiskTab />}
        <div className="notice" style={{ margin: "18px 0 0" }}>
          {t("Profile changes and new records are saved in this browser for demonstration only; they are not submitted for approval.")}
        </div>
      </div>
      <SiteModal open={siteOpen} onClose={() => setSiteOpen(false)} />
      {docModal && <DocumentModal init={docModal} onClose={() => setDocModal(null)} />}
    </>
  );
}
