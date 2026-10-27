import { supplierQuestionnaire } from "./data";
import type { Db } from "./types";

export const registrationDone = (db: Db) => db.registration.status === "Submitted";

export const SOURCING_GROUP = "Sustainable sourcing & supplier selection";
export const THAI_LABOR_GROUP = "มาตรฐานแรงงานไทย (มรท.)";

export interface OnboardingTask {
  id: string;
  title: string;
  category: string;
  required: number;
  description: string;
  icon: string;
  group: string;
  /** Only needed when an earlier answer flags a risk. */
  conditional?: boolean;
}

export const onboardingTasks: OnboardingTask[] = [
  {
    id: "sourcing-policy",
    title: "Sustainable Sourcing Policy and Supplier Guiding Principles",
    category: "Learning",
    required: 3,
    description: "Watch the e-learning video, accept the policy document, then complete the policy questionnaire.",
    icon: "▤",
    group: SOURCING_GROUP,
  },
  {
    id: "supplier-questionnaire",
    title: "New Supplier Selection Questionnaire",
    category: "Questionnaire",
    required: 1,
    description: "Complete the supplier pre-screening questionnaire for your company.",
    icon: "☷",
    group: SOURCING_GROUP,
  },
  {
    id: "sustainability-risk",
    title: "Sustainability Risk Assessment",
    category: "Assessment",
    required: 1,
    description: "Complete the topic assessment when the demo screening flags a risk.",
    icon: "◈",
    group: SOURCING_GROUP,
    conditional: true,
  },
  {
    id: "thai-labor-standard",
    title: "มาตรฐานแรงงานไทย (มรท.) e-Learning",
    category: "Learning",
    required: 5,
    description: "Review 5 learning items (videos and PDF documents) and accept each one before continuing.",
    icon: "▤",
    group: THAI_LABOR_GROUP,
  },
  {
    id: "thai-labor-commitment",
    title: "หนังสือแสดงความมุ่งมั่นของผู้ส่งมอบหรือผู้รับเหมาช่วง (F-TLS-02)",
    category: "Form",
    required: 1,
    description: "Read the commitment letter, accept it, then sign it with AXONS Sign or download it, sign by hand and upload the PDF.",
    icon: "✎",
    group: THAI_LABOR_GROUP,
  },
  {
    id: "thai-labor-assessment",
    title: "แบบประเมินผู้ส่งมอบ/ผู้รับเหมาช่วง ตามมาตรฐานแรงงานไทย มรท.8001 : 2563 (F-TLS-01)",
    category: "Self-assessment",
    required: 1,
    description: "Enter your workforce details and complete the 21-item self-assessment. The score and result are calculated by the system.",
    icon: "☑",
    group: THAI_LABOR_GROUP,
  },
];

export const riskTopics: [string, string][] = [
  ["climate", "Climate change and greenhouse gas emissions"],
  ["sourcing", "Responsible sourcing"],
  ["workplace", "Occupational health and safety"],
  ["labor", "Human rights and labor practices"],
  ["food-safety", "Food quality and safety"],
  ["ethics", "Business ethics and conduct"],
];

export const taskCount = (db: Db, id: string) =>
  Math.min(onboardingTasks.find((t) => t.id === id)?.required || 0, Number(db.onboarding.tasks[id]) || 0);

export const questionnaireAvailable = (db: Db) => taskCount(db, "sourcing-policy") === 3;

export function riskAssessmentState(db: Db): "pending" | "required" | "not-required" {
  if (!questionnaireAvailable(db) || !taskCount(db, "supplier-questionnaire")) return "pending";
  return supplierQuestionnaire.some(
    ([key, , type]) => type !== "system" && db.onboarding.questionnaireAnswers[key]?.answer === "No",
  )
    ? "required"
    : "not-required";
}

export function riskAssessmentMessage(db: Db) {
  return riskAssessmentState(db) === "pending"
    ? "Complete Step 2 · New Supplier Selection Questionnaire first. In this demo, any No response triggers a follow-up assessment."
    : "No No responses were identified in the demo questionnaire. Additional assessment is not required.";
}

export function taskBlockedMessage(db: Db, id: string) {
  if (!registrationDone(db)) return "Complete supplier registration first.";
  if (id === "thai-labor-commitment" && taskCount(db, "thai-labor-standard") < 5)
    return "Complete Step 1 · TLS e-Learning (all 5 items) first.";
  if (id === "thai-labor-assessment" && (taskCount(db, "thai-labor-standard") < 5 || taskCount(db, "thai-labor-commitment") < 1))
    return "Complete Step 1 · TLS e-Learning and Step 2 · commitment letter (F-TLS-02) first.";
  if (id === "supplier-questionnaire" && !questionnaireAvailable(db))
    return "Complete Step 1 · Sustainable Sourcing Policy (all 3 activities) first.";
  if (id === "sustainability-risk" && riskAssessmentState(db) !== "required") return riskAssessmentMessage(db);
  return "";
}

export const requiredOnboardingTasks = (db: Db) =>
  onboardingTasks.filter((task) => task.id !== "sustainability-risk" || riskAssessmentState(db) !== "not-required");

export const allTasksComplete = (db: Db) =>
  requiredOnboardingTasks(db).every((task) => taskCount(db, task.id) >= task.required);

export const buyerInterested = (db: Db) => registrationDone(db) && db.onboarding.buyerInterest?.status === "Interested";

export function onboardingStages(db: Db) {
  const registered = registrationDone(db);
  const reviewed = registered && db.onboarding.procurementReview.status === "Completed";
  const tasksDone = registered && allTasksComplete(db);
  const announced = tasksDone && db.onboarding.announcement.status === "Completed";
  const required = requiredOnboardingTasks(db);
  return [
    {
      title: "Supplier registration",
      description: registered ? "Company registration submitted" : "Complete the Supplier Registration task below",
      status: registered ? "Completed" : "In Progress",
    },
    {
      title: "Procurement review",
      description: reviewed
        ? "Registration details reviewed by procurement"
        : registered
          ? "Procurement is reviewing your registration"
          : "Starts after your registration is submitted",
      status: reviewed ? "Completed" : registered ? "In Progress" : "Not Started",
    },
    {
      title: "Your tasks",
      description: registered
        ? "{done} of {total} activities completed"
        : "Unlocks after your registration is submitted",
      vars: { done: required.reduce((sum, t) => sum + taskCount(db, t.id), 0), total: required.reduce((sum, t) => sum + t.required, 0) },
      status: tasksDone ? "Completed" : registered ? "In Progress" : "Not Started",
    },
    {
      title: "Awaiting announcement",
      description: "Supplier pre-screening outcome will be shared when ready",
      status: announced ? "Completed" : tasksDone ? "In Progress" : "Not Started",
    },
    {
      title: "New supplier evaluation result",
      description: "Final supplier evaluation outcome",
      status: db.onboarding.evaluation.status === "Completed" ? "Completed" : announced ? "In Progress" : "Not Started",
    },
  ];
}

export function questionnaireSystemAnswer(db: Db, key: string) {
  if (key === "policy-accepted") return taskCount(db, "sourcing-policy") === 3 ? "Yes" : "No";
  if (key === "self-assessment")
    return riskAssessmentState(db) === "not-required" || taskCount(db, "sustainability-risk") >= 1 ? "Yes" : "No";
  return "";
}

export function questionnaireComplete(db: Db) {
  return supplierQuestionnaire.every(([key, , type, limit]) => {
    if (type === "system") return true;
    const response = db.onboarding.questionnaireAnswers[key] || {};
    if (!["Yes", "No"].includes(response.answer)) return false;
    if (response.answer === "No") return true;
    const maxFiles = limit || 1;
    return (
      (!supplierQuestionnaire.find(([questionKey]) => questionKey === key)?.[2] || Boolean(response.documentType)) &&
      Array.isArray(response.files) &&
      response.files.length > 0 &&
      response.files.length <= maxFiles
    );
  });
}
