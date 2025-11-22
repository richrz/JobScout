import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { geocodeLocation, setRedisClient } from '../../../src/lib/geocoding';

// Mock fetch
global.fetch = jest.fn() as unknown as typeof fetch;

describe('Geocoding Service - TDD RED PHASE', () => {
    let mockRedisGet: jest.Mock;
    let mockRedisSet: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'test-token';

        mockRedisGet = jest.fn();
        mockRedisSet = jest.fn();

        // Inject mock Redis client
        setRedisClient({
            get: mockRedisGet,
            set: mockRedisSet,
        });
    });

    afterEach(() => {
        delete process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    });

    it('should return coordinates for a valid location', async () => {
        // Mock Mapbox API response
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                features: [
                    {
                        center: [-74.006, 40.7128], // lng, lat
                    },
                ],
            }),
        });

        const result = await geocodeLocation('New York, NY');

        expect(result).toEqual({ lat: 40.7128, lng: -74.006 });
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('mapbox.places/New%20York%2C%20NY.json')
        );
    });

    it('should return null if no results found', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                features: [],
            }),
        });

        const result = await geocodeLocation('Nonexistent Place');

        expect(result).toBeNull();
    });

    it('should return cached results if available', async () => {
        // Mock Redis hit
        const cachedCoords = { lat: 34.0522, lng: -118.2437 };
        mockRedisGet.mockResolvedValueOnce(JSON.stringify(cachedCoords));

        const result = await geocodeLocation('Los Angeles, CA');

        expect(result).toEqual(cachedCoords);
        expect(mockRedisGet).toHaveBeenCalledWith('geo:Los Angeles, CA');
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should cache new results in Redis', async () => {
        // Mock Redis miss then API hit
        mockRedisGet.mockResolvedValueOnce(null);
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                features: [
                    {
                        center: [-0.1276, 51.5074],
                    },
                ],
            }),
        });

        await geocodeLocation('London, UK');

        expect(mockRedisSet).toHaveBeenCalledWith(
            'geo:London, UK',
            JSON.stringify({ lat: 51.5074, lng: -0.1276 }),
            'EX',
            expect.any(Number) // TTL
        );
    });

    it('should handle API errors gracefully', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
        });

        await expect(geocodeLocation('Error City')).rejects.toThrow('Mapbox API error');
    });

    it('should throw error if Mapbox token is missing', async () => {
        delete process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        await expect(geocodeLocation('Anywhere')).rejects.toThrow('Mapbox token missing');
    });
});
