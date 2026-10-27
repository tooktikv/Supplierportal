import type { RequestRec } from "./types";

export const CATEGORIES: Record<string, { sampleRequired: boolean; approvalRequired: boolean }> = {
  "Industrial Components": { sampleRequired: true, approvalRequired: true },
  "Packaging Materials": { sampleRequired: true, approvalRequired: true },
  "Office Supplies": { sampleRequired: false, approvalRequired: false },
  "Safety Equipment": { sampleRequired: true, approvalRequired: true },
};

export const needsSample = (category: string) => CATEGORIES[category]?.sampleRequired === true;
export const requiresApproval = (category: string) =>
  CATEGORIES[category]?.sampleRequired === true && CATEGORIES[category]?.approvalRequired === true;

export const isPhysical = (type: string) => type === "Physical" || type === "Both";
export const isDigital = (type: string) => type === "Digital" || type === "Both";

export function gateOf(r: RequestRec): string {
  if (!r.category) return "Pending";
  if (r.sampleRequired === false || !requiresApproval(r.category)) return "Exempt";
  const outcome = r.evaluationOutcome || r.outcome;
  return outcome === "Approved" ? "Satisfied" : outcome === "Rejected" ? "Failed" : "Pending";
}

export function policyFields(request: RequestRec): RequestRec {
  const record: RequestRec = {
    ...request,
    requestStatus: request.status,
    sampleType: request.type,
    sampleRequired: request.category ? needsSample(request.category) : null,
    evaluationOutcome: request.outcome || null,
  };
  record.sampleGateStatus = gateOf(record);
  return record;
}

const ALLOWED: Record<string, string[]> = {
  "Awaiting Submission": ["Draft", "Submitted", "Under Review"],
  Draft: ["Submitted", "Under Review", "Cancelled"],
  Submitted: ["Under Review", "Awaiting Sample", "Action Required", "Approved", "Rejected"],
  "Under Review": ["Action Required", "Awaiting Sample", "Under Evaluation", "Approved", "Rejected"],
  "Awaiting Sample": ["Sample Received", "Action Required", "Cancelled"],
  "Sample Received": ["Under Evaluation", "Action Required"],
  "Under Evaluation": ["Action Required", "Resubmission Required", "Approved", "Rejected"],
  "Action Required": ["Under Review", "Submitted", "Resubmission Required"],
  "Resubmission Required": ["Under Review", "Submitted"],
  Approved: [],
  Rejected: [],
  Cancelled: [],
};

/** Mutates the request (use inside store.mutate). */
export function transition(req: RequestRec, next: string) {
  if (!ALLOWED[req.status]?.includes(next)) throw new Error(`Invalid request transition: ${req.status} → ${next}`);
  req.status = next;
  req.requestStatus = next;
  req.updated = new Date().toISOString().slice(0, 10);
  req.sampleGateStatus = gateOf(req);
  req.history.push([next === "Submitted" ? "Request Submitted" : next, new Date().toISOString()]);
}
