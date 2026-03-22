
import crypto from 'crypto';
import { JobListing } from '@/lib/job-scrapers';
import { Prisma } from '@prisma/client';
import { stripHtmlToMarkdown } from './html-to-markdown';
import { classifyAts } from './ats-classifier';

export type NormalizedJob = Prisma.JobCreateInput;

const NORMALIZATION_VERSION = '1.0';

// ── Salary parsing ────────────────────────────────────────────────────────────

interface ParsedSalary {
    min: number | null;
    max: number | null;
    currency: string;
}

/**
 * Best-effort salary string → structured min/max.
 * Handles common patterns: "$80K", "$80,000 - $120,000", "80000-120000/yr"
 * Returns nulls on any parse failure — we never lie about salary.
 */
function parseSalary(raw: string | null | undefined): ParsedSalary {
    if (!raw || typeof raw !== 'string') return { min: null, max: null, currency: 'USD' };

    const currency = raw.includes('£') ? 'GBP' : raw.includes('€') ? 'EUR' : 'USD';

    // Strip currency symbols and commas, normalize K suffix
    const clean = raw
        .replace(/[£€$,]/g, '')
        .replace(/\bk\b/gi, '000')
        .replace(/\/(?:yr|year|annual|mo|month)/gi, '');

    const numbers = clean.match(/(\d{4,7}(?:\.\d+)?)/g)?.map(Number) ?? [];

    if (numbers.length === 0) return { min: null, max: null, currency };
    if (numbers.length === 1) return { min: numbers[0], max: numbers[0], currency };
    return { min: Math.min(...numbers), max: Math.max(...numbers), currency };
}

// ── Work mode classification ──────────────────────────────────────────────────

const REMOTE_RE = /\b(remote|distributed|work from home|wfh|fully remote)\b/i;
const HYBRID_RE = /\b(hybrid|partial remote|flexible|2-3 days)\b/i;
const ONSITE_RE = /\b(on.?site|in.?office|in person|on location)\b/i;

export function classifyWorkMode(title: string, location: string, description: string): string {
    const corpus = `${title} ${location} ${description}`.toLowerCase();
    if (REMOTE_RE.test(corpus)) return 'remote';
    if (HYBRID_RE.test(corpus)) return 'hybrid';
    if (ONSITE_RE.test(corpus)) return 'onsite';
    return 'unknown';
}

// ── Seniority classification ──────────────────────────────────────────────────

const STAFF_PLUS_RE = /\b(staff|principal|distinguished|fellow|director|vp|vice president|head of|cto|ceo|cpo)\b/i;
const SENIOR_RE = /\b(senior|sr\.?|lead|architect|manager)\b/i;
const MID_RE = /\b(mid.?level|mid|iii|iv|experienced)\b/i;
const ENTRY_RE = /\b(junior|jr\.?|entry.?level|associate|intern|graduate|new grad|i\b|ii\b)\b/i;

export function classifySeniority(title: string): string {
    if (STAFF_PLUS_RE.test(title)) return 'staff_plus';
    if (SENIOR_RE.test(title)) return 'senior';
    if (ENTRY_RE.test(title)) return 'entry';
    if (MID_RE.test(title)) return 'mid';
    return 'unknown';
}

// ── Skills tag extraction ─────────────────────────────────────────────────────

// Curated high-signal skill terms. Keep this list deliberately focused —
// it is better to extract fewer tags with high precision than many noisy ones.
const SKILL_TERMS: string[] = [
    // Languages
    'JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'Ruby', 'PHP',
    'Swift', 'Kotlin', 'C#', 'C++', 'Scala', 'Elixir', 'R',
    // Frontend
    'React', 'Next.js', 'Vue', 'Angular', 'Svelte', 'HTML', 'CSS', 'Tailwind',
    'GraphQL', 'REST',
    // Backend / infra
    'Node.js', 'Django', 'Rails', 'FastAPI', 'Spring', 'Express', 'Laravel',
    'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Kafka',
    // Cloud / DevOps
    'AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD',
    'GitHub Actions', 'Datadog', 'Splunk',
    // AI / ML
    'PyTorch', 'TensorFlow', 'LLM', 'RAG', 'OpenAI', 'ML', 'NLP',
    // Tools
    'Git', 'Jira', 'Figma', 'dbt', 'Airflow', 'Spark',
];

// Build once — patterns per term.
// Terms ending in non-word chars (C++, C#, Next.js) can't use \b on both sides.
// Strategy: use lookaround assertions for symbol-ending/starting terms.
function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildSkillPattern(term: string): RegExp {
    const escaped = escapeRegex(term);
    if (/[^a-zA-Z0-9]$/.test(term)) {
        return new RegExp(`(?<![a-zA-Z0-9])${escaped}(?![a-zA-Z0-9])`, 'i');
    }
    if (/^[^a-zA-Z0-9]/.test(term)) {
        return new RegExp(`(?<![a-zA-Z0-9])${escaped}\\b`, 'i');
    }
    return new RegExp(`\\b${escaped}\\b`, 'i');
}

const SKILL_PATTERNS: Array<{ term: string; re: RegExp }> = SKILL_TERMS.map(term => ({
    term,
    re: buildSkillPattern(term),
}));

export function extractSkillTags(text: string): string[] {
    return SKILL_PATTERNS
        .filter(({ re }) => re.test(text))
        .map(({ term }) => term);
}

// ── Fingerprint ───────────────────────────────────────────────────────────────

/**
 * Stable content-based dedup key.
 * Input normalization keeps this robust across minor formatting variation:
 * lowercase, collapse whitespace, strip punctuation.
 */
export function buildFingerprint(company: string, title: string, location: string): string {
    const normalize = (s: string) =>
        s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();

    const corpus = `${normalize(company)}|${normalize(title)}|${normalize(location)}`;
    return crypto.createHash('sha256').update(corpus).digest('hex');
}

// ── Record confidence ─────────────────────────────────────────────────────────

/**
 * Heuristic confidence score (0–1) based on field presence.
 * Used to surface low-confidence records for review rather than silently polluting the index.
 */
export function computeConfidence(raw: { salary?: string | number | null; postedAt?: Date | null; description?: string | null; location?: string | null }): number {
    let score = 1.0;
    if (!raw.salary) score -= 0.1;
    if (!raw.postedAt) score -= 0.15;
    if (!raw.description || raw.description.length < 100) score -= 0.2;
    if (!raw.location || raw.location.toLowerCase() === 'unknown') score -= 0.1;
    return Math.max(0, Math.round(score * 100) / 100);
}

// ── Main normalization ────────────────────────────────────────────────────────

/**
 * Normalizes raw job data into a format suitable for database persistence.
 * Geocoding is currently disabled (map feature paused). Re-enable when needed.
 */
export async function normalizeJobData(rawJob: JobListing): Promise<NormalizedJob> {
    // Geocoding disabled — map feature is paused. No Redis/Google Maps dependency needed.
    // To re-enable: import { geocodeLocation } from '@/lib/geocoding' and call it here.
    const latitude: number | null = null;
    const longitude: number | null = null;

    const rawSalary = rawJob.salary != null ? String(rawJob.salary) : null;
    const salary = parseSalary(rawSalary);

    // Strip HTML from descriptions coming from scraped career pages.
    // API sources (JSearch, Greenhouse JSON) return clean text — the check is
    // cheap and safe to run on all sources since stripHtmlToMarkdown is a no-op
    // on already-clean text (no tags to strip).
    const atsInfo = classifyAts(rawJob.sourceUrl);
    const descriptionText = atsInfo.cleanJson
        ? (rawJob.description ?? '')
        : stripHtmlToMarkdown(rawJob.description ?? '');

    return {
        // Core fields (unchanged contract)
        title: rawJob.title,
        company: rawJob.company,
        location: rawJob.location,
        description: descriptionText,
        // Coerce salary to string — JSearch sometimes returns a number
        salary: rawJob.salary != null ? String(rawJob.salary) : null,
        source: rawJob.source,
        sourceUrl: rawJob.sourceUrl,
        postedAt: rawJob.postedAt || new Date(),
        latitude,
        longitude,
        cityMatch: null,
        distanceMiles: null,
        compositeScore: null,

        // P0 provenance fields
        sourceType: rawJob.source === 'company' ? 'scraped'
            : atsInfo.cleanJson ? 'api'
            : 'api', // JSearch/aggregator sources are API even if HTML inside
        canonicalUrl: null,        // Set by the ATS redirect resolver (future step)
        fingerprint: buildFingerprint(rawJob.company, rawJob.title, rawJob.location),
        lastExtractedAt: rawJob.scrapedAt ?? new Date(),
        recordConfidence: computeConfidence(rawJob),
        normalizationVersion: NORMALIZATION_VERSION,

        // ── P0 structured extraction fields ──
        salaryMin: salary.min,
        salaryMax: salary.max,
        salaryCurrency: salary.currency,
        workMode: classifyWorkMode(rawJob.title, rawJob.location, descriptionText),
        seniority: classifySeniority(rawJob.title),
        skillsTags: extractSkillTags(`${rawJob.title} ${descriptionText}`),
    };
}
