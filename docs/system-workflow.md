# Supplier Portal – System Workflow

Mermaid diagrams derived from the code in `web/src` (routes in `lib/routes.ts`, onboarding rules in `lib/onboarding.ts`, sample-request rules in `lib/policy.ts`). The prototype stores all data in the browser (no backend), so "Procurement" and "Buyer" actions are simulated by the demo tools.

## 1. System overview

```mermaid
flowchart TD
    Login([Supplier signs in]) --> Onb["/onboarding<br/>Supplier Onboarding"]
    Onb -->     Reg{"Registration<br/>submitted?"}
    Reg -- No --> Wizard["/onboarding/registration<br/>CoC + 4-step wizard"]
    Wizard --> Submit[Submit registration]
    Submit --> Profile[("Supplier profile<br/>created")]
    Reg -- Yes --> Unlocked

    subgraph Unlocked["Menus unlocked after registration"]
        Tasks["/onboarding/tasks/:id<br/>Onboarding tasks"]
        Samples["/sample-requests<br/>Sample Request"]
        Prof["/profile<br/>Company Profile"]
        Srm["/srm<br/>Supplier Relationship Mgmt"]
    end

    Profile --> Unlocked
    Prof -.reads.-> Profile
    Unlocked --> Aux["/notifications · /help"]
    Onb -.locked until registered.-> Samples
    Onb -.locked until registered.-> Prof
    Onb -.locked until registered.-> Srm
```

## 2. Onboarding stages (dashboard stepper)

```mermaid
flowchart LR
    A["1. Supplier registration"] --> B["2. Procurement review<br/>(simulated)"]
    A --> C["3. Your tasks<br/>(required tasks)"]
    C --> D["4. Awaiting announcement<br/>(simulated)"]
    B -. runs in parallel .- C
    D --> E([Pre-screening outcome shared])
```

## 3. Supplier registration

```mermaid
flowchart TD
    Start([Open registration]) --> Coc["CoC and T&D screen"]
    Coc -->     Accept{"Accepted?"}
    Accept -- No --> Coc
    Accept -- Yes --> S1

    S1["Step 1 · General information<br/>company, contacts, owner,<br/>address, map coordinates"] --> V1{"Required fields<br/>valid?"}
    V1 -- No --> E1["Show errors and focus first error"] --> S1
    V1 -- Yes --> S2

    S2["Step 2 · Important documents<br/>list depends on company type"] --> V2{"Files valid?<br/>PDF/PNG/JPG, max 5 MB,<br/>max 5 files, expiry date"}
    V2 -- No --> E2["Show errors"] --> S2
    V2 -- Yes --> S3

    S3["Step 3 · Product categories<br/>main / sub / material group,<br/>details, catalog"] --> V3{"Valid?"}
    V3 -- No --> E3["Show errors"] --> S3
    V3 -- Yes --> S4
    S3 -. "add / remove category" .-> S3

    S4["Step 4 · Review information"] -- Edit --> S1
    S4 --> Confirm{"Confirm submit?"}
    Confirm -- No --> S4
    Confirm -- Yes --> Apply["applyRegistration()<br/>write profile, contacts,<br/>factories, products, documents"]
    Apply --> Done(["Status = Submitted<br/>tasks and menus unlock"])
```

## 4. Onboarding tasks (gating rules)

```mermaid
flowchart TD
    Reg([Registration submitted]) --> T1
    Reg --> L1

    subgraph SG["Group A · Sustainable sourcing & supplier selection"]
        T1["Task 1 · Sourcing policy<br/>3 activities"] --> Risk{"Any inherent risk<br/>rated High?"}
        Risk -- Yes --> T2["Task 2 · Sustainability risk<br/>assessment"]
        Risk -- No --> Skip["Task 2 not required"]
        T2 --> T3
        Skip --> T3["Task 3 · Supplier selection<br/>questionnaire"]
    end

    subgraph TG["Group B · Thai labor standard (มรท.)"]
        L1["Step 1 · TLS e-Learning<br/>5 items"] --> L2["Step 2 · Commitment letter<br/>F-TLS-02"]
        L2 --> L3["Step 3 · Self-assessment<br/>F-TLS-01"]
    end

    T3 --> AllDone{"All required<br/>tasks complete?"}
    L3 --> AllDone
    AllDone -- Yes --> Ann["Stage: Awaiting announcement"]
    AllDone -- No --> Wait["Stay on dashboard"]
```

Group A and Group B are independent of each other; inside each group the next step stays locked until the previous one is complete.

### 4.1 Task 1 – Sourcing policy

```mermaid
flowchart TD
    V["Activity 1 · Watch e-learning video"] --> VD{"Video marked<br/>complete?"}
    VD -- No --> V
    VD -- Yes --> P1["Progress 1/3"]
    P1 --> C["Activity 2 · Tick consent and accept document"]
    C --> P2["Progress 2/3"]
    P2 --> Q["Activity 3 · Knowledge check<br/>(answer all questions)"]
    Q --> Conf{"Confirm submit?"}
    Conf -- No --> Q
    Conf -- Yes --> Score{"Score at least 80 percent?"}
    Score -- Yes --> P3(["Progress 3/3 · passed<br/>unlocks risk assessment / questionnaire"])
    Score -- No --> Fail["Not passed"] --> Retry["Try again<br/>(answers reset, stays 2/3)"] --> Q
```

### 4.2 Task 2 – Sustainability risk assessment

```mermaid
flowchart TD
    Start([Open task]) --> Calc["Inherent risk per topic<br/>from product category"]
    Calc -->     High{"Topic rated High?"}
    High -- Yes --> Ans["Answer topic assessment"] --> Next{"More High topics?"}
    Next -- Yes --> Ans
    Next -- No --> Done
    High -- No --> NA["No assessment needed"]
    Done{"All answered?"} -- No --> Ans
    Done -- Yes --> Submit["Submit · progress 1/1"]
    Submit --> Level["Calculated residual risk level"]
```

### 4.3 Task 3 – Supplier selection questionnaire

```mermaid
flowchart LR
    Q["Answer each question Yes / No"] --> Doc{"Document<br/>required?"}
    Doc -- Yes --> Up["Choose document type<br/>and upload PDF"]
    Doc -- No --> Note
    Up --> Note["Optional note"]
    Note --> Complete{"All answered?"}
    Complete -- No --> Q
    Complete -- Yes --> Sub(["Submit questionnaire · 1/1"])
```

### 4.4 Thai labor standard (มรท.)

```mermaid
flowchart TD
    subgraph E["Step 1 · e-Learning (5 items)"]
        I1["Item 1 – video"] --> I2["Item 2 – PDF"] --> I3["Item 3 – video"] --> I4["Item 4 – PDF"] --> I5["Item 5 – PDF"]
        I1 -. accept each item before Next .- I2
    end
    I5 --> Done1{"5 of 5 accepted?"}
    Done1 -- Yes --> F2

    subgraph F["Step 2 · Commitment letter F-TLS-02"]
        F2["Read letter"] --> Acc{"Accepted?"}
        Acc -- Yes --> M{"Signing method"}
        M -- Signed --> AX["Sign with AXONS Sign"]
        M -- Download --> DL["Download, sign by hand,<br/>upload signed PDF"]
        AX --> Sub2
        DL --> Sub2["Submit"]
    end
    Sub2 --> A1

    subgraph G["Step 3 · Self-assessment F-TLS-01"]
        A1["Section 1 · general info<br/>workforce counts, TLS 8001 certificate"] --> A2["Section 2 · 21 questions"]
        A2 --> A3["Section 3 · system-calculated<br/>score and pass / fail"]
    end
    A3 --> Sub3(["Submit · 1/1"])
```

## 5. Sample request

```mermaid
flowchart TD
    List["/sample-requests<br/>tabs: All · Action required ·<br/>Under review · Completed"] --> New["/sample-requests/new<br/>4-step wizard"]
    List --> Detail["/sample-requests/:id"]

    subgraph W["Create request (supplier-initiated)"]
        N1["1. Request and product information"] --> N2["2. Sample details"] --> N3["3. Delivery and documents"] --> N4["4. Review and submit"]
    end
    New --> N1
    N4 --> Sub["Status → Submitted"]

    Buyer(["Buyer creates request<br/>(Awaiting Submission / Draft)"]) --> List
    Detail --> CanSubmit{"Can submit?<br/>Awaiting Submission, Draft,<br/>Action Required,<br/>Resubmission Required"}
    CanSubmit -- Yes --> SubmitPage["/sample-requests/:id/submit<br/>physical, digital or onsite review form"]
    SubmitPage --> Sub
    Detail --> Respond["/sample-requests/:id/respond<br/>reply to buyer's request"]
    Respond --> Review
    Sub --> Review["Under Review"]
```

### 5.1 Sample request status lifecycle

Transitions are enforced by `transition()` in `lib/policy.ts`.

```mermaid
stateDiagram-v2
    [*] --> AwaitingSubmission
    [*] --> Draft
    AwaitingSubmission: Awaiting Submission
    UnderReview: Under Review
    ActionRequired: Action Required
    AwaitingSample: Awaiting Sample
    SampleReceived: Sample Received
    UnderEvaluation: Under Evaluation
    ResubmissionRequired: Resubmission Required

    AwaitingSubmission --> Draft
    AwaitingSubmission --> Submitted
    AwaitingSubmission --> UnderReview
    Draft --> Submitted
    Draft --> UnderReview
    Draft --> Cancelled
    Submitted --> UnderReview
    Submitted --> AwaitingSample
    Submitted --> ActionRequired
    Submitted --> Approved
    Submitted --> Rejected
    UnderReview --> ActionRequired
    UnderReview --> AwaitingSample
    UnderReview --> UnderEvaluation
    UnderReview --> Approved
    UnderReview --> Rejected
    AwaitingSample --> SampleReceived
    AwaitingSample --> ActionRequired
    AwaitingSample --> Cancelled
    SampleReceived --> UnderEvaluation
    SampleReceived --> ActionRequired
    UnderEvaluation --> ActionRequired
    UnderEvaluation --> ResubmissionRequired
    UnderEvaluation --> Approved
    UnderEvaluation --> Rejected
    ActionRequired --> UnderReview
    ActionRequired --> Submitted
    ActionRequired --> ResubmissionRequired
    ResubmissionRequired --> UnderReview
    ResubmissionRequired --> Submitted
    Approved --> [*]
    Rejected --> [*]
    Cancelled --> [*]
```

## 6. Company Profile and SRM

```mermaid
flowchart LR
    subgraph P["/profile · tabs"]
        P1[Company information]
        P2[Contacts]
        P3[Manufacturing sites]
        P4[Important documents]
        P5[Products]
        P6[Risk assessment]
    end
    subgraph S["/srm · tabs"]
        S1[Project Management]
        S2[GHG Emission Reduction]
        S3[Human Rights]
        S4[Governance]
    end
    Reg([Registration data]) --> P1 & P2 & P3 & P4 & P5
    Risk([Onboarding risk assessment]) --> P6
    P3 -. "Add site dialog" .-> P3
```

## 7. Data and state (prototype)

```mermaid
flowchart LR
    UI["Next.js pages and components"] --> Store["usePortal() store<br/>mutate(), toast()"]
    Store --> DB[("Db object<br/>profile · registration · onboarding ·<br/>requests · srm")]
    DB <--> LS[("Browser localStorage")]
    UI --> I18n["useI18n() · EN/TH<br/>lib/messages*.ts"]
    Demo["Demo tools:<br/>Fill demo data · Simulate review,<br/>announcement, buyer interest · Reset"] --> Store
```
