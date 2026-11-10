"use client";

import { useCallback } from "react";
import { can, type QslAction } from "@/lib/qsl";
import type { Result } from "@/lib/qsl-service";
import { usePortal } from "@/lib/store";
import type { Db } from "@/lib/types";

/** Runs a supplier-side QSL operation against the saved data and toasts a failure. Swap for API calls later. */
export function useQsl() {
  const { db, mutate, toast } = usePortal();
  const run = useCallback(
    <T,>(action: (draft: Db) => Result<T>): Result<T> => {
      const holder: { out?: Result<T> } = {};
      mutate((draft) => {
        holder.out = action(draft);
      });
      const out: Result<T> = holder.out ?? { ok: false, error: "Something went wrong." };
      if (!out.ok) toast(out.error);
      return out;
    },
    [mutate, toast],
  );
  const allowed = (action: QslAction) => can(db.qsl, action);
  return { db, run, allowed };
}
