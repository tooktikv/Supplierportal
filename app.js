(() => {
  "use strict";

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
  const learningQuestions=learningLessons.flatMap(lesson=>lesson.questions);
  const supplierQuestionnaire=[
    ["governance","Does your company maintain policies or procedures for ethical business conduct and anti-bribery?"],
    ["labor","Are workers informed of their employment terms and able to raise concerns without retaliation?"],
    ["safety","Does your company identify workplace hazards and provide appropriate safety training?"],
    ["environment","Do you monitor or manage significant environmental impacts such as energy, water, or waste?"],
    ["supply-chain","Do you communicate relevant responsible-business expectations to key subcontractors or suppliers?"]
  ];
  const initial = {
    requests: initialRequests.map(policyFields),
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
      selfRegistration: {status:"Submitted",updated:"2026-10-15"},
      procurementReview: {status:"Completed",updated:"2026-10-17"},
      tasks: {"sourcing-policy":0,"sustainability-risk":0,"supplier-questionnaire":0},
      learningQuizAnswers: {},
      learningQuizResults: {},
      learningFlow: {videoCompleted:false,consentAccepted:false,answers:{},result:null},
      riskAnswers: {},
      questionnaireAnswers: {},
      announcement: {status:"Not Started"},
      evaluation: {status:"Pending"}
    },
    documents: [
      {name:"Certificate of Incorporation",type:"Company Registration",related:"Asteron Industrial Supply",issue:"2022-03-14",expiry:"—",status:"Verified",group:"Registration"},
      {name:"ISO 9001:2015 Certificate",type:"Quality Certification",related:"Asteron Portland Manufacturing",issue:"2025-05-01",expiry:"2027-04-30",status:"Current",group:"Pre-Screening"},
      {name:"W-9 Tax Form",type:"Tax Documentation",related:"Asteron Industrial Supply",issue:"2026-01-12",expiry:"—",status:"Current",group:"Registration"},
      {name:"Factory Audit Summary",type:"Factory Documentation",related:"Asteron Portland Manufacturing",issue:"2025-11-08",expiry:"2026-10-18",status:"Expired",group:"Pre-Screening"},
      {name:"Product Liability Insurance",type:"Insurance Certificate",related:"Asteron Industrial Supply",issue:"2025-11-05",expiry:"2026-11-05",status:"Expiring Soon",group:"Pre-Screening"},
      {name:"Supplier Code of Conduct",type:"Supplier Declaration",related:"Asteron Industrial Supply",issue:"2026-10-16",expiry:"—",status:"Pending",group:"Pre-Screening"},
      {name:"Product Ingredient Information",type:"Product Evidence",related:"Industrial Components",issue:"",expiry:"",status:"Required",group:"Sample Request"},
      {name:"Certificate of Analysis (COA)",type:"Product Evidence",related:"Industrial Components",issue:"",expiry:"",status:"Required",group:"Sample Request"}
    ]
  };
  let db = loadDb();
  let page = "Supplier Onboarding", selectedId = null, form = null, wizardStep = 0, responseMode = "feedback", currentTask = null, profileTab = "Company information", documentFilter = "All", selectedDocument = null, profileEditMode = false, profileEntryMode = null;
  const documentPreviews=new Map();
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
      parsed.onboarding=parsed.onboarding||structuredClone(initial.onboarding);
      parsed.onboarding.tasks=parsed.onboarding.tasks||structuredClone(initial.onboarding.tasks);
      parsed.onboarding.learningQuizAnswers=parsed.onboarding.learningQuizAnswers||{};
      parsed.onboarding.learningQuizResults=parsed.onboarding.learningQuizResults||{};
      parsed.onboarding.learningFlow=parsed.onboarding.learningFlow||structuredClone(initial.onboarding.learningFlow);
      const learning=parsed.onboarding.learningFlow;
      parsed.onboarding.tasks["sourcing-policy"]=learning.videoCompleted?(learning.consentAccepted?(learning.result?.passed?3:2):1):0;
      parsed.onboarding.riskAnswers=parsed.onboarding.riskAnswers||{};
      parsed.onboarding.questionnaireAnswers=parsed.onboarding.questionnaireAnswers||{};
      const savedQuestionnaire=parsed.onboarding.questionnaireAnswers,migratedQuestionnaire={};
      for(const [key,value] of Object.entries(savedQuestionnaire)) {
        const legacyIndex=/^\d+$/.test(key)?Number(key):-1;
        const questionKey=legacyIndex>=0?supplierQuestionnaire[legacyIndex]?.[0]:key;
        if(questionKey)migratedQuestionnaire[questionKey]=typeof value==="boolean"?(value?"Yes":""):(value||"");
      }
      parsed.onboarding.questionnaireAnswers=migratedQuestionnaire;
      if(supplierQuestionnaire.some(([key])=>!["Yes","Partially","No","Not applicable"].includes(migratedQuestionnaire[key])))parsed.onboarding.tasks["supplier-questionnaire"]=0;
      parsed.documents=parsed.documents||structuredClone(initial.documents);
      parsed.documents.forEach((document,index)=>{
        document.id=document.id||`DOC-${String(index+1).padStart(4,"0")}`;
        document.history=document.history||[];
      });
      parsed.onboarding.procurementReview=parsed.onboarding.procurementReview||structuredClone(initial.onboarding.procurementReview);
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
    {id:"sustainability-risk",title:"Sustainability Risk Assessment",category:"Assessment",required:1,description:"Share information about your environmental, social, and governance practices.",icon:"◈"},
    {id:"supplier-questionnaire",title:"New Supplier Selection Questionnaire",category:"Questionnaire",required:1,description:"Complete the supplier pre-screening questionnaire for your company.",icon:"☷"}
  ];
  function taskCount(id) { return Math.min(onboardingTasks.find(t=>t.id===id)?.required||0,Number(db.onboarding.tasks[id])||0); }
  function questionnaireAvailable() { return taskCount("sourcing-policy")===3; }
  function taskBlockedMessage(id) {
    if(id==="supplier-questionnaire"&&!questionnaireAvailable())return "Complete all 3 learning activities in Sustainable Sourcing Policy and Supplier Guiding Principles first.";
    if(id==="sustainability-risk"&&riskAssessmentState()!=="required")return riskAssessmentMessage();
    return "";
  }
  function riskAssessmentState() {
    if(!questionnaireAvailable()||!taskCount("supplier-questionnaire"))return "pending";
    return supplierQuestionnaire.some(([key])=>["Partially","No"].includes(db.onboarding.questionnaireAnswers[key]))?"required":"not-required";
  }
  function riskAssessmentMessage() {
    return riskAssessmentState()==="pending"?"Complete and submit the New Supplier Selection Questionnaire first. Additional assessment is required only if a response is Partially or No.":"No risk identified from the submitted questionnaire. Additional assessment is not required.";
  }
  function requiredOnboardingTasks() {
    return onboardingTasks.filter(task=>task.id!=="sustainability-risk"||riskAssessmentState()!=="not-required");
  }
  function allTasksComplete() { return requiredOnboardingTasks().every(task=>taskCount(task.id)>=task.required); }
  function onboardingStages() {
    const registered=["Submitted","Completed"].includes(db.onboarding.selfRegistration.status);
    const reviewed=db.onboarding.procurementReview.status==="Completed";
    const tasksDone=allTasksComplete();
    const announced=db.onboarding.announcement.status==="Completed";
    return [
      {title:"Supplier registration",description:"Company registration submitted",status:registered?"Completed":"In Progress"},
      {title:"Procurement review",description:"Registration details reviewed by procurement",status:reviewed?"Completed":registered?"In Progress":"Not Started"},
      {title:"Your tasks",description:`${requiredOnboardingTasks().reduce((sum,t)=>sum+taskCount(t.id),0)} of ${requiredOnboardingTasks().reduce((sum,t)=>sum+t.required,0)} activities completed`,status:tasksDone?"Completed":reviewed?"In Progress":"Not Started"},
      {title:"Awaiting announcement",description:"Supplier pre-screening outcome will be shared when ready",status:announced?"Completed":tasksDone?"In Progress":"Not Started"},
      {title:"New supplier evaluation result",description:"Final supplier evaluation outcome",status:db.onboarding.evaluation.status==="Completed"?"Completed":announced?"In Progress":"Not Started"}
    ];
  }
  function render() {
    const root = document.getElementById("app");
    root.innerHTML = `<div class="shell">
      <div class="mobile-overlay" onclick="window.portalMenu(false)"></div>
      <aside class="sidebar">
        <div class="brand"><div class="brand-mark">N</div><div class="brand-name">northstar<small>Supplier portal</small></div></div>
        <div class="company-mini"><span>SUPPLIER ACCOUNT</span><strong>${escapeHtml(db.profile.company)}</strong></div>
        <div class="nav-label">Workspace</div><nav class="nav-list" aria-label="Main navigation">
          ${[["Supplier Onboarding","✓"],["Sample Request","◫"],["Company Profile","⌂"],["Documents","▤"],["Notifications","♧"]].map(([name,icon])=>`<button class="nav-item ${page===name||(page==="Onboarding Task"&&name==="Supplier Onboarding")?"active":""}" onclick="window.portalNav('${name}')"><span class="nav-icon">${icon}</span>${name}${name==="Sample Request"&&db.requests.some(r=>r.status==="Action Required")?'<span class="nav-count">1</span>':""}</button>`).join("")}
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
    const routes = {"Supplier Onboarding":renderOnboarding,"Onboarding Task":renderOnboardingTask,"Sample Request":renderList,"Create Sample Request":renderWizard,"Sample Request Details":renderDetails,"Respond to Feedback":renderResponse,"Company Profile":renderProfile,Documents:renderDocuments,Notifications:renderNotifications,"Help & Support":renderHelp};
    (routes[page] || renderOnboarding)(content);
  }
  function heading(title, desc, action="") { return `<div class="page-heading"><div><h1>${title}</h1><p>${desc}</p></div>${action}</div>`; }
  function metric(label,value,icon,note="") { return `<div class="card metric"><div class="metric-top">${label}<span class="metric-icon">${icon}</span></div><strong>${value}</strong><small>${note}</small></div>`; }
  function renderOnboarding(el) {
    const stages=onboardingStages();
    el.innerHTML=heading("Supplier Onboarding","Follow your supplier registration, task completion, and evaluation progress.")+
      `<div class="onboarding-layout"><section class="card section-card"><div class="section-title"><h2>Onboarding stages</h2>${badge("In Progress")}</div><div class="onboarding-stepper">${stages.map((s,i)=>`<div class="onboarding-stage ${s.status==="In Progress"?"stage-active":""}"><span class="stage-marker ${s.status==="Completed"?"stage-done":""}">${s.status==="Completed"?"✓":i+1}</span><div class="stage-copy"><strong>${escapeHtml(s.title)}</strong><small>${escapeHtml(s.description)}</small></div><span class="stage-state">${badge(s.status)}</span></div>`).join("")}</div></section>
      <section class="card section-card task-section"><div class="section-title"><div><h2>Your tasks</h2><small>Activities required during supplier pre-screening.</small></div></div>${onboardingTasks.map(task=>{
        const done=taskCount(task.id),isRisk=task.id==="sustainability-risk",blockedMessage=taskBlockedMessage(task.id),disabled=Boolean(blockedMessage);
        const blockedStatus=isRisk?(riskAssessmentState()==="pending"?"Pending questionnaire":"Not required"):"Pending learning";
        return `<article class="task-card ${disabled?"task-disabled":""}"><div class="task-icon">${task.icon}</div><div class="task-content"><span class="eyebrow">${task.category}</span><h3>${escapeHtml(task.title)}</h3><p>${escapeHtml(disabled?blockedMessage:isRisk?"Risk identified in your questionnaire. Complete this additional assessment.":task.description)}</p>${disabled?badge(blockedStatus):`<div class="task-progress"><span>Completed ${done}/${task.required}</span><div class="progress-track"><div class="progress-fill" style="width:${done/task.required*100}%"></div></div></div>`}</div><button class="button ${disabled||done>=task.required?"":"primary"}" onclick="window.portalTask('${task.id}')" ${disabled?"disabled":""}>${disabled?blockedStatus==="Not required"?"Not required":"Unavailable":done>=task.required?"Review":"View details"}${disabled?"":" →"}</button></article>`;
      }).join("")}</section></div>
      <div class="notice" style="margin-top:15px">Sample approval is a category-dependent gate only. It does not automatically mean your supplier qualification is complete. Current sample gate: ${badge(onboardingGate())}</div>`;
  }
  const riskTopics=[
    ["climate","Climate change and greenhouse gas emissions"],
    ["sourcing","Responsible sourcing and traceability"],
    ["workplace","Worker health, safety, and labor practices"],
    ["ethics","Business ethics and anti-corruption"],
    ["privacy","Data protection and information security"],
    ["continuity","Business continuity and operational resilience"]
  ];
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
      body=`<div class="notice">Select the level that best describes each topic for your company. These sample responses are stored locally and are not submitted to Northstar.</div><div class="card table-card risk-table"><div class="risk-header"><span>Risk topic</span><span>Your assessment</span></div>${riskTopics.map(([key,label])=>`<div class="risk-row"><strong>${label}</strong><select class="field-control" aria-label="${label}" onchange="window.portalRiskAnswer('${key}',this.value)"><option value="">Select a level</option>${["Low","Medium","High"].map(v=>`<option ${db.onboarding.riskAnswers[key]===v?"selected":""}>${v}</option>`).join("")}</select></div>`).join("")}</div><div class="wizard-footer"><small class="mock-note" data-risk-count>${Object.keys(db.onboarding.riskAnswers).filter(k=>db.onboarding.riskAnswers[k]).length} of ${riskTopics.length} topics assessed</small><button class="button primary" data-risk-submit onclick="window.portalSubmitRisk()" ${Object.keys(db.onboarding.riskAnswers).filter(k=>db.onboarding.riskAnswers[k]).length<riskTopics.length?"disabled":""}>Save assessment</button></div>`;
    } else {
      const options=["Yes","Partially","No","Not applicable"];
      const answerCount=supplierQuestionnaire.filter(([key])=>options.includes(db.onboarding.questionnaireAnswers[key])).length;
      body=`<div class="notice">Select the response that best describes your current practice. These fictional pre-screening responses are saved locally and do not represent a pass/fail supplier decision.</div><div class="card table-card risk-table"><div class="risk-header"><span>Supplier practice</span><span>Your response</span></div>${supplierQuestionnaire.map(([key,question])=>`<div class="risk-row"><strong>${escapeHtml(question)}</strong><select class="field-control" aria-label="${escapeHtml(question)}" onchange="window.portalQuestionnaireAnswer('${key}',this.value)" ${done>=task.required?"disabled":""}><option value="">Select a response</option>${options.map(value=>`<option value="${value}" ${db.onboarding.questionnaireAnswers[key]===value?"selected":""}>${value}</option>`).join("")}</select></div>`).join("")}</div><div class="wizard-footer"><small class="mock-note" data-questionnaire-count>${answerCount} of ${supplierQuestionnaire.length} responses completed</small><button class="button primary" data-questionnaire-submit onclick="window.portalSubmitQuestionnaire()" ${answerCount<supplierQuestionnaire.length||done>=task.required?"disabled":""}>Submit questionnaire</button></div>`;
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
    const questions=learningQuestions.map((question,index)=>`<fieldset class="quiz-question" ${locked||result?"disabled":""}><legend>${index+1}. ${escapeHtml(question.text)}</legend><div class="quiz-options">${question.options.map((option,optionIndex)=>`<label class="quiz-option"><input type="radio" name="policy-q${index}" value="${optionIndex}" ${flow.answers[index]===optionIndex?"checked":""} onchange="window.portalLearningAnswer(${index},${optionIndex})"><span>${escapeHtml(option)}</span></label>`).join("")}</div>${result?`<p class="quiz-explanation ${result.answers[index]===question.answer?"correct-answer":"incorrect-answer"}"><strong>${result.answers[index]===question.answer?"Correct.":"Review:"}</strong> ${escapeHtml(question.explanation)}</p>`:""}</fieldset>`).join("");
    const sections=[
      `<article class="card learning-module">${stepHeading(1,"E-learning video",flow.videoCompleted,true)}<div class="learning-video-placeholder"><span aria-hidden="true">▶</span><strong>Sustainable Sourcing Policy and Supplier Guiding Principles</strong><p>No training video has been supplied. This is a demo video placeholder, not a real playback record.</p></div><button class="button primary" onclick="window.portalLearningVideo()" ${flow.videoCompleted?"disabled":""}>${flow.videoCompleted?"Video demo completed":"Simulate video completion (demo)"}</button></article>`,
      `<article class="card learning-module">${stepHeading(2,"Consent / Accept document",flow.consentAccepted,flow.videoCompleted)}<h4>Sustainable Sourcing Policy and Supplier Guiding Principles</h4><details class="policy-document"><summary>Read policy document · Mock version 1.0</summary>${policy}<p class="mock-note">Original prototype policy summary, not an official policy or legal agreement.</p></details><label class="commitment-row"><input id="policy-consent" type="checkbox" ${flow.consentAccepted?"checked":""} ${!flow.videoCompleted||flow.consentAccepted?"disabled":""} onchange="window.portalConsentCheck(this.checked)"><span>I have read and accept the Sustainable Sourcing Policy and Supplier Guiding Principles (mock version 1.0).</span></label><button class="button primary" data-policy-accept onclick="window.portalLearningConsent()" disabled>${flow.consentAccepted?"Document accepted":"Accept document"}</button>${flow.consentAccepted?`<p class="mock-note">Accepted on ${fmtDate(flow.acceptedAt)} · Mock version 1.0</p>`:""}</article>`,
      `<article class="card learning-module">${stepHeading(3,"Questionnaire",Boolean(result?.passed),!locked)}<p class="lesson-summary">Questions from Sustainable Sourcing Policy and Supplier Guiding Principles.</p><div class="quiz-heading"><h4>Knowledge check · ${learningQuestions.length} questions</h4><span>Pass mark: 6/9</span></div>${questions}${result?`<div class="quiz-result ${result.passed?"passed":"needs-review"}"><strong>${result.passed?"Questionnaire passed":"Not passed yet"} · ${result.score}/9</strong><span>${result.passed?"Your result is saved.":"Review the explanations and try again."}</span></div>`:""}<button class="button primary" onclick="window.${result&&!result.passed?"portalRetryLesson":"portalSubmitLesson"}()" ${locked||result?.passed?"disabled":""}>${result?.passed?"Passed":result?"Try again":"Submit answers"}</button></article>`
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
    if(!flow.consentAccepted||flow.result)return toast("Complete the earlier steps or start a new quiz attempt.");
    if(!Number.isInteger(questionIndex)||!question||!Number.isInteger(optionIndex)||optionIndex<0||optionIndex>=question.options.length)return toast("Invalid questionnaire answer.");
    flow.answers[questionIndex]=optionIndex;saveDb();
  }
  function submitLesson() {
    const flow=db.onboarding.learningFlow;
    if(!flow.videoCompleted||!flow.consentAccepted)return toast("Complete the video and accept the document first.");
    if(flow.result)return toast("Review your result or select Try again.");
    if(learningQuestions.some((question,index)=>!Number.isInteger(flow.answers[index])||!question.options[flow.answers[index]]))return toast("Answer every question before submitting.");
    const score=learningQuestions.reduce((total,question,index)=>total+(flow.answers[index]===question.answer?1:0),0);
    flow.result={score,passed:score>=6,answers:{...flow.answers}};
    db.onboarding.tasks["sourcing-policy"]=flow.result.passed?3:2;saveDb();render();toast(flow.result.passed?"Learning completed. Progress: 3/3.":"Review the feedback and try again.");
  }
  function retryLesson() {
    const flow=db.onboarding.learningFlow;
    if(!flow.result||flow.result.passed)return toast("A retry is only available after an unsuccessful attempt.");
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
    if(!supplierQuestionnaire.some(([questionKey])=>questionKey===key)||!["","Yes","Partially","No","Not applicable"].includes(value))return;
    db.onboarding.questionnaireAnswers[key]=value; saveDb();
    const count=supplierQuestionnaire.filter(([questionKey])=>Boolean(db.onboarding.questionnaireAnswers[questionKey])).length;
    const counter=document.querySelector("[data-questionnaire-count]"), submit=document.querySelector("[data-questionnaire-submit]");
    if(counter)counter.textContent=`${count} of ${supplierQuestionnaire.length} responses completed`;
    if(submit)submit.disabled=count<supplierQuestionnaire.length;
  }
  function submitQuestionnaire() {
    if(!questionnaireAvailable())return toast(taskBlockedMessage("supplier-questionnaire"));
    if(taskCount("supplier-questionnaire"))return toast("The questionnaire has already been submitted.");
    if(supplierQuestionnaire.some(([key])=>!["Yes","Partially","No","Not applicable"].includes(db.onboarding.questionnaireAnswers[key])))return toast("Answer every question before submitting.");
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
    return `<div class="form-field full"><label>Attach supporting documents</label><div class="upload-box"><div class="helper">PDF, DOCX, JPG or PNG · max 10 MB per file. Attachments are simulated and remain in this browser only.</div><input type="file" multiple accept=".pdf,.docx,.jpg,.jpeg,.png" onchange="window.portalFiles(this.files)"><div class="file-list">${files.map((f,i)=>`<div class="file-row"><span>▤ &nbsp;${escapeHtml(f.name)} <small>(${(f.size/1024).toFixed(0)} KB)</small></span><button type="button" aria-label="Remove ${escapeHtml(f.name)}" onclick="window.portalRemoveFile(${i})">Remove</button></div>`).join("")}</div></div></div>`;
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
      Object.assign(r,form); transition(r,"Submitted");
    } else {
      const r=policyFields({...form,id:createRequestId(),status:"Draft",created:now,updated:now,history:[["Draft Created",new Date().toISOString()]],revisions:[]});
      db.requests.unshift(r); transition(r,"Submitted");
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
    r.revisions.push({date:new Date().toISOString(),comments,files:responseFiles.map(({name,size,type})=>({name,size,type})),quantity:updatedQuantity,delivery:updatedDelivery});
    if(responseFiles.length) r.files=[...(r.files||[]),...responseFiles.map(({name,size,type})=>({name,size,type}))];
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
    if(profileTab==="Manufacturing sites") panel=`<h2>Manufacturing sites <button class="button" onclick="window.portalProfileEntry('site')">＋ Add site</button></h2>${profileEntryMode==="site"?profileEntryForm("site",[["name","Site / facility name",""],["location","Address or location",""],["type","Site type","Manufacturing"]],"Add site"): ""}<div class="table-wrap"><table><thead><tr><th>Site name</th><th>Location</th><th>Site type</th><th>Status</th></tr></thead><tbody>${p.factories.map(f=>`<tr><td><strong>${escapeHtml(f.name)}</strong></td><td>${escapeHtml(f.location)}</td><td>${escapeHtml(f.type)}</td><td>${badge(f.status)}</td></tr>`).join("")}</tbody></table></div>`;
    if(profileTab==="Important documents") panel=`<h2>Important company documents</h2>${documentRows(db.documents.filter(d=>d.group!=="Sample Request"))}<button class="text-link" style="margin-top:14px" onclick="window.portalNav('Documents')">View all documents →</button>`;
    if(profileTab==="Products") panel=`<h2>Registered product categories</h2><div class="table-wrap"><table><thead><tr><th>Category</th><th>Reference</th><th>Sample requirement</th><th>Status</th></tr></thead><tbody>${p.products.map(x=>`<tr><td><strong>${escapeHtml(x.name)}</strong></td><td>${escapeHtml(x.code)}</td><td>${needsSample(x.name)?"Sample approval may be required":"Not required"}</td><td>${badge(x.status)}</td></tr>`).join("")}</tbody></table></div>`;
    if(profileTab==="Risk assessment") panel=`<h2>Sustainability risk assessment</h2>${riskAssessmentState()!=="required"?`<div class="table-empty"><div class="empty-icon">◈</div><h3>${riskAssessmentState()==="pending"?"Pending questionnaire":"Assessment not required"}</h3><p>${escapeHtml(riskAssessmentMessage())}</p><button class="button" disabled>Assessment unavailable</button></div>`:taskCount("sustainability-risk")?`<div class="table-wrap"><table><thead><tr><th>Risk area</th><th>Supplier response</th><th>Assessment status</th></tr></thead><tbody>${riskTopics.map(([key,label])=>`<tr><td><strong>${escapeHtml(label)}</strong></td><td>${escapeHtml(db.onboarding.riskAnswers[key]||"Not answered")}</td><td>${badge("Completed")}</td></tr>`).join("")}</tbody></table></div>`:'<div class="table-empty"><div class="empty-icon">◈</div><h3>Assessment not submitted</h3><p>Complete the sustainability risk assessment task to see your saved responses.</p><button class="button primary" onclick="window.portalTask(\'sustainability-risk\')">Start assessment</button></div>'}`;
    el.innerHTML=heading("Company Profile","Your supplier account information is linked to your onboarding record.")+
      `<div class="card profile-banner"><div class="avatar">AS</div><div><h2>${escapeHtml(p.company)}</h2><p>Supplier ID ${escapeHtml(p.id)} · Portland, Oregon, United States</p></div>${badge("Verified")}</div>
      <div class="profile-tabs" role="tablist">${tabs.map(tab=>`<button class="profile-tab ${profileTab===tab?"selected":""}" role="tab" aria-selected="${profileTab===tab}" onclick="window.portalProfileTab('${tab}')">${tab}</button>`).join("")}</div>
      <div class="card detail-section profile-tab-content">${panel}<div class="notice" style="margin:18px 0 0">Profile changes and new records are saved in this browser for demonstration only; they are not submitted for approval.</div></div>`;
  }
  function documentRows(documents) {
    if(!documents.length)return '<p class="mock-note">No documents in this section.</p>';
    return `<div class="table-wrap"><table><thead><tr><th>Document name</th><th>Type</th><th>Related to</th><th>Expiry</th><th>Status</th></tr></thead><tbody>${documents.map(d=>`<tr><td><strong>${escapeHtml(d.name)}</strong></td><td>${escapeHtml(d.type)}</td><td>${escapeHtml(d.related)}</td><td>${fmtDate(d.expiry==="—"?"":d.expiry)}</td><td>${badge(d.status)}</td></tr>`).join("")}</tbody></table></div>`;
  }
  function documentStatus(doc) {
    if(doc.status==="Required")return "Required";
    if(doc.expiry&&doc.expiry!=="—"&&new Date(`${doc.expiry}T23:59:59`)<new Date())return "Expired";
    if(doc.status==="Expiring Soon")return "Expiring Soon";
    if(doc.status==="Pending")return "Under Review";
    return "Approved";
  }
  function renderDocuments(el) {
    const tabs=["All","Under Review","Approved","Expiring Soon","Expired","Required"];
    const rows=db.documents.filter(doc=>documentFilter==="All"||documentStatus(doc)===documentFilter);
    const selected=Number.isInteger(selectedDocument)?db.documents[selectedDocument]:null;
    const previewUrl=selected?documentPreviews.get(selected.id):null;
    const preview=previewUrl&&selected.fileType?.startsWith("image/")?`<img src="${previewUrl}" alt="Local preview of ${escapeHtml(selected.name)}" style="display:block;max-width:100%;max-height:430px;margin:14px auto;border:1px solid var(--line);border-radius:6px">`:previewUrl&&selected.fileType==="application/pdf"?`<iframe title="Local PDF preview" src="${previewUrl}" style="display:block;width:100%;height:420px;margin-top:14px;border:1px solid var(--line);border-radius:6px"></iframe>`:`<div class="notice" style="margin-top:14px">Preview is unavailable for this seeded document. Newly selected PDF and image files can be previewed in this browser session only.</div>`;
    const detail=selected?`<div class="card detail-section"><div class="section-title"><h2>${escapeHtml(selected.name)}</h2><button class="button" onclick="window.portalDocInfo(null)">Close</button></div><div class="info-grid">${info("Document type",selected.type)}${info("Related to",selected.related)}${info("Issue date",fmtDate(selected.issue))}${info("Expiry date",fmtDate(selected.expiry==="—"?"":selected.expiry))}${info("Current status",documentStatus(selected))}${info("File name",selected.fileName||"Metadata-only demo record")}</div>${preview}<h3 style="margin-top:18px">Upload history</h3>${(selected.history||[]).length?`<div class="activity-list">${selected.history.slice().reverse().map(entry=>`<div class="activity"><span class="activity-dot"></span><div><strong>${escapeHtml(entry.action)} · Version ${entry.version}</strong><small>${fmtDate(entry.date)} · ${escapeHtml(entry.fileName||selected.name)}</small></div></div>`).join("")}</div>`:'<p class="mock-note">No upload history is recorded for this seeded example.</p>'}</div>`:"";
    el.innerHTML=heading("Documents","Track required supplier, factory, and product documents.",'<button class="button" onclick="window.portalAddDocument()">＋ Add document</button>')+
      `<input id="supplier-document-upload" type="file" multiple accept=".pdf,.docx,.jpg,.jpeg,.png" hidden onchange="window.portalDocumentFiles(this.files)"><div class="notice">Selected files are represented by local metadata only; this prototype does not store, upload, preview, or verify file contents.</div>${detail}<div class="document-tabs" role="tablist">${tabs.map(tab=>`<button class="document-tab ${documentFilter===tab?"selected":""}" role="tab" aria-selected="${documentFilter===tab}" onclick="window.portalDocumentFilter('${tab}')">${tab}<span>${tab==="All"?db.documents.length:db.documents.filter(d=>documentStatus(d)===tab).length}</span></button>`).join("")}</div><div class="card table-card"><div class="table-wrap"><table><thead><tr><th>Document name</th><th>Document type</th><th>Related to</th><th>Last updated</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rows.map(d=>`<tr><td><strong>${escapeHtml(d.name)}</strong></td><td>${escapeHtml(d.type)}<small>${escapeHtml(d.group||"Registration")}</small></td><td>${escapeHtml(d.related)}</td><td>${fmtDate(d.issue)}</td><td>${badge(documentStatus(d))}</td><td><button class="text-link" onclick="window.portalDocInfo(${db.documents.indexOf(d)})">View details →</button></td></tr>`).join("")}</tbody></table>${rows.length?"":'<div class="table-empty"><div class="empty-icon">▤</div><h3>No documents in this category</h3><p>There are currently no matching supplier documents.</p></div>'}</div><div class="table-footer"><span>Showing ${rows.length} of ${db.documents.length} supplier documents</span><span>Mock document records</span></div></div>`;
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
    document.getElementById("supplier-document-upload")?.click();
  }
  function addDocumentFiles(files) {
    const allowed=["pdf","docx","jpg","jpeg","png"], today=new Date().toISOString().slice(0,10);
    const selected=Array.from(files||[]);
    let added=0;
    for(const file of selected) {
      const extension=file.name.split(".").pop().toLowerCase();
      if(file.size>10*1024*1024) { toast(`${file.name} exceeds the 10 MB limit.`); continue; }
      if(!allowed.includes(extension)) { toast(`${file.name} is not a supported document type.`); continue; }
      const index=db.documents.length+1, id=`DOC-${String(index).padStart(4,"0")}`;
      const mime=file.type||(extension==="pdf"?"application/pdf":extension==="png"?"image/png":extension==="jpg"||extension==="jpeg"?"image/jpeg":"application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      db.documents.push({id,name:file.name,type:"Supplier Document",related:db.profile.company,issue:today,expiry:"",status:"Pending",group:"Registration",fileName:file.name,fileType:mime,fileSize:file.size,history:[{action:"Uploaded",date:today,version:1,fileName:file.name}]});
      if(mime==="application/pdf"||mime.startsWith("image/"))documentPreviews.set(id,URL.createObjectURL(file));
      added++;
    }
    if(!added)return;
    selectedDocument=null;saveDb();render();toast(`${added} mock document record${added===1?"":"s"} added. File contents were not saved.`);
  }
  function showProfileTab(tab) {
    if(!["Company information","Contacts","Manufacturing sites","Important documents","Products","Risk assessment"].includes(tab))return;
    profileTab=tab;profileEntryMode=null;profileEditMode=false;render();
  }
  function profileEntry(kind) { if(!["contact","site"].includes(kind))return;profileEntryMode=kind;profileEditMode=false;render(); }
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
    } else if(kind==="site") {
      db.profile.factories.push({name:String(values.name).trim(),location:String(values.location).trim(),type:String(values.type).trim(),status:"Pending review"});
      profileEntryMode=null;
    } else return false;
    saveDb();render();toast("Profile information saved locally for this prototype.");return false;
  }
  function docInfo(index) { selectedDocument=Number.isInteger(index)?index:null;render(); }
  function menu(open) { document.querySelector(".sidebar")?.classList.toggle("open",open); document.querySelector(".mobile-overlay")?.classList.toggle("show",open); }
  function nav(name) { page=name; menu(false); render(); }
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
      valid.push({name:file.name,size:file.size,type:file.type||extension});
    }
    if(target==="form") { form.files=[...(form.files||[]),...valid];render(); }
    else { responseFiles=[...responseFiles,...valid]; const root=document.getElementById("response-file-list"); if(root)root.innerHTML=responseFiles.map((f,i)=>`<div class="file-row">${escapeHtml(f.name)} <small>${(f.size/1024).toFixed(0)} KB</small><button onclick="window.portalRemoveResponseFile(${i})">Remove</button></div>`).join(""); }
  }
  function resetDemo() {
    if(!window.confirm("Reset all supplier portal changes in this browser and reload the fictional demo data?"))return;
    try { localStorage.removeItem("northstar-supplier-portal-v1"); }
    catch(error) { console.error("Unable to reset saved supplier portal data.",error); toast("Could not clear saved demo data in this browser."); return; }
    db=structuredClone(initial); filters={search:"",status:"All statuses",category:"All categories",type:"All types",date:"Any date"};form=null;profileEditMode=false;profileEntryMode=null;selectedDocument=null;profileTab="Company information";documentFilter="All";for(const preview of documentPreviews.values())URL.revokeObjectURL(preview);documentPreviews.clear();page="Supplier Onboarding";render();toast("Demo data reset.");
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
  window.portalRemoveResponseFile=i=>{responseFiles.splice(i,1);const root=document.getElementById("response-file-list");if(root)root.innerHTML=responseFiles.map((f,n)=>`<div class="file-row">${escapeHtml(f.name)} <small>${(f.size/1024).toFixed(0)} KB</small><button onclick="window.portalRemoveResponseFile(${n})">Remove</button></div>`).join("");};
  window.portalSubmitResponse=submitResponse;
  window.portalAddDocument=addDocument;
  window.portalProfileTab=showProfileTab;
  window.portalProfileEntry=profileEntry;
  window.portalProfileEdit=profileEdit;
  window.portalProfileCancel=profileCancel;
  window.portalSaveProfile=saveProfile;
  window.portalDocumentFilter=tab=>{if(!["All","Under Review","Approved","Expiring Soon","Expired","Required"].includes(tab))return;documentFilter=tab;render();};
  window.portalDocInfo=docInfo;
  window.portalDocumentFiles=addDocumentFiles;
  window.portalReset=resetDemo;
  render();
})();
