"use client";

import { Badge } from "@/components/ui";
import { usePortal } from "@/lib/store";
import ProfileEntryForm from "./ProfileEntryForm";

interface Props {
  adding: boolean;
  onAdd: () => void;
  onCancel: () => void;
  onSaved: () => void;
}

export default function ContactsTab({ adding, onAdd, onCancel, onSaved }: Props) {
  const { db, mutate, toast } = usePortal();

  const save = (v: Record<string, string>) => {
    mutate((draft) => {
      draft.profile.contacts.push({
        type: v.type,
        name: v.name.trim(),
        role: v.role.trim(),
        email: v.email.trim(),
        phone: v.phone.trim(),
        status: "Pending review",
      });
      if (v.type === "Company owner")
        Object.assign(draft.profile, { contact: v.name.trim(), email: v.email.trim(), phone: v.phone.trim() });
    });
    onSaved();
    toast("Profile information saved locally for this prototype.");
  };

  return (
    <>
      <h2>
        Contact persons{" "}
        <button className="button" onClick={onAdd}>
          ＋ Add contact
        </button>
      </h2>
      {adding && (
        <ProfileEntryForm
          submitLabel="Add contact"
          title="Add contact"
          onCancel={onCancel}
          onSubmit={save}
          fields={[
            { name: "type", label: "Contact type", value: "Contact person", type: ["Company owner", "Contact person", "Factory / manufacturer contact"] },
            { name: "name", label: "Contact name" },
            { name: "role", label: "Role / position" },
            { name: "email", label: "Business email", type: "email" },
            { name: "phone", label: "Phone number", type: "tel" },
          ]}
        />
      )}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Contact type</th>
              <th>Name</th>
              <th>Role</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {db.profile.contacts.map((c, i) => (
              <tr key={i}>
                <td>{c.type || (i === 0 ? "Company owner" : "Contact person")}</td>
                <td>
                  <strong>{c.name}</strong>
                </td>
                <td>{c.role}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>
                  <Badge status={c.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
