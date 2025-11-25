import { describe, it, expect, beforeEach } from '@jest/globals';


/**
 * Test suite for job scraping functionality
 * 
 * This test covers subtask 17.1: Job scraping from multiple sources
 * (Indeed RSS, LinkedIn Jobs, Company career pages) using Cheerio
 * 
 * Tests verify proper HTML parsing and data extraction
 */

describe('Job Scraping', () => {
    describe('Indeed RSS Feed', () => {
        it('should fetch jobs from Indeed RSS feed', async () => {
            const jobs = await fetchIndeedJobs();

            expect(jobs).toBeDefined();
            expect(Array.isArray(jobs)).toBe(true);
            expect(jobs.length).toBeGreaterThan(0);
        });

        it('should extract required fields from Indeed RSS items', async () => {
            const jobs = await fetchIndeedJobs();
            const firstJob = jobs[0];

            expect(firstJob).toHaveProperty('title');
            expect(firstJob).toHaveProperty('company');
            expect(firstJob).toHaveProperty('location');
            expect(firstJob).toHaveProperty('description');
            expect(firstJob).toHaveProperty('salary');
            expect(firstJob).toHaveProperty('postedAt');
            expect(firstJob).toHaveProperty('source', 'indeed');
            expect(firstJob).toHaveProperty('sourceUrl');
        });

        it('should handle RSS feed errors gracefully', async () => {
            const invalidUrl = 'https://invalid-rss-feed.example.com';

            await expect(fetchIndeedJobs({ url: invalidUrl })).rejects.toThrow();
        });
    });

    describe('LinkedIn Jobs Scraping', () => {
        it('should fetch jobs from LinkedIn using HTTP requests', async () => {
            const jobs = await fetchLinkedInJobs();

            expect(jobs).toBeDefined();
            expect(Array.isArray(jobs)).toBe(true);
            expect(jobs.length).toBeGreaterThan(0);
        });

        it('should handle pagination for LinkedIn results', async () => {
            const jobs = await fetchLinkedInJobs({ maxPages: 3 });

            expect(jobs.length).toBeGreaterThan(25); // LinkedIn typically shows 25 per page
        });

        it('should extract required fields from LinkedIn job listings', async () => {
            const jobs = await fetchLinkedInJobs();
            const firstJob = jobs[0];

            expect(firstJob).toHaveProperty('title');
            expect(firstJob).toHaveProperty('company');
            expect(firstJob).toHaveProperty('location');
            expect(firstJob).toHaveProperty('description');
            expect(firstJob).toHaveProperty('source', 'linkedin');
            expect(firstJob).toHaveProperty('sourceUrl');
        });
    });

    describe('Company Career Page Scraping', () => {
        it('should fetch jobs from configurable company URLs', async () => {
            const companyConfig = {
                url: 'https://example.com/careers',
                selectors: {
                    jobList: '.job-listing',
                    title: '.job-title',
                    location: '.job-location'
                }
            };

            const jobs = await fetchCompanyJobs(companyConfig);

            expect(jobs).toBeDefined();
            expect(Array.isArray(jobs)).toBe(true);
        });

        it('should handle missing optional fields gracefully', async () => {
            const config = {
                url: 'https://example.com/careers',
                selectors: {
                    jobList: '.job',
                    title: '.title',
                    // salary and postedAt are optional
                }
            };

            const jobs = await fetchCompanyJobs(config);
            const firstJob = jobs[0];

            expect(firstJob.title).toBeDefined();
            expect(firstJob.salary).toBeUndefined(); // Optional field
        });
    });

    describe('Workflow Output Validation', () => {
        it('should validate all scrapers return consistent schema', async () => {
            const indeedJobs = await fetchIndeedJobs();
            const linkedInJobs = await fetchLinkedInJobs();
            const companyJobs = await fetchCompanyJobs({
                url: 'https://example.com/careers',
                selectors: {
                    jobList: '.job',
                    title: '.title'
                }
            });


            const allJobs = [...indeedJobs, ...linkedInJobs, ...companyJobs];

            allJobs.forEach(job => {
                expect(job).toMatchObject({
                    title: expect.any(String),
                    company: expect.any(String),
                    location: expect.any(String),
                    description: expect.any(String),
                    source: expect.stringMatching(/^(indeed|linkedin|company)$/),
                    sourceUrl: expect.any(String)
                });
            });
        });

        it('should include timestamps for all scraped jobs', async () => {
            const jobs = await fetchIndeedJobs();

            jobs.forEach(job => {
                expect(job).toHaveProperty('scrapedAt');
                expect(job.scrapedAt).toBeInstanceOf(Date);
            });
        });
    });
});

import {
    fetchIndeedJobs,
    fetchLinkedInJobs,
    fetchCompanyJobs
} from '../../src/lib/job-scrapers';

