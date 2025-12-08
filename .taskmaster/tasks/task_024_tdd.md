# Task ID: 24

**Title:** Implement Core Route Pages and Navigation Structure

**Status:** pending

**Dependencies:** 19 ✓, 21 ✓, 22 ✓

**Priority:** high

**Description:** Assemble the primary application pages (/jobs, /settings, /dashboard) by integrating existing feature components, establishing the routing architecture, and ensuring all navigation links return valid HTTP 200 responses.

**Details:**

1. **Route Configuration**: Set up the routing architecture (e.g., Next.js App Router) to define endpoints for `/jobs`, `/settings`, and `/dashboard`.
2. **Settings Page Integration**: Create `src/app/settings/page.tsx` and import the `SettingsPage` component (from Task 21). Wrap it in the main application layout to ensure consistent navigation.
3. **Jobs Page Implementation**: Develop the `/jobs` route to display a paginated list or grid of job opportunities fetched via Prisma. Reuse the `JobCard` or similar UI components defined in Task 22.
4. **Dashboard Aggregation**: Update the root dashboard to display summary widgets:
   - Pipeline status summary (counts of jobs in 'Applied', 'Interviewing' from Task 19).
   - Recent activity feed.
   - Quick actions menu.
5. **Navigation Wiring**: Update the global `Sidebar` or `Navbar` component (from Task 22) to ensure all `Link` components point to the correct routes.
6. **Error Handling**: Implement a global `not-found.tsx` and `error.tsx` to handle invalid routes gracefully.

**Test Strategy:**

1. **Route Verification**: Manually navigate to `/jobs`, `/settings`, and `/dashboard` to confirm HTTP 200 status and correct rendering.
2. **Settings Rendering**: Verify that the Settings tabs (Search, LLM, Automation) appear and function within the `/settings` route.
3. **Navigation Integrity**: Click every link in the main navigation menu to ensure no broken links or client-side routing errors occur.
4. **Data Display**: Confirm the Jobs page renders a list of jobs (or an empty state) and the Dashboard correctly reflects counts from the Kanban pipeline.
5. **Responsiveness**: Check that these new pages adhere to the mobile-first design established in Task 22.
