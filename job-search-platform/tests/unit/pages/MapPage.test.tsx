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
