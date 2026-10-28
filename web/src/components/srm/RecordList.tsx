"use client";

import type { ReactNode } from "react";
import { Badge } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { dmy } from "@/lib/srm";

export interface RecordRow {
  id: string;
  cells: ReactNode[];
  updated: string;
  status: string;
}

/** Shared list view for SRM records: toolbar with a create button, table with Edit / Delete, and an empty state. */
export default function RecordList({ title, description, addLabel, headings, rows, emptyTitle, emptyText, onAdd, onEdit, onDelete }: {
  title: string;
  description: string;
  addLabel: string;
  headings: string[];
  rows: RecordRow[];
  emptyTitle: string;
  emptyText: string;
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="card table-card">
      <div className="srm-toolbar">
        <div><h2>{t(title)}</h2><small>{t(description)}</small></div>
        <button className="button primary" onClick={onAdd}>{t(addLabel)}</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr>{[...headings, "Updated", "Status", "Actions"].map((heading) => <th key={heading}>{t(heading)}</th>)}</tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {row.cells.map((cell, index) => <td key={index}>{cell}</td>)}
                <td>{dmy(row.updated)}</td>
                <td><Badge status={row.status} /></td>
                <td>
                  <div className="row-actions">
                    <button className="button small" onClick={() => onEdit(row.id)}>{t("Edit")}</button>
                    <button className="button small subtle danger" onClick={() => onDelete(row.id)}>{t("Delete")}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="table-empty"><h3>{t(emptyTitle)}</h3><p>{t(emptyText)}</p><button className="button" onClick={onAdd}>{t(addLabel)}</button></div>}
      </div>
    </div>
  );
}
