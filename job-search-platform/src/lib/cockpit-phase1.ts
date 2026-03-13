export type CockpitWorkspaceStatus =
  | 'INTERESTED'
  | 'APPLIED'
  | 'FOLLOW_UP'
  | 'DORMANT'
  | 'ARCHIVED'
  | 'PASSED';

export type CockpitDocumentState =
  | 'REFERENCE'
  | 'WORKING_DRAFT'
  | 'SAVED_VARIANT'
  | 'SUBMITTED_SNAPSHOT';

export type CockpitStage =
  | 'NEW'
  | 'INTERESTED'
  | 'CRAFTING'
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'OFFER';

export type CockpitDiscoveryJobInput = {
  jobId: string;
  title: string;
  company: string;
  location: string | null;
  postedAt: string;
  compositeScore?: number | null;
};

export type CockpitManagedOpportunityInput = {
  workspaceId: string;
  jobId: string;
  title: string;
  company: string;
  location: string | null;
  updatedAt: string;
  workspaceStatus: CockpitWorkspaceStatus;
  legacyStatus?: string | null;
  resumeStates: CockpitDocumentState[];
  compositeScore?: number | null;
};

export type CockpitCard = {
  id: string;
  kind: 'discovery' | 'managed';
  jobId: string;
  workspaceId?: string;
  title: string;
  company: string;
  location: string | null;
  scoreLabel: string | null;
  meta: string;
  stage: CockpitStage;
  updatedAt: string;
};

export type CockpitKanbanColumn = {
  stage: CockpitStage;
  label: string;
  total: number;
  cards: CockpitCard[];
};

export type CockpitRecentActivityItem = {
  id: string;
  title: string;
  company: string;
  stage: CockpitStage;
  updatedAt: string;
  meta: string;
};

export type WhileYouWereOutStats = {
  newJobsCount: number;
  matchedJobsCount: number;
  highFitCount: number;
};

export type CockpitPhaseOneViewModel = {
  whileYouWereOut: WhileYouWereOutStats;
  recentActivity: CockpitRecentActivityItem[];
  kanbanColumns: CockpitKanbanColumn[];
};

export const COCKPIT_STAGE_ORDER: CockpitStage[] = [
  'NEW',
  'INTERESTED',
  'CRAFTING',
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'OFFER',
];

const STAGE_LABELS: Record<CockpitStage, string> = {
  NEW: 'new',
  INTERESTED: 'interested',
  CRAFTING: 'crafting',
  APPLIED: 'applied',
  SCREENING: 'screening',
  INTERVIEW: 'interview',
  OFFER: 'offer',
};

function normalizeLegacyStatus(status?: string | null) {
  return status?.trim().toLowerCase() ?? null;
}

function hasDraftResume(resumeStates: CockpitDocumentState[]) {
  return resumeStates.some((state) => state === 'WORKING_DRAFT' || state === 'SAVED_VARIANT');
}

function formatPercent(score?: number | null) {
  if (typeof score !== 'number' || Number.isNaN(score)) {
    return null;
  }

  return `${Math.round(score * 100)}%`;
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatStageMeta(stage: CockpitStage, updatedAt: string, score?: number | null) {
  const date = formatShortDate(updatedAt);
  const scoreLabel = formatPercent(score);

  if (stage === 'NEW' && scoreLabel) {
    return `${date} · ${scoreLabel}`;
  }

  if (stage === 'CRAFTING') {
    return scoreLabel ? `draft in progress · ${scoreLabel}` : 'draft in progress';
  }

  if (stage === 'APPLIED') {
    return `submitted ${date}`;
  }

  if (stage === 'SCREENING') {
    return `active since ${date}`;
  }

  if (stage === 'INTERVIEW') {
    return `interview track · ${date}`;
  }

  if (stage === 'OFFER') {
    return `offer track · ${date}`;
  }

  return scoreLabel ? `${date} · ${scoreLabel}` : `updated ${date}`;
}

function sortByRecent<T extends { updatedAt: string }>(items: T[]) {
  return [...items].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );
}

function sortDiscoveryJobs(jobs: CockpitDiscoveryJobInput[]) {
  return [...jobs].sort((left, right) => {
    const scoreDiff = (right.compositeScore ?? -1) - (left.compositeScore ?? -1);
    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    return new Date(right.postedAt).getTime() - new Date(left.postedAt).getTime();
  });
}

export function deriveCockpitStage({
  workspaceStatus,
  legacyStatus,
  resumeStates = [],
}: {
  workspaceStatus: CockpitWorkspaceStatus;
  legacyStatus?: string | null;
  resumeStates?: CockpitDocumentState[];
}): CockpitStage | null {
  if (workspaceStatus === 'PASSED' || workspaceStatus === 'ARCHIVED') {
    return null;
  }

  if (workspaceStatus === 'INTERESTED') {
    return hasDraftResume(resumeStates) ? 'CRAFTING' : 'INTERESTED';
  }

  if (workspaceStatus === 'APPLIED') {
    return 'APPLIED';
  }

  if (workspaceStatus === 'FOLLOW_UP' || workspaceStatus === 'DORMANT') {
    const normalizedStatus = normalizeLegacyStatus(legacyStatus);

    if (normalizedStatus === 'offer') {
      return 'OFFER';
    }

    if (normalizedStatus === 'interview') {
      return 'INTERVIEW';
    }

    return 'SCREENING';
  }

  return 'INTERESTED';
}

export function buildWhileYouWereOutStats(
  discoveryJobs: CockpitDiscoveryJobInput[],
): WhileYouWereOutStats {
  return {
    newJobsCount: discoveryJobs.length,
    matchedJobsCount: discoveryJobs.filter((job) => (job.compositeScore ?? 0) >= 0.7).length,
    highFitCount: discoveryJobs.filter((job) => (job.compositeScore ?? 0) >= 0.9).length,
  };
}

export function buildCockpitPhaseOneViewModel({
  managedOpportunities,
  discoveryJobs,
  recentActivityLimit = 4,
  kanbanLimit = 4,
}: {
  managedOpportunities: CockpitManagedOpportunityInput[];
  discoveryJobs: CockpitDiscoveryJobInput[];
  recentActivityLimit?: number;
  kanbanLimit?: number;
}): CockpitPhaseOneViewModel {
  const groupedCards = new Map<CockpitStage, CockpitCard[]>(
    COCKPIT_STAGE_ORDER.map((stage) => [stage, []]),
  );

  const sortedDiscovery = sortDiscoveryJobs(discoveryJobs);
  for (const job of sortedDiscovery) {
    groupedCards.get('NEW')?.push({
      id: job.jobId,
      kind: 'discovery',
      jobId: job.jobId,
      title: job.title,
      company: job.company,
      location: job.location,
      scoreLabel: formatPercent(job.compositeScore),
      meta: formatStageMeta('NEW', job.postedAt, job.compositeScore),
      stage: 'NEW',
      updatedAt: job.postedAt,
    });
  }

  const visibleManaged: Array<{ stage: CockpitStage; card: CockpitCard }> = managedOpportunities
    .map((opportunity): { stage: CockpitStage; card: CockpitCard } | null => {
      const stage = deriveCockpitStage({
        workspaceStatus: opportunity.workspaceStatus,
        legacyStatus: opportunity.legacyStatus,
        resumeStates: opportunity.resumeStates,
      });

      if (!stage) {
        return null;
      }

      return {
        stage,
        card: {
          id: opportunity.workspaceId,
          kind: 'managed' as const,
          jobId: opportunity.jobId,
          workspaceId: opportunity.workspaceId,
          title: opportunity.title,
          company: opportunity.company,
          location: opportunity.location,
          scoreLabel: formatPercent(opportunity.compositeScore),
          meta: formatStageMeta(stage, opportunity.updatedAt, opportunity.compositeScore),
          stage,
          updatedAt: opportunity.updatedAt,
        },
      };
    })
    .filter((item) => item !== null);

  for (const item of visibleManaged) {
    groupedCards.get(item.stage)?.push(item.card);
  }

  const kanbanColumns = COCKPIT_STAGE_ORDER.map((stage) => {
    const cards = groupedCards.get(stage) ?? [];
    const sortedCards = sortByRecent(cards);

    return {
      stage,
      label: STAGE_LABELS[stage],
      total: sortedCards.length,
      cards: sortedCards.slice(0, kanbanLimit),
    };
  });

  const recentActivity = sortByRecent(
    visibleManaged.map(({ card }) => ({
      id: card.id,
      title: card.title,
      company: card.company,
      stage: card.stage,
      updatedAt: card.updatedAt,
      meta: card.meta,
    })),
  ).slice(0, recentActivityLimit);

  return {
    whileYouWereOut: buildWhileYouWereOutStats(sortedDiscovery),
    recentActivity,
    kanbanColumns,
  };
}
