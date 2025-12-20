# Resume Personality Control – Product Spec

## Goal
- Give users clear control over how their resume sounds without exposing technical settings.
- Default to a solid, low-effort starting point; make deeper tweaks optional.
- Keep language honest, role-appropriate, and optimized for quick recruiter scans.

## Model (4 Axes)
- **Voice (tone)**: Casual / Professional / Buttoned-Up. Controls formality and warmth.
- **Density (detail)**: Punchy / Balanced / Comprehensive. Controls words per bullet and bullets per job.
- **License (creative latitude)**: Just Facts / Polish Up / Sell Hard. Controls how aggressively we enhance user input.
- **Insider (jargon depth)**: Plain English / Industry-Aware / Deep Insider. Controls jargon, acronyms, and specificity.

## Defaults
- Start with: Professional + Balanced + Polish Up + Industry-Aware.
- Always show a "Reset to preset" action after any tweak.

## Presets (examples)
- Attorney: Buttoned-Up, Balanced, Just Facts, Industry-Aware.
- IT Consultant: Professional, Comprehensive, Polish Up, Deep Insider.
- Service/Hospitality: Casual, Punchy, Polish Up, Plain English.
- Startup Founder: Casual, Punchy, Sell Hard, Deep Insider.
- Executive: Buttoned-Up, Comprehensive, Polish Up, Industry-Aware.

## Interaction Pattern (Hybrid)
- Primary control: Industry preset dropdown (fast start).
- Advanced controls: Expandable panel with the four axes (dropdowns or short sliders). Include a one-line "when to use this" tip under each axis.
- State handling: Selecting a preset sets all axes; manual tweaks override until "Reset to preset" is clicked.
- Feedback: Show a short summary chip (e.g., "Professional • Balanced • Polished • Industry-Aware") so users always know the active mix.

## UI Components (shadcn/ui)
- Preset: `Select` for industry presets (medium width, searchable optional).
- Advanced container: `Accordion` or `Collapsible` to reveal axis controls without cluttering the primary flow.
- Axis controls: `Toggle Group` (single-select) for Voice/License/Insider; `Select` or short `Slider` for Density.
- Hints: `Tooltip` on axis labels for quick definitions; keep microcopy concise and neutral.
- Summary: row of `Badge` chips showing the active mix; include a subtle "Reset to preset" text button beside it.
- Warnings: `Alert` (neutral tone, no icons or emojis) when "Sell Hard" is selected to remind users to stay truthful.

## Language Rules by Axis
- **Voice**: Casual uses contractions and friendly phrasing; Professional is neutral; Buttoned-Up avoids contractions and uses formal vocabulary.
- **Density**: Punchy targets ~10–14 words per bullet; Balanced ~15–20; Comprehensive ~20–30 with context and impact.
- **License**: Just Facts never infers; Polish Up may smooth wording; Sell Hard may bridge adjacent skills but must stay plausible.
- **Insider**: Plain English spells out terms; Industry-Aware uses standard keywords; Deep Insider assumes domain fluency and uses precise terminology.

## Safety and Trust
- Never invent employers, titles, dates, or credentials.
- Warn users when "Sell Hard" is chosen: note that aggressive framing should still match reality.
- Keep metrics grounded: if no numbers are provided, use qualitative impact instead of fabricating figures.

## Success Criteria
- Users can produce a tailored resume variant in under 2 minutes starting from a preset.
- Users can explain what each axis does in one sentence (thanks to inline tips).
- Recruiter scan readiness: bullets stay within the chosen density range; tone matches the selected industry preset.
