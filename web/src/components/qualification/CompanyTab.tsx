"use client";

import { useRouter } from "next/navigation";
import { Badge, InfoItem } from "@/components/ui";
import { fmtDate } from "@/lib/docs";
import { useI18n } from "@/lib/i18n";
import { latestSubmission, profileErrors, profileSnapshot } from "@/lib/qsl";
import { routes } from "@/lib/routes";
import { usePortal } from "@/lib/store";
import type { TabCtx } from "./ctx";
import { Block } from "./parts";

function expiryBadge(expiry: string) {
  if (!expiry) return "Current";
  const days = (new Date(`${expiry}T23:59:59`).getTime() - Date.now()) / 864e5;
  return days < 0 ? "Expired" : days <= 30 ? "Expiring Soon" : "Current";
}

/** Read-only view of the Shared Supplier Profile. Edits happen in Company Profile so there is one record per supplier. */
export default function CompanyTab({ ctx }: { ctx: TabCtx }) {
  const { db } = usePortal();
  const { t } = useI18n();
  const router = useRouter();
  const profile = profileSnapshot(db);
  const missing = profileErrors(db);
  const last = latestSubmission(ctx.request);
  const covers = profile.categories.some((item) => item.main === ctx.request.productCategory || item.name === ctx.request.productCategory);

  return (
    <div className="reg-main">
      <div className={`notice ${missing.length ? "warning" : ""}`}>
        {missing.length ? <>{missing.map((message) => <div key={message}>{t(message)}</div>)}</> : t("Your Shared Supplier Profile has the information this request needs.")}
        {" "}<button className="text-link" onClick={() => router.push(routes.profile)}>{t("Edit in Company Profile")} →</button>
        {last ? <div>{t("Submission {ref} keeps a snapshot taken on {date}. Later profile changes do not alter it.", { ref: last.ref, date: fmtDate(last.submittedAt) })}</div> : null}
      </div>
      <Block title="Company">
        <div className="info-grid">
          <InfoItem label="Company" value={profile.company} />
          <InfoItem label="Supplier ID" value={profile.supplierId} />
          <InfoItem label="Registration number" value={profile.registration} />
        </div>
      </Block>
      <Block title="Manufacturing sites">
        <div className="table-wrap"><table style={{ minWidth: 520 }}>
          <thead><tr>{["Site", "Location", "Type"].map((h) => <th key={h}>{t(h)}</th>)}</tr></thead>
          <tbody>{profile.sites.map((site) => <tr key={site.name}><td><strong>{site.name}</strong></td><td>{site.location}</td><td>{t(site.type)}</td></tr>)}</tbody>
        </table>{profile.sites.length === 0 && <div className="table-empty"><p>{t("No manufacturing site in your profile.")}</p></div>}</div>
      </Block>
      <Block title="Product and service categories" extra={<span className={`status ${covers ? "green" : "amber"}`}>{t(covers ? "Covers this request" : "Not in your profile")}</span>}>
        <div className="table-wrap"><table style={{ minWidth: 520 }}>
          <thead><tr>{["Category", "Main group", "Sub group"].map((h) => <th key={h}>{t(h)}</th>)}</tr></thead>
          <tbody>{profile.categories.map((item) => <tr key={item.name}><td><strong>{t(item.name)}</strong></td><td>{item.main}</td><td>{item.sub}</td></tr>)}</tbody>
        </table></div>
        <p className="mock-note" style={{ marginTop: 10 }}>{covers ? t("Your profile covers the requested category: {category}.", { category: t(ctx.request.productCategory) }) : t("The requested category {category} is not listed in your profile yet.", { category: t(ctx.request.productCategory) })}</p>
      </Block>
      <Block title="Certifications and supporting documents">
        <div className="table-wrap"><table style={{ minWidth: 520 }}>
          <thead><tr>{["Document", "Type", "Expiry date", "Status"].map((h) => <th key={h}>{t(h)}</th>)}</tr></thead>
          <tbody>{profile.certifications.map((item) => <tr key={`${item.name}-${item.type}`}><td><strong>{item.name}</strong></td><td>{t(item.type)}</td><td>{item.expiry ? fmtDate(item.expiry) : "—"}</td><td><Badge status={expiryBadge(item.expiry)} /></td></tr>)}</tbody>
        </table>{profile.certifications.length === 0 && <div className="table-empty"><p>{t("No certification on file.")}</p></div>}</div>
      </Block>
      <Block title="Contacts">
        <div className="table-wrap"><table style={{ minWidth: 520 }}>
          <thead><tr>{["Name", "Role", "Email"].map((h) => <th key={h}>{t(h)}</th>)}</tr></thead>
          <tbody>{profile.contacts.map((item) => <tr key={item.email}><td><strong>{item.name}</strong></td><td>{item.role}</td><td>{item.email}</td></tr>)}</tbody>
        </table></div>
      </Block>
    </div>
  );
}
