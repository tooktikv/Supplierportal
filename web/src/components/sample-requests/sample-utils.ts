import { trackFile } from "@/lib/docs";
import { isDigital, isPhysical, policyFields } from "@/lib/policy";
import type { WizardState } from "@/lib/store";
import type { Db, FileMeta, RequestRec } from "@/lib/types";

export type SampleForm = NonNullable<WizardState["form"]>;

export const RESPONSE_STATUSES = ["Action Required", "Resubmission Required"];

export const WIZARD_NAMES = ["Request & Product Information", "Sample Details", "Delivery & Documents", "Review & Submit"];

export const kb = (size?: number) => ((size ?? 0) / 1024).toFixed(0);

export function newSampleForm(company: string): SampleForm {
  return {
    id: "",
    supplier: company,
    category: "",
    name: "",
    code: "",
    type: "",
    quantity: "",
    unit: "pieces",
    description: "",
    notes: "",
    specification: "",
    url: "",
    address: "",
    recipient: "",
    contact: "",
    deliveryDate: "",
    instructions: "",
    files: [],
    declaration: false,
  };
}

export function createRequestId(db: Db): string {
  const year = new Date().getFullYear();
  const seq = String(Date.now()).slice(-5);
  let id = `SR-${year}-${seq}`;
  while (db.requests.some((r) => r.id === id)) id = `SR-${year}-${String(Math.floor(Math.random() * 90000) + 10000)}`;
  return id;
}

/** Policy-enriched Draft record for a wizard form (history starts with "Draft Created"). */
export function newDraftRequest(form: SampleForm, id: string, now: string): RequestRec {
  return policyFields({
    name: form.name,
    code: form.code,
    category: form.category,
    type: form.type,
    ...form,
    id,
    status: "Draft",
    created: now,
    updated: now,
    history: [["Draft Created", new Date().toISOString()]],
    revisions: [],
  });
}

const REQUIRED_BY_STEP: Record<number, string[]> = { 0: ["category", "name", "code", "type"], 1: [], 2: [], 3: ["declaration"] };

/** Keys of the fields that fail validation on a wizard step. */
export function stepErrors(form: SampleForm, step: number): Set<string> {
  const errors = new Set(REQUIRED_BY_STEP[step] || []);
  if (step === 0) for (const key of ["category", "name", "code", "type"]) if (form[key]?.trim()) errors.delete(key);
  if (step === 1) {
    if (isPhysical(form.type)) {
      if (!form.quantity || Number(form.quantity) <= 0) errors.add("quantity");
      if (!form.unit) errors.add("unit");
      if (!form.description?.trim()) errors.add("description");
    }
    if (isDigital(form.type) && !form.specification?.trim()) errors.add("specification");
  }
  if (step === 2 && isPhysical(form.type)) for (const k of ["address", "recipient", "contact", "deliveryDate"]) if (!form[k]?.trim()) errors.add(k);
  if (errors.has("declaration") && form.declaration) errors.delete("declaration");
  return errors;
}

const ALLOWED_MIME = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png"];
const ALLOWED_EXT = ["pdf", "docx", "jpg", "jpeg", "png"];

/** Validates picked files (10 MB, pdf/docx/jpg/png) and wraps the valid ones with trackFile. */
export function pickFiles(list: FileList | null, toast: (message: string) => void): FileMeta[] {
  const valid: FileMeta[] = [];
  for (const file of Array.from(list || [])) {
    if (file.size > 10 * 1024 * 1024) {
      toast(`${file.name} exceeds the 10 MB limit.`);
      continue;
    }
    const extension = (file.name.split(".").pop() ?? "").toLowerCase();
    if (!ALLOWED_MIME.includes(file.type) && !ALLOWED_EXT.includes(extension)) {
      toast(`${file.name} is not a supported file type.`);
      continue;
    }
    valid.push(trackFile(file, file.type || extension));
  }
  return valid;
}
