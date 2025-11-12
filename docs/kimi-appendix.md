# Kimi — Appendix

This appendix contains implementation details, code snippets, configuration examples, and helpful commands referenced from the PRD.

## Exact `config.json` (research parameters)
```json
{
  "search_parameters": {
    "cities": [
      {"name": "Kansas City, MO", "radius_miles": 35, "weight": 25},
      {"name": "Colorado Springs, CO", "radius_miles": 35, "weight": 15},
      {"name": "Salt Lake City, UT", "radius_miles": 35, "weight": 20},
      {"name": "Las Vegas, NV", "radius_miles": 35, "weight": 40}
    ],
    "categories": [
      {"name": "Technical", "weight": 40},
      {"name": "Technical Sales", "weight": 40},
      {"name": "Sales", "weight": 10},
      {"name": "Management", "weight": 10}
    ],
    "salary_usd": {"min": 140000, "max": 300000},
    "remote_modes": ["remote", "hybrid", "onsite"],
    "include_keywords": ["Azure", "LIMS", "Batch", "Historians", "PreSales", "Pharma", "Senior", "Staff", "Principal"],
    "exclude_keywords": ["Intern", "Unpaid", "Volunteer", "Entry Level", "Junior"],
    "posted_within_hours": 72,
    "max_results_per_city": 50
  },
  "source_weights": {
    "company_boards": 60,
    "aggregators": 25,
    "referrals": 15
  },
  "daily_caps": {
    "max_applications": 6,
    "max_outreach": 10
  },
  "file_naming": "YYYY-MM-DD - <Company> - <Role>.pdf",
  "ai_exaggeration_levels": ["Conservative", "Balanced", "Strategic"]
}
```

## Prisma Schema (example)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  profile   Profile?
  applications Application[]
}

model Profile {
  id          String  @id @default(cuid())
  userId      String  @unique
  user        User    @relation(fields: [userId], references: [id])
  workHistory Json
  skills      String[]
}

model Job {
  id              String   @id @default(cuid())
  title           String
  company         String
  location        String
  latitude        Float?
  longitude       Float?
  description     String
  salary          String?
  postedAt        DateTime
  source          String
  url             String
  cityWeight      Int
  category        String
  categoryWeight  Int
  sourceWeight    Int
  compositeScore  Float
  createdAt       DateTime @default(now())
}

model Application {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  jobId       String
  job         Job      @relation(fields: [jobId], references: [id])
  status      String
  resumePath  String?
  createdAt   DateTime @default(now())
  appliedAt   DateTime?
}
```

## n8n Workflow Notes
- Schedule: every 6 hours
- Nodes: RSS/HTTP Request (source) → Filter (keywords/salary) → Function (score/composite) → PostgreSQL (insert/update)
- Add geocoding node (Mapbox) to enrich latitude/longitude

## Example `docker-compose.yml` snippets
```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXT_PUBLIC_MAPBOX_TOKEN=${NEXT_PUBLIC_MAPBOX_TOKEN}
    secrets:
      - openai_key
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=jobhunt
      - POSTGRES_USER=jobhunt
      - POSTGRES_PASSWORD=secret

  n8n:
    image: docker.n8n.io/n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your-secure-pass
    volumes:
      - ~/.n8n:/home/node/.n8n

secrets:
  openai_key:
    file: /srv/secrets/openai_key
```

## Example Next.js helper: `src/lib/config.ts`
```ts
import configData from '../../config.json';

export interface Config { /*...*/ }
export const getConfig = () => configData;
```

## Example Map component (simplified)
```tsx
'use client';
import mapboxgl from 'mapbox-gl';
import { useEffect, useRef } from 'react';

export default function JobMap({ jobs }: { jobs: any[] }) {
  const mapContainer = useRef(null);
  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
    const map = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-95, 37],
      zoom: 4,
    });
    jobs.forEach(job => {
      if (job.latitude && job.longitude) {
        new mapboxgl.Marker()
          .setLngLat([job.longitude, job.latitude])
          .setPopup(new mapboxgl.Popup().setText(`${job.title} at ${job.company}`))
          .addTo(map);
      }
    });
    return () => map.remove();
  }, [jobs]);
  return <div ref={mapContainer} className="h-96 w-full rounded-lg" />;
}
```

## Security & Secrets — Commands
```bash
# Create secrets dir on VPS
sudo mkdir -p /srv/secrets
printf "%s" "your-openai-key" | sudo tee /srv/secrets/openai_key
# Use Docker secrets and keep .env.local out of source control
```

## Helpful setup commands (condensed)
```bash
# VPS
sudo apt update
sudo apt install -y docker.io docker-compose git

# Local scaffold
npx create-next-app@latest jobhunt-app --typescript --tailwind --app
cd jobhunt-app
npx shadcn@latest init
```

## Exports / Files added
- `docs/kimi-prd.md` — concise PRD with roadmap and objectives
- `docs/kimi-appendix.md` — implementation details, code snippets, configs

---

If you'd like, I can:
- Commit these new files to a Git branch and create an initial commit message.
- Extract smaller files (`config.example.json`, `prisma/schema.prisma`) into the repo root.
- Scaffold the Next.js project with the suggested dependencies.

Which of these would you like me to do next?