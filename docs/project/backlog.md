# JobScout Backlog

**Status:** Active  
**Purpose:** Single plain-language backlog for bugs, UX debt, and next product work

Use this file first when deciding what to build or fix next.

Rules:
- Add new items here first in one plain sentence.
- Move an item into `docs/bugs/` only if it needs a deeper bug report, proof, or root-cause writeup.
- Remove or mark items clearly when shipped so the list stays trustworthy.

## Now

- [ ] Add import review and merge control for Master Data so users can accept or reject imported fields before they become truth.
- [ ] Capture the exact submitted resume artifact for each apply flow so the system knows what was actually sent.
- [ ] Infer the 7-dimension voice profile from uploaded writing samples so Resume Builder stops depending on manual-only slider setup.

## Active Bugs And UX Debt

- [ ] JobSwipe right-swipe needs a clear `Saved` confirmation instead of the card simply disappearing.
- [ ] The bottom dock and desktop sidebar should never appear on screen at the same time.
- [ ] JobSwipe bottom actions should use `Pass` and `Save`, remove the redundant dismiss `X`, and move `Details` off the bottom action row.
- [ ] Passed Bin is too prominent in navigation and should likely be demoted once Inbox filters return.
- [ ] Inbox multi-select still needs layout cleanup and stronger bulk-selection affordances.
- [ ] Inbox wording still needs cleanup around source labels, company actions, and match-score explanation.
- [ ] Jest still reports a lingering open-handle or timer warning in the LLM test area.

## CTS / Discovery

- [ ] Wire CTS semantic search into the cockpit discovery surface so the NEW stage uses ML-powered search instead of basic keyword matching.
- [ ] Add commute search UI — "jobs within 20 min drive from home" using CTS commute filters.
- [ ] Add faceted filter UI — employment type, salary range, company — powered by CTS.

## Later

- [ ] Build the resume voice profiler so uploads can infer 7 understandable writing sliders with `Resume Writer Zero` as the fallback.
- [ ] Support optional workspace hard-links for imported reference resumes after the global import flow is trustworthy.
- [ ] Add a resume preview -> confirm flow so tailored drafts are explicitly reviewed before they become the accepted version.
- [ ] Show keyword coverage as an inspectable job-term overlay instead of a black-box ATS or match score.
- [ ] Offer optional local/private model support later as a secondary trust feature, not a v1 blocker.

## Detailed Bug Reports

- [Bug 001: Rate Limiting Blocking Auto-Save](/home/richard/code/jobs/docs/bugs/bug-001-rate-limiting.md)
