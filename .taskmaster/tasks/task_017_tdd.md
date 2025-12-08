# Task ID: 17

**Title:** Build Job Aggregation System with n8n Workflows and Geocoding

**Status:** pending

**Dependencies:** 12 ✓

**Priority:** high

**Description:** Implement automated job scraping from Indeed, LinkedIn, and company career pages using n8n workflows, integrate Mapbox Geocoding API for location processing, persist scraped data to the PostgreSQL database, and integrate the real data feed into the /jobs UI.

**Details:**

1. Create n8n workflows for each job source:
   - Indeed RSS feed workflow
   - LinkedIn Jobs scraping workflow (using HTTP Request nodes)
   - Company career page scraping (configurable URLs)

2. Set up Mapbox Geocoding integration:
   ```typescript
   // src/lib/geocoding.ts
   import mapboxgl from 'mapbox-gl';

   export async function geocodeCity(cityName: string): Promise<{ lat: number; lng: number }> {
     const response = await fetch(
       `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cityName)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
     );
     const data = await response.json();
     const [lng, lat] = data.features[0].center;
     return { lat, lng };
   }
   ```

3. Implement Haversine distance calculation.

4. Create job filtering service.

5. Implement deduplication using fuzzy matching (title + company).

6. Create composite scoring system.

7. Set up cron job to run every 6 hours.

8. **Database Persistence**: Implement a service to save processed, geocoded, and scored jobs into the PostgreSQL database using Prisma. Ensure proper field mapping and upsert logic.

9. **UI Integration**: Connect the `/jobs` page to the real database, ensuring that scraped jobs are displayed correctly and that the UI reflects the production data state.

**Test Strategy:**

1. Test n8n workflows fetch jobs from each source
2. Verify Mapbox geocoding returns correct coordinates
3. Test Haversine distance calculation accuracy
4. Validate geographic filtering (jobs within radius)
5. Test temporal filtering (only jobs within X hours)
6. Verify keyword filtering (include OR, exclude AND NOT)
7. Test salary parsing and filtering
8. Validate deduplication removes duplicates
9. Test composite scoring calculation
10. Verify cron job runs every 6 hours
11. Test manual trigger endpoint
12. **Verify Database Persistence**: Check that scraped jobs are correctly inserted into the `Job` table in PostgreSQL.
13. **Verify UI Display**: Confirm that the `/jobs` page renders the list of jobs fetched from the real database.

## Subtasks

### 17.7. Implement Database Persistence Service for Aggregated Jobs

**Status:** pending  
**Dependencies:** 17.1, 17.5, 17.6  

Develop the service layer to persist processed job data into PostgreSQL using Prisma, ensuring data integrity and proper mapping

**Details:**

Create a `JobService` or repository that accepts the output from the aggregation pipeline. Map the internal job objects to the Prisma `Job` model defined in Task 12. Implement `upsert` logic to handle existing jobs (updating them if changed) and insert new ones. Ensure all fields including location coordinates, salary, and calculated scores are correctly persisted to the database.

### 17.8. Connect /jobs UI to Real Database and Verify Display

**Status:** pending  
**Dependencies:** 17.7  

Update the jobs dashboard to fetch and display live data from the database, replacing any mock data sources

**Details:**

Modify the data fetching strategy on the `/jobs` route (using Server Components or Actions) to query the real `Job` table via Prisma. Ensure that the frontend components correctly render the data fetched from the DB. Verify that the page displays the jobs that were scraped and saved in Subtask 7.

### 17.1. Design and implement n8n workflows for job scraping from multiple sources

**Status:** done  
**Dependencies:** None  

Create and configure n8n workflows to scrape job listings from Indeed RSS feed, LinkedIn Jobs, and configurable company career pages

**Details:**

Implement three separate workflows: 1) Indeed RSS feed workflow using RSS node, 2) LinkedIn Jobs scraping workflow using HTTP Request nodes with proper headers and pagination, 3) Company career page scraping workflow with configurable URL templates and CSS selectors. Each workflow must extract title, company, location, description, salary, and posting date.

### 17.2. Integrate Mapbox Geocoding API with error handling and caching

**Status:** done  
**Dependencies:** None  

Implement Mapbox Geocoding service to convert job locations to latitude/longitude coordinates with rate limiting and caching

**Details:**

Create geocoding service using provided TypeScript implementation, add rate limiting to respect Mapbox API limits, implement Redis caching for previously geocoded locations, handle API errors and retries, and add circuit breaker pattern for API failures.

### 17.3. Implement geographic filtering using Haversine formula with configurable radius

**Status:** done  
**Dependencies:** 17.2  

Develop geographic filtering functionality using Haversine distance calculation to filter jobs within specified radius of target locations

**Details:**

Implement the provided Haversine distance calculation function, create geographic filtering service that processes jobs against user-defined search areas (cities with radius), handle cases where job locations can't be geocoded, and optimize for performance with spatial indexing where possible.

### 17.4. Develop composite scoring algorithm for job relevance ranking

**Status:** done  
**Dependencies:** 17.1, 17.2, 17.3  

Create scoring system that ranks jobs based on multiple criteria including recency, keyword relevance, salary, and geographic proximity

**Details:**

Implement weighted scoring system where each criterion (recency, keyword match strength, salary level, geographic proximity) contributes to overall relevance score. Allow configurable weights through system settings. Normalize scores across different criteria for fair comparison.

### 17.5. Create deduplication system using fuzzy matching on job titles and companies

**Status:** done  
**Dependencies:** 17.1  

Implement job deduplication functionality using fuzzy string matching to identify and merge duplicate job listings from different sources

**Details:**

Develop fuzzy matching algorithm using Levenshtein distance or similar technique to compare job titles and company names. Implement configurable similarity thresholds. Create merge strategy for duplicate jobs that preserves the most complete information from each source.

### 17.6. Set up scheduling system with monitoring and error reporting

**Status:** done  
**Dependencies:** 17.1, 17.2, 17.3, 17.4, 17.5  

Configure cron-based scheduling for regular job aggregation runs with comprehensive monitoring and alerting capabilities

**Details:**

Implement cron scheduler to run aggregation every 6 hours, create monitoring dashboard showing success rates and performance metrics, set up error notifications via email/Slack, implement retry logic for failed jobs, and create manual trigger API endpoint for on-demand runs.
