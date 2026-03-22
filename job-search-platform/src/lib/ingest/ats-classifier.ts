/**
 * ATS Classifier — route job sources to the correct parser.
 *
 * Problem: Greenhouse, Lever, NeoGov, and USAJOBS return native structured JSON.
 * Sending their output through an LLM extraction call wastes tokens and adds
 * latency for zero accuracy gain. The LLM extractor should only receive raw HTML.
 *
 * Solution: Classify the source URL/domain at fetch time and route:
 *   - Clean-JSON ATS → deterministic JSON parser (no LLM)
 *   - Raw-HTML source → html-to-markdown stripper → LLM extractor
 *
 * Adding a new ATS: add an entry to ATS_REGISTRY below.
 * No code changes needed elsewhere — the classifier is the single routing point.
 */

export type AtsSystem =
    | 'greenhouse'
    | 'lever'
    | 'workday'
    | 'neogov'
    | 'usajobs'
    | 'icims'
    | 'taleo'
    | 'smartrecruiters'
    | 'successfactors'
    | 'jobvite'
    | 'bamboohr'
    | 'unknown';

export interface AtsClassification {
    system: AtsSystem;
    /** Whether this ATS returns structured JSON we can parse deterministically */
    cleanJson: boolean;
    /** Whether the LLM extractor should be skipped for this source */
    skipLlm: boolean;
}

interface AtsEntry {
    system: AtsSystem;
    domains: string[];
    cleanJson: boolean;
}

/**
 * Registry of known ATS platforms and their parsing characteristics.
 * Domain patterns are matched as substrings of the job URL.
 *
 * cleanJson: true = ATS returns parseable structured data, skip LLM extraction.
 * cleanJson: false = ATS returns HTML or semi-structured content, LLM needed.
 */
const ATS_REGISTRY: AtsEntry[] = [
    {
        system: 'greenhouse',
        domains: ['boards.greenhouse.io', 'job-boards.greenhouse.io'],
        cleanJson: true,  // GET /boards/{company}/jobs/{id} returns clean JSON
    },
    {
        system: 'lever',
        domains: ['jobs.lever.co'],
        cleanJson: true,  // Lever has a clean JSON API endpoint
    },
    {
        system: 'neogov',
        domains: ['www.governmentjobs.com', 'agency.governmentjobs.com', 'neogov.com'],
        cleanJson: true,  // NeoGov's API returns structured XML/JSON
    },
    {
        system: 'usajobs',
        domains: ['www.usajobs.gov', 'usajobs.gov'],
        cleanJson: true,  // USAJOBS REST API returns structured JSON
    },
    {
        system: 'smartrecruiters',
        domains: ['jobs.smartrecruiters.com'],
        cleanJson: true,  // SmartRecruiters has a clean REST API
    },
    {
        system: 'bamboohr',
        domains: ['.bamboohr.com'],
        cleanJson: false,  // BambooHR embeds jobs in HTML pages
    },
    {
        system: 'icims',
        domains: ['.icims.com'],
        cleanJson: false,  // iCIMS is HTML-heavy
    },
    {
        system: 'taleo',
        domains: ['.taleo.net'],
        cleanJson: false,  // Taleo is HTML-heavy / iframe-based
    },
    {
        system: 'workday',
        domains: ['.myworkdayjobs.com', 'wd1.myworkday.com', 'wd3.myworkday.com', 'wd5.myworkday.com'],
        cleanJson: false,  // Workday has an internal API but requires session auth
    },
    {
        system: 'successfactors',
        domains: ['.successfactors.com', '.successfactors.eu'],
        cleanJson: false,  // SAP SuccessFactors is heavily JS-rendered
    },
    {
        system: 'jobvite',
        domains: ['jobs.jobvite.com'],
        cleanJson: false,  // Jobvite is HTML-rendered
    },
];

/**
 * Classify a job URL to determine which ATS serves it and how to parse it.
 */
export function classifyAts(url: string): AtsClassification {
    if (!url) return { system: 'unknown', cleanJson: false, skipLlm: false };

    const lowerUrl = url.toLowerCase();

    for (const entry of ATS_REGISTRY) {
        if (entry.domains.some(domain => lowerUrl.includes(domain))) {
            return {
                system: entry.system,
                cleanJson: entry.cleanJson,
                skipLlm: entry.cleanJson, // skip LLM iff we have clean JSON
            };
        }
    }

    return { system: 'unknown', cleanJson: false, skipLlm: false };
}

/**
 * Quick check: does this URL come from a source that returns clean JSON?
 * Use this as the fast-path gate before fetching content.
 */
export function isCleanJsonSource(url: string): boolean {
    return classifyAts(url).cleanJson;
}

/**
 * Determine the ATS system name for a job URL.
 * Used to populate Job.atsSystem on the Company entity.
 */
export function detectAtsSystem(url: string): AtsSystem {
    return classifyAts(url).system;
}
