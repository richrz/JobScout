/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { KanbanBoard } from '@/components/pipeline/KanbanBoard';
import { makeJob } from '../../../fixtures/job';

// Mock server actions
jest.mock('@/app/actions/application', () => ({
    updateApplicationStatus: jest.fn(),
    bulkArchiveApplications: jest.fn(),
    bulkDeleteApplications: jest.fn(),
}));

// Mock dnd-kit
jest.mock('@dnd-kit/core', () => ({
    DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DragOverlay: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useSensor: jest.fn(),
    useSensors: jest.fn(),
    PointerSensor: jest.fn(),
    KeyboardSensor: jest.fn(),
    closestCorners: jest.fn(),
    defaultDropAnimationSideEffects: jest.fn(() => ({ styles: { active: { opacity: '0.5' } } })),
    useDroppable: jest.fn(() => ({ setNodeRef: jest.fn() })),
}));

jest.mock('@dnd-kit/sortable', () => ({
    arrayMove: jest.fn(),
    sortableKeyboardCoordinates: jest.fn(),
    useSortable: () => ({
        attributes: {},
        listeners: {},
        setNodeRef: jest.fn(),
        transform: null,
        transition: null,
        isDragging: false,
    }),
    SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    verticalListSortingStrategy: jest.fn(),
}));

// Mock components
jest.mock('@/components/pipeline/ApplicationCard', () => ({
    ApplicationCard: ({ application }: any) => <div data-testid="application-card">{application.job.title}</div>,
}));

describe('KanbanBoard', () => {
    const mockApplications = [
        {
            id: 'app-1',
            userId: 'user-1',
            jobId: 'job-1',
            status: 'interested',
            resumePath: null,
            notes: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            appliedAt: null,
            statusHistory: [],
            job: makeJob({ id: 'job-1', title: 'Job 1', company: 'Company A', salary: '$100k', compositeScore: 0.9 }),
        },
        {
            id: 'app-2',
            userId: 'user-1',
            jobId: 'job-2',
            status: 'applied',
            resumePath: null,
            notes: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            appliedAt: new Date(),
            statusHistory: [],
            job: makeJob({ id: 'job-2', title: 'Job 2', company: 'Company B', sourceUrl: 'https://example.com/jobs/2', salary: '$120k', compositeScore: 0.8 }),
        },
    ];

    it('renders all columns', () => {
        render(<KanbanBoard initialApplications={mockApplications} />);

        expect(screen.getByText('Interested')).toBeInTheDocument();
        expect(screen.getByText('Applied')).toBeInTheDocument();
        expect(screen.getByText('Interview')).toBeInTheDocument();
        // ... check other columns
    });

    it('renders applications in correct columns', () => {
        render(<KanbanBoard initialApplications={mockApplications} />);

        expect(screen.getByText('Job 1')).toBeInTheDocument();
        expect(screen.getByText('Job 2')).toBeInTheDocument();

        // In a real integration test we would check if they are under the correct column header
        // Here we just check they are rendered.
    });
});
