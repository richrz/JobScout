# Phase 0: UI Audit Report

## Top 10 Causes of "Non-Cohesive" UI

1.  **Inconsistent Page Containers & Spacing**
    *   **Issue**: Pages use different max-widths and padding strategies.
    *   **Examples**:
        *   `src/app/page.tsx`: Uses `max-w-7xl mx-auto pt-8`.
        *   `src/app/jobs/page.tsx`: Uses `container mx-auto py-2`.
    *   **Fix**: Enforce a strict `<Page>` component with standardized `maxWidth` and `spacing` props.

2.  **Arbitrary Padding/Margin values**
    *   **Issue**: Padding is often hardcoded and varies between similar components.
    *   **Examples**:
        *   `src/app/page.tsx`: `p-8` for stats cards.
        *   `src/app/page.tsx`: `p-4` for recent activity items.
        *   `src/app/jobs/page.tsx`: `p-2` for the filters bar.
    *   **Fix**: Use semantic spacing tokens (e.g., `p-card`, `p-section`) or strict usage of Tailwind spacing scale (4, 6, 8).

3.  **Hardcoded & Non-Semantic Colors**
    *   **Issue**: Direct usage of palette colors instead of theme variables.
    *   **Examples**:
        *   `src/app/page.tsx`: `text-blue-400`, `text-yellow-400`, `text-emerald-400`.
        *   `src/app/page.tsx`: `bg-slate-900/50` (Mixing slate with the theme's slate might look off).
    *   **Fix**: Move these to `globals.css` as semantic vars (e.g., `--color-status-info`) or use `text-chart-1`, etc.

4.  **Ad-Hoc Card Structures**
    *   **Issue**: `GlassCard` is used as a generic container, but internal structure (Header, Content, Footer) is re-implemented with Flexbox every time.
    *   **Examples**:
        *   `src/components/jobs/JobCard.tsx` (inferred) likely has its own layout.
        *   `src/app/page.tsx`: Manually builds header/content divs inside `GlassCard`.
    *   **Fix**: Create a `ShellCard` (or `AppCard`) with `Header`, `Body`, and `Footer` sub-components that enforce padding/alignment.

5.  **Arbitrary Dimensions (Magic Numbers)**
    *   **Issue**: Elements have specific pixel heights/widths that break responsiveness or rhythm.
    *   **Examples**:
        *   `src/app/page.tsx`: `min-h-[180px]`, `h-[400px]`, `h-[120px]`.
    *   **Fix**: Use standard height utilities or aspect ratios.

6.  **Typography Inconsistencies**
    *   **Issue**: Headings vary slightly in size and weight.
    *   **Examples**:
        *   Home: `text-4xl md:text-5xl font-bold tracking-tight`.
        *   Jobs: `text-4xl font-bold tracking-tight` (missing responsive bump).
    *   **Fix**: Define `typography` constants or components (`PageTitle`, `SectionTitle`).

7.  **Button & Action Inconsistencies**
    *   **Issue**: Some buttons imply links, some are just stylized divs, mixed variants.
    *   **Examples**:
        *   `src/app/page.tsx`: Uses `Button` inside `Link`.
        *   `src/app/jobs/page.tsx`: Filter buttons look like badges/chips but use `Button` variant `ghost`.
    *   **Fix**: Standardize "Filter Chips" as a separate component if they behave differently from primary actions.

8.  **Z-Index & Transparency "Magic"**
    *   **Issue**: One-off opacity and z-index tweaks.
    *   **Examples**:
        *   `bg-white/5`, `border-white/10`.
    *   **Fix**: Define these levels as `glass` variants or opacity tokens.

9.  **Gradients defined in-line**
    *   **Issue**: Gradients are defined inline rather than in the theme.
    *   **Examples**:
        *   `bg-gradient-to-br from-violet-500 to-fuchsia-500`.
    *   **Fix**: exact consistent gradients in `tailwind.config.js`.

10. **Data Visualization Styling**
    *   **Issue**: Legend/Labels in charts often don't match the rest of the app's typography.
    *   **Examples**:
        *   `src/app/page.tsx` manually styles the stat text colors (`stat.color`).
    *   **Fix**: Charts should inherit theme colors automatically.
