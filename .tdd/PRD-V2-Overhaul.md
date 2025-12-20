# JobScout V2 - Product Requirements Document (Delta)

**Version:** 2.0 (The "Deep Space" Pivot)  
**Status:** In Progress  
**Scope:** Rearchitecture and Redesign of existing MVP.

---

## 1. Problem Statement & Pivot
**Current State:** The application works as a basic job board (MVP) but lacks visual cohesion ("too green/cartoony") and data integrity (polluted with mocks). The workflow is linear and does not support the complex, multi-stage nature of serious job hunting.
**The Pivot:** We are transforming JobScout into a **Candidate CRM**. It is no longer just about *finding* jobs, but *managing the campaign* to get them.

---

## 2. Core Functional Requirements (Deltas)

### 2.1 Backend: "Purge & Pipe"
*Existing:* Mixed real/mock data in `job-scrapers.ts` and `resume-generator.ts`. Fragile DB connection.
*Requirement:*
*   **ERADICATE** all mock logic from production code paths. Mocks must only exist behind strict `NEXT_PUBLIC_MOCK_MODE` gates.
*   **HARDEN** the Prisma/Postgres connection logic to be container-aware and resilient (retries).
*   **UNIFY** the Ingest Pipeline: `Raw API Data -> Geocoding/Normalization -> Prisma -> UI`. The UI must *never* generate its own job data.

### 2.2 Workflow: The "Mini-Workspace" Model
*Existing:* Save job -> Apply (Button) -> Done.
*Requirement:*
*   **Workspace Creation:** Applying to a job spawns a dedicated "Workspace" (Application Record).
*   **Artifact Locker:** The Workspace must store the *exact* PDF resume and Cover Letter version sent to that employer.
*   **Notes & Strategy:** Each Workspace includes a Markdown-based "War Room" for user notes, recruiter contacts, and strategy plotting.
*   **Lifecycle Automation:**
    *   **7-Day Nag:** Applications with no activity for 7 days trigger a "Follow-up" alert.
    *   **30-Day Rot:** Applications silent for 30 days degrade to "Dormant".
    *   **60-Day Archive:** Dormant apps auto-archive out of the active view.

### 2.3 Interface: "Deep Space" Aesthetic
*Existing:* Generic "Bootstrap/Green" theme.
*Requirement:*
*   **Theme:** "Deep Space" (Slate-950), "Frost Glass" (Translucent surfaces), "Electric Green" (Success accents only).
*   **Navigation:** Replace sidebar with a "Pill" floating interface.
*   **Data Visualization:** Integrate high-fidelity charts (Recharts/Tremor) for campaign velocity and pipeline health.

---

## 3. User Stories (The "King Mode" Persona)

*   **US.V2.1 (The Purge):** As a developer, I want to remove all ad-hoc random mock data so that the UI only displays truth from the database.
*   **US.V2.2 (The Triage):** As a user, I want to quickly scan "New Jobs" and hit a key to "Trash" or "Workspace" them, clearing my inbox to zero.
*   **US.V2.3 (The War Room):** As a user, I want to open an Application Workspace and see exactly what document I sent them, so I don't look stupid during the phone screen.
*   **US.V2.4 (The Pulse):** As a user, I want to see a "Velocity Graph" on my dashboard that shows how many apps I sent this week versus last week.

---

## 4. Integration Strategy (Task Master)
We will NOT restart at Task 1. We will continue from the current high-water mark (Task 32).
All V2 work will be grouped under a new **Tag: `v2-overhaul`**.

**Proposed Task Integration:**
*   **Task 33:** Phase 1 - Backend Purge & Connection Hardening (Req 2.1)
*   **Task 34:** Phase 2 - "Deep Space" Design System & Shell (Req 2.3)
*   **Task 35:** Phase 3 - Workspace Data Model & Artifacts (Req 2.2)
*   **Task 36:** Phase 4 - Workspace UI & Note Taking (Req 2.2)
*   **Task 37:** Phase 5 - Triage Feed & Analytics (Req 2.2)
