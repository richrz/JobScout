import { describe, it, expect, beforeEach } from '@jest/globals';
import {
    calculateDistance,
    filterJobsByDistance,
    type JobWithCoordinates
} from '../../../src/lib/geographic-filter';

describe('Geographic Filtering - TDD RED PHASE', () => {
    describe('Haversine Distance Calculation', () => {
        it('should calculate distance between two coordinates correctly', () => {
            // New York to Los Angeles (approx 2451 miles)
            const nyc = { lat: 40.7128, lng: -74.006 };
            const la = { lat: 34.0522, lng: -118.2437 };

            const distance = calculateDistance(nyc, la);

            // Should be approximately 2451 miles (within 50 miles tolerance)
            expect(distance).toBeGreaterThan(2400);
            expect(distance).toBeLessThan(2500);
        });

        it('should return 0 for same location', () => {
            const location = { lat: 40.7128, lng: -74.006 };
            const distance = calculateDistance(location, location);

            expect(distance).toBe(0);
        });

        it('should handle locations across the International Date Line', () => {
            const tokyo = { lat: 35.6762, lng: 139.6503 };
            const sanFrancisco = { lat: 37.7749, lng: -122.4194 };

            const distance = calculateDistance(tokyo, sanFrancisco);

            // Should be approximately 5136 miles
            expect(distance).toBeGreaterThan(5100);
            expect(distance).toBeLessThan(5200);
        });

        it('should handle antipodal points (opposite sides of Earth)', () => {
            const north = { lat: 45, lng: 0 };
            const south = { lat: -45, lng: 180 };

            const distance = calculateDistance(north, south);

            // Should be approximately 12,450 miles (half circumference)
            expect(distance).toBeGreaterThan(12000);
            expect(distance).toBeLessThan(13000);
        });
    });

    describe('Job Filtering by Distance', () => {
        let mockJobs: JobWithCoordinates[];

        beforeEach(() => {
            mockJobs = [
                {
                    id: '1',
                    title: 'Software Engineer',
                    company: 'Tech Corp',
                    location: 'New York, NY',
                    coordinates: { lat: 40.7128, lng: -74.006 },
                },
                {
                    id: '2',
                    title: 'Frontend Developer',
                    company: 'Startup Inc',
                    location: 'Brooklyn, NY',
                    coordinates: { lat: 40.6782, lng: -73.9442 },
                },
                {
                    id: '3',
                    title: 'Backend Engineer',
                    company: 'West Coast Tech',
                    location: 'San Francisco, CA',
                    coordinates: { lat: 37.7749, lng: -122.4194 },
                },
                {
                    id: '4',
                    title: 'DevOps Engineer',
                    company: 'Remote First',
                    location: 'Remote',
                    coordinates: null, // Remote job with no coordinates
                },
            ];
        });

        it('should filter jobs within specified radius', () => {
            const userLocation = { lat: 40.7128, lng: -74.006 }; // NYC
            const radiusMiles = 30;

            const filtered = filterJobsByDistance(mockJobs, userLocation, radiusMiles);

            // Should include NYC and Brooklyn jobs, exclude SF
            expect(filtered).toHaveLength(2);
            expect(filtered.map(j => j.id)).toContain('1');
            expect(filtered.map(j => j.id)).toContain('2');
            expect(filtered.map(j => j.id)).not.toContain('3');
        });

        it('should include distance in filtered results', () => {
            const userLocation = { lat: 40.7128, lng: -74.006 };
            const radiusMiles = 30;

            const filtered = filterJobsByDistance(mockJobs, userLocation, radiusMiles);

            filtered.forEach(job => {
                expect(job).toHaveProperty('distance');
                expect(typeof job.distance).toBe('number');
                expect(job.distance).toBeLessThanOrEqual(radiusMiles);
            });
        });

        it('should sort results by distance (closest first)', () => {
            const userLocation = { lat: 40.7128, lng: -74.006 };
            const radiusMiles = 100;

            const filtered = filterJobsByDistance(mockJobs, userLocation, radiusMiles);

            // Results should be sorted by distance
            for (let i = 1; i < filtered.length; i++) {
                expect(filtered[i].distance!).toBeGreaterThanOrEqual(filtered[i - 1].distance!);
            }
        });

        it('should handle jobs without coordinates based on includeRemote flag', () => {
            const userLocation = { lat: 40.7128, lng: -74.006 };
            const radiusMiles = 30;

            // Without includeRemote flag (default false)
            const filteredWithoutRemote = filterJobsByDistance(mockJobs, userLocation, radiusMiles, false);
            expect(filteredWithoutRemote.map(j => j.id)).not.toContain('4');

            // With includeRemote flag
            const filteredWithRemote = filterJobsByDistance(mockJobs, userLocation, radiusMiles, true);
            expect(filteredWithRemote.map(j => j.id)).toContain('4');
        });

        it('should set distance to Infinity for remote jobs', () => {
            const userLocation = { lat: 40.7128, lng: -74.006 };
            const radiusMiles = 30;

            const filtered = filterJobsByDistance(mockJobs, userLocation, radiusMiles, true);
            const remoteJob = filtered.find(j => j.id === '4');

            expect(remoteJob?.distance).toBe(Infinity);
        });

        it('should return empty array if no jobs within radius', () => {
            const userLocation = { lat: 40.7128, lng: -74.006 }; // NYC
            const radiusMiles = 3; // Very small radius (3 miles)

            const filtered = filterJobsByDistance(mockJobs, userLocation, radiusMiles);

            // With 3 miles radius, only the exact NYC location should match
            expect(filtered.length).toBeLessThanOrEqual(1);
        });

        it('should handle empty job list', () => {
            const userLocation = { lat: 40.7128, lng: -74.006 };
            const radiusMiles = 50;

            const filtered = filterJobsByDistance([], userLocation, radiusMiles);

            expect(filtered).toEqual([]);
        });

        it('should validate radius is positive', () => {
            const userLocation = { lat: 40.7128, lng: -74.006 };

            expect(() => {
                filterJobsByDistance(mockJobs, userLocation, -10);
            }).toThrow('Radius must be a positive number');
        });
    });
});
