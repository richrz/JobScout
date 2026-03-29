/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import StretchLabClient, {
  type CockpitPanelRecord,
} from '@/app/dashboard-stretch-lab/StretchLabClient';
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

jest.mock('@/components/resume/ResumePreview', () => ({
  ResumePreview: () => <div data-testid="cockpit-resume-preview">Preview</div>,
}));

const baseViewModel: CockpitPhaseOneViewModel = {
  whileYouWereOut: {
    newJobsCount: 2,
    matchedJobsCount: 1,
    highFitCount: 0,
  },
  recentActivity: [],
  kanbanColumns: [
    { stage: 'NEW', label: 'new', total: 0, cards: [] },
    { stage: 'INTERESTED', label: 'interested', total: 0, cards: [] },
    { stage: 'CRAFTING', label: 'crafting', total: 0, cards: [] },
    { stage: 'APPLIED', label: 'applied', total: 0, cards: [] },
    { stage: 'SCREENING', label: 'screening', total: 0, cards: [] },
    { stage: 'INTERVIEW', label: 'interview', total: 0, cards: [] },
    { stage: 'OFFER', label: 'offer', total: 0, cards: [] },
  ],
};

describe('StretchLabClient', () => {
  it('stretches the hovered lane and compresses its neighbors', async () => {
    const panelRecords: CockpitPanelRecord[] = [
      {
        id: 'job-1',
        kind: 'discovery',
        jobId: 'job-1',
        title: 'AI Solutions Engineer',
        company: 'Acme',
        location: 'Kansas City, Missouri',
        description: 'Lead discovery calls and run polished solution demos for enterprise AI accounts.',
        sourceUrl: null,
        salary: '$190,000',
        stage: 'NEW',
        createdAt: '2026-03-29T10:00:00.000Z',
        updatedAt: '2026-03-29T10:00:00.000Z',
        workspaceId: null,
        workspaceStatus: null,
        noteCount: 0,
        resumes: [],
        compositeScore: 0.94,
        draftSeed: null,
      },
      {
        id: 'workspace-1',
        kind: 'managed',
        jobId: 'job-2',
        title: 'Senior Sales Engineer',
        company: 'Yamazen Inc',
        location: 'Kansas City, Missouri',
        description: 'Own technical discovery and guide buyers through CNC platform evaluation.',
        sourceUrl: null,
        salary: '$165,000',
        stage: 'INTERESTED',
        createdAt: '2026-03-29T10:00:00.000Z',
        updatedAt: '2026-03-29T10:00:00.000Z',
        workspaceId: 'workspace-1',
        workspaceStatus: 'INTERESTED',
        noteCount: 1,
        resumes: [],
        compositeScore: 0.86,
        draftSeed: null,
      },
    ];

    render(
      <StretchLabClient
        userName="Richard Ruiz"
        panelRecords={panelRecords}
        viewModel={{
          ...baseViewModel,
          kanbanColumns: baseViewModel.kanbanColumns.map((column) => {
            if (column.stage === 'NEW') {
              return {
                ...column,
                total: 1,
                cards: [
                  {
                    id: 'job-1',
                    kind: 'discovery',
                    jobId: 'job-1',
                    title: 'AI Solutions Engineer',
                    company: 'Acme',
                    location: 'Kansas City, Missouri',
                    scoreLabel: '94%',
                    meta: 'Mar 29 · 94%',
                    stage: 'NEW',
                    updatedAt: '2026-03-29T10:00:00.000Z',
                  },
                ],
              };
            }

            if (column.stage === 'INTERESTED') {
              return {
                ...column,
                total: 1,
                cards: [
                  {
                    id: 'workspace-1',
                    kind: 'managed',
                    jobId: 'job-2',
                    workspaceId: 'workspace-1',
                    title: 'Senior Sales Engineer',
                    company: 'Yamazen Inc',
                    location: 'Kansas City, Missouri',
                    scoreLabel: '86%',
                    meta: 'active now',
                    stage: 'INTERESTED',
                    updatedAt: '2026-03-29T10:00:00.000Z',
                  },
                ],
              };
            }

            return column;
          }),
        }}
      />,
    );

    const newColumn = screen.getByTestId('kanban-column-new');
    const interestedColumn = screen.getByTestId('kanban-column-interested');

    expect(newColumn).toHaveAttribute('data-preview-state', 'idle');
    expect(interestedColumn).toHaveAttribute('data-preview-state', 'idle');

    fireEvent.pointerEnter(newColumn);

    await waitFor(() => {
      expect(newColumn).toHaveAttribute('data-preview-state', 'expanded');
    });
    expect(interestedColumn).toHaveAttribute('data-preview-state', 'compressed');
    expect(screen.getByText(/Lead discovery calls/i)).toBeInTheDocument();
  });
});
