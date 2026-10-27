"use client";

import { createContext, useCallback, useContext, useRef, useState, useSyncExternalStore, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { createInitialDb } from "./data";
import { useConfirm } from "@/components/ConfirmDialog";
import { clearDb, loadDb, saveDb } from "./db";
import { clearFilePreviews } from "./docs";
import type { Db } from "./types";

export interface WizardState {
  /** Sample-request draft being edited; null when no wizard is open. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic form record, same as the mock-up
  form: Record<string, any> | null;
  step: number;
}

interface ToastItem {
  id: number;
  text: string;
}

interface PortalContextValue {
  db: Db;
  /** Applies fn to a copy of the db, saves it to localStorage and re-renders. fn runs exactly once. */
  mutate: (fn: (draft: Db) => void) => void;
  toast: (message: string) => void;
  toasts: ToastItem[];
  /** Confirms, wipes saved data and restores the seeded scenario. Returns true when reset. */
  resetDemo: () => Promise<boolean>;
  wizard: WizardState;
  setWizard: Dispatch<SetStateAction<WizardState>>;
}

// The db lives in a tiny external store backed by localStorage. The server snapshot is null, so
// nothing that depends on saved data renders until the browser has loaded it (no hydration mismatch).
let current: Db | null = null;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const getSnapshot = () => (current ??= loadDb());
const getServerSnapshot = () => null;
function setCurrent(next: Db) {
  current = next;
  listeners.forEach((listener) => listener());
}

const PortalContext = createContext<PortalContextValue | null>(null);

export function PortalProvider({ children }: { children: ReactNode }) {
  const db = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [wizard, setWizard] = useState<WizardState>({ form: null, step: 0 });
  const toastId = useRef(0);
  const confirm = useConfirm();

  const toast = useCallback((message: string) => {
    const id = ++toastId.current;
    setToasts((list) => [...list, { id, text: message }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3400);
  }, []);

  const mutate = useCallback(
    (fn: (draft: Db) => void) => {
      const next = structuredClone(getSnapshot());
      fn(next);
      if (!saveDb(next)) toast("Could not save changes in this browser.");
      setCurrent(next);
    },
    [toast],
  );

  const resetDemo = useCallback(async () => {
    const ok = await confirm({ title: "Reset demo data", message: "Reset all supplier portal changes in this browser and reload the fictional demo data?", confirmLabel: "Reset", tone: "danger" });
    if (!ok) return false;
    if (!clearDb()) {
      toast("Could not clear saved demo data in this browser.");
      return false;
    }
    setCurrent(createInitialDb());
    setWizard({ form: null, step: 0 });
    clearFilePreviews();
    toast("Demo data reset.");
    return true;
  }, [toast, confirm]);

  if (!db) return null;
  return (
    <PortalContext.Provider value={{ db, mutate, toast, toasts, resetDemo, wizard, setWizard }}>
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error("usePortal must be used inside <PortalProvider>");
  return ctx;
}
