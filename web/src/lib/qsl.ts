// Supplier Portal · Qualification (QSL) + Skill Rate Card: types, rules, selectors and validation.
// SLM is the authority for criteria, workflow status, verification and results; the portal only
// holds supplier input. Pure functions only (no React) so a real API client can reuse them.
import { todayIso } from "./docs";
import type { Db } from "./types";

// ---- Roles and permissions (enforced again in qsl-service.ts) -------------------------------
export type QslRole = "Supplier Admin" | "Supplier User" | "Supplier Viewer";
export type QslAction = "view" | "edit" | "upload" | "acknowledge" | "submit";

const ROLE_ACTIONS: Record<QslRole, readonly QslAction[]> = {
  "Supplier Admin": ["view", "edit", "upload", "acknowledge", "submit"],
  "Supplier User": ["view", "edit", "upload", "acknowledge"],
  "Supplier Viewer": ["view"],
};

export function can(state: { role: QslRole; userCanSubmit: boolean }, action: QslAction) {
  if (state.role === "Supplier User" && action === "submit") return state.userCanSubmit;
  return ROLE_ACTIONS[state.role].includes(action);
}

// ---- Configurable rules. Anything marked PENDING is not confirmed by the Business Owner. -----
export const QSL_RULES = {
  maxFileMb: 5,
  allowedExtensions: ["pdf", "jpg", "jpeg", "png"],
  /** PENDING: whether a Supplier User may submit (default off). */
  userCanSubmitDefault: false,
  /** PENDING: "warn" lets a late submission through with a warning; "block" rejects it. */
  lateSubmission: "warn" as "warn" | "block",
  /** PENDING: soft check only; a higher level normally costs at least as much as a lower one. */
  warnWhenRateDropsWithLevel: true,
  maxRate: 10_000_000,
  expiringSoonDays: 30,
};

// ---- Domain types ---------------------------------------------------------------------------
type RateBasis = "Hourly" | "Daily" | "Monthly";

/** Workflow status of the request (owned by SLM). The qualification outcome is a separate field. */
export type QslStatus =
  | "Requested"
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Additional Information Required"
  | "Assessment In Progress"
  | "Pending Central Verification"
  | "Pending Qualification Approval"
  | "Result Released"
  | "Withdrawn";
type QslOutcome = "Qualified" | "Conditional" | "Not Qualified" | "Suspended";
/** What the supplier sees as the outcome; "Expired" is derived from the expiry date. */
export type QslDisplayOutcome = QslOutcome | "Expired";

export const STATUS_HELP: Record<QslStatus, string> = {
  Requested: "A Buyer asked you for your skill rate card. Complete it and submit before the due date.",
  Draft: "Your rate card is saved as a draft. Nothing has been sent yet.",
  Submitted: "Your submission was received and is waiting to be picked up for review.",
  "Under Review": "SLM is checking your submission for completeness.",
  "Additional Information Required": "SLM needs more information. Reply to each item and submit a revision.",
  "Assessment In Progress": "The Buyer assessor is evaluating your submission.",
  "Pending Central Verification": "A central rating verifier is checking your skill ratings.",
  "Pending Qualification Approval": "The final qualification decision is waiting for approval.",
  "Result Released": "The qualification result has been released. See the Result tab.",
  Withdrawn: "This request was withdrawn and is read-only.",
};

export interface RatingLevel { level: number; name: string; description: string }

/** One skill the Buyer / central team wants rated. Weights and thresholds are SLM-only and never sent here. */
export interface QslCriterion {
  id: string;
  source: "Central Standard" | "Buyer Custom";
  group: string;
  name: string;
  description: string;
  instructions: string;
  mandatory: boolean;
  evidenceRequired: boolean;
  evidenceTypes: string[];
}

export interface RequiredEvidence { id: string; title: string; description: string; docTypes: string[]; mandatory: boolean }

export interface RateLine { id: string; level: string; headcount: string; avgYears: string; rate: string }

export interface SkillResponse {
  offered: "" | "Yes" | "No";
  /** Supplier-declared. Never mixed with the verified rating, which lives in QslResult. */
  selfRating: string;
  comment: string;
  lines: RateLine[];
}

/** Reference to a repository document plus the snapshot taken when it was attached. */
export interface EvidenceRef {
  id: string;
  targetId: string;
  docId: string;
  docName: string;
  docType: string;
  version: number;
  issue: string;
  expiry: string;
  fileNames: string[];
  note: string;
  addedAt: string;
  addedBy: string;
}

export interface QslResponse {
  currency: string;
  rateBasis: "" | RateBasis;
  effectiveFrom: string;
  validUntil: string;
  leadTimeDays: string;
  paymentTermsDays: string;
  overtimeWeekday: string;
  overtimeHoliday: string;
  escalationPct: string;
  notes: string;
  skills: Record<string, SkillResponse>;
  evidence: EvidenceRef[];
  /** Replies to additional-information items, keyed `${infoRequestId}:${index}`. */
  replies: Record<string, string>;
  declaration: boolean;
}

export interface ProfileSnapshot {
  capturedAt: string;
  supplierId: string;
  company: string;
  registration: string;
  contacts: { name: string; role: string; email: string }[];
  sites: { name: string; location: string; type: string }[];
  categories: { name: string; main: string; sub: string }[];
  certifications: { name: string; type: string; expiry: string; version: number }[];
}

export interface QslSubmission {
  ref: string;
  version: number;
  kind: "Initial" | "Revision";
  submittedAt: string;
  submittedBy: string;
  role: QslRole;
  response: QslResponse;
  profile: ProfileSnapshot;
  revisesVersion?: number;
  infoRequestId?: string;
}

export interface QslInfoRequest {
  id: string;
  requestedAt: string;
  dueDate: string;
  from: string;
  message: string;
  items: { targetId: string; text: string }[];
  status: "Open" | "Responded";
  respondedAt?: string;
  respondedVersion?: number;
}

export interface QslResult {
  id: string;
  releasedAt: string;
  outcome: QslOutcome;
  /** Assigned by SLM (verification + approval). The supplier can never set it. */
  tier: string;
  tierNote: string;
  approvedCategory: string;
  approvedScope: string;
  effectiveDate: string;
  expiryDate: string;
  verified: { criterionId: string; rating: number; visible: boolean }[];
  feedback: string;
  basedOnVersion: number;
}

interface QslHistoryEntry { status: string; at: string; by: string; note?: string }

export interface QslRequest {
  id: string;
  supplierId: string;
  buyer: string;
  productCategory: string;
  scope: string;
  requestedAt: string;
  dueDate: string;
  instructions: string;
  currencies: string[];
  rateBases: RateBasis[];
  ratingScale: RatingLevel[];
  criteria: QslCriterion[];
  requiredEvidence: RequiredEvidence[];
  status: QslStatus;
  updated: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  draft: QslResponse | null;
  submissions: QslSubmission[];
  infoRequests: QslInfoRequest[];
  /** Released results only, oldest first. */
  results: QslResult[];
  history: QslHistoryEntry[];
}

interface QslAuditEntry {
  id: string;
  at: string;
  action: string;
  supplierId: string;
  requestId: string;
  ref: string;
  by: string;
  role: QslRole;
  prev?: string;
  next?: string;
}

export interface QslState {
  role: QslRole;
  userCanSubmit: boolean;
  requests: QslRequest[];
  audit: QslAuditEntry[];
}

// ---- Selectors ------------------------------------------------------------------------------
export const emptyLine = (): RateLine => ({ id: `ln-${Math.random().toString(36).slice(2, 8)}`, level: "", headcount: "", avgYears: "", rate: "" });
export const emptySkill = (): SkillResponse => ({ offered: "", selfRating: "", comment: "", lines: [] });

export function emptyResponse(request: QslRequest): QslResponse {
  return {
    currency: request.currencies[0] || "",
    rateBasis: request.rateBases.length === 1 ? request.rateBases[0] : "",
    effectiveFrom: "", validUntil: "", leadTimeDays: "", paymentTermsDays: "", overtimeWeekday: "", overtimeHoliday: "", escalationPct: "", notes: "",
    skills: Object.fromEntries(request.criteria.map((criterion) => [criterion.id, emptySkill()])),
    evidence: [], replies: {}, declaration: false,
  };
}

export const latestSubmission = (request: QslRequest) => request.submissions.at(-1);
export const latestResult = (request: QslRequest) => request.results.at(-1);
export const openInfoRequest = (request: QslRequest) => request.infoRequests.find((info) => info.status === "Open");

/**
 * What the form shows: the working draft, else (for a revision) a copy of the last submission with the
 * declaration cleared, else the last submission as-is, else a blank response.
 */
export function currentResponse(request: QslRequest): QslResponse {
  if (request.draft) return request.draft;
  const last = latestSubmission(request);
  if (!last) return emptyResponse(request);
  return request.status === "Additional Information Required" ? { ...structuredClone(last.response), declaration: false, replies: {} } : last.response;
}

/** "all" while the request is new/draft; a target-id set while SLM asked for specific changes; null when read-only. */
export type EditScope = "all" | Set<string> | null;
export function editScope(request: QslRequest): EditScope {
  if (request.status === "Requested" || request.status === "Draft") return "all";
  const info = request.status === "Additional Information Required" ? openInfoRequest(request) : undefined;
  return info ? new Set(info.items.map((item) => item.targetId)) : null;
}
export const inScope = (scope: EditScope, targetId: string) => scope === "all" || (scope instanceof Set && scope.has(targetId));

/** Outcome as the supplier should see it: expiry is derived from the dates, never typed in. */
export function displayOutcome(request: QslRequest): QslDisplayOutcome | null {
  const result = latestResult(request);
  if (request.status !== "Result Released" || !result) return null;
  if (result.outcome === "Suspended") return "Suspended";
  if (result.outcome !== "Not Qualified" && result.expiryDate && result.expiryDate < todayIso()) return "Expired";
  return result.outcome;
}

export const NEEDS_ACTION: QslStatus[] = ["Requested", "Draft", "Additional Information Required"];
const IN_REVIEW: QslStatus[] = ["Submitted", "Under Review", "Assessment In Progress", "Pending Central Verification", "Pending Qualification Approval"];
export const QSL_BUCKETS = ["All", "Action required", "In review", "Results", "History"] as const;
export type QslBucket = (typeof QSL_BUCKETS)[number];

export function inBucket(request: QslRequest, bucket: QslBucket) {
  const outcome = displayOutcome(request);
  const active = outcome === "Qualified" || outcome === "Conditional";
  switch (bucket) {
    case "All": return true;
    case "Action required": return NEEDS_ACTION.includes(request.status);
    case "In review": return IN_REVIEW.includes(request.status);
    case "Results": return active;
    case "History": return request.status === "Withdrawn" || (request.status === "Result Released" && !active);
  }
}

export function nextAction(request: QslRequest): string {
  switch (request.status) {
    case "Requested": return request.acknowledgedAt ? "Fill in your rate card and submit it." : "Acknowledge the request, then fill in your rate card.";
    case "Draft": return "Finish your draft and submit it.";
    case "Additional Information Required": return "Reply to the requested items and submit a revision.";
    case "Result Released": return displayOutcome(request) === "Expired" ? "Your qualification expired. Wait for the Buyer to open a new request." : "No action needed. Review your result.";
    case "Withdrawn": return "No action needed.";
    default: return "No action needed. SLM is processing your submission.";
  }
}

const requestNumber = (id: string) => id.replace(/^QR-/, "");
export const submissionRef = (id: string, version: number) => `QS-${requestNumber(id)}-V${version}`;
export const skillGroups = (request: QslRequest) => [...new Set(request.criteria.map((criterion) => criterion.group))];
export const levelName = (request: QslRequest, level: number | string) => request.ratingScale.find((item) => item.level === Number(level))?.name || "—";

// ---- Shared Supplier Profile ----------------------------------------------------------------
const CERT_TYPES = ["Quality Certification", "Factory Documentation"];

/** Read-only view of the Shared Supplier Profile; copied into each submission so later profile edits never rewrite history. */
export function profileSnapshot(db: Db): ProfileSnapshot {
  const certifications = db.documents
    .filter((doc) => CERT_TYPES.includes(doc.type) && doc.status !== "Required")
    .map((doc) => ({ name: doc.name, type: doc.type, expiry: doc.expiry && doc.expiry !== "—" ? doc.expiry : "", version: Math.max(1, doc.history?.length || 1) }));
  for (const record of db.srm.humanRights) {
    if (record.status === "Submitted") certifications.push({ name: record.standard === "อื่น ๆ" ? record.other : record.standard, type: "Human rights standard", expiry: record.expiry, version: 1 });
  }
  return {
    capturedAt: new Date().toISOString(),
    supplierId: db.profile.id,
    company: db.profile.company,
    registration: db.profile.registration,
    contacts: db.profile.contacts.filter((contact) => contact.status !== "Inactive").map((contact) => ({ name: contact.name, role: contact.role, email: contact.email })),
    sites: db.profile.factories.map((site) => ({ name: site.name, location: site.location, type: site.type })),
    categories: db.profile.products.map((product) => ({ name: product.name, main: product.main, sub: product.sub })),
    certifications,
  };
}

/** Mandatory Shared Supplier Profile data; fixed in Company Profile, never edited from a request. */
export function profileErrors(db: Db): string[] {
  const missing: string[] = [];
  if (!db.profile.company || !db.profile.registration) missing.push("Company information is incomplete.");
  if (!db.profile.contacts.some((contact) => contact.email && contact.status !== "Inactive")) missing.push("Add at least one active contact.");
  if (!db.profile.factories.length) missing.push("Add at least one manufacturing site.");
  if (!db.profile.products.length) missing.push("Add at least one product category.");
  return missing;
}

// ---- Validation -----------------------------------------------------------------------------
export interface Validation { errors: Record<string, string>; warnings: Record<string, string> }

const isMoney = (value: string) => /^\d{1,9}(\.\d{1,2})?$/.test(value.trim()) && Number(value) > 0 && Number(value) <= QSL_RULES.maxRate;
const isInt = (value: string, min: number, max: number) => /^\d+$/.test(value.trim()) && Number(value) >= min && Number(value) <= max;
const isNumber = (value: string, min: number, max: number) => /^\d+(\.\d{1,2})?$/.test(value.trim()) && Number(value) >= min && Number(value) <= max;
const REQUIRED = "This field is required.";

export function validateResponse(db: Db, request: QslRequest, response: QslResponse): Validation {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};
  const scale = request.ratingScale.map((item) => item.level);

  if (!request.currencies.includes(response.currency)) errors["general.currency"] = "Select a currency.";
  if (!response.rateBasis || !request.rateBases.includes(response.rateBasis)) errors["general.rateBasis"] = "Select a rate basis.";
  if (!response.effectiveFrom) errors["general.effectiveFrom"] = REQUIRED;
  if (!response.validUntil) errors["general.validUntil"] = REQUIRED;
  else if (response.effectiveFrom && response.validUntil < response.effectiveFrom) errors["general.validUntil"] = "Valid until cannot be before the effective date.";
  if (response.leadTimeDays && !isInt(response.leadTimeDays, 0, 365)) errors["general.leadTimeDays"] = "Enter a whole number from 0 to 365.";
  if (response.paymentTermsDays && !isInt(response.paymentTermsDays, 0, 365)) errors["general.paymentTermsDays"] = "Enter a whole number from 0 to 365.";
  for (const key of ["overtimeWeekday", "overtimeHoliday"] as const) {
    if (response[key] && !isNumber(response[key], 1, 5)) errors[`general.${key}`] = "Enter a multiplier from 1 to 5 (up to 2 decimals).";
  }
  if (response.escalationPct && !isNumber(response.escalationPct, 0, 100)) errors["general.escalationPct"] = "Enter a percentage from 0 to 100.";
  if (response.notes.length > 5000) errors["general.notes"] = "Maximum 5000 characters.";

  for (const criterion of request.criteria) {
    const skill = response.skills[criterion.id] ?? emptySkill();
    const key = `skill.${criterion.id}`;
    if (!skill.offered) errors[`${key}.offered`] = "Select Yes or No.";
    else if (skill.offered === "No" && criterion.mandatory) errors[`${key}.offered`] = "This skill is mandatory for this request.";
    if (skill.comment.length > 2000) errors[`${key}.comment`] = "Maximum 2000 characters.";
    if (skill.offered !== "Yes") continue;
    if (!scale.includes(Number(skill.selfRating)) || !/^\d+$/.test(skill.selfRating)) errors[`${key}.selfRating`] = "Select a rating from the scale.";
    if (!skill.lines.length) errors[`${key}.lines`] = "Add at least one rate line.";
    const seen = new Set<string>();
    for (const line of skill.lines) {
      const lineKey = `${key}.line.${line.id}`;
      if (!line.level || !scale.includes(Number(line.level))) errors[`${lineKey}.level`] = "Select a level.";
      else if (seen.has(line.level)) errors[`${lineKey}.level`] = "This level is already listed for this skill.";
      seen.add(line.level);
      if (!isInt(line.headcount, 1, 100000)) errors[`${lineKey}.headcount`] = "Enter a whole number of 1 or more.";
      if (!isNumber(line.avgYears, 0, 60)) errors[`${lineKey}.avgYears`] = "Enter years from 0 to 60.";
      if (!isMoney(line.rate)) errors[`${lineKey}.rate`] = "Enter a rate greater than 0 (up to 2 decimals).";
    }
    if (QSL_RULES.warnWhenRateDropsWithLevel) {
      const ordered = skill.lines.filter((line) => line.level && isMoney(line.rate)).sort((a, b) => Number(a.level) - Number(b.level));
      for (let i = 1; i < ordered.length; i++) {
        if (Number(ordered[i].rate) < Number(ordered[i - 1].rate)) warnings[`${key}.line.${ordered[i].id}.rate`] = "This rate is lower than a lower level. Check it before submitting.";
      }
    }
    if (criterion.evidenceRequired && !response.evidence.some((ref) => ref.targetId === criterion.id)) errors[`${key}.evidence`] = "Attach the required evidence.";
  }

  for (const requirement of request.requiredEvidence) {
    if (requirement.mandatory && !response.evidence.some((ref) => ref.targetId === requirement.id)) errors[`evidence.${requirement.id}`] = "Attach the required evidence.";
  }
  for (const ref of response.evidence) {
    const days = ref.expiry ? (new Date(`${ref.expiry}T23:59:59`).getTime() - Date.now()) / 864e5 : Infinity;
    if (days < 0) errors[`evidenceRef.${ref.id}`] = "This document has expired. Replace it with a valid one.";
    else if (days <= QSL_RULES.expiringSoonDays) warnings[`evidenceRef.${ref.id}`] = "This document expires within 30 days.";
  }

  const info = openInfoRequest(request);
  if (info && request.status === "Additional Information Required") {
    info.items.forEach((_, index) => {
      if (!response.replies[`${info.id}:${index}`]?.trim()) errors[`reply.${info.id}:${index}`] = REQUIRED;
    });
  }

  const profile = profileErrors(db);
  if (profile.length) errors.profile = profile[0];
  if (!response.declaration) errors.declaration = "Confirm the supplier declaration before submitting.";
  if (request.dueDate && todayIso() > request.dueDate && !info) {
    if (QSL_RULES.lateSubmission === "block") errors.dueDate = "The submission due date has passed.";
    else warnings.dueDate = "The submission due date has passed. SLM may treat this as a late submission.";
  }
  return { errors, warnings };
}

export function validateEvidenceFile(file: { name: string; size: number }): string | null {
  const extension = (file.name.split(".").pop() ?? "").toLowerCase();
  if (!QSL_RULES.allowedExtensions.includes(extension)) return "Only PDF, JPG or PNG files are accepted.";
  if (file.size > QSL_RULES.maxFileMb * 1024 * 1024) return "Each file must be {mb} MB or smaller.";
  return null;
}
