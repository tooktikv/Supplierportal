"use client";

import { useState } from "react";
import { Badge } from "@/components/ui";
import { needsSample } from "@/lib/policy";
import { useI18n } from "@/lib/i18n";
import { usePortal } from "@/lib/store";
import ProductModal, { productMain, type ProductRec } from "./ProductModal";

export default function ProductsTab() {
  const { db } = usePortal();
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(null);
  const products = db.profile.products as ProductRec[];
  const selected = open === null ? null : products[open];

  return (
    <>
      <h2>{t("Registered product categories")}</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t("Category")}</th>
              <th>{t("Material group")}</th>
              <th>{t("Catalog")}</th>
              <th>{t("Sample requirement")}</th>
              <th>{t("Status")}</th>
              <th>{t("Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((x, i) => (
              <tr key={i}>
                <td>
                  <strong>{t(x.name)}</strong>
                  {x.code && <small>{t("Ref {code}", { code: x.code })}</small>}
                </td>
                <td>{x.material ? t(x.material) : "—"}</td>
                <td>{x.files?.length ? t(x.files.length === 1 ? "{n} file" : "{n} files", { n: x.files.length }) : "—"}</td>
                <td>{needsSample(productMain(x)) ? t("Sample approval may be required") : t("Not required")}</td>
                <td>
                  <Badge status={x.status} />
                </td>
                <td>
                  <button type="button" className="button small" onClick={() => setOpen(i)}>
                    {t("View details")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && <ProductModal product={selected} onClose={() => setOpen(null)} />}
    </>
  );
}
