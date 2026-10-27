"use client";

import { useCallback, useState } from "react";

/** Local UI state for a registration form: which fields were touched and whether every error should show. */
export function useRegUi() {
  const [touched, setTouched] = useState<ReadonlySet<string>>(() => new Set());
  const [showAll, setShowAll] = useState(false);
  // Bumped to ask the form to focus its first invalid field after the next commit.
  const [focusTick, setFocusTick] = useState(0);

  const touch = useCallback((id: string) => setTouched((prev) => (prev.has(id) ? prev : new Set(prev).add(id))), []);
  const clearTouched = useCallback(() => setTouched(new Set()), []);
  const requestFocus = useCallback(() => setFocusTick((n) => n + 1), []);
  const showError = (id: string) => showAll || touched.has(id);

  return { showAll, setShowAll, touch, clearTouched, showError, focusTick, requestFocus };
}
