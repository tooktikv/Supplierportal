export type TlsAnswer = "ใช่" | "ไม่ใช่" | "ไม่เกี่ยวข้อง";

export interface TlsQuestion {
  n: number;
  section: string;
  text: string;
  /** Only questions 13, 16 and 20 may be answered "ไม่เกี่ยวข้อง". */
  na?: boolean;
  /** Question 21 is answered but not scored. */
  scored: boolean;
}

const q = (n: number, section: string, text: string, na = false): TlsQuestion => ({ n, section, text, na, scored: n !== 21 });

export const TLS_QUESTIONS: TlsQuestion[] = [
  q(1, "การใช้แรงงานบังคับ", "ท่านไม่ได้มีการเรียกหรือรับหลักประกันการทำงาน หรือหลักประกันความเสียหายในการทำงาน ไม่ว่าจะเป็นเงิน ทรัพย์สินอื่น การค้ำประกันโดยบุคคล การยึดเอกสารประจำตัวใดๆ ไม่ว่าเข้าทำงานแล้ว หรือเป็นเงื่อนไขในการเข้าทำงาน เว้นแต่กฎหมายยกเว้นไว้"),
  q(2, "ค่าตอบแทนในการทำงาน", "ท่านมีการจ่ายค่าตอบแทนและค่าล่วงเวลาให้กับพนักงานไม่น้อยกว่าที่กฎหมายกำหนด"),
  q(3, "ค่าตอบแทนในการทำงาน", "ท่านไม่ได้มีการหักค่าจ้างพนักงานไม่ว่ากรณีใดๆ (ยกเว้นที่กฎหมายกำหนดไว้ เช่น ภาษีเงินได้)"),
  q(4, "ค่าตอบแทนในการทำงาน", "ท่านได้ให้พนักงานรับรู้ข้อมูลเกี่ยวกับค่าจ้างและค่าตอบแทนการทำงานที่ได้รับทั้งหมด ในแต่ละงวดเป็นลายลักษณ์อักษรและสามารถเข้าใจรายละเอียด ส่วนประกอบต่างๆ เป็นภาษาที่ลูกจ้างเข้าใจ"),
  q(5, "ชั่วโมงการทำงาน และเวลาพัก", "ท่านได้กำหนดชั่วโมงการทำงานโดยครอบคลุมชั่วโมงการทำงานปกติไม่เกิน 48 ชั่วโมง/สัปดาห์/คน และชั่วโมงการทำงานล่วงเวลาของพนักงานไม่เกิน 36 ชั่วโมง/สัปดาห์/คน และทำงานล่วงเวลาด้วยความสมัครใจเป็นไปตามที่กฎหมายกำหนด"),
  q(6, "ชั่วโมงการทำงาน และเวลาพัก", "ท่านมีการบันทึกเวลาการทำงานเข้า-ออก ตามระเบียบของบริษัท"),
  q(7, "ชั่วโมงการทำงาน และเวลาพัก", "ท่านมีการจัดให้มีเวลาพักในช่วงเวลาทำงานปกติ และมีการจัดให้มีเวลาพักไม่น้อยกว่า 20 นาทีก่อนการทำงานล่วงเวลา (กรณีที่ทำงานล่วงเวลาตั้งแต่ 2 ชั่วโมงขึ้นไป)"),
  q(8, "วันหยุดและวันลา", "ท่านมีการกำหนดวันหยุดต่างๆ และการลาต่างๆ ตามที่กฎหมายกำหนด"),
  q(9, "การเลือกปฏิบัติ", "ท่านไม่ได้กำหนด อายุ เพศ เชื้อชาติ ศาสนา สถานภาพการสมรส การตั้งครรภ์ ความพิการ ในการประกาศรับสมัครงานหรือการจ้างงาน และได้มีการปฏิบัติอย่างเท่าเทียมกันในเรื่องการจ่ายค่าจ้าง ค่าตอบแทนการทำงานโดยไม่คำนึงถึงความแตกต่างทางเพศของลูกจ้าง"),
  q(10, "วินัย และการลงโทษ", "ท่านไม่ได้มีการหัก หรือลดค่าจ้าง ค่าตอบแทนการทำงาน หรือเงินอื่นที่กฎหมายว่าด้วยการคุ้มครองแรงงานกำหนดให้จ่ายให้แก่ลูกจ้างเป็นการลงโทษทางวินัย และไม่ได้กระทำการ หรือสนับสนุนการลงโทษทางวินัยที่เป็นการทำร้ายทางร่างกาย หรือจิตใจของลูกจ้าง"),
  q(11, "การล่วงเกินทางเพศ และการใช้ความรุนแรง", "ท่านได้จัดทำมาตรการป้องกัน และแก้ไขปัญหาลูกจ้างถูกคุกคาม ล่วงเกิน หรือได้รับความเดือดร้อนรำคาญทางเพศโดยการแสดงออกด้วยคำพูด ท่าทาง การสัมผัสทางกาย หรือด้วยวิธีการอื่นใด และได้จัดทำมาตรการป้องกันและยุติการใช้ความรุนแรงในสถานประกอบกิจการ"),
  q(12, "การใช้แรงงานเด็ก", "ท่านไม่มีการจ้างพนักงานที่อายุต่ำกว่า 15 ปี และมีการทวนสอบอายุของพนักงานก่อนการรับสมัครงาน"),
  q(13, "การใช้แรงงานเด็ก", "กรณีที่ท่านมีการจ้างพนักงานที่อายุ 15 ปีขึ้นไปแต่ยังไม่ถึง 18 ปี มีการแจ้งสวัสดิการฯ ตามกฎหมาย (ถ้าไม่มีการจ้างพนักงาน 15 ปีขึ้นไปแต่ยังไม่ถึง 18 ปี ให้ระบุไม่เกี่ยวข้อง)", true),
  q(14, "การใช้แรงงานหญิง", "ท่านไม่ได้ให้ลูกจ้างหญิงทำงานที่เป็นอันตรายต่อสุขภาพ หรือร่างกาย และไม่ให้พนักงานหญิงตั้งครรภ์ทำงานล่วงเวลา ทำงานในวันหยุด เข้ากะ 22.00-06.00 น. ตามที่กฎหมายกำหนด"),
  q(15, "เสรีภาพในการสมาคมและการร่วมเจรจาต่อรอง", "มีการเคารพเสรีภาพในการจัดตั้งองค์กรหรือเข้าร่วมองค์กรของลูกจ้าง เพื่อส่งเสริมและปกป้องสิทธิประโยชน์จากการทำงาน และไม่กระทำการใดๆ เพื่อเป็นการแทรกแซงหรือขัดขวางการดำเนินกิจกรรมใดๆ ที่ชอบด้วยกฎหมายขององค์กรลูกจ้าง"),
  q(16, "เสรีภาพในการสมาคมและการร่วมเจรจาต่อรอง", "กรณีที่ท่านมีพนักงาน 50 คนขึ้นไป มีการจัดตั้งคณะกรรมการสวัสดิการในสถานประกอบกิจการ (ถ้ามีพนักงานไม่ถึง 50 คนให้ตอบไม่เกี่ยวข้อง)", true),
  q(17, "ความปลอดภัย อาชีวอนามัย และสภาพแวดล้อมในการทำงาน", "ท่านได้มีการบริหารจัดการ ดำเนินการด้านความปลอดภัย อาชีวอนามัย และสภาพแวดล้อม ให้เป็นไปตามที่กฎหมายกำหนด"),
  q(18, "สวัสดิการแรงงาน", "ท่านได้จัดสวัสดิการ ห้องน้ำ ห้องส้วม แยกชาย-หญิง, น้ำดื่มที่สะอาด, เวชภัณฑ์และยาที่ใช้ในการปฐมพยาบาล การรักษาพยาบาล ที่สะดวกและเพียงพอ เป็นไปตามที่กฎหมายกำหนด"),
  q(19, "สวัสดิการแรงงาน", "ท่านมีการยื่นประกันสังคมให้ลูกจ้างทุกคน"),
  q(20, "สวัสดิการแรงงาน", "กรณีท่านมีพนักงาน 10 คนขึ้นไป ท่านมีข้อบังคับในการทำงาน และสื่อสารให้พนักงานทุกคนได้รับทราบ (ถ้ามีพนักงานไม่ถึง 10 คนให้ตอบไม่เกี่ยวข้อง)", true),
  q(21, "สวัสดิการแรงงาน", "ท่านมีความยินดีนำระบบมาตรฐานแรงงานไทย มรท.8001 ไปประยุกต์ใช้"),
];

export const TLS_CRITERIA = [
  { min: 90, level: "ดีมาก", passed: true, label: "90-100" },
  { min: 80, level: "ดี", passed: true, label: "80-89" },
  { min: 70, level: "พอใช้", passed: true, label: "70-79" },
  { min: 0, level: "ไม่ผ่าน", passed: false, label: "ต่ำกว่า 70" },
];

const POINTS: Record<TlsAnswer, number> = { ใช่: 5, ไม่ใช่: 0, ไม่เกี่ยวข้อง: 5 };

export interface TlsAssessment {
  total: string;
  male: string;
  female: string;
  certified: "" | "มี" | "ไม่มี";
  certFiles: import("./types").FileMeta[];
  otherStandards: string;
  answers: Record<number, TlsAnswer>;
  notes: string;
  submittedAt?: string;
}

/** Scored questions (1-20) are worth 5 points each, so the total is also the percentage. */
export function tlsResult(answers: Record<number, TlsAnswer>) {
  const complete = TLS_QUESTIONS.every((question) => answers[question.n]);
  const score = TLS_QUESTIONS.filter((question) => question.scored).reduce((sum, question) => sum + (answers[question.n] ? POINTS[answers[question.n]] : 0), 0);
  const criterion = TLS_CRITERIA.find((item) => score >= item.min) || TLS_CRITERIA[TLS_CRITERIA.length - 1];
  return { complete, score, level: criterion.level, passed: criterion.passed };
}

const isPositiveInt = (value: string) => /^[1-9]\d*$/.test(value.trim());

export function tlsErrors(state: TlsAssessment) {
  const errors: Record<string, string> = {};
  if (!isPositiveInt(state.total)) errors.total = "Enter a whole number greater than 0.";
  if (!isPositiveInt(state.male)) errors.male = "Enter a whole number greater than 0.";
  if (!isPositiveInt(state.female)) errors.female = "Enter a whole number greater than 0.";
  if (!errors.total && !errors.male && !errors.female && Number(state.male) + Number(state.female) !== Number(state.total)) {
    errors.male = "Male and female employees must add up to the total.";
    errors.female = "Male and female employees must add up to the total.";
  }
  if (!state.certified) errors.certified = "Select Yes or No.";
  if (state.certified === "มี" && state.certFiles.length !== 1) errors.certFiles = "Upload your TLS 8001 certificate (PDF, 1 file, max 5 MB).";
  if (state.otherStandards.length > 5000) errors.otherStandards = "Maximum 5000 characters.";
  if (state.notes.length > 5000) errors.notes = "Maximum 5000 characters.";
  for (const question of TLS_QUESTIONS) {
    const answer = state.answers[question.n];
    if (!answer || (answer === "ไม่เกี่ยวข้อง" && !question.na)) errors[`q${question.n}`] = "Select an answer.";
  }
  return errors;
}
