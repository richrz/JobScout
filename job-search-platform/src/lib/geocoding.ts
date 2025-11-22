import { Redis } from 'ioredis';

// Initialize Redis client lazily or allow injection
let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
    if (!redisClient) {
        redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    }
    return redisClient;
}

// For testing purposes
export function setRedisClient(client: any) {
    redisClient = client;
}


const CACHE_TTL = 60 * 60 * 24 * 30; // 30 days

export async function geocodeLocation(location: string): Promise<{ lat: number; lng: number } | null> {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
        throw new Error('Mapbox token missing');
    }

    const cacheKey = `geo:${location}`;
    const redis = getRedisClient();

    try {
        // Check cache
        const cached = await redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        // Rate limiting could be implemented here using Redis (e.g., sliding window)
        // For now, we'll rely on the API's rate limits and handle 429s if needed

        // Call Mapbox API
        const encodedLocation = encodeURIComponent(location);
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedLocation}.json?access_token=${token}&limit=1`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Mapbox API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.features && data.features.length > 0) {
            const [lng, lat] = data.features[0].center;
            const result = { lat, lng };

            // Cache result
            await redis.set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL);

            return result;
        }

        return null;
    } catch (error) {
        // Re-throw known errors
        if (error instanceof Error && (error.message === 'Mapbox token missing' || error.message.startsWith('Mapbox API error'))) {
            throw error;
        }
        // Log other errors and re-throw or handle gracefully
        console.error('Geocoding error:', error);
        throw error;
    }
}
