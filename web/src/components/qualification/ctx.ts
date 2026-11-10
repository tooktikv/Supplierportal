import type { EditScope, QslRequest, QslResponse, Validation } from "@/lib/qsl";

export const TABS = ["Overview", "Rate card", "Evidence", "Company & capability", "Result", "History"] as const;
export type TabKey = (typeof TABS)[number];

/** Everything a tab needs; the service layer still re-checks permissions on every write. */
export interface TabCtx {
  request: QslRequest;
  response: QslResponse;
  validation: Validation;
  scope: EditScope;
  canEdit: boolean;
  canUpload: boolean;
  canSubmit: boolean;
  showErrors: boolean;
  edit: (change: (response: QslResponse) => void) => boolean;
  goTab: (tab: TabKey) => void;
  /** Starts showing validation messages on the fields. */
  reveal: () => void;
}

export const errorOf = (ctx: TabCtx, key: string) => (ctx.showErrors ? ctx.validation.errors[key] : undefined);
