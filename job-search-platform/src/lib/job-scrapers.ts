/**
 * Job Scraping Utilities
 *
 * This module provides functions to scrape job listings from various sources
 * (Indeed, LinkedIn, Company career pages) using Cheerio for HTML parsing.
 */

import * as cheerio from "cheerio";
import { saveJobs } from "./job-service";
import { isMockMode } from "./env";

export interface JobListing {
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string | number; // JSearch returns numbers; normalization coerces to string
  postedAt?: Date;
  source: "indeed" | "linkedin" | "company";
  sourceUrl: string;
  scrapedAt: Date;
}

export interface FetchOptions {
  url?: string;
  maxPages?: number;
}

export interface CompanyScraperConfig {
  url: string;
  selectors: {
    jobList: string;
    title: string;
    company?: string;
    location?: string;
    description?: string;
    salary?: string;
    postedAt?: string;
  };
}

interface JSearchJob {
  job_title?: string;
  employer_name?: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
  job_description?: string;
  job_salary?: string;
  job_apply_link?: string;
  job_posted_at_datetime_utc?: string;
}

/**
 * Fetch jobs using JSearch API (Google for Jobs aggregator)
 */
export async function fetchIndeedJobs(
  options?: FetchOptions,
): Promise<JobListing[]> {
  // Return mock data ONLY if Mock Mode is explicitly enabled
  if (isMockMode()) {
    return getMockIndeedJobs();
  }

  const apiKey = process.env.JSEARCH_API_KEY;
  if (!apiKey) {
    throw new Error("JSEARCH_API_KEY environment variable is required");
  }

  try {
    // KC-focused search — embed location in the query (Google for Jobs respects it)
    const query = options?.url || "IT jobs in Kansas City Missouri";
    const searchParams = new URLSearchParams({
      query: query,
      page: "1",
      num_pages: "3",   // ~30 results per page
      date_posted: "all",
    });

    console.log(`JSearch API: Searching for "${query}"...`);

    const response = await fetch(
      `https://jsearch.p.rapidapi.com/search?${searchParams}`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`JSearch API Error (${response.status}):`, errorText);
      throw new Error(
        `JSearch API failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    console.log(`JSearch API Response:`, {
      status: data.status,
      request_id: data.request_id,
      parameters: data.parameters,
      num_results: data.data?.length || 0,
    });

    const jobs: JobListing[] = [];

    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((job: JSearchJob) => {
        jobs.push({
          title: job.job_title || "Unknown Title",
          company: job.employer_name || "Unknown Company",
          location:
            job.job_city && job.job_state
              ? `${job.job_city}, ${job.job_state}`
              : job.job_country || "Unknown Location",
          description: job.job_description || "",
          salary: job.job_salary || undefined,
          source: "indeed", // Keep as 'indeed' for compatibility
          sourceUrl: job.job_apply_link || "",
          postedAt: job.job_posted_at_datetime_utc
            ? new Date(job.job_posted_at_datetime_utc)
            : undefined,
          scrapedAt: new Date(),
        });
      });
    }

    // Filter out jobs with no apply link — sourceUrl is the unique dedup key
    const validJobs = jobs.filter(j => j.sourceUrl && j.sourceUrl.trim());
    const dropped = jobs.length - validJobs.length;
    if (dropped > 0) {
      console.warn(`⚠️  Dropped ${dropped} jobs with no apply URL`);
    }

    console.log(`✅ JSearch API returned ${validJobs.length} usable jobs (${dropped} dropped, no URL)`);

    if (validJobs.length === 0) {
      console.warn(
        "⚠️  No jobs found. Try different search terms or check API quota.",
      );
      console.warn("   Response data keys:", Object.keys(data));
    }

    return validJobs;
  } catch (error) {
    console.error("❌ JSearch API error:", error);
    if (error instanceof Error) {
      console.error("   Message:", error.message);
    }
    throw new Error(
      `fetchIndeedJobs failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Fetch jobs from LinkedIn using HTTP requests and Cheerio
 */
export async function fetchLinkedInJobs(
  options?: FetchOptions,
): Promise<JobListing[]> {
  const maxPages = options?.maxPages || 1;

  // Return mock data ONLY if Mock Mode is explicitly enabled
  if (isMockMode()) {
    return getMockLinkedInJobs(maxPages);
  }

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
  };

  const allJobs: JobListing[] = [];

  for (let page = 0; page < maxPages; page++) {
    const url = `https://www.linkedin.com/jobs/search/?start=${page * 25}`;

    try {
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`LinkedIn request failed: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      $(".job-card-container").each((_, element) => {
        const card = $(element);

        allJobs.push({
          title: card.find(".job-card-title").text().trim() || "Unknown Title",
          company:
            card.find(".job-card-company").text().trim() || "Unknown Company",
          location:
            card.find(".job-card-location").text().trim() || "Unknown Location",
          description: card.find(".job-card-description").text().trim() || "",
          source: "linkedin",
          sourceUrl: card.find("a").attr("href") || "",
          scrapedAt: new Date(),
        });
      });
    } catch (error) {
      throw new Error(
        `fetchLinkedInJobs failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  return allJobs;
}

/**
 * Fetch jobs from a company career page with custom selectors
 */
export async function fetchCompanyJobs(
  config: CompanyScraperConfig,
): Promise<JobListing[]> {
  // Return mock data ONLY if Mock Mode is explicitly enabled
  if (isMockMode()) {
    return getMockCompanyJobs(config);
  }

  try {
    const response = await fetch(config.url);

    if (!response.ok) {
      throw new Error(`Failed to fetch company jobs: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const jobs: JobListing[] = [];

    $(config.selectors.jobList).each((_, element) => {
      const el = $(element);

      const job: JobListing = {
        title: el.find(config.selectors.title).text().trim(),
        company: config.selectors.company
          ? el.find(config.selectors.company).text().trim()
          : "Unknown Company",
        location: config.selectors.location
          ? el.find(config.selectors.location).text().trim()
          : "Unknown Location",
        description: config.selectors.description
          ? el.find(config.selectors.description).text().trim()
          : "",
        source: "company",
        sourceUrl: config.url, // Ideally find a link within the element
        scrapedAt: new Date(),
      };

      if (config.selectors.salary) {
        job.salary = el.find(config.selectors.salary).text().trim();
      }

      if (config.selectors.postedAt) {
        const dateStr = el.find(config.selectors.postedAt).text().trim();
        if (dateStr) job.postedAt = new Date(dateStr);
      }

      jobs.push(job);
    });

    return jobs;
  } catch (error) {
    throw new Error(
      `fetchCompanyJobs failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Mock data functions for testing
function getMockIndeedJobs(): JobListing[] {
  return [
    {
      title: "Senior Software Engineer",
      company: "Tech Corp",
      location: "San Francisco, CA",
      description: "We are looking for a talented software engineer...",
      salary: "$150,000 - $200,000",
      postedAt: new Date("2025-11-20"),
      source: "indeed",
      sourceUrl: "https://www.indeed.com/job/12345",
      scrapedAt: new Date(),
    },
    {
      title: "Frontend Developer",
      company: "Startup Inc",
      location: "Remote",
      description: "Join our team of talented developers...",
      salary: "$120,000 - $160,000",
      postedAt: new Date("2025-11-21"),
      source: "indeed",
      sourceUrl: "https://www.indeed.com/job/67890",
      scrapedAt: new Date(),
    },
  ];
}

function getMockLinkedInJobs(pageCount: number = 1): JobListing[] {
  const jobsPerPage = 30;
  const jobs: JobListing[] = [];

  for (let i = 0; i < pageCount * jobsPerPage; i++) {
    jobs.push({
      title: `Job Title ${i + 1}`,
      company: `Company ${i + 1}`,
      location: "New York, NY",
      description: `Job description for position ${i + 1}`,
      source: "linkedin",
      sourceUrl: `https://www.linkedin.com/jobs/view/${i + 1}`,
      scrapedAt: new Date(),
    });
  }

  return jobs;
}

function getMockCompanyJobs(config: CompanyScraperConfig): JobListing[] {
  const mockJob: JobListing = {
    title: "Sample Job Title",
    company: "Sample Company",
    location: "Sample Location",
    description: "Sample job description",
    source: "company",
    sourceUrl: "https://example.com/job/1",
    scrapedAt: new Date(),
  };

  if (!config.selectors.salary) {
    mockJob.salary = undefined;
  }

  return [mockJob];
}

/**
 * Orchestrate the aggregation of jobs from all sources.
 */
export async function runAggregation(): Promise<void> {
  console.log("Starting job aggregation run...");
  const startTime = Date.now();

  try {
    const [indeedJobs, linkedInJobs] = await Promise.all([
      fetchIndeedJobs().catch((err) => {
        console.error("Error fetching Indeed jobs:", err);
        return [];
      }),
      fetchLinkedInJobs().catch((err) => {
        console.error("Error fetching LinkedIn jobs:", err);
        return [];
      }),
    ]);

    const allJobs = [...indeedJobs, ...linkedInJobs];

    // Save jobs to database
    if (allJobs.length > 0) {
      await saveJobs(allJobs);
    }

    const totalJobs = allJobs.length;
    const duration = Date.now() - startTime;

    console.log(
      `Aggregation completed in ${duration}ms. Fetched and saved ${totalJobs} jobs.`,
    );
  } catch (error) {
    console.error("Critical error during aggregation:", error);
    throw error;
  }
}
