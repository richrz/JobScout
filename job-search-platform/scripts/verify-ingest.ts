
import { normalizeJobData } from '../src/lib/ingest/normalization';
import { geocodeLocation } from '../src/lib/geocoding';
import { JobListing } from '../src/lib/job-scrapers';

async function verify() {
    console.log("Verifying Ingestion Pipeline Components...");

    const mockJob: JobListing = {
        title: 'Senior AI Engineer',
        company: 'NeuralNet Corp',
        location: 'San Francisco, CA',
        description: 'Building the future of AGI.',
        source: 'indeed',
        sourceUrl: 'https://example.com/job/12345',
        scrapedAt: new Date()
    };

    console.log("\n1. Testing Geocoding (Mock Mode should be auto-detected if env var set)");
    const coords = await geocodeLocation(mockJob.location);
    console.log("Geocoding Result:", coords);

    console.log("\n2. Testing Normalization");
    const normalized = await normalizeJobData(mockJob);
    console.log("Normalized Data:", JSON.stringify(normalized, null, 2));

    if (normalized.latitude && normalized.longitude) {
        console.log("\n✅ Success: Job data normalized and geocoded.");
    } else {
        console.log("\n⚠️  Warning: Coordinates missing (might be expected if not in Mock Mode and no API key).");
    }
}

verify().catch(console.error);
