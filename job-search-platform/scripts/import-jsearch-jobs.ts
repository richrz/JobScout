#!/usr/bin/env tsx

/**
 * Import JSearch Jobs Script
 *
 * Fetches real job listings from JSearch API (Google for Jobs aggregator)
 * and imports them into the PostgreSQL database.
 */

import dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables from top-level .env file
dotenv.config({ path: resolve(__dirname, "../../.env") });

import { fetchIndeedJobs } from "../src/lib/job-scrapers";
import { saveJobs } from "../src/lib/job-service";
import { prisma } from "../src/lib/prisma";

async function importJobs() {
  console.log("🚀 JSearch Job Import Starting...\n");

  // Environment check
  if (!process.env.JSEARCH_API_KEY) {
    console.error("❌ ERROR: JSEARCH_API_KEY is required");
    console.log("Add this to your .env file: JSEARCH_API_KEY=your_rapidapi_key_here");
    process.exit(1);
  }

  try {
    // Check database connection
    console.log("📊 Checking database connection...");
    await prisma.$connect();
    console.log("✅ Database connected\n");

    // Get current job count
    const beforeCount = await prisma.job.count();
    console.log(`📋 Current jobs in database: ${beforeCount}\n`);

    // Fetch jobs from JSearch API
    console.log("🔍 Fetching jobs from JSearch API...");
    const startTime = Date.now();
    const jobs = await fetchIndeedJobs();
    const fetchDuration = Date.now() - startTime;

    if (jobs.length === 0) {
      console.log("⚠️  No jobs returned from API");
      console.log("Check your API quota at https://rapidapi.com/dashboard");
      process.exit(0);
    }

    console.log(`✅ Fetched ${jobs.length} jobs in ${fetchDuration}ms\n`);

    // Display sample job
    const sample = jobs[0];
    console.log("📄 Sample Job:");
    console.log(`   Title: ${sample.title}`);
    console.log(`   Company: ${sample.company}`);
    console.log(`   Location: ${sample.location}`);
    console.log(`   Posted: ${sample.postedAt?.toISOString() || 'Unknown'}\n`);

    // Save to database
    console.log("💾 Saving jobs to database...");
    const saveStartTime = Date.now();
    await saveJobs(jobs);
    const saveDuration = Date.now() - saveStartTime;
    console.log(`✅ Jobs saved in ${saveDuration}ms\n`);

    // Get new job count
    const afterCount = await prisma.job.count();
    const newJobs = afterCount - beforeCount;

    console.log("📊 Import Summary:");
    console.log(`   Jobs fetched: ${jobs.length}`);
    console.log(`   Jobs before: ${beforeCount}`);
    console.log(`   Jobs after: ${afterCount}`);
    console.log(`   New jobs added: ${newJobs}`);
    console.log(`   Duplicates skipped: ${jobs.length - newJobs}\n`);

    console.log("🎉 Import completed successfully!\n");
    console.log("Next steps:");
    console.log("1. Visit /jobs to see your new job listings");
    console.log("2. Visit /triage to start organizing them");
    console.log("3. Visit /pipeline to track applications");

  } catch (error) {
    console.error("\n❌ Import failed:", error);
    console.log("\nTroubleshooting:");
    console.log("1. Check your JSEARCH_API_KEY is valid");
    console.log("2. Verify database is running: docker ps | grep postgres");
    console.log("3. Check API quota: https://rapidapi.com/dashboard");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importJobs().catch(console.error);
