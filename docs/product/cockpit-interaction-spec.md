# The Cockpit — Interaction Specification

**Status:** Active  
**Date:** 2026-03-09  
**Purpose:** Define the living-system interaction model for JobScout's unified experience

## Design Sentence

A mission control room where your career is happening live — opportunities arriving, applications moving through stages, your momentum visible as actual motion, not frozen numbers in rectangles. The page breathes: pipeline items physically travel between stages, and when you click something it doesn't "open a new page" — it expands and transforms in place like you're zooming into a deeper layer of the same living system. There is no menu — the dashboard IS the app; every surface is a live lens into the same flowing river of jobs, and acting on anything (filtering, swiping, applying) ripples visibly across every other surface because they all share one living state, not separate dead pages.

## Emotional Contract

- **Calm control within chaos.** Millions of jobs exist. In this cockpit, everything is manageable and almost fun.
- **Confidence through presentation.** The UI should scream competence — the user feels like they have an unfair advantage.
- **Alive, not static.** Motion is not decoration. Motion shows the system working.
- **Desktop-first.** Mobile is a companion for triage and quick actions, not the primary workspace.

---

## Lifecycle Pipeline

The canonical opportunity lifecycle:

```
NEW → INTERESTED → CRAFTING → APPLIED → SCREENING → INTERVIEW → OFFER
```

### Stage Definitions

| Stage | Meaning | Primary Action |
|-------|---------|----------------|
| **NEW** | Normalized, deduped, available for triage | Browse, filter, swipe |
| **INTERESTED** | User wants to pursue this opportunity | Save notes on why, first impressions |
| **CRAFTING** | Actively building the application package | Resume generation, cover letter, keyword tuning, voice adjustments |
| **APPLIED** | Submitted through employer channel | Immutable snapshot of what was sent; source revealed here |
| **SCREENING** | Recruiter or early-stage activity | Call notes, recruiter contacts, next steps |
| **INTERVIEW** | Interview-stage activity | Prep materials, questions, answers, follow-ups |
| **OFFER** | Offer received | Terms, negotiation notes, decision factors |

### Terminal States Under OFFER

| State | Trigger | Behavior |
|-------|---------|----------|
| **DECLINED** | User passes on the offer | Workspace preserved. Business as usual. Opportunity stays visible. |
| **ACCEPTED** | User accepts the offer | Confirmation dialog → confetti celebration → campaign wind-down prompt ("Close your other active opportunities?") |

### Recoverable States

| State | Meaning |
|-------|---------|
| **PASSED** | Removed from active view but restorable. Not deletion. |
| **WITHDRAWN** | User ended pursuit after previously moving forward |
| **REJECTED** | Employer closed the opportunity |
| **ARCHIVED** | Retained for history and search, no longer active |

---

## Screen Architecture

### What the cockpit replaces

The current menu-based navigation (Dashboard, Inbox, Passed Bin, JobSwipe, Pipeline, Career, Resumes, Settings) is collapsed into one living screen with two focused breakout modes.

### The Cockpit (single primary screen)

Everything below lives on one page. No menu switching. No sidebar navigation — the cockpit is fullscreen. The sidebar nav that exists today (Dashboard, Inbox, Pipeline, etc.) does not appear on the cockpit. The only remaining nav surface is Settings and Profile/Voice Setup, accessed from a minimal header or settings icon.

#### 1. Recent Activity — Jump Back In

Shows exactly where the user left off:
- The resume they were editing
- The opportunity they were prepping for
- The interview coming up
- One click to resume work

This is the gravity center. It re-orients the user back to work-mode immediately.

#### 2. While You Were Out (discovery feed)

Below the hero. Shows what changed since the user's last session:
- New matches against saved filters, with confidence scoring
- Presented as controlled calm within chaos:
  - "4,327 new jobs posted in KC."
  - "18 match your profile."
  - "3 are 90%+ fit."
  - "Want to swipe the top ones?"
- Tapping the swipe prompt enters Swipe Mode (see breakout #1)

#### 3. The River (persistent pipeline)

A horizontal lane always visible on the cockpit. Jobs flow left to right through stages:
- **NEW** count + top matches
- **INTERESTED** cards
- **CRAFTING** cards (active workbenches)
- **APPLIED** cards
- **SCREENING** cards
- **INTERVIEW** cards
- **OFFER** cards

The user sees their entire campaign at a glance. Cards are alive — they show recency, pending actions, and urgency. Items moving between stages should animate physically to show the flow.

#### 4. Embedded Analytics

Pipeline health, response rates, and momentum visualizations live directly in the cockpit. Not a separate "Career Data" page. These are expandable sections with animated charts, not static card grids.

#### 5. Passed Bin

Not a separate page. A filter toggle on the pipeline view that reveals passed opportunities inline. Restore action snaps them back into the river.

### Breakout #1: Swipe Mode

- Full-screen immersive triage
- Entered FROM the cockpit ("Swipe your top matches"), not from a menu
- When done, user lands back in the cockpit with pipeline updated
- Decisions ripple visibly — saved jobs appear in INTERESTED, passed jobs fade

**Mobile-appropriate.** Swipe Mode is the primary mobile interaction alongside quick-generate.

### Breakout #2: Resume Studio

- Deep Notion-like editing workspace
- NOT reached by clicking "Resumes" in a sidebar
- Reached by expanding a workspace's CRAFTING section
- Always remembers which opportunity brought you here
- Contains: resume draft editor, cover letter, keyword coverage overlay, voice tuning, generate button, transparent diff
- The generate button lives HERE, not on a separate resume page

**Desktop-only for deep tailoring.** Mobile can trigger a quick generate but voice tuning and detailed editing are desktop experiences.

### Remaining separate pages (minimal)

| Page | Why it can't fold in |
|------|---------------------|
| **Settings** | Necessary infrastructure. Minimal. |
| **Profile / Voice Setup** | ToneAdjust onboarding, voice sample management. Visited rarely, needs focused space. |

Everything else folds into the cockpit or enters through workspace expansion.

---

## Workspace Model

### One workspace per opportunity

Every opportunity gets exactly one workspace. The workspace is the canonical home for all notes, documents, and history across the full lifecycle.

### Workspace is card-owned, not navigation-accessed

Workspace is **not** a top-level page, tab, or menu item. It is always opened by clicking the specific pipeline card it belongs to. Each card carries its own workspace — clicking the card is the only entry point. This is intentional: it bundles everything the user needs for that opportunity in one place, opened from the context of where they were working.

- There is no "go to Workspace" button in the nav.
- There is no generic workspace page.
- Clicking a card → that card's workspace expands in-place.
- Closing the workspace → returns exactly to where the card was in the pipeline.

### Stage sections inside the workspace

Each stage has its own section template. When a user clicks a card in any pipeline stage, the workspace expands in-place (shared element transition — the card morphs into the panel). The section shown matches the current stage:

| Stage | Section Template Contains |
|-------|--------------------------|
| **INTERESTED** | Why you saved it. First impressions. Fit notes. |
| **CRAFTING** | Resume draft. Cover letter. Generate button. Keyword overlay. Voice tuning. AI guidance. |
| **APPLIED** | Submission record. What was sent (immutable snapshot). Where it was sent. Source link revealed. |
| **SCREENING** | Call notes. Recruiter name and contact. Next steps. Date tracking. |
| **INTERVIEW** | Prep materials. Questions asked. Your answers. Thank-you notes. Follow-up tracking. |
| **OFFER** | Offer terms. Negotiation notes. Decision factors. Accept/Decline actions. |

Sections from previous stages remain accessible as collapsed history within the workspace. Context flows forward — nothing is lost when an opportunity moves stages.

### Shared element transitions

- Clicking a pipeline card → card physically expands into the workspace panel
- Closing the workspace → panel contracts back into the card
- Moving an opportunity between stages → card visually travels to the new column
- These transitions are not decorative — they maintain spatial orientation so the user never feels lost

---

## Source Visibility Strategy

### During discovery and triage (NEW, INTERESTED, CRAFTING)

Show:
- Employer name
- Job title
- Location
- Salary range
- Match score
- Date posted

Hide:
- Job board source (Indeed, LinkedIn, Jobot, etc.)

### When applying (transition to APPLIED)

Reveal:
- Source link and application instructions
- Framed as: "Apply at: [Employer Career Page]" or "Found via: Jobot → [direct link]"
- Source feels like a tool for the user, not advertising for the competition

### Rationale

The user chose JobScout as their cockpit. Showing "Indeed" or "LinkedIn" during browsing advertises competitors and breaks the feeling of calm control. Source is revealed when it's actually useful — when the user needs to know where to submit.

---

## Motion Language

Motion is how the cockpit communicates that the system is alive. These are not animations for visual polish — they carry information.

### Required motion behaviors

| Behavior | What it communicates |
|----------|---------------------|
| Pipeline cards physically slide between columns | An opportunity is progressing |
| New match cards arrive with a subtle entrance animation | The system found something while you were away |
| "While you were out" counter ticks up on load | The world kept moving; your cockpit caught it |
| Workspace expand/contract (shared element) | You're zooming into depth, not leaving the page |
| Progress bars animate on load | Your momentum is real and measurable |
| Confetti on offer acceptance | You won. The system celebrates with you. |
| Swipe results ripple back to the pipeline | Your triage decisions are immediately real |

### Motion that should NOT exist

| Anti-pattern | Why |
|--------------|-----|
| Parallax scrolling | Decoration, not information |
| Floating particles | Looks cool, communicates nothing |
| Hover-only glow effects | Not accessible, not mobile-friendly |
| Animated backgrounds | Distracts from the mission control feeling |

---

## Mobile Strategy

### Mobile-appropriate workflows

| Workflow | Mobile behavior |
|----------|----------------|
| **Swipe Mode** | Full-featured. Primary mobile interaction. |
| **Quick generate** | Tap to generate a resume draft for a saved opportunity |
| **Pipeline overview** | View-only horizontal scroll of the river |
| **Notifications** | New matches, interview reminders, screening updates |

### Desktop-only workflows

| Workflow | Why |
|----------|-----|
| Voice tuning / ToneAdjust | Needs focused, precise interaction |
| Resume deep editing | Notion-like editing needs screen space |
| Keyword coverage overlay | Visual overlay needs room |
| Transparent diff review | Side-by-side comparison needs width |
| Analytics deep-dive | Charts and data density need space |

### Best-effort on mobile

Workflows that can render but aren't optimized. The UI should gracefully hide controls that don't make sense on small screens rather than cramming them in.

---

## Data Flow Principles

### One living state

All surfaces — the cockpit, swipe mode, resume studio, workspace panels — read from and write to the same opportunity state. There is no "Inbox state" vs "Pipeline state" vs "Swipe state." One river, many lenses.

### Action ripples

When the user acts on an opportunity anywhere, the effect is visible everywhere:
- Save in Swipe Mode → card appears in INTERESTED on the cockpit
- Generate in CRAFTING → resume artifact attaches to the workspace
- Mark as APPLIED → snapshot is created, source is revealed, card moves in the pipeline
- Accept an offer → confetti, wind-down prompt, other active opportunities are flagged

### Artifact ownership

Documents belong to the workspace, not to a page or tab:
- Drafts live in the CRAFTING section
- Submitted artifacts become immutable snapshots in the APPLIED section
- All artifacts remain accessible from the workspace regardless of which stage the opportunity is currently in

---

## Relationship to Existing Product Docs

This spec supersedes the menu-based navigation model and the separate-page assumptions in earlier docs.

It is compatible with:
- The normalization contract (intake still works the same way)
- The resume customization product spec (voice profile, fact lock, transparent diff — all still apply, they just live inside CRAFTING instead of a separate resume page)
- The recovery and plan levers (passed bin, archive, recovery vault — all still apply as state management)
- The KC acquisition strategy (source pipeline is unchanged — this spec only changes when the user sees the source name)

It modifies:
- The lifecycle state contract (PREP is removed; CRAFTING replaces it; OFFER gains ACCEPTED and DECLINED terminal states)
- The workspace lifecycle concept (workspace is no longer a right-side panel idea — it's a shared-element expanded view within the cockpit)
- The view contract (Inbox, JobSwipe, Pipeline are no longer separate pages — they're sections and modes within the cockpit)

---

## Resolved Decisions

### Resume Variants and Versioning

CRAFTING supports multiple named resume variants per opportunity (e.g., "Technical," "Leadership," "Creative"). Each variant is automatically versioned as the user edits (v1, v2, v3). The user selects which variant to submit when moving to APPLIED.

- **Free tier:** 1 variant per opportunity
- **Pro tier:** Multiple variants per opportunity (plan lever)
- Minimal backend overhead — artifact rows with a variant name and version number

### Data Retention After Acceptance

Campaign history (workspaces, notes, submitted resumes, interview notes) stays as long as the user is subscribed. After subscription ends:

- **Pro tier:** Data retained for 60 days past subscription end (covers typical probationary period at new employer)
- **Free tier:** Shorter retention window (exact number TBD based on usage data)
- After retention window: data moves to Recovery Vault (support-recoverable, not user-visible)

### Campaign Wind-Down on Offer Acceptance

When the user accepts an offer, the system offers to withdraw from all other active opportunities in SCREENING, INTERVIEW, and OFFER stages:

- Pre-drafted form letter (human-written template, not AI-generated) is attached to each withdrawal
- User confirms which opportunities to withdraw from (not forced)
- Opportunities in INTERESTED and CRAFTING are quietly archived — no withdrawal needed since the employer doesn't know about the user yet
- All workspace history is preserved regardless of wind-down action
