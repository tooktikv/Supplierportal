(() => {
  "use strict";

  const learningVideoId="";
  const COMPANY = { name: "Asteron Industrial Supply", id: "SUP-20481", contact: "Maya Chen", email: "maya.chen@asteron.example", phone: "+1 (555) 014-7782" };
  const CATEGORIES = {
    "Industrial Components": { sampleRequired: true, approvalRequired: true },
    "Packaging Materials": { sampleRequired: true, approvalRequired: true },
    "Office Supplies": { sampleRequired: false, approvalRequired: false },
    "Safety Equipment": { sampleRequired: true, approvalRequired: true }
  };
  const needsSample = category => CATEGORIES[category]?.sampleRequired === true;
  const requiresApproval = category => CATEGORIES[category]?.sampleRequired === true && CATEGORIES[category]?.approvalRequired === true;
  function policyFields(request) {
    const record={...request,requestStatus:request.status,sampleType:request.type,sampleRequired:request.category?needsSample(request.category):null,evaluationOutcome:request.outcome||null};
    record.sampleGateStatus=gateOf(record);
    return record;
  }
  const statuses = ["Draft", "Submitted", "Under Review", "Awaiting Sample", "Action Required", "Approved", "Rejected"];
  const initialRequests = [
    { id:"SR-2026-0142", name:"Precision Valve Assembly", code:"PVA-4400", category:"Industrial Components", type:"Physical", status:"Draft", created:"2026-10-18", updated:"2026-10-18", quantity:"3", unit:"pieces", description:"Stainless steel pressure valve, 2-inch inlet.", address:"", recipient:"", deliveryDate:"", instructions:"", files:[], feedback:"", requiredCorrections:"", history:[["Draft Created","2026-10-18T10:00:00"]] },
    { id:"SR-2026-0138", name:"Recycled Kraft Mailer", code:"PKG-RM-220", category:"Packaging Materials", type:"Digital", status:"Submitted", created:"2026-10-16", updated:"2026-10-16", quantity:"", unit:"pieces", description:"Recycled kraft paper mailing envelope, 80% post-consumer material.", address:"", recipient:"", deliveryDate:"", instructions:"", files:[{name:"kraft-specification.pdf",size:1240000,type:"application/pdf"}], feedback:"", requiredCorrections:"", history:[["Draft Created","2026-10-15T09:00:00"],["Request Submitted","2026-10-16T11:30:00"]] },
    { id:"SR-2026-0135", name:"Hydraulic Coupling Kit", code:"HCK-18B", category:"Industrial Components", type:"Both", status:"Under Review", created:"2026-10-14", updated:"2026-10-17", quantity:"2", unit:"sets", description:"High-pressure hydraulic coupling set.", address:"2400 Harbor Way, Suite 100, Portland, OR", recipient:"Receiving Desk", deliveryDate:"2026-10-28", instructions:"Label box with request ID.", files:[{name:"coupling-datasheet.pdf",size:873000,type:"application/pdf"}], feedback:"", requiredCorrections:"", history:[["Draft Created","2026-10-13T14:00:00"],["Request Submitted","2026-10-14T09:15:00"],["Internal Review Started","2026-10-17T13:00:00"]] },
    { id:"SR-2026-0131", name:"Industrial Fastener Set", code:"IFS-M12", category:"Industrial Components", type:"Physical", status:"Awaiting Sample", created:"2026-10-10", updated:"2026-10-12", quantity:"10", unit:"pieces", description:"Zinc-coated M12 fastener assortment.", address:"2400 Harbor Way, Suite 100, Portland, OR", recipient:"Receiving Desk", deliveryDate:"2026-10-25", instructions:"Include packing list.", files:[], feedback:"", requiredCorrections:"", history:[["Draft Created","2026-10-09T10:00:00"],["Request Submitted","2026-10-10T15:00:00"],["Awaiting Physical Sample","2026-10-12T08:00:00"]] },
    { id:"SR-2026-0127", name:"Nitrile Safety Gloves", code:"PPE-NG-XL", category:"Safety Equipment", type:"Both", status:"Action Required", created:"2026-10-06", updated:"2026-10-19", quantity:"5", unit:"pairs", description:"Powder-free nitrile glove, size XL.", address:"2400 Harbor Way, Suite 100, Portland, OR", recipient:"Receiving Desk", deliveryDate:"2026-10-27", instructions:"", files:[{name:"glove-data-sheet.pdf",size:980000,type:"application/pdf"}], feedback:"Please provide the EN 374 chemical resistance certificate and confirm glove thickness.", requiredCorrections:"Attach current EN 374 certificate; confirm product thickness in millimeters.", history:[["Draft Created","2026-10-05T10:00:00"],["Request Submitted","2026-10-06T09:00:00"],["Additional Information Requested","2026-10-19T12:00:00"]] },
    { id:"SR-2026-0119", name:"Modular Conveyor Roller", code:"MCR-800", category:"Industrial Components", type:"Physical", status:"Approved", outcome:"Approved", decisionDate:"2026-10-13", created:"2026-09-24", updated:"2026-10-13", quantity:"2", unit:"pieces", description:"Modular conveyor roller, 800mm.", address:"2400 Harbor Way, Suite 100, Portland, OR", recipient:"Receiving Desk", deliveryDate:"2026-10-05", instructions:"", files:[], feedback:"Sample meets the specified dimensional and performance requirements.", requiredCorrections:"", history:[["Draft Created","2026-09-23T10:00:00"],["Request Submitted","2026-09-24T09:00:00"],["Physical Sample Received","2026-10-02T14:00:00"],["Evaluation Started","2026-10-06T10:00:00"],["Evaluation Completed — Approved","2026-10-13T15:00:00"]] },
    { id:"SR-2026-0112", name:"Reusable Office Organizer", code:"OFF-ORG-12", category:"Office Supplies", type:"Digital", status:"Approved", outcome:"Approved", decisionDate:"2026-10-08", created:"2026-09-19", updated:"2026-10-08", quantity:"", unit:"pieces", description:"Recycled polypropylene desk organizer.", address:"", recipient:"", deliveryDate:"", instructions:"", files:[{name:"organizer-spec.pdf",size:740000,type:"application/pdf"}], feedback:"Category is sample-exempt; digital product specifications received.", requiredCorrections:"", history:[["Draft Created","2026-09-18T09:00:00"],["Request Submitted","2026-09-19T11:00:00"],["Evaluation Completed — Approved","2026-10-08T15:00:00"]] },
    { id:"SR-2026-0106", name:"Protective Face Shield", code:"PPE-FS-90", category:"Safety Equipment", type:"Digital", status:"Rejected", outcome:"Rejected", decisionDate:"2026-09-29", created:"2026-09-15", updated:"2026-09-29", quantity:"", unit:"pieces", description:"Reusable polycarbonate protective face shield.", address:"", recipient:"", deliveryDate:"", instructions:"", files:[], feedback:"Submitted product does not meet the minimum impact resistance requirement.", requiredCorrections:"", history:[["Draft Created","2026-09-14T09:00:00"],["Request Submitted","2026-09-15T11:00:00"],["Evaluation Started","2026-09-22T10:00:00"],["Evaluation Completed — Rejected","2026-09-29T15:00:00"]] },
    { id:"SR-2026-0101", name:"Chemical-Resistant Apron", code:"PPE-APR-42", category:"Safety Equipment", type:"Both", status:"Resubmission Required", created:"2026-09-08", updated:"2026-10-18", quantity:"2", unit:"pieces", description:"Reusable chemical-resistant work apron.", address:"2400 Harbor Way, Suite 100, Portland, OR", recipient:"Receiving Desk", deliveryDate:"2026-10-30", instructions:"", files:[{name:"apron-product-sheet.pdf",size:680000,type:"application/pdf"}], feedback:"Please revise the material thickness and provide an updated chemical resistance certificate.", requiredCorrections:"Confirm thickness in millimeters and attach a current chemical resistance certificate.", revisions:[{date:"2026-10-12T10:30:00",comments:"Uploaded the updated product sheet for review.",files:[{name:"apron-product-sheet.pdf",size:680000,type:"application/pdf"}]}], history:[["Draft Created","2026-09-07T10:00:00"],["Request Submitted","2026-09-08T11:00:00"],["Evaluation Started","2026-10-01T09:00:00"],["Revision submitted","2026-10-12T10:30:00"],["Resubmission Required","2026-10-18T13:00:00"]] }
  ];
  const learningLessons=[
    {
      id:"responsible-sourcing",title:"Responsible sourcing fundamentals",duration:"5 min",
      summary:"Responsible sourcing considers more than price and delivery. Buyers and suppliers can use clear expectations, risk-based checks, and ongoing communication to improve social, environmental, and business outcomes across the supply chain.",
      points:["Understand the sustainability requirements relevant to the product and its supply chain.","Use fair, transparent criteria and communicate requirements before work begins.","Treat supplier review as an opportunity to identify risks and improve, not just a one-time form."],
      questions:[
        {text:"A buyer asks for a sustainability document that your company does not yet have. What is the best first response?",options:["Create a document showing full compliance even if it is not verified.","Explain your current practice honestly, identify the gap, and agree a realistic next step.","Ignore the request until the buyer sends a contract."],answer:1,explanation:"Accurate disclosure and a practical improvement plan support transparency and continuous improvement."},
        {text:"What is a useful way to include sustainability in a purchasing decision?",options:["Consider relevant lifecycle, worker, environmental, and business risks alongside cost and quality.","Use the lowest quoted price as the only decision factor.","Ask only whether the supplier has a sustainability certificate."],answer:0,explanation:"Sustainable procurement considers relevant impacts and risks alongside conventional commercial criteria."},
        {text:"Why should supplier requirements be explained early?",options:["So suppliers can understand expectations and plan to meet them.","So the buyer can change requirements without notice.","So the supplier can avoid keeping records."],answer:0,explanation:"Clear, early communication helps both parties understand requirements and plan implementation."}
      ]
    },
    {
      id:"people-planet",title:"People, labor, health and the environment",duration:"6 min",
      summary:"Responsible business practices respect human rights and labor, provide safe working conditions, and manage environmental impacts such as energy, water, emissions, materials, and waste.",
      points:["Do not use child labor, forced labor, threats, or recruitment practices that restrict worker freedom.","Provide safe work, fair treatment, and a way for workers to raise concerns without retaliation.","Identify significant environmental impacts and maintain proportionate controls and records."],
      questions:[
        {text:"A worker reports a safety hazard but fears punishment for speaking up. What is the responsible response?",options:["Ignore it unless an injury occurs.","Provide a safe reporting channel, address the hazard, and prohibit retaliation.","Ask the worker to resolve the issue privately."],answer:1,explanation:"Workers need accessible ways to raise concerns, and retaliation risks should be addressed."},
        {text:"Which practice is a warning sign of forced labor risk?",options:["Workers can leave employment according to lawful notice terms.","Workers surrender identity documents and cannot freely leave the workplace.","Workers receive written information about working hours."],answer:1,explanation:"Retaining identity documents or restricting freedom of movement can indicate forced labor risk."},
        {text:"A small supplier is starting to manage environmental impacts. What is a sensible first step?",options:["Identify key impacts such as energy, water, materials, and waste, then track practical measures.","Claim zero environmental impact without collecting information.","Wait until every impact can be measured perfectly."],answer:0,explanation:"Start by identifying significant impacts and collecting practical baseline information for improvement."}
      ]
    },
    {
      id:"ethics-integrity",title:"Ethics, integrity and supply-chain responsibility",duration:"5 min",
      summary:"Ethical business means preventing bribery and conflicts of interest, protecting confidential information, keeping accurate records, and encouraging responsible practices in your own supply chain.",
      points:["Never offer or accept improper payments, gifts, or favors to influence a business decision.","Disclose potential conflicts and protect customer and employee information.","Set clear expectations for subcontractors and address concerns through appropriate channels."],
      questions:[
        {text:"A buyer requests a personal payment to speed up supplier approval. What should your company do?",options:["Pay it and record it as a normal business expense.","Refuse, preserve relevant records, and report the request through an appropriate channel.","Ask another employee to make the payment instead."],answer:1,explanation:"Improper payments should be refused and reported; accurate records help support a proper review."},
        {text:"An employee has a close family relationship with a person evaluating your bid. What is the best action?",options:["Disclose the potential conflict through the appropriate process.","Keep it private unless the bid is awarded.","Offer the evaluator a gift to avoid misunderstandings."],answer:0,explanation:"Early disclosure allows the organization to assess and manage a potential conflict transparently."},
        {text:"What is a practical way to extend responsible sourcing expectations to subcontractors?",options:["Communicate relevant requirements, understand key risks, and follow up proportionately.","Assume all subcontractors follow the same practices automatically.","Pass all risk to subcontractors and stop monitoring."],answer:0,explanation:"Clear expectations and proportionate engagement help identify and address supply-chain risks."}
      ]
    }
  ];
  const learningQuestions=[
    {text:"What is the purpose of a sustainable sourcing policy?",options:["To consider relevant environmental, social, and governance risks in purchasing","To guarantee the lowest price for every purchase","To transfer all supplier responsibilities to the buyer","To replace product quality requirements"],answer:0,explanation:"Sustainable sourcing includes relevant environmental, social, and governance considerations alongside commercial requirements."},
    {text:"What should a supplier do when it cannot yet meet a stated requirement?",options:["Claim compliance without evidence","Explain the gap honestly and agree on practical next steps","Stop responding to the buyer","Create an unverified certificate"],answer:1,explanation:"Transparent communication and a realistic improvement plan support responsible business relationships."},
    {text:"When should sourcing expectations be communicated to suppliers?",options:["As early and clearly as practical","Only after a problem occurs","Only when an audit is scheduled","After the contract has ended"],answer:0,explanation:"Early communication gives suppliers time to understand requirements and plan implementation."},
    {text:"Which practice supports safe working conditions?",options:["Keeping hazards confidential","Providing a way to report hazards and addressing them promptly","Discouraging workers from raising concerns","Recording only incidents that cause serious injury"],answer:1,explanation:"Accessible reporting and prompt hazard management help prevent harm."},
    {text:"Which situation can indicate a forced-labor risk?",options:["Workers receive written employment terms","Workers retain their identity documents","Workers surrender identity documents and cannot freely leave","Workers receive safety training"],answer:2,explanation:"Retaining identity documents or restricting freedom of movement can indicate forced-labor risk."},
    {text:"What is a sensible first step for managing environmental impacts?",options:["Identify significant impacts such as energy, water, and waste","Claim there is no impact without collecting information","Wait until every impact can be measured perfectly","Stop keeping operational records"],answer:0,explanation:"Identifying significant impacts provides a practical starting point for controls and improvement."},
    {text:"A buyer requests a personal payment to speed up supplier approval. What should you do?",options:["Pay it and record it as a routine expense","Ask a coworker to pay instead","Refuse and report the request through an appropriate channel","Offer a larger gift instead"],answer:2,explanation:"Improper payments should be refused and reported through an appropriate channel."},
    {text:"An employee has a close relationship with someone evaluating your bid. What is the best action?",options:["Disclose the potential conflict through the appropriate process","Keep it private unless the bid is awarded","Offer the evaluator a gift","Withdraw all company records"],answer:0,explanation:"Disclosure allows the organization to assess and manage a potential conflict transparently."},
    {text:"How can a supplier promote responsible practices in its supply chain?",options:["Assume all subcontractors follow the same practices","Communicate relevant expectations and follow up proportionately","Pass all responsibility to subcontractors","Avoid asking about significant risks"],answer:1,explanation:"Clear expectations and proportionate follow-up help identify and address supply-chain risks."},
    {text:"Which approach best supports trustworthy supplier records?",options:["Keep accurate records and protect confidential information","Change records to match a preferred outcome","Share customer information with anyone who asks","Delete records when a concern is raised"],answer:0,explanation:"Accurate records and appropriate information protection are core responsible-business practices."}
  ];
  const supplierQuestionnaire=[
    ["quality","1. สินค้า/บริการ มีคุณภาพตรงตามต้องการ"],
    ["certification","2. เอกสารการรับรองคุณภาพสินค้า เช่น COA, MSDS, อย., มอก.",["COA","MSDS","อย.","มอก.","เอกสารรับรองคุณภาพสินค้าอื่นๆ"],10],
    ["traceability","3. การตรวจสอบย้อนกลับผลิตภัณฑ์ กระบวนการ หรือการให้บริการ"],
    ["standards","4. ระบบมาตรฐานสินค้า/มาตรฐานอุตสาหกรรม เช่น GHPs, HACCP, ISO, อื่นๆ",["GHPs","HACCP","ISO","เอกสารระบบมาตรฐานสินค้า/มาตรฐานอุตสาหกรรมอื่นๆ"],10],
    ["quality-process","5. กระบวนการรับผิดชอบ/รับประกัน กรณีพบความไม่สอดคล้องของคุณภาพสินค้า/ข้อบกพร่อง"],
    ["qualified-staff","6. บุคลากรมีความชำนาญเฉพาะด้าน และได้รับการอนุญาตหรือรับรองตามกฎหมายกำหนด (ถ้าเกี่ยวข้อง)"],
    ["self-assessment","7. ได้รับการประเมินตนเองตามนโยบายด้านการจัดหาอย่างยั่งยืนและแนวปฏิบัติสำหรับคู่ค้าธุรกิจของ CPF", "system"],
    ["policy-accepted","8. การตอบรับนโยบายด้านการจัดหาอย่างยั่งยืนและแนวปฏิบัติสำหรับคู่ค้าธุรกิจของ CPF", "system"],
    ["credibility","9. ความน่าเชื่อถือเป็นที่ยอมรับ เช่น มีการจดทะเบียนการค้า หรือมีประสบการณ์ในการทำงาน",["ใบจดทะเบียนการค้า","เอกสารความน่าเชื่อถือที่เป็นที่ยอมรับอื่นๆ"],10],
    ["capacity","10. ความสามารถในการตอบสนองความต้องการของ CPF เช่น ปริมาณสินค้า/รถขนส่งเพียงพอ"],
    ["facilities","11. สถานประกอบการ เครื่องจักร เครื่องมือ อุปกรณ์ขนส่ง และสิ่งอำนวยความสะดวกได้มาตรฐานและได้รับอนุญาตตามกฎหมาย",["มอก.","ใบอนุญาต รง.4","เอกสารการรับรองอื่นๆ"],10],
    ["food-audit","12. การตรวจประเมินสถานประกอบการ กรณีสินค้า/บริการอาจกระทบคุณภาพและความปลอดภัยอาหาร"]
  ];
  const initial = {
    requests: initialRequests.map(policyFields),
    registration: { status:"Draft", cocAccepted:false, step:1, data:{}, categories:[{main:"",sub:"",material:"",details:"",files:[]}] },
    profile: {
      company: COMPANY.name, id: COMPANY.id, registration: "US-OR-927461", contact: COMPANY.contact,
      email: COMPANY.email, phone: COMPANY.phone, site: "2400 Harbor Way, Suite 100, Portland, OR 97201",
      categories: Object.keys(CATEGORIES), onboardingCategory:"Industrial Components",
      contacts:[
        {name:COMPANY.contact,role:"Supplier administrator",email:COMPANY.email,phone:COMPANY.phone,status:"Active"},
        {name:"Jordan Patel",role:"Operations contact",email:"jordan.patel@asteron.example",phone:"+1 (555) 014-7790",status:"Active"}
      ],
      factories:[{name:"Asteron Portland Manufacturing",location:"Portland, Oregon, United States",type:"Manufacturing",status:"Submitted"}],
      products:[{name:"Industrial Components",code:"CAT-IND",status:"Active"},{name:"Packaging Materials",code:"CAT-PKG",status:"Active"},{name:"Safety Equipment",code:"CAT-SAF",status:"Pending review"}]
    },
    onboarding: {
      eLearning: {status:"Completed",updated:"2026-10-04"},
      selfRegistration: {status:"Not Started",updated:""},
      procurementReview: {status:"Pending",updated:""},
      tasks: {"sourcing-policy":0,"sustainability-risk":0,"supplier-questionnaire":0},
      learningQuizAnswers: {},
      learningQuizResults: {},
      learningFlow: {videoCompleted:false,consentAccepted:false,answers:{},result:null,quizVersion:2},
      riskAnswers: {},
      questionnaireAnswers: {},
      announcement: {status:"Not Started"},
      evaluation: {status:"Pending"}
    },
    documents: [
      {name:"Certificate of Incorporation",type:"Company Registration",related:"Asteron Industrial Supply",issue:"2022-03-14",expiry:"—",status:"Verified",group:"Registration"},
      {name:"ISO 9001:2015 Certificate",type:"Quality Certification",related:"Asteron Portland Manufacturing",issue:"2025-05-01",expiry:"2027-04-30",status:"Current",group:"Pre-Screening",history:[{version:1,date:"2022-05-01",files:[{name:"iso-9001-2022.pdf",expiry:"2025-04-30"}]},{version:2,date:"2025-05-01",files:[{name:"iso-9001-2025.pdf",expiry:"2027-04-30"}]}]},
      {name:"W-9 Tax Form",type:"Tax Documentation",related:"Asteron Industrial Supply",issue:"2026-01-12",expiry:"—",status:"Current",group:"Registration"},
      {name:"Factory Audit Summary",type:"Factory Documentation",related:"Asteron Portland Manufacturing",issue:"2025-11-08",expiry:"2026-10-18",status:"Expired",group:"Pre-Screening"},
      {name:"Product Liability Insurance",type:"Insurance Certificate",related:"Asteron Industrial Supply",issue:"2025-11-05",expiry:"2026-11-05",status:"Expiring Soon",group:"Pre-Screening"},
      {name:"Supplier Code of Conduct",type:"Supplier Declaration",related:"Asteron Industrial Supply",issue:"2026-10-16",expiry:"—",status:"Pending",group:"Pre-Screening"},
      {name:"Product Ingredient Information",type:"Product Evidence",related:"Industrial Components",issue:"",expiry:"",status:"Required",group:"Sample Request"},
      {name:"Certificate of Analysis (COA)",type:"Product Evidence",related:"Industrial Components",issue:"",expiry:"",status:"Required",group:"Sample Request"}
    ]
  };
  let db = loadDb();
  let page = "Supplier Onboarding", selectedId = null, form = null, wizardStep = 0, responseMode = "feedback", currentTask = null, profileTab = "Company information", documentFilter = "All", pendingDocs = [], pendingMeta = null, previewDoc = null, profileEditMode = false, profileEntryMode = null, siteDraft = null;
  const filePreviews=new Map();
  // Keeps a session-only object URL so uploaded files can be previewed later
  function trackFile(file,type) {
    const uid=`${Date.now().toString(36)}${Math.random().toString(36).slice(2,8)}`;
    if(/\.(pdf|png|jpe?g)$/i.test(file.name))filePreviews.set(uid,URL.createObjectURL(file));
    return {name:file.name,size:file.size,type,expiry:"",uid};
  }
  let filters = { search:"", status:"All statuses", category:"All categories", type:"All types", date:"Any date" }, sort = { key:"created", direction:"desc" };

  function loadDb() {
    try {
      const saved = localStorage.getItem("northstar-supplier-portal-v1");
      if (!saved) return structuredClone(initial);
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed.requests) || !parsed.profile) throw new Error("Saved portal data is incomplete.");
      parsed.profile.onboardingCategory=parsed.profile.onboardingCategory||"Industrial Components";
      parsed.profile.contacts=parsed.profile.contacts||structuredClone(initial.profile.contacts);
      parsed.profile.factories=parsed.profile.factories||structuredClone(initial.profile.factories);
      parsed.profile.products=parsed.profile.products||structuredClone(initial.profile.products);
      parsed.registration=parsed.registration||structuredClone(initial.registration);
      parsed.onboarding=parsed.onboarding||structuredClone(initial.onboarding);
      parsed.onboarding.tasks=parsed.onboarding.tasks||structuredClone(initial.onboarding.tasks);
      parsed.onboarding.learningQuizAnswers=parsed.onboarding.learningQuizAnswers||{};
      parsed.onboarding.learningQuizResults=parsed.onboarding.learningQuizResults||{};
      parsed.onboarding.learningFlow=parsed.onboarding.learningFlow||structuredClone(initial.onboarding.learningFlow);
      const learning=parsed.onboarding.learningFlow;
      if(learning.quizVersion!==2) { learning.answers={}; learning.result=null; learning.quizVersion=2; }
      parsed.onboarding.tasks["sourcing-policy"]=learning.videoCompleted?(learning.consentAccepted?(learning.result?.passed?3:2):1):0;
      parsed.onboarding.riskAnswers=parsed.onboarding.riskAnswers||{};
      parsed.onboarding.questionnaireAnswers=parsed.onboarding.questionnaireAnswers||{};
      if(parsed.onboarding.questionnaireVersion!==2) {
        parsed.onboarding.questionnaireAnswers={};
        parsed.onboarding.tasks["supplier-questionnaire"]=0;
        parsed.onboarding.questionnaireVersion=2;
      }
      parsed.onboarding.questionnaireAnswers=parsed.onboarding.questionnaireAnswers||{};
      parsed.documents=parsed.documents||structuredClone(initial.documents);
      parsed.documents.forEach((document,index)=>{
        document.id=document.id||`DOC-${String(index+1).padStart(4,"0")}`;
        document.history=document.history||[];
      });
      parsed.onboarding.procurementReview=parsed.onboarding.procurementReview||structuredClone(initial.onboarding.procurementReview);
      if(parsed.onboarding.stageVersion!==2) { parsed.onboarding.procurementReview=structuredClone(initial.onboarding.procurementReview); parsed.onboarding.stageVersion=2; }
      parsed.onboarding.announcement=parsed.onboarding.announcement||structuredClone(initial.onboarding.announcement);
      parsed.onboarding.evaluation=parsed.onboarding.evaluation||structuredClone(initial.onboarding.evaluation);
      parsed.requests=parsed.requests.map(policyFields);
      return parsed;
    } catch (error) {
      console.error("Unable to load saved supplier portal data.", error);
      return structuredClone(initial);
    }
  }
  function saveDb() {
    try { localStorage.setItem("northstar-supplier-portal-v1", JSON.stringify(db)); }
    catch (error) { console.error("Unable to save supplier portal data.", error); toast("Could not save changes in this browser."); }
  }
  const escapeHtml = (value="") => String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const fmtDate = value => value ? new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric"}).format(new Date(value.length === 10 ? `${value}T12:00:00` : value)) : "—";
  const todayIso = () => new Date().toISOString().slice(0,10);
  // `call` is the full inline handler expression and must end with this.value
  const expiryField = (call,value,label="Expiry date",disabled=false) => `<label class="file-expiry">${label}<input type="date" min="${todayIso()}" value="${escapeHtml(value||"")}" ${disabled?"disabled":""} onchange="${call}"></label>`;
  const expiryAccepted = (value,message) => { if(value&&value<todayIso()) { toast(message);return false; } return true; };
  const DOC_SOURCES = {Registration:"Supplier registration","Pre-Screening":"Pre-screening","Sample Request":"Sample request",Manual:"Manual upload"};
  const docSource = doc => DOC_SOURCES[doc.group]||doc.group||"—";
  const findDocByName = (name,type) => db.documents.find(d=>d.name.trim().toLowerCase()===String(name||"").trim().toLowerCase()&&(!type||d.type===type));
  // Each document keeps every upload as a version; old-shape or seeded records are converted on read
  function docVersions(doc) {
    const expiry=doc.expiry&&doc.expiry!=="—"?doc.expiry:"";
    const list=(doc.history||[]).map(v=>v.files?v:{version:v.version,date:v.date,files:[{name:v.fileName||doc.name,size:doc.fileSize,expiry}]});
    return list.length||!doc.issue?list:[{version:1,date:doc.issue,files:[{name:`${doc.name}.pdf`,expiry}]}];
  }
  const latestUpload = doc => docVersions(doc).at(-1)?.date||doc.issue||"";
  function expiryState(doc) {
    if(!doc.expiry||doc.expiry==="—")return "";
    const days=(new Date(`${doc.expiry}T23:59:59`)-new Date())/864e5;
    return days<0?"Expired":days<=30?"Expiring Soon":"";
  }
  // Same document name = new version of the existing record; the older versions stay in history
  function pushDocument(files,{name,type,group,related=db.profile.company}) {
    files=[].concat(files);
    if(!files.length)return null;
    let doc=findDocByName(name,type);
    if(doc)doc.history=docVersions(doc);
    else { doc={id:`DOC-${String(db.documents.length+1).padStart(4,"0")}`,name,type,related,group,status:"Pending",history:[]};db.documents.push(doc); }
    const today=todayIso(), expiries=files.map(f=>f.expiry).filter(Boolean).sort();
    doc.history.push({version:doc.history.length+1,date:today,files:files.map(f=>({name:f.name,size:f.size,type:f.type||"",expiry:f.expiry||"",uid:f.uid}))});
    Object.assign(doc,{issue:today,expiry:expiries[0]||"",status:"Pending"});
    return doc;
  }
  const addRequestDocuments = (r,files=r.files||[]) => pushDocument(files,{name:`Sample attachments · ${r.name}`,type:"Product Evidence",group:"Sample Request",related:r.name});
  const isPhysical = type => type === "Physical" || type === "Both";
  const isDigital = type => type === "Digital" || type === "Both";
  function gateOf(r) {
    if(!r.category) return "Pending";
    if(r.sampleRequired===false||!requiresApproval(r.category)) return "Exempt";
    const outcome=r.evaluationOutcome||r.outcome;
    return outcome==="Approved"?"Satisfied":outcome==="Rejected"?"Failed":"Pending";
  }
  function badge(status) {
    const color = ["Approved","Completed","Verified","Current","Satisfied"].includes(status) ? "green"
      : ["Action Required","Awaiting Sample","Under Review","Expiring Soon","Pending","Submitted","Required"].includes(status) ? (status === "Under Review" || status === "Submitted" ? "blue" : "amber")
      : ["Rejected","Failed"].includes(status) ? "red" : "gray";
    return `<span class="status ${color}">${escapeHtml(status)}</span>`;
  }
  function toast(message) {
    const region = document.querySelector(".toast-region");
    if (!region) return;
    const el = document.createElement("div"); el.className = "toast"; el.textContent = message; region.append(el);
    setTimeout(() => el.remove(), 3400);
  }
  function transition(req, next) {
    const allowed = {
      Draft:["Submitted","Cancelled"], Submitted:["Under Review","Awaiting Sample","Action Required","Approved","Rejected"],
      "Under Review":["Action Required","Awaiting Sample","Under Evaluation","Approved","Rejected"],
      "Awaiting Sample":["Sample Received","Action Required","Cancelled"], "Sample Received":["Under Evaluation","Action Required"],
      "Under Evaluation":["Action Required","Resubmission Required","Approved","Rejected"],
      "Action Required":["Under Review","Submitted","Resubmission Required"], "Resubmission Required":["Under Review","Submitted"],
      Approved:[], Rejected:[], Cancelled:[]
    };
    if (!allowed[req.status]?.includes(next)) throw new Error(`Invalid request transition: ${req.status} → ${next}`);
    req.status = next; req.requestStatus=next; req.updated = new Date().toISOString().slice(0,10);
    req.sampleGateStatus=gateOf(req);
    req.history.push([next === "Submitted" ? "Request Submitted" : next, new Date().toISOString()]);
  }
  function onboardingGate() {
    const category=db.profile.onboardingCategory;
    if(!needsSample(category)) return "Exempt";
    const latest=db.requests.filter(r=>r.category===category).sort((a,b)=>(b.updated||"").localeCompare(a.updated||""))[0];
    return latest?gateOf(latest):"Pending";
  }
  function percentProgress() {
    const stages=onboardingStages();
    return Math.round(stages.filter(stage=>stage.status==="Completed").length/stages.length*100);
  }
  const onboardingTasks=[
    {id:"sourcing-policy",title:"Sustainable Sourcing Policy and Supplier Guiding Principles",category:"Learning",required:3,description:"Watch the e-learning video, accept the policy document, then complete the policy questionnaire.",icon:"▤"},
    {id:"sustainability-risk",title:"Sustainability Risk Assessment",category:"Assessment",required:1,description:"Complete the topic assessment when the demo screening flags a risk.",icon:"◈"},
    {id:"supplier-questionnaire",title:"New Supplier Selection Questionnaire",category:"Questionnaire",required:1,description:"Complete the supplier pre-screening questionnaire for your company.",icon:"☷"}
  ];
  function taskCount(id) { return Math.min(onboardingTasks.find(t=>t.id===id)?.required||0,Number(db.onboarding.tasks[id])||0); }
  function questionnaireAvailable() { return taskCount("sourcing-policy")===3; }
  function taskBlockedMessage(id) {
    if(!registrationDone())return "Complete supplier registration first.";
    if(id==="supplier-questionnaire"&&!questionnaireAvailable())return "Complete all 3 learning activities in Sustainable Sourcing Policy and Supplier Guiding Principles first.";
    if(id==="sustainability-risk"&&riskAssessmentState()!=="required")return riskAssessmentMessage();
    return "";
  }
  function riskAssessmentState() {
    if(!questionnaireAvailable()||!taskCount("supplier-questionnaire"))return "pending";
    return supplierQuestionnaire.some(([key,,type])=>type!=="system"&&db.onboarding.questionnaireAnswers[key]?.answer==="No")?"required":"not-required";
  }
  function riskAssessmentMessage() {
    return riskAssessmentState()==="pending"?"Complete and submit the New Supplier Selection Questionnaire first. In this demo, any No response triggers a follow-up assessment.":"No No responses were identified in the demo questionnaire. Additional assessment is not required.";
  }
  function requiredOnboardingTasks() {
    return onboardingTasks.filter(task=>task.id!=="sustainability-risk"||riskAssessmentState()!=="not-required");
  }
  function allTasksComplete() { return requiredOnboardingTasks().every(task=>taskCount(task.id)>=task.required); }
  function onboardingStages() {
    const registered=registrationDone();
    const reviewed=registered&&db.onboarding.procurementReview.status==="Completed";
    const tasksDone=registered&&allTasksComplete();
    const announced=tasksDone&&db.onboarding.announcement.status==="Completed";
    const required=requiredOnboardingTasks();
    return [
      {title:"Supplier registration",description:registered?"Company registration submitted":"Complete the Supplier Registration task below",status:registered?"Completed":"In Progress"},
      {title:"Procurement review",description:reviewed?"Registration details reviewed by procurement":registered?"Procurement is reviewing your registration":"Starts after your registration is submitted",status:reviewed?"Completed":registered?"In Progress":"Not Started"},
      {title:"Your tasks",description:registered?`${required.reduce((sum,t)=>sum+taskCount(t.id),0)} of ${required.reduce((sum,t)=>sum+t.required,0)} activities completed`:"Unlocks after your registration is submitted",status:tasksDone?"Completed":registered?"In Progress":"Not Started"},
      {title:"Awaiting announcement",description:"Supplier pre-screening outcome will be shared when ready",status:announced?"Completed":tasksDone?"In Progress":"Not Started"},
      {title:"New supplier evaluation result",description:"Final supplier evaluation outcome",status:db.onboarding.evaluation.status==="Completed"?"Completed":announced?"In Progress":"Not Started"}
    ];
  }
  const REG_STEPS=["ข้อมูลทั่วไป","เอกสารสำคัญ","ข้อมูลกลุ่มสินค้า","ตรวจสอบข้อมูล"];
  const REG_COUNTRIES=["ไทย","ลาว","กัมพูชา","เมียนมา","เวียดนาม","มาเลเซีย","สิงคโปร์","อินโดนีเซีย","ฟิลิปปินส์","จีน","ญี่ปุ่น","เกาหลีใต้","อินเดีย","สหรัฐอเมริกา","สหราชอาณาจักร","เยอรมนี","ออสเตรเลีย"];
  const REG_COMPANY_PREFIX=["บจก.","บมจ.","หจก.","ห้างหุ้นส่วนสามัญ","สหกรณ์","วิสาหกิจชุมชน"];
  const REG_PERSON_PREFIX=["นาย","นาง","นางสาว","ดร."];
  const REG_POSITIONS=["เจ้าของกิจการ","กรรมการผู้จัดการ","ผู้จัดการ","เจ้าหน้าที่/พนักงาน","เจ้าหน้าที่ฝ่ายขาย","เจ้าหน้าที่ฝ่ายบัญชี","อื่นๆ"];
  const REG_DEPARTMENTS=["ฝ่ายบริหาร","ฝ่ายขาย","ฝ่ายจัดซื้อ","ฝ่ายผลิต","ฝ่ายควบคุมคุณภาพ","ฝ่ายบัญชีและการเงิน","อื่นๆ"];
  // Sample master data only; production must load the full province/district/sub-district lists.
  const REG_ADDRESS={
    "กรุงเทพมหานคร":{"บางรัก":["สีลม","สุริยวงศ์","บางรัก","มหาพฤฒาราม","สี่พระยา"],"คลองเตย":["คลองเตย","คลองตัน","พระโขนง"],"จตุจักร":["จตุจักร","ลาดยาว","จอมพล"]},
    "นนทบุรี":{"เมืองนนทบุรี":["สวนใหญ่","ตลาดขวัญ","บางเขน"],"ปากเกร็ด":["ปากเกร็ด","บางตลาด"]},
    "สมุทรปราการ":{"เมืองสมุทรปราการ":["ปากน้ำ","สำโรงเหนือ"],"บางพลี":["บางพลีใหญ่","บางแก้ว"]},
    "ชลบุรี":{"เมืองชลบุรี":["บางปลาสร้อย","เสม็ด"],"ศรีราชา":["ศรีราชา","สุรศักดิ์"]},
    "เชียงใหม่":{"เมืองเชียงใหม่":["ศรีภูมิ","พระสิงห์"],"สารภี":["ยางเนิ้ง","ไชยสถาน"]}
  };
  // Sample master data only; replace with the real Main / Sub / Material Group lists.
  const REG_PRODUCTS={
    "วัตถุดิบอาหาร":{"เนื้อสัตว์และผลิตภัณฑ์":["เนื้อไก่","เนื้อสุกร","เนื้อสัตว์น้ำ"],"พืชผักและผลไม้":["ผักสด","ผลไม้สด","ธัญพืช"]},
    "บรรจุภัณฑ์":{"บรรจุภัณฑ์พลาสติก":["ถุงพลาสติก","ถาดพลาสติก"],"บรรจุภัณฑ์กระดาษ":["กล่องกระดาษ","ฉลากและสติกเกอร์"]},
    "อะไหล่และอุปกรณ์":{"อะไหล่เครื่องจักร":["ลูกปืนและซีล","วาล์วและท่อ"],"อุปกรณ์ความปลอดภัย":["อุปกรณ์ป้องกันส่วนบุคคล","เวชภัณฑ์"]},
    "บริการ":{"โลจิสติกส์":["ขนส่งควบคุมอุณหภูมิ","คลังสินค้า"],"บริการสนับสนุน":["ทำความสะอาด","กำจัดแมลง"]}
  };
  const chkThai=v=>/^[\u0E00-\u0E7F\s.]+$/.test(v)?"":"กรอกเป็นภาษาไทยเท่านั้น";
  const chkEn=v=>/^[A-Za-z\s.'-]+$/.test(v)?"":"กรอกเป็นภาษาอังกฤษเท่านั้น";
  const chkPhone=v=>/^\d{9,15}$/.test(v)?"":"ระบุตัวเลข 9-15 หลัก";
  const chkEmail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)?"":"รูปแบบอีเมลไม่ถูกต้อง";
  const chkCoord=(min,max,name)=>v=>/^-?\d+(\.\d+)?$/.test(v)&&Number(v)>=min&&Number(v)<=max?"":`${name}ต้องเป็นตัวเลขระหว่าง ${min} ถึง ${max}`;
  function chkRegDate(v) {
    const m=/^(\d{2})-(\d{2})-(\d{4})$/.exec(v);
    if(!m)return "ระบุวันที่ในรูปแบบ DD-MM-YYYY";
    const date=new Date(Number(m[3]),Number(m[2])-1,Number(m[1]));
    return date.getFullYear()===Number(m[3])&&date.getMonth()===Number(m[2])-1&&date.getDate()===Number(m[1])?"":"วันที่ไม่ถูกต้อง";
  }
  const regPerson=(p,same)=>{
    const lock=d=>same&&Boolean(d[`${p}same`]);
    return [
      ...(same?[{k:`${p}same`,label:"ใช้ข้อมูลเดียวกับผู้ใช้งานระบบ",t:"checkbox"}]:[]),
      {k:`${p}prefix`,label:"คำนำหน้า",t:"select",opts:REG_PERSON_PREFIX,req:1,ph:"เลือกคำนำหน้า"},
      {k:`${p}firstTh`,label:"ชื่อ (ไทย)",t:"text",req:1,max:255,check:chkThai,ph:"ระบุชื่อ"},
      {k:`${p}lastTh`,label:"นามสกุล (ไทย)",t:"text",req:1,max:255,check:chkThai,span:2,ph:"ระบุนามสกุล"},
      {k:`${p}firstEn`,label:"ชื่อ (อังกฤษ)",t:"text",max:255,check:chkEn,span:2,ro:lock,ph:"First name"},
      {k:`${p}lastEn`,label:"นามสกุล (อังกฤษ)",t:"text",max:255,check:chkEn,span:2,ro:lock,ph:"Last name"},
      {k:`${p}position`,label:"ตำแหน่ง",t:"select",opts:REG_POSITIONS,req:1,ph:"เลือกตำแหน่ง",reset:[`${p}positionOther`]},
      {k:`${p}positionOther`,label:"ระบุตำแหน่งอื่น",t:"text",req:1,max:255,ph:"กรณีเลือกอื่นๆ โปรดระบุตำแหน่ง",dis:d=>d[`${p}position`]!=="อื่นๆ"},
      {k:`${p}dept`,label:"หน่วยงาน",t:"select",opts:REG_DEPARTMENTS,req:1,ph:"เลือกหน่วยงาน",reset:[`${p}deptOther`]},
      {k:`${p}deptOther`,label:"ระบุหน่วยงานอื่น",t:"text",req:1,max:255,ph:"กรณีเลือกอื่นๆ โปรดระบุหน่วยงาน",dis:d=>d[`${p}dept`]!=="อื่นๆ"},
      {k:`${p}phone`,label:"เบอร์โทรศัพท์",t:"text",mode:"tel",req:1,check:chkPhone,span:2,ro:lock,ph:"ระบุเบอร์โทรศัพท์"},
      {k:`${p}email`,label:"อีเมล",t:"text",mode:"email",req:1,check:chkEmail,span:2,ro:lock,ph:"ระบุอีเมล"}
    ];
  };
  const REG_STEP1=[
    {title:"ข้อมูลทั่วไป",fields:[
      {k:"companyType",label:"ประเภทบริษัท",t:"radio",opts:["นิติบุคคล","บุคคลธรรมดา"],req:1},
      {k:"country",label:"ประเทศที่จดทะเบียน",t:"select",opts:REG_COUNTRIES,req:1,ph:"เลือกประเทศ"},
      {k:"regNo",label:"เลขทะเบียนนิติบุคคล",t:"text",req:1,max:20,ph:"ระบุเลขทะเบียน",check:v=>/^[A-Za-z0-9]+$/.test(v)?"":"ใช้ตัวอักษรหรือตัวเลขเท่านั้น ห้ามมีอักขระพิเศษ"},
      {k:"certDate",label:"วันที่ให้การรับรอง",t:"date",req:1,ph:"DD-MM-YYYY",check:chkRegDate},
      {k:"vatRegistered",label:"การจดทะเบียนภาษีมูลค่าเพิ่ม",t:"radio",opts:["จดทะเบียนแล้ว","ยังไม่ได้จดทะเบียน"],req:1},
      {k:"companyPrefix",label:"คำนำหน้านิติบุคคล",t:"select",opts:REG_COMPANY_PREFIX,req:1,ph:"เลือกคำนำหน้า"},
      {k:"companyName",label:"ชื่อนิติบุคคล",t:"text",req:1,max:255,span:2,ph:"ระบุชื่อบริษัท"},
      {k:"businessType",label:"ประเภทธุรกิจผู้ขาย",t:"select",opts:["ตัวแทนจำหน่าย","ผู้ผลิต","สหกรณ์","เกษตรกร"],req:1,ph:"เลือกประเภทธุรกิจผู้ขาย"},
      {k:"employees",label:"จำนวนพนักงาน",t:"text",mode:"numeric",req:1,ph:"ระบุจำนวนพนักงาน",check:v=>/^\d+$/.test(v)&&Number(v)>0?"":"ระบุจำนวนเต็มมากกว่า 0"},
      {k:"phone",label:"เบอร์โทรศัพท์",t:"text",mode:"tel",req:1,check:chkPhone,ph:"ระบุเบอร์โทรศัพท์"},
      {k:"email",label:"อีเมล",t:"text",mode:"email",req:1,check:chkEmail,ph:"ระบุอีเมล"},
      {k:"branchType",label:"สาขา",t:"radio",opts:["สำนักงานใหญ่","สาขา"],req:1,reset:["branchName"]},
      {k:"branchCode",label:"รหัสสาขา",t:"text",mode:"numeric",req:1,ph:"ระบุรหัสสาขา",check:v=>/^\d{5}$/.test(v)?"":"ระบุตัวเลข 5 หลัก"},
      {k:"branchName",label:"ชื่อสาขา",t:"text",req:1,max:255,span:2,ph:"ระบุชื่อสาขา",dis:d=>d.branchType!=="สาขา"}
    ]},
    {title:"ข้อมูลผู้ติดต่อ",fields:regPerson("c_",true)},
    {title:"ข้อมูลเจ้าของบริษัท (หรือผู้มีอำนาจลงนามเอกสาร)",fields:regPerson("o_",false)},
    {title:"ที่อยู่บริษัท หรือสถานประกอบการ",fields:[
      {k:"a_country",label:"ประเทศ",t:"select",opts:REG_COUNTRIES,req:1,ph:"เลือกประเทศ"},
      {k:"a_line1",label:"ที่อยู่ บรรทัดที่ 1",t:"text",req:1,max:500,span:3,ph:"ระบุที่อยู่ บรรทัดที่ 1"},
      {k:"a_line2",label:"ที่อยู่ บรรทัดที่ 2 (ไม่บังคับ)",t:"text",max:500,span:4,ph:"ระบุที่อยู่ บรรทัดที่ 2"},
      {k:"a_province",label:"จังหวัด",t:"select",opts:Object.keys(REG_ADDRESS),req:1,ph:"เลือกจังหวัด",reset:["a_district","a_sub"]},
      {k:"a_district",label:"เขต/อำเภอ",t:"select",opts:d=>Object.keys(REG_ADDRESS[d.a_province]||{}),req:1,ph:"เลือกเขต/อำเภอ",reset:["a_sub"],dis:d=>!d.a_province},
      {k:"a_sub",label:"แขวง/ตำบล",t:"select",opts:d=>REG_ADDRESS[d.a_province]?.[d.a_district]||[],req:1,ph:"เลือกแขวง/ตำบล",dis:d=>!d.a_district},
      {k:"a_postal",label:"รหัสไปรษณีย์",t:"text",mode:"numeric",req:1,ph:"ระบุรหัสไปรษณีย์",check:v=>/^\d{5}$/.test(v)?"":"ระบุรหัสไปรษณีย์ 5 หลัก"}
    ]},
    {title:"พิกัดที่ตั้งของบริษัท หรือสถานประกอบการ",hint:"กรุณาระบุตำแหน่งที่ตั้งของบริษัท หรือสถานประกอบการ",map:true,fields:[
      {k:"lat",label:"ละติจูด",t:"text",mode:"decimal",req:1,span:2,ph:"ระบุละติจูด เช่น 12.1234567",check:chkCoord(-90,90,"ละติจูด")},
      {k:"lng",label:"ลองจิจูด",t:"text",mode:"decimal",req:1,span:2,ph:"ระบุลองจิจูด เช่น 100.1234567",check:chkCoord(-180,180,"ลองจิจูด")},
      {k:"mapQuery",label:"สถานที่ตั้งบริษัท หรือสถานประกอบการ (ค้นหาด้วย Google Maps)",t:"text",span:4,ph:"ค้นหาสถานที่"}
    ]}
  ];
  function regDocFields(d) {
    const list=d.companyType==="บุคคลธรรมดา"
      ?[["idCopy","สำเนาบัตรประชาชน","pdf"],["houseReg","สำเนาทะเบียนบ้าน","pdf"],["sitePhotos","รูปถ่ายสถานประกอบการ","img"]]
      :[["companyInfo","ข้อมูลบริษัท","pdf"],["certificate","หนังสือรับรอง","pdf"],["vat20","ภ.พ.20","pdf"],["signerId","สำเนาบัตรประชาชนผู้มีอำนาจลงนาม","pdf"],["sitePhotos","รูปถ่ายสถานประกอบการ","img"]];
    return list.flatMap(([id,label,kind])=>{
      const field={k:`f_${id}`,label,t:"file",kind,req:1,docType:{vat20:"Tax Documentation",sitePhotos:"Site Photos",idCopy:"Identity Document",houseReg:"Identity Document",signerId:"Identity Document"}[id]||"Company Registration"};
      if(id==="vat20")field.show=x=>x.vatRegistered==="จดทะเบียนแล้ว";
      return id==="sitePhotos"?[field,{k:"photoConfirm",label:"ฉันยืนยันว่ารูปถ่ายสถานประกอบการเป็นปัจจุบันจากสถานที่จริง และมีอายุไม่เกิน 6 เดือน",t:"checkbox",req:1}]:[field];
    });
  }
  const regCatFields=()=>[
    {k:"main",label:"กลุ่มสินค้าหลัก (Main Category)",t:"select",opts:Object.keys(REG_PRODUCTS),req:1,ph:"เลือกกลุ่มสินค้าหลัก",reset:["sub","material"]},
    {k:"sub",label:"กลุ่มสินค้าย่อย (Sub Category)",t:"select",opts:d=>Object.keys(REG_PRODUCTS[d.main]||{}),req:1,ph:"เลือกกลุ่มสินค้าย่อย",reset:["material"],dis:d=>!d.main},
    {k:"material",label:"กลุ่มวัสดุ (Material Group)",t:"select",opts:d=>REG_PRODUCTS[d.main]?.[d.sub]||[],req:1,span:2,ph:"เลือกกลุ่มวัสดุ",dis:d=>!d.sub},
    {k:"details",label:"รายละเอียดของกลุ่มสินค้า (Category Details)",t:"textarea",max:5000,ph:"ระบุรายละเอียด (ไม่เกิน 5000 ตัวอักษร)"},
    {k:"files",label:"แคตตาล็อก (Catalog)",t:"file",kind:"pdf",req:1}
  ];
  const SITE_FIELDS=[
    {k:"name",label:"ชื่อโรงงานผู้ผลิตสินค้า",t:"text",req:1,max:255,span:2,ph:"ระบุชื่อโรงงานผู้ผลิตสินค้า"},
    {k:"country",label:"ประเทศ",t:"select",opts:REG_COUNTRIES,req:1,span:2,ph:"เลือกประเทศ"},
    {k:"address",label:"ที่อยู่",t:"text",req:1,max:500,span:4,ph:"ระบุที่อยู่"},
    {k:"province",label:"จังหวัด",t:"select",opts:Object.keys(REG_ADDRESS),req:1,ph:"เลือกจังหวัด",reset:["district","subdistrict"]},
    {k:"district",label:"เขต/อำเภอ",t:"select",opts:d=>Object.keys(REG_ADDRESS[d.province]||{}),req:1,ph:"เลือกเขต/อำเภอ",reset:["subdistrict"],dis:d=>!d.province},
    {k:"subdistrict",label:"แขวง/ตำบล",t:"select",opts:d=>REG_ADDRESS[d.province]?.[d.district]||[],req:1,ph:"เลือกแขวง/ตำบล",dis:d=>!d.district},
    {k:"postal",label:"รหัสไปรษณีย์",t:"text",mode:"numeric",req:1,ph:"ระบุรหัสไปรษณีย์",check:(v,d)=>d.country==="ไทย"?(/^\d{5}$/.test(v)?"":"ระบุรหัสไปรษณีย์ 5 หลัก"):(/^\d{3,10}$/.test(v)?"":"ระบรหัสไปรษณีย์เป็นตัวเลข")},
    {k:"lat",label:"ละติจูด",t:"text",mode:"decimal",req:1,ph:"ระบุละติจูด",check:chkCoord(-90,90,"ละติจูด")},
    {k:"lng",label:"ลองจิจูด",t:"text",mode:"decimal",req:1,ph:"ระบุลองจิจูด",check:chkCoord(-180,180,"ลองจิจูด")},
    {k:"mapQuery",label:"สถานที่ตั้งโรงงานผู้ผลิตสินค้า",t:"text",span:4,ph:"ค้นหาสถานที่"}
  ];
  let regShowAll=false;
  const regTouched=new Set();
  const registrationDone=()=>db.registration.status==="Submitted";
  const regScopeData=scope=>scope==="site"?siteDraft:scope==="reg"?db.registration.data:db.registration.categories[Number(String(scope).slice(4))];
  const regFieldsFor=(scope,d)=>scope==="site"?SITE_FIELDS:scope==="reg"?[...REG_STEP1.flatMap(s=>s.fields),...regDocFields(d)]:regCatFields();
  const regId=(scope,k)=>`reg-${scope.replace(":","-")}-${k}`;
  const regShowError=(scope,k)=>regShowAll||regTouched.has(`${scope}|${k}`);
  function regFieldError(f,d) {
    if((f.show&&!f.show(d))||f.dis?.(d))return "";
    const req=Boolean(f.req);
    if(f.t==="file")return req&&!(d[f.k]||[]).length?"โปรดอัปโหลดไฟล์":"";
    if(f.t==="checkbox")return req&&!d[f.k]?"โปรดยืนยันข้อความนี้":"";
    const v=String(d[f.k]??"").trim();
    if(!v)return req?(["select","radio"].includes(f.t)?`โปรดเลือก${f.label}`:`โปรดระบุ${f.label}`):"";
    if(f.max&&v.length>f.max)return `ไม่เกิน ${f.max} ตัวอักษร`;
    return f.check?f.check(v,d):"";
  }
  function regFieldHtml(scope,f,d) {
    const dis=Boolean(f.dis?.(d)), ro=Boolean(f.ro?.(d)), id=regId(scope,f.k), val=d[f.k]??"", a=`'${scope}','${f.k}'`;
    const span=f.span||(f.t==="file"?(scope==="reg"?2:4):["textarea","checkbox"].includes(f.t)?4:1);
    const err=regShowError(scope,f.k)?regFieldError(f,d):"";
    const opts=typeof f.opts==="function"?f.opts(d):(f.opts||[]);
    const star=f.req?'<span class="required"> *</span>':"";
    const events=`oninput="window.portalRegInput(${a},this.value)" onblur="window.portalRegBlur(${a})"`;
    let control="";
    if(f.t==="select")control=`<select class="field-control" id="${id}" ${dis?"disabled":""} onchange="window.portalRegSet(${a},this.value)" onblur="window.portalRegBlur(${a})"><option value="">${escapeHtml(f.ph||"เลือก")}</option>${opts.map(o=>`<option ${val===o?"selected":""}>${escapeHtml(o)}</option>`).join("")}</select>`;
    else if(f.t==="radio")control=`<div class="reg-radio-row" role="radiogroup" aria-label="${escapeHtml(f.label)}">${opts.map(o=>`<label class="reg-radio"><input type="radio" name="${id}" value="${escapeHtml(o)}" ${val===o?"checked":""} onchange="window.portalRegSet(${a},this.value)"><span>${escapeHtml(o)}</span></label>`).join("")}</div>`;
    else if(f.t==="textarea")control=`<textarea class="field-control" id="${id}" rows="4" placeholder="${escapeHtml(f.ph||"")}" ${events}>${escapeHtml(val)}</textarea>`;
    else if(f.t==="date")control=`<div class="reg-date"><input class="field-control" id="${id}" type="text" inputmode="numeric" value="${escapeHtml(val)}" placeholder="${escapeHtml(f.ph||"")}" autocomplete="off" ${events}><button type="button" class="reg-date-button" aria-label="เลือกวันที่" onclick="window.portalRegDatePick(${a})">▦</button><input type="date" class="reg-date-native" id="${id}-native" tabindex="-1" aria-hidden="true" onchange="window.portalRegDateNative(${a},this.value)"></div>`;
    else if(f.t==="file") {
      const files=Array.isArray(val)?val:[], img=f.kind==="img", full=files.length>=5;
      control=`<div class="doc-card ${files.length?"done":""}"><div class="doc-card-head"><span class="doc-icon">${img?"▣":"▤"}</span><div><strong>${escapeHtml(f.label)}${star}</strong><small>${img?"PNG หรือ JPG":"PDF"} · สูงสุด 5 MB ต่อไฟล์</small></div><span class="doc-state">${files.length?`✓ อัปโหลดแล้ว ${files.length}/5`:"ยังไม่ได้อัปโหลด"}</span></div><label class="doc-drop ${full?"full":""}" ondragenter="this.classList.add('over')" ondragleave="this.classList.remove('over')" ondrop="this.classList.remove('over')"><input type="file" id="${id}" multiple accept="${img?".png,.jpg,.jpeg":".pdf"}" aria-label="${escapeHtml(f.label)}" onchange="window.portalRegFiles(${a},this.files)" ${full?"disabled":""}><span class="doc-drop-icon">↑</span><span><b>${full?"อัปโหลดครบ 5 ไฟล์แล้ว":"ลากไฟล์มาวาง หรือ <u>เลือกไฟล์</u>"}</b></span></label>${files.length?`<div class="file-list">${files.map((x,i)=>`<div class="file-row"><span class="file-ico">${escapeHtml(x.name.split(".").pop().toUpperCase().slice(0,4))}</span><span class="file-name">${escapeHtml(x.name)}<small>${(x.size/1024).toFixed(0)} KB</small></span><button type="button" aria-label="ลบ ${escapeHtml(x.name)}" onclick="window.portalRegRemoveFile(${a},${i})">ลบ</button>${!img&&scope==="reg"?expiryField(`window.portalRegFileExpiry(${a},${i},this.value)`,x.expiry,"วันหมดอายุเอกสาร (ถ้ามี)"):""}</div>`).join("")}</div>`:""}</div>`;
    } else if(f.t==="checkbox")control=`<label class="reg-check"><input type="checkbox" id="${id}" ${val?"checked":""} onchange="window.portalRegCheck(${a},this.checked)"><span>${escapeHtml(f.label)}${star}</span></label>`;
    else control=`<input class="field-control" id="${id}" type="text" inputmode="${f.mode||"text"}" value="${escapeHtml(val)}" placeholder="${escapeHtml(f.ph||"")}" autocomplete="off" ${dis?"disabled":""} ${ro?"readonly":""} ${events}>`;
    const label=f.t==="checkbox"||f.t==="file"?"":`<label for="${id}">${escapeHtml(f.label)}${star}</label>`;
    return `<div class="form-field reg-field reg-s${span} ${err?"has-error":""}" data-reg-field="${scope}|${f.k}">${label}${control}<span class="form-error">${escapeHtml(err)}</span></div>`;
  }
  function regSectionHtml(scope,title,fields,d,o={}) {
    return `<section class="card reg-section" ${o.id?`id="${o.id}"`:""}><header class="reg-section-head">${o.num?`<span class="reg-sec-num">${o.num}</span>`:""}<div class="reg-section-title"><h2>${title}</h2>${o.hint?`<p>${o.hint}</p>`:""}</div>${o.extra||""}</header><div class="reg-grid">${fields.filter(f=>!f.show||f.show(d)).map(f=>regFieldHtml(scope,f,d)).join("")}</div>${o.after||""}</section>`;
  }
  function regMapHtml(d) {
    const lat=String(d.lat??"").trim(), lng=String(d.lng??"").trim();
    const valid=lat!==""&&lng!==""&&!chkCoord(-90,90,"")(lat)&&!chkCoord(-180,180,"")(lng);
    const q=valid?`${lat},${lng}`:String(d.mapQuery||"").trim();
    if(!q)return '<div class="reg-map-empty">ค้นหาสถานที่ หรือระบุละติจูด/ลองจิจูด เพื่อแสดงแผนที่</div>';
    return `<iframe class="reg-map-frame" title="แผนที่ตำแหน่งที่ตั้ง" src="https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed" loading="lazy" referrerpolicy="no-referrer"></iframe><a class="text-link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}" target="_blank" rel="noopener noreferrer">เปิดใน Google Maps →</a>`;
  }
  function regCocHtml() {
    return `<section class="card reg-section"><header class="reg-section-head"><span class="reg-sec-num">§</span><div class="reg-section-title"><h2>ข้อกำหนดและเงื่อนไข (CoC / T&amp;D)</h2><p>อ่านและยอมรับก่อนเริ่มลงทะเบียนข้อมูลผู้ขาย</p></div></header><div class="notice">เข้าสู่ระบบด้วย ${escapeHtml(COMPANY.email)} · ผู้ขายใหม่ต้องยอมรับ CoC และ T&amp;D ก่อนลงทะเบียนข้อมูลผู้ขาย</div><div class="policy-document policy-preview" role="region" aria-label="CoC and T&amp;D"><h4>จรรยาบรรณคู่ค้าธุรกิจ (Code of Conduct)</h4><ul class="lesson-points"><li>ดำเนินธุรกิจอย่างซื่อสัตย์ โปร่งใส และไม่เสนอหรือรับผลประโยชน์ที่ไม่เหมาะสม</li><li>เคารพสิทธิมนุษยชนและปฏิบัติต่อแรงงานอย่างเป็นธรรม</li><li>ดูแลความปลอดภัยและสิ่งแวดล้อมในการดำเนินงาน</li></ul><h4>ข้อกำหนดและเงื่อนไขการใช้งาน (Terms &amp; Conditions)</h4><ul class="lesson-points"><li>ข้อมูลที่ลงทะเบียนต้องถูกต้อง เป็นปัจจุบัน และสามารถตรวจสอบได้</li><li>บริษัทสามารถขอเอกสารเพิ่มเติมและตรวจสอบข้อมูลของผู้ขายได้</li><li>ผู้ขายรับผิดชอบการรักษาความลับของบัญชีผู้ใช้งาน</li></ul><p class="mock-note">เนื้อหาตัวอย่างสำหรับต้นแบบ ไม่ใช่ข้อกำหนดทางกฎหมายจริง</p></div><label class="commitment-row"><input id="reg-coc" type="checkbox" onchange="window.portalRegCocCheck(this.checked)"><span>Accept CoC and T&amp;D <span class="required">*</span></span></label><div class="reg-actions"><button class="button primary" id="reg-coc-start" disabled onclick="window.portalRegStart()">ยอมรับและเริ่มลงทะเบียน</button></div></section>`;
  }
  function regReviewHtml() {
    const d=db.registration.data;
    const value=(f,data)=>{
      if((f.show&&!f.show(data))||f.dis?.(data))return null;
      const v=data[f.k];
      if(f.t==="file")return (v||[]).map(x=>x.name).join(", ")||"—";
      if(f.t==="checkbox")return v?"ยืนยันแล้ว":"ไม่ได้เลือก";
      return v||"—";
    };
    const block=(title,fields,data,step)=>`<section class="card reg-section"><header class="reg-section-head"><div class="reg-section-title"><h2>${title}</h2></div><button class="button" onclick="window.portalRegGo(${step})">แก้ไข</button></header><div class="info-grid">${fields.map(f=>{const v=value(f,data);return v===null?"":info(f.label.replace(/ \(ไม่บังคับ\)$/,""),v);}).join("")}</div></section>`;
    return [...REG_STEP1.map(s=>block(s.title,s.fields,d,1)),block("เอกสารสำคัญ",regDocFields(d),d,2),...db.registration.categories.map((c,i)=>block(`กลุ่มสินค้าที่ ${i+1}`,regCatFields(),c,3))].join("");
  }
  function regStepProgress(step) {
    const r=db.registration, d=r.data;
    const groups=step===1?REG_STEP1.map(s=>[s.fields,d]):step===2?[[regDocFields(d),d]]:step===3?r.categories.map(c=>[regCatFields(),c]):[];
    let total=0, ok=0;
    groups.forEach(([fields,data])=>fields.forEach(f=>{
      if(!f.req||(f.show&&!f.show(data))||f.dis?.(data))return;
      total++;if(!regFieldError(f,data))ok++;
    }));
    return {total,ok};
  }
  function regAsideHtml() {
    const r=db.registration, d=r.data;
    const sections=r.step===1?REG_STEP1.map((s,i)=>({id:`reg-sec-${i}`,title:s.title,done:s.fields.every(f=>!regFieldError(f,d))}))
      :r.step===2?[{id:"reg-sec-0",title:"เอกสารสำคัญ",done:regDocFields(d).every(f=>!regFieldError(f,d))}]
      :r.step===3?r.categories.map((c,i)=>({id:`reg-sec-${i}`,title:`กลุ่มสินค้าที่ ${i+1}`,done:regCatFields().every(f=>!regFieldError(f,c))})):[];
    const {total,ok}=regStepProgress(r.step), pct=total?Math.round(ok/total*100):100;
    const steps=REG_STEPS.map((name,i)=>{
      const s=i+1, state=s===r.step?"current":s<r.step?"done":"";
      const subs=s===r.step&&sections.length?`<ul class="reg-substeps">${sections.map(x=>`<li><button type="button" class="${x.done?"done":""}" onclick="window.portalRegScroll('${x.id}')"><span class="reg-sub-dot">${x.done?"✓":""}</span><span>${escapeHtml(x.title)}</span></button></li>`).join("")}</ul>`:"";
      return `<li class="reg-step ${state}"><button type="button" ${s<r.step?`onclick="window.portalRegGo(${s})"`:"disabled"}><span class="reg-step-dot">${s<r.step?"✓":s}</span><span>${name}</span></button>${subs}</li>`;
    }).join("");
    const progress=r.step<4?`<div class="reg-progress"><div class="reg-progress-top"><span>ช่องที่จำเป็นขั้นนี้</span><strong>${ok}/${total}</strong></div><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div></div>`:"";
    return `<div class="reg-aside-title">ขั้นตอนการลงทะเบียน</div><ol class="reg-steps">${steps}</ol>${progress}<p class="reg-legend"><span class="required">*</span> จำเป็นต้องกรอก · บันทึกอัตโนมัติ</p>`;
  }
  function regHtml() {
    const r=db.registration, d=r.data;
    if(!r.cocAccepted)return `<div class="reg-coc-wrap">${regCocHtml()}</div>`;
    let body="";
    if(r.step===1)body=REG_STEP1.map((s,i)=>regSectionHtml("reg",s.title,s.fields,d,{num:i+1,id:`reg-sec-${i}`,hint:s.hint,after:s.map?`<div class="reg-map" id="reg-map">${regMapHtml(d)}</div>`:""})).join("");
    else if(r.step===2)body=regSectionHtml("reg","เอกสารสำคัญ",regDocFields(d),d,{num:1,id:"reg-sec-0",hint:d.companyType==="บุคคลธรรมดา"?"เอกสารสำหรับบุคคลธรรมดา · ต้นแบบนี้เก็บเฉพาะชื่อไฟล์ในเบราว์เซอร์":"เอกสารสำหรับนิติบุคคล · ต้นแบบนี้เก็บเฉพาะชื่อไฟล์ในเบราว์เซอร์"});
    else if(r.step===3)body=r.categories.map((c,i)=>regSectionHtml(`cat:${i}`,`กลุ่มสินค้าที่ ${i+1}`,regCatFields(),c,{num:i+1,id:`reg-sec-${i}`,extra:r.categories.length>1?`<button type="button" class="button danger" onclick="window.portalRegRemoveCat(${i})">ลบกลุ่มสินค้า</button>`:""})).join("")+`<div><button type="button" class="button" onclick="window.portalRegAddCat()">＋ เพิ่มกลุ่มสินค้า</button></div>`;
    else body=`<div class="notice">ตรวจสอบข้อมูลทั้งหมดก่อนส่ง เมื่อส่งข้อมูลแล้ว ระบบจะสร้างโปรไฟล์ผู้ขายจากข้อมูลนี้</div>${regReviewHtml()}`;
    return `<div class="reg-layout"><aside class="card reg-aside" id="reg-aside">${regAsideHtml()}</aside><div class="reg-main">${body}<div class="card reg-footer">${r.step>1?'<button class="button" onclick="window.portalRegStep(-1)">‹ ย้อนกลับ</button>':'<span></span>'}<span class="reg-footer-note">ขั้นที่ ${r.step} จาก 4</span>${r.step<4?'<button class="button primary" onclick="window.portalRegStep(1)">ต่อไป ›</button>':'<button class="button primary" onclick="window.portalRegSubmit()">ส่งข้อมูล</button>'}</div></div></div>`;
  }
  function renderRegistration(el) {
    const back='<button class="button" onclick="window.portalNav(\'Supplier Onboarding\')">← กลับไปหน้า Onboarding</button>';
    el.innerHTML=`<div class="breadcrumbs" style="margin-bottom:11px"><button class="text-link" onclick="window.portalNav('Supplier Onboarding')">Supplier Onboarding</button> / <strong>Registration</strong></div>`+heading("การลงทะเบียนข้อมูลผู้ขาย","กรอกข้อมูลบริษัทเพื่อสร้างโปรไฟล์ผู้ขาย ระบบบันทึกอัตโนมัติ กลับมากรอกต่อได้ทุกเมื่อ",back)+'<div id="reg-root"></div>';
    rerenderReg();
  }
  function regUpdateAside() {
    const aside=document.getElementById("reg-aside");
    if(aside)aside.innerHTML=regAsideHtml();
  }
  function rerenderReg() {
    if(siteDraft)return renderSiteModal();
    const root=document.getElementById("reg-root");
    if(!root)return;
    const y=window.scrollY;
    root.innerHTML=regHtml();
    window.scrollTo(0,y);
  }
  function regRefreshError(scope,k) {
    const d=regScopeData(scope), f=d&&regFieldsFor(scope,d).find(x=>x.k===k), node=document.querySelector(`[data-reg-field="${scope}|${k}"]`);
    if(!f||!node)return;
    const err=regShowError(scope,k)?regFieldError(f,d):"";
    node.classList.toggle("has-error",Boolean(err));
    const target=node.querySelector(".form-error");
    if(target)target.textContent=err;
  }
  function regNormalize(scope) {
    const d=regScopeData(scope);
    regFieldsFor(scope,d).forEach(f=>{ if(f.dis?.(d)&&d[f.k])d[f.k]=""; });
  }
  function regInput(scope,k,value) {
    const d=regScopeData(scope);
    if(!d)return;
    d[k]=value;saveDb();
    if(regShowError(scope,k))regRefreshError(scope,k);
    regUpdateAside();
  }
  function regSet(scope,k,value) {
    const d=regScopeData(scope), f=d&&regFieldsFor(scope,d).find(x=>x.k===k);
    if(!f)return;
    const opts=typeof f.opts==="function"?f.opts(d):f.opts;
    if(value!==""&&opts&&!opts.includes(value))return;
    d[k]=value;(f.reset||[]).forEach(key=>{d[key]="";});
    regNormalize(scope);regTouched.add(`${scope}|${k}`);saveDb();rerenderReg();
  }
  function regCheck(scope,k,checked) {
    const d=regScopeData(scope);
    if(!d)return;
    d[k]=Boolean(checked);
    if(k==="c_same") {
      const [first,...rest]=COMPANY.contact.split(" ");
      Object.assign(d,checked?{c_firstEn:first,c_lastEn:rest.join(" "),c_phone:COMPANY.phone.replace(/\D/g,""),c_email:COMPANY.email}:{c_firstEn:"",c_lastEn:"",c_phone:"",c_email:""});
    }
    regTouched.add(`${scope}|${k}`);saveDb();rerenderReg();
  }
  function regBlur(scope,k) {
    regTouched.add(`${scope}|${k}`);regRefreshError(scope,k);regUpdateAside();
    if(scope==="site"&&["lat","lng","mapQuery"].includes(k)) { const map=document.getElementById("site-map"); if(map&&siteDraft)map.innerHTML=regMapHtml(siteDraft); }
    if(scope==="reg"&&["lat","lng","mapQuery"].includes(k)) { const map=document.getElementById("reg-map"); if(map)map.innerHTML=regMapHtml(db.registration.data); }
  }
  function regDatePick(scope,k) {
    const native=document.getElementById(`${regId(scope,k)}-native`);
    if(native?.showPicker)native.showPicker();else native?.focus();
  }
  function regDateNative(scope,k,iso) {
    const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso||""), d=regScopeData(scope);
    if(!m||!d)return;
    d[k]=`${m[3]}-${m[2]}-${m[1]}`;
    const input=document.getElementById(regId(scope,k));
    if(input)input.value=d[k];
    regTouched.add(`${scope}|${k}`);saveDb();regRefreshError(scope,k);regUpdateAside();
  }
  function regAddFiles(scope,k,files) {
    const d=regScopeData(scope), f=d&&regFieldsFor(scope,d).find(x=>x.k===k);
    if(!f||f.t!=="file")return;
    const img=f.kind==="img", allowed=img?["png","jpg","jpeg"]:["pdf"], current=Array.isArray(d[k])?d[k]:[], added=[];
    for(const file of Array.from(files||[])) {
      const extension=file.name.split(".").pop().toLowerCase();
      if(!allowed.includes(extension)) { toast(`${file.name}: รองรับเฉพาะไฟล์ ${img?"PNG หรือ JPG":"PDF"}`);continue; }
      if(file.size>5*1024*1024) { toast(`${file.name}: ขนาดเกิน 5 MB`);continue; }
      if(current.length+added.length>=5) { toast("อัปโหลดได้สูงสุด 5 ไฟล์");break; }
      added.push(trackFile(file,file.type||extension));
    }
    d[k]=[...current,...added];regTouched.add(`${scope}|${k}`);saveDb();rerenderReg();
  }
  function regFileExpiry(scope,k,index,value) {
    const file=regScopeData(scope)?.[k]?.[index];
    if(!file)return;
    if(!expiryAccepted(value,"วันหมดอายุต้องไม่เป็นวันที่ผ่านมาแล้ว"))return rerenderReg();
    file.expiry=value;saveDb();
  }
  function regRemoveFile(scope,k,index) {
    const d=regScopeData(scope);
    if(!d||!Array.isArray(d[k]))return;
    d[k].splice(index,1);saveDb();rerenderReg();
  }
  function regStepErrors(step) {
    const out=[], d=db.registration.data;
    const scan=(scope,fields,data)=>fields.forEach(f=>{const message=regFieldError(f,data);if(message)out.push({scope,k:f.k,message});});
    if(step===1)REG_STEP1.forEach(s=>scan("reg",s.fields,d));
    if(step===2)scan("reg",regDocFields(d),d);
    if(step===3)db.registration.categories.forEach((c,i)=>scan(`cat:${i}`,regCatFields(),c));
    return out;
  }
  function focusFirstRegError() {
    const node=document.querySelector(".reg-field.has-error");
    node?.scrollIntoView({block:"center"});
    node?.querySelector("input:not([type=hidden]),select,textarea")?.focus({preventScroll:true});
  }
  function regStep(delta) {
    const r=db.registration;
    if(delta>0&&r.step<4&&regStepErrors(r.step).length) { regShowAll=true;rerenderReg();focusFirstRegError();return toast("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วนและถูกต้อง"); }
    regShowAll=false;r.step=Math.max(1,Math.min(4,r.step+delta));saveDb();rerenderReg();window.scrollTo(0,0);
  }
  function regGo(step) {
    const r=db.registration;
    if(!Number.isInteger(step)||step<1||step>=r.step)return;
    regShowAll=false;r.step=step;saveDb();rerenderReg();window.scrollTo(0,0);
  }
  function regAddCategory() {
    db.registration.categories.push({main:"",sub:"",material:"",details:"",files:[]});saveDb();rerenderReg();
  }
  function regRemoveCategory(index) {
    if(db.registration.categories.length<=1)return;
    db.registration.categories.splice(index,1);regTouched.clear();saveDb();rerenderReg();
  }
  function applyRegistration() {
    const r=db.registration, d=r.data, p=db.profile, today=new Date().toISOString().slice(0,10);
    const name=pre=>`${d[`${pre}prefix`]}${d[`${pre}firstTh`]} ${d[`${pre}lastTh`]}`;
    const role=pre=>d[`${pre}position`]==="อื่นๆ"?d[`${pre}positionOther`]:d[`${pre}position`];
    const address=[d.a_line1,d.a_line2,d.a_sub,d.a_district,d.a_province,d.a_postal,d.a_country].filter(Boolean).join(" ");
    p.company=`${d.companyPrefix} ${d.companyName}`.trim();
    p.registration=d.regNo;p.contact=name("o_");p.email=d.email;p.phone=d.phone;p.site=address;
    p.contacts=[
      {type:"Company owner",name:name("o_"),role:role("o_"),email:d.o_email,phone:d.o_phone,status:"Pending review"},
      {type:"Contact person",name:name("c_"),role:role("c_"),email:d.c_email,phone:d.c_phone,status:"Pending review"}
    ];
    p.factories=[{name:d.branchType==="สาขา"?d.branchName:p.company,location:address,type:"สถานประกอบการ",status:"Pending review"}];
    p.categories=[...new Set(r.categories.map(c=>c.main))];
    p.products=r.categories.map(c=>({name:`${c.main} / ${c.sub}`,code:c.material,status:"Pending review"}));
    regDocFields(d).filter(f=>f.t==="file"&&(!f.show||f.show(d))).forEach(f=>pushDocument(d[f.k]||[],{name:f.label,type:f.docType,group:"Registration"}));
    r.status="Submitted";r.submittedAt=new Date().toISOString();
    db.onboarding.selfRegistration={status:"Submitted",updated:today};
  }
  function regSubmit() {
    const r=db.registration;
    if(r.status==="Submitted")return;
    for(const step of [1,2,3]) {
      if(regStepErrors(step).length) { r.step=step;regShowAll=true;saveDb();rerenderReg();focusFirstRegError();return toast("กรุณาตรวจสอบข้อมูลที่ยังไม่ครบถ้วนก่อนส่ง"); }
    }
    if(!window.confirm("ยืนยันการส่งข้อมูลการลงทะเบียนผู้ขาย?"))return;
    applyRegistration();saveDb();regShowAll=false;regTouched.clear();
    page="Supplier Onboarding";render();toast("ลงทะเบียนสำเร็จ ระบบสร้างโปรไฟล์ผู้ขายแล้ว งานอื่นพร้อมใช้งาน");
  }
  function regStart() {
    if(!document.getElementById("reg-coc")?.checked)return toast("กรุณายอมรับ CoC และ T&D");
    db.registration.cocAccepted=true;db.registration.cocAt=new Date().toISOString();saveDb();rerenderReg();
  }
  function render() {
    if(!registrationDone()&&!["Supplier Onboarding","Supplier Registration","Help & Support"].includes(page))page="Supplier Onboarding";
    if(registrationDone()&&page==="Supplier Registration")page="Supplier Onboarding";
    const root = document.getElementById("app");
    root.innerHTML = `<div class="shell">
      <div class="mobile-overlay" onclick="window.portalMenu(false)"></div>
      <aside class="sidebar">
        <div class="brand"><div class="brand-mark">N</div><div class="brand-name">northstar<small>Supplier portal</small></div></div>
        <div class="company-mini"><span>SUPPLIER ACCOUNT</span><strong>${escapeHtml(db.profile.company)}</strong></div>
        <div class="nav-label">Workspace</div><nav class="nav-list" aria-label="Main navigation">
          ${[["Supplier Onboarding","✓"],["Sample Request","◫"],["Company Profile","⌂"],["Notifications","♧"]].map(([name,icon])=>{const locked=!registrationDone()&&name!=="Supplier Onboarding";return `<button class="nav-item ${page===name||(["Onboarding Task","Supplier Registration"].includes(page)&&name==="Supplier Onboarding")?"active":""}" ${locked?'disabled title="ต้องลงทะเบียนผู้ขายให้สำเร็จก่อน"':`onclick="window.portalNav('${name}')"`}><span class="nav-icon">${icon}</span>${name}${name==="Sample Request"&&db.requests.some(r=>r.status==="Action Required")?'<span class="nav-count">1</span>':""}</button>`;}).join("")}
        </nav>
        <div class="sidebar-bottom">
          <div class="help-card"><strong>Need a hand?</strong><p>Our supplier support team is here to help with your onboarding.</p><button onclick="window.portalNav('Help & Support')">Contact support →</button></div>
            <button class="text-link" style="padding:0 7px 8px" onclick="window.portalReset()">Reset fictional demo data</button>
          <div class="user-mini"><div class="avatar">MC</div><div><strong>${escapeHtml(db.profile.contact)}</strong><small>Supplier administrator</small></div></div>
        </div>
      </aside>
      <main class="main">
        <header class="topbar"><button class="mobile-menu" aria-label="Open navigation" onclick="window.portalMenu(true)">☰</button><div class="breadcrumbs">Supplier Portal <span> / </span> <strong>${escapeHtml(page)}</strong></div><div class="top-actions"><button class="icon-button" aria-label="Notifications" onclick="window.portalNav('Notifications')">♧<span class="notification-dot"></span></button><button class="profile-button" onclick="window.portalNav('Company Profile')"><span class="avatar">MC</span><span>${escapeHtml(db.profile.contact)}</span>⌄</button></div></header>
        <div class="content" id="content"></div>
      </main><div class="toast-region" aria-live="polite"></div></div>`;
    const content = document.getElementById("content");
    const routes = {"Supplier Registration":renderRegistration,"Supplier Onboarding":renderOnboarding,"Onboarding Task":renderOnboardingTask,"Sample Request":renderList,"Create Sample Request":renderWizard,"Sample Request Details":renderDetails,"Respond to Feedback":renderResponse,"Company Profile":renderProfile,Notifications:renderNotifications,"Help & Support":renderHelp};
    (routes[page] || renderOnboarding)(content);
  }
  function heading(title, desc, action="") { return `<div class="page-heading"><div><h1>${title}</h1><p>${desc}</p></div>${action}</div>`; }
  function metric(label,value,icon,note="") { return `<div class="card metric"><div class="metric-top">${label}<span class="metric-icon">${icon}</span></div><strong>${value}</strong><small>${note}</small></div>`; }
  function regTaskCard() {
    const r=db.registration, started=r.cocAccepted, pct=started?Math.round((r.step-1)/4*100):0;
    return `<article class="task-card"><div class="task-icon">✎</div><div class="task-content"><span class="eyebrow">Registration · Required first</span><h3>Supplier Registration</h3><p>Register your company information to create your supplier profile. All other tasks and menus unlock after you submit.</p><div class="task-progress"><span>${started?`Step ${r.step} of 4`:"Not started"}</span><div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div></div></div><button class="button primary" onclick="window.portalNav('Supplier Registration')">${started?"Continue":"Start registration"} →</button></article>`;
  }
  function renderOnboarding(el) {
    const stages=onboardingStages();
    el.innerHTML=heading("Supplier Onboarding","Follow your supplier registration, task completion, and evaluation progress.")+
      (registrationDone()?"":`<div class="notice warning">Start with <strong>Supplier Registration</strong> in Your tasks. The other tasks and menus unlock after your registration is submitted.</div>`)+
      `<div class="onboarding-layout"><section class="card section-card"><div class="section-title"><h2>Onboarding stages</h2>${badge("In Progress")}</div><div class="onboarding-stepper">${stages.map((s,i)=>`<div class="onboarding-stage ${s.status==="In Progress"?"stage-active":""}"><span class="stage-marker ${s.status==="Completed"?"stage-done":""}">${s.status==="Completed"?"✓":i+1}</span><div class="stage-copy"><strong>${escapeHtml(s.title)}</strong><small>${escapeHtml(s.description)}</small></div><span class="stage-state">${badge(s.status)}</span></div>`).join("")}</div></section>
      <section class="card section-card task-section"><div class="section-title"><div><h2>Your tasks</h2><small>Activities required during supplier pre-screening.</small></div></div>${registrationDone()?"":regTaskCard()}${onboardingTasks.map(task=>{
        const done=taskCount(task.id),isRisk=task.id==="sustainability-risk",blockedMessage=taskBlockedMessage(task.id),disabled=Boolean(blockedMessage);
        const blockedStatus=!registrationDone()?"Pending registration":isRisk?(riskAssessmentState()==="pending"?"Pending questionnaire":"Not required"):"Pending learning";
        return `<article class="task-card ${disabled?"task-disabled":""}"><div class="task-icon">${task.icon}</div><div class="task-content"><span class="eyebrow">${task.category}</span><h3>${escapeHtml(task.title)}</h3><p>${escapeHtml(disabled?blockedMessage:isRisk?"Risk identified in your questionnaire. Complete this additional assessment.":task.description)}</p>${disabled?badge(blockedStatus):`<div class="task-progress"><span>Completed ${done}/${task.required}</span><div class="progress-track"><div class="progress-fill" style="width:${done/task.required*100}%"></div></div></div>`}</div><button class="button ${disabled||done>=task.required?"":"primary"}" onclick="window.portalTask('${task.id}')" ${disabled?"disabled":""}>${disabled?blockedStatus==="Not required"?"Not required":"Unavailable":done>=task.required?"Review":"View details"}${disabled?"":" →"}</button></article>`;
      }).join("")}</section></div>
      <div class="notice" style="margin-top:15px">Sample approval is a category-dependent gate only. It does not automatically mean your supplier qualification is complete. Current sample gate: ${badge(onboardingGate())}</div>`;
  }
  const riskTopics=[
    ["climate","Climate change and greenhouse gas emissions"],
    ["sourcing","Responsible sourcing"],
    ["workplace","Occupational health and safety"],
    ["labor","Human rights and labor practices"],
    ["food-safety","Food quality and safety"],
    ["ethics","Business ethics and conduct"]
  ];
  function questionnaireSystemAnswer(key) {
    if(key==="policy-accepted")return taskCount("sourcing-policy")===3?"Yes":"No";
    if(key==="self-assessment")return riskAssessmentState()==="not-required"||taskCount("sustainability-risk")>=1?"Yes":"No";
    return "";
  }
  function questionnaireComplete() {
    return supplierQuestionnaire.every(([key,,type,limit])=>{
      if(type==="system")return true;
      const response=db.onboarding.questionnaireAnswers[key]||{};
      if(!["Yes","No"].includes(response.answer))return false;
      if(response.answer==="No")return true;
      const maxFiles=limit||1;
      return (!supplierQuestionnaire.find(([questionKey])=>questionKey===key)?.[2]||Boolean(response.documentType))&&Array.isArray(response.files)&&response.files.length>0&&response.files.length<=maxFiles;
    });
  }
  function renderSupplierQuestionnaire(done) {
    const answers=db.onboarding.questionnaireAnswers;
    const userQuestions=supplierQuestionnaire.filter(([, ,type])=>type!=="system");
    const answered=userQuestions.filter(([key])=>["Yes","No"].includes(answers[key]?.answer)).length;
    const locked=done>=1;
    const fields=supplierQuestionnaire.map(([key,question,documents,maxFiles])=>{
      if(documents==="system") {
        const value=questionnaireSystemAnswer(key);
        return `<article class="questionnaire-item questionnaire-generated"><strong>${escapeHtml(question)}</strong><span>${badge(value||"Pending")}</span><small>System generated · not editable</small></article>`;
      }
      const response=answers[key]||{answer:"",documentType:"",files:[],note:""};
      const conditional=response.answer==="Yes";
      const limit=maxFiles||1;
      const documentField=Array.isArray(documents)?`<label class="form-field">Document type <select class="field-control" onchange="window.portalQuestionnaireDocument('${key}',this.value)" ${locked?"disabled":""}><option value="">Select a document type</option>${documents.map(option=>`<option value="${escapeHtml(option)}" ${response.documentType===option?"selected":""}>${escapeHtml(option)}</option>`).join("")}</select></label>`:"";
      const uploadField=conditional?`<label class="form-field">Supporting document <span class="required">*</span><span class="helper">PDF only · maximum 5 MB per file · up to ${limit} file${limit===1?"":"s"}</span><input type="file" accept=".pdf,application/pdf" ${limit>1?"multiple":""} onchange="window.portalQuestionnaireFiles('${key}',this.files)" ${locked?"disabled":""}></label><div class="file-list">${(response.files||[]).map((file,index)=>`<div class="file-row"><span>${escapeHtml(file.name)} <small>(${(file.size/1024).toFixed(0)} KB)</small></span>${expiryField(`window.portalQuestionnaireExpiry('${key}',${index},this.value)`,file.expiry,"Expiry date",locked)}<button type="button" aria-label="Remove ${escapeHtml(file.name)}" onclick="window.portalQuestionnaireRemoveFile('${key}',${index})" ${locked?"disabled":""}>Remove</button></div>`).join("")}</div>`:"";
      const noteField=`<label class="form-field questionnaire-note">หมายเหตุ <textarea class="field-control" maxlength="5000" rows="3" oninput="window.portalQuestionnaireNote('${key}',this.value)" ${locked?"disabled":""}>${escapeHtml(response.note||"")}</textarea><small>${(response.note||"").length}/5000 characters</small></label>`;
      return `<article class="questionnaire-item"><div class="questionnaire-question"><strong>${escapeHtml(question)}</strong><span class="required">*</span></div><div class="questionnaire-answer" role="radiogroup" aria-label="${escapeHtml(question)}">${["Yes","No"].map(value=>`<label class="questionnaire-choice"><input type="radio" name="onboarding-${key}" value="${value}" ${response.answer===value?"checked":""} onchange="window.portalQuestionnaireAnswer('${key}',this.value)" ${locked?"disabled":""}><span>${value}</span></label>`).join("")}</div>${conditional?`<div class="questionnaire-conditional">${documentField}${uploadField}</div>`:""}${noteField}</article>`;
    }).join("");
    return `<div class="notice">Answer Yes or No. When Yes is selected, provide the required PDF evidence. Files are represented by metadata only in this browser and are not uploaded.</div><div class="questionnaire-list">${fields}</div><div class="wizard-footer"><small class="mock-note" data-questionnaire-count>${answered} of ${userQuestions.length} supplier responses completed · Conditional documents: ${questionnaireComplete()?"complete":"incomplete"}</small><button class="button primary" data-questionnaire-submit onclick="window.portalSubmitQuestionnaire()" ${!questionnaireComplete()||locked?"disabled":""}>Submit questionnaire</button></div>`;
  }
  function renderOnboardingTask(el) {
    const task=onboardingTasks.find(item=>item.id===currentTask);
    if(!task) { page="Supplier Onboarding"; return renderOnboarding(el); }
    if(taskBlockedMessage(task.id)) { page="Supplier Onboarding"; return renderOnboarding(el); }
    const done=taskCount(task.id);
    const doneBanner=done>=task.required?`<div class="result-banner"><strong>Activity completed</strong><br>Your progress is saved in this browser. This prototype does not transmit answers to an internal system.</div>`:"";
    let body="";
    if(task.id==="sourcing-policy") {
      body=renderLearningFlow();
    } else if(task.id==="sustainability-risk") {
      body=`<div class="notice">Demo only: select a risk level for each topic. The supplied requirements call for a system-calculated Inherent Risk result and topic quizzes, but no upstream scoring rules or quiz content were provided.</div><div class="card table-card risk-table"><div class="risk-header"><span>Risk topic</span><span>Risk level · demo</span></div>${riskTopics.map(([key,label])=>`<div class="risk-row"><strong>${label}</strong><select class="field-control" aria-label="${label}" onchange="window.portalRiskAnswer('${key}',this.value)"><option value="">Select a level</option>${["Low","Medium","High"].map(v=>`<option ${db.onboarding.riskAnswers[key]===v?"selected":""}>${v}</option>`).join("")}</select></div>`).join("")}</div><div class="wizard-footer"><small class="mock-note" data-risk-count>${Object.keys(db.onboarding.riskAnswers).filter(k=>db.onboarding.riskAnswers[k]).length} of ${riskTopics.length} topics assessed</small><button class="button primary" data-risk-submit onclick="window.portalSubmitRisk()" ${Object.keys(db.onboarding.riskAnswers).filter(k=>db.onboarding.riskAnswers[k]).length<riskTopics.length?"disabled":""}>Save assessment</button></div>`;
    } else {
      body=renderSupplierQuestionnaire(done);
    }
    el.innerHTML=`<div class="breadcrumbs" style="margin-bottom:11px"><button class="text-link" onclick="window.portalNav('Supplier Onboarding')">Supplier Onboarding</button> / <strong>${escapeHtml(task.category)}</strong></div>${heading(task.title,task.description)}<div class="task-detail-layout"><div class="card section-card task-detail-card"><div class="section-title"><div><div class="eyebrow">${escapeHtml(task.category)}</div><h2>${escapeHtml(task.title)}</h2></div>${badge(done>=task.required?"Completed":"In Progress")}</div><div class="task-progress detail-progress"><span>Progress · ${done}/${task.required}</span><div class="progress-track"><div class="progress-fill" style="width:${done/task.required*100}%"></div></div></div>${doneBanner}${body}</div></div>`;
  }
  function renderLearningFlow() {
    const flow=db.onboarding.learningFlow, result=flow.result, locked=!flow.consentAccepted;
    const completed=[flow.videoCompleted,flow.consentAccepted,Boolean(result?.passed)];
    const availableStep=flow.consentAccepted?2:flow.videoCompleted?1:0;
    const activeStep=Number.isInteger(flow.step)?Math.max(0,Math.min(flow.step,availableStep)):availableStep;
    flow.step=activeStep;
    const titles=["E-learning video","Consent / Accept document","Questionnaire"];
    const stepHeading=(number,title,complete,available)=>`<div class="learning-module-heading"><div><span class="eyebrow">STEP ${number}/3</span><h3 id="learning-step-title" tabindex="-1">${title}</h3></div>${badge(complete?"Completed":available?"In Progress":"Not Started")}</div>`;
    const policy=learningLessons.map(lesson=>`<h4>${escapeHtml(lesson.title)}</h4><p class="lesson-summary">${escapeHtml(lesson.summary)}</p><ul class="lesson-points">${lesson.points.map(point=>`<li>${escapeHtml(point)}</li>`).join("")}</ul>`).join("");
    const questions=learningQuestions.map((question,index)=>`<fieldset class="quiz-question" ${locked?"disabled":""}><legend>${index+1}. ${escapeHtml(question.text)}</legend><div class="quiz-options">${question.options.map((option,optionIndex)=>`<label class="quiz-option"><input type="radio" name="policy-q${index}" value="${optionIndex}" ${flow.answers[index]===optionIndex?"checked":""} onchange="window.portalLearningAnswer(${index},${optionIndex})"><span>${escapeHtml(option)}</span></label>`).join("")}</div></fieldset>`).join("");
    const total=learningQuestions.length, passMark=Math.ceil(total*0.8), allAnswered=learningQuestions.every((question,index)=>Number.isInteger(flow.answers[index]));
    const summary=result?`<div class="quiz-summary ${result.passed?"passed":"needs-review"}"><div class="quiz-score"><strong>${result.score}/${total}</strong><span>${Math.round(result.score/total*100)}%</span></div><div class="quiz-summary-copy"><h4>${result.passed?"Questionnaire passed":"Not passed"}</h4><p>Pass mark: ${passMark}/${total} (80%)</p></div></div><div class="quiz-breakdown">${learningQuestions.map((question,index)=>{const ok=result.answers[index]===question.answer;return `<div class="quiz-breakdown-row"><span>${index+1}. ${escapeHtml(question.text)}</span><strong class="${ok?"correct-answer":"incorrect-answer"}">${ok?"Correct":"Incorrect"}</strong></div>`;}).join("")}</div>`:"";
    const sections=[
      `<article class="card learning-module">${stepHeading(1,"E-learning video",flow.videoCompleted,true)}<div class="learning-video-placeholder">${learningVideoId?`<iframe class="learning-video-embed" title="Sustainable Sourcing Policy and Supplier Guiding Principles video" src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(learningVideoId)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>`:`<span aria-hidden="true">▶</span><strong>Sustainable Sourcing Policy and Supplier Guiding Principles</strong><p>Add the course YouTube video ID in app.js to enable the in-page preview.</p>`}</div><button class="button primary" onclick="window.portalLearningVideo()" ${flow.videoCompleted?"disabled":""}>${flow.videoCompleted?"Video demo completed":"Mark video complete (demo)"}</button></article>`,
      `<article class="card learning-module">${stepHeading(2,"Consent / Accept document",flow.consentAccepted,flow.videoCompleted)}<h4>Sustainable Sourcing Policy and Supplier Guiding Principles</h4><div class="policy-document policy-preview" role="region" aria-label="Sustainable sourcing policy preview">${policy}<p class="mock-note">Original prototype policy summary, not an official policy or legal agreement.</p></div><label class="commitment-row"><input id="policy-consent" type="checkbox" ${flow.consentAccepted?"checked":""} ${!flow.videoCompleted||flow.consentAccepted?"disabled":""} onchange="window.portalConsentCheck(this.checked)"><span>I have read and accept the Sustainable Sourcing Policy and Supplier Guiding Principles (mock version 1.0).</span></label><button class="button primary" data-policy-accept onclick="window.portalLearningConsent()" disabled>${flow.consentAccepted?"Document accepted":"Accept document"}</button>${flow.consentAccepted?`<p class="mock-note">Accepted on ${fmtDate(flow.acceptedAt)} · Mock version 1.0</p>`:""}</article>`,
      `<article class="card learning-module">${stepHeading(3,"Questionnaire",Boolean(result?.passed),!locked)}${result?summary:`<p class="lesson-summary">Questions from Sustainable Sourcing Policy and Supplier Guiding Principles.</p><div class="quiz-heading"><h4>Knowledge check · ${total} questions</h4><span>Pass mark: ${passMark}/${total} (80%)</span></div>${questions}<button class="button primary" data-quiz-submit onclick="window.portalSubmitLesson()" ${locked||!allAnswered?"disabled":""}>Submit answers</button>`}${result&&!result.passed?`<button class="button primary" onclick="window.portalRetryLesson()">Try again</button>`:""}</article>`
    ];
    return `<div class="notice">Complete one activity at a time, then select Next. Progress and answers are saved only in this browser for this fictional course.</div>
      <nav class="learning-stepper" aria-label="Learning steps">${titles.map((title,index)=>`<button class="learning-step ${index===activeStep?"selected":""}" ${index>availableStep?"disabled":""} ${index===activeStep?'aria-current="step"':""} onclick="window.portalLearningStep(${index})"><span class="learning-step-number">${completed[index]?"✓":index+1}</span><span>${title}</span></button>`).join("")}</nav>
      <div class="learning-modules">${sections[activeStep]}</div>
      <div class="wizard-footer learning-navigation"><button class="button" onclick="window.portalLearningStep(${activeStep-1})" ${activeStep===0?"disabled":""}>Back</button><span class="mock-note">Step ${activeStep+1} of 3</span>${activeStep<2?`<button class="button primary" onclick="window.portalLearningStep(${activeStep+1})" ${completed[activeStep]?"":"disabled"}>Next →</button>`:`<button class="button primary" onclick="window.portalNav('Supplier Onboarding')" ${result?.passed?"":"disabled"}>Finish</button>`}</div>
      `;
  }
  function setLearningStep(step) {
    const flow=db.onboarding.learningFlow, availableStep=flow.consentAccepted?2:flow.videoCompleted?1:0;
    if(!Number.isInteger(step)||step<0||step>availableStep)return toast("Complete the current activity before continuing.");
    flow.step=step;saveDb();render();
    const heading=document.getElementById("learning-step-title");
    heading?.focus({preventScroll:true});
    heading?.scrollIntoView({block:"start"});
  }
  function completeLearningVideo() {
    const flow=db.onboarding.learningFlow;
    if(flow.videoCompleted)return;
    flow.videoCompleted=true;db.onboarding.tasks["sourcing-policy"]=1;saveDb();render();toast("Demo video completed. Progress: 1/3.");
  }
  function acceptLearningConsent() {
    const flow=db.onboarding.learningFlow;
    if(!flow.videoCompleted)return toast("Complete the e-learning video first.");
    if(flow.consentAccepted)return;
    if(!document.getElementById("policy-consent")?.checked)return toast("Confirm that you have read and accept the document.");
    flow.consentAccepted=true;flow.acceptedAt=new Date().toISOString();flow.policyVersion="1.0";
    db.onboarding.tasks["sourcing-policy"]=2;saveDb();render();toast("Document accepted. Progress: 2/3.");
  }
  function setLearningAnswer(questionIndex,optionIndex) {
    const flow=db.onboarding.learningFlow, question=learningQuestions[questionIndex];
    if(!flow.consentAccepted||flow.result)return;
    if(!Number.isInteger(questionIndex)||!question||!Number.isInteger(optionIndex)||optionIndex<0||optionIndex>=question.options.length)return;
    flow.answers[questionIndex]=optionIndex;saveDb();
    const submit=document.querySelector("[data-quiz-submit]");
    if(submit)submit.disabled=!learningQuestions.every((item,index)=>Number.isInteger(flow.answers[index]));
  }
  function submitLesson() {
    const flow=db.onboarding.learningFlow;
    if(!flow.videoCompleted||!flow.consentAccepted||flow.result)return;
    if(learningQuestions.some((question,index)=>!Number.isInteger(flow.answers[index])||!question.options[flow.answers[index]]))return;
    const score=learningQuestions.reduce((total,question,index)=>total+(flow.answers[index]===question.answer?1:0),0);
    flow.quizVersion=2;
    flow.result={score,passed:score>=Math.ceil(learningQuestions.length*0.8),answers:{...flow.answers}};
    db.onboarding.tasks["sourcing-policy"]=flow.result.passed?3:2;saveDb();render();
  }
  function retryLesson() {
    const flow=db.onboarding.learningFlow;
    if(!flow.result||flow.result.passed)return;
    flow.result=null;flow.answers={};saveDb();render();
  }
  function setRiskAnswer(key,value) {
    if(riskAssessmentState()!=="required")return toast(riskAssessmentMessage());
    if(!riskTopics.some(([topic])=>topic===key)||!["Low","Medium","High",""].includes(value))return;
    db.onboarding.riskAnswers[key]=value; saveDb();
    const count=Object.keys(db.onboarding.riskAnswers).filter(k=>db.onboarding.riskAnswers[k]).length;
    const counter=document.querySelector("[data-risk-count]"), submit=document.querySelector("[data-risk-submit]");
    if(counter)counter.textContent=`${count} of ${riskTopics.length} topics assessed`;
    if(submit)submit.disabled=count<riskTopics.length;
  }
  function submitRisk() {
    if(riskAssessmentState()!=="required")return toast(riskAssessmentMessage());
    if(riskTopics.some(([key])=>!["Low","Medium","High"].includes(db.onboarding.riskAnswers[key])))return toast("Assess every topic before saving.");
    db.onboarding.tasks["sustainability-risk"]=1; saveDb(); render(); toast("Mock risk assessment saved.");
  }
  function setQuestionnaireAnswer(key,value) {
    if(!questionnaireAvailable())return toast(taskBlockedMessage("supplier-questionnaire"));
    if(taskCount("supplier-questionnaire"))return toast("The questionnaire has already been submitted.");
    const question=supplierQuestionnaire.find(([questionKey])=>questionKey===key);
    if(!question||question[2]==="system"||!["Yes","No"].includes(value))return;
    const response=db.onboarding.questionnaireAnswers[key]||{documentType:"",files:[],note:""};
    response.answer=value;
    if(value==="No") { response.documentType="";response.files=[]; }
    db.onboarding.questionnaireAnswers[key]=response;saveDb();render();
  }
  function setQuestionnaireDocument(key,value) {
    if(taskCount("supplier-questionnaire"))return;
    const question=supplierQuestionnaire.find(([questionKey])=>questionKey===key);
    if(!question||!Array.isArray(question[2])||!question[2].includes(value))return;
    const response=db.onboarding.questionnaireAnswers[key];
    if(!response||response.answer!=="Yes")return;
    response.documentType=value;saveDb();render();
  }
  function setQuestionnaireFiles(key,files) {
    if(taskCount("supplier-questionnaire"))return;
    const question=supplierQuestionnaire.find(([questionKey])=>questionKey===key);
    const response=db.onboarding.questionnaireAnswers[key];
    if(!question||!response||response.answer!=="Yes")return;
    const limit=question[3]||1, selected=Array.from(files||[]), accepted=[];
    for(const file of selected) {
      const isPdf=file.type==="application/pdf"||file.name.toLowerCase().endsWith(".pdf");
      if(!isPdf) { toast(`${file.name} is not a PDF file.`);continue; }
      if(file.size>5*1024*1024) { toast(`${file.name} exceeds the 5 MB limit.`);continue; }
      accepted.push(trackFile(file,"application/pdf"));
    }
    const remaining=limit-(response.files||[]).length;
    if(accepted.length>remaining)toast(`This question allows up to ${limit} file${limit===1?"":"s"}.`);
    response.files=[...(response.files||[]),...accepted.slice(0,Math.max(0,remaining))];saveDb();render();
  }
  function setQuestionnaireExpiry(key,index,value) {
    const file=db.onboarding.questionnaireAnswers[key]?.files?.[index];
    if(!file||taskCount("supplier-questionnaire"))return;
    if(!expiryAccepted(value,"Expiry date cannot be in the past."))return render();
    file.expiry=value;saveDb();
  }
  function removeQuestionnaireFile(key,index) {
    const response=db.onboarding.questionnaireAnswers[key];
    if(!response||taskCount("supplier-questionnaire"))return;
    response.files.splice(index,1);saveDb();render();
  }
  function setQuestionnaireNote(key,value) {
    if(taskCount("supplier-questionnaire"))return;
    const response=db.onboarding.questionnaireAnswers[key];
    if(!response||!["Yes","No"].includes(response.answer))return;
    response.note=String(value).slice(0,5000);saveDb();
  }
  function submitQuestionnaire() {
    if(!questionnaireAvailable())return toast(taskBlockedMessage("supplier-questionnaire"));
    if(taskCount("supplier-questionnaire"))return toast("The questionnaire has already been submitted.");
    if(!questionnaireComplete())return toast("Answer every required question and attach the conditional PDF documents before submitting.");
    supplierQuestionnaire.forEach(([key,question])=>{const response=db.onboarding.questionnaireAnswers[key];if(response?.answer==="Yes")pushDocument(response.files||[],{name:response.documentType||question.replace(/^\d+\.\s*/,""),type:"Questionnaire Evidence",group:"Pre-Screening"});});
    db.onboarding.tasks["supplier-questionnaire"]=1; saveDb(); render(); toast(riskAssessmentState()==="required"?"Questionnaire submitted. Risk identified: complete the Sustainability Risk Assessment.":"Questionnaire submitted. No additional risk assessment is required.");
  }
  function filteredRequests() {
    const q=filters.search.trim().toLowerCase();
    const today=new Date(), cutoff=filters.date==="Last 7 days"?new Date(today.getFullYear(),today.getMonth(),today.getDate()-7):filters.date==="Last 30 days"?new Date(today.getFullYear(),today.getMonth(),today.getDate()-30):filters.date==="This year"?new Date(today.getFullYear(),0,1):null;
    return db.requests.filter(r=>(!q||[r.id,r.name,r.code].some(v=>String(v||"").toLowerCase().includes(q)))&&(filters.status==="All statuses"||r.status===filters.status)&&(filters.category==="All categories"||r.category===filters.category)&&(filters.type==="All types"||r.type===filters.type)&&(!cutoff||new Date(`${r.created}T12:00:00`)>=cutoff)).sort((a,b)=>{let av=a[sort.key]||"",bv=b[sort.key]||"";return (av>bv?1:av<bv?-1:0)*(sort.direction==="asc"?1:-1);});
  }
  function renderList(el) {
    const rows=filteredRequests();
    const awaiting=db.requests.filter(r=>["Submitted","Under Review","Awaiting Sample","Sample Received","Under Evaluation"].includes(r.status)).length;
    const actionable=db.requests.filter(r=>["Action Required","Resubmission Required"].includes(r.status)).length;
    const completed=db.requests.filter(r=>["Approved","Rejected"].includes(r.status)).length;
    const action=r=>r.status==="Draft"?"Continue Editing":r.status==="Action Required"?"Respond":r.status==="Resubmission Required"?"Resubmit":["Approved","Rejected"].includes(r.status)?"View Result":"View Details";
    el.innerHTML=heading("Sample Request","Create and track product sample submissions for supplier pre-screening.",'<button class="button primary" onclick="window.portalNewRequest()">＋ New Sample Request</button>')+
      `<div class="summary-grid">${metric("Total requests",db.requests.length,"◫","All saved requests")}${metric("Awaiting review",awaiting,"◷","In review or awaiting sample")}${metric("Action required",actionable,"!","Needs your response")}${metric("Completed",completed,"✓","Approved or rejected result")}</div>
      <div class="toolbar"><div class="search-wrap"><span>⌕</span><input class="field-control" placeholder="Search request ID, product or code" value="${escapeHtml(filters.search)}" oninput="window.portalFilter('search',this.value)" aria-label="Search sample requests"></div>
      <select class="field-control" onchange="window.portalFilter('status',this.value)" aria-label="Filter by status"><option>All statuses</option>${statuses.map(s=>`<option ${filters.status===s?"selected":""}>${s}</option>`).join("")}<option ${filters.status==="Resubmission Required"?"selected":""}>Resubmission Required</option></select>
      <select class="field-control" onchange="window.portalFilter('category',this.value)" aria-label="Filter by category"><option>All categories</option>${Object.keys(CATEGORIES).map(c=>`<option ${filters.category===c?"selected":""}>${c}</option>`).join("")}</select>
      <select class="field-control" onchange="window.portalFilter('type',this.value)" aria-label="Filter by sample type"><option>All types</option>${["Physical","Digital","Both"].map(c=>`<option ${filters.type===c?"selected":""}>${c}</option>`).join("")}</select>
      <select class="field-control" onchange="window.portalFilter('date',this.value)" aria-label="Filter by submission date">${["Any date","Last 7 days","Last 30 days","This year"].map(c=>`<option ${filters.date===c?"selected":""}>${c}</option>`).join("")}</select></div>
      <div class="card table-card"><div class="table-wrap"><table><thead><tr><th><button class="sort-button" onclick="window.portalSort('id')">Request ID ↕</button></th><th>Product / Sample</th><th>Product Category</th><th>Sample Type</th><th><button class="sort-button" onclick="window.portalSort('created')">Submitted Date ↕</button></th><th>Status</th><th><button class="sort-button" onclick="window.portalSort('updated')">Last Updated ↕</button></th><th>Actions</th></tr></thead><tbody>${rows.map(r=>`<tr><td><strong>${escapeHtml(r.id)}</strong><small>Gate: ${gateOf(r)}</small></td><td><strong>${escapeHtml(r.name)}</strong><small>${escapeHtml(r.code||"No product code")}</small></td><td>${escapeHtml(r.category)}</td><td>${escapeHtml(r.type)}</td><td>${fmtDate(r.created)}</td><td>${badge(r.status)}</td><td>${fmtDate(r.updated)}</td><td><button class="text-link" onclick="window.portalRequestAction('${r.id}')">${action(r)} →</button></td></tr>`).join("")}</tbody></table>
      ${rows.length===0?`<div class="table-empty"><div class="empty-icon">◫</div><h3>${db.requests.length?"No matching sample requests":"No sample requests yet"}</h3><p>${db.requests.length?"Try changing or clearing your filters.":"Start a request to submit a physical sample, product specification, or both."}</p>${db.requests.length?'<button class="button" onclick="window.portalClearFilters()">Clear filters</button>':'<button class="button primary" onclick="window.portalNewRequest()">Create Sample Request</button>'}</div>`:""}</div><div class="table-footer"><span>Showing ${rows.length} of ${db.requests.length} requests</span><span>Mock supplier data · saved in this browser</span></div></div>`;
  }
  function startNew() {
    form={id:"", supplier:db.profile.company, category:"", name:"", code:"", type:"", quantity:"", unit:"pieces", description:"", notes:"", specification:"", url:"", address:"", recipient:"", contact:"", deliveryDate:"", instructions:"", files:[], declaration:false};
    wizardStep=0; page="Create Sample Request"; render();
  }
  function editDraft(id) {
    const r=db.requests.find(x=>x.id===id);
    if(!r||r.status!=="Draft") return toast("This request is no longer editable.");
    form={...r,supplier:db.profile.company,notes:r.notes||"",specification:r.specification||"",url:r.url||"",contact:r.contact||"",declaration:false};
    wizardStep=0; page="Create Sample Request"; render();
  }
  const wizardNames=["Request & Product Information","Sample Details","Delivery & Documents","Review & Submit"];
  function field(label,key,value,opts={}) {
    const required=opts.required?'<span class="required"> *</span>':"";
    const hint=opts.hint?`<small>${opts.hint}</small>`:"";
    const error=`<span class="form-error">${opts.error||"Please complete this field."}</span>`;
    const cls=`form-field ${opts.full?"full":""} ${opts.className||""}`;
    const safe=escapeHtml(value||"");
    if(opts.select) return `<div class="${cls}" data-field="${key}"><label for="${key}">${label}${required}</label><select class="field-control" id="${key}" onchange="window.portalForm('${key}',this.value)"><option value="">Choose a category</option>${opts.select.map(c=>`<option ${value===c?"selected":""}>${escapeHtml(c)}</option>`).join("")}</select>${hint}${error}</div>`;
    if(opts.textarea) return `<div class="${cls}" data-field="${key}"><label for="${key}">${label}${required}</label><textarea class="field-control" id="${key}" placeholder="${opts.placeholder||""}" oninput="window.portalForm('${key}',this.value)">${safe}</textarea>${hint}${error}</div>`;
    return `<div class="${cls}" data-field="${key}"><label for="${key}">${label}${required}</label><input class="field-control" id="${key}" type="${opts.type||"text"}" value="${safe}" ${opts.readonly?"readonly":""} placeholder="${opts.placeholder||""}" ${opts.min?`min="${opts.min}"`:""} oninput="window.portalForm('${key}',this.value)">${hint}${error}</div>`;
  }
  function uploadField() {
    const files=form.files||[];
    return `<div class="form-field full"><label>Attach supporting documents</label><div class="upload-box"><div class="helper">PDF, DOCX, JPG or PNG · max 10 MB per file. Attachments are simulated and remain in this browser only.</div><input type="file" multiple accept=".pdf,.docx,.jpg,.jpeg,.png" onchange="window.portalFiles(this.files)"><div class="file-list">${files.map((f,i)=>`<div class="file-row"><span>▤ &nbsp;${escapeHtml(f.name)} <small>(${(f.size/1024).toFixed(0)} KB)</small></span>${expiryField(`window.portalFileExpiry(${i},this.value)`,f.expiry)}<button type="button" aria-label="Remove ${escapeHtml(f.name)}" onclick="window.portalRemoveFile(${i})">Remove</button></div>`).join("")}</div></div></div>`;
  }
  function renderWizard(el) {
    if(!form) return renderList(el);
    const isEdit=Boolean(form.id);
    let body="";
    if(wizardStep===0) {
      body=`<div class="form-grid">${field("Supplier company","supplier",form.supplier,{readonly:true,hint:"Linked to your signed-in supplier account."})}${field("Product category","category",form.category,{required:true,select:Object.keys(CATEGORIES),error:"Select the product category."})}${field("Product name","name",form.name,{required:true,error:"Enter the product or sample name."})}${field("Product code / specification reference","code",form.code,{required:true,error:"Enter a product code or specification reference."})}
      <div class="form-field full" data-field="type"><label>Sample submission type <span class="required">*</span></label><div class="radio-options">${[["Physical","Physical sample","Send a product sample"],["Digital","Digital sample / specification","Submit technical files"],["Both","Both physical and digital","Send a sample and files"]].map(([v,t,d])=>`<label class="radio-card"><input type="radio" name="sampleType" value="${v}" ${form.type===v?"checked":""} onclick="window.portalForm('type','${v}')"><span><strong>${t}</strong><small>${d}</small></span></label>`).join("")}</div><small>Sample approval requirements depend on the selected product category.</small><span class="form-error">Choose a submission type.</span></div>
      <div class="notice full" style="grid-column:1/-1">${form.category?requiresApproval(form.category)?"This category requires sample approval before the sample gate is satisfied. Supplier onboarding qualification remains a separate decision.":needsSample(form.category)?"A sample is required for this category, but sample approval is not a mandatory onboarding gate.":"This category is configured as sample-exempt; its sample gate will be recorded as Exempt.":"Select a category to see its sample requirement."}</div></div>`;
    } else if(wizardStep===1) {
      body=`<div class="form-grid">${isPhysical(form.type)?`<div class="form-divider">Physical sample details</div>${field("Sample quantity","quantity",form.quantity,{required:true,type:"number",min:"1",error:"Enter a quantity greater than zero."})}${field("Unit of measure","unit",form.unit,{required:true})}${field("Product description / technical requirements","description",form.description,{required:true,textarea:true,full:true,error:"Describe the product or its technical requirements."})}${field("Sample identification notes","notes",form.notes,{textarea:true,full:true,placeholder:"Optional handling or identification information"})}`:""}
      ${isDigital(form.type)?`<div class="form-divider">Digital sample / specification</div>${field("Product specification","specification",form.specification,{required:true,textarea:true,full:true,error:"Enter the relevant specification or standard."})}${field("Technical description","digitalDescription",form.digitalDescription||"",{textarea:true,full:true,placeholder:"Optional technical detail"})}${field("Reference URL","url",form.url,{type:"url",full:true,placeholder:"https://"})}${uploadField()}`:""}</div>`;
    } else if(wizardStep===2) {
      body=`<div class="form-grid">${isPhysical(form.type)?`<div class="form-divider">Physical sample delivery</div>${field("Delivery address","address",form.address,{required:true,textarea:true,full:true,error:"Enter the delivery address."})}${field("Recipient name","recipient",form.recipient,{required:true,error:"Enter the receiving contact."})}${field("Recipient contact","contact",form.contact,{required:true,error:"Enter a phone number or email address."})}${field("Requested delivery date","deliveryDate",form.deliveryDate,{required:true,type:"date",min:new Date().toISOString().slice(0,10),error:"Select a requested delivery date."})}${field("Shipping / handling instructions","instructions",form.instructions,{textarea:true,full:true,placeholder:"Optional delivery instructions"})}`:""}
      ${isDigital(form.type)?`<div class="form-divider">Digital documents</div><p class="helper full" style="grid-column:1/-1">Attach datasheets, specifications, product images, certificates, or other supporting evidence. Files are not uploaded to a server.</p>${uploadField()}`:""}</div>`;
    } else {
      body=`<div class="notice">Review the information before submitting. Your request will be saved to this browser’s mock data. Submission does not record an approval decision.</div><div class="content-stack">
      <div class="card detail-section"><h2>Supplier & product information</h2><div class="info-grid">${info("Supplier",db.profile.company)}${info("Product",form.name)}${info("Product code",form.code)}${info("Category",form.category)}${info("Sample type",form.type)}${info("Sample gate",needsSample(form.category)?"Pending internal approval":"Exempt")}</div></div>
      ${isPhysical(form.type)?`<div class="card detail-section"><h2>Physical sample & delivery</h2><div class="info-grid">${info("Quantity",`${form.quantity} ${form.unit}`)}${info("Requested delivery",fmtDate(form.deliveryDate))}${info("Description",form.description)}${info("Recipient",form.recipient)}${info("Delivery address",form.address)}${info("Contact",form.contact||"—")}</div></div>`:""}
      ${isDigital(form.type)?`<div class="card detail-section"><h2>Digital sample & documents</h2><div class="info-grid">${info("Product specification",form.specification)}${info("Reference URL",form.url||"—")}</div><div class="file-list">${(form.files||[]).map(f=>`<div class="file-row">${escapeHtml(f.name)} <small>${(f.size/1024).toFixed(0)} KB</small></div>`).join("")||'<small>No attachments selected</small>'}</div></div>`:""}
      <label class="declaration" data-field="declaration"><input type="checkbox" ${form.declaration?"checked":""} onchange="window.portalForm('declaration',this.checked)"><span>I confirm that the information provided is accurate and the documents are relevant to this product. <span class="required">*</span></span><span class="form-error">Confirm the declaration before submitting.</span></label></div>`;
    }
    el.innerHTML=heading(isEdit?"Continue Sample Request":"New Sample Request",`Step ${wizardStep+1} of 4 · ${wizardNames[wizardStep]}`,`<button class="button subtle" onclick="window.portalNav('Sample Request')">Cancel</button>`)+
      `<div class="card wizard-card"><div class="wizard-steps">${wizardNames.map((n,i)=>`<div class="wizard-step ${i===wizardStep?"current":i<wizardStep?"done":""}"><span>${i<wizardStep?"✓":i+1}</span>${n}</div>`).join("")}</div>${body}
      <div class="wizard-footer"><button class="button" onclick="window.portalSaveDraft()">${isEdit?"Save Draft":"Save as Draft"}</button><div class="footer-right">${wizardStep>0?'<button class="button" onclick="window.portalStep(-1)">Back</button>':""}${wizardStep<3?'<button class="button primary" onclick="window.portalStep(1)">Continue</button>':'<button class="button primary" onclick="window.portalSubmit()">Submit Request</button>'}</div></div>
      <p class="mock-note" style="margin:12px 0 0">Prototype only · no backend or real file upload is connected.</p></div>`;
  }
  function info(label,value) { return `<div class="info-item"><label>${label}</label><strong>${escapeHtml(value||"—")}</strong></div>`; }
  const requiredByStep = {
    0:["category","name","code","type"],
    1:[],
    2:[],
    3:["declaration"]
  };
  function validateStep(step, show=true) {
    const errors=new Set(requiredByStep[step]||[]);
    if(step===0) for(const key of ["category","name","code","type"]) if(form[key]?.trim())errors.delete(key);
    if(step===1) {
      if(isPhysical(form.type)) { if(!form.quantity||Number(form.quantity)<=0)errors.add("quantity"); if(!form.unit)errors.add("unit"); if(!form.description?.trim())errors.add("description"); }
      if(isDigital(form.type)&&!form.specification?.trim()) errors.add("specification");
    }
    if(step===2&&isPhysical(form.type)) for(const k of ["address","recipient","contact","deliveryDate"]) if(!form[k]?.trim())errors.add(k);
    if(errors.has("declaration")&&form.declaration)errors.delete("declaration");
    if(show) {
      document.querySelectorAll(".has-error").forEach(n=>n.classList.remove("has-error"));
      errors.forEach(key=>document.querySelector(`[data-field="${key}"]`)?.classList.add("has-error"));
      if(errors.size) toast("Please complete the required fields before continuing.");
    }
    return errors.size===0;
  }
  function validateAll() {
    let valid=true;
    for(let i=0;i<4;i++) if(!validateStep(i,false))valid=false;
    document.querySelectorAll(".has-error").forEach(n=>n.classList.remove("has-error"));
    if(!valid) {
      const step=[0,1,2,3].find(i=>!validateStep(i,false)); wizardStep=step; render();
      validateStep(step,true);
      toast("Review the highlighted required fields.");
    }
    return valid;
  }
  function createRequestId() {
    const year=new Date().getFullYear(); const seq=String(Date.now()).slice(-5);
    let id=`SR-${year}-${seq}`; while(db.requests.some(r=>r.id===id)) id=`SR-${year}-${String(Math.floor(Math.random()*90000)+10000)}`;
    return id;
  }
  function saveDraft() {
    const now=new Date().toISOString().slice(0,10);
    if(form.id) {
      const index=db.requests.findIndex(r=>r.id===form.id);
      if(index<0||db.requests[index].status!=="Draft")return toast("This draft can no longer be changed.");
      db.requests[index]=policyFields({...db.requests[index],...form,updated:now});
    } else {
      form.id=createRequestId();
      db.requests.unshift(policyFields({...form,status:"Draft",created:now,updated:now,history:[["Draft Created",new Date().toISOString()]],revisions:[]}));
    }
    saveDb(); toast("Draft saved in this browser.");
    selectedId=form.id; page="Sample Request Details"; render();
  }
  function submitRequest() {
    if(!form||!validateAll())return;
    if(!window.confirm(`Submit sample request for “${form.name}”? You can view its status and history after submission.`))return;
    const now=new Date().toISOString().slice(0,10);
    if(form.id) {
      const r=db.requests.find(x=>x.id===form.id);
      if(!r||r.status!=="Draft")return toast("This request is no longer a draft.");
      Object.assign(r,form); transition(r,"Submitted"); addRequestDocuments(r);
    } else {
      const r=policyFields({...form,id:createRequestId(),status:"Draft",created:now,updated:now,history:[["Draft Created",new Date().toISOString()]],revisions:[]});
      db.requests.unshift(r); transition(r,"Submitted"); addRequestDocuments(r);
      selectedId=r.id;
    }
    saveDb(); form=null; page="Sample Request Details"; toast("Sample request submitted successfully."); render();
  }
  function renderDetails(el) {
    const r=db.requests.find(x=>x.id===selectedId);
    if(!r) { page="Sample Request"; return renderList(el); }
    const outcome=r.evaluationOutcome||r.outcome;
    const result=outcome?`<div class="result-banner ${outcome==="Rejected"?"rejected":""}"><strong>${outcome==="Approved"?"Evaluation approved":outcome==="Rejected"?"Evaluation rejected":"Evaluation update"}</strong><br>${escapeHtml(r.feedback||"An internal evaluator recorded this result.")}<br><small>Decision date: ${fmtDate(r.decisionDate)}</small></div>`:"";
    const physical=isPhysical(r.type), digital=isDigital(r.type);
    el.innerHTML=`<div class="detail-top"><div><div class="breadcrumbs" style="margin-bottom:11px"><button class="text-link" onclick="window.portalNav('Sample Request')">Sample Request</button> / ${escapeHtml(r.id)}</div><div class="detail-title"><h1>${escapeHtml(r.name)}</h1>${badge(r.status)}</div><p style="color:var(--muted);font-size:11px;margin:6px 0 0">${escapeHtml(r.id)} · ${escapeHtml(r.category)} · ${escapeHtml(r.type)} sample</p></div><div class="footer-right">${r.status==="Draft"?`<button class="button" onclick="window.portalEditDraft('${r.id}')">Edit draft</button><button class="button primary" onclick="window.portalEditDraft('${r.id}')">Continue →</button>`:r.status==="Action Required"||r.status==="Resubmission Required"?`<button class="button primary" onclick="window.portalRespond('${r.id}')">${r.status==="Resubmission Required"?"Submit revision":"Respond to feedback"} →</button>`:`<button class="button" onclick="window.portalNav('Sample Request')">Back to list</button>`}</div></div>
      <div class="detail-layout"><div class="detail-main"><div class="card detail-section"><h2>Request information</h2><div class="info-grid">${info("Request ID",r.id)}${info("Product name",r.name)}${info("Product code",r.code)}${info("Product category",r.category)}${info("Sample type",r.type)}${info("Sample gate",gateOf(r))}${info("Sample required",r.category?(needsSample(r.category)?"Yes":"No — exempt"):"Not set")}${info("Submitted date",r.status==="Draft"?"Not submitted":fmtDate(r.created))}${info("Last updated",fmtDate(r.updated))}${info("Description",r.description)}</div></div>
      ${physical?`<div class="card detail-section"><h2>Physical sample tracking</h2><div class="info-grid">${info("Quantity",r.quantity?`${r.quantity} ${r.unit}`:"—")}${info("Requested delivery",fmtDate(r.deliveryDate))}${info("Delivery address",r.address)}${info("Recipient",r.recipient)}${info("Recipient contact",r.contact)}${info("Receipt status",["Sample Received","Under Evaluation","Approved","Rejected"].includes(r.status)?"Received by evaluator":"Awaiting internal receipt confirmation")}${info("Shipping instructions",r.instructions)}</div><p class="mock-note" style="margin:14px 0 0">Only an authorized internal user can confirm physical sample receipt.</p></div>`:""}
      ${digital?`<div class="card detail-section"><h2>Digital specifications & attachments</h2><div class="info-grid">${info("Product specification",r.specification)}${info("Technical description",r.digitalDescription)}${info("Reference URL",r.url)}</div><div class="file-list">${(r.files||[]).map(f=>`<div class="file-row"><span>▤ &nbsp;${escapeHtml(f.name)} <small>${escapeHtml(f.type||"file")} · ${(f.size/1024).toFixed(0)} KB</small></span><span class="mock-note">Browser-only mock file</span></div>`).join("")||"<small>No digital attachments</small>"}</div></div>`:""}
      ${result?`<div class="card detail-section"><h2>Evaluation result</h2>${result}</div>`:""}
      ${r.feedback&&!r.outcome?`<div class="card detail-section"><h2>Evaluator feedback</h2><div class="feedback"><strong>Action requested</strong>${escapeHtml(r.feedback)}${r.requiredCorrections?`<br><br><strong>Requested corrections</strong>${escapeHtml(r.requiredCorrections)}`:""}</div></div>`:""}
      ${r.revisions?.length?`<div class="card detail-section"><h2>Responses & revisions</h2>${r.revisions.slice().reverse().map((v,i)=>`<div class="activity"><span class="activity-dot"></span><div><strong>Revision ${r.revisions.length-i} · ${fmtDate(v.date)}</strong><small>${escapeHtml(v.comments||"Information updated")} · ${v.files?.length||0} attachment(s)</small></div></div>`).join("")}</div>`:""}</div>
      <aside class="detail-side"><div class="card detail-section"><h2>Request timeline</h2><div class="timeline">${(r.history||[]).slice().reverse().map(h=>`<div class="timeline-event"><strong>${escapeHtml(h[0])}</strong><small>${fmtDate(h[1])} · ${new Intl.DateTimeFormat("en-US",{hour:"numeric",minute:"2-digit"}).format(new Date(h[1]))}</small></div>`).join("")}</div></div><div class="card detail-section"><h2>Submission overview</h2><div style="display:grid;gap:10px"><div style="display:flex;justify-content:space-between;font-size:10px"><span>Current status</span>${badge(r.status)}</div><div style="display:flex;justify-content:space-between;font-size:10px"><span>Sample required</span><strong>${needsSample(r.category)?"Yes":"No — exempt"}</strong></div><div style="display:flex;justify-content:space-between;font-size:10px"><span>Sample gate</span><strong>${gateOf(r)}</strong></div></div></div><p class="mock-note">Mock workflow only. Procurement evaluation and physical receipt are not connected to a live system.</p></aside></div>`;
  }
  function respondToRequest(id) {
    const r=db.requests.find(x=>x.id===id);
    if(!r||!["Action Required","Resubmission Required"].includes(r.status))return toast("A response is not available for this request.");
    selectedId=id; responseMode=r.status==="Resubmission Required"?"resubmit":"feedback"; page="Respond to Feedback"; render();
  }
  function renderResponse(el) {
    const r=db.requests.find(x=>x.id===selectedId);
    if(!r||!["Action Required","Resubmission Required"].includes(r.status)) { page="Sample Request"; return renderList(el); }
    el.innerHTML=heading(responseMode==="resubmit"?"Submit revised information":"Respond to evaluator feedback",`${r.id} · ${r.name}`,`<button class="button subtle" onclick="window.portalDetails('${r.id}')">Cancel</button>`)+
      `<div class="detail-layout"><div class="card wizard-card"><h2>Evaluator feedback</h2><div class="feedback"><strong>Requested changes</strong>${escapeHtml(r.feedback||r.requiredCorrections||"Please provide the requested information.")}<br><br><strong>Required corrections</strong>${escapeHtml(r.requiredCorrections||"Review feedback and provide an update.")}</div>
      <div class="notice warning" style="margin-top:14px">Your original request and previous decisions will be preserved. Your supplier response does not approve or reject the sample.</div>
      <div class="form-grid"><div class="form-field full"><label for="response-comments">Response comments <span class="required">*</span></label><textarea id="response-comments" class="field-control" rows="4" placeholder="Describe the updates you are providing..." oninput="window.portalResponseField('comments',this.value)"></textarea><span class="form-error">Add a response comment before submitting.</span></div>
      <div class="form-field full"><label>Updated attachments</label><div class="upload-box"><div class="helper">PDF, DOCX, JPG or PNG · max 10 MB per file. Mock attachment selection only.</div><input type="file" multiple accept=".pdf,.docx,.jpg,.jpeg,.png" onchange="window.portalResponseFiles(this.files)"><div class="file-list" id="response-file-list"></div></div></div>
      ${isPhysical(r.type)?`<div class="form-divider">Revised physical sample information</div>${field("Updated sample quantity","responseQuantity",r.quantity||"",{type:"number"})}${field("Updated delivery / handling notes","responseDelivery",r.instructions||"",{textarea:true,full:true})}`:""}</div>
      <div class="wizard-footer"><span class="mock-note">Linked to original request ${escapeHtml(r.id)}</span><button class="button primary" onclick="window.portalSubmitResponse()">${responseMode==="resubmit"?"Submit Resubmission":"Submit Response"}</button></div></div>
      <aside class="card detail-section"><h2>Change summary</h2><div class="activity-list">${(r.revisions||[]).map((v,i)=>`<div class="activity"><span class="activity-dot"></span><div><strong>Previous response ${i+1}</strong><small>${fmtDate(v.date)} · ${v.files?.length||0} updated file(s)</small></div></div>`).join("")||"<p class='mock-note'>No previous responses. This will be the first revision.</p>"}</div></aside></div>`;
  }
  function submitResponse() {
    const r=db.requests.find(x=>x.id===selectedId), comments=document.getElementById("response-comments")?.value.trim();
    if(!r||!["Action Required","Resubmission Required"].includes(r.status))return toast("This request is not accepting responses.");
    const field=document.querySelector('[for="response-comments"]')?.parentElement;
    if(!comments) { field?.classList.add("has-error"); toast("Add a response comment before submitting."); return; }
    if(!window.confirm("Submit this response to the internal review team?"))return;
    r.revisions=r.revisions||[];
    const updatedQuantity=document.getElementById("responseQuantity")?.value||"";
    const updatedDelivery=document.getElementById("responseDelivery")?.value||"";
    r.revisions.push({date:new Date().toISOString(),comments,files:responseFiles.map(({name,size,type,expiry})=>({name,size,type,expiry})),quantity:updatedQuantity,delivery:updatedDelivery});
    if(responseFiles.length) { r.files=[...(r.files||[]),...responseFiles.map(({name,size,type,expiry})=>({name,size,type,expiry}))];addRequestDocuments(r,responseFiles); }
    if(isPhysical(r.type)) {
      if(updatedQuantity) r.quantity=updatedQuantity;
      if(updatedDelivery) r.instructions=updatedDelivery;
    }
    r.feedback=""; r.requiredCorrections="";
    transition(r,"Under Review"); saveDb(); responseFiles=[]; page="Sample Request Details"; toast("Your response has been submitted."); render();
  }
  let responseFiles=[];
  function profileInput(name,label,value,type="text") {
    if(Array.isArray(type))return `<div class="form-field"><label for="profile-${name}">${label}</label><select class="field-control" id="profile-${name}" name="${name}" required>${type.map(option=>`<option value="${escapeHtml(option)}" ${value===option?"selected":""}>${escapeHtml(option)}</option>`).join("")}</select></div>`;
    return `<div class="form-field"><label for="profile-${name}">${label}</label><input class="field-control" id="profile-${name}" name="${name}" type="${type}" value="${escapeHtml(value||"")}" required></div>`;
  }
  function profileEntryForm(kind,fields,submitLabel) {
    return `<form class="form-grid" onsubmit="return window.portalSaveProfile(event,'${kind}')">${fields.map(([name,label,value,type])=>profileInput(name,label,value,type)).join("")}<div class="wizard-footer" style="grid-column:1/-1"><button type="button" class="button" onclick="window.portalProfileCancel()">Cancel</button><button class="button primary" type="submit">${submitLabel}</button></div></form>`;
  }
  function renderProfile(el) {
    const p=db.profile;
    const tabs=["Company information","Contacts","Manufacturing sites","Important documents","Products","Risk assessment"];
    let panel="";
    if(profileTab==="Company information") panel=`<h2>Company information ${profileEditMode?"":'<button class="button" onclick="window.portalProfileEdit(true)">Edit information</button>'}</h2>${profileEditMode?profileEntryForm("company",[["company","Supplier company",p.company],["registration","Registration number",p.registration],["contact","Company owner / primary contact",p.contact],["email","Business email",p.email,"email"],["phone","Phone",p.phone,"tel"],["site","Registered address",p.site]],"Save changes"):`<div class="info-grid">${info("Supplier company",p.company)}${info("Supplier ID",p.id)}${info("Registration number",p.registration)}${info("Company owner / primary contact",p.contact)}${info("Email",p.email)}${info("Phone",p.phone)}${info("Registered address",p.site)}${info("Product categories",p.categories.join(", "))}</div>`}`;
    if(profileTab==="Contacts") panel=`<h2>Contact persons <button class="button" onclick="window.portalProfileEntry('contact')">＋ Add contact</button></h2>${profileEntryMode==="contact"?profileEntryForm("contact",[["type","Contact type","Contact person",["Company owner","Contact person","Factory / manufacturer contact"]],["name","Contact name",""],["role","Role / position",""],["email","Business email","","email"],["phone","Phone number","","tel"]],"Add contact"): ""}<div class="table-wrap"><table><thead><tr><th>Contact type</th><th>Name</th><th>Role</th><th>Email</th><th>Phone</th><th>Status</th></tr></thead><tbody>${p.contacts.map((c,i)=>`<tr><td>${escapeHtml(c.type||(i===0?"Company owner":"Contact person"))}</td><td><strong>${escapeHtml(c.name)}</strong></td><td>${escapeHtml(c.role)}</td><td>${escapeHtml(c.email)}</td><td>${escapeHtml(c.phone)}</td><td>${badge(c.status)}</td></tr>`).join("")}</tbody></table></div>`;
    if(profileTab==="Manufacturing sites") panel=`<h2>Manufacturing sites <button class="button" onclick="window.portalSiteOpen()">＋ เพิ่มข้อมูลโรงงาน</button></h2><div class="table-wrap"><table><thead><tr><th>ลำดับ</th><th>ชื่อโรงงานผู้ผลิตสินค้า</th><th>ที่อยู่</th><th>พิกัด (ละติจูด, ลองจิจูด)</th><th>Status</th></tr></thead><tbody>${p.factories.map((f,i)=>`<tr><td>${i+1}</td><td><strong>${escapeHtml(f.name)}</strong></td><td>${escapeHtml(f.location||[f.address,f.subdistrict,f.district,f.province,f.postal,f.country].filter(Boolean).join(" "))}</td><td>${f.lat&&f.lng?`${escapeHtml(f.lat)}, ${escapeHtml(f.lng)}`:"—"}</td><td>${badge(f.status)}</td></tr>`).join("")}</tbody></table></div>`;
    if(profileTab==="Important documents") panel=importantDocumentsPanel();
    if(profileTab==="Products") panel=`<h2>Registered product categories</h2><div class="table-wrap"><table><thead><tr><th>Category</th><th>Reference</th><th>Sample requirement</th><th>Status</th></tr></thead><tbody>${p.products.map(x=>`<tr><td><strong>${escapeHtml(x.name)}</strong></td><td>${escapeHtml(x.code)}</td><td>${needsSample(x.name)?"Sample approval may be required":"Not required"}</td><td>${badge(x.status)}</td></tr>`).join("")}</tbody></table></div>`;
    if(profileTab==="Risk assessment") panel=`<h2>Sustainability risk assessment</h2>${riskAssessmentState()!=="required"?`<div class="table-empty"><div class="empty-icon">◈</div><h3>${riskAssessmentState()==="pending"?"Pending questionnaire":"Assessment not required"}</h3><p>${escapeHtml(riskAssessmentMessage())}</p><button class="button" disabled>Assessment unavailable</button></div>`:taskCount("sustainability-risk")?`<div class="table-wrap"><table><thead><tr><th>Risk area</th><th>Supplier response</th><th>Assessment status</th></tr></thead><tbody>${riskTopics.map(([key,label])=>`<tr><td><strong>${escapeHtml(label)}</strong></td><td>${escapeHtml(db.onboarding.riskAnswers[key]||"Not answered")}</td><td>${badge("Completed")}</td></tr>`).join("")}</tbody></table></div>`:'<div class="table-empty"><div class="empty-icon">◈</div><h3>Assessment not submitted</h3><p>Complete the sustainability risk assessment task to see your saved responses.</p><button class="button primary" onclick="window.portalTask(\'sustainability-risk\')">Start assessment</button></div>'}`;
    el.innerHTML=heading("Company Profile","Your supplier account information is linked to your onboarding record.")+
      `<div class="card profile-banner"><div class="avatar">AS</div><div><h2>${escapeHtml(p.company)}</h2><p>Supplier ID ${escapeHtml(p.id)} · ${escapeHtml(p.site)}</p></div>${badge("Verified")}</div>
      <div class="profile-tabs" role="tablist">${tabs.map(tab=>`<button class="profile-tab ${profileTab===tab?"selected":""}" role="tab" aria-selected="${profileTab===tab}" onclick="window.portalProfileTab('${tab}')">${tab}</button>`).join("")}</div>
      <div class="card detail-section profile-tab-content">${panel}<div class="notice" style="margin:18px 0 0">Profile changes and new records are saved in this browser for demonstration only; they are not submitted for approval.</div></div><div id="site-modal-root">${siteDraft?siteModalHtml():""}</div><div id="doc-modal-root">${previewDoc?docModalHtml():""}</div>`;
  }
  function siteModalHtml() {
    const field=k=>regFieldHtml("site",SITE_FIELDS.find(f=>f.k===k),siteDraft);
    return `<div class="modal-overlay" onclick="if(event.target===this)window.portalSiteClose()"><div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="site-modal-title"><button type="button" class="modal-close" aria-label="ปิด" onclick="window.portalSiteClose()">×</button><div class="modal-body"><h2 id="site-modal-title">ที่อยู่โรงงานผู้ผลิตสินค้า</h2><div class="reg-grid">${["name","country","address","province","district","subdistrict","postal"].map(field).join("")}</div><h3 class="modal-subtitle">พิกัดที่ตั้งโรงงานผู้ผลิตสินค้า</h3><p class="modal-hint">กรุณาระบุตำแหน่งที่ตั้งโรงงานผู้ผลิตสินค้าของคุณ</p><div class="reg-grid">${["lat","lng","mapQuery"].map(field).join("")}</div><div class="reg-map" id="site-map">${regMapHtml(siteDraft)}</div></div><div class="modal-footer"><button type="button" class="button" onclick="window.portalSiteClose()">ย้อนกลับ</button><button type="button" class="button primary" onclick="window.portalSiteSave()">บันทึก</button></div></div></div>`;
  }
  function renderSiteModal() {
    const root=document.getElementById("site-modal-root");
    if(!root)return;
    const scroll=root.querySelector(".modal-body")?.scrollTop||0;
    root.innerHTML=siteDraft?siteModalHtml():"";
    const body=root.querySelector(".modal-body");
    if(body)body.scrollTop=scroll;
  }
  function openSiteModal() {
    siteDraft={country:"ไทย"};regShowAll=false;regTouched.clear();
    renderSiteModal();
    document.getElementById(regId("site","name"))?.focus();
  }
  function closeSiteModal() {
    siteDraft=null;regShowAll=false;regTouched.clear();renderSiteModal();
  }
  function saveSite() {
    const d=siteDraft;
    if(!d)return;
    if(SITE_FIELDS.some(f=>regFieldError(f,d))) {
      regShowAll=true;renderSiteModal();
      document.querySelector("#site-modal-root .has-error input, #site-modal-root .has-error select")?.focus();
      return toast("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วนและถูกต้อง");
    }
    db.profile.factories.push({name:d.name.trim(),country:d.country,address:d.address.trim(),province:d.province,district:d.district,subdistrict:d.subdistrict,postal:d.postal,lat:d.lat.trim(),lng:d.lng.trim(),mapQuery:(d.mapQuery||"").trim(),location:[d.address.trim(),d.subdistrict,d.district,d.province,d.postal,d.country].join(" "),type:"Manufacturing",status:"Pending review"});
    siteDraft=null;regShowAll=false;regTouched.clear();saveDb();render();toast("เพิ่มข้อมูลโรงงานเรียบร้อยแล้ว");
  }
  function importantDocumentsPanel() {
    const tabs=["All","Under Review","Approved","Expiring Soon","Expired","Required"];
    const rows=db.documents.filter(doc=>documentFilter==="All"||documentStatus(doc)===documentFilter);
    return `<h2>Important company documents <button class="button" onclick="window.portalAddDocument()">＋ Add document</button></h2><div class="document-tabs" role="tablist">${tabs.map(tab=>`<button class="document-tab ${documentFilter===tab?"selected":""}" role="tab" aria-selected="${documentFilter===tab}" onclick="window.portalDocumentFilter('${tab}')">${tab}<span>${tab==="All"?db.documents.length:db.documents.filter(d=>documentStatus(d)===tab).length}</span></button>`).join("")}</div><div class="table-wrap"><table><thead><tr><th>Document name</th><th>Upload source</th><th>Document type</th><th>Latest upload</th><th>Expiry</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rows.map(d=>{const i=db.documents.indexOf(d),count=docVersions(d).length;return `<tr><td><strong>${escapeHtml(d.name)}</strong>${count?`<small>${count} version${count===1?"":"s"}</small>`:""}</td><td>${escapeHtml(docSource(d))}</td><td>${escapeHtml(d.type)}</td><td>${fmtDate(latestUpload(d))}</td><td>${fmtDate(d.expiry==="—"?"":d.expiry)}</td><td>${badge(documentStatus(d))}</td><td>${count?`<button class="text-link" onclick="window.portalDocPreview(${i})">View</button>`:`<button class="text-link" onclick="window.portalDocUploadVersion(${i})">Upload</button>`}</td></tr>`;}).join("")}</tbody></table>${rows.length?"":'<div class="table-empty"><div class="empty-icon">▤</div><h3>No documents in this category</h3><p>There are currently no matching supplier documents.</p></div>'}</div><div class="table-footer"><span>Showing ${rows.length} of ${db.documents.length} supplier documents</span><span>Mock document records</span></div>`;
  }
  function docViewHtml(doc) {
    const i=db.documents.indexOf(doc), versions=docVersions(doc);
    if(!versions.length)return '<div class="table-empty"><div class="empty-icon">▤</div><h3>No file uploaded yet</h3><p>Upload a file to start this document\'s history.</p></div>';
    const vi=Math.min(previewDoc.v,versions.length-1), version=versions[vi], fi=Math.min(previewDoc.f,version.files.length-1), file=version.files[fi], isCurrent=vi===versions.length-1;
    const expiryText=files=>{const e=files.map(f=>f.expiry).filter(Boolean).sort()[0];return e?`Expires ${fmtDate(e)}`:"No expiry";};
    const chips=version.files.length>1?`<div class="preview-files">${version.files.map((f,n)=>`<button type="button" class="document-tab ${n===fi?"selected":""}" onclick="window.portalDocPreview(${i},${vi},${n})">${escapeHtml(f.name)}</button>`).join("")}</div>`:"";
    return `<div class="doc-modal-grid"><div class="doc-preview-pane">${isCurrent?"":`<div class="notice warning" style="margin:0 0 10px">You are viewing an older version. <button type="button" class="text-link" onclick="window.portalDocPreview(${i})">Back to current version</button></div>`}<div class="preview-caption"><strong>${escapeHtml(file.name)}</strong><small>Version ${version.version} · ${file.size?`${(file.size/1024).toFixed(0)} KB · `:""}${file.expiry?`expires ${fmtDate(file.expiry)}`:"no expiry"}</small></div>${chips}${docPreviewHtml(doc,file)}</div>
      <aside class="doc-side"><h3>Details</h3><div class="info-grid">${info("Document type",doc.type)}${info("Upload source",docSource(doc))}${info("Related to",doc.related)}${info("Latest upload",fmtDate(latestUpload(doc)))}${info("Expiry date",fmtDate(doc.expiry==="—"?"":doc.expiry))}${info("Versions",String(versions.length))}</div><h3>Upload history</h3><div class="version-list">${versions.map((v,n)=>[v,n]).reverse().map(([v,n])=>`<button type="button" class="version-item ${n===vi?"selected":""}" aria-pressed="${n===vi}" onclick="window.portalDocPreview(${i},${n},0)"><span class="version-dot"></span><span><strong>Version ${v.version}${n===versions.length-1?badge("Current"):""}</strong><small>Uploaded ${fmtDate(v.date)} · ${v.files.length} file${v.files.length===1?"":"s"} · ${expiryText(v.files)}</small></span></button>`).join("")}</div></aside></div>`;
  }
  const wmTime=()=>{
    const p=Object.fromEntries(new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Bangkok",day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date()).map(x=>[x.type,x.value]));
    return `${p.day}/${p.month}/${p.year} ${p.hour}:${p.minute} (ICT)`;
  };
  function docPreviewHtml(doc,file) {
    const url=filePreviews.get(file.uid), ext=file.name.split(".").pop().toLowerCase();
    const stamp=`<div class="wm-stamp"><span class="wm-copy">Copy</span><small>Copied and published by<br>${escapeHtml(COMPANY.email)}<br>${wmTime()}</small></div>`;
    const content=url&&["png","jpg","jpeg"].includes(ext)?`<img class="preview-media" src="${url}" alt="Preview of ${escapeHtml(file.name)}">`
      :url&&ext==="pdf"?`<iframe class="preview-media" title="Preview of ${escapeHtml(file.name)}" src="${url}#toolbar=0&navpanes=0"></iframe>`
      :`<div class="preview-paper"><h3>${escapeHtml(file.name)}</h3><p>${escapeHtml(doc.type)} · ${escapeHtml(docSource(doc))}</p>${Array.from({length:9},(_,i)=>`<span style="width:${i%4===3?"62%":"100%"}"></span>`).join("")}</div>`;
    return `<div class="preview-stage">${content}<div class="wm-layer" aria-hidden="true">${stamp.repeat(6)}</div></div>${url?"":'<p class="mock-note">Mock preview: the original file content is only available in the session where it was uploaded, and seeded records have no file.</p>'}`;
  }
  function docModalHtml() {
    const doc=previewDoc.doc===null?null:db.documents[previewDoc.doc], uploading=Boolean(pendingMeta);
    if(previewDoc.doc!==null&&!doc)return "";
    const i=db.documents.indexOf(doc);
    const head=uploading?`<div class="doc-modal-head"><div><h2 id="doc-modal-title">${pendingMeta.fixed?`Upload new version · ${escapeHtml(pendingMeta.name)}`:"Add document"}</h2><p class="modal-hint">${pendingMeta.fixed?"The current version stays in the upload history.":"Use an existing document name to add a new version; earlier uploads stay in that document's history."}</p></div></div>`
      :`<div class="doc-modal-head"><div><h2 id="doc-modal-title">${escapeHtml(doc.name)}</h2><p class="modal-hint">${escapeHtml(doc.type)} · ${escapeHtml(docSource(doc))}</p></div>${badge(documentStatus(doc))}<button type="button" class="button" onclick="window.portalDocUploadVersion(${i})">＋ Upload new version</button></div>`;
    const footer=uploading?'<button type="button" class="button" onclick="window.portalPendingCancel()">Cancel</button><button type="button" class="button primary" onclick="window.portalPendingSave()">Save</button>':'<button type="button" class="button" onclick="window.portalDocPreviewClose()">Close</button>';
    return `<div class="modal-overlay" onclick="if(event.target===this&&!${uploading})window.portalDocPreviewClose()"><div class="modal-dialog preview-dialog" role="dialog" aria-modal="true" aria-labelledby="doc-modal-title"><button type="button" class="modal-close" aria-label="Close" onclick="window.portalDocPreviewClose()">×</button><div class="modal-body">${head}${uploading?docUploadFormHtml():docViewHtml(doc)}</div><div class="modal-footer">${footer}</div></div></div>`;
  }
  function renderDocModal() {
    const root=document.getElementById("doc-modal-root");
    if(!root)return;
    const scroll=root.querySelector(".modal-body")?.scrollTop||0;
    root.innerHTML=previewDoc?docModalHtml():"";
    const body=root.querySelector(".modal-body");
    if(body)body.scrollTop=scroll;
  }
  function closeDocModal() { previewDoc=null;pendingMeta=null;pendingDocs=[];renderDocModal(); }
  function documentStatus(doc) {
    if(doc.status==="Required")return "Required";
    const expiry=expiryState(doc);
    if(expiry)return expiry;
    if(doc.status==="Expiring Soon")return "Expiring Soon";
    if(doc.status==="Pending")return "Under Review";
    return "Approved";
  }
  const DOC_TYPES=["Company Registration","Tax Documentation","Identity Document","Site Photos","Quality Certification","Factory Documentation","Insurance Certificate","Supplier Declaration","Product Evidence","Questionnaire Evidence","Other"];
  function docUploadFormHtml() {
    const fixed=pendingMeta.fixed, match=findDocByName(pendingMeta.name,pendingMeta.type);
    const typeOptions=[...new Set([...DOC_TYPES,...db.documents.map(d=>d.type)])];
    return `<div class="form-grid" style="align-items:start"><div class="form-field"><label for="pending-name">Document name${fixed?"":' <span class="required">*</span>'}</label><input class="field-control" id="pending-name" type="text" autocomplete="off" value="${escapeHtml(pendingMeta.name)}" placeholder="Enter the document name" ${fixed?"disabled":""} oninput="window.portalPendingMeta('name',this.value)" onchange="window.portalPendingSync()"></div><div class="form-field"><label for="pending-type">Document type${fixed?"":' <span class="required">*</span>'}</label><select class="field-control" id="pending-type" ${fixed?"disabled":""} onchange="window.portalPendingMeta('type',this.value);window.portalPendingSync()"><option value="">Select a document type</option>${typeOptions.map(t=>`<option ${t===pendingMeta.type?"selected":""}>${escapeHtml(t)}</option>`).join("")}</select></div></div><small class="helper" id="pending-hint" style="display:block;min-height:15px;margin-top:6px">${match&&!fixed?"This document already exists, so the file will be saved as a new version.":""}</small>
      <label class="doc-drop" style="margin-top:14px"><input type="file" multiple accept=".pdf,.docx,.jpg,.jpeg,.png" aria-label="Choose files" onchange="window.portalDocumentFiles(this.files)"><span class="doc-drop-icon">↑</span><span><b>Drag files here or <u>choose files</u></b><br><small>PDF, DOCX, JPG or PNG · max 10 MB per file</small></span></label>
      ${pendingDocs.length?`<p class="mock-note" style="margin:12px 0 4px">Enter each file's expiry date so the system knows when it expires. Leave it blank if it does not expire.</p><div class="file-list">${pendingDocs.map((p,i)=>`<div class="file-row"><span class="file-ico">${escapeHtml(p.name.split(".").pop().toUpperCase().slice(0,4))}</span><span class="file-name">${escapeHtml(p.name)}<small>${(p.size/1024).toFixed(0)} KB</small></span><button type="button" onclick="window.portalPendingRemove(${i})">Remove</button>${expiryField(`window.portalPendingExpiry(${i},this.value)`,p.expiry)}</div>`).join("")}</div>`:""}`;
  }
  function renderNotifications(el) {
    const notes=db.requests.filter(r=>["Action Required","Resubmission Required","Approved","Rejected","Under Review"].includes(r.status)).sort((a,b)=>b.updated.localeCompare(a.updated));
    el.innerHTML=heading("Notifications","Recent updates about your supplier onboarding and sample requests.")+
      `<div class="card section-card"><div class="activity-list">${notes.map(r=>`<div class="activity"><span class="activity-dot"></span><div style="flex:1"><strong>${r.status==="Action Required"?"Response requested":r.status==="Approved"?"Evaluation completed":r.status==="Rejected"?"Evaluation result":"Request status updated"} · ${escapeHtml(r.name)}</strong><small>${escapeHtml(r.id)} · ${fmtDate(r.updated)} · ${escapeHtml(r.feedback||`Status: ${r.status}`)}</small></div>${badge(r.status)}<button class="text-link" onclick="window.portalOpen('${r.id}')">View →</button></div>`).join("")||'<div class="table-empty"><div class="empty-icon">♧</div><h3>You’re all caught up</h3><p>There are no new supplier portal updates.</p></div>'}</div></div>`;
  }
  function renderHelp(el) {
    el.innerHTML=heading("Help & Support","Get assistance with supplier registration, sample requests, and documents.")+
      `<div class="dashboard-grid"><div class="card section-card"><h2>Contact supplier support</h2><p style="color:var(--muted);font-size:11px;line-height:1.6">For account updates, onboarding questions, or help with sample submissions, contact the supplier support team.</p><div class="info-grid" style="margin:17px 0">${info("Email","supplier.support@northstar.example")}${info("Phone","+1 (800) 555-0194")}${info("Support hours","Monday–Friday, 8:00 AM–5:00 PM PT")}</div><a class="button primary" href="mailto:supplier.support@northstar.example">Email supplier support</a></div><div class="card section-card"><h2>Common questions</h2><div class="activity-list"><div class="activity"><div><strong>Does an approved sample mean I’m qualified?</strong><small>No. Sample approval is only one possible onboarding gate.</small></div></div><div class="activity"><div><strong>Can I mark my sample as received?</strong><small>No. An authorized internal evaluator confirms physical receipt.</small></div></div><div class="activity"><div><strong>Are attachments sent to Northstar?</strong><small>No. This prototype simulates file selection only.</small></div></div></div></div></div>`;
  }
  function requestAction(id) {
    const r=db.requests.find(x=>x.id===id); if(!r)return toast("Request not found.");
    selectedId=id;
    if(r.status==="Draft")return editDraft(id);
    if(["Action Required","Resubmission Required"].includes(r.status))return respondToRequest(id);
    page="Sample Request Details"; render();
  }
  function addDocument() {
    previewDoc={doc:null,v:0,f:0};pendingMeta={name:"",type:"",fixed:false};pendingDocs=[];renderDocModal();
    document.getElementById("pending-name")?.focus();
  }
  function uploadDocumentVersion(index) {
    const doc=db.documents[index];
    if(!doc)return;
    previewDoc={doc:index,v:Math.max(0,docVersions(doc).length-1),f:0};pendingMeta={name:doc.name,type:doc.type,fixed:true};pendingDocs=[];renderDocModal();
  }
  function syncPendingMeta() {
    const hint=document.getElementById("pending-hint");
    if(!hint||!pendingMeta)return;
    hint.textContent=pendingMeta.fixed||!findDocByName(pendingMeta.name,pendingMeta.type)?"":"This document already exists, so the file will be saved as a new version.";
  }
  function addDocumentFiles(files) {
    if(!pendingMeta)return;
    const allowed=["pdf","docx","jpg","jpeg","png"];
    let added=0;
    for(const file of Array.from(files||[])) {
      const extension=file.name.split(".").pop().toLowerCase();
      if(file.size>10*1024*1024) { toast(`${file.name} exceeds the 10 MB limit.`); continue; }
      if(!allowed.includes(extension)) { toast(`${file.name} is not a supported document type.`); continue; }
      pendingDocs.push(trackFile(file,file.type||extension));
      added++;
    }
    if(added)renderDocModal();
  }
  function savePendingDocuments() {
    if(!pendingMeta)return;
    const name=pendingMeta.name.trim(), type=pendingMeta.type, match=findDocByName(name,type);
    if(!name)return toast("Enter a document name.");
    if(!type)return toast("Select a document type.");
    if(!pendingDocs.length)return toast("Choose at least one file.");
    const doc=pushDocument(pendingDocs,{name:match?match.name:name,type,group:"Manual"}), versions=docVersions(doc).length;
    pendingDocs=[];pendingMeta=null;previewDoc={doc:db.documents.indexOf(doc),v:versions-1,f:0};saveDb();render();
    toast(versions>1?`Version ${versions} of “${doc.name}” saved. Earlier uploads are kept in the history.`:`“${doc.name}” added. File contents were not saved.`);
  }
  function showProfileTab(tab) {
    if(!["Company information","Contacts","Manufacturing sites","Important documents","Products","Risk assessment"].includes(tab))return;
    profileTab=tab;profileEntryMode=null;profileEditMode=false;siteDraft=null;previewDoc=null;pendingDocs=[];pendingMeta=null;regShowAll=false;regTouched.clear();render();
  }
  function profileEntry(kind) { if(kind!=="contact")return;profileEntryMode=kind;profileEditMode=false;render(); }
  function profileEdit(enabled) { profileEditMode=Boolean(enabled);profileEntryMode=null;render(); }
  function profileCancel() { profileEntryMode=null;profileEditMode=false;render(); }
  function saveProfile(event,kind) {
    event.preventDefault();
    const values=Object.fromEntries(new FormData(event.currentTarget).entries());
    if(kind==="company") {
      Object.assign(db.profile,{company:String(values.company).trim(),registration:String(values.registration).trim(),contact:String(values.contact).trim(),email:String(values.email).trim(),phone:String(values.phone).trim(),site:String(values.site).trim()});
      if(db.profile.contacts[0])Object.assign(db.profile.contacts[0],{name:db.profile.contact,email:db.profile.email,phone:db.profile.phone});
      profileEditMode=false;
    } else if(kind==="contact") {
      db.profile.contacts.push({type:String(values.type),name:String(values.name).trim(),role:String(values.role).trim(),email:String(values.email).trim(),phone:String(values.phone).trim(),status:"Pending review"});
      if(values.type==="Company owner")Object.assign(db.profile,{contact:String(values.name).trim(),email:String(values.email).trim(),phone:String(values.phone).trim()});
      profileEntryMode=null;
    } else return false;
    saveDb();render();toast("Profile information saved locally for this prototype.");return false;
  }
  function menu(open) { document.querySelector(".sidebar")?.classList.toggle("open",open); document.querySelector(".mobile-overlay")?.classList.toggle("show",open); }
  function nav(name) { page=name; pendingDocs=[]; pendingMeta=null; previewDoc=null; menu(false); render(); }
  function setForm(key,value) { if(form){form[key]=value; if(["category","type"].includes(key))render();} }
  function setStep(delta) {
    if(delta>0&&!validateStep(wizardStep))return;
    wizardStep=Math.max(0,Math.min(3,wizardStep+delta));render();
  }
  function addFiles(files,target="form") {
    const allowed=["application/pdf","application/vnd.openxmlformats-officedocument.wordprocessingml.document","image/jpeg","image/png"];
    const selected=Array.from(files||[]);
    const valid=[];
    for(const file of selected) {
      if(file.size>10*1024*1024) { toast(`${file.name} exceeds the 10 MB limit.`); continue; }
      const extension=file.name.split(".").pop().toLowerCase();
      if(!allowed.includes(file.type)&&!["pdf","docx","jpg","jpeg","png"].includes(extension)) { toast(`${file.name} is not a supported file type.`); continue; }
      valid.push(trackFile(file,file.type||extension));
    }
    if(target==="form") { form.files=[...(form.files||[]),...valid];render(); }
    else { responseFiles=[...responseFiles,...valid];renderResponseFiles(); }
  }
  function renderResponseFiles() {
    const root=document.getElementById("response-file-list");
    if(root)root.innerHTML=responseFiles.map((f,i)=>`<div class="file-row"><span>▤ &nbsp;${escapeHtml(f.name)} <small>(${(f.size/1024).toFixed(0)} KB)</small></span>${expiryField(`window.portalResponseExpiry(${i},this.value)`,f.expiry)}<button type="button" onclick="window.portalRemoveResponseFile(${i})">Remove</button></div>`).join("");
  }
  function resetDemo() {
    if(!window.confirm("Reset all supplier portal changes in this browser and reload the fictional demo data?"))return;
    try { localStorage.removeItem("northstar-supplier-portal-v1"); }
    catch(error) { console.error("Unable to reset saved supplier portal data.",error); toast("Could not clear saved demo data in this browser."); return; }
    db=structuredClone(initial); filters={search:"",status:"All statuses",category:"All categories",type:"All types",date:"Any date"};form=null;profileEditMode=false;profileEntryMode=null;siteDraft=null;pendingDocs=[];pendingMeta=null;previewDoc=null;profileTab="Company information";documentFilter="All";for(const preview of filePreviews.values())URL.revokeObjectURL(preview);filePreviews.clear();regTouched.clear();regShowAll=false;page="Supplier Onboarding";render();toast("Demo data reset.");
  }

  window.portalNav=nav;
  window.portalMenu=menu;
  window.portalNewRequest=startNew;
  window.portalTask=id=>{if(!onboardingTasks.some(task=>task.id===id))return;const blockedMessage=taskBlockedMessage(id);if(blockedMessage)return toast(blockedMessage);currentTask=id;page="Onboarding Task";render();};
  window.portalLearningAnswer=setLearningAnswer;
  window.portalLearningVideo=completeLearningVideo;
  window.portalLearningStep=setLearningStep;
  window.portalLearningConsent=acceptLearningConsent;
  window.portalConsentCheck=checked=>{const button=document.querySelector("[data-policy-accept]");if(button)button.disabled=!checked||!db.onboarding.learningFlow.videoCompleted||db.onboarding.learningFlow.consentAccepted;};
  window.portalSubmitLesson=submitLesson;
  window.portalRetryLesson=retryLesson;
  window.portalRiskAnswer=setRiskAnswer;
  window.portalSubmitRisk=submitRisk;
  window.portalQuestionnaireAnswer=setQuestionnaireAnswer;
  window.portalQuestionnaireDocument=setQuestionnaireDocument;
  window.portalQuestionnaireFiles=setQuestionnaireFiles;
  window.portalQuestionnaireRemoveFile=removeQuestionnaireFile;
  window.portalQuestionnaireNote=setQuestionnaireNote;
  window.portalSubmitQuestionnaire=submitQuestionnaire;
  window.portalRequestAction=requestAction;
  window.portalOpen=id=>{selectedId=id;page="Sample Request Details";render();};
  window.portalDetails=id=>{selectedId=id;page="Sample Request Details";render();};
  window.portalEditDraft=editDraft;
  window.portalRespond=respondToRequest;
  window.portalFilter=(key,value)=>{
    const input=key==="search"?document.querySelector('.search-wrap input'):null;
    const start=input?.selectionStart,end=input?.selectionEnd;
    filters[key]=value;renderList(document.getElementById("content"));
    if(key==="search") { const updated=document.querySelector('.search-wrap input');updated?.focus();if(start!==null&&end!==null)updated?.setSelectionRange(start,end); }
  };
  window.portalClearFilters=()=>{filters={search:"",status:"All statuses",category:"All categories",type:"All types",date:"Any date"};render();};
  window.portalSort=key=>{sort={key,direction:sort.key===key&&sort.direction==="asc"?"desc":"asc"};render();};
  window.portalForm=setForm;
  window.portalStep=setStep;
  window.portalSaveDraft=saveDraft;
  window.portalSubmit=submitRequest;
  window.portalFiles=files=>addFiles(files);
  window.portalRemoveFile=i=>{form.files.splice(i,1);render();};
  window.portalResponseField=(key,value)=>{const el=document.getElementById(`response-${key}`);el?.parentElement.classList.remove("has-error");};
  window.portalResponseFiles=files=>addFiles(files,"response");
  window.portalRemoveResponseFile=i=>{responseFiles.splice(i,1);renderResponseFiles();};
  window.portalResponseExpiry=(i,value)=>{const f=responseFiles[i];if(!f)return;if(!expiryAccepted(value,"Expiry date cannot be in the past."))return renderResponseFiles();f.expiry=value;};
  window.portalFileExpiry=(i,value)=>{const f=form?.files?.[i];if(!f)return;if(!expiryAccepted(value,"Expiry date cannot be in the past."))return render();f.expiry=value;};
  window.portalQuestionnaireExpiry=setQuestionnaireExpiry;
  window.portalRegFileExpiry=regFileExpiry;
  window.portalPendingExpiry=(i,value)=>{const f=pendingDocs[i];if(!f)return;if(!expiryAccepted(value,"Expiry date cannot be in the past."))return renderDocModal();f.expiry=value;};
  window.portalPendingRemove=i=>{pendingDocs.splice(i,1);renderDocModal();};
  window.portalPendingCancel=()=>{pendingDocs=[];pendingMeta=null;if(previewDoc?.doc===null||!docVersions(db.documents[previewDoc?.doc]||{}).length)previewDoc=null;renderDocModal();};
  window.portalPendingSave=savePendingDocuments;
  window.portalSubmitResponse=submitResponse;
  window.portalAddDocument=addDocument;
  window.portalProfileTab=showProfileTab;
  window.portalProfileEntry=profileEntry;
  window.portalSiteOpen=openSiteModal;
  window.portalSiteClose=closeSiteModal;
  window.portalSiteSave=saveSite;
  window.portalDocPreview=(i,v,f)=>{const doc=db.documents[i];if(!doc||!docVersions(doc).length)return;previewDoc={doc:i,v:v??docVersions(doc).length-1,f:f??0};renderDocModal();};
  window.portalDocPreviewClose=closeDocModal;
  window.portalDocUploadVersion=uploadDocumentVersion;
  window.portalPendingMeta=(key,value)=>{if(pendingMeta&&["name","type"].includes(key))pendingMeta[key]=value;};
  window.portalPendingSync=syncPendingMeta;
  document.addEventListener("keydown",event=>{if(event.key==="Escape"&&previewDoc)closeDocModal();});
  document.addEventListener("keydown",event=>{if(event.key==="Escape"&&siteDraft)closeSiteModal();});
  window.portalProfileEdit=profileEdit;
  window.portalProfileCancel=profileCancel;
  window.portalSaveProfile=saveProfile;
  window.portalDocumentFilter=tab=>{if(!["All","Under Review","Approved","Expiring Soon","Expired","Required"].includes(tab))return;documentFilter=tab;render();};
  window.portalDocumentFiles=addDocumentFiles;
  window.portalReset=resetDemo;
  window.portalRegCocCheck=checked=>{const button=document.getElementById("reg-coc-start");if(button)button.disabled=!checked;};
  window.portalRegStart=regStart;
  window.portalRegInput=regInput;
  window.portalRegSet=regSet;
  window.portalRegCheck=regCheck;
  window.portalRegBlur=regBlur;
  window.portalRegDatePick=regDatePick;
  window.portalRegDateNative=regDateNative;
  window.portalRegFiles=regAddFiles;
  window.portalRegRemoveFile=regRemoveFile;
  window.portalRegStep=regStep;
  window.portalRegGo=regGo;
  window.portalRegAddCat=regAddCategory;
  window.portalRegRemoveCat=regRemoveCategory;
  window.portalRegSubmit=regSubmit;
  window.portalRegScroll=id=>document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"});
  render();
})();
