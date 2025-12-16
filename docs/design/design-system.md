# JobScout Design System

This design package implements a modern, dark-themed dashboard aesthetic inspired by premium SaaS interfaces.

## Color Palette

### Base Colors (Dark Mode)
- **Background**: Deep Slate (`#0f172a` / `hsl(222 47% 6%)`)
- **Card Background**: Dark Slate (`#1e293b` / `hsl(217 33% 12%)`)
- **Text**: Off-white (`#f8fafc` / `hsl(210 40% 98%)`)

### Accent / Chart Colors
Designed for high visibility against the dark background:
- **Jobs Found (Orange)**: `hsl(25 95% 53%)`
- **Applications (Blue)**: `hsl(217 91% 60%)`
- **Interviews (Green)**: `hsl(142 71% 45%)`
- **Match Score (Yellow)**: `hsl(48 96% 53%)`

## Typography
- **Font**: Inter (or system sans-serif)
- **Headings**: Semibold/Bold, high contrast.
- **Body**: Regular, slightly muted (`text-muted-foreground`).

## UI Components

### Cards
- **Border Radius**: `1rem` (16px) for a soft, friendly feel.
- **Border**: Subtle (`border-white/10` or similar).
- **Effect**: Glassmorphism capability (`.glass` utility added).

### Buttons & Inputs
- **Radius**: Matches cards (`1rem` or `0.5rem` inner).
- **Primary Button**: Uses the Blue accent (`hsl(217 91% 60%)`).

## Usage

### Using Colors
Use the standard Tailwind utility classes which now map to these new variables:
- `bg-background`, `bg-card`
- `text-primary`, `text-foreground`
- `border-border`

For accents, use the chart variables or custom classes:
- `bg-[hsl(var(--chart-1))]` (Orange)
- `bg-[hsl(var(--chart-2))]` (Blue)
