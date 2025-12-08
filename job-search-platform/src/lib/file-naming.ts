/**
 * File Naming Utility
 * Generates PDF filenames from templates with job-specific data
 */

import { Job } from '@prisma/client';

/**
 * Sanitize a string for use in a filename
 * Removes special characters and replaces spaces with hyphens
 */
function sanitizeForFilename(input: string): string {
    return input
        .replace(/[^\w\s-]/g, '') // Remove special characters except word chars, spaces, and hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a filename from a template with job-specific data
 * 
 * Supported placeholders:
 * - YYYY-MM-DD: Current date in ISO format
 * - {company}: Job company name
 * - {role}: Job title
 * 
 * @example
 * generateFileName('YYYY-MM-DD - {company} - {role}.pdf', job)
 * // => '2024-01-15 - Tech-Corp - Senior-Developer.pdf'
 */
export function generateFileName(template: string, job: Job): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    let filename = template;

    // Replace date placeholders
    filename = filename
        .replace(/YYYY/g, String(year))
        .replace(/MM/g, month)
        .replace(/DD/g, day);

    // Replace company
    filename = filename.replace(/{company}/g, sanitizeForFilename(job.company));

    // Replace role/title
    filename = filename.replace(/{role}/g, sanitizeForFilename(job.title));

    return filename;
}
