"use client";

import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { usePortal } from "@/lib/store";
import { RESPONSE_STATUSES } from "./sample-utils";
import { canSubmitSample } from "@/lib/sample-request-flow";

/** editDraft / respond / requestAction from the mock-up, wired to routes. */
export function useSampleActions() {
  const { db, toast } = usePortal();
  const router = useRouter();

  const editDraft = (id: string) => {
    const r = db.requests.find((x) => x.id === id);
    if (!r || !canSubmitSample(r)) return toast("This request is no longer editable.");
    router.push(routes.submitSample(id));
  };

  const respondTo = (id: string) => {
    const r = db.requests.find((x) => x.id === id);
    if (!r || !RESPONSE_STATUSES.includes(r.status)) return toast("A response is not available for this request.");
    router.push(routes.submitSample(id));
  };

  const requestAction = (id: string) => {
    const r = db.requests.find((x) => x.id === id);
    if (!r) return toast("Request not found.");
    if (canSubmitSample(r)) return editDraft(id);
    if (RESPONSE_STATUSES.includes(r.status)) return respondTo(id);
    router.push(routes.sample(id));
  };

  return { editDraft, respondTo, requestAction };
}
