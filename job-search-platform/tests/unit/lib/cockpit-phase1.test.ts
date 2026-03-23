import {
  buildCockpitPhaseOneViewModel,
  buildWhileYouWereOutStats,
  deriveCockpitStage,
  type CockpitDiscoveryJobInput,
  type CockpitManagedOpportunityInput,
} from '@/lib/cockpit-phase1';

describe('cockpit-phase1', () => {
  it('maps interested work with drafts into CRAFTING', () => {
    expect(
      deriveCockpitStage({
        workspaceStatus: 'INTERESTED',
        legacyStatus: 'interested',
        resumeStates: ['WORKING_DRAFT'],
      }),
    ).toBe('CRAFTING');
  });

  it('maps new lifecycle statuses directly to cockpit stages', () => {
    expect(deriveCockpitStage({ workspaceStatus: 'SCREENING' })).toBe('SCREENING');
    expect(deriveCockpitStage({ workspaceStatus: 'INTERVIEW' })).toBe('INTERVIEW');
    expect(deriveCockpitStage({ workspaceStatus: 'OFFER' })).toBe('OFFER');
    // Legacy FOLLOW_UP falls back to SCREENING until fully migrated
    expect(deriveCockpitStage({ workspaceStatus: 'FOLLOW_UP' })).toBe('SCREENING');
  });

  it('computes while-you-were-out counts from live discovery jobs', () => {
    const jobs: CockpitDiscoveryJobInput[] = [
      {
        jobId: 'job-1',
        title: 'Role One',
        company: 'Alpha',
        location: 'Remote',
        postedAt: '2026-03-09T10:00:00.000Z',
        compositeScore: 0.91,
      },
      {
        jobId: 'job-2',
        title: 'Role Two',
        company: 'Beta',
        location: 'Denver, CO',
        postedAt: '2026-03-09T10:00:00.000Z',
        compositeScore: 0.74,
      },
      {
        jobId: 'job-3',
        title: 'Role Three',
        company: 'Gamma',
        location: 'Denver, CO',
        postedAt: '2026-03-09T10:00:00.000Z',
        compositeScore: 0.51,
      },
    ];

    expect(buildWhileYouWereOutStats(jobs)).toEqual({
      newJobsCount: 3,
      matchedJobsCount: 2,
      highFitCount: 1,
    });
  });

  it('builds kanban columns from current schema reality and hides passed work', () => {
    const managedOpportunities: CockpitManagedOpportunityInput[] = [
      {
        workspaceId: 'ws-interest',
        jobId: 'job-interest',
        title: 'Solutions Engineer',
        company: 'Acme',
        location: 'Remote',
        updatedAt: '2026-03-09T11:00:00.000Z',
        workspaceStatus: 'INTERESTED',
        legacyStatus: 'interested',
        resumeStates: [],
      },
      {
        workspaceId: 'ws-crafting',
        jobId: 'job-crafting',
        title: 'AI Architect',
        company: 'Deloitte',
        location: 'Remote',
        updatedAt: '2026-03-09T12:00:00.000Z',
        workspaceStatus: 'INTERESTED',
        legacyStatus: 'interested',
        resumeStates: ['WORKING_DRAFT'],
      },
      {
        workspaceId: 'ws-applied',
        jobId: 'job-applied',
        title: 'Platform Engineer',
        company: 'Oracle',
        location: 'Austin, TX',
        updatedAt: '2026-03-09T09:00:00.000Z',
        workspaceStatus: 'APPLIED',
        legacyStatus: 'applied',
        resumeStates: ['SUBMITTED_SNAPSHOT'],
      },
      {
        workspaceId: 'ws-offer',
        jobId: 'job-offer',
        title: 'Principal Architect',
        company: 'Notion',
        location: 'New York, NY',
        updatedAt: '2026-03-09T08:00:00.000Z',
        workspaceStatus: 'OFFER',
        legacyStatus: null,
        resumeStates: ['SUBMITTED_SNAPSHOT'],
      },
      {
        workspaceId: 'ws-passed',
        jobId: 'job-passed',
        title: 'Old Role',
        company: 'Legacy',
        location: 'Denver, CO',
        updatedAt: '2026-03-09T07:00:00.000Z',
        workspaceStatus: 'PASSED',
        legacyStatus: 'passed',
        resumeStates: [],
      },
    ];

    const discoveryJobs: CockpitDiscoveryJobInput[] = [
      {
        jobId: 'job-new-1',
        title: 'Fresh Match',
        company: 'NewCo',
        location: 'Remote',
        postedAt: '2026-03-09T13:00:00.000Z',
        compositeScore: 0.88,
      },
      {
        jobId: 'job-new-2',
        title: 'Another Match',
        company: 'OtherCo',
        location: 'Remote',
        postedAt: '2026-03-09T12:30:00.000Z',
        compositeScore: 0.66,
      },
    ];

    const viewModel = buildCockpitPhaseOneViewModel({
      managedOpportunities,
      discoveryJobs,
      recentActivityLimit: 3,
      kanbanLimit: 5,
    });

    expect(viewModel.kanbanColumns.find((column) => column.stage === 'NEW')?.total).toBe(2);
    expect(viewModel.kanbanColumns.find((column) => column.stage === 'INTERESTED')?.total).toBe(1);
    expect(viewModel.kanbanColumns.find((column) => column.stage === 'CRAFTING')?.total).toBe(1);
    expect(viewModel.kanbanColumns.find((column) => column.stage === 'APPLIED')?.total).toBe(1);
    expect(viewModel.kanbanColumns.find((column) => column.stage === 'OFFER')?.total).toBe(1);

    const hiddenPassed = viewModel.kanbanColumns.some((column) =>
      column.cards.some((card) => card.id === 'ws-passed'),
    );
    expect(hiddenPassed).toBe(false);

    expect(viewModel.recentActivity.map((item) => item.id)).toEqual([
      'ws-crafting',
      'ws-interest',
      'ws-applied',
    ]);
  });
});
