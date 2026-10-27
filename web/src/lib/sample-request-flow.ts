import type { FileMeta, RequestRec } from "./types";

export type SampleReviewMode = "Digital" | "Onsite";

export interface BuyerSampleRequest {
  reviewMode?: SampleReviewMode;
  documentsRequired?: boolean;
  buyer: string;
  email: string;
  requestedAt: string;
  dueDate: string;
  requirements: string;
  documents: string[];
  quantity: string;
  unit: string;
  address: string;
  recipient: string;
  contact: string;
}

export interface SampleSubmission {
  productName: string;
  productCode: string;
  specification: string;
  quantity: string;
  unit: string;
  batch: string;
  deviations: string;
  contactName: string;
  contactEmail: string;
  shipmentStatus: string;
  deliveryDate: string;
  dispatchDate: string;
  carrier: string;
  tracking: string;
  notes: string;
  files: FileMeta[];
  submittedAt?: string;
  siteName?: string;
  siteAddress?: string;
  visitDate?: string;
  visitTime?: string;
  visitNotes?: string;
  contactPhone?: string;
}

export const canSubmitSample = (request: RequestRec) => ["Awaiting Submission", "Draft", "Action Required", "Resubmission Required"].includes(request.status);

export function buyerRequestOf(request: RequestRec): BuyerSampleRequest & { reviewMode: SampleReviewMode } {
  const buyer: BuyerSampleRequest = request.buyerRequest || {
    buyer: "Olivia Martin · Northstar Procurement",
    email: "olivia.martin@northstar.example",
    requestedAt: request.created,
    dueDate: request.deliveryDate || "2026-11-10",
    requirements: request.description || "Provide a representative product sample with its technical specification.",
    documents: ["Product specification / catalog", "COA or test report, where applicable"],
    quantity: request.quantity || "1",
    unit: request.unit || "pieces",
    address: "Northstar Sample Receiving, 88 Innovation Drive, Portland, OR 97201",
    recipient: "Sample Evaluation Team",
    contact: "sample.review@northstar.example",
  };
  return { ...buyer, reviewMode: buyer.reviewMode || (request.type === "Digital" ? "Digital" : "Onsite") };
}

export const sampleDocumentsRequired = (request: RequestRec) => {
  const buyer = buyerRequestOf(request);
  return buyer.documentsRequired ?? buyer.reviewMode === "Digital";
};

export function sampleSubmissionOf(request: RequestRec, contactName: string, contactEmail: string): SampleSubmission {
  return request.supplierSubmission || {
    productName: request.name,
    productCode: request.code || "",
    specification: request.specification || "",
    quantity: request.quantity || "",
    unit: request.unit || "pieces",
    batch: "",
    deviations: "",
    contactName,
    contactEmail,
    shipmentStatus: "Ready to ship",
    deliveryDate: "",
    dispatchDate: "",
    carrier: "",
    tracking: "",
    notes: "",
    files: request.files || [],
  };
}

export function sampleSubmissionErrors(request: RequestRec, submission: SampleSubmission): Partial<Record<keyof SampleSubmission, string>> {
  const errors: Partial<Record<keyof SampleSubmission, string>> = {};
  for (const key of ["productName", "productCode", "specification", "contactName", "contactEmail"] as const) {
    if (!submission[key].trim()) errors[key] = "This field is required.";
  }
  if (submission.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submission.contactEmail)) errors.contactEmail = "Enter a valid email address.";
  if (sampleDocumentsRequired(request) && !submission.files.length) errors.files = "Attach at least one sample document.";
  if (buyerRequestOf(request).reviewMode === "Onsite") {
    if (!Number.isFinite(Number(submission.quantity)) || Number(submission.quantity) <= 0) errors.quantity = "Enter a quantity greater than zero.";
    if (!submission.unit.trim()) errors.unit = "Enter the unit of measure.";
    const today = new Date().toLocaleDateString("en-CA");
    if (!submission.siteName?.trim()) errors.siteName = "Enter the site or factory name.";
    if (!submission.siteAddress?.trim()) errors.siteAddress = "Enter the onsite review address.";
    if (!submission.visitDate || !/^\d{4}-\d{2}-\d{2}$/.test(submission.visitDate) || submission.visitDate < today) errors.visitDate = "Propose a visit date of today or later.";
    if (!submission.visitTime || !/^([01]\d|2[0-3]):[0-5]\d$/.test(submission.visitTime)) errors.visitTime = "Propose a visit time.";
    if (!submission.contactPhone || !/^\+?[\d\s().-]{7,25}$/.test(submission.contactPhone)) errors.contactPhone = "Enter a valid onsite contact phone number.";
  }
  return errors;
}

export const SAMPLE_BUCKETS = ["All", "To submit", "Drafts", "Action required", "In progress", "Completed"] as const;
export type SampleBucket = (typeof SAMPLE_BUCKETS)[number];
export function inSampleBucket(request: RequestRec, bucket: SampleBucket) {
  if (bucket === "All") return true;
  if (bucket === "To submit") return request.status === "Awaiting Submission";
  if (bucket === "Drafts") return request.status === "Draft";
  if (bucket === "Action required") return ["Action Required", "Resubmission Required"].includes(request.status);
  if (bucket === "Completed") return ["Approved", "Rejected", "Cancelled"].includes(request.status);
  return ["Submitted", "Under Review", "Awaiting Sample", "Sample Received", "Under Evaluation"].includes(request.status);
}