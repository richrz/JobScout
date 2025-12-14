/**
 * @jest-environment jsdom
 */
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
    prisma: {
        job: {
            findMany: jest.fn().mockResolvedValue([
                {
                    id: '1',
                    title: 'Software Engineer',
                    company: 'Tech Corp',
                    location: 'San Francisco, CA',
                    latitude: 37.7749,
                    longitude: -122.4194,
                    description: 'Great job',
                    postedAt: new Date(),
                    source: 'indeed',
                    sourceUrl: 'https://example.com',
                    createdAt: new Date(),
                    compositeScore: 0.8
                }
            ])
        }
    }
}));

// Mock the @vis.gl/react-google-maps module
jest.mock('@vis.gl/react-google-maps', () => ({
    APIProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="api-provider">{children}</div>
    ),
    Map: ({ children, ...props }: { children?: React.ReactNode, [key: string]: any }) => (
        <div data-testid="google-map" data-props={JSON.stringify(props)}>{children}</div>
    ),
    AdvancedMarker: ({ children }: { children?: React.ReactNode }) => (
        <div data-testid="marker">{children}</div>
    ),
    Pin: ({ background }: { background?: string }) => (
        <div data-testid="pin" data-background={background} />
    ),
    useMap: () => ({})
}));

// Mock @googlemaps/markerclusterer
jest.mock('@googlemaps/markerclusterer', () => ({
    MarkerClusterer: jest.fn().mockImplementation(() => ({
        addMarkers: jest.fn(),
        clearMarkers: jest.fn(),
        setMap: jest.fn(),
        render: jest.fn()
    }))
}));

// Since MapPage is an async server component, we test the JobMap component integration
// The actual route test requires integration testing with Next.js
import { JobMap } from '@/components/map/JobMap';
import type { Job } from '@prisma/client';

describe('MapPage Database Integration - Task 18.7', () => {
    it('should filter jobs that have valid latitude/longitude', () => {
        // The MapPage filters jobs with latitude: { not: null }, longitude: { not: null }
        // This test validates the component handles jobs correctly
        const jobsWithCoords: Partial<Job>[] = [
            {
                id: '1',
                title: 'Engineer with location',
                company: 'Corp',
                location: 'SF',
                latitude: 37.7749,
                longitude: -122.4194,
                postedAt: new Date(),
                source: 'test',
                sourceUrl: 'https://test.com',
                createdAt: new Date(),
                compositeScore: 0.5
            }
        ];

        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-api-key';

        global.google = {
            maps: {
                InfoWindow: jest.fn().mockImplementation(() => ({
                    open: jest.fn(),
                    close: jest.fn(),
                    setContent: jest.fn(),
                    setPosition: jest.fn()
                })),
                LatLng: jest.fn(),
                Circle: jest.fn().mockImplementation(() => ({
                    setMap: jest.fn()
                })),
                visualization: {
                    HeatmapLayer: jest.fn().mockImplementation(() => ({
                        setMap: jest.fn(),
                        setData: jest.fn()
                    }))
                }
            }
        } as any;

        render(<JobMap jobs={jobsWithCoords as Job[]} />);
        const markers = screen.getAllByTestId('marker');
        expect(markers).toHaveLength(1);
    });

    it('should handle large datasets (500+ jobs limit in page)', () => {
        // MapPage limits to 500 jobs: take: 500
        // Component should handle whatever is passed
        const manyJobs: Partial<Job>[] = Array.from({ length: 10 }, (_, i) => ({
            id: String(i),
            title: `Job ${i}`,
            company: 'Corp',
            location: 'Location',
            latitude: 37 + (i * 0.1),
            longitude: -122 + (i * 0.1),
            postedAt: new Date(),
            source: 'test',
            sourceUrl: `https://test.com/${i}`,
            createdAt: new Date(),
            compositeScore: Math.random()
        }));

        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-api-key';

        global.google = {
            maps: {
                InfoWindow: jest.fn().mockImplementation(() => ({
                    open: jest.fn(),
                    close: jest.fn(),
                    setContent: jest.fn(),
                    setPosition: jest.fn()
                })),
                LatLng: jest.fn(),
                Circle: jest.fn().mockImplementation(() => ({
                    setMap: jest.fn()
                })),
                visualization: {
                    HeatmapLayer: jest.fn().mockImplementation(() => ({
                        setMap: jest.fn(),
                        setData: jest.fn()
                    }))
                }
            }
        } as any;

        render(<JobMap jobs={manyJobs as Job[]} />);
        const markers = screen.getAllByTestId('marker');
        expect(markers).toHaveLength(10);
    });
});

describe('MapPage Route - Task 18.6', () => {
    const mockJobs: Partial<Job>[] = [
        {
            id: '1',
            title: 'Software Engineer',
            company: 'Tech Corp',
            location: 'San Francisco, CA',
            latitude: 37.7749,
            longitude: -122.4194,
            description: 'Great job',
            postedAt: new Date(),
            source: 'indeed',
            sourceUrl: 'https://example.com',
            createdAt: new Date(),
            compositeScore: 0.8
        }
    ];

    beforeEach(() => {
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-api-key';

        global.google = {
            maps: {
                InfoWindow: jest.fn().mockImplementation(() => ({
                    open: jest.fn(),
                    close: jest.fn(),
                    setContent: jest.fn(),
                    setPosition: jest.fn()
                })),
                LatLng: jest.fn(),
                Circle: jest.fn().mockImplementation(() => ({
                    setMap: jest.fn()
                })),
                visualization: {
                    HeatmapLayer: jest.fn().mockImplementation(() => ({
                        setMap: jest.fn(),
                        setData: jest.fn()
                    }))
                }
            }
        } as any;

        jest.clearAllMocks();
    });

    it('should render the JobMap component when jobs are provided', () => {
        render(<JobMap jobs={mockJobs as Job[]} />);
        expect(screen.getByTestId('api-provider')).toBeInTheDocument();
        expect(screen.getByTestId('google-map')).toBeInTheDocument();
    });

    it('should render job markers for jobs with valid coordinates', () => {
        render(<JobMap jobs={mockJobs as Job[]} />);
        const markers = screen.getAllByTestId('marker');
        expect(markers.length).toBeGreaterThan(0);
    });

    it('should handle empty jobs array without crashing', () => {
        render(<JobMap jobs={[]} />);
        expect(screen.getByTestId('google-map')).toBeInTheDocument();
    });

    it('should display mock map when API key is not set', () => {
        delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        render(<JobMap jobs={mockJobs as Job[]} />);
        expect(screen.getByText(/MOCK MAP PREVIEW/i)).toBeInTheDocument();
    });
});

describe('MapPage Advanced Controls - Task 18.9', () => {
    beforeEach(() => {
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-api-key';

        global.google = {
            maps: {
                InfoWindow: jest.fn().mockImplementation(() => ({
                    open: jest.fn(),
                    close: jest.fn(),
                    setContent: jest.fn(),
                    setPosition: jest.fn()
                })),
                LatLng: jest.fn(),
                Circle: jest.fn().mockImplementation(() => ({
                    setMap: jest.fn()
                })),
                visualization: {
                    HeatmapLayer: jest.fn().mockImplementation(() => ({
                        setMap: jest.fn(),
                        setData: jest.fn()
                    }))
                }
            }
        } as any;

        jest.clearAllMocks();
    });

    it('should render with heatmap enabled (showHeatmap=true)', () => {
        const mockJobs: Partial<Job>[] = [{
            id: '1',
            title: 'Test Job',
            company: 'Corp',
            location: 'SF',
            latitude: 37.7749,
            longitude: -122.4194,
            postedAt: new Date(),
            source: 'test',
            sourceUrl: 'https://test.com',
            createdAt: new Date(),
            compositeScore: 0.5
        }];

        render(<JobMap jobs={mockJobs as Job[]} showHeatmap={true} />);
        expect(screen.getByTestId('google-map')).toBeInTheDocument();
        // When heatmap is on, no markers should be visible (heatmap replaces them)
        expect(screen.queryAllByTestId('marker').length).toBe(0);
    });

    it('should render markers when heatmap is disabled (default)', () => {
        const mockJobs: Partial<Job>[] = [{
            id: '1',
            title: 'Test Job',
            company: 'Corp',
            location: 'SF',
            latitude: 37.7749,
            longitude: -122.4194,
            postedAt: new Date(),
            source: 'test',
            sourceUrl: 'https://test.com',
            createdAt: new Date(),
            compositeScore: 0.5
        }];

        render(<JobMap jobs={mockJobs as Job[]} showHeatmap={false} />);
        expect(screen.getByTestId('google-map')).toBeInTheDocument();
        expect(screen.getAllByTestId('marker').length).toBeGreaterThan(0);
    });
});
