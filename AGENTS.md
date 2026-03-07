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
   - `JOURNAL.md`
2. Keep changes focused and explain what you are about to do.
3. Verify claims with tests, browser checks, or other direct validation whenever practical.
4. Update docs when product truth changes.
5. Update `JOURNAL.md` when rationale or direction changes.

## Human-in-the-loop checkpoint

After a meaningful implementation chunk:

- Summarize what changed and what was verified.
- Pause before the next risky or expensive-to-reverse chunk.
- Use `docs/guides/human-in-the-loop-workflow.md` as the pattern for when to stop and re-align.

## Session wrap-up

1. Run the strongest relevant verification you can.
2. `git status -sb`
3. Leave a clean explanation of what changed, what still needs work, and any real risks.

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
