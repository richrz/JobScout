# Enterprise-Grade Architecture for a National-Scale Hybrid Job Search SaaS

## Executive summary

Your pipeline draft is viable as a *prototype-to-growth* blueprint, but it will not survive “enterprise-grade” scale without hardening around four failure domains: **(1) discovery economics + event delivery race conditions**, **(2) scraping reliability under adversarial bot defenses**, **(3) canonical identity + dedupe correctness**, and **(4) hybrid search under strict filtering constraints**. The biggest surprise in production is that raw crawl volume and LLM usage are rarely the first-order failure—**dedupe and idempotency are**. Your system will either (a) silently generate a duplicate storm that destroys search trust, or (b) over-merge and hide legitimate distinct roles.

The non-negotiable changes required for national scale are:

- **Treat discovery outputs as “leads,” not truth.** Google Jobs-style discovery regularly returns *walled-garden* or brokerage links (e.g., “via LinkedIn” with a LinkedIn URL), which are often not crawlable/compliant ingestion targets. citeturn14view0
- **Make every stage idempotent by construction.** DataForSEO’s postback/pingback timeout-to-Tasks-Ready behavior and Celery’s ack/retry semantics guarantee duplicates unless you enforce idempotency keys and database constraints at each boundary. citeturn12view0turn13view0turn6view0
- **Model canonical jobs separately from observed listings.** A “job” must be an entity with multiple observed listing sources; otherwise the Garmin-on-Greenhouse/Indeed/Google problem will keep reappearing in new forms.
- **Architect strict boolean + semantic search as a first-class query planning problem.** OpenSearch hybrid scoring requires pipeline normalization/combination, hybrid query clause limits are real, and filtered k-NN has explicit recall/latency knobs (e.g., `ef_search`) and engine limitations. citeturn7search0turn2search4turn2search1
- **Assume LLM extraction is hostile-input, stochastic-output.** Prompt injection is a top-tier risk category, and hallucinations must be expected and bounded via schema enforcement and field-level confidence. citeturn10search0turn10search3turn10search2

```mermaid
flowchart LR
  A[Discovery: DataForSEO Google Jobs tasks] --> B[Results delivery: postback/pingback + Tasks Ready polling]
  B --> C[Routing: URL classification + policy gating]
  C --> D[Scrape: HTTP fetchers + headless pool]
  D --> E[Raw store: S3 immutable snapshots]
  E --> F[Extraction/Enrichment: parsers + LLM schema + firmographics]
  F --> G[Entity resolution + dedupe: blocking + simhash/minhash + review]
  G --> H[Canonical store: PostgreSQL (jobs/companies)]
  H --> I[Indexing: OpenSearch bulk ingest + embeddings]
  I --> J[Search API: Hybrid BM25 + k-NN + strict filters]
  J --> K[Next.js UI]
```

## Pre-Mortem

Failure analysis

### Discovery: query-matrix economics and DataForSEO delivery races

**The query matrix explodes faster than your engineering can optimize it.** A Title × ZIP matrix turns into an unbounded crawl budget unless you (a) cap titles per location, (b) implement metro/state rollups, and (c) make discovery incremental with measured yield per query. This is not an optimization problem; it is a governance problem.

On the delivery plane, entity["company","DataForSEO","serp api provider"] explicitly supports a “standard method” (POST then GET later) and also supports async delivery via `postback_url`/`pingback_url`. Their Google Jobs task documentation is unambiguous that if your server fails to respond within **10 seconds** to postback/pingback delivery, DataForSEO aborts and **moves the task into the “Tasks Ready” list**. citeturn12view0

That creates an enterprise-grade footgun:

- If you process a postback but your receiver times out before returning 2xx, the same task can later be processed again from Tasks Ready (polling).
- If you poll Tasks Ready aggressively while also accepting postbacks, you can process the same task twice due to ordering and “small delay” behaviors in their completed-task queue.

DataForSEO’s own Tasks Ready documentation warns that the completed tasks queue is updated with a **small delay** (which can matter for high-volume users) and recommends using pingbacks/postbacks if you need to collect over **1000 tasks/min**, using Tasks Ready primarily as a recovery channel for failed postbacks. It also states Tasks Ready has its own rate limit and paging constraints: **up to 20 API calls/min**, returning **1000 tasks per call** from the **previous three days** only. citeturn13view0

**Billing amplifies workload surprises.** DataForSEO’s Help Center explicitly recommends setting `depth` in multiples of 10; if you request `depth: 11`, it may return 20 results and charge accordingly because it processes ten results at a time. citeturn14view0

### Walled gardens: “source_url” may be the broker, not the employer

In large-scale job discovery, the default behavior is not “you get the clean ATS link.” DataForSEO’s own Google Jobs example shows listings with `source_name: "via LinkedIn"` and a `source_url` pointing directly to a LinkedIn job URL with tracking params. citeturn14view0

This breaks your pipeline in two ways:

- **Technical**: your router may classify this as “hard scrape” (headless) and burn large headless capacity on pages with login walls, heavy bot detection, or dynamic content.
- **Compliance**: walled garden content is often contractually restricted from automated access/data mining.

### Routing & scraping: headless/browser cliffs and queue non-determinism

Your “easy ATS via HTTP, hard ATS via headless” heuristic is directionally correct, but it fails at scale because “easy vs hard” is extremely non-stationary. Redirect chains, session gates, bot scores, and dynamic rendering can transform an “easy” link into a headless-only workflow mid-flight.

The headless service itself is a cost and reliability cliff. entity["company","Browserless","headless browser service"] monetizes concurrency and bot-evasion features explicitly, including residential proxies and automated CAPTCHA solving. citeturn3search0turn3search16 Their documentation also notes that CAPTCHA solving can take “several seconds to minutes” and that each solve attempt costs units (10 units per solve attempt). citeturn3search4 This is exactly the profile of a scaling cliff: high variance, unpredictable latency, and consumption even on failed/time-out pages.

### Celery/ack semantics: duplicates are the default unless you enforce idempotency

Your Redis/Celery queue is not “a background job runner”; it is a **distributed at-least-once delivery system** under failure. entity["organization","Celery","python distributed task queue"] documents that task messages are not removed until acknowledged, and acknowledges can be configured “late” (`acks_late`) so that messages are acked after execution for idempotent tasks. The docs also call out that if tasks are idempotent you can use `acks_late`, but you must assume tasks may execute multiple times if the worker crashes mid-execution. citeturn6view0turn0search10

Two specific footguns matter for scraping:

- Celery documents that the worker may still acknowledge a message if a child process is terminated, even with `acks_late` enabled; if you want redelivery in those scenarios you need `task_reject_on_worker_lost`. citeturn6view0  
- Celery’s retry mechanism explicitly sends a new message “using the same task-id,” which is great for tracing but means “retries” are not distinguishable from first attempts unless your system is idempotent at the data layer. citeturn6view0

**Translation into your system:** scraping tasks must be designed as “may run 0–N times” and still produce **exactly one** raw snapshot record and **at most one** canonical job upsert per idempotency key.

### Legal/ToS: high-probability shutdown risks for walled gardens and Google surfaces

Your pre-mortem must treat ToS restrictions as operational constraints, not legal fine print.

- entity["company","LinkedIn","professional social network"] explicitly states it does not permit third-party software including crawlers, bots, plug-ins, or extensions that scrape or automate activity on LinkedIn’s website. citeturn3search1turn3search5  
- entity["company","Indeed","job search company"] includes explicit “Site Rules” prohibiting automated access/data mining without permission, and specifically prohibits “any automated system (bots, scrapers, spiders, AI or Agentic AI)” to access or data-mine the site without express written permission (with limited conditional permission only as outlined in robots.txt). citeturn5view2  
- entity["company","Google","search and cloud company"] Terms include prohibitions on using automated means to access content from services in violation of machine-readable instructions (e.g., robots.txt). citeturn3search3

**Operationally:** treat LinkedIn/Indeed-origin links as (a) “leads” to resolve to employer ATS or (b) non-ingestable records unless you have a partnership/license or compliant feed. Otherwise, your pipeline will oscillate between partial data, bans, and expensive headless retries.

### Raw storage: S3 immutability is not automatic and has sharp edges

Dumping raw HTML/JSON to S3 is the right design pattern; the failure is assuming “S3 == immutable.” Immutability requires explicit controls.

- Amazon’s documentation states S3 Object Lock provides WORM protection to prevent deletion/overwrite for a retention period or indefinitely. citeturn0search3turn0search7  
- AWS also documents a key pitfall: Object Lock **does not protect you if you lose or delete encryption keys** (e.g., deleting the AWS KMS key used for SSE-KMS can render objects unreadable). citeturn0search11  
- S3 itself provides strong read-after-write and list consistency, which reduces “eventual consistency” ingestion races but does not provide immutability. citeturn2search3turn2search6

**Pre-mortem failure mode:** a production “cleanup” script or lifecycle misconfiguration deletes or overwrites “raw snapshots,” and your dedupe/extraction becomes non-reproducible.

### LLM extraction: prompt injection, hallucinations, schema drift, and model DoS

If you feed arbitrary third-party HTML to a model, you must assume:
- Inputs can be adversarial.
- Outputs can be confident but wrong.

OWASP’s Top 10 for LLM Applications explicitly highlights **Prompt Injection** as a primary risk class (LLM01), and also includes risks like Model DoS (overloading models with resource-heavy operations). citeturn10search0turn10search4

Hallucination is a documented, systemic phenomenon in LLMs; surveys summarize causes, detection, and mitigation strategies and emphasize that hallucinations undermine reliability when outputs are not grounded. citeturn10search3turn10search24

For your use case (salary, remote policy, seniority, tech stack), hallucinations are not an “edge case”—they are a normal mode unless you enforce:
- **Schema adherence** and enum boundaries (to prevent “invalid but plausible” values). OpenAI’s Structured Outputs explicitly claims adherence to JSON Schema to reduce omitted keys and invalid enums. citeturn10search2turn10search10  
- **Field-level confidence** and “unknown” states (so you never fabricate salary/remote eligibility).

### OpenSearch hybrid + strict filters: recall/latency tradeoffs and clause limits

Hybrid in entity["organization","OpenSearch","search engine project"] is not “BM25 + vector.” It requires a search pipeline to normalize and combine scores, because BM25 and k-NN scores are on different scales; the normalization processor exists explicitly for this purpose. citeturn0search5turn7search0

Hard constraints you must design around:

- The OpenSearch **hybrid query** combines scores via pipeline and has a **maximum of 5 query clauses**, with a top-level `filter` applied to all subqueries. citeturn7search0  
- The OpenSearch **k-NN query** documents that `filter` can only be used with **faiss or lucene engines**, and that increasing `ef_search` improves recall at the cost of increased latency (and similarly `nprobes` for IVF). citeturn2search4  
- OpenSearch provides guidance that filtered vector search needs configuration choices that trade off recall vs latency. citeturn2search1turn2search8  
- OpenSearch also documents constraint surfaces for strict boolean: `terms` query defaults to **65,536 max terms**, and `indices.query.bool.max_clause_count` defines the maximum product of fields and terms queryable simultaneously (default noted as 1024 in index settings docs and referenced in query-string docs). citeturn9search1turn9search6turn9search11

Indexing throughput is also easily self-inflicted. OpenSearch recommends disabling replicas during heavy indexing because each replica duplicates native index construction, and disabling refresh interval to avoid many small segments—both must be re-enabled afterwards. citeturn2search2turn2search5turn2search26

## Entity Resolution & Deduplication

### Canonical model: observed listings vs canonical jobs vs job families

To prevent “the same Garmin job appears 3 times,” your core data model must separate:

- **Observed listing**: one URL from one source at one time (“Google Jobs result,” “Greenhouse posting,” “Indeed mirror”).
- **Canonical job version**: the deduped entity users see once as an active posting.
- **Job family**: the employer’s recurring role lineage across reposts/versions (e.g., “Backend Engineer II – Platform” reopened monthly).

This design allows you to keep provenance while guaranteeing a single displayed job. It also allows “Garmin reposted the same role” to become **a new version under the same family**, not an accidental merge into an old closed post.

### Deterministic dedupe pipeline: stages and keys

You need a two-phase dedupe: **deterministic linking** first (high precision), then **near-duplicate clustering** (high recall) with human review for ambiguous cases.

#### Ingestion invariants and idempotent keys

1. **Discovery event idempotency key**
   - `discovery_key = hash(provider, task_id, job_id)`  
   DataForSEO returns task identifiers and job IDs. This is your “never ingest the same discovery item twice” fence. citeturn12view0turn14view0

2. **Listing idempotency key**
   - `listing_key = hash(source_system, canonical_url)` (when a canonical URL is stable)
   - plus optional `source_job_id` (ATS job id / requisition id) when available

3. **Raw snapshot idempotency key**
   - `snapshot_key = hash(listing_id, content_sha256)` (so 20 retries of the same content do not create 20 snapshot rows)

4. **Canonical job upsert key**
   - `canonical_fingerprint = sha256(company_id + normalized_title + normalized_location + req_id(if present) + normalized_apply_url(if present) + content_signature)`  
   This is the primary “no duplicate canonical job rows” fence.

#### Deterministic linking: “hard keys” (auto-merge safe)

Auto-merge immediately when at least one hard key matches:

- **ATS stable job identifier** (excellent when present): `(ats_system, ats_account_id, ats_job_id)`
- **Employer requisition ID** if reliably extracted (still validate; some companies reuse req IDs)
- **Exact canonical apply URL** after redirect resolution and tracker stripping

This is the reliable way to prevent triple rows *even when descriptions differ* (e.g., Indeed truncation vs Greenhouse full text).

#### Candidate generation (blocking): scalable dedupe for millions of records

Near-duplicate scoring cannot be O(N²). You must implement blocking keys for candidate generation.

A robust blocking strategy for national scale:
- Primary block: `(company_id, title_bucket, geo_bucket)`  
  - `title_bucket`: normalized title with seniority tokens normalized (“Software Engineer II”, “SWE 2”)
  - `geo_bucket`: metro or remote-eligibility bucket
- Secondary block: `(company_id, req_id)` when extracted
- Tertiary block: `(company_domain, title_bucket)` when company_id is uncertain (early ingest)

Blocking is where most dedupe systems fail: blocks that are too wide explode candidate volume; blocks that are too narrow miss duplicates.

#### Similarity scoring: SimHash + MinHash + structured signals

For messy HTML and brokered listings, combine text similarity methods designed for web-scale dedupe:

- **SimHash**: small fingerprints for near-duplicate web pages; widely used in web crawling contexts. citeturn8search2turn8search6  
- **MinHash** (from shingling) for estimating resemblance/containment between documents. citeturn8search1turn8search17  

Compute fingerprints on **cleaned text** (rendered text + normalized title + normalized location) rather than raw HTML.

Add structured signals (all normalized):
- title token similarity (high weight)
- company identity confidence (high weight)
- geo match (exact lat/lon window or metro id)
- employment type / remote policy match
- salary overlap (downweight because extraction error is common)
- tech-stack overlap (downweight; extraction noise)

#### Decision thresholds: auto-merge vs review vs split

You need explicit thresholds and a path for human resolution.

A practical three-band policy:

- **Auto-merge**
  - Any hard key match, OR
  - Extremely high similarity: e.g., SimHash Hamming distance very low *and* MinHash-estimated Jaccard high, *and* key structured fields match (company + title bucket + geo bucket).
- **Review queue**
  - High similarity but one major field conflict (remote policy differs, location differs, salary differs materially).
- **Do not merge**
  - Similar titles but different req IDs, significantly different responsibilities/requirements, or different primary location buckets.

The thresholds must be calibrated with your own data, but the architecture must support threshold-ed decisions and auditability. SimHash’s appeal is its compactness and suitability for large-scale comparisons; MinHash grounds resemblance estimation under shingling. citeturn8search2turn8search1

### Job family vs job version: preventing over-merge across reposts

HNSW/vector search papers are relevant here because they reveal a broader truth: similarity structure is graph-like and local, but filtering/constraints change the effective neighborhood. citeturn8search0turn8search26 By analogy, job reposts look “near duplicate” in text space but are distinct in lifecycle state.

Rules to create a new job version under the same family:

- The same role family (company + title bucket + department/category) but a **new posting window** (e.g., `date_posted` jumps, or `valid_through` extends after closure).
- The same req ID but a significant time gap and explicit reactivation.
- “Closed” status then reappears across discovery cycles.

### Operational review flow: what prevents dedupe regressions

You need a dedicated operational loop:

- **Review queue UI** with “merge / split / create new family / mark as repost” actions; store reviewer decisions and features for retraining thresholds.
- **Daily audit sampling** by (a) top employers, (b) high-velocity roles, (c) high-complaint queries.
- **Merge safety limits** (circuit breakers): if merge rate spikes or many merges are later reversed, halt auto-merging and require review.

### Table: candidate blocking keys, similarity signals, merge actions

| Blocking key (candidate generation) | What it catches | False-merge risk | Similarity signals to compute | Merge action policy |
|---|---|---|---|---|
| `(ats_system, ats_account_id, ats_job_id)` | Same ATS job posted via multiple domains | Very low | None required beyond key match | Auto-merge into same canonical job version |
| `(company_id, req_id)` | Same req mirrored across sources | Low–medium (req reuse exists) | Title similarity + geo bucket match | Auto-merge if consistent; otherwise review |
| `(canonical_apply_url_hash)` | Same apply target (after redirects + param stripping) | Medium (tracking/shorteners) | Validate company + title bucket | Auto-merge when company confidence is high |
| `(company_id, title_bucket, metro_id)` | Most duplicates for a single employer in a region | Medium | SimHash + MinHash + structured field agreement | Auto-merge only above high threshold; else review |
| `(company_domain, title_bucket)` when company uncertain | Early-stage company resolution errors | High | Company resolution confidence + text similarity | Review (do not auto-merge) |
| `(title_bucket, metro_id)` for cold-start (no company) | Entry dedupe before company resolution | Very high | Strong text similarity + employer name string match | Review only; never auto-merge |

## Cost & Throughput Bottlenecks

This section quantifies orders-of-magnitude behaviors using explicit limits from official docs and reasonable “national scale” assumptions. Where you have no vendor pricing numbers (LLMs, enrichment), the analysis uses *cost-driver formulas* rather than invented price points.

### Scale assumptions for analysis

Assume:
- **Active jobs/day**: 100k–300k
- **Total canonical job history**: millions
- **Listings observed/day (pre-dedupe)**: 2×–10× active jobs (duplicates + brokers)
- **Freshness SLA**: same-day or <24h for high-demand roles

These assumptions are consistent with aggregator realities; the real driver is duplicates and reposts. Your system must therefore scale on observed listings, not just canonical jobs.

### Discovery throughput: DataForSEO task limits and retrieval constraints

DataForSEO’s Google Jobs task endpoint allows **up to 2000 API calls/minute**, with **no more than 100 tasks per POST**. citeturn12view0 This is high throughput, but it creates a structured bottleneck:

- Your discovery scheduler must batch tasks into 100-task POSTs, manage backpressure, and track task IDs.
- Over-polling Tasks Ready is constrained: DataForSEO Tasks Ready supports **up to 20 calls/min**, returning **1000 tasks per call**, and tasks must be collected within **three days**. citeturn13view0

**Mitigation patterns**
- Prefer pingback/postback for high volume; DataForSEO recommends that explicitly above ~1000 tasks/min collection rates. citeturn13view0
- Implement an “exactly-once” ingestion ledger keyed by `(provider_task_id, provider_job_id)` to eliminate postback/poll duplication caused by timeouts (10s). citeturn12view0
- Replace ZIP-level discovery with metro/region rollups and a measured crawl budget (query yield dashboards).

### Scraping throughput: headless is the dominant compute cost under adversarial bot defenses

Headless is expensive because it scales by concurrency × time-per-page, and time-per-page is highly variable under bot defenses.

Browserless explicitly sells:
- concurrency tiers and monthly units, plus residential proxies citeturn3search0turn3search16
- CAPTCHA solving that “can take several seconds to minutes,” with unit cost per solve citeturn3search4

**Mitigation patterns**
- **Tiered rendering**: attempt static fetch → JS-less extraction → lightweight rendering → full headless only for required domains.
- **Policy gating**: do not headless-crawl walled gardens (they are both expensive and ToS-sensitive). citeturn5view2turn3search1turn3search3
- **Session reuse**: persistent sessions/cookies reduce repeated auth/captcha loops (but increase operational complexity and risk exposure).

### LLM extraction: token burn and failure-driven retries

LLM costs scale with:
- input tokens (HTML or extracted text)
- output tokens (full JSON schema)
- retries for invalid outputs / timeouts / model errors
- “model DoS” patterns where adversarial pages cause large contexts or repeated failures (explicitly called out as an LLM risk class by OWASP). citeturn10search0

**Mitigation patterns**
- **Gating**: if structured data or stable ATS JSON exists, skip LLM and parse deterministically.
- **Schema enforcement**: use structured outputs / JSON schema enforcement to reduce parsing retries and invalid enums. citeturn10search2turn10search10
- **Security hardening**: treat HTML as untrusted; prompt injection is a top OWASP LLM risk. citeturn10search0turn10search4
- **Field-level confidence + unknown**: hallucination is normal, per surveys; never force fields to be present. citeturn10search3turn10search24

### OpenSearch: hybrid query cost, filtered k-NN knobs, and indexing load strategy

Query-time costs:
- Hybrid query has a **5-clause maximum** and relies on search pipelines for combining and normalization. citeturn7search0turn0search5
- Filtered k-NN requires engine alignment (faiss/lucene), and higher `ef_search` improves recall but increases latency. citeturn2search4
- Filtered vector search requires configuration choices that explicitly trade recall vs latency. citeturn2search1turn2search8
- Strict boolean can trip clause/term limits (`index.max_terms_count`, `indices.query.bool.max_clause_count`). citeturn9search1turn9search6turn9search11

Indexing-time costs:
- Disabling replicas and refresh interval is recommended for heavy indexing to avoid duplicated index construction and excessive segment creation—then you must re-enable. citeturn2search2turn2search5turn2search26
- AWS guidance suggests starting bulk request sizes around 5–15 MiB and tuning. citeturn2search16

**Mitigation patterns**
- Precompute and denormalize filter facets needed for strict filters (remote policy, metro id, salary bands, skills tags) so filters are cheap term/range queries.
- Use hybrid pipelines with explicit score normalization and weighting; use hybrid score explanation tooling in non-prod for debugging scoring. citeturn7search1turn7search0
- Separate “freshness indexing” (small daily increments) from “backfill indexing” (bulk loads with replicas off).

### Cost/throughput comparison table

| Component | Primary cost driver | Throughput/limit reality | Most effective mitigation |
|---|---|---|---|
| Discovery via DataForSEO | task volume + depth | 2000 calls/min, 100 tasks/POST; postback timeout→Tasks Ready; Tasks Ready 20 calls/min, 1000 tasks/call, 3-day window citeturn12view0turn13view0 | Crawl budget + pingback/postback-first + idempotent ingestion ledger |
| HTTP scraping | bandwidth + retries | dominated by redirect variance, block rates | strict success criteria + caching + avoid refetching unchanged pages |
| Headless scraping | time × concurrency + bot battles | CAPTCHA can take seconds–minutes; unit-cost per solve; residential proxy costs citeturn3search4turn3search16turn3search0 | tiered rendering + stop crawling walled gardens + session reuse where legally permitted |
| Celery/queue | duplicate execution + retries | at-least-once by design; ack/retry semantics can duplicate work citeturn6view0turn0search10 | DB-enforced idempotency keys + short timeouts + task-level circuit breakers |
| LLM extraction | tokens + retries + hallucination cleanup | prompt injection + schema drift + model DoS risks citeturn10search0turn10search2turn10search3 | gating + schema enforcement + field confidence + “unknown” |
| Firmographics enrichment | per-call API cost + rate limits | vendor-dependent; data drift | cache company enrichment; asynchronous refresh |
| OpenSearch hybrid search | filtered k-NN + pipeline scoring | ef_search recall/latency; filter engine constraints; hybrid clause limit 5 citeturn2search4turn7search0 | denormalized facets + tuned ef_search + hybrid pipeline tuning |
| OpenSearch indexing | segment churn + replica duplication | disable refresh/replicas for bulk indexing recommended citeturn2search2turn2search5 | bulk sizing tuning + staged indexing + reindex runbooks |

## Canonical Schema

This section provides PostgreSQL DDL for: `companies`, `jobs`, `job_listings`, `job_raw_snapshots` (plus minimal supporting tables for job families and review), recommended extensions, idempotent upsert SQL, and operational runbook notes.

### Recommended PostgreSQL extensions

- `pgcrypto` for UUID/key material (e.g., `gen_random_uuid`) citeturn15search5turn15search17  
- `citext` for case-insensitive domains and canonical identifiers without repeated `lower()` calls citeturn15search0  
- `postgis` for geo points and meter-accurate distance operations (geography distance semantics) citeturn15search10  
- `vector` (pgvector) optional for offline evaluation/admin similarity checks; IVFFlat vs HNSW tradeoffs are documented in pgvector docs citeturn15search3turn15search11  

### PostgreSQL DDL

```sql
-- Extensions (enable what you use; pgvector is optional)
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS postgis;
-- Optional:
-- CREATE EXTENSION IF NOT EXISTS vector;

-- Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employment_type') THEN
    CREATE TYPE employment_type AS ENUM ('full_time','part_time','contract','intern','temporary','unknown');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'remote_policy') THEN
    CREATE TYPE remote_policy AS ENUM ('on_site','hybrid','remote','unknown');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'salary_period') THEN
    CREATE TYPE salary_period AS ENUM ('hour','day','week','month','year','unknown');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
    CREATE TYPE job_status AS ENUM ('active','closed','unknown');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'source_system') THEN
    CREATE TYPE source_system AS ENUM (
      'google_jobs_dataforseo',
      'greenhouse',
      'lever',
      'workday',
      'taleo',
      'company_careers_site',
      'indeed',
      'linkedin',
      'other'
    );
  END IF;
END $$;

-- Updated-at trigger helper
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

-- Companies (canonical)
CREATE TABLE IF NOT EXISTS companies (
  company_id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name_canonical            TEXT NOT NULL,
  name_normalized           TEXT NOT NULL,

  website_domain            CITEXT,        -- e.g. "garmin.com"
  website_url               TEXT,

  -- Optional identity pointers
  linkedin_company_url      TEXT,

  -- Firmographics (optional)
  hq_city                   TEXT,
  hq_state                  TEXT,
  hq_country                TEXT,
  industry_tags             TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  employee_count_min        INTEGER CHECK (employee_count_min IS NULL OR employee_count_min >= 0),
  employee_count_max        INTEGER CHECK (employee_count_max IS NULL OR employee_count_max >= 0),
  company_description       TEXT,

  firmographics_provider    TEXT,
  firmographics_updated_at  TIMESTAMPTZ,

  is_blocklisted            BOOLEAN NOT NULL DEFAULT FALSE,
  blocklist_reason          TEXT,

  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS companies_website_domain_uq
  ON companies (website_domain)
  WHERE website_domain IS NOT NULL;

CREATE INDEX IF NOT EXISTS companies_name_norm_idx
  ON companies (name_normalized);

CREATE TRIGGER companies_set_updated_at
BEFORE UPDATE ON companies
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Company aliases (minimal support for entity resolution)
CREATE TABLE IF NOT EXISTS company_aliases (
  company_alias_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id                UUID NOT NULL REFERENCES companies(company_id),

  alias                      TEXT NOT NULL,
  alias_normalized           TEXT NOT NULL,

  source                     TEXT,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS company_aliases_norm_idx
  ON company_aliases (alias_normalized);

-- Job families (role lineage across reposts)
CREATE TABLE IF NOT EXISTS job_families (
  job_family_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id                UUID NOT NULL REFERENCES companies(company_id),

  title_bucket              TEXT NOT NULL,   -- normalized title bucket
  family_key_sha256         BYTEA NOT NULL,  -- sha256(company_id + title_bucket + dept if present)

  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS job_families_family_key_uq
  ON job_families (family_key_sha256);

-- Canonical job versions (what users see as "one job")
CREATE TABLE IF NOT EXISTS jobs (
  job_id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id                UUID NOT NULL REFERENCES companies(company_id),
  job_family_id             UUID NOT NULL REFERENCES job_families(job_family_id),

  -- Canonical fields
  title_canonical           TEXT NOT NULL,
  title_normalized          TEXT NOT NULL,
  description_clean         TEXT NOT NULL,

  employment_type           employment_type NOT NULL DEFAULT 'unknown',
  remote_policy             remote_policy NOT NULL DEFAULT 'unknown',

  -- Geo (primary)
  primary_city              TEXT,
  primary_state             TEXT,
  primary_country           TEXT,
  primary_location_point    GEOGRAPHY(POINT, 4326),
  metro_id                  TEXT,            -- your taxonomy

  -- Remote/applicant eligibility rules (normalize later if possible)
  applicant_location_rules  JSONB NOT NULL DEFAULT '{}'::JSONB,

  -- Compensation (nullable)
  salary_min                NUMERIC(12,2) CHECK (salary_min IS NULL OR salary_min >= 0),
  salary_max                NUMERIC(12,2) CHECK (salary_max IS NULL OR salary_max >= 0),
  salary_currency           CHAR(3),
  salary_period             salary_period NOT NULL DEFAULT 'unknown',
  salary_is_estimated       BOOLEAN NOT NULL DEFAULT FALSE,

  -- Facets for strict filtering
  seniority_level           TEXT,
  years_experience_min      NUMERIC(4,1) CHECK (years_experience_min IS NULL OR years_experience_min >= 0),
  years_experience_max      NUMERIC(4,1) CHECK (years_experience_max IS NULL OR years_experience_max >= 0),
  tech_stack                TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  visa_sponsorship          BOOLEAN,
  security_clearance        TEXT,

  -- Lifecycle
  status                    job_status NOT NULL DEFAULT 'unknown',
  status_confidence         NUMERIC(3,2) NOT NULL DEFAULT 0.00 CHECK (status_confidence BETWEEN 0 AND 1),
  date_posted               TIMESTAMPTZ,
  valid_through             TIMESTAMPTZ,
  first_seen_at             TIMESTAMPTZ NOT NULL,
  last_seen_at              TIMESTAMPTZ NOT NULL,
  last_verified_open_at     TIMESTAMPTZ,

  -- Dedupe fingerprints
  canonical_fingerprint_sha256  BYTEA NOT NULL,
  simhash64_bits            BIT(64),         -- use BIT(64) for easy hamming distance

  -- Extraction lineage
  extractor_name            TEXT NOT NULL,
  extractor_version         TEXT NOT NULL,
  extracted_at              TIMESTAMPTZ NOT NULL,
  extraction_warnings       TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT salary_range_check
    CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_max >= salary_min)
);

CREATE UNIQUE INDEX IF NOT EXISTS jobs_fingerprint_uq
  ON jobs (canonical_fingerprint_sha256);

CREATE INDEX IF NOT EXISTS jobs_company_status_idx
  ON jobs (company_id, status, last_seen_at DESC);

CREATE INDEX IF NOT EXISTS jobs_metro_idx
  ON jobs (metro_id);

CREATE INDEX IF NOT EXISTS jobs_remote_idx
  ON jobs (remote_policy);

CREATE INDEX IF NOT EXISTS jobs_tech_stack_gin
  ON jobs USING GIN (tech_stack);

CREATE INDEX IF NOT EXISTS jobs_rules_gin
  ON jobs USING GIN (applicant_location_rules);

CREATE TRIGGER jobs_set_updated_at
BEFORE UPDATE ON jobs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Observed listings from sources (may be unresolved at ingest time)
CREATE TABLE IF NOT EXISTS job_listings (
  job_listing_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  company_id                UUID REFERENCES companies(company_id),
  canonical_job_id          UUID REFERENCES jobs(job_id),

  source_system             source_system NOT NULL,
  source_job_id             TEXT,            -- stable ATS id when available

  source_url_original       TEXT NOT NULL,
  source_url_canonical      TEXT,
  source_url_hash           BYTEA NOT NULL,  -- sha256(canonical_url or original_url)

  -- Discovery identity (DataForSEO and similar)
  discovery_provider        TEXT,
  discovery_task_id         TEXT,
  discovery_item_id         TEXT,

  -- Apply URLs (may be broker vs employer)
  apply_url                 TEXT,
  apply_url_canonical       TEXT,
  apply_url_hash            BYTEA,

  -- Confidence flags
  is_walled_garden          BOOLEAN NOT NULL DEFAULT FALSE,
  can_scrape                BOOLEAN NOT NULL DEFAULT TRUE,
  is_display_apply_source   BOOLEAN NOT NULL DEFAULT FALSE,

  first_seen_at             TIMESTAMPTZ NOT NULL,
  last_seen_at              TIMESTAMPTZ NOT NULL,

  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enforce "one listing row per stable source id" when source_job_id exists
CREATE UNIQUE INDEX IF NOT EXISTS job_listings_source_job_uq
  ON job_listings (source_system, source_job_id)
  WHERE source_job_id IS NOT NULL;

-- Enforce "one listing per URL hash per source system" as a second fence
CREATE UNIQUE INDEX IF NOT EXISTS job_listings_source_urlhash_uq
  ON job_listings (source_system, source_url_hash);

CREATE INDEX IF NOT EXISTS job_listings_unresolved_idx
  ON job_listings (source_system, last_seen_at DESC)
  WHERE canonical_job_id IS NULL;

CREATE INDEX IF NOT EXISTS job_listings_canonical_job_idx
  ON job_listings (canonical_job_id);

CREATE TRIGGER job_listings_set_updated_at
BEFORE UPDATE ON job_listings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Raw snapshots (immutable references into S3)
CREATE TABLE IF NOT EXISTS job_raw_snapshots (
  snapshot_id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_listing_id            UUID NOT NULL REFERENCES job_listings(job_listing_id),

  s3_bucket                 TEXT NOT NULL,
  s3_key                    TEXT NOT NULL,
  s3_version_id             TEXT,

  content_type              TEXT,
  content_bytes             BIGINT CHECK (content_bytes IS NULL OR content_bytes >= 0),
  content_sha256            BYTEA NOT NULL,

  fetched_at                TIMESTAMPTZ NOT NULL,
  fetch_status_code         INTEGER,
  fetch_error               TEXT,

  created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Avoid infinite duplicate rows from retries with identical content for the same listing
CREATE UNIQUE INDEX IF NOT EXISTS job_raw_snapshots_listing_content_uq
  ON job_raw_snapshots (job_listing_id, content_sha256);

CREATE INDEX IF NOT EXISTS job_raw_snapshots_listing_time_idx
  ON job_raw_snapshots (job_listing_id, fetched_at DESC);
```

### Idempotent upsert examples (ON CONFLICT)

**Canonical job upsert** (keyed by `canonical_fingerprint_sha256`):

```sql
INSERT INTO jobs (
  company_id, job_family_id,
  title_canonical, title_normalized, description_clean,
  employment_type, remote_policy,
  metro_id, applicant_location_rules,
  salary_min, salary_max, salary_currency, salary_period, salary_is_estimated,
  seniority_level, years_experience_min, years_experience_max, tech_stack,
  status, status_confidence,
  date_posted, valid_through, first_seen_at, last_seen_at, last_verified_open_at,
  canonical_fingerprint_sha256, simhash64_bits,
  extractor_name, extractor_version, extracted_at, extraction_warnings
) VALUES (
  $1, $2,
  $3, $4, $5,
  $6, $7,
  $8, $9,
  $10, $11, $12, $13, $14,
  $15, $16, $17, $18,
  $19, $20,
  $21, $22, $23, $24, $25,
  $26, $27,
  $28, $29, $30, $31
)
ON CONFLICT (canonical_fingerprint_sha256)
DO UPDATE SET
  last_seen_at = GREATEST(jobs.last_seen_at, EXCLUDED.last_seen_at),
  status = CASE
    WHEN EXCLUDED.status_confidence > jobs.status_confidence THEN EXCLUDED.status
    ELSE jobs.status
  END,
  status_confidence = GREATEST(jobs.status_confidence, EXCLUDED.status_confidence),
  description_clean = CASE
    WHEN length(EXCLUDED.description_clean) > length(jobs.description_clean) THEN EXCLUDED.description_clean
    ELSE jobs.description_clean
  END,
  tech_stack = CASE
    WHEN array_length(EXCLUDED.tech_stack, 1) > array_length(jobs.tech_stack, 1) THEN EXCLUDED.tech_stack
    ELSE jobs.tech_stack
  END,
  extracted_at = GREATEST(jobs.extracted_at, EXCLUDED.extracted_at),
  extractor_version = EXCLUDED.extractor_version;
```

**Listing upsert** (keyed by `(source_system, source_url_hash)`):

```sql
INSERT INTO job_listings (
  source_system, source_job_id,
  source_url_original, source_url_canonical, source_url_hash,
  discovery_provider, discovery_task_id, discovery_item_id,
  apply_url, apply_url_canonical, apply_url_hash,
  is_walled_garden, can_scrape, is_display_apply_source,
  first_seen_at, last_seen_at
) VALUES (
  $1, $2,
  $3, $4, $5,
  $6, $7, $8,
  $9, $10, $11,
  $12, $13, $14,
  $15, $16
)
ON CONFLICT (source_system, source_url_hash)
DO UPDATE SET
  last_seen_at = GREATEST(job_listings.last_seen_at, EXCLUDED.last_seen_at),
  source_url_canonical = COALESCE(job_listings.source_url_canonical, EXCLUDED.source_url_canonical),
  apply_url_canonical = COALESCE(job_listings.apply_url_canonical, EXCLUDED.apply_url_canonical),
  can_scrape = job_listings.can_scrape AND EXCLUDED.can_scrape;
```

### Sample queries

**Find unresolved listing candidates for dedupe** (block by company + title bucket + metro):

```sql
-- Example assumes you have parsed/filled company_id and a title bucket for the listing.
-- Here we approximate title_bucket with title_normalized prefix; production uses a real bucket column.
SELECT
  l.job_listing_id,
  j.job_id,
  j.title_canonical,
  j.metro_id,
  j.last_seen_at
FROM job_listings l
JOIN jobs j
  ON j.company_id = l.company_id
 AND j.metro_id IS NOT DISTINCT FROM (SELECT metro_id FROM jobs WHERE job_id = j.job_id) -- placeholder if l has metro stored elsewhere
WHERE l.canonical_job_id IS NULL
  AND l.company_id IS NOT NULL
ORDER BY j.last_seen_at DESC
LIMIT 200;
```

**Compute SimHash Hamming distance in SQL** (when both sides have `BIT(64)`):

```sql
-- If you store listing simhash in a staging table, you can do:
SELECT
  j.job_id,
  bit_count(j.simhash64_bits # s.simhash64_bits) AS hamming_distance
FROM jobs j
JOIN staging_listing_simhash s ON s.job_listing_id = $1
WHERE j.company_id = s.company_id
ORDER BY hamming_distance ASC
LIMIT 20;
```

**Backfill canonical_job_id for listings using a resolved fingerprint mapping**:

```sql
-- Suppose you produced a mapping table listing_to_fingerprint(job_listing_id, canonical_fingerprint_sha256)
UPDATE job_listings l
SET canonical_job_id = j.job_id
FROM listing_to_fingerprint m
JOIN jobs j ON j.canonical_fingerprint_sha256 = m.canonical_fingerprint_sha256
WHERE l.job_listing_id = m.job_listing_id
  AND l.canonical_job_id IS NULL;
```

### Operational runbook snippets

**Duplicate storm (sudden triple-count in UI)**
- Immediately disable auto-merge and auto-publish; keep ingest running but freeze canonical updates.
- Identify the triggering idempotency fence that failed: discovery ledger, listing_url_hash unique constraint, or canonical_fingerprint unique constraint.
- Recompute/repair canonical IDs from job_listings → jobs with deterministic replay (raw snapshots are the source of truth; use S3 Object Lock-retained snapshots if configured). citeturn0search3turn0search7

**Mass reindex (OpenSearch rebuild)**
- Bulk export canonical jobs from Postgres.
- Disable replicas and refresh interval during bulk load; re-enable after ingestion. citeturn2search2turn2search5turn2search26
- Start bulk sizing in the 5–15 MiB range and tune. citeturn2search16
- Validate hybrid pipeline behavior and use hybrid score explanation tooling during tuning. citeturn7search1turn7search0

**Headless farm outage / bot-defense escalation**
- Fail over to HTTP-only scraping tier; degrade gracefully by displaying last-known canonical job fields and deferring enrichments.
- Mark affected domains as “headless-required” and “cooldown,” preventing retry storms that burn budget.
- For walled gardens, stop scraping entirely and treat as leads pending compliant resolution (ToS risk). citeturn5view2turn3search1turn3search3