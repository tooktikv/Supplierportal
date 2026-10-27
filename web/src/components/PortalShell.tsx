"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { routes } from "@/lib/routes";
import { registrationDone } from "@/lib/onboarding";
import { usePortal } from "@/lib/store";

const NAV = [
  { label: "Supplier Onboarding", icon: "✓", href: routes.onboarding, match: "/onboarding" },
  { label: "Sample Request", icon: "◫", href: routes.samples, match: "/sample-requests" },
  { label: "Company Profile", icon: "⌂", href: routes.profile, match: "/profile" },
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
  if (path.startsWith("/notifications")) return "Notifications";
  if (path.startsWith("/help")) return "Help & Support";
  return "Supplier Onboarding";
}

export default function PortalShell({ children }: { children: ReactNode }) {
  const { db, toasts, resetDemo } = usePortal();
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
            northstar<small>Supplier portal</small>
          </div>
        </div>
        <div className="company-mini">
          <span>SUPPLIER ACCOUNT</span>
          <strong>{db.profile.company}</strong>
        </div>
        <div className="nav-label">Workspace</div>
        <nav className="nav-list" aria-label="Main navigation">
          {NAV.map((item) => {
            const locked = !registered && item.href !== routes.onboarding;
            const active = pathname.startsWith(item.match);
            const body = (
              <>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {item.label === "Sample Request" && actionCount > 0 ? <span className="nav-count">{actionCount}</span> : null}
              </>
            );
            return locked ? (
              <button key={item.label} className="nav-item" disabled title="ต้องลงทะเบียนผู้ขายให้สำเร็จก่อน">
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
            <strong>Need a hand?</strong>
            <p>Our supplier support team is here to help with your onboarding.</p>
            <button onClick={() => router.push(routes.help)}>Contact support →</button>
          </div>
          <button
            className="text-link"
            style={{ padding: "0 7px 8px" }}
            onClick={() => {
              if (resetDemo()) router.push(routes.onboarding);
            }}
          >
            Reset fictional demo data
          </button>
          <div className="user-mini">
            <div className="avatar">MC</div>
            <div>
              <strong>{db.profile.contact}</strong>
              <small>Supplier administrator</small>
            </div>
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Open navigation" onClick={() => setMenuOpen(true)}>
            ☰
          </button>
          <div className="breadcrumbs">
            Supplier Portal <span> / </span> <strong>{pageName(pathname)}</strong>
          </div>
          <div className="top-actions">
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
        {toasts.map((t) => (
          <div className="toast" key={t.id}>
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}
