"use client";

import { Badge } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { usePortal } from "@/lib/store";

export default function SitesTab({ onAdd }: { onAdd: () => void }) {
  const { db } = usePortal();
  const { t } = useI18n();

  return (
    <>
      <h2>
        {t("Manufacturing sites")}{" "}
        <button className="button" onClick={onAdd}>
          ＋ {t("เพิ่มข้อมูลโรงงาน")}
        </button>
      </h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t("ลำดับ")}</th>
              <th>{t("ชื่อโรงงานผู้ผลิตสินค้า")}</th>
              <th>{t("ที่อยู่")}</th>
              <th>{t("พิกัด (ละติจูด, ลองจิจูด)")}</th>
              <th>{t("Status")}</th>
            </tr>
          </thead>
          <tbody>
            {db.profile.factories.map((f, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>
                  <strong>{t(f.name)}</strong>
                </td>
                <td>{t(f.location || [f.address, f.subdistrict, f.district, f.province, f.postal, f.country].filter(Boolean).join(" "))}</td>
                <td>{f.lat && f.lng ? `${f.lat}, ${f.lng}` : "—"}</td>
                <td>
                  <Badge status={f.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
