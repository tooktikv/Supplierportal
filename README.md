# Northstar Supplier Portal prototype

## Run locally

Open `index.html` in a modern browser. The prototype uses plain HTML, CSS, and JavaScript and has no package install, build step, server, or external API dependency.

## Supplier-facing features

- Supplier onboarding landing page with progress stages and task actions
- A five-stage onboarding tracker with persistent learning, risk assessment, and supplier questionnaire tasks
- Sample request list with combined search, status, category, sample-type, and date filters
- Four-step create/edit-draft flow for physical, digital, and combined submissions
- Request detail pages, status history, evaluator feedback, and response/resubmission history
- Company profile tabs for company/owner information, contacts, manufacturing sites, documents, products, and risk assessment; document status filters
- Local profile editing, contact and factory-site registration, document metadata upload/history, and structured supplier questionnaire responses
- Responsive navigation and layouts

## Mock behavior and assumptions

- First login runs a supplier registration workflow before any other page or the Company Profile: accept CoC / T&D, then four steps (general information with contact, owner, address and coordinates; important documents; product categories with repeatable category groups; review and submit). Validation follows the supplied field rules (required, length, Thai/English-only, phone 9-15 digits, DD-MM-YYYY, latitude/longitude ranges, PDF or PNG/JPG up to 5 MB and 5 files). Conditional fields: branch name only for "สาขา", other position/department only for "อื่นๆ", ภ.พ.20 only when VAT-registered, and the document list switches between juridical and natural person. Submitting populates the Company Profile and Documents and unlocks the rest of the portal.
- Province/district/sub-district, country, position, department and product category lists are small sample data; replace them with the real master data. Map search is an embedded Google Maps view driven by the search text or coordinates (no Maps API key); file uploads store metadata only. The CoC / T&D text is placeholder content. The "same as system user" option fills only English name, phone and email from the fictional account.

- All supplier, product, document, and evaluation records are fictional and live in `app.js`.
- `CATEGORIES` is the configurable mock source for `sampleRequired` and `approvalRequired`. The selected onboarding category is currently `Industrial Components`.
- e-Learning and self-registration step statuses are fictional values in the `onboarding` mock record.
- The learning task follows three sequential activities: an in-page YouTube preview placeholder (1/3), a scrollable policy preview and required consent (2/3), and a 10-question/four-option quiz (3/3). The quiz requires at least 8/10 (80%) and allows retries after a failed attempt. No video URL or official policy PDF was provided, so the preview and policy content remain clearly marked prototype content; completion is simulated and stored locally. Previous module-based quiz completions and old quiz results are not treated as completion of the updated flow.
- Learning displays one section at a time with a three-step indicator and Back / Next controls. Next unlocks only after completing the current activity; completed sections remain available for review. The selected step and quiz answers persist across navigation and refresh. Finish returns to Supplier Onboarding after passing the questionnaire.
- New Supplier Selection Questionnaire remains visible but disabled with Pending learning until all three learning activities are complete (3/3, including a passing policy quiz). Direct navigation, answer changes, and submission enforce the same prerequisite. Existing saved questionnaire responses are preserved but cannot be accessed until learning is complete; additional risk assessment also remains locked until then.
- The new-supplier questionnaire has 12 items. Supplier-entered items use Yes/No; selecting Yes reveals required PDF evidence (5 MB maximum per file, one or ten files according to the item) and document-type selections where specified. Each supplier-entered item has an optional 5,000-character note. Items 7 and 8 are read-only system-generated responses derived from Task 2 and Task 1. Selected files are metadata only and are not uploaded.
- The supplied Task 2 requirements do not include the upstream Inherent Risk scoring source, its calculation bands, or the topic quiz questions. The prototype therefore keeps a clearly labeled demo risk-level form and does not claim to implement the required system-calculated High-risk gate or official topic quizzes. Questionnaire answers, scores, consent, risk ratings, and profile changes are local demo data, not official training, a real risk verdict, legal acceptance, or a submission to procurement.
- Learning themes were informed by public guidance from the [UN Global Compact Ten Principles](https://unglobalcompact.org/what-is-gc/mission/principles), [ISO 20400 sustainable procurement guidance](https://www.iso.org/standard/63026.html), and the [Global Compact Network Thailand sustainable supplier toolkit](https://globalcompact-th.com/en/publications/navigating-your-esg-journey-a-toolkit-for-sustainable-suppliers/). Lesson wording and quiz questions are original prototype content, not copied assessments or official requirements.
- Company profile tabs, factory/contact records, required-document status filters, and supplier risk answers use fictional data. Company information can be edited and contacts/sites can be added locally. Document selection records file metadata and a local upload-history entry; PDF/image previews are session-only in the browser. Binary files are not persisted or uploaded, and verification/status changes are not connected.
- A sample gate is `Exempt` if a category does not require a sample or does not require sample approval. A recorded approval satisfies the sample gate; a rejection fails it. Neither outcome determines overall supplier qualification.
- The prototype represents internal review and evaluation using seeded records only. Suppliers cannot set receipt, approval, rejection, or qualification outcomes.
- Requests and document entries are saved in browser `localStorage`. Use **Reset fictional demo data** in the sidebar to restore the seeded scenario.
- File selection is simulated. The browser stores file names, types, and sizes only; PDF/image previews are generated locally for the current browser session. File content is not persisted, downloaded, or shared with an internal evaluator.
- The supplier identity is prefilled from the fictional account and is not editable in the request form.
- The attached supplier-portal UI reference was used to align workflow coverage (supplier registration and owner/contact details, manufacturing locations, e-learning, questionnaires, documents, product categories, and risk results). The prototype retains its existing visual design and uses original fictional data rather than copying the reference screen contents.

## Backend integration and decisions still needed

No authentication, authorization service, server-side persistence, real file storage, evaluator workflow, physical receipt confirmation, or supplier qualification service is connected. A production version must enforce supplier-company ownership and access controls on the server.

Confirm the product-category master data, which categories require samples and approvals, authorized exceptions, onboarding gate criteria, response/resubmission limits, cancellation policy, required document types, and real support channels before connecting this prototype to production systems.
