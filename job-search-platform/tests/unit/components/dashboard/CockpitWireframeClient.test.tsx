/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import CockpitWireframeClient, {
  type CockpitPanelRecord,
} from '@/app/dashboard-wireframe/CockpitWireframeClient';
import type { CockpitPhaseOneViewModel } from '@/lib/cockpit-phase1';

jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock('@/lib/resume-generator', () => ({
  generateAndPreviewResume: jest.fn(),
}));

jest.mock('@/app/resume/actions', () => ({
  saveResume: jest.fn(),
}));

const baseViewModel: CockpitPhaseOneViewModel = {
  whileYouWereOut: {
    newJobsCount: 12,
    matchedJobsCount: 4,
    highFitCount: 2,
  },
  recentActivity: [],
  riverColumns: [
    { stage: 'NEW', label: 'new', total: 0, cards: [] },
    { stage: 'INTERESTED', label: 'interested', total: 0, cards: [] },
    { stage: 'CRAFTING', label: 'crafting', total: 0, cards: [] },
    { stage: 'APPLIED', label: 'applied', total: 0, cards: [] },
    { stage: 'SCREENING', label: 'screening', total: 0, cards: [] },
    { stage: 'INTERVIEW', label: 'interview', total: 0, cards: [] },
    { stage: 'OFFER', label: 'offer', total: 0, cards: [] },
  ],
};

const baseDraft = {
  contactInfo: {
    name: 'Richard Ruiz',
    email: 'rruiz@example.com',
    phone: '(949) 743-4975',
    location: 'Colorado Springs, CO',
  },
  summary: 'Technical seller and architect who translates complexity into hiring-manager language.',
  experience: [
    {
      id: 'exp-1',
      title: 'Principal Solutions Architect',
      company: 'Acme',
      location: 'Remote',
      startDate: '2023-01-01',
      endDate: '',
      description: 'Built technical sales plays and supported strategic deals.',
    },
  ],
  education: [],
  skills: ['AWS', 'Solution Selling', 'AI', 'Architecture'],
};

function buildViewModel(panel: CockpitPanelRecord): CockpitPhaseOneViewModel {
  return {
    ...baseViewModel,
    recentActivity: [
      {
        id: panel.id,
        title: panel.title,
        company: panel.company,
        stage: panel.stage,
        updatedAt: panel.updatedAt,
        meta: 'active now',
      },
    ],
    riverColumns: baseViewModel.riverColumns.map((column) =>
      column.stage === panel.stage
        ? {
            ...column,
            total: 1,
            cards: [
              {
                id: panel.id,
                kind: panel.kind,
                jobId: panel.jobId,
                workspaceId: panel.workspaceId ?? undefined,
                title: panel.title,
                company: panel.company,
                location: panel.location,
                scoreLabel: panel.compositeScore ? `${Math.round(panel.compositeScore * 100)}%` : null,
                meta: 'active now',
                stage: panel.stage,
                updatedAt: panel.updatedAt,
              },
            ],
          }
        : column,
    ),
  };
}

function renderClient(panel: CockpitPanelRecord) {
  render(
    <CockpitWireframeClient
      userName="Richard Ruiz"
      viewModel={buildViewModel(panel)}
      panelRecords={[panel]}
    />,
  );
}

describe('CockpitWireframeClient workspace panel', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ notes: [] }),
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('turns INTERESTED cards into a live notes workspace instead of debug state output', async () => {
    renderClient({
      id: 'workspace-1',
      kind: 'managed',
      jobId: 'job-1',
      title: 'Senior Solutions Architect',
      company: 'Acme',
      location: 'Remote',
      description: 'Help shape technical strategy for enterprise customers.',
      sourceUrl: null,
      salary: null,
      stage: 'INTERESTED',
      createdAt: '2026-03-09T14:00:00.000Z',
      updatedAt: '2026-03-09T15:00:00.000Z',
      workspaceId: 'workspace-1',
      workspaceStatus: 'INTERESTED',
      legacyStatus: 'interested',
      noteCount: 0,
      resumes: [],
      compositeScore: 0.88,
      draftSeed: {
        source: 'career-data',
        updatedAt: '2026-03-09T14:30:00.000Z',
        content: baseDraft,
      },
    });

    expect(screen.getByText('Why this role matters')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add note/i })).toBeInTheDocument();
    expect(screen.queryByText(/Legacy state/i)).not.toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/workspace/workspace-1/notes');
    });
    await waitFor(() => {
      expect(screen.getByText(/No notes yet/i)).toBeInTheDocument();
    });
  });

  it('turns CRAFTING cards into a real drafting desk with preview and draft actions', async () => {
    renderClient({
      id: 'workspace-2',
      kind: 'managed',
      jobId: 'job-2',
      title: 'AI Solutions Engineer',
      company: 'Deloitte',
      location: 'Denver, CO',
      description: 'Own technical storytelling for GenAI client work.',
      sourceUrl: 'https://example.com/deloitte-role',
      salary: '$210,000',
      stage: 'CRAFTING',
      createdAt: '2026-03-09T15:10:00.000Z',
      updatedAt: '2026-03-09T16:00:00.000Z',
      workspaceId: 'workspace-2',
      workspaceStatus: 'INTERESTED',
      legacyStatus: 'interested',
      noteCount: 2,
      resumes: [
        {
          id: 'resume-1',
          title: 'Working Draft',
          documentState: 'WORKING_DRAFT',
          updatedAt: '2026-03-09T15:30:00.000Z',
        },
      ],
      compositeScore: 0.93,
      draftSeed: {
        source: 'working-draft',
        updatedAt: '2026-03-09T15:30:00.000Z',
        content: baseDraft,
      },
    });

    expect(screen.getByText('Resume desk')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /rewrite draft/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save draft/i })).toBeInTheDocument();
    expect(screen.getByText('Live draft preview')).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/workspace/workspace-2/notes');
    });
  });

  it('turns APPLIED cards into a submission and follow-up workspace', async () => {
    renderClient({
      id: 'workspace-3',
      kind: 'managed',
      jobId: 'job-3',
      title: 'Principal Architect',
      company: 'Oracle',
      location: 'Kansas City, MO',
      description: 'Lead enterprise architecture conversations.',
      sourceUrl: 'https://example.com/oracle-apply',
      salary: '$240,000',
      stage: 'APPLIED',
      createdAt: '2026-03-08T12:00:00.000Z',
      updatedAt: '2026-03-09T16:30:00.000Z',
      workspaceId: 'workspace-3',
      workspaceStatus: 'APPLIED',
      legacyStatus: 'applied',
      noteCount: 1,
      resumes: [
        {
          id: 'resume-3',
          title: 'Submitted Package',
          documentState: 'SUBMITTED_SNAPSHOT',
          updatedAt: '2026-03-08T12:00:00.000Z',
        },
      ],
      compositeScore: 0.79,
      draftSeed: {
        source: 'working-draft',
        updatedAt: '2026-03-08T11:30:00.000Z',
        content: baseDraft,
      },
    });

    expect(screen.getByText('Submission record')).toBeInTheDocument();
    expect(screen.getByText('Follow-up log')).toBeInTheDocument();
    expect(screen.getByText(/View application source/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/workspace/workspace-3/notes');
    });
  });

  it.each([
    {
      stage: 'SCREENING' as const,
      title: 'Screening desk',
      notesTitle: 'Recruiter and screening notes',
    },
    {
      stage: 'INTERVIEW' as const,
      title: 'Interview prep board',
      notesTitle: 'Interview prep notes',
    },
    {
      stage: 'OFFER' as const,
      title: 'Decision board',
      notesTitle: 'Offer decision notes',
    },
  ])('renders a stage-owned %s workspace instead of a generic asset slab', async ({ stage, title, notesTitle }) => {
    renderClient({
      id: `workspace-${stage.toLowerCase()}`,
      kind: 'managed',
      jobId: `job-${stage.toLowerCase()}`,
      title: 'Staff Engineer',
      company: 'Acme',
      location: 'Remote',
      description: 'Own technical direction for a critical product area.',
      sourceUrl: 'https://example.com/acme-role',
      salary: '$200,000',
      stage,
      createdAt: '2026-03-08T12:00:00.000Z',
      updatedAt: '2026-03-09T18:00:00.000Z',
      workspaceId: `workspace-${stage.toLowerCase()}`,
      workspaceStatus: 'FOLLOW_UP',
      legacyStatus: stage.toLowerCase(),
      noteCount: 0,
      resumes: [],
      compositeScore: 0.91,
      draftSeed: {
        source: 'working-draft',
        updatedAt: '2026-03-09T17:15:00.000Z',
        content: baseDraft,
      },
    });

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(notesTitle)).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`/api/workspace/workspace-${stage.toLowerCase()}/notes`);
    });
  });
});
