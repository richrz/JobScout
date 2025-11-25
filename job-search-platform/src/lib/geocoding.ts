import { Redis } from 'ioredis';
import { Client } from "@googlemaps/google-maps-services-js";

// Initialize Redis client lazily or allow injection
let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
    if (!redisClient) {
        redisClient ??= new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    }
    return redisClient;
}

// For testing purposes
export function setRedisClient(client: any) {
    redisClient = client;
}

const CACHE_TTL = 60 * 60 * 24 * 30; // 30 days
const googleMapsClient = new Client({});

export async function geocodeLocation(location: string): Promise<{ lat: number; lng: number } | null> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
        throw new Error('Google Maps API key missing');
    }

    const cacheKey = `geo:${location}`;
    const redis = getRedisClient();

    try {
        // Check cache
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        // Call Google Maps Geocoding API
        const response = await googleMapsClient.geocode({
            params: {
                address: location,
                key: apiKey
            }
        });

        if (response.data.results.length > 0) {
            const { lat, lng } = response.data.results[0].geometry.location;
            const result = { lat, lng };

            // Cache result
            await redis.set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL);

            return result;
        }

        return null;
    } catch (error: any) {
        // Re-throw known errors
        if (error.message === 'Google Maps API key missing') {
            throw error;
        }
        // Log other errors and re-throw or handle gracefully
        console.error('Geocoding error:', error.response ? error.response.data : error.message);
        throw error;
    }
}
