"use client";

import { useConfirm } from "@/components/ConfirmDialog";
import { useI18n } from "@/lib/i18n";
import { saveDraft, submitResponse } from "@/lib/qsl-service";
import { usePortal } from "@/lib/store";
import { errorOf, type TabCtx } from "./ctx";
import { Block } from "./parts";
import { useQsl } from "./useQsl";

/** Declaration and submit. The service validates everything again, so the supplier is not shown a checklist. */
export default function SubmitBar({ ctx }: { ctx: TabCtx }) {
  const { t } = useI18n();
  const { toast } = usePortal();
  const { run } = useQsl();
  const confirm = useConfirm();
  const { request, response } = ctx;
  const revision = request.status === "Additional Information Required";

  const submit = async () => {
    ctx.reveal();
    if (!(await confirm({ message: revision ? "Submit this revision to SLM?" : "Submit your rate card to SLM?", confirmLabel: "Submit" }))) return;
    const result = run((draft) => submitResponse(draft, request.id, request.submissions.length + 1));
    if (result.ok) toast(t("Submitted. Reference {ref}.", { ref: result.value }));
  };

  return (
    <Block title="Declaration">
      <div className={`form-field ${errorOf(ctx, "declaration") ? "has-error" : ""}`}>
        <label className="reg-radio">
          <input type="checkbox" checked={response.declaration} onChange={(e) => void ctx.edit((draft) => void (draft.declaration = e.target.checked))} />
          <span>{t("I confirm the information is accurate and complete, I am authorised to submit it for this company, and I understand SLM may verify it and the ratings are not final until SLM releases a result.")}</span>
        </label>
        <span className="form-error" role="alert">{t(errorOf(ctx, "declaration") ?? "")}</span>
      </div>
      {!ctx.canSubmit && <div className="notice warning" style={{ marginTop: 12, marginBottom: 0 }}>{t("Your role cannot submit. Ask a Supplier Admin to submit this request.")}</div>}
      <div className="srm-footer-actions" style={{ marginTop: 14, justifyContent: "flex-start", marginLeft: 0 }}>
        <button className="button" onClick={() => { if (run((draft) => saveDraft(draft, request.id)).ok) toast("Draft saved."); }}>{t("Save draft")}</button>
        <button className="button primary" disabled={!ctx.canSubmit} onClick={submit}>{t(revision ? "Submit revision" : "Submit to SLM")}</button>
      </div>
    </Block>
  );
}
