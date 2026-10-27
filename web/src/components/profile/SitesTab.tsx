"use client";

import { Badge } from "@/components/ui";
import { usePortal } from "@/lib/store";

export default function SitesTab({ onAdd }: { onAdd: () => void }) {
  const { db } = usePortal();

  return (
    <>
      <h2>
        Manufacturing sites{" "}
        <button className="button" onClick={onAdd}>
          ＋ เพิ่มข้อมูลโรงงาน
        </button>
      </h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ลำดับ</th>
              <th>ชื่อโรงงานผู้ผลิตสินค้า</th>
              <th>ที่อยู่</th>
              <th>พิกัด (ละติจูด, ลองจิจูด)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {db.profile.factories.map((f, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>
                  <strong>{f.name}</strong>
                </td>
                <td>{f.location || [f.address, f.subdistrict, f.district, f.province, f.postal, f.country].filter(Boolean).join(" ")}</td>
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
