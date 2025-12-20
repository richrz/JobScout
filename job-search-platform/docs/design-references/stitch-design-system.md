# JobScout Stitch Design System

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#30e87a` | Primary accent, CTAs, links, active states |
| `background-dark` | `#112117` | Main background |
| `surface-dark` | `#1a2c22` / `#1c2620` | Card backgrounds, panels |
| `surface-hover` | `#29382f` | Hover states, borders |
| `text-secondary` | `#9db8a8` | Muted text, labels |

## Typography

- **Display Font**: Spline Sans (headings, UI elements)
- **Body Font**: Noto Sans (long-form content)

## Border Radius

| Size | Value |
|------|-------|
| Default | `1rem` (16px) |
| lg | `1.5rem` - `2rem` |
| full | `9999px` (pills, avatars) |

## Key Design Patterns

### Buttons
- Primary: `bg-primary text-[#111814]` with glow shadow
- Ghost: `bg-surface-dark border border-[#29382f]` 
- Rounded full (pill shape) for CTAs

### Cards
- `bg-surface-dark rounded-xl/2xl border border-[#29382f]`
- Hover: `hover:border-primary/50`
- Subtle lift on hover

### Inputs
- Dark background: `bg-[#112117]` or `bg-input-dark`
- Border transitions to primary on focus
- Rounded-full for search bars
- Rounded-xl for form fields

### Glow Effects
- Primary button shadow: `shadow-[0_0_15px_rgba(48,232,122,0.3)]`
- Hover intensifies: `shadow-[0_0_20px_rgba(48,232,122,0.5)]`

### Status Indicators  
- Pulsing dot: `size-2 bg-primary rounded-full animate-pulse`
- Stage colors: gray (saved), blue (applied), purple (screening), yellow (interview), green (offer)

## Pages Designed

1. **Dashboard** - Stats grid, activity feed, upcoming interviews
2. **Job Search** - Filter sidebar, job cards, pagination
3. **Job Details** - Hero, description sections, sticky apply sidebar
4. **Kanban Pipeline** - Drag-drop columns, stage-colored cards
5. **Resume Builder** - Accordion sections, AI assistant panel
6. **Map View** - Clustered pins, floating job list panel
7. **Settings** - Sidebar nav, toggle cards, sliders

## Implementation Notes

- Uses Material Symbols Outlined for icons
- Tailwind CSS with custom config
- Mobile-responsive with collapsible sidebars
- Scrollbar styled to match theme
