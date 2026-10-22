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

- All supplier, product, document, and evaluation records are fictional and live in `app.js`.
- `CATEGORIES` is the configurable mock source for `sampleRequired` and `approvalRequired`. The selected onboarding category is currently `Industrial Components`.
- e-Learning and self-registration step statuses are fictional values in the `onboarding` mock record.
- The learning task follows three sequential activities: e-learning video (1/3), document consent/acceptance (2/3), and a policy questionnaire (3/3). No training video has been provided, so the video area is explicitly a placeholder with a demo-only completion action, not actual viewing verification. The expandable mock policy document covers responsible sourcing, people/environment, and ethical business; acceptance records the policy version and timestamp locally. The final questionnaire has nine original questions, requires 6/9 to pass, and provides explanations and retries. Previous module-based quiz completions are not treated as video viewing or policy consent; existing users start this new flow at 0/3 while unrelated task data is preserved.
- Learning displays one section at a time with a three-step indicator and Back / Next controls. Next unlocks only after completing the current activity; completed sections remain available for review. The selected step and quiz answers persist across navigation and refresh. Finish returns to Supplier Onboarding after passing the questionnaire.
- New Supplier Selection Questionnaire remains visible but disabled with Pending learning until all three learning activities are complete (3/3, including a passing policy quiz). Direct navigation, answer changes, and submission enforce the same prerequisite. Existing saved questionnaire responses are preserved but cannot be accessed until learning is complete; additional risk assessment also remains locked until then.
- The separate supplier pre-screening questionnaire covers governance, labor, safety, environment, and supply-chain practices with Yes / Partially / No / Not applicable responses. Quiz answers, scores, document consent, risk-topic ratings, questionnaire responses, and profile changes are saved locally for demonstration and are not official training, a real risk verdict, legal acceptance, or a submission to procurement.
- Sustainability Risk Assessment is disabled until the supplier questionnaire is submitted. Any Partially or No response enables the additional assessment; all Yes / Not applicable responses mark it Not required and exclude it from onboarding completion totals. The same gate applies to Company Profile and direct task/save actions. Submitted questionnaire responses remain locked. This rule is a prototype screening condition, not an official risk verdict.
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
