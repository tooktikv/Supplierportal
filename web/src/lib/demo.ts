// TEMPORARY demo shortcuts: set DEMO_TOOLS to false (or delete this file and its callers) before production.
import { COMPANY, learningQuestions, supplierQuestionnaire, thaiLaborItems } from "./data";
import { riskTopics } from "./onboarding";
import type { SampleSubmission } from "./sample-request-flow";
import { addTwoYears, HR_STANDARDS, PROJECT_TYPES, SCOPE3_CATEGORIES, SOURCING_OWNERS, type CfoEntry, type CfpEntry, type GhgState, type GovState, type HrState, type SrmProject } from "./srm";
import { TLS_QUESTIONS } from "./tls-assessment";
import type { Db, FileMeta } from "./types";

export const DEMO_TOOLS = true;

const file = (name: string, type = "application/pdf", expiry = "2027-12-31"): FileMeta => ({ name, size: 240000, type, ...(type === "application/pdf" ? { expiry } : {}) });

/** Mutates db.registration so every registration step passes validation. */
export function fillDemoRegistration(db: Db) {
  const r = db.registration;
  const [first = "Maya", ...rest] = COMPANY.contact.split(" ");
  r.cocAccepted = true;
  r.cocAt = r.cocAt || new Date().toISOString();
  r.data = {
    ...r.data,
    companyType: "นิติบุคคล", country: "ไทย", regNo: "0105560123456", certDate: "15-03-2023", vatRegistered: "จดทะเบียนแล้ว",
    companyPrefix: "บจก.", companyName: "แอสเทรอน อินดัสเทรียล ซัพพลาย", businessType: "ผู้ผลิต", employees: "120",
    phone: "021234567", email: "demo@asteron.example", branchType: "สำนักงานใหญ่", branchCode: "00000", branchName: "",
    c_same: false, c_prefix: "นางสาว", c_firstTh: "มายา", c_lastTh: "เฉิน", c_firstEn: first, c_lastEn: rest.join(" ") || "Chen",
    c_position: "ผู้จัดการ", c_positionOther: "", c_dept: "ฝ่ายจัดซื้อ", c_deptOther: "", c_phone: "0812345678", c_email: COMPANY.email,
    o_prefix: "นาย", o_firstTh: "สมชาย", o_lastTh: "ใจดี", o_firstEn: "Somchai", o_lastEn: "Jaidee",
    o_position: "กรรมการผู้จัดการ", o_positionOther: "", o_dept: "ฝ่ายบริหาร", o_deptOther: "", o_phone: "0898765432", o_email: "somchai@asteron.example",
    a_country: "ไทย", a_line1: "99/9 ถนนสีลม", a_line2: "", a_province: "กรุงเทพมหานคร", a_district: "บางรัก", a_sub: "สีลม", a_postal: "10500",
    lat: "13.7279", lng: "100.5241", mapQuery: "",
    f_companyInfo: [file("company-info.pdf")], f_certificate: [file("company-certificate.pdf")], f_vat20: [file("vat-pp20.pdf")],
    f_signerId: [file("signer-id.pdf")], f_sitePhotos: [file("site-photo.png", "image/png")], photoConfirm: true,
  };
  r.categories = [{ main: "อะไหล่และอุปกรณ์", sub: "อุปกรณ์ความปลอดภัย", material: "อุปกรณ์ป้องกันส่วนบุคคล", details: "Demo category details.", files: [file("catalog.pdf")] }];
}

const now = () => new Date().toISOString();

export function fillDemoLearning(db: Db) {
  const answers = Object.fromEntries(learningQuestions.map((question, index) => [index, question.answer]));
  Object.assign(db.onboarding.learningFlow, {
    videoCompleted: true, consentAccepted: true, acceptedAt: now(), policyVersion: "1.0", quizVersion: 2, step: 2,
    answers, result: { score: learningQuestions.length, passed: true, answers: { ...answers } },
  });
  db.onboarding.tasks["sourcing-policy"] = 3;
}

export function fillDemoThaiLabor(db: Db) {
  db.onboarding.thaiLabor = { accepted: Object.fromEntries(thaiLaborItems.map((item) => [item.id, now()])), step: thaiLaborItems.length - 1 };
  db.onboarding.tasks["thai-labor-standard"] = thaiLaborItems.length;
}

export function fillDemoCommitment(db: Db) {
  Object.assign(db.onboarding.thaiCommitment, { accepted: true, acceptedAt: now(), method: "Signed", signedAt: now(), files: [] });
}

export function fillDemoAssessment(db: Db) {
  Object.assign(db.onboarding.thaiAssessment, {
    total: "120", male: "70", female: "50", certified: "ไม่มี", certFiles: [], otherStandards: "ISO 9001",
    answers: Object.fromEntries(TLS_QUESTIONS.map((question) => [question.n, "ใช่"])), notes: "",
  });
}

/** With `risk`, the first question is answered No so the risk assessment unlocks. */
export function fillDemoQuestionnaire(db: Db, risk = false) {
  let first = true;
  for (const [key, , documents] of supplierQuestionnaire) {
    if (documents === "system") continue;
    const no = risk && first;
    first = false;
    db.onboarding.questionnaireAnswers[key] = no
      ? { answer: "No", documentType: "", files: [], note: "" }
      : { answer: "Yes", documentType: Array.isArray(documents) ? documents[0] : "", files: [file(`${key}.pdf`)], note: "" };
  }
}

export function fillDemoRisk(db: Db) {
  for (const [key] of riskTopics) db.onboarding.riskAnswers[key] = "Medium";
}

// Stand-ins for the Buyer-side system (SLM), which is not built yet.
const today = () => new Date().toISOString().slice(0, 10);

export function simulateProcurementReview(db: Db) {
  db.onboarding.procurementReview = { status: "Completed", updated: today() };
}

export function simulateAnnouncement(db: Db) {
  db.onboarding.announcement = { status: "Completed", updated: today() };
}

export function simulateEvaluation(db: Db) {
  db.onboarding.evaluation = { status: "Completed", updated: today() };
}

export function simulateBuyerInterest(db: Db) {
  db.onboarding.buyerInterest = { status: "Interested", buyer: "Olivia Martin · Northstar Procurement", at: today() };
}

export function resetSimulatedStages(db: Db) {
  db.onboarding.procurementReview = { status: "Pending", updated: "" };
  db.onboarding.announcement = { status: "Not Started" };
  db.onboarding.evaluation = { status: "Pending" };
  db.onboarding.buyerInterest = { status: "None" };
}

export function fillDemoProject(project: SrmProject) {
  Object.assign(project, {
    selectType: "Innovation", name: "Demo: lightweight packaging redesign", projectType: PROJECT_TYPES.Innovation[2], owner: SOURCING_OWNERS[0],
    objective: "Reduce packaging weight by redesigning the outer carton. Demo data.", benefit: "8.50", indicator: "%",
    startDate: "2026-11-01", endDate: addTwoYears("2026-11-01"), endEdited: false, files: [file("project-brief.pdf")],
    updateMonth: "2026-10", progress: "In progress", progressFiles: [], details: "Demo progress update.",
  });
}

export function fillDemoGhg(ghg: GhgState) {
  ghg.type = ghg.type || "CFO";
  ghg.cfo.forEach((entry: CfoEntry) =>
    Object.assign(entry, { certNo: "TGO CFO FY26-01-001", standard: "ISO 14064", scopeDate: "2025-12-31", scope1: "120.50", scope2: "80.25", scope3: "340.00", scope3Category: SCOPE3_CATEGORIES[0], production: "15000", unit: "tonne", files: [file("cfo-certificate.pdf")] }),
  );
  ghg.cfp.forEach((entry: CfpEntry) =>
    Object.assign(entry, { certNo: "TGO CFP FY26-01-001", standard: "ISO 14067", product: "Demo certified product", perUnit: "0.85", unit: "kg", scope: "B2B", period: "2026-01-01", files: [file("cfp-certificate.pdf")] }),
  );
}

export function fillDemoHumanRights(state: HrState) {
  state.entries.forEach((entry) => Object.assign(entry, { standard: HR_STANDARDS[0], other: "", expiry: "2027-12-31", files: [file("human-rights-certificate.pdf")] }));
}

export function fillDemoGovernance(gov: GovState) {
  Object.assign(gov, { cac: "Yes", cacExpiry: "2027-06-30", cacFiles: [file("cac-membership.pdf")], coc: "Yes", cocFiles: [file("code-of-conduct.pdf")] });
}

export function demoSampleSubmission(current: SampleSubmission, options: { onsite: boolean; documentsRequired: boolean }): SampleSubmission {
  const visit = new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10);
  return {
    ...current,
    productCode: current.productCode || "DEMO-001",
    specification: current.specification || "Demo specification: material, dimensions and performance as requested by Buyer.",
    contactName: current.contactName || COMPANY.contact,
    contactEmail: current.contactEmail || COMPANY.email,
    files: options.documentsRequired && !current.files.length ? [file("sample-specification.pdf")] : current.files,
    ...(options.onsite
      ? { quantity: current.quantity || "2", unit: current.unit || "pieces", siteName: "Asteron Portland Manufacturing", siteAddress: "2400 Harbor Way, Suite 100, Portland, OR 97201", visitDate: visit, visitTime: "10:00", visitNotes: "", contactPhone: COMPANY.phone.replace(/[^\d+]/g, "") }
      : {}),
  };
}
