import { COMPANY } from "./data";
import { pushDocument, trackFile } from "./docs";
import type { Db, FileMeta } from "./types";

// Registration form data is dynamic (keys come from the field specs), so it stays loosely typed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RegData = Record<string, any>;
export type RegScope = "reg" | "site" | `cat:${number}`;

export interface RegFieldSpec {
  k: string;
  label: string;
  t: "text" | "select" | "radio" | "checkbox" | "textarea" | "date" | "file";
  opts?: string[] | ((d: RegData) => string[]);
  req?: boolean | 1;
  /** Required only when this returns true ("Yes with Conditional"). */
  reqWhen?: (d: RegData) => boolean;
  /** Requirement shown to the supplier under the field. */
  note?: string;
  max?: number;
  mode?: string;
  ph?: string;
  span?: number;
  check?: (v: string, d: RegData) => string;
  ro?: (d: RegData) => boolean;
  dis?: (d: RegData) => boolean;
  show?: (d: RegData) => boolean;
  reset?: string[];
  kind?: "pdf" | "img";
  docType?: string;
  expiryRequired?: boolean;
}

export interface RegSection {
  title: string;
  hint?: string;
  map?: boolean;
  fields: RegFieldSpec[];
}

export const REG_STEPS = ["ข้อมูลทั่วไป", "เอกสารสำคัญ", "ข้อมูลกลุ่มสินค้า", "ตรวจสอบข้อมูล"];
export const REG_COUNTRIES = ["ไทย", "ลาว", "กัมพูชา", "เมียนมา", "เวียดนาม", "มาเลเซีย", "สิงคโปร์", "อินโดนีเซีย", "ฟิลิปปินส์", "จีน", "ญี่ปุ่น", "เกาหลีใต้", "อินเดีย", "สหรัฐอเมริกา", "สหราชอาณาจักร", "เยอรมนี", "ออสเตรเลีย"];
export const REG_COMPANY_PREFIX = ["บจก.", "บมจ.", "หจก.", "ห้างหุ้นส่วนสามัญ", "สหกรณ์", "วิสาหกิจชุมชน"];
export const REG_PERSON_PREFIX = ["นาย", "นาง", "นางสาว", "ดร."];
export const REG_POSITIONS = ["เจ้าของกิจการ", "กรรมการผู้จัดการ", "ผู้จัดการ", "เจ้าหน้าที่/พนักงาน", "เจ้าหน้าที่ฝ่ายขาย", "เจ้าหน้าที่ฝ่ายบัญชี", "อื่นๆ"];
export const REG_DEPARTMENTS = ["ฝ่ายบริหาร", "ฝ่ายขาย", "ฝ่ายจัดซื้อ", "ฝ่ายผลิต", "ฝ่ายควบคุมคุณภาพ", "ฝ่ายบัญชีและการเงิน", "อื่นๆ"];

// Sample master data only; production must load the full province/district/sub-district lists.
export const REG_ADDRESS: Record<string, Record<string, string[]>> = {
  "กรุงเทพมหานคร": { "บางรัก": ["สีลม", "สุริยวงศ์", "บางรัก", "มหาพฤฒาราม", "สี่พระยา"], "คลองเตย": ["คลองเตย", "คลองตัน", "พระโขนง"], "จตุจักร": ["จตุจักร", "ลาดยาว", "จอมพล"] },
  "นนทบุรี": { "เมืองนนทบุรี": ["สวนใหญ่", "ตลาดขวัญ", "บางเขน"], "ปากเกร็ด": ["ปากเกร็ด", "บางตลาด"] },
  "สมุทรปราการ": { "เมืองสมุทรปราการ": ["ปากน้ำ", "สำโรงเหนือ"], "บางพลี": ["บางพลีใหญ่", "บางแก้ว"] },
  "ชลบุรี": { "เมืองชลบุรี": ["บางปลาสร้อย", "เสม็ด"], "ศรีราชา": ["ศรีราชา", "สุรศักดิ์"] },
  "เชียงใหม่": { "เมืองเชียงใหม่": ["ศรีภูมิ", "พระสิงห์"], "สารภี": ["ยางเนิ้ง", "ไชยสถาน"] },
};

// Sample master data only; replace with the real Main / Sub / Material Group lists.
export const REG_PRODUCTS: Record<string, Record<string, string[]>> = {
  "วัตถุดิบอาหาร": { "เนื้อสัตว์และผลิตภัณฑ์": ["เนื้อไก่", "เนื้อสุกร", "เนื้อสัตว์น้ำ"], "พืชผักและผลไม้": ["ผักสด", "ผลไม้สด", "ธัญพืช"] },
  "บรรจุภัณฑ์": { "บรรจุภัณฑ์พลาสติก": ["ถุงพลาสติก", "ถาดพลาสติก"], "บรรจุภัณฑ์กระดาษ": ["กล่องกระดาษ", "ฉลากและสติกเกอร์"] },
  "อะไหล่และอุปกรณ์": { "อะไหล่เครื่องจักร": ["ลูกปืนและซีล", "วาล์วและท่อ"], "อุปกรณ์ความปลอดภัย": ["อุปกรณ์ป้องกันส่วนบุคคล", "เวชภัณฑ์"] },
  "บริการ": { "โลจิสติกส์": ["ขนส่งควบคุมอุณหภูมิ", "คลังสินค้า"], "บริการสนับสนุน": ["ทำความสะอาด", "กำจัดแมลง"] },
};

export const chkThai = (v: string) => (/^[\u0E00-\u0E7F\s.]+$/.test(v) ? "" : "กรอกเป็นภาษาไทยเท่านั้น");
export const chkEn = (v: string) => (/^[A-Za-z\s.'-]+$/.test(v) ? "" : "กรอกเป็นภาษาอังกฤษเท่านั้น");
export const chkPhone = (v: string) => (/^\d{9,15}$/.test(v) ? "" : "ระบุตัวเลข 9-15 หลัก");
export const chkEmail = (v: string) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "รูปแบบอีเมลไม่ถูกต้อง");
export const chkCoord = (min: number, max: number, name: string) => (v: string) =>
  /^-?\d+(\.\d+)?$/.test(v) && Number(v) >= min && Number(v) <= max ? "" : `${name}ต้องเป็นตัวเลขระหว่าง ${min} ถึง ${max}`;

export function chkRegDate(v: string) {
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(v);
  if (!m) return "ระบุวันที่ในรูปแบบ DD-MM-YYYY";
  const date = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return date.getFullYear() === Number(m[3]) && date.getMonth() === Number(m[2]) - 1 && date.getDate() === Number(m[1]) ? "" : "วันที่ไม่ถูกต้อง";
}

/** yyyy-mm-dd from a native date input -> DD-MM-YYYY, or null when malformed. */
export function isoToRegDate(iso: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

const regPerson = (p: string, same: boolean): RegFieldSpec[] => {
  const lock = (d: RegData) => same && Boolean(d[`${p}same`]);
  return [
    ...(same ? [{ k: `${p}same`, label: "ใช้ข้อมูลเดียวกับผู้ใช้งานระบบ", t: "checkbox" as const }] : []),
    { k: `${p}prefix`, label: "คำนำหน้า", t: "select", opts: REG_PERSON_PREFIX, req: 1, ph: "เลือกคำนำหน้า" },
    { k: `${p}firstTh`, label: "ชื่อ (ไทย)", t: "text", req: 1, max: 255, check: chkThai, ph: "ระบุชื่อ" },
    { k: `${p}lastTh`, label: "นามสกุล (ไทย)", t: "text", req: 1, max: 255, check: chkThai, span: 2, ph: "ระบุนามสกุล" },
    { k: `${p}firstEn`, label: "ชื่อ (อังกฤษ)", t: "text", max: 255, check: chkEn, span: 2, ro: lock, ph: "First name" },
    { k: `${p}lastEn`, label: "นามสกุล (อังกฤษ)", t: "text", max: 255, check: chkEn, span: 2, ro: lock, ph: "Last name" },
    { k: `${p}position`, label: "ตำแหน่ง", t: "select", opts: REG_POSITIONS, req: 1, ph: "เลือกตำแหน่ง", reset: [`${p}positionOther`] },
    { k: `${p}positionOther`, label: "ระบุตำแหน่งอื่น", t: "text", req: 1, max: 255, ph: "กรณีเลือกอื่นๆ โปรดระบุตำแหน่ง", dis: (d) => d[`${p}position`] !== "อื่นๆ" },
    { k: `${p}dept`, label: "หน่วยงาน", t: "select", opts: REG_DEPARTMENTS, req: 1, ph: "เลือกหน่วยงาน", reset: [`${p}deptOther`] },
    { k: `${p}deptOther`, label: "ระบุหน่วยงานอื่น", t: "text", req: 1, max: 255, ph: "กรณีเลือกอื่นๆ โปรดระบุหน่วยงาน", dis: (d) => d[`${p}dept`] !== "อื่นๆ" },
    { k: `${p}phone`, label: "เบอร์โทรศัพท์", t: "text", mode: "tel", req: 1, check: chkPhone, span: 2, ro: lock, ph: "ระบุเบอร์โทรศัพท์" },
    { k: `${p}email`, label: "อีเมล", t: "text", mode: "email", req: 1, check: chkEmail, span: 2, ro: lock, ph: "ระบุอีเมล" },
  ];
};

export const REG_STEP1: RegSection[] = [
  {
    title: "ข้อมูลทั่วไป",
    fields: [
      { k: "companyType", label: "ประเภทบริษัท", t: "radio", opts: ["นิติบุคคล", "บุคคลธรรมดา"], req: 1 },
      { k: "country", label: "ประเทศที่จดทะเบียน", t: "select", opts: REG_COUNTRIES, req: 1, ph: "เลือกประเทศ" },
      { k: "regNo", label: "เลขทะเบียนนิติบุคคล", t: "text", req: 1, max: 20, ph: "ระบุเลขทะเบียน", check: (v) => (/^[A-Za-z0-9]+$/.test(v) ? "" : "ใช้ตัวอักษรหรือตัวเลขเท่านั้น ห้ามมีอักขระพิเศษ") },
      { k: "certDate", label: "วันที่ให้การรับรอง", t: "date", req: 1, ph: "DD-MM-YYYY", check: chkRegDate },
      { k: "vatRegistered", label: "การจดทะเบียนภาษีมูลค่าเพิ่ม", t: "radio", opts: ["จดทะเบียนแล้ว", "ยังไม่ได้จดทะเบียน"], req: 1 },
      { k: "companyPrefix", label: "คำนำหน้านิติบุคคล", t: "select", opts: REG_COMPANY_PREFIX, req: 1, ph: "เลือกคำนำหน้า" },
      { k: "companyName", label: "ชื่อนิติบุคคล", t: "text", req: 1, max: 255, span: 2, ph: "ระบุชื่อบริษัท" },
      { k: "businessType", label: "ประเภทธุรกิจผู้ขาย", t: "select", opts: ["ตัวแทนจำหน่าย", "ผู้ผลิต", "สหกรณ์", "เกษตรกร"], req: 1, ph: "เลือกประเภทธุรกิจผู้ขาย" },
      { k: "employees", label: "จำนวนพนักงาน", t: "text", mode: "numeric", req: 1, ph: "ระบุจำนวนพนักงาน", check: (v) => (/^\d+$/.test(v) && Number(v) > 0 ? "" : "ระบุจำนวนเต็มมากกว่า 0") },
      { k: "phone", label: "เบอร์โทรศัพท์", t: "text", mode: "tel", req: 1, check: chkPhone, ph: "ระบุเบอร์โทรศัพท์" },
      { k: "email", label: "อีเมล", t: "text", mode: "email", req: 1, check: chkEmail, ph: "ระบุอีเมล" },
      { k: "branchType", label: "สาขา", t: "radio", opts: ["สำนักงานใหญ่", "สาขา"], req: 1, reset: ["branchName"] },
      { k: "branchCode", label: "รหัสสาขา", t: "text", mode: "numeric", req: 1, ph: "ระบุรหัสสาขา", check: (v) => (/^\d{5}$/.test(v) ? "" : "ระบุตัวเลข 5 หลัก") },
      { k: "branchName", label: "ชื่อสาขา", t: "text", req: 1, max: 255, span: 2, ph: "ระบุชื่อสาขา", dis: (d) => d.branchType !== "สาขา" },
    ],
  },
  { title: "ข้อมูลผู้ติดต่อ", fields: regPerson("c_", true) },
  { title: "ข้อมูลเจ้าของบริษัท (หรือผู้มีอำนาจลงนามเอกสาร)", fields: regPerson("o_", false) },
  {
    title: "ที่อยู่บริษัท หรือสถานประกอบการ",
    fields: [
      { k: "a_country", label: "ประเทศ", t: "select", opts: REG_COUNTRIES, req: 1, ph: "เลือกประเทศ" },
      { k: "a_line1", label: "ที่อยู่ บรรทัดที่ 1", t: "text", req: 1, max: 500, span: 3, ph: "ระบุที่อยู่ บรรทัดที่ 1" },
      { k: "a_line2", label: "ที่อยู่ บรรทัดที่ 2 (ไม่บังคับ)", t: "text", max: 500, span: 4, ph: "ระบุที่อยู่ บรรทัดที่ 2" },
      { k: "a_province", label: "จังหวัด", t: "select", opts: Object.keys(REG_ADDRESS), req: 1, ph: "เลือกจังหวัด", reset: ["a_district", "a_sub"] },
      { k: "a_district", label: "เขต/อำเภอ", t: "select", opts: (d) => Object.keys(REG_ADDRESS[d.a_province] || {}), req: 1, ph: "เลือกเขต/อำเภอ", reset: ["a_sub"], dis: (d) => !d.a_province },
      { k: "a_sub", label: "แขวง/ตำบล", t: "select", opts: (d) => REG_ADDRESS[d.a_province]?.[d.a_district] || [], req: 1, ph: "เลือกแขวง/ตำบล", dis: (d) => !d.a_district },
      { k: "a_postal", label: "รหัสไปรษณีย์", t: "text", mode: "numeric", req: 1, ph: "ระบุรหัสไปรษณีย์", check: (v) => (/^\d{5}$/.test(v) ? "" : "ระบุรหัสไปรษณีย์ 5 หลัก") },
    ],
  },
  {
    title: "พิกัดที่ตั้งของบริษัท หรือสถานประกอบการ",
    hint: "กรุณาระบุตำแหน่งที่ตั้งของบริษัท หรือสถานประกอบการ",
    map: true,
    fields: [
      { k: "lat", label: "ละติจูด", t: "text", mode: "decimal", req: 1, span: 2, ph: "ระบุละติจูด เช่น 12.1234567", check: chkCoord(-90, 90, "ละติจูด") },
      { k: "lng", label: "ลองจิจูด", t: "text", mode: "decimal", req: 1, span: 2, ph: "ระบุลองจิจูด เช่น 100.1234567", check: chkCoord(-180, 180, "ลองจิจูด") },
      { k: "mapQuery", label: "สถานที่ตั้งบริษัท หรือสถานประกอบการ (ค้นหาด้วย Google Maps)", t: "text", span: 4, ph: "ค้นหาสถานที่" },
    ],
  },
];

const DOC_TYPES: Record<string, string> = {
  vat20: "Tax Documentation",
  sitePhotos: "Site Photos",
  idCopy: "Identity Document",
  houseReg: "Identity Document",
  signerId: "Identity Document",
};

export function regDocFields(d: RegData): RegFieldSpec[] {
  if (!["นิติบุคคล", "บุคคลธรรมดา"].includes(d.companyType)) return [];
  const list: [string, string, "pdf" | "img"][] =
    d.companyType === "บุคคลธรรมดา"
      ? [["idCopy", "สำเนาบัตรประชาชน", "pdf"], ["houseReg", "สำเนาทะเบียนบ้าน", "pdf"], ["sitePhotos", "รูปถ่ายสถานประกอบการ", "img"]]
      : [["companyInfo", "ข้อมูลบริษัท", "pdf"], ["certificate", "หนังสือรับรอง", "pdf"], ["vat20", "ภ.พ.20", "pdf"], ["signerId", "สำเนาบัตรประชาชนผู้มีอำนาจลงนาม", "pdf"], ["sitePhotos", "รูปถ่ายสถานประกอบการ", "img"]];
  const individual = d.companyType === "บุคคลธรรมดา";
  const signerNote = "ต้องเป็นบุคคลเดียวกับผู้มีอำนาจลงนามที่ระบุในระบบ";
  const notes: Record<string, string> = {
    companyInfo: "ต้องแนบเอกสารข้อมูลบริษัทก่อนส่งคำขอ",
    certificate: "ต้องเป็นหนังสือรับรองนิติบุคคลฉบับล่าสุด",
    vat20: "บังคับแนบเมื่อเลือก “จดทะเบียนแล้ว” ในการจดทะเบียนภาษีมูลค่าเพิ่ม",
    signerId: signerNote,
    idCopy: signerNote,
    houseReg: signerNote,
    sitePhotos: individual ? "ต้องเป็นรูปถ่ายร้านจริงและเป็นปัจจุบัน" : "ต้องเป็นรูปถ่ายสถานประกอบการจริงและเป็นปัจจุบัน",
  };
  return list.flatMap(([id, label, kind]) => {
    const field: RegFieldSpec = { k: `f_${id}`, label, t: "file", kind, req: 1, note: notes[id], docType: DOC_TYPES[id] || "Company Registration", expiryRequired: kind !== "img" };
    if (id === "vat20") {
      // Section always shows for a company; the file is only mandatory when VAT-registered.
      delete field.req;
      field.reqWhen = (x) => x.vatRegistered === "จดทะเบียนแล้ว";
    }
    return id === "sitePhotos"
      ? [field, { k: "photoConfirm", label: "ฉันยืนยันว่ารูปถ่ายสถานประกอบการเป็นปัจจุบันจากสถานที่จริง และมีอายุไม่เกิน 6 เดือน", t: "checkbox" as const, req: 1 as const, note: "ต้องยอมรับเงื่อนไขก่อน Submit คำขอ" }]
      : [field];
  });
}

export const regCatFields = (): RegFieldSpec[] => [
  { k: "main", label: "กลุ่มสินค้าหลัก (Main Category)", t: "select", opts: Object.keys(REG_PRODUCTS), req: 1, ph: "เลือกกลุ่มสินค้าหลัก", reset: ["sub", "material"] },
  { k: "sub", label: "กลุ่มสินค้าย่อย (Sub Category)", t: "select", opts: (d) => Object.keys(REG_PRODUCTS[d.main] || {}), req: 1, ph: "เลือกกลุ่มสินค้าย่อย", reset: ["material"], dis: (d) => !d.main },
  { k: "material", label: "กลุ่มวัสดุ (Material Group)", t: "select", opts: (d) => REG_PRODUCTS[d.main]?.[d.sub] || [], req: 1, span: 2, ph: "เลือกกลุ่มวัสดุ", dis: (d) => !d.sub },
  { k: "details", label: "รายละเอียดของกลุ่มสินค้า (Category Details)", t: "textarea", max: 5000, ph: "ระบุรายละเอียด (ไม่เกิน 5000 ตัวอักษร)" },
  { k: "files", label: "แคตตาล็อก (Catalog)", t: "file", kind: "pdf", req: 1 },
];

export const SITE_FIELDS: RegFieldSpec[] = [
  { k: "name", label: "ชื่อโรงงานผู้ผลิตสินค้า", t: "text", req: 1, max: 255, span: 2, ph: "ระบุชื่อโรงงานผู้ผลิตสินค้า" },
  { k: "country", label: "ประเทศ", t: "select", opts: REG_COUNTRIES, req: 1, span: 2, ph: "เลือกประเทศ" },
  { k: "address", label: "ที่อยู่", t: "text", req: 1, max: 500, span: 4, ph: "ระบุที่อยู่" },
  { k: "province", label: "จังหวัด", t: "select", opts: Object.keys(REG_ADDRESS), req: 1, ph: "เลือกจังหวัด", reset: ["district", "subdistrict"] },
  { k: "district", label: "เขต/อำเภอ", t: "select", opts: (d) => Object.keys(REG_ADDRESS[d.province] || {}), req: 1, ph: "เลือกเขต/อำเภอ", reset: ["subdistrict"], dis: (d) => !d.province },
  { k: "subdistrict", label: "แขวง/ตำบล", t: "select", opts: (d) => REG_ADDRESS[d.province]?.[d.district] || [], req: 1, ph: "เลือกแขวง/ตำบล", dis: (d) => !d.district },
  {
    k: "postal",
    label: "รหัสไปรษณีย์",
    t: "text",
    mode: "numeric",
    req: 1,
    ph: "ระบุรหัสไปรษณีย์",
    check: (v, d) => (d.country === "ไทย" ? (/^\d{5}$/.test(v) ? "" : "ระบุรหัสไปรษณีย์ 5 หลัก") : /^\d{3,10}$/.test(v) ? "" : "ระบรหัสไปรษณีย์เป็นตัวเลข"),
  },
  { k: "lat", label: "ละติจูด", t: "text", mode: "decimal", req: 1, ph: "ระบุละติจูด", check: chkCoord(-90, 90, "ละติจูด") },
  { k: "lng", label: "ลองจิจูด", t: "text", mode: "decimal", req: 1, ph: "ระบุลองจิจูด", check: chkCoord(-180, 180, "ลองจิจูด") },
  { k: "mapQuery", label: "สถานที่ตั้งโรงงานผู้ผลิตสินค้า", t: "text", span: 4, ph: "ค้นหาสถานที่" },
];

export const regOptions = (f: RegFieldSpec, d: RegData): string[] => (typeof f.opts === "function" ? f.opts(d) : f.opts || []);

export const regId = (scope: string, k: string) => `reg-${scope.replace(":", "-")}-${k}`;

export function regScopeData(db: Db, scope: string): RegData | undefined {
  if (scope === "reg") return db.registration.data;
  if (scope.startsWith("cat:")) return db.registration.categories[Number(scope.slice(4))];
  return undefined;
}

export const regFieldsFor = (scope: string, d: RegData): RegFieldSpec[] =>
  scope === "site" ? SITE_FIELDS : scope === "reg" ? [...REG_STEP1.flatMap((s) => s.fields), ...regDocFields(d)] : regCatFields();

export const isRegRequired = (f: RegFieldSpec, d: RegData) => (f.reqWhen ? f.reqWhen(d) : Boolean(f.req));

export function regFieldError(f: RegFieldSpec, d: RegData): string {
  if ((f.show && !f.show(d)) || f.dis?.(d)) return "";
  const req = isRegRequired(f, d);
  if (f.t === "file") {
    const files: FileMeta[] = Array.isArray(d[f.k]) ? d[f.k] : [];
    if (req && !files.length) return "โปรดอัปโหลดไฟล์";
    if (files.length > 5) return "อัปโหลดได้สูงสุด 5 ไฟล์";
    const extensions = f.kind === "img" ? ["png", "jpg", "jpeg"] : ["pdf"];
    if (files.some((file) => !extensions.includes(file.name.split(".").pop()?.toLowerCase() || "")))
      return `รองรับเฉพาะไฟล์ ${f.kind === "img" ? "PNG หรือ JPG" : "PDF"}`;
    if (files.some((file) => (file.size || 0) > 5 * 1024 * 1024)) return "ขนาดเกิน 5 MB ต่อไฟล์";
    if (f.expiryRequired && files.some((file) => !file.expiry?.trim())) return "โปรดระบุวันหมดอายุเอกสารของทุกไฟล์";
    return "";
  }
  if (f.t === "checkbox") return req && !d[f.k] ? "โปรดยืนยันข้อความนี้" : "";
  const v = String(d[f.k] ?? "").trim();
  if (!v) return req ? (["select", "radio"].includes(f.t) ? `โปรดเลือก${f.label}` : `โปรดระบุ${f.label}`) : "";
  if (f.max && v.length > f.max) return `ไม่เกิน ${f.max} ตัวอักษร`;
  return f.check ? f.check(v, d) : "";
}

/** Clears values of fields that are currently disabled. */
function regNormalize(fields: RegFieldSpec[], d: RegData) {
  fields.forEach((f) => {
    if (f.dis?.(d) && d[f.k]) d[f.k] = "";
  });
}

/** Mutates d like regSet in the mock-up: validates against the options, applies resets. */
export function regSetValue(fields: RegFieldSpec[], d: RegData, k: string, value: string) {
  const f = fields.find((x) => x.k === k);
  if (!f) return;
  const opts = typeof f.opts === "function" ? f.opts(d) : f.opts;
  if (value !== "" && opts && !opts.includes(value)) return;
  d[k] = value;
  (f.reset || []).forEach((key) => {
    d[key] = "";
  });
  regNormalize(fields, d);
}

export function regCheckValue(d: RegData, k: string, checked: boolean) {
  d[k] = Boolean(checked);
  if (k === "c_same") {
    const [first, ...rest] = COMPANY.contact.split(" ");
    Object.assign(
      d,
      checked
        ? { c_firstEn: first, c_lastEn: rest.join(" "), c_phone: COMPANY.phone.replace(/\D/g, ""), c_email: COMPANY.email }
        : { c_firstEn: "", c_lastEn: "", c_phone: "", c_email: "" },
    );
  }
}

/** Validates the picked files for a file field; returns accepted metadata plus toast messages. */
export function regAddFiles(f: RegFieldSpec, current: FileMeta[], files: File[]) {
  const img = f.kind === "img";
  const allowed = img ? ["png", "jpg", "jpeg"] : ["pdf"];
  const added: FileMeta[] = [];
  const messages: string[] = [];
  for (const file of files) {
    const extension = file.name.split(".").pop()!.toLowerCase();
    if (!allowed.includes(extension)) {
      messages.push(`${file.name}: รองรับเฉพาะไฟล์ ${img ? "PNG หรือ JPG" : "PDF"}`);
      continue;
    }
    if (file.size > 5 * 1024 * 1024) {
      messages.push(`${file.name}: ขนาดเกิน 5 MB`);
      continue;
    }
    if (current.length + added.length >= 5) {
      messages.push("อัปโหลดได้สูงสุด 5 ไฟล์");
      break;
    }
    added.push(trackFile(file, file.type || extension));
  }
  return { list: [...current, ...added], messages };
}

export type RegistrationRec = Db["registration"];

export function regStepErrors(r: RegistrationRec, step: number) {
  const out: { scope: string; k: string; message: string }[] = [];
  const d = r.data;
  const scan = (scope: string, fields: RegFieldSpec[], data: RegData) =>
    fields.forEach((f) => {
      const message = regFieldError(f, data);
      if (message) out.push({ scope, k: f.k, message });
    });
  if (step === 1) REG_STEP1.forEach((s) => scan("reg", s.fields, d));
  if (step === 2) scan("reg", regDocFields(d), d);
  if (step === 3) r.categories.forEach((c, i) => scan(`cat:${i}`, regCatFields(), c));
  return out;
}

export function regStepProgress(r: RegistrationRec, step: number) {
  const d = r.data;
  const groups: [RegFieldSpec[], RegData][] =
    step === 1 ? REG_STEP1.map((s) => [s.fields, d]) : step === 2 ? [[regDocFields(d), d]] : step === 3 ? r.categories.map((c) => [regCatFields(), c]) : [];
  let total = 0;
  let ok = 0;
  groups.forEach(([fields, data]) =>
    fields.forEach((f) => {
      if (!isRegRequired(f, data) || (f.show && !f.show(data)) || f.dis?.(data)) return;
      total++;
      if (!regFieldError(f, data)) ok++;
    }),
  );
  return { total, ok };
}

/** Sub-step list shown under the current step in the aside. */
export function regAsideSections(r: RegistrationRec) {
  const d = r.data;
  if (r.step === 1) return REG_STEP1.map((s, i) => ({ id: `reg-sec-${i}`, title: s.title, done: s.fields.every((f) => !regFieldError(f, d)) }));
  if (r.step === 2) return [{ id: "reg-sec-0", title: "เอกสารสำคัญ", done: regDocFields(d).every((f) => !regFieldError(f, d)) }];
  if (r.step === 3) return r.categories.map((c, i) => ({ id: `reg-sec-${i}`, title: `กลุ่มสินค้าที่ ${i + 1}`, done: regCatFields().every((f) => !regFieldError(f, c)) }));
  return [];
}

/** Mutates db: writes profile, contacts, factories, categories, products and documents, then marks registration as submitted. */
export function applyRegistration(db: Db) {
  const r = db.registration;
  const d = r.data;
  const p = db.profile;
  const today = new Date().toISOString().slice(0, 10);
  const name = (pre: string) => `${d[`${pre}prefix`]}${d[`${pre}firstTh`]} ${d[`${pre}lastTh`]}`;
  const role = (pre: string) => (d[`${pre}position`] === "อื่นๆ" ? d[`${pre}positionOther`] : d[`${pre}position`]);
  const address = [d.a_line1, d.a_line2, d.a_sub, d.a_district, d.a_province, d.a_postal, d.a_country].filter(Boolean).join(" ");
  p.company = `${d.companyPrefix} ${d.companyName}`.trim();
  p.registration = d.regNo;
  p.contact = name("o_");
  p.email = d.email;
  p.phone = d.phone;
  p.site = address;
  p.contacts = [
    { type: "Company owner", name: name("o_"), role: role("o_"), email: d.o_email, phone: d.o_phone, status: "Pending review" },
    { type: "Contact person", name: name("c_"), role: role("c_"), email: d.c_email, phone: d.c_phone, status: "Pending review" },
  ];
  p.factories = [{ name: d.branchType === "สาขา" ? d.branchName : p.company, location: address, type: "สถานประกอบการ", status: "Pending review" }];
  p.categories = [...new Set(r.categories.map((c) => c.main as string))];
  p.products = r.categories.map((c) => ({
    name: `${c.main} / ${c.sub}`,
    code: c.material,
    main: c.main,
    sub: c.sub,
    material: c.material,
    details: c.details || "",
    files: ((c.files as FileMeta[]) || []).map(({ name, size, type, uid }) => ({ name, size, type, uid })),
    status: "Pending review",
  }));
  regDocFields(d)
    .filter((f) => f.t === "file" && (!f.show || f.show(d)))
    .forEach((f) => pushDocument(db, d[f.k] || [], { name: f.label, type: f.docType!, group: "Registration" }));
  r.status = "Submitted";
  r.submittedAt = new Date().toISOString();
  db.onboarding.selfRegistration = { status: "Submitted", updated: today };
}

/** Factory record pushed to db.profile.factories from the SiteModal draft (same shape as saveSite). */
export function siteRecord(d: RegData) {
  const address = String(d.address).trim();
  return {
    name: String(d.name).trim(),
    country: d.country,
    address,
    province: d.province,
    district: d.district,
    subdistrict: d.subdistrict,
    postal: d.postal,
    lat: String(d.lat).trim(),
    lng: String(d.lng).trim(),
    mapQuery: String(d.mapQuery || "").trim(),
    location: [address, d.subdistrict, d.district, d.province, d.postal, d.country].join(" "),
    type: "Manufacturing",
    status: "Pending review",
  };
}
