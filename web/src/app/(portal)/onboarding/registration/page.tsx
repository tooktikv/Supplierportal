"use client";

import { useRouter } from "next/navigation";
import RegistrationWizard from "@/components/registration/RegistrationWizard";
import { PageHeading } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { routes } from "@/lib/routes";

export default function RegistrationPage() {
  const router = useRouter();
  const { t } = useI18n();
  const back = () => router.push(routes.onboarding);

  return (
    <>
      <div className="breadcrumbs" style={{ marginBottom: 11 }}>
        <button className="text-link" onClick={back}>
          {t("Supplier Onboarding")}
        </button>{" "}
        / <strong>{t("Registration")}</strong>
      </div>
      <PageHeading
        title="Supplier information registration"
        desc="Enter your company information to create your supplier profile. Your progress is saved automatically, so you can continue any time."
        action={
          <button className="button" onClick={back}>
            {t("← กลับไปหน้า Onboarding")}
          </button>
        }
      />
      <RegistrationWizard />
    </>
  );
}
