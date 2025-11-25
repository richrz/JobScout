import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { geocodeLocation, setRedisClient } from '../../../src/lib/geocoding';

// Mock Google Maps Client - use a factory function
const mockGeocodeImpl = jest.fn();

jest.mock('@googlemaps/google-maps-services-js', () => {
    return {
        Client: jest.fn().mockImplementation(() => ({
            geocode: (...args: any[]) => mockGeocodeImpl(...args)
        }))
    };
});

describe('Geocoding Service - Google Maps', () => {
    let mockRedisGet: jest.Mock;
    let mockRedisSet: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockGeocodeImpl.mockClear();
        process.env.GOOGLE_MAPS_API_KEY = 'test-api-key';

        mockRedisGet = jest.fn();
        mockRedisSet = jest.fn();

        // Inject mock Redis client
        setRedisClient({
            get: mockRedisGet,
            set: mockRedisSet,
        });
    });

    afterEach(() => {
        delete process.env.GOOGLE_MAPS_API_KEY;
    });

    it('should return coordinates for a valid location', async () => {
        // Mock Google Maps API response
        mockGeocodeImpl.mockResolvedValueOnce({
            data: {
                results: [
                    {
                        geometry: {
                            location: { lat: 40.7128, lng: -74.006 }
                        }
                    }
                ]
            }
        });

        const result = await geocodeLocation('New York, NY');

        expect(result).toEqual({ lat: 40.7128, lng: -74.006 });
        expect(mockGeocodeImpl).toHaveBeenCalledWith({
            params: {
                address: 'New York, NY',
                key: 'test-api-key'
            }
        });
    });

    it('should return null if no results found', async () => {
        mockGeocodeImpl.mockResolvedValueOnce({
            data: {
                results: []
            }
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
        expect(mockGeocodeImpl).not.toHaveBeenCalled();
    });

    it('should cache new results in Redis', async () => {
        // Mock Redis miss then API hit
        mockRedisGet.mockResolvedValueOnce(null);
        mockGeocodeImpl.mockResolvedValueOnce({
            data: {
                results: [
                    {
                        geometry: {
                            location: { lat: 51.5074, lng: -0.1276 }
                        }
                    }
                ]
            }
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
        const apiError = new Error('API Error');
        (apiError as any).response = { data: 'Internal Server Error' };
        mockGeocodeImpl.mockRejectedValueOnce(apiError);

        await expect(geocodeLocation('Error City')).rejects.toThrow('API Error');
    });

    it('should throw error if API key is missing', async () => {
        delete process.env.GOOGLE_MAPS_API_KEY;
        await expect(geocodeLocation('Anywhere')).rejects.toThrow('Google Maps API key missing');
    });
});
