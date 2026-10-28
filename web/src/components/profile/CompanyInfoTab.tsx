"use client";

import { InfoItem } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { usePortal } from "@/lib/store";
import ProfileEntryForm from "./ProfileEntryForm";

interface Props {
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSaved: () => void;
}

export default function CompanyInfoTab({ editing, onEdit, onCancel, onSaved }: Props) {
  const { db, mutate, toast } = usePortal();
  const { t } = useI18n();
  const p = db.profile;

  const save = (v: Record<string, string>) => {
    mutate((draft) => {
      Object.assign(draft.profile, {
        company: v.company.trim(),
        registration: v.registration.trim(),
        contact: v.contact.trim(),
        email: v.email.trim(),
        phone: v.phone.trim(),
        site: v.site.trim(),
      });
      const first = draft.profile.contacts[0];
      if (first) Object.assign(first, { name: draft.profile.contact, email: draft.profile.email, phone: draft.profile.phone });
    });
    onSaved();
    toast("Profile information saved locally for this prototype.");
  };

  return (
    <>
      <h2>
        {t("Company information")}{" "}
        {!editing && (
          <button className="button" onClick={onEdit}>
            {t("Edit information")}
          </button>
        )}
      </h2>
      {editing ? (
        <ProfileEntryForm
          submitLabel="Save changes"
          onCancel={onCancel}
          onSubmit={save}
          fields={[
            { name: "company", label: "Supplier company", value: p.company },
            { name: "registration", label: "Registration number", value: p.registration },
            { name: "contact", label: "Company owner / primary contact", value: p.contact },
            { name: "email", label: "Business email", value: p.email, type: "email" },
            { name: "phone", label: "Phone", value: p.phone, type: "tel" },
            { name: "site", label: "Registered address", value: p.site },
          ]}
        />
      ) : (
        <div className="info-grid">
          <InfoItem label="Supplier company" value={p.company} />
          <InfoItem label="Supplier ID" value={p.id} />
          <InfoItem label="Registration number" value={p.registration} />
          <InfoItem label="Company owner / primary contact" value={p.contact} />
          <InfoItem label="Email" value={p.email} />
          <InfoItem label="Phone" value={p.phone} />
          <InfoItem label="Registered address" value={p.site} />
          <InfoItem label="Product categories" value={p.categories.map((category) => t(category)).join(", ")} />
        </div>
      )}
    </>
  );
}
