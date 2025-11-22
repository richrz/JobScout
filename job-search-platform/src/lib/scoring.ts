export interface ScoringWeights {
    keywords: number;
    recency: number;
    salary: number;
    distance: number;
}

export interface ScorableJob {
    id: string;
    title: string;
    description: string;
    salary?: { min: number; max: number; currency: string };
    postedAt: Date;
    distance?: number;
    skills?: string[];
    score?: number;
}

export interface ScoringCriteria {
    keywords?: string[];
    targetSalary?: number;
}

export function calculateJobScore(
    job: ScorableJob,
    criteria: ScoringCriteria,
    weights: ScoringWeights
): number {
    let totalScore = 0;

    // 1. Keyword Scoring
    if (criteria.keywords && criteria.keywords.length > 0) {
        totalScore += calculateKeywordScore(job, criteria.keywords) * weights.keywords;
    }

    // 2. Recency Scoring
    totalScore += calculateRecencyScore(job.postedAt) * weights.recency;

    // 3. Salary Scoring
    if (weights.salary > 0) {
        totalScore += calculateSalaryScore(job, criteria.targetSalary) * weights.salary;
    }

    // 4. Distance Scoring
    if (weights.distance > 0 && job.distance !== undefined) {
        totalScore += calculateDistanceScore(job.distance) * weights.distance;
    }

    return totalScore;
}

function calculateKeywordScore(job: ScorableJob, keywords: string[]): number {
    const titleLower = job.title.toLowerCase();
    const descriptionLower = job.description.toLowerCase();
    let keywordScore = 0;
    let maxPossibleScore = 0;

    for (const keyword of keywords) {
        const kLower = keyword.toLowerCase();
        maxPossibleScore += 1; // Max score per keyword is 1 (title match)

        if (titleLower.includes(kLower)) {
            keywordScore += 1;
        } else if (descriptionLower.includes(kLower)) {
            keywordScore += 0.5;
        }
    }

    return maxPossibleScore > 0 ? keywordScore / maxPossibleScore : 0;
}

function calculateRecencyScore(postedAt: Date): number {
    const now = Date.now();
    const posted = new Date(postedAt).getTime();
    const daysOld = Math.max(0, (now - posted) / (1000 * 60 * 60 * 24));
    // Score is 1.0 for today, 0.0 for 30+ days ago
    return Math.max(0, 1 - (daysOld / 30));
}

function calculateSalaryScore(job: ScorableJob, targetSalary?: number): number {
    if (!targetSalary || !job.salary) {
        return 0;
    }

    const maxSalary = job.salary.max;
    if (maxSalary >= targetSalary) {
        return 1;
    }

    // Partial score if max salary is below target
    return Math.max(0, maxSalary / targetSalary);
}

function calculateDistanceScore(distance: number): number {
    // Simple linear decay: 1.0 at 0km, 0.0 at 100km
    const maxDist = 100;
    const dist = Math.max(0, Math.min(distance, maxDist));
    return 1 - (dist / maxDist);
}

export function rankJobs(
    jobs: ScorableJob[],
    criteria: ScoringCriteria,
    weights: ScoringWeights
): ScorableJob[] {
    const scoredJobs = jobs.map(job => ({
        ...job,
        score: calculateJobScore(job, criteria, weights)
    }));

    // Sort by score descending
    return scoredJobs.sort((a, b) => (b.score || 0) - (a.score || 0));
}
