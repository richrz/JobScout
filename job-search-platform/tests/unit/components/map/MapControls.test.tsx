/**
 * @jest-environment jsdom
 */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MapControls } from '@/components/map/MapControls';
import type { Job } from '@prisma/client';

// Mock the JobMap component
jest.mock('@/components/map/JobMap', () => ({
    JobMap: ({ jobs, showHeatmap }: { jobs: any[], showHeatmap?: boolean }) => (
        <div data-testid="job-map" data-heatmap={showHeatmap} data-job-count={jobs.length}>
            Mock Map
        </div>
    ),
}));

describe('MapControls Component - Task 18.9', () => {
    const mockJobs: Partial<Job>[] = [
        {
            id: '1',
            title: 'Software Engineer',
            company: 'Tech Corp',
            location: 'San Francisco',
            latitude: 37.7749,
            longitude: -122.4194,
            postedAt: new Date(),
            source: 'indeed',
            sourceUrl: 'https://example.com/1',
            createdAt: new Date(),
            compositeScore: 0.8
        },
        {
            id: '2',
            title: 'Product Manager',
            company: 'StartUp Inc',
            location: 'Austin',
            latitude: 30.2672,
            longitude: -97.7431,
            postedAt: new Date(),
            source: 'linkedin',
            sourceUrl: 'https://example.com/2',
            createdAt: new Date(),
            compositeScore: 0.5
        },
        {
            id: '3',
            title: 'Data Scientist',
            company: 'AI Labs',
            location: 'New York',
            latitude: 40.7128,
            longitude: -74.0060,
            postedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
            source: 'glassdoor',
            sourceUrl: 'https://example.com/3',
            createdAt: new Date(),
            compositeScore: 0.3
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the heatmap toggle button', () => {
        render(<MapControls jobs={mockJobs as Job[]} />);
        expect(screen.getByTestId('heatmap-toggle')).toBeInTheDocument();
    });

    it('should render the filter toggle button', () => {
        render(<MapControls jobs={mockJobs as Job[]} />);
        expect(screen.getByTestId('filter-toggle')).toBeInTheDocument();
    });

    it('should toggle heatmap mode when button is clicked', () => {
        render(<MapControls jobs={mockJobs as Job[]} />);
        const toggleBtn = screen.getByTestId('heatmap-toggle');

        // Initially markers mode
        expect(screen.getByText('Markers')).toBeInTheDocument();

        // Click to toggle to heatmap
        fireEvent.click(toggleBtn);
        expect(screen.getByText('Heatmap')).toBeInTheDocument();

        // Check map received heatmap prop
        const map = screen.getByTestId('job-map');
        expect(map.getAttribute('data-heatmap')).toBe('true');
    });

    it('should show filter panel when filter button is clicked', () => {
        render(<MapControls jobs={mockJobs as Job[]} />);

        // Filter panel should not be visible initially
        expect(screen.queryByTestId('filter-panel')).not.toBeInTheDocument();

        // Click filter toggle
        fireEvent.click(screen.getByTestId('filter-toggle'));

        // Filter panel should now be visible
        expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
    });

    it('should display job count correctly', () => {
        render(<MapControls jobs={mockJobs as Job[]} />);
        expect(screen.getByText(/3 of 3 jobs shown/)).toBeInTheDocument();
    });

    it('should filter jobs by search query', () => {
        render(<MapControls jobs={mockJobs as Job[]} />);

        // Open filters
        fireEvent.click(screen.getByTestId('filter-toggle'));

        // Type in search
        const searchInput = screen.getByTestId('search-input');
        fireEvent.change(searchInput, { target: { value: 'Software' } });

        // Should show 1 of 3 jobs
        expect(screen.getByText(/1 of 3 jobs shown/)).toBeInTheDocument();
    });

    it('should filter jobs by minimum score', () => {
        render(<MapControls jobs={mockJobs as Job[]} />);

        // Open filters
        fireEvent.click(screen.getByTestId('filter-toggle'));

        // Set minimum score to 70%
        const scoreSlider = screen.getByTestId('score-slider');
        fireEvent.change(scoreSlider, { target: { value: '70' } });

        // Should only show jobs with score >= 0.7 (1 job)
        expect(screen.getByText(/1 of 3 jobs shown/)).toBeInTheDocument();
    });

    it('should filter jobs by date range', () => {
        render(<MapControls jobs={mockJobs as Job[]} />);

        // Open filters
        fireEvent.click(screen.getByTestId('filter-toggle'));

        // Select last month
        const dateSelect = screen.getByTestId('date-select');
        fireEvent.change(dateSelect, { target: { value: 'month' } });

        // Should filter out jobs older than 30 days (2 jobs remain)
        expect(screen.getByText(/2 of 3 jobs shown/)).toBeInTheDocument();
    });

    it('should pass filtered jobs to JobMap', () => {
        render(<MapControls jobs={mockJobs as Job[]} />);

        // Open filters
        fireEvent.click(screen.getByTestId('filter-toggle'));

        // Search for "Software"
        const searchInput = screen.getByTestId('search-input');
        fireEvent.change(searchInput, { target: { value: 'Software' } });

        // JobMap should receive only 1 job
        const map = screen.getByTestId('job-map');
        expect(map.getAttribute('data-job-count')).toBe('1');
    });
});
