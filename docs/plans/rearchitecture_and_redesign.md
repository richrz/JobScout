# JobScout "Prism" Overhaul: Implementation Plan

## 1. Vision & Philosophy: "Intentional Minimalism"
We are pivoting JobScout from a generic "Job Board" to a **Premium Candidate CRM**. The interface will be precision-engineered for the serious job seeker, creating a "Command Center" feel.

### Visual Language ("The King Mode" Aesthetic)
- **Theme Name:** `Deep Space / Frost Glass`
- **Base Colors:** Deep Slate (`#0f172a`), Charcoal (`#1e293b`). No pure black.
- **Accent Strategy:**
  - **Electric Green:** Growth, Money, Success (Matches).
  - **Sharp Cyan:** Active focus, Data points.
  - **Muted Purple:** Dormant/Waiting states.
- **Texture:** Glassmorphism 2.0. Subtle translucency on cards to show "data flow" underneath. High-quality blurs (`backdrop-filter: blur(12px)`).
- **Typography:** Inter or Geist Sans. Tight tracking, uppercase headers for "Military/Sci-Fi" precision.

---

## 2. Architecture: The Data "River"
*Problem:* Current state is polluted with mocks and disconnected features.
*Solution:* A strict, unified data pipeline.

### The Pipeline
1.  **Ingest Layer (Source)**
    - **Primary:** APIs (RapidAPI/JSearch, etc.).
    - **Secondary:** Controlled Scrapers (`src/lib/scrapers`).
    - *Action:* All incoming data lands in a `RawJob` buffer.
2.  **Normalization Layer (Refinery)**
    - **Geocoding:** Google Maps API to convert "NYC" -> `lat/lng`.
    - **Standardization:** Salary parsing, Remote status boolean.
    - **Deduplication:** Hashing `source + id`.
3.  **Persistence Layer (The Lake)**
    - **Technology:** Prisma + PostgreSQL.
    - **Rule:** The UI *never* imports mock data files. It *only* reads from the DB via API.
4.  **Presentation Layer (The Glass)**
    - Server Actions / API Routes fetch from Prisma.
    - Components render the data.

---

## 3. The "Candidate CRM" Workflow
The user journey is redesigned around the **"Mini-Workspace"** concept.

### Stage 1: The Feed (Triage)
- **Goal:** Inbox Zero.
- **UI:** A fast, keyboard-navigable list of incoming matches.
- **Actions:** `Trash` (Hide forever) or `Save` (Move to Workspace).
- **Mobile:** Read-only mode for rapidly clearing this queue on the go.

### Stage 2: The Workspace (The "Room")
- **Concept:** Every applied job is not a "row", it is a **Workspace**.
- **Features:**
  - **Artifact Locker:** Stores the *exact* PDF resume/cover letter sent.
  - **Notes.md:** Markdown editor for interview prep, recruiter names, phone numbers.
  - **Status Board:** Kanban status for this specific application.

### Stage 3: The Lifecycle (Automation)
- **The "Nag":** After 7 days of silence, card glows/prompts for follow-up.
- **The "Rot":** After 30 days of silence, card fades to "Dormant".
- **The "Archive":** After 60 days, auto-archive to keep the board fast.

### Stage 4: Command Center (Analytics)
- **Visuals:** High-impact charts (Recharts/Tremor) on the dashboard.
- **Metrics:** Velocity (Apps/Week), Conversion (Reply Rate), Pipeline Health.

---

## 4. Execution Roadmap

### Phase 1: The Purge & Pipe (Backend)
- [ ] **Audit:** Identify all `mock-data.ts` or stub files.
- [ ] **DB Schema:** Update Prisma schema to support `Workspaces`, `Artifacts`, and `LifecycleStatus`.
- [ ] **Data Flow:** rigorous test of `Ingest -> DB -> UI` path.

### Phase 2: The Shell (Design System)
- [ ] **Token System:** Define CSS variables for `Deep Space` theme.
- [ ] **Layout:** Build the new AppShell with the "Pill" nav and Glass cards.
- [ ] **Component:** Create the `GlassCard` and `NeonBadge` primitives.

### Phase 3: The Mechanics (Features)
- [ ] **Workspace UI:** Build the detail view with Markdown notes + File upload.
- [ ] **Triage Mode:** Build the "Swipe/Dismiss" interface for new jobs.
- [ ] **Dashboard:** Build the Analytics charts.

---

*Verified by:* Senior Frontend Architect (King Mode)
*Date:* December 20, 2025
