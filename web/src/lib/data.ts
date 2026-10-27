// Seed data copied from the mock-up (app.js). Fictional records only.
import type { Db, Lesson, Question, QuestionnaireItem, RequestRec } from "./types";
import { CATEGORIES, policyFields } from "./policy";
import { buyerRequestOf } from "./sample-request-flow";

export const learningVideoId = "";
export const COMPANY = { name: "Asteron Industrial Supply", id: "SUP-20481", contact: "Maya Chen", email: "maya.chen@asteron.example", phone: "+1 (555) 014-7782" };

const initialRequests: RequestRec[] = [
    { id:"SR-2026-0146", name:"Compostable Courier Bag", code:"PKG-CB-310", category:"Packaging Materials", type:"Digital", status:"Action Required", created:"2026-10-27", updated:"2026-10-27", quantity:"", unit:"pieces", description:"Compostable courier bag, 310 x 420 mm.", address:"", recipient:"", deliveryDate:"", instructions:"", files:[], feedback:"", requiredCorrections:"", history:[],
      buyerRequest:{ reviewMode:"Digital", documentsRequired:true, buyer:"Olivia Martin · Northstar Procurement", email:"olivia.martin@northstar.example", requestedAt:"2026-10-27", dueDate:"2026-11-13", requirements:"Buyer will review online. Submit the product specification and compostability certificate for evaluation.", documents:["Product specification / catalog","Compostability certificate"], quantity:"", unit:"pieces", address:"", recipient:"", contact:"sample.review@northstar.example" } },
    { id:"SR-2026-0145", name:"Industrial Safety Helmet", code:"PPE-HLM-07", category:"Safety Equipment", type:"Physical", status:"Action Required", created:"2026-10-26", updated:"2026-10-26", quantity:"2", unit:"pieces", description:"ABS safety helmet with ratchet suspension, EN 397.", address:"", recipient:"", deliveryDate:"", instructions:"", files:[], feedback:"", requiredCorrections:"", history:[],
      buyerRequest:{ reviewMode:"Onsite", documentsRequired:true, buyer:"Olivia Martin · Northstar Procurement", email:"olivia.martin@northstar.example", requestedAt:"2026-10-26", dueDate:"2026-11-12", requirements:"Buyer will inspect the helmet and production line onsite. Provide site details, propose a visit slot and attach the EN 397 certificate.", documents:["EN 397 certificate","Product specification"], quantity:"2", unit:"pieces", address:"", recipient:"", contact:"sample.review@northstar.example" } },
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

export const learningLessons: Lesson[] = [
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

export const learningQuestions: Question[] = [
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

export const supplierQuestionnaire: QuestionnaireItem[] = [
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

export const initial: Db = {
    requests: initialRequests.map((request) => policyFields({
      ...request,
      status: request.status === "Draft" ? "Action Required" : request.status,
      buyerRequest: { ...buyerRequestOf(request), reviewMode: request.type === "Both" ? "Digital" : buyerRequestOf(request).reviewMode },
      history: [["Buyer requested sample", `${request.created}T09:00:00`], ...request.history.filter(([action]) => action !== "Draft Created")],
    })),
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
      products:[{name:"Industrial Components",code:"CAT-IND",main:"Industrial Components",sub:"Valves and fittings",material:"Stainless steel",details:"Pressure valves, couplings and fastener sets for industrial piping. Fictional demo record.",files:[],status:"Active"},{name:"Packaging Materials",code:"CAT-PKG",main:"Packaging Materials",sub:"Mailers and wrap",material:"Recycled paper",details:"Recycled kraft mailers and protective wrap. Fictional demo record.",files:[],status:"Active"},{name:"Safety Equipment",code:"CAT-SAF",main:"Safety Equipment",sub:"Protective apparel",material:"Nitrile",details:"Chemical-resistant gloves, aprons and face shields. Fictional demo record.",files:[],status:"Pending review"}]
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

export const createInitialDb = (): Db => structuredClone(initial);
