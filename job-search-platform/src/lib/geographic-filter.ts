export interface Coordinates {
    lat: number;
    lng: number;
}

export interface JobWithCoordinates {
    id: string;
    title: string;
    company: string;
    location: string;
    coordinates: Coordinates | null;
    distance?: number;
}

/**
 * Calculate the great-circle distance between two points using the Haversine formula
 * @param point1 First coordinate
 * @param point2 Second coordinate
 * @returns Distance in kilometers
 */
export function calculateDistance(point1: Coordinates, point2: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers

    const lat1Rad = toRadians(point1.lat);
    const lat2Rad = toRadians(point2.lat);
    const deltaLat = toRadians(point2.lat - point1.lat);
    const deltaLng = toRadians(point2.lng - point1.lng);

    const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) *
        Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;

    return distance;
}

/**
 * Filter jobs by distance from user location
 * @param jobs List of jobs with coordinates
 * @param userLocation User's current location
 * @param radiusKm Search radius in kilometers
 * @param includeRemote Whether to include remote jobs (jobs without coordinates)
 * @returns Filtered jobs sorted by distance (closest first)
 */
export function filterJobsByDistance(
    jobs: JobWithCoordinates[],
    userLocation: Coordinates,
    radiusKm: number,
    includeRemote: boolean = false
): JobWithCoordinates[] {
    // Validate radius
    if (radiusKm <= 0) {
        throw new Error('Radius must be a positive number');
    }

    const jobsWithDistance = jobs.map(job => {
        // Handle jobs without coordinates (remote jobs)
        if (!job.coordinates) {
            return {
                ...job,
                distance: Infinity
            };
        }

        const distance = calculateDistance(userLocation, job.coordinates);
        return {
            ...job,
            distance
        };
    });

    // Filter by radius
    const filtered = jobsWithDistance.filter(job => {
        // If no coordinates and includeRemote is true, include it
        if (job.distance === Infinity) {
            return includeRemote;
        }
        // Otherwise check if within radius
        return job.distance! <= radiusKm;
    });

    // Sort by distance (closest first)
    filtered.sort((a, b) => {
        const distA = a.distance ?? Infinity;
        const distB = b.distance ?? Infinity;
        return distA - distB;
    });

    return filtered;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}
