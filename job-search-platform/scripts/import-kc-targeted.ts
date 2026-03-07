#!/usr/bin/env tsx

/**
 * KC-Targeted Multi-Query Import
 *
 * Runs multiple JSearch queries targeting Kansas City
 * for Richard's priority roles, then saves all results.
 */

import dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(__dirname, "../../.env") });

import { saveJobs } from "../src/lib/job-service";
import { prisma } from "../src/lib/prisma";
import { JobListing } from "../src/lib/job-scrapers";

const KC_QUERIES = [
  "AI Sales Engineer Kansas City",
  "Technical Sales Engineer Kansas City",
  "AI Solutions Consultant Kansas City",
  "Solutions Architect AI Kansas City",
  "Technology Sales Engineer Kansas City",
];

async function fetchJSearch(query: string, numPages = 3): Promise<JobListing[]> {
  const apiKey = process.env.JSEARCH_API_KEY!;
  const params = new URLSearchParams({
    query,
    page: "1",
    num_pages: String(numPages),
    date_posted: "all",
  });

  const response = await fetch(
    `https://jsearch.p.rapidapi.com/search?${params}`,
    {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const remaining = response.headers.get("x-ratelimit-requests-remaining");
  console.log(`   Quota remaining: ${remaining || "unknown"}`);

  if (!data.data || !Array.isArray(data.data)) return [];

  return data.data
    .filter((job: any) => job.job_apply_link) // skip jobs with no URL
    .map((job: any) => ({
      title: job.job_title || "Unknown Title",
      company: job.employer_name || "Unknown Company",
      location:
        job.job_city && job.job_state
          ? `${job.job_city}, ${job.job_state}`
          : job.job_country || "Unknown Location",
      description: job.job_description || "",
      salary: job.job_salary || undefined,
      source: "indeed" as const, // JSearch source tag
      sourceUrl: job.job_apply_link,
      postedAt: job.job_posted_at_datetime_utc
        ? new Date(job.job_posted_at_datetime_utc)
        : undefined,
      scrapedAt: new Date(),
    }));
}

async function main() {
  console.log("🚀 KC-Targeted Multi-Query Import\n");

  if (!process.env.JSEARCH_API_KEY) {
    console.error("❌ JSEARCH_API_KEY missing");
    process.exit(1);
  }

  await prisma.$connect();
  const beforeCount = await prisma.job.count();
  console.log(`📋 Jobs in DB before: ${beforeCount}\n`);

  const allJobs: JobListing[] = [];
  const seenUrls = new Set<string>();

  for (const query of KC_QUERIES) {
    console.log(`🔍 "${query}"...`);
    try {
      const jobs = await fetchJSearch(query);
      // Dedup within this batch
      const unique = jobs.filter(j => {
        if (seenUrls.has(j.sourceUrl)) return false;
        seenUrls.add(j.sourceUrl);
        return true;
      });
      console.log(`   → ${jobs.length} returned, ${unique.length} unique new\n`);
      allJobs.push(...unique);
    } catch (err) {
      console.error(`   ❌ Failed: ${err}\n`);
    }
  }

  console.log(`\n📊 Total unique jobs fetched: ${allJobs.length}`);

  if (allJobs.length > 0) {
    console.log("💾 Saving to database...");
    await saveJobs(allJobs);
  }

  const afterCount = await prisma.job.count();
  console.log(`\n📊 Final Summary:`);
  console.log(`   Before: ${beforeCount}`);
  console.log(`   After:  ${afterCount}`);
  console.log(`   New:    ${afterCount - beforeCount}`);
  console.log(`   Queries used: ${KC_QUERIES.length}`);

  await prisma.$disconnect();
}

main().catch(console.error);
