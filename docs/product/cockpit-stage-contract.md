# Cockpit Stage Contract

**Status:** Active  
**Purpose:** Defines the inbound/work/outbound contract for every pipeline stage, the workspace surface model, and cross-stage editing rules.

---

## Core Principle

Every stage follows the same contract:

| Dimension       | Definition                                                        |
| :-------------- | :---------------------------------------------------------------- |
| **Inbound**     | What the previous stage produced — visible as context sidebar     |
| **Work**        | What the user does here — the active work panel                   |
| **Artifacts**   | Documents created or received at this stage                       |
| **Transition**  | An explicit action with a clear verb that moves to the next stage |
| **Outbound**    | What carries forward — notes, artifacts, and context              |

The workspace never loses history. Each stage section collapses into the context sidebar as the opp advances, so the user always has the full story.

---

## Universal Workspace Features

These features are available in **every** stage workspace, regardless of the stage-specific tools.

### Block-Based Notes Engine (BlockNote)

Every workspace includes a generous, always-available block-based notes surface powered by BlockNote. This is the **primary surface** of the workspace — not a tiny textarea tucked at the bottom.

Capabilities:
- Slash commands (`/heading`, `/bullet`, `/todo`, `/callout`, `/divider`)
- Drag-to-reorder blocks
- Inline formatting toolbar (bold, italic, link, code, highlight)
- Notion-like block feel without being Notion
- Content persists per-opportunity, per-stage

The structured widgets (artifact cards, timelines, contact info) float alongside or above the notes surface, but the user should always feel like "I can just write here."

### Stage Toolbar

Each workspace gets a **contextual toolbar** at the top of the workspace panel. Not a heavy ribbon — a slim action bar with the things *this stage* cares about.

Rules:
- Stage-specific actions sit on the left
- The **forward-transition verb** is always the rightmost button — it is the "move forward" action for that stage
- Toolbar actions can open drawers, inline widgets, or trigger state changes
- Toolbar composition is defined per-stage below

---

## Stage Definitions

### NEW (Ingestion Landing Zone)

**Inbound:** Batch of normalized jobs from refresh sources. Each has: company, role, location, salary range, match score, key highlights. No user input yet — these are system-provided.

**Toolbar:** `Launch Swipe Mode` · `Filter Batch` · `Yes, I'm Interested →`

**What's Here:**
- Browse/filter the batch (cards with match score, highlights, salary)
- `Launch Swipe Mode` button — primary triage interaction
- Individual `Yes, I'm Interested` button per card for non-swipe users

**Swipe Mode Behavior:**
- Swipe right → "Interested" (not "Save")
- On right-swipe, a prompt appears: *"What caught your eye about this one?"* — free text, optional but encouraged
- Below that, a notes area for additional first impressions
- Swipe left → Pass (recoverable from Passed Bin)

**Artifacts:** None created here. Source job data only.

**Transition:** Right-swipe confirmation or `Yes, I'm Interested` click. The opp moves to INTERESTED. The note (if written) is saved as the first entry in the workspace's Interested stage journal.

**Outbound:** The opportunity card + any first-impression notes captured during triage.

---

### INTERESTED (Why This One Matters)

**Inbound:** Opp card + first-impression notes from NEW/Swipe. The workspace opens with those notes already visible — the user sees continuity from their swipe decision.

**Toolbar:** `Add Note` · `Research Company` · `Start Crafting →`

**What's Here:**
- The "What caught your eye" note from NEW is the first journal entry — the seed
- Fit assessment: why pursue this one, concerns, excitement level
- Company research notes
- Role analysis notes
- User expands on the seed here with depth: fit reasoning, concerns, research findings

**Artifacts:** None created here. Notes are the primary artifact.

**Transition:** `Start Crafting` button. Signals: I'm done evaluating, time to build the application package.

**Outbound:** All interested-stage notes (fit reasoning, concerns, research) flow forward as context sidebar in the CRAFTING workspace. These inform resume tailoring — the AI can reference why the user is excited about this role.

---

### CRAFTING (Build the Application Package)

**Inbound:** Interested-stage notes (fit reasoning, concerns, highlights). These become the context panel that guides resume generation.

**Toolbar:** `Generate Resume` · `Open Resume Studio` · `View Keywords` · `Fact Lock` · `Mark as Applied →`

**What's Here:**
- Resume generation — `Generate` button produces a tailored resume (PDF/DOCX artifact appears as a document card in the workspace)
- Resume variant management (Technical, Leadership, etc.)
- Cover letter draft
- Keyword coverage overlay
- Voice tuning controls
- Generated documents appear as artifact cards with preview, download, and version history
- `Open Resume Studio` opens the full BlockNote-powered resume editor in a **drawer** that slides over the cockpit (see Drawer Pattern below)

**Document Behavior:** When user clicks `Generate`, a document artifact materializes in the workspace — visible as a card with file type icon, name, version, and preview. Multiple generates create versions (v1, v2, v3). The user can see the progression.

**Artifacts:** Resume drafts (PDF/DOCX), cover letters. These are workspace-owned documents.

**Transition:** `Mark as Applied` — requires selecting which resume variant was submitted and where. Creates an immutable snapshot. Source link is revealed here.

**Outbound:** Immutable submission package (exact resume sent, cover letter if any, submission date, source/channel).

---

### APPLIED (What Was Sent and Where)

**Inbound:** Immutable snapshot of what was submitted — the exact PDF/DOCX, where it was sent, when.

**Toolbar:** `Review Resume (read-only)` · `Log Follow-up` · `Heard Back →`

**What's Here:**
- Read-only view of the submitted package (can't edit — it's what the employer has)
- Source link and application channel
- "Waiting" status with date tracking (days since applied)
- Space for follow-up notes ("Sent follow-up email on 3/15")

**Cross-Stage Editing Rule:** If the user wants to edit their resume from this stage, the toolbar surfaces an `Edit Resume` action with the warning: *"Editing this resume will move this opp back to Crafting."* See Cross-Stage Editing Rules below.

**Artifacts:** Submitted resume snapshot (immutable), follow-up log entries.

**Transition:** `Heard Back` or `Screening Scheduled` — indicates employer engagement has started.

**Outbound:** Submitted package context + any follow-up notes. The screener/recruiter now has context on what was sent.

---

### SCREENING (First Employer Contact)

**Inbound:** What was submitted + follow-up history from APPLIED.

**Toolbar:** `View Submitted Resume` · `Add Call Notes` · `Interview Scheduled →`

**What's Here:**
- Recruiter name and contact info
- Call/screen notes
- Next steps and date tracking
- Questions they asked, answers given

**Artifacts:** Screening call notes, recruiter contact card.

**Transition:** `Interview Scheduled` — formal interview process begins.

**Outbound:** Screening notes, recruiter contact, questions asked (helps prep for deeper interviews).

---

### INTERVIEW (Deep Engagement)

**Inbound:** Everything from screening — recruiter info, initial questions, submitted package.

**Toolbar:** `Prep Materials` · `View Resume Sent` · `Add Round Notes` · `Offer Received →`

**What's Here:**
- Interview prep materials (generated or manual)
- Questions asked per round
- User's answers and reflections
- Thank-you note drafts
- Follow-up tracking
- Multi-round support (Round 1, Round 2, Final)

**Artifacts:** Prep docs, round-by-round notes, thank-you drafts.

**Transition:** `Offer Received` — terms entry.

**Outbound:** Full interview history, contacts, the complete journey context for decision-making.

---

### OFFER (Decision Time)

**Inbound:** The entire journey — from first impression through interviews.

**Toolbar:** `View Journey` · `Compare Offers` · `Accept ✓` · `Decline ✗`

**What's Here:**
- Offer terms (salary, equity, benefits, start date)
- Negotiation notes
- Decision factors (pros/cons)
- Comparison view if multiple offers exist

**Artifacts:** Offer letter/terms document, negotiation log, decision notes.

**Transition:**
- **Accept** → confirmation dialog, confetti, campaign wind-down prompt
- **Decline** → workspace preserved, opp stays visible in archive

**Outbound:** Final decision record. Accepted offers trigger campaign wind-down suggestions for other active opps.

---

## Cross-Stage Editing Rules

### The "Warn and Move" Model (v1)

When a user is in a later stage and wants to perform work that belongs to an earlier stage, the system is honest about it:

- The toolbar shows the action (e.g., `Edit Resume` from APPLIED)
- Clicking it surfaces a clear warning: *"Editing this resume will move this opp back to Crafting. Your submitted snapshot will be preserved in history."*
- On confirmation, the opp moves back to the earlier stage
- The submitted snapshot remains in the stage history — it is never deleted
- The user can re-advance through the pipeline after making changes

**Why this model:** It preserves the integrity of the pipeline. If you're editing a resume, you're crafting — the stage should reflect the truth of what you're doing.

### Future Enhancement (v2): Fork Variant

In a future version, the system could allow creating a *new variant* without moving stages:
- The submitted version stays locked
- A new "v2" draft is created in the workspace
- The opp stays in its current stage
- Useful when refining for other opportunities, not re-applying to this one

This is explicitly deferred to v2.

---

## Drawer Pattern for Heavy Editors

Full-featured editors (Resume Studio, Cover Letter Editor, Prep Material Generator) open as **drawers** that slide over the cockpit rather than navigating to separate pages.

### How It Works:
1. User clicks a toolbar action (e.g., `Open Resume Studio`)
2. A full-width drawer slides in from the right (or bottom on mobile), overlaying the cockpit
3. The cockpit remains *underneath* — not navigated away from
4. The drawer has its own close button and responds to `Esc`
5. Closing the drawer returns the user to exactly where they were in the workspace
6. Changes made in the drawer are immediately reflected in the workspace when the drawer closes

### Why Drawers, Not Pages:
- The cockpit stays the home base — the user never feels like they "left"
- Context is preserved — the opportunity, stage, and notes are all still there when the drawer closes
- Heavy editors get the full screen space they need without being crammed into a side panel
- No page navigation means no loading states, no lost scroll position, no "back button confusion"

### What Opens in Drawers:
- Resume Studio (BlockNote-powered full document editor)
- Cover Letter Editor
- Interview Prep Generator
- Offer Comparison View (when comparing multiple offers)

### What Stays Inline:
- Notes (always inline in the workspace)
- Quick edits (summary tweaks, skill toggles)
- Follow-up logs
- Contact info entry
- Stage transition actions

---

## Artifact Lifecycle

### Creation
Artifacts are created at the stage where the work happens:
- **CRAFTING** creates resume drafts and cover letters
- **APPLIED** creates the immutable submission snapshot (automatically on transition)
- **SCREENING** creates recruiter contact cards
- **INTERVIEW** creates prep docs and round notes
- **OFFER** creates the terms/decision record

### Visibility
Artifacts from previous stages are always visible in the context sidebar. They collapse as the opp advances but never disappear.

### Immutability
Once an opp moves past APPLIED, the submitted artifact is **locked**. It represents what the employer received. Even if the user's master profile changes, this snapshot is preserved.

### Versioning
In CRAFTING, multiple `Generate` actions create versioned artifacts (v1, v2, v3). The user can see the progression and choose which version to submit.

---

## Design Reference

This contract governs the workspace behavior described in:
- [Cockpit Interaction Spec](./cockpit-interaction-spec.md)
- [Cockpit Migration Plan](../plans/cockpit-migration-plan.md)
- [Workspace Lifecycle Concept](./workspace-lifecycle-concept.md)
- [Resume Customization Product Spec](./resume-customization-product-spec.md)
