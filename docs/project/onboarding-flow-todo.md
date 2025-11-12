# Onboarding Flow TODO

Use this living checklist to track guardrail updates, process improvements, and follow-up work when adopting the Autopilot starter kit in a new repository.

## How to use

- Log every notable change to guardrails, docs, or workflow scripts.
- Record open questions or investigations needed after an Autopilot session.
- Keep entries timestamped and attributed so the next agent understands context.

## Template entry

```
## YYYY-MM-DD – Author Initials
- Context: …
- Actions taken: …
- Follow-up TODOs: …
```

## Entries

## 2025-11-12 – AI Setup
- Context: User requested complete TDD-in-a-Box setup from updated tdd-in-a-box/ bundle
- Actions taken:
  - Updated AGENTS.md with first-time setup section from tdd-in-a-box template
  - Created scripts/ directory and copied all helper scripts
  - Created auto-install/ directory with setup4agents.json and repo_guidance.json
  - Copied all guide documentation from tdd-in-a-box/docs/guides/ to docs/guides/
  - Created docs/project/ directory with this onboarding log
  - Made all scripts executable (start-agent-work.sh, autopilot-reset.sh, autopilot-wrapup.sh)
- Follow-up TODOs:
  - Install task-master-ai: `npm install --save-dev task-master-ai`
  - Initialize taskmaster: `npx task-master init`
  - Verify scripts work: `./scripts/start-agent-work.sh`
  - Complete smoke tests per AGENTS.md first-time setup section
