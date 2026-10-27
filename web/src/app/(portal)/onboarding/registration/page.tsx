"use client";

import { useRouter } from "next/navigation";
import RegistrationWizard from "@/components/registration/RegistrationWizard";
import { PageHeading } from "@/components/ui";
import { routes } from "@/lib/routes";

export default function RegistrationPage() {
  const router = useRouter();
  const back = () => router.push(routes.onboarding);

  return (
    <>
      <div className="breadcrumbs" style={{ marginBottom: 11 }}>
        <button className="text-link" onClick={back}>
          Supplier Onboarding
        </button>{" "}
        / <strong>Registration</strong>
      </div>
      <PageHeading
        title="การลงทะเบียนข้อมูลผู้ขาย"
        desc="กรอกข้อมูลบริษัทเพื่อสร้างโปรไฟล์ผู้ขาย ระบบบันทึกอัตโนมัติ กลับมากรอกต่อได้ทุกเมื่อ"
        action={
          <button className="button" onClick={back}>
            ← กลับไปหน้า Onboarding
          </button>
        }
      />
      <RegistrationWizard />
    </>
  );
}
