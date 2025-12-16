# UI Overhaul - Phase 1 Report

## Before/After System-Wide Changes

### Layout System Locked 🔒
*   **Before**: Pages used arbitrary containers (`max-w-7xl`, `container`, `max-w-6xl`) and padding (`pt-8`, `py-2`, `p-6`). `AppLayout` was a Top-Nav only structure.
*   **After**: 
    *   **AppShell**: Unified Sidebar + Topbar structure. All pages inherit this shell.
    *   **Page**: All screens now wrapped in `<Page>` component.
        *   Default: `max-w-7xl`, `py-6`, `px-4/6/8`.
        *   Wide/Full options available for visual tools (Maps, Kanban).
    *   **Section**: Content grouped semantically with `<Section>` (titles + descriptions + actions).
    *   **ShellCard**: Standardized card wrapper ensuring headers (Title/Action) and Content slots are consistent.

### Navigation
*   **Before**: Desktop header navigation.
*   **After**: Vertical Sidebar navigation for Desktop (collapsible), Bottom Bar for Mobile (preserved).

## Files Created
*   `src/components/layout/AppShell.tsx`: The new master layout component.
*   `src/components/layout/Page.tsx`: The standard page container.
*   `src/components/layout/Section.tsx`: The standard section spacer.
*   `src/components/layout/ShellCard.tsx`: The standard card shell (wraps GlassCard).
*   `ui-audit-report.md`: Initial findings.

## Files Refactored
*   `src/app/layout.tsx`: Switched to `AppShell`.
*   `src/app/page.tsx`: Full refactor to `Page` + `ShellCard` + `Section`.
*   `src/app/jobs/page.tsx`: Refactored to `Page` + `Section`.
*   `src/app/settings/page.tsx` & `SettingsPage.tsx`: Refactored to `Page`.
*   `src/app/pipeline/page.tsx`: Refactored to `Page` (wide).
*   `src/app/profile/page.tsx`: Refactored to `Page` (full).
*   `src/app/resume/page.tsx`: Refactored to `Page` (full) + `ResumeBuilder` (h-full).
*   `src/app/map/page.tsx`: Refactored to `Page` (full).

## Cohesion Checklist (For Future Devs)
1.  **Rule #1**: Every top-level page (`page.tsx`) **MUST** return a `<Page>` component.
    *   Default: `<Page>...</Page>`
    *   Full Width tools: `<Page width="full" className="p-0">...</Page>`
2.  **Rule #2**: Do not use `container` or `mx-auto` in page content. logic is handled by `<Page>`.
3.  **Rule #3**: Use `<Section>` to group related content vertically. Do not use random `mb-10` divs.
4.  **Rule #4**: Complex Cards use `<ShellCard>`.
    *   Use `title`, `description`, and `action` props for headers.
    *   Do not build custom flex headers inside cards unless absolutely necessary (e.g. custom badges).
5.  **Rule #5**: Respect the AppShell. Do not create new layouts unless they are Auth/Marketing.
