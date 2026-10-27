/* eslint-disable @typescript-eslint/no-explicit-any -- records are JSON-like, as in the mock-up */
// Loose domain types: the mock-up stores JSON-like records, so a few index signatures are kept on purpose.

export interface FileMeta {
  name: string;
  size?: number;
  type?: string;
  expiry?: string;
  /** Session-only key for the object URL used by previews (see lib/docs.ts). */
  uid?: string;
}

export interface RequestRec {
  buyerRequest?: import("./sample-request-flow").BuyerSampleRequest;
  supplierSubmission?: import("./sample-request-flow").SampleSubmission;
  supplierSubmissionHistory?: import("./sample-request-flow").SampleSubmission[];
  id: string;
  name: string;
  code: string;
  category: string;
  type: string;
  status: string;
  created: string;
  updated: string;
  history: [string, string][];
  files?: FileMeta[];
  revisions?: { date: string; comments?: string; files?: FileMeta[]; quantity?: string; delivery?: string }[];
  [key: string]: any;
}

export interface DocVersion {
  version: number;
  date: string;
  files: FileMeta[];
}

export interface DocRecord {
  id?: string;
  name: string;
  type: string;
  related: string;
  issue: string;
  expiry: string;
  status: string;
  group: string;
  history?: any[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  summary: string;
  points: string[];
  questions: { text: string; options: string[]; answer: number; explanation: string }[];
}

export interface Question {
  text: string;
  options: string[];
  answer: number;
  explanation: string;
}

/** [key, question, documentTypes | "system", maxFiles] */
export type QuestionnaireItem = [string, string, (string[] | "system")?, number?];

export interface Db {
  requests: RequestRec[];
  registration: {
    status: string;
    cocAccepted: boolean;
    cocAt?: string;
    submittedAt?: string;
    step: number;
    data: Record<string, any>;
    categories: Record<string, any>[];
  };
  profile: {
    company: string;
    id: string;
    registration: string;
    contact: string;
    email: string;
    phone: string;
    site: string;
    categories: string[];
    onboardingCategory: string;
    contacts: Record<string, any>[];
    factories: Record<string, any>[];
    products: Record<string, any>[];
  };
  onboarding: Record<string, any> & {
    tasks: Record<string, number>;
    riskAnswers: Record<string, string>;
    questionnaireAnswers: Record<string, any>;
    learningFlow: Record<string, any>;
  };
  documents: DocRecord[];
}
