"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n";

export interface ConfirmOptions {
  title?: string;
  message: string;
  vars?: Record<string, string | number>;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
}

type Confirm = (options: ConfirmOptions) => Promise<boolean>;
const ConfirmContext = createContext<Confirm | null>(null);

/** In-app replacement for window.confirm: resolves true on confirm, false on cancel, Escape or backdrop click. */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [pending, setPending] = useState<{ options: ConfirmOptions; resolve: (ok: boolean) => void } | null>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const confirm = useCallback<Confirm>(
    (options) =>
      new Promise<boolean>((resolve) => {
        opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setPending({ options, resolve });
      }),
    [],
  );

  const close = useCallback(
    (ok: boolean) => {
      pending?.resolve(ok);
      setPending(null);
      opener.current?.focus();
    },
    [pending],
  );

  // Dangerous actions focus Cancel first so Enter cannot delete by accident.
  useEffect(() => {
    if (pending) (pending.options.tone === "danger" ? cancelRef : confirmRef).current?.focus();
  }, [pending]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close(false);
    } else if (event.key === "Tab") {
      const buttons = [cancelRef.current, confirmRef.current].filter(Boolean) as HTMLButtonElement[];
      const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
      event.preventDefault();
      buttons[(index + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length]?.focus();
    }
  };

  const options = pending?.options;
  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <div className="modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && close(false)}>
          <div className="modal-dialog confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message" onKeyDown={onKeyDown}>
            <div className="modal-body">
              <h2 id="confirm-title">{t(options.title || "Please confirm")}</h2>
              <p id="confirm-message" className="confirm-message">{t(options.message, options.vars)}</p>
            </div>
            <div className="modal-footer">
              <button ref={cancelRef} className="button" onClick={() => close(false)}>{t(options.cancelLabel || "Cancel")}</button>
              <button ref={confirmRef} className={`button ${options.tone === "danger" ? "danger-solid" : "primary"}`} onClick={() => close(true)}>{t(options.confirmLabel || "Confirm")}</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used inside <ConfirmProvider>");
  return ctx;
}
