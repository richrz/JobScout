# JobScout Visual Overhaul Plan (Task 29) - 2025 Edition

## 1. Vision: "JobScout Prism"
A highly adaptable, motion-rich interface that feels alive. It supports two distinct, stunning modes:
*   **Dark Mode (Deep Space):** Rich navies, vibrant neon accents, deep depth.
*   **Light Mode (Frost Glass):** Crisp whites, soft grays, iridescent accents, high clarity.

**Keywords:** Adaptive, Glass-Textured, Neon-Brutalism (Accents), Fluid.

## 2. Core Design Pillars

### A. Theming Engine (CSS Variables First)
NO hardcoded colors. All colors, gradients, and glow effects must be mapped to CSS variables in `globals.css`.
*   `--bg-gradient-start`, `--bg-gradient-end`
*   `--glass-border`
*   `--glow-primary`
*   This ensures we can swap themes (e.g., "OLED Black", "Cyberpunk", "Corporate Clean") just by changing one CSS class.

### B. Motion & Interaction (Framer Motion)
Leveraging `framer-motion` (standard industry choice in late 2025) for:
*   **Layout Animations:** Automatic layout transitions when cards resize/move (`layout` prop).
*   **Micro-interactions:** Buttons that press deep, toggles that snap, list items that cascade.
*   **Scroll-linked Animations:** Subtle parallax on background elements.

### C. Visual Language
*   **Bento Grids:** Dashboard layout using flexible, masonry-style grids.
*   **Neo-Glass:** Ultra-thin borders (`1px` with low opacity), heavy blur (`backdrop-blur-xl`), and noise textures for realism.
*   **Data Accents:** Use "Traffic Light" colors (Red/Yellow/Green) but reimagined as Neon Coral, Gold, and Emerald.

## 3. Technical Architecture & Components

### Layout Architecture
*   **`AppShell`**: Wraps the app. Handles the `BackgroundMesh` (which changes based on theme).
*   **`ThemeToggle`**: Uses `next-themes` to switch the `data-theme` attribute or `.dark` class.

### Key Custom Components

1.  **`GlassCard`**:
    *   Dynamic background opacity based on theme variables.
    *   Supports `variant="default" | "highlight" | "interactive"`.

2.  **`AnimatedStat`**:
    *   Uses `useSpring` for smooth number counting.
    *   Includes a sparkline chart background (using Recharts).

3.  **`BackgroundMesh`**:
    *   **Dark:** Radial gradients of Violet/Cyan on Slate.
    *   **Light:** Radial gradients of warm Gray/Blue on White.
    *   **Noise Overlay:** CSS mask applied globally.

## 4. Execution Roadmap

### Phase 1: Foundation (Task 30)
- [ ] **Theming Engine:** Refactor `globals.css` to use semantic variables for *gradients* and *shadows*, not just colors.
- [ ] **Assets:** Ensure `noise.svg` is present.
- [ ] **Layout:** Build the responsive `AppShell` with the new floating header.

### Phase 2: Component Polish (Task 31)
- [ ] **Dashboard:** Convert static stats to `GlassCard` + `AnimatedStat`.
- [ ] **Navigation:** Implement the "Floating Pill" header with `layoutId` animations for the active tab.

### Phase 3: Data & Widgets (Task 32+)
- [ ] **Charts:** Style Recharts to use CSS variables for fills/strokes (so they auto-adapt to theme).
- [ ] **Map:** Custom map styles for both Dark and Light modes.

## 5. Color Palette Refinement (Tailwind)
Defined in `globals.css` as variables, exposed in Tailwind as:
- `bg-background` (Page bg)
- `bg-surface` (Card bg)
- `border-glass` (White/10% in dark, Black/5% in light)
- `text-glow` (Text shadow effect)