/* eslint-disable @typescript-eslint/no-explicit-any -- records are JSON-like, as in the mock-up */
import { createInitialDb, initial } from "./data";
import { policyFields } from "./policy";
import type { Db } from "./types";
import { buyerRequestOf } from "./sample-request-flow";
import { normalizeScope3 } from "./srm";

export const DB_KEY = "northstar-supplier-portal-v1";

/** Same migrations as the mock-up so a db saved by index.html keeps working. */
export function loadDb(): Db {
  try {
    const saved = localStorage.getItem(DB_KEY);
    if (!saved) return createInitialDb();
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed.requests) || !parsed.profile) throw new Error("Saved portal data is incomplete.");
    const clone = <T,>(value: T): T => structuredClone(value);
    parsed.profile.onboardingCategory = parsed.profile.onboardingCategory || "Industrial Components";
    parsed.profile.contacts = parsed.profile.contacts || clone(initial.profile.contacts);
    parsed.profile.factories = parsed.profile.factories || clone(initial.profile.factories);
    parsed.profile.products = parsed.profile.products || clone(initial.profile.products);
    parsed.registration = parsed.registration || clone(initial.registration);
    parsed.onboarding = parsed.onboarding || clone(initial.onboarding);
    parsed.onboarding.tasks = parsed.onboarding.tasks || clone(initial.onboarding.tasks);
    parsed.onboarding.learningQuizAnswers = parsed.onboarding.learningQuizAnswers || {};
    parsed.onboarding.learningQuizResults = parsed.onboarding.learningQuizResults || {};
    parsed.onboarding.learningFlow = parsed.onboarding.learningFlow || clone(initial.onboarding.learningFlow);
    parsed.onboarding.thaiLabor = parsed.onboarding.thaiLabor || clone(initial.onboarding.thaiLabor);
    parsed.onboarding.tasks["thai-labor-standard"] = Object.keys(parsed.onboarding.thaiLabor.accepted || {}).length;
    parsed.onboarding.thaiCommitment = parsed.onboarding.thaiCommitment || clone(initial.onboarding.thaiCommitment);
    const commitment = parsed.onboarding.thaiCommitment;
    if (!commitment.submittedAt && commitment.method && commitment.method !== "Signed" && commitment.method !== "Download") {
      Object.assign(commitment, { method: "", files: [], signedAt: undefined });
    }
    parsed.onboarding.tasks["thai-labor-commitment"] = parsed.onboarding.thaiCommitment.submittedAt ? 1 : 0;
    parsed.onboarding.thaiAssessment = parsed.onboarding.thaiAssessment || clone(initial.onboarding.thaiAssessment);
    parsed.onboarding.tasks["thai-labor-assessment"] = parsed.onboarding.thaiAssessment.submittedAt ? 1 : 0;
    const learning = parsed.onboarding.learningFlow;
    if (learning.quizVersion !== 2) {
      learning.answers = {};
      learning.result = null;
      learning.quizVersion = 2;
    }
    parsed.onboarding.tasks["sourcing-policy"] = learning.videoCompleted
      ? learning.consentAccepted
        ? learning.result?.passed
          ? 3
          : 2
        : 1
      : 0;
    parsed.onboarding.riskAnswers = parsed.onboarding.riskAnswers || {};
    parsed.onboarding.questionnaireAnswers = parsed.onboarding.questionnaireAnswers || {};
    if (parsed.onboarding.questionnaireVersion !== 2) {
      parsed.onboarding.questionnaireAnswers = {};
      parsed.onboarding.tasks["supplier-questionnaire"] = 0;
      parsed.onboarding.questionnaireVersion = 2;
    }
    parsed.documents = parsed.documents || clone(initial.documents);
    parsed.documents.forEach((document: any, index: number) => {
      document.id = document.id || `DOC-${String(index + 1).padStart(4, "0")}`;
      document.history = document.history || [];
    });
    parsed.onboarding.procurementReview = parsed.onboarding.procurementReview || clone(initial.onboarding.procurementReview);
    if (parsed.onboarding.stageVersion !== 2) {
      parsed.onboarding.procurementReview = clone(initial.onboarding.procurementReview);
      parsed.onboarding.stageVersion = 2;
    }
    parsed.onboarding.announcement = parsed.onboarding.announcement || clone(initial.onboarding.announcement);
    parsed.onboarding.evaluation = parsed.onboarding.evaluation || clone(initial.onboarding.evaluation);
    parsed.onboarding.buyerInterest = parsed.onboarding.buyerInterest || clone(initial.onboarding.buyerInterest);
    parsed.requests = parsed.requests.map(policyFields);
    parsed.srm = parsed.srm || clone(initial.srm);
    for (const entry of parsed.srm.ghg?.cfo || []) entry.scope3Category = normalizeScope3(entry.scope3Category);
    for (const seeded of initial.requests) {
      if (!parsed.requests.some((request: Db["requests"][number]) => request.id === seeded.id)) parsed.requests.unshift(clone(seeded));
    }
    parsed.requests.forEach((request: Db["requests"][number]) => {
      if (!request.buyerRequest) request.buyerRequest = buyerRequestOf(request);
    });
    return parsed as Db;
  } catch (error) {
    console.error("Unable to load saved supplier portal data.", error);
    return createInitialDb();
  }
}

/** Returns false when the browser refused the write. */
export function saveDb(db: Db): boolean {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return true;
  } catch (error) {
    console.error("Unable to save supplier portal data.", error);
    return false;
  }
}

export function clearDb(): boolean {
  try {
    localStorage.removeItem(DB_KEY);
    return true;
  } catch (error) {
    console.error("Unable to clear saved supplier portal data.", error);
    return false;
  }
}
