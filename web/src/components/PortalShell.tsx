"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { routes } from "@/lib/routes";
import { BuyerInterestBadge } from "@/components/BuyerInterest";
import { registrationDone } from "@/lib/onboarding";
import { useI18n } from "@/lib/i18n";
import { usePortal } from "@/lib/store";

const ICONS: Record<string, ReactNode> = {
  onboarding: (<><rect x="8" y="2" width="8" height="4" rx="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="m9 14 2 2 4-4" /></>),
  samples: (<><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></>),
  profile: (<><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /><path d="M10 6h4M10 10h4M10 14h4M10 18h4" /></>),
  srm: (<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>),
};

function NavIcon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

const NAV = [
  { label: "Supplier Onboarding", icon: "onboarding", href: routes.onboarding, match: "/onboarding" },
  { label: "Sample Request", icon: "samples", href: routes.samples, match: "/sample-requests" },
  { label: "Company Profile", icon: "profile", href: routes.profile, match: "/profile" },
  { label: "Supplier Relationship Management", icon: "srm", href: routes.srm, match: "/srm" },
];

function pageName(path: string) {
  if (path === routes.registration) return "Supplier Registration";
  if (path.startsWith("/onboarding/tasks")) return "Onboarding Task";
  if (path.startsWith("/onboarding")) return "Supplier Onboarding";
  if (path === routes.newSample) return "Create Sample Request";
  if (path.startsWith("/sample-requests/") && path.endsWith("/submit")) return "Provide Sample Information";
  if (path.startsWith("/sample-requests/") && path.endsWith("/respond")) return "Provide Sample Information";
  if (path.startsWith("/sample-requests/")) return "Sample Request Details";
  if (path.startsWith("/sample-requests")) return "Sample Request";
  if (path.startsWith("/profile")) return "Company Profile";
  if (path.startsWith("/srm")) return "Supplier Relationship Management";
  if (path.startsWith("/notifications")) return "Notifications";
  if (path.startsWith("/help")) return "Help & Support";
  return "Supplier Onboarding";
}

export default function PortalShell({ children }: { children: ReactNode }) {
  const { db, toasts, resetDemo } = usePortal();
  const { t, lang, setLang } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const registered = registrationDone(db);

  // Same guards as the mock-up: other pages stay locked until registration is submitted.
  useEffect(() => {
    const allowedBeforeRegistration = pathname.startsWith("/onboarding") || pathname.startsWith("/help");
    if (!registered && !allowedBeforeRegistration) router.replace(routes.onboarding);
    if (registered && pathname === routes.registration) router.replace(routes.onboarding);
  }, [registered, pathname, router]);

  const actionCount = db.requests.filter((r) => ["Awaiting Submission", "Draft", "Action Required", "Resubmission Required"].includes(r.status)).length;

  return (
    <div className="shell">
      <div className={`mobile-overlay ${menuOpen ? "show" : ""}`} onClick={() => setMenuOpen(false)} />
      <aside
        className={`sidebar ${menuOpen ? "open" : ""}`}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a, button")) setMenuOpen(false);
        }}
      >
        <div className="brand">
          <div className="brand-mark">N</div>
          <div className="brand-name">
            northstar<small>{t("Supplier portal")}</small>
          </div>
        </div>
        <div className="company-mini">
          <span>{t("SUPPLIER ACCOUNT")}</span>
          <strong>{db.profile.company}</strong>
          <BuyerInterestBadge />
        </div>
        <div className="nav-label">{t("Workspace")}</div>
        <nav className="nav-list" aria-label={t("Main navigation")}>
          {NAV.map((item) => {
            const locked = !registered && item.href !== routes.onboarding;
            const active = pathname.startsWith(item.match);
            const body = (
              <>
                <span className="nav-icon"><NavIcon name={item.icon} /></span>
                {t(item.label)}
                {item.label === "Sample Request" && actionCount > 0 ? <span className="nav-count">{actionCount}</span> : null}
              </>
            );
            return locked ? (
              <button key={item.label} className="nav-item" disabled title={t("Complete supplier registration first.")}>
                {body}
              </button>
            ) : (
              <Link key={item.label} href={item.href} className={`nav-item ${active ? "active" : ""}`}>
                {body}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <strong>{t("Need a hand?")}</strong>
            <p>{t("Our supplier support team is here to help with your onboarding.")}</p>
            <button onClick={() => router.push(routes.help)}>{t("Contact support →")}</button>
          </div>
          <button
            className="text-link"
            style={{ padding: "0 7px 8px" }}
            onClick={async () => {
              if (await resetDemo()) router.push(routes.onboarding);
            }}
          >
            {t("Reset fictional demo data")}
          </button>
          <div className="user-mini">
            <div className="avatar">MC</div>
            <div>
              <strong>{db.profile.contact}</strong>
              <small>{t("Supplier administrator")}</small>
            </div>
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <button className="mobile-menu" aria-label={t("Open navigation")} onClick={() => setMenuOpen(true)}>
            ☰
          </button>
          <div className="breadcrumbs">
            {t("Supplier Portal")} <span> / </span> <strong>{t(pageName(pathname))}</strong>
          </div>
          <div className="top-actions">
            <div className="lang-switch" role="group" aria-label={t("Language")}>
              {(["en", "th"] as const).map((code) => (
                <button key={code} className={lang === code ? "selected" : ""} aria-pressed={lang === code} onClick={() => setLang(code)}>
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
            <button className="profile-button" onClick={() => router.push(routes.profile)}>
              <span className="avatar">MC</span>
              <span>{db.profile.contact}</span>⌄
            </button>
          </div>
        </header>
        <div className="content" id="content">
          {children}
        </div>
      </main>
      <div className="toast-region" aria-live="polite">
        {toasts.map((item) => (
          <div className="toast" key={item.id}>
            {t(item.text)}
          </div>
        ))}
      </div>
    </div>
  );
}
