// Supplier-side QSL operations. Every function runs inside store.mutate() and re-checks supplier
// ownership, role permission and editability, so hiding a button in the UI is never the only guard.
// Swap the bodies for SLM API calls when the integration exists; the signatures can stay.
import { DOC_TYPES, docVersions, pushDocument, todayIso } from "./docs";
import {
  can, currentResponse, editScope, inScope, latestResult, latestSubmission, openInfoRequest, profileSnapshot, submissionRef, validateEvidenceFile, validateResponse,
  type EditScope, type EvidenceRef, type QslAction, type QslRequest, type QslResponse, type QslStatus, type Validation,
} from "./qsl";
import type { Db, FileMeta } from "./types";

export type Result<T = undefined> = { ok: true; value: T } | { ok: false; error: string; validation?: Validation };
const fail = (error: string, validation?: Validation): { ok: false; error: string; validation?: Validation } => ({ ok: false, error, validation });
const ok = <T,>(value: T): Result<T> => ({ ok: true, value });

const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const actor = (db: Db) => ({ name: db.profile.contact, role: db.qsl.role });

/** Requests that belong to the signed-in supplier. Other suppliers' records are never returned. */
export const listRequests = (db: Db) => db.qsl.requests.filter((request) => request.supplierId === db.profile.id);
export const getRequest = (db: Db, id: string) => listRequests(db).find((request) => request.id === id);

function writeAudit(db: Db, request: QslRequest, action: string, ref: string, prev?: string, next?: string) {
  const by = actor(db);
  db.qsl.audit.unshift({ id: newId("aud"), at: new Date().toISOString(), action, supplierId: db.profile.id, requestId: request.id, ref, by: by.name, role: by.role, prev, next });
}

/** Mutates the request status and the supplier-visible status history. */
function pushStatus(request: QslRequest, status: QslStatus, by: string, note?: string) {
  request.status = status;
  request.updated = todayIso();
  request.history.push({ status, at: new Date().toISOString(), by, note });
}

function access(db: Db, id: string, action: QslAction): Result<QslRequest> {
  const request = getRequest(db, id);
  if (!request) return fail("Request not found.");
  if (!can(db.qsl, action)) return fail("Your role does not allow this action.");
  return ok(request);
}

export const acknowledge = (db: Db, id: string): Result => {
  const found = access(db, id, "acknowledge");
  if (!found.ok) return found;
  const request = found.value;
  if (request.acknowledgedAt) return ok(undefined);
  request.acknowledgedAt = new Date().toISOString();
  request.acknowledgedBy = actor(db).name;
  writeAudit(db, request, "Acknowledge request", request.id);
  return ok(undefined);
};

/** Compares the parts of a change that lie outside the permitted scope. */
const generalPart = (response: QslResponse) => JSON.stringify({ ...response, skills: undefined, evidence: undefined, replies: undefined, declaration: undefined });

function outOfScope(request: QslRequest, before: QslResponse, after: QslResponse, scope: EditScope): boolean {
  if (scope === "all") return false;
  if (!inScope(scope, "general") && generalPart(before) !== generalPart(after)) return true;
  for (const criterion of request.criteria) {
    if (!inScope(scope, criterion.id) && JSON.stringify(before.skills[criterion.id]) !== JSON.stringify(after.skills[criterion.id])) return true;
  }
  const locked = (list: EvidenceRef[]) => JSON.stringify(list.filter((ref) => !inScope(scope, ref.targetId)));
  return locked(before.evidence) !== locked(after.evidence);
}

/** Applies a supplier edit to the working draft. Auto-saved; self-rating changes are audited. */
export function editResponse(db: Db, id: string, change: (response: QslResponse) => void): Result {
  const found = access(db, id, "edit");
  if (!found.ok) return found;
  const request = found.value;
  const scope = editScope(request);
  if (!scope) return fail("This request can no longer be edited.");
  const before = currentResponse(request);
  const after = structuredClone(before);
  change(after);
  if (outOfScope(request, before, after, scope)) return fail("Only the items SLM asked you to change can be edited.");
  for (const criterion of request.criteria) {
    const previous = before.skills[criterion.id]?.selfRating ?? "";
    const next = after.skills[criterion.id]?.selfRating ?? "";
    if (previous !== next) writeAudit(db, request, "Update self-assessment", criterion.id, previous || "—", next || "—");
  }
  request.draft = after;
  if (request.status === "Requested") pushStatus(request, "Draft", actor(db).name);
  request.updated = todayIso();
  return ok(undefined);
}

export function saveDraft(db: Db, id: string): Result {
  const found = access(db, id, "edit");
  if (!found.ok) return found;
  if (!editScope(found.value)) return fail("This request can no longer be edited.");
  writeAudit(db, found.value, "Save draft", found.value.id);
  return ok(undefined);
}

const targetFor = (request: QslRequest, targetId: string) =>
  request.criteria.find((criterion) => criterion.id === targetId) ?? request.requiredEvidence.find((requirement) => requirement.id === targetId);

const targetTypes = (request: QslRequest, targetId: string) => {
  const target = targetFor(request, targetId);
  if (!target) return null;
  return "evidenceTypes" in target ? target.evidenceTypes : target.docTypes;
};

export const docKey = (db: Db, index: number) => db.documents[index].id || `DOC-${String(index + 1).padStart(4, "0")}`;

function addRef(db: Db, request: QslRequest, targetId: string, docIndex: number, note: string): Result<EvidenceRef> {
  const doc = db.documents[docIndex];
  const types = targetTypes(request, targetId);
  if (!types) return fail("Unknown criterion.");
  if (types.length && !types.includes(doc.type)) return fail("This document type is not accepted for this item.");
  const latest = docVersions(doc).at(-1);
  if (!latest) return fail("This document has no uploaded file yet.");
  doc.id = docKey(db, docIndex);
  const current = currentResponse(request);
  if (current.evidence.some((ref) => ref.targetId === targetId && ref.docId === doc.id)) return fail("This document is already attached.");
  const ref: EvidenceRef = {
    id: newId("ev"), targetId, docId: doc.id, docName: doc.name, docType: doc.type, version: latest.version, issue: doc.issue, expiry: doc.expiry && doc.expiry !== "—" ? doc.expiry : "",
    fileNames: latest.files.map((file) => file.name), note: note.slice(0, 500), addedAt: new Date().toISOString(), addedBy: actor(db).name,
  };
  const saved = editResponse(db, request.id, (response) => void response.evidence.push(ref));
  return saved.ok ? ok(ref) : saved;
}

/** Links an existing repository document; nothing is duplicated. */
export function attachDocument(db: Db, id: string, targetId: string, docId: string, note = ""): Result {
  const found = access(db, id, "upload");
  if (!found.ok) return found;
  const index = db.documents.findIndex((doc, position) => docKey(db, position) === docId);
  if (index < 0) return fail("Document not found.");
  const added = addRef(db, found.value, targetId, index, note);
  if (!added.ok) return added;
  writeAudit(db, found.value, "Attach evidence", added.value.docId, undefined, `${added.value.docName} v${added.value.version}`);
  return ok(undefined);
}

export interface EvidenceUpload { name: string; type: string; issue: string; expiry: string; note: string; files: FileMeta[]; replaces?: string }

/** Uploads into the Supplier Document repository (same name+type adds a version) and links it. */
export function uploadEvidence(db: Db, id: string, targetId: string, input: EvidenceUpload): Result<Record<string, string>> {
  const found = access(db, id, "upload");
  if (!found.ok) return found;
  const request = found.value;
  const scope = editScope(request);
  if (!scope || !inScope(scope, targetId)) return fail("This item cannot be changed now.");
  const errors: Record<string, string> = {};
  if (!input.name.trim()) errors.name = "This field is required.";
  else if (input.name.length > 255) errors.name = "Maximum 255 characters.";
  if (!DOC_TYPES.includes(input.type)) errors.type = "Select a document type.";
  const accepted = targetTypes(request, targetId);
  if (!accepted) return fail("Unknown criterion.");
  if (accepted.length && DOC_TYPES.includes(input.type) && !accepted.includes(input.type)) errors.type = "This document type is not accepted for this item.";
  if (input.issue && input.issue > todayIso()) errors.issue = "The issue date cannot be in the future.";
  if (input.issue && input.expiry && input.expiry < input.issue) errors.expiry = "The expiry date cannot be before the issue date.";
  if (!input.files.length) errors.files = "Choose a file.";
  for (const file of input.files) {
    const problem = validateEvidenceFile({ name: file.name, size: file.size ?? 0 });
    if (problem) errors.files = problem;
  }
  if (input.note.length > 500) errors.note = "Maximum 500 characters.";
  if (Object.keys(errors).length) return { ok: false, error: "Complete the highlighted fields.", validation: { errors, warnings: {} } };

  const files = input.files.map((file) => ({ ...file, expiry: input.expiry }));
  const doc = pushDocument(db, files, { name: input.name.trim(), type: input.type, group: "Qualification", related: request.productCategory });
  if (!doc) return fail("Choose a file.");
  if (input.issue) doc.issue = input.issue;
  const index = db.documents.indexOf(doc);
  const sameDoc = docKey(db, index);
  // Uploading again under a name+type that is already attached to this item replaces that link.
  const replaced = input.replaces || currentResponse(request).evidence.find((ref) => ref.targetId === targetId && ref.docId === sameDoc)?.id;
  if (replaced) {
    const removed = editResponse(db, id, (response) => void (response.evidence = response.evidence.filter((ref) => ref.id !== replaced)));
    if (!removed.ok) return removed;
  }
  const added = addRef(db, request, targetId, index, input.note);
  if (!added.ok) return added;
  writeAudit(db, request, replaced ? "Replace evidence" : "Upload evidence", added.value.docId, undefined, `${added.value.docName} v${added.value.version}`);
  return ok({});
}

/** Removes the link only. The document stays in the repository and in any submitted snapshot. */
export function removeEvidence(db: Db, id: string, refId: string): Result {
  const found = access(db, id, "upload");
  if (!found.ok) return found;
  const existing = currentResponse(found.value).evidence.find((ref) => ref.id === refId);
  if (!existing) return fail("Evidence not found.");
  const saved = editResponse(db, id, (response) => void (response.evidence = response.evidence.filter((ref) => ref.id !== refId)));
  if (!saved.ok) return saved;
  writeAudit(db, found.value, "Remove evidence", existing.docId, `${existing.docName} v${existing.version}`, undefined);
  return ok(undefined);
}

/** Creates an immutable submission (or revision) version. Duplicate and stale submits are rejected. */
export function submitResponse(db: Db, id: string, expectedVersion: number): Result<string> {
  const found = access(db, id, "submit");
  if (!found.ok) return found;
  const request = found.value;
  const scope = editScope(request);
  if (!scope) return fail("This request was already submitted.");
  const version = request.submissions.length + 1;
  if (expectedVersion !== version) return fail("This request was already submitted.");
  const response = structuredClone(currentResponse(request));
  const validation = validateResponse(db, request, response);
  if (Object.keys(validation.errors).length) return fail("Complete the highlighted items before submitting.", validation);

  const info = request.status === "Additional Information Required" ? openInfoRequest(request) : undefined;
  const previous = latestSubmission(request);
  const by = actor(db);
  const ref = submissionRef(request.id, version);
  request.submissions.push({
    ref, version, kind: previous ? "Revision" : "Initial", submittedAt: new Date().toISOString(), submittedBy: by.name, role: by.role,
    response, profile: profileSnapshot(db), revisesVersion: previous?.version, infoRequestId: info?.id,
  });
  request.draft = null;
  if (info) Object.assign(info, { status: "Responded", respondedAt: new Date().toISOString(), respondedVersion: version });
  pushStatus(request, "Submitted", by.name, previous ? `Revision ${ref}` : ref);
  writeAudit(db, request, previous ? "Submit revision" : "Submit qualification response", ref, previous?.ref, ref);
  if (info) writeAudit(db, request, "Respond to additional information request", info.id, undefined, ref);
  return ok(ref);
}

/** Audits the first time a released result is opened. */
export function recordResultViewed(db: Db, id: string): Result {
  const request = getRequest(db, id);
  const result = request && latestResult(request);
  if (!request || !result || !can(db.qsl, "view")) return fail("Request not found.");
  if (!db.qsl.audit.some((entry) => entry.requestId === id && entry.action === "View released result" && entry.ref === result.id)) writeAudit(db, request, "View released result", result.id);
  return ok(undefined);
}
