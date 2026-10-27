"use client";

import { todayIso } from "@/lib/docs";
import { usePortal } from "@/lib/store";
import type { FileMeta } from "@/lib/types";
import { kb, pickFiles } from "./sample-utils";

function ExpiryInput({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  const { toast } = usePortal();
  return (
    <label className="file-expiry">
      Expiry date
      <input
        type="date"
        min={todayIso()}
        value={value || ""}
        onChange={(e) => {
          if (e.target.value && e.target.value < todayIso()) return toast("Expiry date cannot be in the past.");
          onChange(e.target.value);
        }}
      />
    </label>
  );
}

interface UploadBoxProps {
  files: FileMeta[];
  helper: string;
  onAdd: (files: FileMeta[]) => void;
  onExpiry: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  /** Adds an aria-label to each Remove button (wizard only, as in the mock-up). */
  labelRemove?: boolean;
}

export default function UploadBox({ files, helper, onAdd, onExpiry, onRemove, labelRemove }: UploadBoxProps) {
  const { toast } = usePortal();
  return (
    <div className="upload-box">
      <div className="helper">{helper}</div>
      <input
        type="file"
        multiple
        accept=".pdf,.docx,.jpg,.jpeg,.png"
        onChange={(e) => {
          onAdd(pickFiles(e.target.files, toast));
          e.target.value = "";
        }}
      />
      <div className="file-list">
        {files.map((f, i) => (
          <div className="file-row" key={f.uid || `${f.name}-${i}`}>
            <span>
              ▤ &nbsp;{f.name} <small>({kb(f.size)} KB)</small>
            </span>
            <ExpiryInput value={f.expiry} onChange={(v) => onExpiry(i, v)} />
            <button type="button" aria-label={labelRemove ? `Remove ${f.name}` : undefined} onClick={() => onRemove(i)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
