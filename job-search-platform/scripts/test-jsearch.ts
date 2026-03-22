#!/usr/bin/env tsx

/**
 * Test Script for JSearch API Integration
 *
 * This script tests the new JSearch API integration to verify:
 * 1. API connectivity and authentication
 * 2. Data parsing and structure
 * 3. Integration with existing job processing pipeline
 */

import dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables from top-level .env file
dotenv.config({ path: resolve(__dirname, "../../.env") });

import { fetchIndeedJobs } from "../src/lib/job-scrapers";
import { normalizeJobData } from "../src/lib/ingest/normalization";
import { isMockMode } from "../src/lib/env";

async function testJSearchAPI() {
  console.log("🚀 Testing JSearch API Integration...\n");

  // Environment check
  console.log("📋 Environment Check:");
  console.log("- Mock Mode:", isMockMode() ? "ENABLED" : "DISABLED");
  console.log(
    "- JSearch API Key:",
    process.env.JSEARCH_API_KEY ? "SET" : "MISSING",
  );
  console.log("");

  if (!process.env.JSEARCH_API_KEY && !isMockMode()) {
    console.error(
      "❌ ERROR: JSEARCH_API_KEY is required when not in mock mode",
    );
    console.log(
      "Add this to your .env file: JSEARCH_API_KEY=your_rapidapi_key_here",
    );
    process.exit(1);
  }

  try {
    // Test 1: Fetch jobs from JSearch API
    console.log("🔍 Test 1: Fetching jobs from JSearch API...");
    const startTime = Date.now();

    const jobs = await fetchIndeedJobs();
    const duration = Date.now() - startTime;

    console.log(`✅ Success! Fetched ${jobs.length} jobs in ${duration}ms`);
    console.log("");

    // Test 2: Inspect job data structure
    if (jobs.length > 0) {
      console.log("📊 Test 2: Job Data Structure Analysis:");
      const firstJob = jobs[0];

      console.log("Sample Job:");
      console.log("- Title:", firstJob.title);
      console.log("- Company:", firstJob.company);
      console.log("- Location:", firstJob.location);
      console.log("- Salary:", firstJob.salary || "Not provided");
      console.log(
        "- Description length:",
        firstJob.description?.length || 0,
        "characters",
      );
      console.log("- Source:", firstJob.source);
      console.log(
        "- Posted At:",
        firstJob.postedAt?.toISOString() || "Not provided",
      );
      console.log("- Source URL:", firstJob.sourceUrl);
      console.log("");

      // Test 3: Data normalization
      console.log("🔧 Test 3: Testing normalization pipeline...");
      try {
        const normalized = await normalizeJobData(firstJob);
        console.log("✅ Normalization successful!");
        console.log(
          "- Coordinates:",
          normalized.latitude && normalized.longitude
            ? `${normalized.latitude}, ${normalized.longitude}`
            : "Not geocoded",
        );
        console.log("- Normalized location:", normalized.location);
        console.log("");
      } catch (normError) {
        console.warn(
          "⚠️  Normalization warning:",
          normError instanceof Error ? normError.message : "Unknown error",
        );
        console.log("");
      }

      // Test 4: Data quality checks
      console.log("✅ Test 4: Data Quality Analysis:");
      const stats = {
        withTitles: jobs.filter((j) => j.title && j.title.trim()).length,
        withCompanies: jobs.filter((j) => j.company && j.company.trim()).length,
        withLocations: jobs.filter((j) => j.location && j.location.trim())
          .length,
        withDescriptions: jobs.filter(
          (j) => j.description && j.description.trim(),
        ).length,
        withSalaries: jobs.filter((j) => j.salary != null && String(j.salary).trim()).length,
        withUrls: jobs.filter((j) => j.sourceUrl && j.sourceUrl.trim()).length,
        withDates: jobs.filter((j) => j.postedAt).length,
      };

      console.log(
        `- Jobs with titles: ${stats.withTitles}/${jobs.length} (${Math.round((stats.withTitles / jobs.length) * 100)}%)`,
      );
      console.log(
        `- Jobs with companies: ${stats.withCompanies}/${jobs.length} (${Math.round((stats.withCompanies / jobs.length) * 100)}%)`,
      );
      console.log(
        `- Jobs with locations: ${stats.withLocations}/${jobs.length} (${Math.round((stats.withLocations / jobs.length) * 100)}%)`,
      );
      console.log(
        `- Jobs with descriptions: ${stats.withDescriptions}/${jobs.length} (${Math.round((stats.withDescriptions / jobs.length) * 100)}%)`,
      );
      console.log(
        `- Jobs with salaries: ${stats.withSalaries}/${jobs.length} (${Math.round((stats.withSalaries / jobs.length) * 100)}%)`,
      );
      console.log(
        `- Jobs with source URLs: ${stats.withUrls}/${jobs.length} (${Math.round((stats.withUrls / jobs.length) * 100)}%)`,
      );
      console.log(
        `- Jobs with posting dates: ${stats.withDates}/${jobs.length} (${Math.round((stats.withDates / jobs.length) * 100)}%)`,
      );
      console.log("");
    } else {
      console.log(
        "⚠️  No jobs returned - this might be expected in mock mode or if API quota is exhausted",
      );
      console.log("");
    }

    // Test 5: Rate limiting awareness
    console.log("📊 Test 5: API Usage Summary:");
    if (isMockMode()) {
      console.log("- Mode: Mock data (no API calls made)");
    } else {
      console.log("- Mode: Live API");
      console.log("- API calls made: 1");
      console.log("- Jobs retrieved:", jobs.length);
      console.log(
        "- Rate limit: Check your RapidAPI dashboard for remaining quota",
      );
    }
    console.log("");

    console.log("🎉 All tests completed successfully!");
    console.log("");
    console.log("Next steps:");
    console.log("1. Run the full aggregation: npx tsx scripts/demo-task-38.ts");
    console.log("2. Check the database: npm run dev and visit /jobs");
    console.log("3. Test the triage feed: visit /triage");
  } catch (error) {
    console.error("❌ Test failed:", error);
    console.log("");
    console.log("Troubleshooting:");
    console.log("1. Verify your JSEARCH_API_KEY in .env");
    console.log("2. Check your RapidAPI subscription status");
    console.log(
      "3. Try running in mock mode: NEXT_PUBLIC_MOCK_MODE=true npx tsx scripts/test-jsearch.ts",
    );
    process.exit(1);
  }
}

// Run the test
testJSearchAPI().catch(console.error);
