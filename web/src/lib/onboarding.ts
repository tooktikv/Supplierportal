import { supplierQuestionnaire } from "./data";
import { gateOf, needsSample } from "./policy";
import type { Db } from "./types";

export const registrationDone = (db: Db) => db.registration.status === "Submitted";

export const onboardingTasks = [
  {
    id: "sourcing-policy",
    title: "Sustainable Sourcing Policy and Supplier Guiding Principles",
    category: "Learning",
    required: 3,
    description: "Watch the e-learning video, accept the policy document, then complete the policy questionnaire.",
    icon: "▤",
  },
  {
    id: "sustainability-risk",
    title: "Sustainability Risk Assessment",
    category: "Assessment",
    required: 1,
    description: "Complete the topic assessment when the demo screening flags a risk.",
    icon: "◈",
  },
  {
    id: "supplier-questionnaire",
    title: "New Supplier Selection Questionnaire",
    category: "Questionnaire",
    required: 1,
    description: "Complete the supplier pre-screening questionnaire for your company.",
    icon: "☷",
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
    ? "Complete and submit the New Supplier Selection Questionnaire first. In this demo, any No response triggers a follow-up assessment."
    : "No No responses were identified in the demo questionnaire. Additional assessment is not required.";
}

export function taskBlockedMessage(db: Db, id: string) {
  if (!registrationDone(db)) return "Complete supplier registration first.";
  if (id === "supplier-questionnaire" && !questionnaireAvailable(db))
    return "Complete all 3 learning activities in Sustainable Sourcing Policy and Supplier Guiding Principles first.";
  if (id === "sustainability-risk" && riskAssessmentState(db) !== "required") return riskAssessmentMessage(db);
  return "";
}

export const requiredOnboardingTasks = (db: Db) =>
  onboardingTasks.filter((task) => task.id !== "sustainability-risk" || riskAssessmentState(db) !== "not-required");

export const allTasksComplete = (db: Db) =>
  requiredOnboardingTasks(db).every((task) => taskCount(db, task.id) >= task.required);

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
        ? `${required.reduce((sum, t) => sum + taskCount(db, t.id), 0)} of ${required.reduce((sum, t) => sum + t.required, 0)} activities completed`
        : "Unlocks after your registration is submitted",
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

export function onboardingGate(db: Db) {
  const category = db.profile.onboardingCategory;
  if (!needsSample(category)) return "Exempt";
  const latest = db.requests
    .filter((r) => r.category === category)
    .sort((a, b) => (b.updated || "").localeCompare(a.updated || ""))[0];
  return latest ? gateOf(latest) : "Pending";
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
