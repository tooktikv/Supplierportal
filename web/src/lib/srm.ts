import type { FileMeta } from "./types";

export type SrmSelectType = "" | "Innovation" | "Sustainability";
export type SrmProgress = "" | "Not Start" | "In progress" | "Implement";

export interface SrmProject {
  id: string;
  status: "Draft" | "Submitted";
  selectType: SrmSelectType;
  name: string;
  projectType: string;
  objective: string;
  owner: string;
  benefit: string;
  indicator: "" | "%" | "MB";
  startDate: string;
  endDate: string;
  /** False while End Date is still the system prefill (start + 2 years). */
  endEdited: boolean;
  files: FileMeta[];
  updateMonth: string;
  progress: SrmProgress;
  progressFiles: FileMeta[];
  details: string;
  updated: string;
}

export interface CfoEntry {
  id: string;
  certNo: string;
  standard: "" | "อบก. (TGO)" | "ISO 14064";
  scopeDate: string;
  scope1: string;
  scope2: string;
  scope3: string;
  scope3Category: string;
  production: string;
  unit: string;
  files: FileMeta[];
}

export interface CfpEntry {
  id: string;
  kind: "period" | "product";
  certNo: string;
  standard: "" | "อบก. (TGO)" | "ISO 14067";
  product: string;
  perUnit: string;
  unit: string;
  scope: "" | "B2B" | "B2C";
  period: string;
  files: FileMeta[];
}

/** Every SRM list item shares these fields; edits flip it back to Draft until it is submitted again. */
export interface SrmRecordMeta {
  id: string;
  status: "Draft" | "Submitted";
  updated: string;
}

export interface GhgRecord extends SrmRecordMeta {
  type: "" | "CFO" | "CFP";
  cfo: CfoEntry[];
  cfp: CfpEntry[];
}

export const HR_STANDARDS = ["มาตรฐานแรงงานไทย (มรท.8001)", "SA8000", "SMETA", "อื่น ๆ"] as const;
export interface HrRecord extends SrmRecordMeta {
  standard: "" | (typeof HR_STANDARDS)[number];
  other: string;
  expiry: string;
  files: FileMeta[];
}

export interface GovRecord extends SrmRecordMeta {
  cac: "" | "Yes" | "No";
  cacExpiry: string;
  cacFiles: FileMeta[];
  coc: "" | "Yes" | "No";
  cocFiles: FileMeta[];
}

export interface SrmState {
  projects: SrmProject[];
  ghg: GhgRecord[];
  humanRights: HrRecord[];
  governance: GovRecord[];
}

// Mock master data: replace with the real lists when they are available.
export const PROJECT_TYPES: Record<string, string[]> = {
  Innovation: ["Process improvement", "Alternative material", "Product redesign", "Automation / digitalization"],
  Sustainability: ["Energy efficiency", "Waste reduction", "Water saving", "Renewable energy"],
};
export const SOURCING_OWNERS = ["Olivia Martin", "Daniel Park", "Priya Nair", "Lukas Meyer"];
export const MASTER_UNITS = ["kg", "tonne", "piece", "pack", "litre", "m³"];
export const SCOPE3 = [
  ["Purchased Goods and Services", "สินค้าและบริการที่จัดซื้อ"],
  ["Capital Goods", "สินทรัพย์ถาวร / สินค้าทุน"],
  ["Fuel- and Energy-Related Activities (not included in Scope 1 or Scope 2)", "กิจกรรมที่เกี่ยวข้องกับเชื้อเพลิงและพลังงาน (ที่ไม่รวมใน Scope 1 และ Scope 2)"],
  ["Upstream Transportation and Distribution", "การขนส่งและกระจายสินค้าต้นน้ำ"],
  ["Waste Generated in Operations", "ของเสียที่เกิดจากการดำเนินงาน"],
  ["Business Travel", "การเดินทางเพื่อธุรกิจ"],
  ["Employee Commuting", "การเดินทางของพนักงาน"],
  ["Upstream Leased Assets", "สินทรัพย์เช่าต้นน้ำ"],
  ["Downstream Transportation and Distribution", "การขนส่งและกระจายสินค้าปลายน้ำ"],
  ["Processing of Sold Products", "การแปรรูปผลิตภัณฑ์ที่จำหน่าย"],
  ["Use of Sold Products", "การใช้ผลิตภัณฑ์ที่จำหน่าย"],
  ["End-of-Life Treatment of Sold Products", "การจัดการผลิตภัณฑ์หลังหมดอายุการใช้งาน"],
  ["Downstream Leased Assets", "สินทรัพย์เช่าปลายน้ำ"],
  ["Franchises", "แฟรนไชส์"],
  ["Investments", "การลงทุน"],
];
/** GHG Protocol Scope 3 categories (EN / TH) from the master data sheet. */
export const SCOPE3_CATEGORIES = SCOPE3.map(([en], index) => `${index + 1}. ${en}`);
/** Maps a saved category (matched by its leading number) to the current option text. */
export const normalizeScope3 = (value: string) => SCOPE3_CATEGORIES[Number(/^(\d+)\./.exec(value || "")?.[1]) - 1] || "";

export const newId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

export const emptyProject = (): SrmProject => ({
  id: newId("prj"), status: "Draft", selectType: "", name: "", projectType: "", objective: "", owner: "", benefit: "", indicator: "",
  startDate: "", endDate: "", endEdited: false, files: [], updateMonth: "", progress: "", progressFiles: [], details: "", updated: new Date().toISOString().slice(0, 10),
});
export const emptyCfo = (id = newId("cfo")): CfoEntry => ({ id, certNo: "", standard: "", scopeDate: "", scope1: "", scope2: "", scope3: "", scope3Category: "", production: "", unit: "", files: [] });
export const emptyCfp = (kind: CfpEntry["kind"] = "period", id = newId("cfp")): CfpEntry => ({ id, kind, certNo: "", standard: "", product: "", perUnit: "", unit: "", scope: "", period: "", files: [] });
const todayIsoDate = () => new Date().toISOString().slice(0, 10);
export const emptyGhg = (): GhgRecord => ({ id: newId("ghg"), status: "Draft", updated: todayIsoDate(), type: "", cfo: [emptyCfo()], cfp: [emptyCfp("period")] });
export const emptyHr = (): HrRecord => ({ id: newId("hr"), status: "Draft", updated: todayIsoDate(), standard: "", other: "", expiry: "", files: [] });
export const emptyGov = (): GovRecord => ({ id: newId("gov"), status: "Draft", updated: todayIsoDate(), cac: "", cacExpiry: "", cacFiles: [], coc: "", cocFiles: [] });

export const initialSrm = (): SrmState => ({
  projects: [
    {
      id: "prj-demo01", status: "Submitted", selectType: "Sustainability", name: "Solar rooftop at Portland plant", projectType: "Renewable energy", objective: "Install rooftop solar to cut purchased electricity. Fictional demo record.",
      owner: "Olivia Martin", benefit: "12.50", indicator: "%", startDate: "2026-03-01", endDate: "2028-03-01", endEdited: false,
      files: [{ name: "solar-project-brief.pdf", size: 420000, type: "application/pdf" }], updateMonth: "2026-09", progress: "In progress", progressFiles: [], details: "", updated: "2026-09-30",
    },
  ],
  ghg: [
    {
      id: "ghg-demo01", status: "Submitted", updated: "2026-09-30", type: "CFO",
      cfo: [{ id: "cfo-demo01", certNo: "TGO CFO FY25-01-014", standard: "ISO 14064", scopeDate: "2025-12-31", scope1: "110.40", scope2: "72.10", scope3: "310.00", scope3Category: SCOPE3_CATEGORIES[0], production: "14000", unit: "tonne", files: [{ name: "cfo-certificate.pdf", size: 310000, type: "application/pdf" }] }],
      cfp: [emptyCfp("period", "cfp-demo01")],
    },
  ],
  humanRights: [
    { id: "hr-demo01", status: "Submitted", updated: "2026-09-30", standard: "SA8000", other: "", expiry: "2027-06-30", files: [{ name: "sa8000-certificate.pdf", size: 280000, type: "application/pdf" }] },
  ],
  governance: [
    { id: "gov-demo01", status: "Submitted", updated: "2026-09-30", cac: "Yes", cacExpiry: "2027-03-31", cacFiles: [{ name: "cac-membership.pdf", size: 190000, type: "application/pdf" }], coc: "Yes", cocFiles: [{ name: "code-of-conduct.pdf", size: 240000, type: "application/pdf" }] },
  ],
});

/**
 * Older saved data kept GHG / human rights / governance as a single form object.
 * Turns each of those into list records; untouched (empty) forms are replaced by the demo seed.
 */
export function migrateSrmRecords(srm: Record<string, any>, seed: SrmState) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const meta = (old: { submittedAt?: string }) => ({ status: old.submittedAt ? "Submitted" : "Draft", updated: (old.submittedAt || new Date().toISOString()).slice(0, 10) });
  if (!Array.isArray(srm.ghg)) {
    const old = srm.ghg;
    srm.ghg = old?.type ? [{ ...old, id: newId("ghg"), ...meta(old), submittedAt: undefined }] : structuredClone(seed.ghg);
  }
  if (!Array.isArray(srm.humanRights)) {
    const entries = (srm.humanRights?.entries || []).filter((entry: { standard?: string }) => entry.standard);
    srm.humanRights = entries.length ? entries.map((entry: object) => ({ ...entry, ...meta(srm.humanRights) })) : structuredClone(seed.humanRights);
  }
  if (!Array.isArray(srm.governance)) {
    const old = srm.governance;
    srm.governance = old?.cac || old?.coc ? [{ ...old, id: newId("gov"), ...meta(old), submittedAt: undefined }] : structuredClone(seed.governance);
  }
}

const DECIMAL = /^-?\d+(\.\d{1,2})?$/;
const POSITIVE = (value: string) => /^\d+(\.\d{1,2})?$/.test(value.trim()) && Number(value) > 0;
const REQUIRED = "This field is required.";
const POSITIVE_MESSAGE = "Enter a number greater than 0 with up to 2 decimals.";
type Errors = Record<string, string>;

/** Adds two years to an ISO date (29 Feb falls back to 28 Feb). */
export function addTwoYears(iso: string) {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return "";
  return `${Number(year) + 2}-${month}-${month === "02" && day === "29" ? "28" : day}`;
}

export const dmy = (iso?: string) => (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split("-").reverse().join("-") : "—");
export const my = (value?: string) => (value && /^\d{4}-\d{2}$/.test(value) ? value.split("-").reverse().join("-") : "—");

const text = (errors: Errors, key: string, value: string, max: number, required = true) => {
  if (required && !value.trim()) errors[key] = REQUIRED;
  else if (value.length > max) errors[key] = `Maximum ${max} characters.`;
};

export function projectErrors(p: SrmProject): Errors {
  const e: Errors = {};
  if (!p.selectType) e.selectType = "Select a type.";
  text(e, "name", p.name, 255);
  if (!p.projectType || !PROJECT_TYPES[p.selectType]?.includes(p.projectType)) e.projectType = "Select a project type.";
  text(e, "objective", p.objective, 5000, false);
  if (!p.owner) e.owner = "Select a sourcing owner.";
  if (!DECIMAL.test(p.benefit.trim())) e.benefit = "Enter a number with up to 2 decimals (positive or negative).";
  if (!p.indicator) e.indicator = "Select an indicator.";
  if (!p.startDate) e.startDate = REQUIRED;
  if (!p.endDate) e.endDate = REQUIRED;
  else if (p.startDate && p.endDate < p.startDate) e.endDate = "End date cannot be before the start date.";
  if (p.files.length < 1) e.files = "Attach at least 1 PDF (max 3).";
  if (!/^\d{4}-\d{2}$/.test(p.updateMonth)) e.updateMonth = "Select the update month.";
  if (!p.progress) e.progress = "Select the progress.";
  text(e, "details", p.details, 5000, false);
  return e;
}

export function cfoErrors(entry: CfoEntry): Errors {
  const e: Errors = {};
  text(e, "certNo", entry.certNo, 255);
  if (!entry.standard) e.standard = "Select a standard.";
  if (!entry.scopeDate) e.scopeDate = REQUIRED;
  for (const key of ["scope1", "scope2", "scope3", "production"] as const) if (!POSITIVE(entry[key])) e[key] = POSITIVE_MESSAGE;
  if (!entry.scope3Category) e.scope3Category = "Select a category.";
  if (!entry.unit) e.unit = "Select a unit.";
  if (entry.files.length !== 1) e.files = "Attach 1 PDF certificate.";
  return e;
}

export function cfpErrors(entry: CfpEntry): Errors {
  const e: Errors = {};
  text(e, "certNo", entry.certNo, 255);
  if (!entry.standard) e.standard = "Select a standard.";
  text(e, "product", entry.product, 5000);
  if (!POSITIVE(entry.perUnit)) e.perUnit = POSITIVE_MESSAGE;
  if (!entry.unit) e.unit = "Select a unit.";
  if (!entry.scope) e.scope = "Select B2B or B2C.";
  if (!entry.period) e.period = REQUIRED;
  if (entry.files.length !== 1) e.files = "Attach 1 PDF certificate.";
  return e;
}

export function hrErrors(entry: Pick<HrRecord, "standard" | "other" | "expiry" | "files">): Errors {
  const e: Errors = {};
  if (!entry.standard) e.standard = "Select a standard.";
  if (entry.standard === "อื่น ๆ") text(e, "other", entry.other, 255);
  if (!entry.expiry) e.expiry = REQUIRED;
  if (entry.files.length !== 1) e.files = "Attach 1 PDF certificate.";
  return e;
}

export function govErrors(g: GovRecord): Errors {
  const e: Errors = {};
  if (!g.cac) e.cac = "Select Yes or No.";
  if (g.cac === "Yes") {
    if (!g.cacExpiry) e.cacExpiry = REQUIRED;
    if (g.cacFiles.length !== 1) e.cacFiles = "Attach 1 PDF document.";
  }
  if (!g.coc) e.coc = "Select Yes or No.";
  if (g.coc === "Yes" && g.cocFiles.length !== 1) e.cocFiles = "Attach 1 PDF document.";
  return e;
}

/** Errors keyed `${entryId}.${field}`; the selected certification type decides which sets are checked. */
export function ghgErrors(g: GhgRecord): Errors {
  const e: Errors = {};
  if (!g.type) {
    e.type = "Select the Carbon Footprint certification type.";
    return e;
  }
  const entries = g.type === "CFO" ? g.cfo.map((entry) => [entry.id, cfoErrors(entry)] as const) : g.cfp.map((entry) => [entry.id, cfpErrors(entry)] as const);
  for (const [id, errors] of entries) for (const [field, message] of Object.entries(errors)) e[`${id}.${field}`] = message;
  return e;
}

/** Errors keyed `${record.id}.${field}`, matching the field names used by the form. */
export function hrAllErrors(record: HrRecord): Errors {
  const e: Errors = {};
  for (const [field, message] of Object.entries(hrErrors(record))) e[`${record.id}.${field}`] = message;
  return e;
}
