"use client";

import { Badge } from "@/components/ui";
import { docSource, docVersions, documentStatus, fmtDate, latestUpload } from "@/lib/docs";
import { useI18n } from "@/lib/i18n";
import { usePortal } from "@/lib/store";
import type { DocModalInit } from "./DocumentModal";

const TABS = ["All", "Under Review", "Approved", "Expiring Soon", "Expired", "Required"];

interface Props {
  filter: string;
  onFilter: (tab: string) => void;
  onOpen: (init: DocModalInit) => void;
}

export default function DocumentsPanel({ filter, onFilter, onOpen }: Props) {
  const { db } = usePortal();
  const { t } = useI18n();
  const rows = db.documents.filter((doc) => filter === "All" || documentStatus(doc) === filter);

  return (
    <>
      <h2>
        {t("Important company documents")}{" "}
        <button className="button" onClick={() => onOpen({ doc: null, v: 0, upload: { name: "", type: "", fixed: false } })}>
          ＋ {t("Add document")}
        </button>
      </h2>
      <div className="document-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`document-tab ${filter === tab ? "selected" : ""}`}
            role="tab"
            aria-selected={filter === tab}
            onClick={() => onFilter(tab)}
          >
            {t(tab)}
            <span>{tab === "All" ? db.documents.length : db.documents.filter((d) => documentStatus(d) === tab).length}</span>
          </button>
        ))}
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t("Document name")}</th>
              <th>{t("Upload source")}</th>
              <th>{t("Document type")}</th>
              <th>{t("Latest upload")}</th>
              <th>{t("Expiry")}</th>
              <th>{t("Status")}</th>
              <th>{t("Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => {
              const i = db.documents.indexOf(d);
              const count = docVersions(d).length;
              return (
                <tr key={i}>
                  <td>
                    <strong>{t(d.name)}</strong>
                    {count ? (
                      <small>
                        {t(count === 1 ? "{n} version" : "{n} versions", { n: count })}
                      </small>
                    ) : null}
                  </td>
                  <td>{t(docSource(d))}</td>
                  <td>{t(d.type)}</td>
                  <td>{fmtDate(latestUpload(d))}</td>
                  <td>{fmtDate(d.expiry === "—" ? "" : d.expiry)}</td>
                  <td>
                    <Badge status={documentStatus(d)} />
                  </td>
                  <td>
                    {count ? (
                      <button className="button small" onClick={() => onOpen({ doc: i, v: count - 1, upload: null })}>
                        {t("View")}
                      </button>
                    ) : (
                      <button
                        className="button small primary"
                        onClick={() => onOpen({ doc: i, v: 0, upload: { name: d.name, type: d.type, fixed: true } })}
                      >
                        {t("Upload")}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="table-empty">
            <div className="empty-icon">▤</div>
            <h3>{t("No documents in this category")}</h3>
            <p>{t("There are currently no matching supplier documents.")}</p>
          </div>
        )}
      </div>
      <div className="table-footer">
        <span>
          {t("Showing {n} of {total} supplier documents", { n: rows.length, total: db.documents.length })}
        </span>
        <span>{t("Mock document records")}</span>
      </div>
    </>
  );
}
