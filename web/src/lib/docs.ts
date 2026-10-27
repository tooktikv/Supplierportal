/* eslint-disable @typescript-eslint/no-explicit-any -- records are JSON-like, as in the mock-up */
import type { Db, DocRecord, DocVersion, FileMeta, RequestRec } from "./types";

export const todayIso = () => new Date().toISOString().slice(0, 10);

export const fmtDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
        new Date(value.length === 10 ? `${value}T12:00:00` : value),
      )
    : "—";

export const DOC_SOURCES: Record<string, string> = {
  Registration: "Supplier registration",
  "Pre-Screening": "Pre-screening",
  "Sample Request": "Sample request",
  Manual: "Manual upload",
};
export const docSource = (doc: DocRecord) => DOC_SOURCES[doc.group] || doc.group || "—";

export const DOC_TYPES = [
  "Company Registration",
  "Tax Documentation",
  "Identity Document",
  "Site Photos",
  "Quality Certification",
  "Factory Documentation",
  "Insurance Certificate",
  "Supplier Declaration",
  "Product Evidence",
  "Questionnaire Evidence",
  "Other",
];

/** Session-only object URLs keyed by FileMeta.uid; file contents are never stored in the db. */
export const filePreviews = new Map<string, string>();

export function trackFile(file: File, type: string): FileMeta {
  const uid = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  if (/\.(pdf|png|jpe?g)$/i.test(file.name)) filePreviews.set(uid, URL.createObjectURL(file));
  return { name: file.name, size: file.size, type, expiry: "", uid };
}

export function clearFilePreviews() {
  for (const url of filePreviews.values()) URL.revokeObjectURL(url);
  filePreviews.clear();
}

export const findDocByName = (db: Db, name: string, type?: string) =>
  db.documents.find(
    (d) => d.name.trim().toLowerCase() === String(name || "").trim().toLowerCase() && (!type || d.type === type),
  );

/** Each document keeps every upload as a version; old-shape or seeded records are converted on read. */
export function docVersions(doc: DocRecord): DocVersion[] {
  const expiry = doc.expiry && doc.expiry !== "—" ? doc.expiry : "";
  const list: DocVersion[] = (doc.history || []).map((v: any) =>
    v.files ? v : { version: v.version, date: v.date, files: [{ name: v.fileName || doc.name, size: (doc as any).fileSize, expiry }] },
  );
  return list.length || !doc.issue ? list : [{ version: 1, date: doc.issue, files: [{ name: `${doc.name}.pdf`, expiry }] }];
}

export const latestUpload = (doc: DocRecord) => docVersions(doc).at(-1)?.date || doc.issue || "";

export function expiryState(doc: DocRecord): "" | "Expired" | "Expiring Soon" {
  if (!doc.expiry || doc.expiry === "—") return "";
  const days = (new Date(`${doc.expiry}T23:59:59`).getTime() - Date.now()) / 864e5;
  return days < 0 ? "Expired" : days <= 30 ? "Expiring Soon" : "";
}

export function documentStatus(doc: DocRecord): string {
  if (doc.status === "Required") return "Required";
  const expiry = expiryState(doc);
  if (expiry) return expiry;
  if (doc.status === "Expiring Soon") return "Expiring Soon";
  if (doc.status === "Pending") return "Under Review";
  return "Approved";
}

/** Mutates db. Same document name + type = new version of the existing record; older versions stay in history. */
export function pushDocument(
  db: Db,
  files: FileMeta[],
  { name, type, group, related = db.profile.company }: { name: string; type: string; group: string; related?: string },
): DocRecord | null {
  if (!files.length) return null;
  let doc = findDocByName(db, name, type);
  if (doc) doc.history = docVersions(doc);
  else {
    doc = {
      id: `DOC-${String(db.documents.length + 1).padStart(4, "0")}`,
      name,
      type,
      related,
      group,
      status: "Pending",
      history: [],
      issue: "",
      expiry: "",
    };
    db.documents.push(doc);
  }
  const today = todayIso();
  const expiries = files.map((f) => f.expiry).filter(Boolean).sort() as string[];
  doc.history!.push({
    version: doc.history!.length + 1,
    date: today,
    files: files.map((f) => ({ name: f.name, size: f.size, type: f.type || "", expiry: f.expiry || "", uid: f.uid })),
  });
  Object.assign(doc, { issue: today, expiry: expiries[0] || "", status: "Pending" });
  return doc;
}

export const addRequestDocuments = (db: Db, r: RequestRec, files: FileMeta[] = r.files || []) =>
  pushDocument(db, files, {
    name: `Sample attachments · ${r.id} · ${r.name}`,
    type: "Product Evidence",
    group: "Sample Request",
    related: r.name,
  });

/** Preview watermark time, e.g. 16/10/2026 10:13 (ICT). */
export function wmTime() {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Bangkok",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .map((x) => [x.type, x.value]),
  );
  return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute} (ICT)`;
}
