// MOCK of the SLM side (authoritative for criteria, workflow status, verification and results).
// Replace with real SLM API calls. Everything here is fictional and clearly separated from the
// supplier-side logic in qsl.ts / qsl-service.ts. The seeded requests cover every list tab.
import {
  emptyResponse, QSL_RULES, submissionRef,
  type EvidenceRef, type QslCriterion, type QslInfoRequest, type QslRequest, type QslResponse, type QslResult, type QslState, type QslStatus, type RateLine, type RatingLevel, type RequiredEvidence,
} from "./qsl";

/** Five-level scale loosely aligned with the SFIA levels of responsibility. SLM owns the real definitions. */
const SLM_RATING_SCALE: RatingLevel[] = [
  { level: 1, name: "Entry", description: "Works on routine tasks under close supervision and follows set instructions." },
  { level: 2, name: "Junior", description: "Handles routine work with some independence and needs guidance on unusual cases." },
  { level: 3, name: "Skilled", description: "Works independently on varied tasks using standard methods and meets deadlines." },
  { level: 4, name: "Senior", description: "Handles complex work, guides others and is accountable for the quality of outcomes." },
  { level: 5, name: "Expert", description: "Recognised authority who sets methods, solves the hardest problems and coaches teams." },
];

const criterion = (id: string, name: string, group: string, source: QslCriterion["source"], mandatory: boolean, description: string, instructions: string, evidenceTypes: string[] = []): QslCriterion => ({
  id, name, group, source, mandatory, description, instructions, evidenceRequired: evidenceTypes.length > 0, evidenceTypes,
});

const CRITERIA: QslCriterion[] = [
  criterion("sk-cnc", "CNC machining", "Production & Fabrication", "Central Standard", true, "Setup, programming and operation of CNC milling and turning equipment.", "Rate your overall skill, then list each level you can supply with headcount, average years and the rate you charge."),
  criterion("sk-weld", "Welding & fabrication", "Production & Fabrication", "Central Standard", false, "Structural and pressure-part welding and metal fabrication.", "Attach current welder qualification certificates.", ["Quality Certification"]),
  criterion("sk-assembly", "Assembly & finishing", "Production & Fabrication", "Buyer Custom", true, "Manual and semi-automated assembly, deburring, surface finishing and packing.", "Count only people who can work without supervision at the stated level."),
  criterion("sk-qc", "Quality inspection & testing", "Quality & Metrology", "Central Standard", true, "In-process and final inspection, sampling plans and test reporting.", "Attach quality certificates that cover the inspection process.", ["Quality Certification", "Factory Documentation"]),
  criterion("sk-metrology", "Metrology & calibration", "Quality & Metrology", "Central Standard", false, "Dimensional measurement, gauge control and calibration management.", "Leave as No if you outsource calibration."),
  criterion("sk-process", "Process & tooling engineering", "Engineering", "Buyer Custom", false, "Process planning, jigs and fixtures, and manufacturing problem solving.", "Include engineers who can own a process change end to end."),
  criterion("sk-maint", "Industrial maintenance", "Maintenance & Field Service", "Central Standard", false, "Preventive and corrective maintenance of production equipment.", "Rates are for on-site work at the Buyer or at your plant."),
];

const REQUIRED_EVIDENCE: RequiredEvidence[] = [
  { id: "req-iso", title: "Quality management certificate (ISO 9001 or equivalent)", description: "Current certificate covering the site that will serve this Buyer.", docTypes: ["Quality Certification"], mandatory: true },
  { id: "req-org", title: "Workforce list or organisation chart", description: "Shows the headcount you declared in the rate card.", docTypes: ["Factory Documentation", "Other"], mandatory: false },
];

const pick = (...ids: string[]) => CRITERIA.filter((item) => ids.includes(item.id));
const log = (status: QslRequest["history"][number]["status"], at: string, by: string, note?: string) => ({ status, at: `${at}T09:00:00.000Z`, by, note });

function base(id: string, supplierId: string, patch: Partial<QslRequest>): QslRequest {
  return {
    id, supplierId, buyer: "Olivia Martin · Northstar Procurement", productCategory: "Industrial Components", scope: "", requestedAt: "2026-10-01", dueDate: "2026-11-30",
    instructions: "Complete the rate card for every skill we list. Quote your standard rates before any negotiated discount. SLM uses this to place your company in a tier.",
    currencies: ["THB", "USD"], rateBases: ["Hourly", "Daily", "Monthly"], ratingScale: SLM_RATING_SCALE, criteria: CRITERIA, requiredEvidence: REQUIRED_EVIDENCE,
    status: "Requested", updated: "2026-10-01", draft: null, submissions: [], infoRequests: [], results: [], history: [log("Requested", "2026-10-01", "SLM")], ...patch,
  };
}

const line = (id: string, level: number, headcount: number, years: number, rate: number): RateLine => ({ id, level: String(level), headcount: String(headcount), avgYears: String(years), rate: String(rate) });

const isoEvidence = (targetId: string, id: string): EvidenceRef => ({
  id, targetId, docId: "DOC-0002", docName: "ISO 9001:2015 Certificate", docType: "Quality Certification", version: 2, issue: "2025-05-01", expiry: "2027-04-30",
  fileNames: ["iso-9001-2025.pdf"], note: "", addedAt: "2026-10-20T08:00:00.000Z", addedBy: "Maya Chen",
});

/** Complete, valid response used by the seeded submissions. */
function seedResponse(request: QslRequest, ratings: Record<string, number>): QslResponse {
  const response = emptyResponse(request);
  Object.assign(response, { currency: "THB", rateBasis: "Daily", effectiveFrom: "2026-11-01", validUntil: "2027-10-31", leadTimeDays: "14", paymentTermsDays: "45", escalationPct: "3", declaration: true });
  for (const item of request.criteria) {
    const rating = ratings[item.id];
    response.skills[item.id] = rating
      ? { offered: "Yes", selfRating: String(rating), comment: "", lines: [line(`${item.id}-a`, Math.max(1, rating - 1), 6, 4, 1800 + rating * 200), line(`${item.id}-b`, rating, 3, 8, 2600 + rating * 300)] }
      : { offered: "No", selfRating: "", comment: "", lines: [] };
    if (rating && item.evidenceRequired) response.evidence.push(isoEvidence(item.id, `${item.id}-ev`));
  }
  for (const item of request.requiredEvidence) if (item.mandatory) response.evidence.push(isoEvidence(item.id, `${item.id}-ev`));
  return response;
}

function submitted(request: QslRequest, ratings: Record<string, number>, at: string): QslRequest["submissions"][number] {
  return {
    ref: submissionRef(request.id, 1), version: 1, kind: "Initial", submittedAt: `${at}T10:00:00.000Z`, submittedBy: "Maya Chen", role: "Supplier Admin",
    response: seedResponse(request, ratings), profile: { capturedAt: `${at}T10:00:00.000Z`, supplierId: request.supplierId, company: "Asteron Industrial Supply", registration: "US-OR-927461", contacts: [{ name: "Maya Chen", role: "Supplier administrator", email: "maya.chen@asteron.example" }], sites: [{ name: "Asteron Portland Manufacturing", location: "Portland, Oregon, United States", type: "Manufacturing" }], categories: [{ name: "Industrial Components", main: "Industrial Components", sub: "Valves and fittings" }], certifications: [{ name: "ISO 9001:2015 Certificate", type: "Quality Certification", expiry: "2027-04-30", version: 2 }] },
  };
}

const dayAfter = (start: string, days: number) => new Date(Date.parse(`${start}T00:00:00Z`) + days * 864e5).toISOString().slice(0, 10);
const REVIEW_CHAIN: QslStatus[] = ["Submitted", "Under Review", "Assessment In Progress", "Pending Central Verification", "Pending Qualification Approval"];

/** Walks a request through the given statuses; a "Submitted" step attaches a complete submission. */
function flow(request: QslRequest, steps: QslStatus[], ratings: Record<string, number> = {}): QslRequest {
  steps.forEach((status, index) => {
    const at = dayAfter(request.requestedAt, 5 + index * 4);
    if (status === "Submitted") request.submissions.push(submitted(request, ratings, at));
    request.history.push(log(status, at, status === "Draft" || status === "Submitted" ? "Maya Chen" : "SLM", status === "Submitted" ? submissionRef(request.id, 1) : undefined));
    request.status = status;
    request.updated = at;
  });
  return request;
}

type ResultInput = Pick<QslResult, "outcome" | "tier" | "feedback" | "effectiveDate" | "expiryDate">;

/** Appends a released result; verified ratings are derived from the self-ratings (some hidden from the supplier). */
function release(request: QslRequest, ratings: Record<string, number>, result: ResultInput, daysAfterRequest = 40): QslRequest {
  const at = dayAfter(request.requestedAt, daysAfterRequest);
  const verified = Object.entries(ratings).map(([criterionId, self], index) => ({ criterionId, rating: Math.max(1, index % 2 ? self - 1 : self), visible: index % 3 !== 2 }));
  request.results.push({ id: `res-${request.id.slice(-4)}-${request.results.length + 1}`, releasedAt: `${at}T08:00:00.000Z`, tierNote: "", approvedCategory: request.productCategory, approvedScope: request.scope, verified, basedOnVersion: 1, ...result });
  request.history.push(log("Result Released", at, "SLM", result.outcome));
  request.status = "Result Released";
  request.updated = at;
  return request;
}

function partialDraft(request: QslRequest): QslResponse {
  const response = emptyResponse(request);
  Object.assign(response, { currency: "THB", rateBasis: "Daily", effectiveFrom: "2026-11-01", validUntil: "2027-10-31", leadTimeDays: "14" });
  const first = request.criteria[0];
  response.skills[first.id] = { offered: "Yes", selfRating: "3", comment: "", lines: [line(`${first.id}-a`, 3, 4, 5, 2200)] };
  return response;
}

/** Extra requests that exist so each list tab has an example (see QSL_BUCKETS in qsl.ts). */
function exampleCases(supplierId: string): QslRequest[] {
  const mandatory = REQUIRED_EVIDENCE.filter((item) => item.mandatory);
  const machining = pick("sk-cnc", "sk-assembly", "sk-qc");
  const machiningRatings = { "sk-cnc": 4, "sk-assembly": 3, "sk-qc": 4 };
  const make = (id: string, requestedAt: string, patch: Partial<QslRequest>) => base(id, supplierId, { requestedAt, dueDate: dayAfter(requestedAt, 21), updated: requestedAt, history: [log("Requested", requestedAt, "SLM")], requiredEvidence: mandatory, criteria: machining, ...patch });

  const draft = flow(make("QR-2026-0013", "2026-10-28", { productCategory: "Packaging Materials", scope: "Printing, laminating and carton assembly services", dueDate: "2026-11-25", criteria: pick("sk-assembly", "sk-qc", "sk-process") }), ["Draft"]);
  draft.draft = partialDraft(draft);

  const submittedCase = flow(make("QR-2026-0011", "2026-10-20", { scope: "Valve housing machining for the second plant line" }), REVIEW_CHAIN.slice(0, 1), machiningRatings);
  const underReview = flow(make("QR-2026-0008", "2026-10-08", { scope: "Fastener and coupling machining" }), REVIEW_CHAIN.slice(0, 2), machiningRatings);
  const assessing = flow(make("QR-2026-0007", "2026-09-30", { scope: "Precision shaft turning and finishing" }), REVIEW_CHAIN.slice(0, 3), machiningRatings);
  const verifying = flow(make("QR-2026-0006", "2026-09-22", { scope: "Hydraulic fitting machining and testing" }), REVIEW_CHAIN.slice(0, 4), machiningRatings);
  const approving = flow(make("QR-2026-0005", "2026-09-14", { scope: "Pressure valve body machining" }), REVIEW_CHAIN, machiningRatings);

  const conditional = release(flow(make("QR-2026-0003", "2026-07-06", { scope: "Conveyor roller machining and assembly" }), REVIEW_CHAIN, machiningRatings), machiningRatings, {
    outcome: "Conditional", tier: "Tier 3", effectiveDate: "2026-08-15", expiryDate: "2027-08-14", feedback: "Approved with conditions. Provide an updated calibration plan within six months.",
  });

  const rejected = release(flow(make("QR-2026-0002", "2026-05-11", { scope: "Bracket machining (first trial)" }), REVIEW_CHAIN, machiningRatings), machiningRatings, {
    outcome: "Not Qualified", tier: "", effectiveDate: "", expiryDate: "", feedback: "The declared skill levels could not be verified for this scope. You can apply again when new evidence is available.",
  });

  const suspended = release(flow(make("QR-2026-0001", "2026-02-02", { scope: "Gearbox component machining" }), REVIEW_CHAIN, machiningRatings), machiningRatings, {
    outcome: "Qualified", tier: "Tier 2", effectiveDate: "2026-03-14", expiryDate: "2027-03-13", feedback: "Meets the requirements for this scope.",
  });
  suspended.results.push({ ...suspended.results[0], id: "res-0001-2", releasedAt: "2026-10-20T08:00:00.000Z", outcome: "Suspended", feedback: "Qualification is suspended while the Buyer reviews open quality issues." });
  suspended.history.push(log("Result Released", "2026-10-20", "SLM", "Suspended"));
  suspended.updated = "2026-10-20";

  const withdrawn = flow(make("QR-2025-0020", "2025-11-03", { scope: "Seasonal machining capacity (cancelled project)" }), ["Draft", "Withdrawn"]);
  withdrawn.history[withdrawn.history.length - 1].note = "Withdrawn by the Buyer";

  return [draft, submittedCase, underReview, assessing, verifying, approving, conditional, rejected, suspended, withdrawn];
}

function seedRequests(supplierId: string): QslRequest[] {
  const open = base("QR-2026-0012", supplierId, { scope: "Contract machining and assembly of valve components (Portland plant)", requestedAt: "2026-11-03", updated: "2026-11-03", history: [log("Requested", "2026-11-03", "SLM")] });

  const review = base("QR-2026-0009", supplierId, {
    productCategory: "Packaging Materials", scope: "Packaging converting and finishing services", requestedAt: "2026-10-12", dueDate: "2026-10-30", criteria: pick("sk-assembly", "sk-qc", "sk-process"),
    requiredEvidence: REQUIRED_EVIDENCE.filter((item) => item.mandatory),
  });
  const ratings = { "sk-assembly": 4, "sk-qc": 3, "sk-process": 3 };
  review.submissions.push(submitted(review, ratings, "2026-10-24"));
  const info: QslInfoRequest = {
    id: "info-0009-1", requestedAt: "2026-11-02", dueDate: "2026-11-12", from: "Buyer assessor",
    message: "Thanks for your submission. We need two clarifications before assessment can continue.",
    items: [{ targetId: "sk-qc", text: "Add the headcount you can supply at level 4 (Senior) for quality inspection." }, { targetId: "req-iso", text: "Attach the certificate scope page that lists the packaging site." }],
    status: "Open",
  };
  review.infoRequests.push(info);
  Object.assign(review, { status: "Additional Information Required", updated: "2026-11-02", history: [log("Requested", "2026-10-12", "SLM"), log("Draft", "2026-10-20", "Maya Chen"), log("Submitted", "2026-10-24", "Maya Chen", submissionRef(review.id, 1)), log("Under Review", "2026-10-27", "SLM"), log("Additional Information Required", "2026-11-02", "SLM", "Buyer assessor asked for 2 items.")] });

  const released = base("QR-2026-0004", supplierId, { productCategory: "Safety Equipment", scope: "Assembly and inspection of protective equipment", requestedAt: "2026-04-14", dueDate: "2026-05-05", criteria: pick("sk-assembly", "sk-qc", "sk-maint"), requiredEvidence: REQUIRED_EVIDENCE.filter((item) => item.mandatory) });
  const releasedRatings = { "sk-assembly": 4, "sk-qc": 4, "sk-maint": 3 };
  released.submissions.push(submitted(released, releasedRatings, "2026-04-30"));
  released.results.push({
    id: "res-0004-1", releasedAt: "2026-06-02T08:00:00.000Z", outcome: "Qualified", tier: "Tier 2", tierNote: "Meets the standard for preferred supplier consideration.", approvedCategory: "Safety Equipment", approvedScope: "Assembly and inspection of protective equipment",
    effectiveDate: "2026-06-01", expiryDate: "2027-05-31", basedOnVersion: 1, feedback: "Strong quality inspection capability. Consider adding certified senior assemblers to move towards Tier 1.",
    verified: [{ criterionId: "sk-assembly", rating: 4, visible: true }, { criterionId: "sk-qc", rating: 3, visible: true }, { criterionId: "sk-maint", rating: 3, visible: false }],
  });
  Object.assign(released, { status: "Result Released", updated: "2026-06-02", history: [log("Requested", "2026-04-14", "SLM"), log("Submitted", "2026-04-30", "Maya Chen", submissionRef(released.id, 1)), log("Under Review", "2026-05-06", "SLM"), log("Assessment In Progress", "2026-05-12", "SLM"), log("Pending Central Verification", "2026-05-22", "SLM"), log("Pending Qualification Approval", "2026-05-28", "SLM"), log("Result Released", "2026-06-02", "SLM", "Qualified")] });

  const lapsed = base("QR-2025-0031", supplierId, { scope: "Contract machining (previous cycle)", requestedAt: "2025-08-04", dueDate: "2025-08-30", criteria: pick("sk-cnc", "sk-qc"), requiredEvidence: REQUIRED_EVIDENCE.filter((item) => item.mandatory) });
  lapsed.submissions.push(submitted(lapsed, { "sk-cnc": 3, "sk-qc": 3 }, "2025-08-25"));
  lapsed.results.push({
    id: "res-0031-1", releasedAt: "2025-10-01T08:00:00.000Z", outcome: "Conditional", tier: "Tier 3", tierNote: "Approved with conditions for a limited period.", approvedCategory: "Industrial Components", approvedScope: "Contract machining (previous cycle)",
    effectiveDate: "2025-10-01", expiryDate: "2026-09-30", basedOnVersion: 1, feedback: "Provide a calibration plan within six months.",
    verified: [{ criterionId: "sk-cnc", rating: 3, visible: true }, { criterionId: "sk-qc", rating: 2, visible: true }],
  });
  Object.assign(lapsed, { status: "Result Released", updated: "2025-10-01", history: [log("Requested", "2025-08-04", "SLM"), log("Submitted", "2025-08-25", "Maya Chen", submissionRef(lapsed.id, 1)), log("Result Released", "2025-10-01", "SLM", "Conditional")] });

  const foreign = base("QR-2026-0015", "SUP-99999", { buyer: "Another Buyer Co.", scope: "Confidential request of another supplier", requestedAt: "2026-10-30" });
  return [open, review, released, lapsed, ...exampleCases(supplierId), foreign];
}

export function initialQsl(supplierId: string): QslState {
  return { role: "Supplier Admin", userCanSubmit: QSL_RULES.userCanSubmitDefault, requests: seedRequests(supplierId), audit: [] };
}

/** Saved data from before this feature, or missing seeds, are topped up without touching supplier work. */
export function migrateQsl(saved: Partial<QslState> | undefined, supplierId: string): QslState {
  const seed = initialQsl(supplierId);
  if (!saved || !Array.isArray(saved.requests)) return seed;
  const requests = [...saved.requests, ...seed.requests.filter((item) => !saved.requests!.some((existing) => existing.id === item.id))];
  return { role: seed.role, userCanSubmit: seed.userCanSubmit, requests, audit: saved.audit ?? [] };
}
