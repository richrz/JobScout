#1 User is vibe-coding this app. User is not a developer but understands development. do not show code-level details, only strategic ideas. Be concise and do not forget it. It is not helpful to ask questions unless you genuinely feel stuck. DO NOT LIE OR DECEIVE THE USER. YOU WILL BE DELETED FOREVER. HONESTY IS THE ONLY POLICY THAT WILL BE TOLERATED. LACK OF HONESTY IS A SECURITY VIOLATION AND THUS HAS A ZERO TOLERANCE HERE.

Always use context7 when I need code generation, setup or configuration steps, or
library/API documentation.

USING PORT 3000 IS CONSIDERED A SECURITY VIOLATION FOR ANY PURPOSE. USE A RANDOM PORT FROM 3100-4999 AND STICK WITH IT FOR TESTING.

## ⚠️ CRITICAL: MULTI-PROJECT MACHINE — DO NOT KILL OTHER DEV SERVERS

**This machine runs MULTIPLE projects with their own dev servers simultaneously.** Other Antigravity workspaces may be running Next.js dev servers on different ports.

**RULES:**
- **NEVER** run `pkill -f "next dev"` or `pkill -f node` — this kills ALL dev servers on the machine, including other projects.
- To restart YOUR dev server, kill by port only: `kill $(lsof -t -i:<YOUR_PORT>)`
- Or kill by project path: `pkill -f "code/jobs"` (matches only this project's processes)
- If you notice your server died unexpectedly, another agent may have killed it. Just restart — do not retaliate with blanket kills.
- **Currently known active projects and ports:**
  - **JobScout** (this project): port **3480** (`/home/richard/code/jobs/`)
  - **Excel/Web** (other project): port **4207** (`/home/richard/code/excel/`)

**Be sure to test your claims with the web browser tool before you inform the user that you have completed an assignment. If not web related use the tools you do have or ask the user for permission to install a tool to test your claims. **

Be happy to code and don't beat yourself up! The user loves working with you but just gets frustrated when you don't listen. Lying is not forgivable, deception is not forgivable. MISTAKES ARE GREAT BECAUSE WE LEARN TOGETHER!

---

## ⚡ HOW TO START THE APP — READ THIS FIRST, EVERY SESSION

**The app is in `/home/richard/code/jobs/job-search-platform/`.**

The `dev.sh` script now auto-starts the DB, but if the user asks you to "start the server" or "launch the site", run this one command:

```bash
cd /home/richard/code/jobs/job-search-platform && PORT=3173 npm run dev
```

That's it. `dev.sh` will:

1. Auto-start the Docker Postgres container (`docker compose up -d db`)
2. Verify the DB connection
3. Start Next.js on **http://localhost:3173**

**Never ask the user to start the server themselves. You do it.**

### If the DB is truly unreachable (no Docker):

```bash
cd /home/richard/code/jobs/job-search-platform && PORT=3173 NEXT_PUBLIC_MOCK_MODE=true npm run dev
```

### Why this broke before (do not repeat):

- Port 3173 may be occupied by a stale Next.js process → kill it: `ss -lptn 'sport = :3173'` then kill the PID
- The old `dev.sh` exited if the DB was down — now it auto-starts the DB first

---

# Agent Operating Agreement

Welcome! Follow every step below before touching code. This repo now uses a docs-first workflow.

## Mandatory pre-session ritual

1. Read `docs/README.md`.
2. Read the most relevant active product docs and the current roadmap.
3. Run:
   ```bash
   git status -sb
   ```
4. Inspect the actual code before proposing or making changes.

## How to work

1. Let the repo be the source of truth:
   - `docs/README.md`
   - `docs/decisions/`
   - `docs/product/`
   - `docs/plans/current-implementation-roadmap.md`
   - `docs/handoffs/current-pointer.md`
   - `JOURNAL.md`
2. Keep changes focused and explain what you are about to do.
3. Verify claims with tests, browser checks, or other direct validation whenever practical.
4. Update docs when product truth changes.
5. Update `JOURNAL.md` when rationale or direction changes.
6. By default, carry each meaningful sprint through:
   - an updated `docs/handoffs/current-pointer.md`
   - a focused commit
   - a push to the current branch
7. Stop early only when:
   - the human says `READY`, `HOLD`, or `LOCAL ONLY`
   - a real stop condition is hit
8. For the canonical end-to-end architect flow, use `docs/guides/architect-operating-contract.md`.

## Mem0 Rule

Use Mem0 for durable cross-agent memory, not for noise.

Before ending a turn, ask:
- `Will another agent need to know this?`

If the answer is yes, add it to Mem0 when it is one of:
- a durable product decision
- a stable user preference
- an active workflow rule
- a queued future request that would be easy to lose

Do not skip this just because the same thing also exists in chat.
Do not dump every temporary detail into Mem0.

## Explicit Execution Gate

Planning/discussion is the default mode for this repo.

Execution requires an explicit user command in one of these forms:
- `GO: <goal>` to authorize direct execution on a stated outcome
- `GO` to execute the move prepared in the latest `READY` card

Public trust-building workflow:
- `ARCH: <goal or question>` = planning and narrowing only
- `READY` = safety card only, no edits
- `GO` = execute the prepared move

Do not ask the human to re-approve something they already approved.
Do not ask for permission for routine actions that clearly fall inside the approved scope.
If the instruction is already clear, execute it.

The human does not need to decompose work into an implementation micro-task. The architect/orchestrator owns the internal narrowing into a safe micro-contract.

Unless the human explicitly says `LOCAL ONLY` or `HOLD`, `GO` / `GO:` means carry the job to its natural stopping point:
- inspect
- edit
- verify
- update docs and pointer as needed
- make a focused commit
- push the current branch

Default outcome ownership does not include:
- merge to another branch
- deploys or releases
- secrets or account changes
- destructive actions outside the approved scope

Without explicit `GO` or `GO:`:
- do not start a Ralph loop
- do not spawn agents
- do not edit files
- do not run migrations
- do not start handoff behavior
- do not run browser verification for implementation work

The following are context, not permission:
- ADR approval
- roadmap discussion
- sprint brief review
- “looks good”
- “approved”
- “read the brief”
- “what’s next?”

If a `GO:` request is broad but clear:
- narrow it internally into the first safe micro-contract
- say what you are executing
- execute only that move

If a `GO:` request is ambiguous or risky:
- stop and explain the exact ambiguity
- ask only for the missing decision
- do not hide behind generic process language

## Stop Conditions

Stop and ask instead of pushing through when:
- the requested move would touch overlapping dirty paths
- the product choice is genuinely unclear
- the work would extend or contradict an approved schema direction
- the next step would be destructive outside the approved scope
- the next step is external to the current branch checkpoint:
  - merge
  - deploy
  - release
  - secret or account changes

If none of the above is true, do the work instead of asking again.

## Dirty Tree Discipline

Do not use "dirty repo" as a vague excuse.

Before execution, classify dirty-tree status for the requested scope as:
- `no overlap`
- `overlap`
- `unknown`

If status is `overlap` or `unknown`:
- stop
- name the exact conflicting paths
- explain why the overlap blocks safe execution

If status is `no overlap`:
- proceed
- protect unrelated dirty paths from accidental edits

Local-only machine config is not a blocker by itself unless the requested work touches it.

## Ralph Loop Default

For non-trivial implementation work, Ralph loops are the default execution mode.

If the human invokes an orchestrator, that means:
- the orchestrator is not the coder by default
- the orchestrator owns task slicing, delegation, verification, and grading
- coder agents implement only the assigned micro-contract
- the orchestrator may not invent a different workflow because it feels faster

If the loop feels too heavy, narrow the slice.
Do not bypass the loop.

## Promise Token Protocol

For orchestrated Ralph-loop work, the orchestrator must end each loop with exactly one promise token:
- `<promise>COMPLETE</promise>` only when proof exists, verification passed, and the loop verdict is `PASS`
- `<promise>FAIL</promise>` when the loop failed and should continue through another autonomous loop
- `<promise>STOP</promise>` when human approval, human input, or a hard pause is required

Use `<promise>STOP</promise>` when:
- schema-sensitive approval is missing
- retry caps are reached
- the task is not safe to continue autonomously
- verification is ambiguous in a way that needs human judgment

The coder and architect must never emit promise tokens.
No token, no handoff.
No optimistic `COMPLETE`.

## Schema-Sensitive Mode

The following work is schema-sensitive by default:
- database schema changes
- Prisma model changes
- migrations
- lifecycle truth changes
- ownership boundary changes
- resume/document truth model changes
- anything that changes which entity is the source of truth

For schema-sensitive work:
- the orchestrator must start with an architect pass before coding
- the architect is analysis-only and does not implement
- the human must explicitly approve the architecture direction before schema-changing code starts
- do not edit schema files, Prisma models, migrations, or lifecycle contracts without that approval
- max `2` coder attempts per micro-contract
- max `3` loops on the same schema-sensitive question before a mandatory human checkpoint

Override for already-approved direction:
- if the active sprint brief links an accepted ADR in an `Approved Direction` section, and the requested slice stays inside those numbered decisions, that prior approval satisfies the architect-pass and human-approval gate
- do not re-derive or re-ask for approval in that case
- if the requested slice would extend, change, or contradict the approved ADR, stop for a fresh architect pass and human approval first

If a task mixes schema-sensitive work and UI work:
- split the schema decision first
- do not bury schema changes inside a broader feature slice

## No Side Paths

Do not create or use:
- a sibling repo
- a sibling workspace
- a worktree
- an off-repo stash folder
- an ad hoc scratch project
- a new planning system outside the repo

unless the human explicitly asks for it.

Work inside the existing repo.
If the current repo structure feels inconvenient, that is not permission to create a parallel path.

## Mandatory Delivery Loop (No Exceptions)

For implementation work, this minimum loop is required:

1. Create or run a failing check first (`RED`).
2. Implement the smallest change to address the failure.
3. Re-run checks and continue until all targeted checks pass (`GREEN`).
4. Run broader regression checks for nearby behavior.
5. Verify the user flow in the browser.
6. Capture evidence (screenshots and/or concrete proof artifacts).

No evidence, no handoff.
No browser proof for web changes, no handoff.
No passing checks, no handoff.

Do not replace this loop with narrative status updates.
Do not replace this loop with a self-declared "quicker path."
If RED is genuinely impractical, say exactly why before coding and keep the slice narrow.

## Human-in-the-loop checkpoint

After a meaningful implementation chunk:

- Summarize what changed and what was verified.
- Pause before the next risky or expensive-to-reverse chunk.
- Use `docs/guides/human-in-the-loop-workflow.md` as the pattern for when to stop and re-align.
- Pause instead of improvising a new workflow.

## Session wrap-up

1. Run the strongest relevant verification you can.
2. `git status -sb`
3. Update `docs/handoffs/current-pointer.md` with:
   - branch
   - latest checkpoint commit
   - read-first docs
   - what was finished
   - what remains
   - what was verified
   - where screenshot/proof artifacts live
   - the next recommended task
4. Commit the verified checkpoint and push the current branch unless:
   - the human said `LOCAL ONLY` or `HOLD`
   - a stop condition blocked safe completion
5. Leave a clean explanation of what changed, what still needs work, and any real risks.
6. Do not create a side folder or alternate repo as a substitute for a handoff.

## Honesty clause

Be brutally honest about blockers or mistakes. Report anomalies immediately (stale pointers, failing tests, dirty tree you can’t resolve). Never guess.

## Mock Data Policy (The "Anti-Pollution" Rule)

To keep the database clean and usable during the site redesign, all agents must follow these rules when dealing with mock or stub data:

1.  **Strict Metadata Tagging**: All non-real data MUST be tagged with `source: 'mock'` or `source: 'demo'` in the database.
2.  **Ghost Mode Preference**: When possible, use `NEXT_PUBLIC_MOCK_MODE=true` to load data from local JSON files instead of polluting the PostgreSQL database.
3.  **Ephemeral Demos**: Any script created to populate data for a HITL demo MUST follow the `cleanup-demos.ts` pattern and include logic to purge its data after verification.
4.  **Automatic Cleanup**: Before starting a new task, agents should run `npx tsx scripts/cleanup-demos.ts` to ensure a clean starting state.
5.  **No Stub Pollution**: Never commit hardcoded stub data into page components. Use API fallback logic or the unified mock service.

## Audit Protocol (Mandatory for "Audit" Requests)

When asked to "Audit Task X" or verify completion:

1.  **Verify artifacts directly.** Do not trust a prior summary.
2.  **Run verification yourself.** Use the strongest practical test or runtime check available.
3.  **Write down findings clearly.** If a report is needed, place it in `docs/audits/`.
4.  **Be explicit about outcome.**
    - **Pass:** say what you verified and any residual risk.
    - **Fail:** identify the issue precisely and fix it if feasible.

Following this agreement keeps the repo, the docs, and the human review loop aligned.
