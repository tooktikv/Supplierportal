import { InfoItem } from "@/components/ui";
import { fmtDate } from "@/lib/docs";
import { buyerRequestOf, sampleDocumentsRequired } from "@/lib/sample-request-flow";
import type { RequestRec } from "@/lib/types";

export default function BuyerRequestBrief({ request }: { request: RequestRec }) {
  const buyer = buyerRequestOf(request);
  return (
    <section className="sample-brief" aria-label="Buyer request">
      <div className="section-title"><h2>Buyer request</h2><span className="helper">{request.id}</span></div>
      <div className="info-grid">
        <InfoItem label="Requested by" value={buyer.buyer} />
        <InfoItem label="Buyer email" value={buyer.email} />
        <InfoItem label="Requested product" value={`${request.name} · ${request.code}`} />
        <InfoItem label="Product category" value={request.category} />
        <InfoItem label="Buyer review method" value={buyer.reviewMode === "Onsite" ? "Onsite review" : "Digital document review"} />
        <InfoItem label="Requested on" value={fmtDate(buyer.requestedAt)} />
        <InfoItem label="Response due" value={fmtDate(buyer.dueDate)} />
        {buyer.reviewMode === "Onsite" && <InfoItem label="Sample quantity for onsite review" value={`${buyer.quantity} ${buyer.unit}`} />}
      </div>
      <h3>Requirements</h3><p className="sample-copy">{buyer.requirements}</p>
      <h3>{sampleDocumentsRequired(request) ? "Required sample documents" : "Supporting documents (optional)"}</h3>
      <ul className="sample-documents">{buyer.documents.map((document, index) => <li key={index}>{document}</li>)}</ul>
    </section>
  );
}