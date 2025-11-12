# Tailored Job Search Strategy and Configuration

## Overview

This strategy focuses on finding **senior-level technical and sales roles** in specific cities, with a high salary range and recent postings. The search will target positions in **Kansas City (MO)**, **Colorado Springs (CO)**, **Salt Lake City (UT)**, and **Las Vegas (NV)**, within a **35-mile radius** of each city. By limiting results to jobs posted in the **last 72 hours**, we prioritize fresh opportunities – an approach supported by evidence that applying within the first 48 hours of a posting significantly boosts interview odds[autoapplier.com](https://www.autoapplier.com/blog/best-day-to-apply-for-jobs#:~:text=A growing body of evidence,among the first not only). The goal is to identify roles such as Senior/Staff/Principal positions in **Technical**, **Technical Sales**, **Sales**, or **Management** categories, especially those involving **Azure cloud**, **LIMS** (Laboratory Information Management Systems), batch processing, data **historians**, **PreSales** engineering, or **pharma** industry expertise. Roles that are internships, unpaid, or volunteer are explicitly filtered out. By using a structured configuration (shown in JSON format below) to drive the search, all key parameters are easily adjustable without code changes – the city names, keywords, and other criteria are **variablized** for flexibility[wmglab-duke-ascent.readthedocs.io](https://wmglab-duke-ascent.readthedocs.io/en/latest/JSON/JSON_overview.html#:~:text=JSON Configuration File Overview).

## Key Search Parameters

The job search is governed by a set of configurable parameters (as seen in the JSON config). Each parameter can be tuned as needed, ensuring the search remains flexible and easily updatable[wmglab-duke-ascent.readthedocs.io](https://wmglab-duke-ascent.readthedocs.io/en/latest/JSON/JSON_overview.html#:~:text=JSON Configuration File Overview). The main parameters include:

- **Cities & Radius** – A list of target cities with a search radius. For example, `{"name": "Colorado Springs, CO", "radius_miles": 35}` means jobs within 35 miles of Colorado Springs city center are included. This captures opportunities in the broader metro area rather than just the city limits. Each city is a variable, so new locations can be added or changed easily.
- **Job Categories** – The categories of roles to focus on: e.g. `"Sales"`, `"Technical Sales"`, `"Management"`, `"Technical"`. These act as filters or search terms to narrow results to relevant functional areas. They are defined as a list so they can be modified or expanded (making them mutable).
- **Salary Range (USD)** – A target salary range defined by `"min": 140000` and `"max": 300000`. This helps filter out jobs with compensation outside the desired range. If the job sources provide salary info, we will include only those within $140k–$300k.
- **Remote Work Modes** – Specifies acceptable work arrangements: `["remote","hybrid","onsite"]`. This indicates flexibility to include fully remote jobs, hybrid (partially remote) roles, and on-site positions. If a particular search needed only remote jobs, this list can be adjusted accordingly. Many job platforms allow filtering by remote/on-site, aligning with our configuration[apify.com](https://apify.com/assertive_analogy/job-listings-aggregator#:~:text=,Exclude jobs with certain keywords).
- **Posting Recency** – `posted_within_hours: 72` restricts to jobs posted in the last 3 days. Focusing on recent postings ensures we apply early. Early applicants can have a much better chance of getting noticed – one analysis suggests being among the first within 48 hours **drastically improves** your interview odds[autoapplier.com](https://www.autoapplier.com/blog/best-day-to-apply-for-jobs#:~:text=A growing body of evidence,among the first not only).
- **Include Keywords** – A list of must-have keywords like `"Azure"`, `"LIMS"`, `"Batch"`, `"Historians"`, `"PreSales"`, `"Pharma"`. Job listings must contain at least one of these terms (in the title or description) to be considered. This ensures the roles are relevant to the specific technical domain or industry of interest. For example, requiring "LIMS" or "Pharma" will surface roles in pharmaceutical tech or biotech companies.
- **Exclude Keywords** – A list of terms to **filter out** undesired roles: e.g. `"Intern"`, `"Unpaid"`, `"Volunteer"`. Any posting containing these words (likely internships or unpaid opportunities) will be skipped. Many job search tools offer such exclusion filters to weed out irrelevant posts[apify.com](https://apify.com/assertive_analogy/job-listings-aggregator#:~:text=,Exclude jobs with certain keywords)[apify.com](https://apify.com/assertive_analogy/job-listings-aggregator#:~:text=,Exclude jobs with certain keywords).
- **Seniority Level** – Targeted seniority keywords: `["Senior","Staff","Principal"]`. These indicate the level of roles we want. We will prefer or specifically search for job titles containing these terms. (In practice, this might be implemented by adding these terms to the include keywords or filtering results by title.) This focus on higher seniority aligns with the high salary range.
- **Max Results per City** – Limits the number of results fetched per city to 50. This cap prevents overload and ensures we review only the top 50 matches from each location. It’s a safeguard so that even if a city has many postings, we only handle a manageable subset (likely the most relevant ones first).
- **Weighting (100-point distribution)** – A weighting scheme to prioritize cities, categories, and source types. The config specifies weights (out of 100) for each city, category, and source type, reflecting their relative importance. For example, **Las Vegas** is weighted `40` (the highest), indicating it’s the top priority location, whereas Colorado Springs is `15` (lower priority). Similarly, **Technical** and **Technical Sales** categories are weighted much higher (40 each) than pure Sales or Management (10 each), emphasizing a preference for technical roles. And for sources: **Company Boards** (direct company career sites) are given 60% weight, **Aggregators** (job boards like Indeed, LinkedIn) 25%, and **Referrals/Recruiters** 15%. This suggests the search should focus primarily on company job pages, while still considering aggregator sites and some recruiter/referral leads. (Notably, while referrals are weighted lowest in volume here, they are often extremely effective; studies show referred candidates can be ~7 times more likely to get hired than those from job boards[pinpointhq.com](https://www.pinpointhq.com/insights/referrals-are-7x-more-likely-to-be-hired-than-job-board-candidates/#:~:text=Referred candidates are 7x more,to an organization’s DEI goals). The lower weight likely reflects their smaller share of available leads, not their value if obtained.) We can use these weights to **score or rank** the collected jobs – for instance, a job in Las Vegas (40) in a Technical category (40) from a company board (60) would score highly. This helps decide which opportunities to prioritize first.
- **Daily Activity Caps** – To balance quality and avoid burnout, the plan sets daily limits: at most **6 tailored resumes** (job applications) and **10 outreach contacts** per day. This means each day you focus on up to six high-quality applications (customizing your resume/cover letter for each) and reach out to up to ten people (such as networking contacts or recruiters) regarding job leads. These numbers align with a quality-over-quantity philosophy. Career experts often suggest **2–3 applications per day** (around 10–15 per week) as a strategic target[indeed.com](https://www.indeed.com/career-advice/finding-a-job/how-many-job-applications-per-day#:~:text=How many job applications per,day should you submit), so 6 is on the higher side but still within a realistic productive range if full-time job searching. The cap prevents spreading efforts too thin and ensures each application or outreach is well-prepared.
- **File Naming Convention** – A template for saving files (like job descriptions or customized resumes) in a consistent format: `"YYYY-MM-DD - <Company> - <Role>.pdf"`. Here `<Company>` and `<Role>` are placeholders that will be replaced with the actual company name and job title for each listing. For example, an application to Acme Corp for a Senior Engineer role on 2025-11-07 would produce a file named `2025-11-07 - Acme Corp - Senior Engineer.pdf`. Using a standardized naming scheme makes files easily sortable by date and identifiable by contents. It’s also a reminder to include the date of application and the specific position in the filename.

All these parameters are defined in one JSON configuration file, separating them from the code. This design means **names and keywords are not hard-coded** in the program – they can be edited in the config to search in new cities or for different skills without modifying the script. Storing search criteria in a JSON file is a best practice because JSON is human-readable and serves as a single source of truth for the pipeline’s inputs[wmglab-duke-ascent.readthedocs.io](https://wmglab-duke-ascent.readthedocs.io/en/latest/JSON/JSON_overview.html#:~:text=JSON Configuration File Overview). It makes the search process **modular and maintainable**, allowing quick tweaks to the job criteria or addition of new filters as your needs change.

## Implementing the Search and Filters

With the configuration in place, the next step is implementing a search process that uses these criteria. We need to interface with job listing sources (such as job board websites, APIs, or company career pages) to retrieve postings that match our filters. Many modern job aggregator tools or scripts support similar filtering options to those in our config – for example, filtering by keywords (must include or exclude), by location or radius, by posting date, remote-only toggles, etc[apify.com](https://apify.com/assertive_analogy/job-listings-aggregator#:~:text=,Exclude jobs with certain keywords). We can take advantage of such capabilities when available. Key implementation points:

- **City Radius Filtering**: For each target city, ensure the search query or API call includes the location and a 35-mile radius. Some job platforms allow a “radius” or “distance” parameter when searching by city or ZIP code. If we have to manually filter results, we can calculate the distance of a job’s location from the city center (more on this below) and discard any beyond 35 miles. The city center (e.g., “Las Vegas, NV”) can be converted to coordinates via geocoding, and likewise for the job’s location, then distance computed. If using the Google Talent Solution Job Search API, providing a precise address improves location matching[docs.cloud.google.com](https://docs.cloud.google.com/talent-solution/job-search/docs/best-practices#:~:text=Location field), but if not, a custom solution can be used.
- **Keyword Inclusion/Exclusion**: Construct search queries to include required keywords (e.g. use boolean **AND**/OR logic on job boards: `"Senior Technical Sales Azure Pharma"` might ensure those terms are considered). After fetching results, further filter them: drop any whose title or description contains excluded terms like "Intern" or "Volunteer". This two-layer filtering (pre-search and post-fetch) ensures that the final list strictly adheres to our include/exclude lists. Notably, the config’s include keywords like “Azure” or “LIMS” might be uncommon enough that we may need to search broadly for technical roles and then filter descriptions for these terms if the search engine itself doesn’t support multiple required keywords. The exclude list is straightforward to apply by text matching – this aligns with standard job aggregator features that let users filter out listings containing certain words[apify.com](https://apify.com/assertive_analogy/job-listings-aggregator#:~:text=,Exclude jobs with certain keywords).
- **Seniority Filtering**: Since “Senior”, “Staff”, “Principal” are in our criteria, we can incorporate those into the search query (e.g. searching for "Senior Engineer" etc.) or post-filter by job title. Many job postings include seniority in the title (e.g. *Principal Scientist*). By ensuring these terms appear, we focus on higher-level positions. If a platform allows filtering by experience level or job level category, we would use that feature. Otherwise, a simple check on the job title can be done after retrieving results.
- **Remote/Hybrid/Onsite**: Some job APIs and sites let you specify remote vs on-site. For instance, LinkedIn and Indeed have filters for remote jobs. We will include all modes in this search (to not miss on-site roles in the target cities), but if we wanted to narrow down, we could run separate queries or filter results by any remote indicator. Our config keeps flags for each mode, so if in the future we only want remote or hybrid roles, those can be toggled. In code, this could mean adding query keywords ("remote" or filtering out jobs lacking a location for onsite) or using site-specific filters. The presence of these flags in config mirrors how professional job search tools incorporate work arrangement filters[GitHub](https://github.com/ed-andre/betterjobs-snow/blob/1b1cf9e5cd019419ea49eaa27910cbed860c03da/pipeline/dagster_betterjobs/dagster_betterjobs/assets/advanced_job_search.py#L504-L512)[apify.com](https://apify.com/assertive_analogy/job-listings-aggregator#:~:text=,Exclude jobs with certain keywords).
- **Salary Range Filter**: If the source provides structured salary info (some postings list a salary or a range), we would filter out entries below $140k or above $300k. However, many postings don’t list salary explicitly. We might use salary as a secondary criterion – for example, focusing on senior roles often indirectly implies higher salary. If we have an API that can query by salary (like some specialized job search APIs or if we scrape and use an NLP to detect salary in description), we will apply it. Otherwise, this range serves as a guideline while reviewing results.
- **Fetching and Limiting Results**: We will retrieve up to 50 results per city. In practice, that could mean using the first 50 results from each query (since they’re usually ordered by relevance or date). Pagination might be used if a site returns 10–20 results per page. But our cap ensures we don’t overwhelm ourselves with too many leads at once. After fetching, we’ll combine all results (up to 200 total across 4 cities) into a central list for scoring.

## Prioritization with Weighted Scoring

Once we have a pool of job leads that meet the basic criteria, we apply the **weighting_100_ball** scheme to prioritize them. The weights represent the relative importance assigned to each city, category, and source. We can interpret this as a scoring system:

- **City Weight**: Las Vegas (40) > Kansas City (25) > Salt Lake City (20) > Colorado Springs (15). This suggests that an opportunity in Las Vegas is most valuable (perhaps due to personal preference or market conditions), whereas one in Colorado Springs is comparatively less prioritized. We might multiply a job’s score by 0.4 if it’s in Las Vegas, 0.25 if in KC, etc., or simply add these as points. For example, label each job with the city’s weight.
- **Category Weight**: Technical (40) and Technical Sales (40) are the highest, indicating these types of roles are most desired. Pure Sales (10) or Management (10) roles are less favored – possibly only pursued if they also involve technical components. In scoring, if a job’s category matches one of these (we’d have to deduce the category from the title or description), it gets the corresponding points. E.g. a “Sales Engineer” might count as Technical Sales (40), while a “Sales Manager” might fall under Sales or Management (10).
- **Source Weight**: Company Boards (60) are given the most weight, meaning jobs found on company websites are preferred – likely because they indicate a direct application route and less competition than mass-posted jobs. Aggregators (25) have moderate weight, and Referrals/Recruiters (15) the least in this scheme. The rationale could be focusing on roles publicly posted (and thus actively hiring) rather than expending too much effort on recruiter outreach, or it might reflect where the person expects to find most of their leads. It’s worth noting that while our weight for referrals is low in quantity, the quality of referred leads is usually high – referred candidates often have much higher success rates[pinpointhq.com](https://www.pinpointhq.com/insights/referrals-are-7x-more-likely-to-be-hired-than-job-board-candidates/#:~:text=Referred candidates are 7x more,to an organization’s DEI goals). One might choose to override weights if a strong referral comes up despite the low weight.

To combine these, one simple method is to calculate a total score per job: **score = city_weight + category_weight + source_weight** (using the numeric values). The maximum score would be 100 + 100 + 100 if all were scaled to 100, but here each category already sums to 100, so perhaps we treat them as percentages or points out of 100 each. In our case, an ideal job (Las Vegas *and* Technical/Tech Sales *and* found on a company board) would score 40+40+60 = 140 points out of a possible 60+40+40 (if each category’s max is taken) = 140 out of 140. Other jobs will score lower. We can then rank all jobs by this score to see which ones deserve immediate attention. Another approach could be to randomly allocate attention in proportion to these weights (a “100-ball” lottery metaphor: e.g. 40 out of 100 chances go to Las Vegas jobs), but a direct scoring is more straightforward. The outcome is that we won’t just apply first-come-first-served; we will **prioritize** leads in the preferred location/field. For instance, if there are many results, a Technical role in Las Vegas from a company’s site will be at the top of the list, whereas a generic management job in Colorado Springs from a recruiter email would be near the bottom. This ensures time and effort go into the most promising opportunities.

## Calculating Distance to City Center

When a job posting includes a specific address or location, we need to verify it falls within the specified radius (35 miles) of the city center. Also, knowing the distance can help prioritize within a city – e.g., a job 5 miles from the city core vs one right at the 35-mile edge might be considered differently if commute or relocation matters. To calculate this distance, we can use geocoding and the **haversine formula** (great-circle distance). The implementation would work as follows:

1. **Geocode City Centers**: For each city, obtain latitude/longitude coordinates for the city center. This can be done via a geocoding API or library. For example, using Python’s `geopy` library with OpenStreetMap’s Nominatim geocoder: `geolocator.geocode("Kansas City, MO city center")` might return coordinates for Kansas City’s downtown. We will do this once per city and cache the results. In code, we maintain a dictionary of city center coords so we don’t geocode the same city repeatedly[GitHub](https://github.com/samozturk/breeze_task/blob/84667aceabb21900ba15ad1e65c44224c1f30b4d/src/scrapers/geo_loc.py#L8-L16).
2. **Geocode Job Location**: For each job, if an address or at least city/suburb info is available, geocode that into coordinates as well. Some job listings provide a full address or at least a city & state. We can combine the job’s location text with the state to improve accuracy (e.g., "Lees Summit, MO" near Kansas City). Geopy’s `geocode` can handle these, though exact addresses give best results.
3. **Compute Distance**: Using the coordinates, compute the distance between the job location and the target city’s center. The haversine formula calculates distance on a sphere (Earth) given lat/long pairs. We can either implement it directly or use a library function. For instance, `geopy.distance.geodesic((lat1, lon1), (lat2, lon2)).miles` will return distance in miles[GitHub](https://github.com/samozturk/breeze_task/blob/84667aceabb21900ba15ad1e65c44224c1f30b4d/src/scrapers/geo_loc.py#L14-L18). In a custom implementation, we’d convert the lat/long difference to radians and apply the formula[GitHub](https://github.com/wordswithchung/hackbright-project/blob/d714d94038f082c7b3e9eb798c0edce9112957ef/haversine.py#L8-L16). If the distance is greater than 35 miles, that job is outside our radius and should be excluded from the results. If it’s within range, we might also store the distance (say, 10.2 miles) as part of the job’s data for reference. This distance calculation step ensures we truly stick to the intended geographic scope.

By automating this with geolocation lookup, we account for cases where a job’s listed location might not exactly match the city name but is in the metro area. For example, a posting might say “Aurora, CO” (which is near Colorado Springs) – the geocoder and distance check will catch that Aurora is, say, 10 miles from Colorado Springs center, thus included. This approach is akin to how one might post-process search results to enforce a radius filter when the search API itself lacks that precision.

## Workflow and Output

Each day, using this configuration, the workflow could be:

1. **Retrieve New Postings**: Query the chosen sources (company career pages, job boards, etc.) for each city with the given filters (category, keywords, freshness). Compile the list of matches.
2. **Filter & Enrich Data**: Apply post-filters for include/exclude keywords and seniority. Geocode locations and compute distances, dropping any out-of-radius jobs. The result is a cleaned list of relevant jobs, each annotated with city, distance, category, source, etc.
3. **Prioritize via Weights**: Calculate a score for each job based on the weights for its city, category, and source. Sort the list by score (or group by score tier).
4. **Select for Application**: Take the top opportunities and decide which to pursue today, respecting the `daily_caps`. For example, pick the top 6 scored jobs as targets for sending tailored applications (resumes/cover letters). If there are also outreach opportunities (e.g., a known contact at one of the companies, or a recruiter who posted a role), ensure not more than 10 total contacts are reached out.
5. **Prepare Tailored Resumes**: For each selected job, customize the resume/cover letter. Save these files using the naming convention defined. For instance, generating a PDF named *“2025-11-07 – CompanyX – Principal Solutions Architect.pdf”* for an application submitted on that date. This naming scheme makes it easy to track which version of resume went to which job and when.
6. **Track and Repeat**: The process can be repeated daily or as frequently as new jobs appear. By adjusting the JSON config, the user can experiment with different cities or broaden/narrow keywords at any time. The structured results and file names also help in tracking the progress of the job search over time (for example, you could load all saved PDF names into a spreadsheet to log where you applied and when).

Throughout the search, maintaining the ability to tweak parameters is crucial. For instance, if the job market shifts or the user decides to target a different industry, they can update the `include_keywords` (maybe add “IoT” or remove “Batch”) or alter weights (perhaps prioritize **Referrals** more, given their high success rate). Because everything (cities, keywords, etc.) is variablized in one configuration, such changes are straightforward. This modular approach – using config files and code that reads those – follows best practices for software flexibility[wmglab-duke-ascent.readthedocs.io](https://wmglab-duke-ascent.readthedocs.io/en/latest/JSON/JSON_overview.html#:~:text=JSON Configuration File Overview) and mirrors the filtering options provided by professional job aggregator tools[apify.com](https://apify.com/assertive_analogy/job-listings-aggregator#:~:text=,Exclude jobs with certain keywords).

 

In summary, this tailored job search strategy uses a well-defined configuration to hunt for high-paying, senior technical/sales roles in specific regions. It filters out noise (undesired roles) and zeroes in on fresh postings with relevant keywords. By introducing a weighted prioritization, it focuses effort on the most promising leads. And by capping daily applications and contacts, it balances the search intensity with the need to customize and follow up effectively – a strategy that aligns with career advice to favor quality applications over sheer quantity[indeed.com](https://www.indeed.com/career-advice/finding-a-job/how-many-job-applications-per-day#:~:text=How many job applications per,day should you submit). With the above plan, the user can conduct a systematic and adjustable job search, centered on their priorities and optimized for better results.

### 1. Redacted

------

### 🌍 2. **Distance-to-City-Center Filtering**

- 🧭 Calculate great-circle (haversine) distance between job posting location and **city center coordinates**.
- 📌 Jobs should be ranked or filtered based on how close they are to center of target cities (e.g., Colorado Springs).
- 💡 Use lat/lon lookups + geopy/haversine fallback.
- ✅ Support fallback behavior if no precise address available (e.g., city/state match only).

------

### 🔀 3. **Full Variablization of Configuration**

- 🔧 All of these must be editable via config/JSON/YAML without touching code:
  - `cities`, `radius_miles`
  - `categories`, `seniority`, `include_keywords`, `exclude_keywords`
  - `remote_modes`, `salary_usd`, `posted_within_hours`
  - `weighting_100_ball` (cities, categories, sources)
  - `file_naming`, `daily_caps`, `apply_friction_flags`
- ✅ Designed for **hot-swapping values during runtime** or via config UIs (if frontend evolves).

------

### 📈 4. **Graphical Interface Enhancements**

- 🗺️ Interactive map: pan, zoom, marker density, tooltips.
- 🔥 **Heatmap overlays** by:
  - Role density
  - Score composite
  - Velocity of new postings (e.g., “jobs added in last 24h”)
- 📊 Graphs for:
  - Applications/day
  - Category breakdown
  - Offer probability (mock)
  - Resume generation throughput (successful vs. failed)
- 📌 Graphs should support export to CSV and be tied to metadata logging pipeline.

------

### 🤖 5. **Advanced Agent Capabilities**

- 🌐 Research showed Manus AI, OpenAI Operator, DeepMind Mariner, and Perplexity Cosmos are contenders.
- 🧩 We discussed plugging MCP agents into:
  - JD parsing (structure/skills)
  - Resume tailoring (editable + PDF)
  - Cover letter gen
  - QA diff vs. master resume
- 📌 Ensure agent orchestration is modular and supports:
  - Retry on fail
  - Confidence rating output
  - Source-aware customization (e.g., tailored language for startup vs. enterprise)

------

### 💼 6. **Apply Mode**

- ✍️ Support “Open Apply Link” behavior when auto-apply is restricted by ToS.
- ✅ Optionally allow:
  - Pre-fill summary screen (resume version, cover, tags)
  - 1-click “Confirm and Launch External Link”
- 
- 📌 Add flag for **“Friction Score”** in job metadata (e.g., Easy Apply = 0, 10-step = high).

------

### 🛡️ 7. **Security and Secret Hygiene**

- 🧩 Handle secrets (e.g., API keys, webhook URLs) via:
  - Azure Key Vault or `.env` + Docker secrets.
- 🔐 Apply least-privilege auth pattern.
- 🪵 Log: agent input/output hashes, resume versions, job IDs, timestamps (for audit/debug).
- ⚠️ Protect all file output paths from LFI/RFI injection or sloppy naming.

------

### 📦 8. **Optional SaaS Component Comparisons**

- 🧪 Compared alternatives: ScrapeGraphAI, Kadoa, Thunderbit, Manus, Operator, Mariner, Comet.
- 📌 Consider hybrid ingestion pipeline:
  - Primary = job board APIs
  - Secondary = MCP agents browsing company sites via ScrapeGraph or Manus AI.

------

### 🧱 9. **Open Source/Starter Stack Leverage**

- 💡 Mentioned forking OSS dashboards or CRMs if needed.
- 🧩 Stack considerations:
  - Frontend: Next.js + Tailwind or Bootstrap + Mapbox/Leaflet
  - Backend: Express + Postgres or Supabase
  - Orchestration: n8n or Temporal (still recommended as best)

 

