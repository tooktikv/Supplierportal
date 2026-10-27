"use client";

import { useState } from "react";
import { Badge } from "@/components/ui";
import { needsSample } from "@/lib/policy";
import { usePortal } from "@/lib/store";
import ProductModal, { productMain, type ProductRec } from "./ProductModal";

export default function ProductsTab() {
  const { db } = usePortal();
  const [open, setOpen] = useState<number | null>(null);
  const products = db.profile.products as ProductRec[];
  const selected = open === null ? null : products[open];

  return (
    <>
      <h2>Registered product categories</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Material group</th>
              <th>Catalog</th>
              <th>Sample requirement</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((x, i) => (
              <tr key={i}>
                <td>
                  <strong>{x.name}</strong>
                  {x.code && <small>Ref {x.code}</small>}
                </td>
                <td>{x.material || "—"}</td>
                <td>{x.files?.length ? `${x.files.length} file${x.files.length === 1 ? "" : "s"}` : "—"}</td>
                <td>{needsSample(productMain(x)) ? "Sample approval may be required" : "Not required"}</td>
                <td>
                  <Badge status={x.status} />
                </td>
                <td>
                  <button type="button" className="button small" onClick={() => setOpen(i)}>
                    View details
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
