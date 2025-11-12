# Kimi — Product Requirements Document (PRD)

## Overview
A centralized SaaS tool for job discovery, AI-powered resume tailoring, and application tracking. Focused on automating discovery across multiple sources, tailoring resumes to each role, visualizing opportunities on a map, and tracking application state.

## Core Problem
- Personal pain: Tailoring resumes is time-consuming, tracking applications is chaotic, and geographic scope feels overwhelming.
- Solution: A single platform that aggregates jobs, auto-tailors resumes with AI, visualizes job locations, and manages an application workflow.

## Target Users
- Primary: You (Richard) — Senior technical/sales professional targeting four specific cities.
- Secondary: Open-source community of job seekers who can reuse the workflows and configurations.

## Objectives (MVP)
- Aggregate recent job postings from multiple sources for four cities.
- Provide AI-powered resume tailoring with selectable "exaggeration" levels.
- Offer an interactive map view of job locations and density heatmaps.
- Track applications through an "Interested → Applied" pipeline with consistent file naming.

## Must-Have Features (MVP)
| Feature | Description | Priority |
|---|---:|:---:|
| Smart Job Aggregation | Search Indeed, LinkedIn, company boards for last 72h postings in 4 cities (35mi radius) with keyword/salary filters | P0 |
| Interactive Map | Mapbox/Leaflet map showing job locations, heatmaps for density, clickable markers showing job details | P0 |
| AI Resume Tailoring | 3-level "exaggeration" slider; generates tailored resume PDFs from master profile | P0 |
| Application Tracker | "Interested" → "Applied" pipeline; manual job entry; file naming auto-format `YYYY-MM-DD - Company - Role.pdf` | P0 |
| 100% Configurable | All settings in JSON/YAML: cities, keywords, weights, caps, filters | P0 |
| Mobile Responsive | Access from Pixel phone; dark mode; shadcn/ui components | P0 |
| Auth & Profiles | Google OAuth; exhaustive work history profile builder | P1 |
| Analytics Dashboard | Applications/day, category breakdown, offer probability mock | P1 |

## Recommended Tech Stack (MVP)
- Frontend: Next.js (App Router), shadcn/ui, Tailwind CSS, Framer Motion, Mapbox GL JS
- Backend/Services: Next.js API Routes, PostgreSQL (Supabase), Prisma ORM, BetterAuth, n8n for scraping/automation, OpenAI API for resume tailoring
- Infrastructure: Docker, Docker Compose, Nginx (Let's Encrypt), VPS (Ubuntu 22.04 LTS, 2GB RAM min)

## Architecture Overview
(High-level)

```
User Browser (Pixel Phone, Desktop)
        |
        ▼
Next.js App (Docker Container)
  - Frontend (App Router)
  - API Routes (/api/jobs)
  - Auth (BetterAuth)
        |
        ▼
Data Layer: PostgreSQL (Supabase) + Prisma
  - Tables: Users, Profiles, Jobs, Applications, Configs
        |
        ▼
Automation: n8n
  - Scheduled scrapers
  - Geocoding & scoring
  - AI resume workflows
        |
        ▼
External APIs: OpenAI, Mapbox, Job sources (Indeed/LinkedIn/company boards)
```

## MVP Roadmap — 4-Week Plan
### Week 1 — Foundation
- VPS setup (Docker & Docker Compose)
- Scaffold Next.js app with TypeScript and Tailwind
- Initialize shadcn/ui
- Create Supabase project and Prisma schema
- Implement configuration loader for JSON/YAML

Commands (examples):
```bash
# Install Docker & Docker Compose (Ubuntu)
sudo apt update && sudo apt install -y docker.io docker-compose

# Create Next.js app
npx create-next-app@latest jobhunt-app --typescript --tailwind --app
cd jobhunt-app
```

### Week 2 — Core Features
- Profile builder (multi-step form)
- Job dashboard (table/list of scraped jobs)
- n8n workflows for scraping (Indeed + LinkedIn)
- Mapbox integration to display markers

### Week 3 — AI & Workflow
- OpenAI integration for AI resume tailoring (3 levels)
- PDF generation (pdf-lib or react-pdf)
- Application tracker state machine and file naming automation

### Week 4 — Polish & Deploy
- Google OAuth via BetterAuth
- Mobile optimization and dark mode
- Dockerize and create `docker-compose.yml`
- Deploy to VPS and set up Nginx + SSL

## Key Configuration (summary)
A full `config.json` with search parameters, weights, caps, and AI levels will be kept in the repo. See the appendix file for the exact JSON and examples.

## Security & Secrets
- Use `.env.local` in development (do not commit)
- Use Docker secrets for production, store secrets on VPS outside the repo

## Open Source Strategy
- Repo structure, `README.md`, and example config files
- `n8n` workflows exported to `n8n-workflows/`
- Clear CONTRIBUTING.md and MIT license for community adoption

## Design / Style
- Tailwind with design tokens in `src/styles/globals.css`
- Dark theme and Pixel-first responsive considerations

## Next Steps (today)
- Setup VPS and Docker
- Scaffold Next.js project locally
- Create Supabase project and define Prisma schema

---

For full implementation details, code snippets, `config.json`, Prisma schema, `docker-compose` snippets and step-by-step commands, see `docs/kimi-appendix.md`.
