// Prototype content: the real scoring rules and quiz bank were not provided, so these are illustrative.
export type RiskLevel = "Low" | "Medium" | "High";

interface Text { en: string; th: string }
export interface RiskQuestion { question: Text; options: [Text, Text, Text]; answer: 0 | 1 | 2 }

const t = (en: string, th: string): Text => ({ en, th });
const q = (question: Text, options: [Text, Text, Text], answer: 0 | 1 | 2): RiskQuestion => ({ question, options, answer });

export const RISK_QUESTIONS: Record<string, RiskQuestion[]> = {
  climate: [
    q(t("How does your company track greenhouse gas (GHG) emissions?", "บริษัทของคุณติดตามการปล่อยก๊าซเรือนกระจก (GHG) อย่างไร"),
      [t("It does not track emissions", "ไม่ได้ติดตามการปล่อยก๊าซ"), t("It records energy and fuel use and calculates emissions regularly", "บันทึกการใช้พลังงานและเชื้อเพลิง และคำนวณการปล่อยก๊าซสม่ำเสมอ"), t("It estimates once without keeping records", "ประเมินครั้งเดียวโดยไม่เก็บบันทึก")], 1),
    q(t("What is a sound first step toward reducing energy use?", "ขั้นตอนแรกที่เหมาะสมในการลดการใช้พลังงานคืออะไร"),
      [t("Buy offsets without measuring anything", "ซื้อคาร์บอนออฟเซ็ตโดยไม่วัดค่าใด ๆ"), t("Wait until customers ask", "รอให้ลูกค้าร้องขอก่อน"), t("Measure current consumption to find the biggest savings", "วัดการใช้พลังงานปัจจุบันเพื่อหาจุดที่ประหยัดได้มากที่สุด")], 2),
    q(t("Which shows a credible emission reduction commitment?", "ข้อใดแสดงถึงความมุ่งมั่นลดการปล่อยก๊าซที่น่าเชื่อถือ"),
      [t("A documented target with a baseline year and progress tracking", "เป้าหมายที่เป็นลายลักษณ์อักษร มีปีฐานและติดตามความคืบหน้า"), t("A slogan without data", "สโลแกนที่ไม่มีข้อมูล"), t("A one-time tree planting event only", "กิจกรรมปลูกต้นไม้ครั้งเดียวเท่านั้น")], 0),
    q(t("How are Scope 1 and Scope 2 emissions best described?", "ควรอธิบายการปล่อยก๊าซ Scope 1 และ Scope 2 อย่างไร"),
      [t("Scope 1 is indirect from purchased energy; Scope 2 is direct from owned sources", "Scope 1 คือทางอ้อมจากพลังงานที่ซื้อ ส่วน Scope 2 คือทางตรงจากแหล่งที่เป็นเจ้าของ"), t("Scope 1 is direct from owned sources; Scope 2 is indirect from purchased energy", "Scope 1 คือทางตรงจากแหล่งที่เป็นเจ้าของ ส่วน Scope 2 คือทางอ้อมจากพลังงานที่ซื้อ"), t("Both are only emissions from your suppliers", "ทั้งสองเป็นการปล่อยก๊าซของผู้ขายของคุณเท่านั้น")], 1),
    q(t("A customer asks for your carbon data. What should you do?", "ลูกค้าขอข้อมูลคาร์บอนของคุณ ควรทำอย่างไร"),
      [t("Decline every request", "ปฏิเสธทุกคำขอ"), t("Provide numbers without a source", "ให้ตัวเลขโดยไม่มีที่มา"), t("Provide documented data and explain the calculation method", "ให้ข้อมูลที่มีเอกสารและอธิบายวิธีคำนวณ")], 2),
  ],
  sourcing: [
    q(t("How should you select your own suppliers responsibly?", "ควรคัดเลือกผู้ขายของตนเองอย่างรับผิดชอบอย่างไร"),
      [t("Choose only the lowest price", "เลือกเฉพาะราคาต่ำที่สุด"), t("Assess them against documented criteria including social and environmental risk", "ประเมินตามเกณฑ์ที่เป็นลายลักษณ์อักษรซึ่งรวมความเสี่ยงด้านสังคมและสิ่งแวดล้อม"), t("Choose whoever was used last time", "เลือกรายที่เคยใช้ครั้งล่าสุด")], 1),
    q(t("A subcontractor cannot show required certificates. What is the best action?", "ผู้รับเหมาช่วงไม่สามารถแสดงใบรับรองที่กำหนดได้ ควรทำอย่างไรดีที่สุด"),
      [t("Request evidence, agree a corrective plan with a deadline, and follow up", "ขอหลักฐาน ตกลงแผนแก้ไขพร้อมกำหนดเวลา และติดตามผล"), t("Ignore it to avoid delay", "เพิกเฉยเพื่อไม่ให้ล่าช้า"), t("Accept a verbal promise only", "รับคำสัญญาด้วยวาจาเท่านั้น")], 0),
    q(t("Why keep traceability records for materials?", "ทำไมต้องเก็บบันทึกการตรวจสอบย้อนกลับของวัสดุ"),
      [t("Only for marketing", "เพื่อการตลาดเท่านั้น"), t("To avoid sharing information", "เพื่อไม่ต้องแบ่งปันข้อมูล"), t("To know where materials come from and respond to issues quickly", "เพื่อรู้แหล่งที่มาของวัสดุและตอบสนองต่อปัญหาได้รวดเร็ว")], 2),
    q(t("Which is a risk-based approach to supplier checks?", "ข้อใดคือแนวทางตรวจสอบผู้ขายตามระดับความเสี่ยง"),
      [t("Check every supplier identically every day", "ตรวจผู้ขายทุกรายเหมือนกันทุกวัน"), t("Focus checks on higher-risk suppliers and materials first", "เน้นตรวจผู้ขายและวัสดุที่มีความเสี่ยงสูงก่อน"), t("Never check suppliers", "ไม่ตรวจผู้ขายเลย")], 1),
    q(t("How should supplier expectations be communicated?", "ควรสื่อสารความคาดหวังต่อผู้ขายอย่างไร"),
      [t("Verbally to one contact", "บอกด้วยวาจากับผู้ติดต่อหนึ่งคน"), t("Only after a problem occurs", "หลังเกิดปัญหาเท่านั้น"), t("In writing before orders start, with a way to ask questions", "เป็นลายลักษณ์อักษรก่อนเริ่มสั่งซื้อ พร้อมช่องทางสอบถาม")], 2),
  ],
  workplace: [
    q(t("What should happen after a workplace hazard is reported?", "ควรทำอย่างไรหลังมีการแจ้งอันตรายในที่ทำงาน"),
      [t("Wait for an injury before acting", "รอให้มีผู้บาดเจ็บก่อนแล้วจึงดำเนินการ"), t("Assess it, take corrective action and tell the reporter the outcome", "ประเมิน แก้ไข และแจ้งผลให้ผู้รายงานทราบ"), t("Discipline the person who reported it", "ลงโทษผู้ที่แจ้ง")], 1),
    q(t("Which records support safe working conditions?", "บันทึกใดสนับสนุนสภาพการทำงานที่ปลอดภัย"),
      [t("Risk assessments, training records and incident logs", "การประเมินความเสี่ยง บันทึกการฝึกอบรม และบันทึกอุบัติเหตุ"), t("Only sales records", "บันทึกการขายเท่านั้น"), t("None are needed", "ไม่จำเป็นต้องมี")], 0),
    q(t("When should protective equipment (PPE) be provided?", "ควรจัดอุปกรณ์ป้องกันส่วนบุคคล (PPE) เมื่อใด"),
      [t("Only if workers ask and pay for it", "เฉพาะเมื่อแรงงานขอและจ่ายเอง"), t("Never; training alone is enough", "ไม่ต้อง การฝึกอบรมอย่างเดียวก็เพียงพอ"), t("When risk remains after other controls, at no cost to workers", "เมื่อยังมีความเสี่ยงหลังใช้มาตรการอื่นแล้ว โดยแรงงานไม่ต้องเสียค่าใช้จ่าย")], 2),
    q(t("How often should emergency evacuation drills be practised?", "ควรซ้อมอพยพฉุกเฉินบ่อยเพียงใด"),
      [t("Once when the site opens", "ครั้งเดียวตอนเปิดสถานที่"), t("Regularly, with records of each drill", "สม่ำเสมอ และเก็บบันทึกทุกครั้ง"), t("Only when an audit requires it", "เฉพาะเมื่อการตรวจประเมินกำหนด")], 1),
    q(t("What is the right response to a serious incident?", "การตอบสนองต่อเหตุการณ์ร้ายแรงที่ถูกต้องคืออะไร"),
      [t("Provide care, investigate the root cause and prevent a repeat", "ดูแลผู้ได้รับผลกระทบ สอบสวนหาสาเหตุ และป้องกันการเกิดซ้ำ"), t("Hide it from the authorities", "ปิดบังจากหน่วยงานที่เกี่ยวข้อง"), t("Blame the injured worker", "กล่าวโทษผู้ได้รับบาดเจ็บ")], 0),
  ],
  labor: [
    q(t("Which practice protects workers' freedom?", "แนวปฏิบัติใดคุ้มครองเสรีภาพของแรงงาน"),
      [t("The company holds passports as a deposit", "บริษัทยึดหนังสือเดินทางไว้เป็นหลักประกัน"), t("Workers pay recruitment fees to the employer", "แรงงานจ่ายค่าสรรหาให้นายจ้าง"), t("Workers keep their own identity documents and may leave with lawful notice", "แรงงานถือเอกสารประจำตัวเองและลาออกได้ตามกฎหมาย")], 2),
    q(t("What is the minimum working age principle?", "หลักการเรื่องอายุขั้นต่ำในการทำงานคืออะไร"),
      [t("Hire anyone if parents agree", "จ้างได้ทุกคนหากผู้ปกครองยินยอม"), t("Do not employ children below the legal minimum age, and verify ages", "ไม่จ้างเด็กที่อายุต่ำกว่าเกณฑ์ตามกฎหมาย และตรวจสอบอายุ"), t("Age is not checked", "ไม่ตรวจสอบอายุ")], 1),
    q(t("How should working hours be managed?", "ควรบริหารชั่วโมงการทำงานอย่างไร"),
      [t("Within legal limits, with voluntary overtime and recorded hours", "อยู่ในขอบเขตตามกฎหมาย โอทีโดยสมัครใจ และบันทึกชั่วโมงทำงาน"), t("Unlimited mandatory overtime", "บังคับทำโอทีไม่จำกัด"), t("No records are kept", "ไม่เก็บบันทึก")], 0),
    q(t("Which supports fair wages?", "ข้อใดสนับสนุนค่าจ้างที่เป็นธรรม"),
      [t("Deduct wages as punishment", "หักค่าจ้างเป็นการลงโทษ"), t("Pay only when orders arrive", "จ่ายเฉพาะเมื่อมีออเดอร์"), t("Pay at least the legal wage on time with clear pay slips", "จ่ายไม่ต่ำกว่าค่าจ้างตามกฎหมายตรงเวลา พร้อมสลิปที่ชัดเจน")], 2),
    q(t("How can workers raise grievances?", "แรงงานร้องเรียนปัญหาได้อย่างไร"),
      [t("Only through a supervisor, with no records", "ผ่านหัวหน้าเท่านั้น และไม่มีบันทึก"), t("Through an accessible channel with protection from retaliation", "ผ่านช่องทางที่เข้าถึงง่าย โดยได้รับการคุ้มครองไม่ให้ถูกตอบโต้"), t("They cannot", "ไม่สามารถทำได้")], 1),
  ],
  "food-safety": [
    q(t("What is a key purpose of HACCP?", "วัตถุประสงค์สำคัญของ HACCP คืออะไร"),
      [t("To identify and control food safety hazards at critical points", "เพื่อระบุและควบคุมอันตรายด้านความปลอดภัยอาหารในจุดวิกฤต"), t("To increase advertising", "เพื่อเพิ่มการโฆษณา"), t("To reduce staff", "เพื่อลดจำนวนพนักงาน")], 0),
    q(t("What should happen when a product fails a quality check?", "ควรทำอย่างไรเมื่อสินค้าไม่ผ่านการตรวจคุณภาพ"),
      [t("Ship it anyway", "ส่งมอบไปตามปกติ"), t("Isolate it, investigate the cause and record corrective action", "แยกออก สอบหาสาเหตุ และบันทึกการแก้ไข"), t("Mix it with good stock", "ผสมรวมกับสินค้าดี")], 1),
    q(t("Why is hygiene training important?", "ทำไมการฝึกอบรมด้านสุขลักษณะจึงสำคัญ"),
      [t("It is only for auditors", "สำหรับผู้ตรวจประเมินเท่านั้น"), t("It slows production", "ทำให้การผลิตช้าลง"), t("It prevents contamination and keeps products safe", "ป้องกันการปนเปื้อนและทำให้สินค้าปลอดภัย")], 2),
    q(t("How should allergens be managed?", "ควรจัดการสารก่อภูมิแพ้อย่างไร"),
      [t("Identify, segregate and label them clearly", "ระบุ แยกเก็บ และติดฉลากให้ชัดเจน"), t("Ignore labelling", "ไม่ต้องติดฉลาก"), t("Mention them only on request", "แจ้งเมื่อมีผู้ถามเท่านั้น")], 0),
    q(t("What supports product recall readiness?", "อะไรช่วยให้พร้อมเรียกคืนสินค้า"),
      [t("No batch codes", "ไม่มีรหัสแบตช์"), t("Waiting for complaints", "รอให้มีเรื่องร้องเรียน"), t("Batch/lot traceability and a tested recall procedure", "การตรวจสอบย้อนกลับตามแบตช์/ล็อต และขั้นตอนเรียกคืนที่ผ่านการทดสอบ")], 2),
  ],
  ethics: [
    q(t("A customer offers a gift to secure a contract. What is the right action?", "ลูกค้าเสนอของขวัญเพื่อให้ได้สัญญา ควรทำอย่างไร"),
      [t("Accept it privately", "รับไว้เป็นการส่วนตัว"), t("Decline it, or report it under the company gifts policy", "ปฏิเสธ หรือรายงานตามนโยบายของขวัญของบริษัท"), t("Ask for a bigger gift", "ขอของขวัญที่ใหญ่กว่า")], 1),
    q(t("What is a conflict of interest?", "ผลประโยชน์ทับซ้อนคืออะไร"),
      [t("A personal interest that may influence business judgement", "ผลประโยชน์ส่วนตัวที่อาจมีอิทธิพลต่อดุลยพินิจทางธุรกิจ"), t("A disagreement about price", "การไม่เห็นตรงกันเรื่องราคา"), t("A busy schedule", "ตารางงานที่ยุ่ง")], 0),
    q(t("How should confidential customer data be handled?", "ควรจัดการข้อมูลลับของลูกค้าอย่างไร"),
      [t("Share it freely with partners", "แบ่งปันกับพันธมิตรได้อย่างอิสระ"), t("Post it on shared drives", "โพสต์ไว้ในไดรฟ์ที่ใช้ร่วมกัน"), t("Restrict access and use it only for the agreed purpose", "จำกัดการเข้าถึงและใช้เฉพาะตามวัตถุประสงค์ที่ตกลง")], 2),
    q(t("What should accurate business records be?", "บันทึกทางธุรกิจที่ถูกต้องควรเป็นอย่างไร"),
      [t("Edited to look better", "แก้ไขให้ดูดีขึ้น"), t("Complete, truthful and retained as required", "ครบถ้วน เป็นความจริง และเก็บตามที่กำหนด"), t("Deleted after audits", "ลบหลังการตรวจประเมิน")], 1),
    q(t("How can employees report unethical conduct?", "พนักงานแจ้งพฤติกรรมที่ไม่เหมาะสมได้อย่างไร"),
      [t("Via a confidential channel with no retaliation", "ผ่านช่องทางที่เป็นความลับและไม่ถูกตอบโต้"), t("They must stay silent", "ต้องนิ่งเฉย"), t("Only to the person involved", "แจ้งเฉพาะกับบุคคลที่เกี่ยวข้อง")], 0),
  ],
};

/** Mock Inherent Risk rules per product category; the real scoring rules were not provided. */
const INHERENT_BY_CATEGORY: Record<string, Record<string, RiskLevel>> = {
  "Industrial Components": { climate: "High", sourcing: "Medium", workplace: "High", labor: "Medium", "food-safety": "Low", ethics: "Low" },
  "Packaging Materials": { climate: "Medium", sourcing: "High", workplace: "Low", labor: "Medium", "food-safety": "Medium", ethics: "Low" },
  "Safety Equipment": { climate: "Low", sourcing: "Medium", workplace: "High", labor: "High", "food-safety": "Low", ethics: "Medium" },
  "Office Supplies": { climate: "Low", sourcing: "Low", workplace: "Low", labor: "Low", "food-safety": "Low", ethics: "Low" },
};

export function inherentRisk(category: string): Record<string, RiskLevel> {
  return INHERENT_BY_CATEGORY[category] || INHERENT_BY_CATEGORY["Office Supplies"];
}

export type RiskAnswers = Record<string, Record<number, number>>;

export const topicAnswered = (topic: string, answers: RiskAnswers) =>
  RISK_QUESTIONS[topic].every((_, index) => Number.isInteger(answers[topic]?.[index]));

export function topicScore(topic: string, answers: RiskAnswers) {
  const questions = RISK_QUESTIONS[topic];
  const correct = questions.filter((item, index) => answers[topic]?.[index] === item.answer).length;
  const ratio = correct / questions.length;
  const level: RiskLevel = ratio >= 0.8 ? "Low" : ratio >= 0.6 ? "Medium" : "High";
  return { correct, total: questions.length, level };
}
