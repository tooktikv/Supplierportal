# การรับรองคุณสมบัติและ Skill Rate Card — Field spec สำหรับ SLM ↔ Supplier Portal

เอกสารนี้ได้จากโค้ดจริงใน `web/src/lib/qsl.ts`, `qsl-service.ts`, `qsl-slm-mock.ts` และ `web/src/components/qualification/*` ใช้เป็นข้อตกลง field ระหว่าง SLM กับ Portal

หมายเหตุสำคัญ
- ชื่อ field ใช้ camelCase ตาม type ใน `qsl.ts` ค่า enum ต้องสะกดและตัวพิมพ์เล็กใหญ่ตรงกันทุกตัว
- วันที่ใช้ `YYYY-MM-DD` เวลาใช้ ISO 8601 (UTC)
- ตัวเลขที่ Supplier กรอก Portal เก็บเป็น string (เช่น `rate: "1900"`) SLM ต้อง parse เอง
- ทิศทาง: **IN** = SLM สร้างแล้วส่งมา Portal / **OUT** = Portal ส่งกลับ SLM / **PORTAL** = Portal จัดการเอง ไม่ต้องส่ง
- ไฟล์: prototype เก็บเฉพาะ metadata (ชื่อ ขนาด วันหมดอายุ) ยังไม่ได้ส่งไฟล์จริง ต้องออกแบบช่องทางส่งไฟล์เพิ่ม

---

## 1. เมนูและหน้าจอ

| เมนู / หน้า | Route | เนื้อหา |
|---|---|---|
| เมนูซ้าย **Qualification** | `/qualification` | ตัวเลขบนเมนู = จำนวนคำขอที่ต้องดำเนินการ (สถานะ `Requested`, `Draft`, `Additional Information Required`) |
| หน้ารายการ **Qualification & Skill Rate Card** | `/qualification` | แท็บ: All / Action required / In review / Results / History |
| หน้ารายละเอียดคำขอ | `/qualification/{requestId}` | หัวหน้า: ชื่อหมวดสินค้า + Badge สถานะ + Badge ผลการรับรอง + `requestId · buyer · scope` |
| แท็บ **Overview** | | รายละเอียดคำขอ, คำแนะนำ, คำขอข้อมูลเพิ่มเติม, ทักษะ/หลักฐานที่ต้องใช้, เกณฑ์ระดับ, สถานะ, ประวัติสถานะ |
| แท็บ **Rate card** | | เงื่อนไขทางการค้า + ฟอร์มรายทักษะ + Declaration + ปุ่ม Save draft / Submit |
| แท็บ **Evidence** | | แนบหลักฐานตามข้อกำหนดและตามทักษะ |
| แท็บ **Company & capability** | | ข้อมูล Shared Supplier Profile (อ่านอย่างเดียว) |
| แท็บ **Result** | | ผลที่ SLM เผยแพร่ |
| แท็บ **History** | | การส่ง/ฉบับแก้ไข, คำขอข้อมูลเพิ่ม, ประวัติสถานะ, Activity log |

### คอลัมน์ในหน้ารายการ
Reference (`id`) · Requesting Buyer (`buyer`) · Product category / Scope (`productCategory`, `scope`) · Requested on (`requestedAt`) · Due date (`dueDate`) · Status (`status`) · Outcome / Tier (ผลและ `tier`) · Actions

### การจัดกลุ่มแท็บในหน้ารายการ (Portal คำนวณเองจาก `status`)
| แท็บ | เงื่อนไข |
|---|---|
| Action required | `Requested`, `Draft`, `Additional Information Required` |
| In review | `Submitted`, `Under Review`, `Assessment In Progress`, `Pending Central Verification`, `Pending Qualification Approval` |
| Results | `Result Released` และผลล่าสุดเป็น `Qualified`/`Conditional` และยังไม่หมดอายุ |
| History | `Withdrawn` หรือ `Result Released` ที่ไม่อยู่ในกลุ่ม Results (Not Qualified, Suspended, Expired) |

---

## 2. IN: SLM → Portal (SLM สร้างคำขอแล้วส่งมา)

### 2.1 Qualification Request (header)

| Field | Type | บังคับ | แสดงที่ไหน (UI label) | หมายเหตุ |
|---|---|---|---|---|
| `id` | string | ✔ | Reference / Request reference | รูปแบบ `QR-YYYY-NNNN` Portal ใช้เป็น key และ route |
| `supplierId` | string | ✔ | — | ต้องตรงกับรหัสผู้ขายใน Portal (เช่น `SUP-20481`) ใช้กรองให้เห็นเฉพาะของตัวเอง |
| `buyer` | string | ✔ | Requesting Buyer | ข้อความอิสระ เช่น `Olivia Martin · Northstar Procurement` |
| `productCategory` | string | ✔ | Product category | ต้องตรงกับชื่อ/กลุ่มหลักในโปรไฟล์ Portal (เช่น `Industrial Components`, `Packaging Materials`, `Safety Equipment`) เพื่อแสดง "Covers this request" |
| `scope` | string | ✔ | Qualification scope | ขอบเขตการรับรอง |
| `requestedAt` | date | ✔ | Requested on | |
| `dueDate` | date | ✔ | Submission due date | |
| `instructions` | string | ✔ | Submission instructions | ข้อความยาว |
| `currencies` | string[] | ✔ | ตัวเลือก Currency | รหัสสกุลเงิน เช่น `["THB","USD"]` ตัวแรกเป็นค่าเริ่มต้น |
| `rateBases` | enum[] | ✔ | ตัวเลือก Rate basis | `Hourly` / `Daily` / `Monthly` ถ้ามีค่าเดียวเลือกให้อัตโนมัติ |
| `status` | enum | ✔ | Badge สถานะ | ดูหัวข้อ 2.6 |
| `updated` | date | ✔ | Last updated | |
| `history[]` | array | ✔ | Status history | `{ status, at, by, note? }` เพิ่มทุกครั้งที่สถานะเปลี่ยน ห้ามใส่ความเห็นภายใน (internal) |

### 2.2 Rating scale — `ratingScale[]` (แสดงในตาราง Rating scale และตัวเลือก Self-rating / Level)

| Field | Type | บังคับ | หมายเหตุ |
|---|---|---|---|
| `level` | integer | ✔ | ค่าที่ Supplier เลือกเป็น Self-rating และ Level ในบรรทัดอัตรา ปัจจุบัน seed คือ 1–5 |
| `name` | string | ✔ | เช่น Entry, Junior, Skilled, Senior, Expert |
| `description` | string | ✔ | แสดงเป็นคำอธิบายใต้ช่อง Self-rating |

### 2.3 Criteria (ทักษะ) — `criteria[]` (แต่ละตัวคือ 1 การ์ดในแท็บ Rate card)

| Field | Type | บังคับ | UI | หมายเหตุ |
|---|---|---|---|---|
| `id` | string | ✔ | — | key ของคำตอบ เช่น `sk-cnc` ต้องคงที่ ห้ามเปลี่ยนระหว่างรอบ revision |
| `source` | enum | ✔ | Tag + คอลัมน์ Defined by | `Central Standard` / `Buyer Custom` |
| `group` | string | ✔ | หัวกลุ่มทักษะ / Skill group | ใช้จัดกลุ่ม |
| `name` | string | ✔ | ชื่อการ์ด / Skill | |
| `description` | string | ✔ | คำอธิบายใต้ชื่อ | |
| `instructions` | string | ✔ | กล่อง notice ในการ์ด | คำแนะนำการประเมิน |
| `mandatory` | boolean | ✔ | Tag Mandatory/Optional | `true` = เลือก No ไม่ได้ |
| `evidenceRequired` | boolean | ✔ | Evidence required/optional | `true` = ต้องแนบหลักฐานเมื่อให้บริการทักษะนี้ |
| `evidenceTypes` | string[] | ✔ | — | ประเภทเอกสารที่รับ (ดูข้อ 5) ว่าง = รับทุกประเภท |

ไม่ส่งมาที่ Portal: น้ำหนักคะแนน (weight), เกณฑ์ผ่าน (threshold), นิยามภายในของ Verifier

### 2.4 Required evidence ระดับบริษัท — `requiredEvidence[]`

| Field | Type | บังคับ | หมายเหตุ |
|---|---|---|---|
| `id` | string | ✔ | เช่น `req-iso` |
| `title` | string | ✔ | ชื่อการ์ดหลักฐาน |
| `description` | string | ✔ | |
| `docTypes` | string[] | ✔ | ประเภทเอกสารที่รับ ว่าง = รับทุกประเภท |
| `mandatory` | boolean | ✔ | `true` = ต้องแนบก่อนส่ง |

### 2.5 Additional information request — `infoRequests[]`

| Field | Type | หมายเหตุ |
|---|---|---|
| `id` | string | key ของคำตอบ (`replies["{id}:{itemIndex}"]`) |
| `requestedAt`, `dueDate` | date | `dueDate` แสดงเป็น "Reply by" |
| `from` | string | เช่น `Buyer assessor` |
| `message` | string | ข้อความหัวคำขอ (เฉพาะที่ Supplier เห็นได้) |
| `items[]` | `{ targetId, text }` | `targetId` = `criteria.id` → แก้ในแท็บ Rate card / `requiredEvidence.id` → แก้ในแท็บ Evidence / `"general"` → แก้เงื่อนไขทางการค้า **Supplier แก้ได้เฉพาะ target ที่ระบุเท่านั้น** |
| `status` | enum | `Open` / `Responded` (Portal เปลี่ยนเป็น `Responded` เมื่อส่ง revision) |
| `respondedAt`, `respondedVersion` | date, int | Portal เติมตอนตอบ |

การเปิดคำขอข้อมูลเพิ่ม: ส่ง `status = Additional Information Required` พร้อม `infoRequests[]` ที่มี `status = Open` อย่างน้อย 1 รายการ ไม่เช่นนั้น Portal จะไม่เปิดให้แก้ไข

### 2.6 Request status (SLM เป็นเจ้าของ) — `status`

| ค่า | ความหมายที่แสดงให้ Supplier |
|---|---|
| `Requested` | ได้รับคำขอ รอ Supplier กรอก |
| `Draft` | Supplier บันทึกฉบับร่าง (Portal ตั้งเอง) |
| `Submitted` | ส่งแล้ว รอเข้าสู่การตรวจสอบ |
| `Under Review` | SLM ตรวจความครบถ้วน |
| `Additional Information Required` | ต้องการข้อมูลเพิ่ม |
| `Assessment In Progress` | Buyer assessor กำลังประเมิน |
| `Pending Central Verification` | รอ Central Rating Verifier |
| `Pending Qualification Approval` | รอ Central Qualification Approver |
| `Result Released` | เผยแพร่ผลแล้ว |
| `Withdrawn` | ถอนคำขอ (อ่านอย่างเดียว) |

Portal เปลี่ยนสถานะเองได้ 3 กรณีเท่านั้น: `Requested → Draft` (แก้ไขครั้งแรก), `Draft → Submitted`, `Additional Information Required → Submitted` สถานะอื่นทั้งหมดมาจาก SLM

### 2.7 Released result — `results[]` (เพิ่มต่อท้ายเท่านั้น Portal ใช้รายการสุดท้ายเป็นผลปัจจุบัน)

| Field | Type | UI label | หมายเหตุ |
|---|---|---|---|
| `id` | string | — | |
| `releasedAt` | datetime | Released on | |
| `outcome` | enum | Badge ผลการรับรอง | `Qualified` / `Conditional` / `Not Qualified` / `Suspended` ส่วน `Expired` Portal คำนวณเองจาก `expiryDate < วันนี้` (SLM ไม่ต้องส่ง) |
| `tier` | string | Tier | ค่าว่างเมื่อ `Not Qualified` ชื่อ Tier ต้องตกลงกัน (ตอนนี้ mock เป็น `Tier 1/2/3`) |
| `tierNote` | string | ข้อความใน banner | |
| `approvedCategory` | string | Approved product category | |
| `approvedScope` | string | Qualification scope | |
| `effectiveDate`, `expiryDate` | date | Effective date, Expiry date | ว่างได้เมื่อ `Not Qualified` |
| `verified[]` | `{ criterionId, rating, visible }` | ตาราง Self-rating vs Verified rating | `rating` เป็นจำนวนเต็มในสเกลเดียวกับ `ratingScale` ถ้า `visible=false` Portal แสดง "Not released to suppliers" และไม่แสดงค่า |
| `feedback` | string | Feedback from SLM | เฉพาะที่อนุญาตให้ Supplier เห็น |
| `basedOnVersion` | integer | Based on submission | version ของการส่งที่ใช้ประเมิน (ตรงกับ `version` ใน 3.1) |

Suspend: ส่ง `results[]` รายการใหม่ที่ `outcome = Suspended` Portal แสดงผลล่าสุดเป็นระงับ

---

## 3. OUT: Portal → SLM (Supplier ส่ง)

### 3.1 Submission — 1 รายการต่อ 1 การส่ง/revision (immutable)

| Field | Type | หมายเหตุ |
|---|---|---|
| `ref` | string | Portal สร้าง `QS-YYYY-NNNN-V{n}` (จุดที่ควรให้ SLM เป็นผู้ออกเลขแทนหรือยืนยัน) |
| `version` | integer | 1, 2, … ใช้ป้องกันส่งซ้ำ (ส่งซ้ำ version เดิมถูกปฏิเสธ) |
| `kind` | enum | `Initial` / `Revision` |
| `revisesVersion` | integer? | version ที่ revision นี้แก้ไข |
| `infoRequestId` | string? | คำขอข้อมูลเพิ่มที่ตอบ |
| `submittedAt` | datetime | |
| `submittedBy` | string | ชื่อผู้ส่ง |
| `role` | enum | `Supplier Admin` / `Supplier User` / `Supplier Viewer` |
| `response` | object | ดู 3.2 |
| `profile` | object | ดู 3.5 (snapshot ณ วันส่ง) |

### 3.2 `response` (เงื่อนไขทางการค้า) — แท็บ Rate card ส่วน Commercial terms

| Field | UI label | Control | บังคับ | Validation |
|---|---|---|---|---|
| `currency` | Currency | select (`currencies`) | ✔ | ต้องอยู่ใน `currencies` ของคำขอ |
| `rateBasis` | Rate basis | select (`rateBases`) | ✔ | ต้องอยู่ใน `rateBases` ของคำขอ |
| `effectiveFrom` | Rates effective from | date | ✔ | |
| `validUntil` | Rates valid until | date | ✔ | ≥ `effectiveFrom` |
| `leadTimeDays` | Mobilisation lead time (days) | text | – | จำนวนเต็ม 0–365 |
| `paymentTermsDays` | Payment terms (days) | text | – | จำนวนเต็ม 0–365 |
| `escalationPct` | Annual rate escalation (%) | text | – | 0–100 ทศนิยมไม่เกิน 2 ตำแหน่ง |
| `overtimeWeekday` | Overtime multiplier · working day | text | – | 1–5 ทศนิยมไม่เกิน 2 ตำแหน่ง |
| `overtimeHoliday` | Overtime multiplier · holiday | text | – | 1–5 ทศนิยมไม่เกิน 2 ตำแหน่ง |
| `notes` | Other terms and conditions | textarea | – | ≤ 5000 ตัวอักษร |
| `declaration` | Declaration (checkbox) | checkbox | ✔ | ต้อง `true` ก่อนส่ง |

### 3.3 `response.skills[criterionId]` (1 รายการต่อ 1 `criteria.id`)

| Field | UI label | Control | บังคับ | Validation |
|---|---|---|---|---|
| `offered` | Does your company offer this skill? | radio Yes/No | ✔ | `""` ไม่ได้ / `No` ไม่ได้ถ้า `mandatory=true` |
| `selfRating` | Self-rating | select จาก `ratingScale` | ✔ ถ้า `offered=Yes` | ต้องเป็น `level` ที่มีใน `ratingScale` |
| `comment` | Comments / explanation | textarea | – | ≤ 2000 ตัวอักษร |
| `lines[]` | ตารางบรรทัดอัตรา | — | ✔ ถ้า `offered=Yes` | อย่างน้อย 1 บรรทัด |

`selfRating` เป็นค่าที่ Supplier ประกาศเอง **ไม่ใช่ verified rating** SLM ต้องเก็บแยกจาก Central Verified Rating และ Buyer Proposed Rating

`lines[]` (Rate line — 1 บรรทัดต่อ 1 ระดับ)

| Field | UI label | Control | Validation |
|---|---|---|---|
| `id` | — | — | key ของบรรทัด (Portal สร้าง) |
| `level` | Level | select จาก `ratingScale` | ✔ ห้ามซ้ำกันภายในทักษะเดียวกัน |
| `headcount` | Headcount | text | ✔ จำนวนเต็ม 1–100,000 |
| `avgYears` | Average years of experience | text | ✔ 0–60 ทศนิยมไม่เกิน 2 ตำแหน่ง |
| `rate` | Rate ({currency} / {rateBasis}) | text | ✔ > 0, ทศนิยมไม่เกิน 2 ตำแหน่ง, ≤ 10,000,000 |

Soft warning (ไม่บล็อก): อัตราของระดับสูงกว่าต่ำกว่าอัตราของระดับที่ต่ำกว่า

### 3.4 `response.evidence[]` (หลักฐาน)

| Field | UI | หมายเหตุ |
|---|---|---|
| `id` | — | key ของ link |
| `targetId` | การ์ดที่แนบ | `criteria.id` หรือ `requiredEvidence.id` |
| `docId` | — | อ้างอิงเอกสารใน Supplier Document repository (`DOC-NNNN`) |
| `docName`, `docType` | ชื่อ/ประเภทเอกสาร | snapshot ณ วันที่แนบ |
| `version` | `v{n}` | เวอร์ชันของเอกสารที่แนบ |
| `issue`, `expiry` | Issue date, Expiry date | `expiry` หมดอายุแล้ว = บล็อกการส่ง, ≤ 30 วัน = เตือน |
| `fileNames` | รายชื่อไฟล์ | ยังไม่ส่งไฟล์จริง |
| `note` | Note / Description | ≤ 500 ตัวอักษร |
| `addedAt`, `addedBy` | — | |

ฟอร์มอัปโหลดหลักฐานใหม่ (แท็บ Evidence)

| Field | UI label | บังคับ | Validation |
|---|---|---|---|
| name | Document name | ✔ | ≤ 255 ตัวอักษร ชื่อ+ประเภทซ้ำ = เพิ่มเป็นเวอร์ชันใหม่ ไม่สร้างเอกสารซ้ำ |
| type | Document type | ✔ | ต้องอยู่ใน `evidenceTypes`/`docTypes` ของการ์ดนั้น (ถ้ากำหนด) |
| issue | Issue date | – | ห้ามเป็นอนาคต |
| expiry | Expiry date | – | ≥ issue |
| note | Description | – | ≤ 500 |
| file | File | ✔ | PDF / JPG / JPEG / PNG ขนาด ≤ 5 MB ต่อไฟล์ |

ทางเลือกอื่นของแต่ละการ์ด: เลือกเอกสารที่มีอยู่แล้วใน Company Profile (Use a document from Company Profile)

### 3.5 `profile` (snapshot ของ Shared Supplier Profile ณ วันส่ง)

| Field | หมายเหตุ |
|---|---|
| `capturedAt` | datetime |
| `supplierId`, `company`, `registration` | |
| `contacts[]` | `{ name, role, email }` เฉพาะผู้ติดต่อที่ active |
| `sites[]` | `{ name, location, type }` |
| `categories[]` | `{ name, main, sub }` |
| `certifications[]` | `{ name, type, expiry, version }` จากเอกสารประเภท Quality Certification, Factory Documentation และมาตรฐานด้านสิทธิมนุษยชนที่ส่งแล้ว |

เงื่อนไขก่อนส่ง (Portal ตรวจ): ชื่อบริษัทและเลขทะเบียนไม่ว่าง, มีผู้ติดต่อ active ที่มีอีเมลอย่างน้อย 1 คน, มีโรงงานอย่างน้อย 1 แห่ง, มีหมวดสินค้าอย่างน้อย 1 หมวด

### 3.6 `response.replies` (ตอบ Additional information request)

key = `"{infoRequestId}:{itemIndex}"`, value = ข้อความตอบ (textarea "Your reply", บังคับทุก item เมื่อสถานะ `Additional Information Required`)

### 3.7 Acknowledge

Portal บันทึก `acknowledgedAt`, `acknowledgedBy` (ปุ่ม Acknowledge request) ยังไม่บังคับก่อนกรอก — รอยืนยัน

### 3.8 Audit trail (Portal เก็บ ส่งให้ SLM ได้ถ้าต้องการ)

`{ id, at, action, supplierId, requestId, ref, by, role, prev?, next? }`

`action` ที่มี: Acknowledge request, Save draft, Update self-assessment (prev/next = คะแนนเดิม/ใหม่), Attach evidence, Upload evidence, Replace evidence, Remove evidence, Submit qualification response, Submit revision, Respond to additional information request, View released result

---

## 4. UI ที่แสดงข้อมูลจาก SLM (สรุปว่า field ไหนไปโผล่ตรงไหน)

| แท็บ | ส่วน | Field ที่ใช้ |
|---|---|---|
| Overview | Request details | `id`, `buyer`, `productCategory`, `scope`, `requestedAt`, `dueDate`, `acknowledgedAt/By`, next action (Portal คำนวณจาก `status`) |
| Overview | Submission instructions | `instructions` |
| Overview | Additional information request | `infoRequests[]` |
| Overview | Skills and evidence required | `criteria[]` (`group`, `name`, `description`, `source`, `mandatory`, `evidenceRequired`) และ `requiredEvidence[]` |
| Overview | Rating scale | `ratingScale[]` |
| Overview | Status / Status history | `status`, `updated`, `history[]` (ข้อความอธิบายสถานะเป็นข้อความคงที่ของ Portal) |
| Overview | Latest submission | จากการส่งล่าสุดของ Portal |
| Rate card | การ์ดทักษะ | `criteria[]`, `ratingScale[]`, `currencies`, `rateBases` |
| Evidence | การ์ดหลักฐาน | `requiredEvidence[]`, `criteria[].evidenceRequired/evidenceTypes` (เฉพาะทักษะที่เลือก Yes) |
| Result | ทั้งหมด | `results[]` + ผลลัพธ์เทียบ Self-rating กับ Verified |
| History | Submissions and revisions | `submissions[]` ของ Portal |

ชื่อทักษะ, คำอธิบาย, คำแนะนำ, ข้อความ feedback แสดงตามที่ SLM ส่งมา (ไม่ผ่านการแปลของ Portal) ถ้าต้องการสองภาษาต้องตกลงรูปแบบ (เช่น ส่งเป็น `{ en, th }`)

---

## 5. ค่าอ้างอิงที่ SLM ต้องใช้ให้ตรงกับ Portal

| รายการ | ค่าที่ Portal รองรับ |
|---|---|
| `evidenceTypes` / `docTypes` | `Company Registration`, `Tax Documentation`, `Identity Document`, `Site Photos`, `Quality Certification`, `Factory Documentation`, `Insurance Certificate`, `Supplier Declaration`, `Product Evidence`, `Questionnaire Evidence`, `Other` |
| `rateBases` | `Hourly`, `Daily`, `Monthly` |
| `criteria.source` | `Central Standard`, `Buyer Custom` |
| `status` | ดูข้อ 2.6 |
| `outcome` | `Qualified`, `Conditional`, `Not Qualified`, `Suspended` |
| `infoRequests.status` | `Open`, `Responded` |
| Role | `Supplier Admin`, `Supplier User`, `Supplier Viewer` |
| ไฟล์หลักฐาน | PDF/JPG/JPEG/PNG, ≤ 5 MB |

### สิทธิ์ตามบทบาท (บังคับที่ service layer)

| การกระทำ | Admin | User | Viewer |
|---|---|---|---|
| ดูคำขอ/ผล | ✔ | ✔ | ✔ |
| แก้ Rate card / Acknowledge | ✔ | ✔ | – |
| แนบ/ลบหลักฐาน | ✔ | ✔ | – |
| Submit | ✔ | ตั้งค่าได้ (ตอนนี้ปิด) | – |

---

## 6. ตัวอย่าง payload ขา IN (ย่อ)

```json
{
  "id": "QR-2026-0012",
  "supplierId": "SUP-20481",
  "buyer": "Olivia Martin · Northstar Procurement",
  "productCategory": "Industrial Components",
  "scope": "Contract machining and assembly of valve components (Portland plant)",
  "requestedAt": "2026-11-03",
  "dueDate": "2026-11-30",
  "instructions": "Complete the rate card for every skill we list ...",
  "currencies": ["THB", "USD"],
  "rateBases": ["Hourly", "Daily", "Monthly"],
  "ratingScale": [{ "level": 1, "name": "Entry", "description": "..." }],
  "criteria": [{
    "id": "sk-cnc", "source": "Central Standard", "group": "Production & Fabrication",
    "name": "CNC machining", "description": "...", "instructions": "...",
    "mandatory": true, "evidenceRequired": false, "evidenceTypes": []
  }],
  "requiredEvidence": [{
    "id": "req-iso", "title": "Quality management certificate (ISO 9001 or equivalent)",
    "description": "...", "docTypes": ["Quality Certification"], "mandatory": true
  }],
  "status": "Requested",
  "updated": "2026-11-03",
  "history": [{ "status": "Requested", "at": "2026-11-03T09:00:00.000Z", "by": "SLM" }]
}
```

---

## 7. จุดที่ต้องตกลงกับทีม SLM ก่อนเชื่อมจริง

1. ใครออกเลข submission (`ref`) — ตอนนี้ Portal สร้าง `QS-YYYY-NNNN-V{n}`
2. สเกลคะแนนและนิยามระดับ (ตอนนี้ 1–5) และชื่อ/กฎการกำหนด Tier
3. verified rating ตัวไหนเปิดให้ Supplier เห็น (`visible`) และข้อความ feedback ที่อนุญาต
4. Supplier User ส่งได้หรือไม่ / ส่งช้าให้บล็อกหรือเตือน (ตอนนี้เตือน) / ต้อง acknowledge ก่อนกรอกหรือไม่ / Supplier ถอนคำขอเองได้หรือไม่
5. เพดานอัตรา (ตอนนี้ 10,000,000) และรายการสกุลเงิน
6. รูปแบบการส่งไฟล์หลักฐาน (ตอนนี้ส่งเฉพาะ metadata)
7. ข้อความสองภาษา (EN/TH) ของชื่อทักษะ คำอธิบาย และ feedback
8. หมวดสินค้าใช้ master data ชุดเดียวกับ Portal หรือไม่ (ตอนนี้จับคู่ด้วยข้อความ)
9. ส่ง Audit trail กลับ SLM หรือไม่
