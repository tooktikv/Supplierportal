"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { MESSAGES } from "./messages";

export type Lang = "en" | "th";
const KEY = "northstar-lang";

const EN_TO_TH = new Map(MESSAGES);
const TH_TO_EN = new Map(MESSAGES.map(([en, th]) => [th, en] as const));

/** Source strings may be English or Thai; the dictionary resolves them to the requested language. */
export function translate(text: string, lang: Lang, vars?: Record<string, string | number>) {
  const out = lang === "th" ? EN_TO_TH.get(text) ?? text : TH_TO_EN.get(text) ?? text;
  return vars ? out.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match)) : out;
}

let current: Lang | null = null;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const getSnapshot = (): Lang => (current ??= localStorage.getItem(KEY) === "th" ? "th" : "en");
export const getLang = (): Lang => (typeof localStorage === "undefined" ? "en" : getSnapshot());
const getServerSnapshot = (): Lang => "en";

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (text: string, vars?: Record<string, string | number>) => string;
}
const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setLang = useCallback((next: Lang) => {
    current = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Language still switches for this session when storage is unavailable.
    }
    listeners.forEach((listener) => listener());
  }, []);
  const t = useCallback((text: string, vars?: Record<string, string | number>) => translate(text, lang, vars), [lang]);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
