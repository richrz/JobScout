/**
 * Cloud Talent Solution Service
 *
 * Wraps Google CTS client for job ingestion, company management, and semantic search.
 * Jobs are dual-written: Postgres (user state) + CTS (search/discovery).
 */

import {
  JobServiceClient,
  CompanyServiceClient,
  protos,
} from '@google-cloud/talent';

type IJob = protos.google.cloud.talent.v4.IJob;
type ICompany = protos.google.cloud.talent.v4.ICompany;
type ISearchJobsRequest = protos.google.cloud.talent.v4.ISearchJobsRequest;
type ISearchJobsResponse = protos.google.cloud.talent.v4.ISearchJobsResponse;

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || '';
const TENANT_ID = process.env.CTS_TENANT_ID || 'default';

function tenantPath() {
  return `projects/${PROJECT_ID}/tenants/${TENANT_ID}`;
}

function isCtsEnabled(): boolean {
  return !!(PROJECT_ID && process.env.GOOGLE_APPLICATION_CREDENTIALS);
}

// ---------------------------------------------------------------------------
// Singleton clients (lazy-initialized)
// ---------------------------------------------------------------------------

let _jobClient: JobServiceClient | null = null;
let _companyClient: CompanyServiceClient | null = null;

function jobClient(): JobServiceClient {
  if (!_jobClient) {
    _jobClient = new JobServiceClient({ fallback: 'rest' });
  }
  return _jobClient;
}

function companyClient(): CompanyServiceClient {
  if (!_companyClient) {
    _companyClient = new CompanyServiceClient({ fallback: 'rest' });
  }
  return _companyClient;
}

// ---------------------------------------------------------------------------
// Company cache: company display name → CTS resource name
// ---------------------------------------------------------------------------

const companyCache = new Map<string, string>();

/**
 * Ensure a company exists in CTS. Returns the CTS resource name.
 * Uses an in-memory cache to avoid duplicate creates.
 */
export async function ensureCompany(displayName: string): Promise<string> {
  if (!isCtsEnabled()) throw new Error('CTS not configured');

  const cached = companyCache.get(displayName);
  if (cached) return cached;

  // Generate a stable external ID from the display name
  const externalId = slugify(displayName);

  try {
    const [company] = await companyClient().createCompany({
      parent: tenantPath(),
      company: {
        displayName,
        externalId,
      },
    });

    const name = company.name!;
    companyCache.set(displayName, name);
    return name;
  } catch (err: any) {
    // 6 = ALREADY_EXISTS — look up existing company
    if (err?.code === 6) {
      const name = await findCompanyByExternalId(externalId);
      if (name) {
        companyCache.set(displayName, name);
        return name;
      }
    }
    throw err;
  }
}

async function findCompanyByExternalId(externalId: string): Promise<string | null> {
  try {
    const iterable = companyClient().listCompaniesAsync({ parent: tenantPath() });
    for await (const company of iterable) {
      if (company.externalId === externalId) {
        return company.name!;
      }
    }
  } catch (err) {
    console.error('CTS: Failed to list companies:', err);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Job CRUD
// ---------------------------------------------------------------------------

export interface CtsJobInput {
  postgresId: string;       // Our Prisma Job.id — used as requisitionId
  title: string;
  company: string;          // Display name — we resolve to CTS company resource
  description: string;
  location: string;
  salary?: string | null;
  sourceUrl: string;
  postedAt: Date;
  source: string;
}

/**
 * Create or update a job in CTS. Returns the CTS resource name.
 */
export async function upsertJob(input: CtsJobInput): Promise<string> {
  if (!isCtsEnabled()) throw new Error('CTS not configured');

  const companyName = await ensureCompany(input.company);

  const job: IJob = {
    company: companyName,
    requisitionId: input.postgresId,
    title: input.title,
    description: input.description,
    addresses: input.location ? [input.location] : [],
    applicationInfo: {
      uris: input.sourceUrl ? [input.sourceUrl] : [],
    },
    postingPublishTime: {
      seconds: Math.floor(input.postedAt.getTime() / 1000),
    },
    customAttributes: {
      source: { stringValues: [input.source], filterable: true },
      sourceUrl: { stringValues: [input.sourceUrl], filterable: false },
    },
  };

  // Parse salary into compensation info if possible
  const comp = parseSalary(input.salary);
  if (comp) {
    job.compensationInfo = { entries: [comp] };
  }

  try {
    const [created] = await jobClient().createJob({
      parent: tenantPath(),
      job,
    });
    return created.name!;
  } catch (err: any) {
    // 6 = ALREADY_EXISTS — update instead
    if (err?.code === 6) {
      // Find existing job by listing (requisitionId + company is unique)
      const existingName = await findJobByRequisitionId(input.postgresId, companyName);
      if (existingName) {
        job.name = existingName;
        const [updated] = await jobClient().updateJob({
          job,
        });
        return updated.name!;
      }
    }
    throw err;
  }
}

async function findJobByRequisitionId(
  requisitionId: string,
  companyName: string,
): Promise<string | null> {
  try {
    const iterable = jobClient().listJobsAsync({
      parent: tenantPath(),
      filter: `companyName="${companyName}" AND requisitionId="${requisitionId}"`,
    });
    for await (const job of iterable) {
      return job.name!;
    }
  } catch (err) {
    console.error('CTS: Failed to find job:', err);
  }
  return null;
}

/**
 * Delete a job from CTS by resource name.
 */
export async function deleteJob(ctsJobName: string): Promise<void> {
  if (!isCtsEnabled()) return;
  try {
    await jobClient().deleteJob({ name: ctsJobName });
  } catch (err: any) {
    if (err?.code !== 5) throw err; // 5 = NOT_FOUND — already deleted
  }
}

/**
 * Batch create jobs in CTS (max 200 per call).
 */
export async function batchCreateJobs(inputs: CtsJobInput[]): Promise<Map<string, string>> {
  if (!isCtsEnabled()) throw new Error('CTS not configured');

  // Build company map first
  const companyNames = new Map<string, string>();
  const uniqueCompanies = [...new Set(inputs.map(i => i.company))];
  await Promise.all(
    uniqueCompanies.map(async (name) => {
      const ctsName = await ensureCompany(name);
      companyNames.set(name, ctsName);
    }),
  );

  const jobs: IJob[] = inputs.map((input) => {
    const job: IJob = {
      company: companyNames.get(input.company)!,
      requisitionId: input.postgresId,
      title: input.title,
      description: input.description,
      addresses: input.location ? [input.location] : [],
      applicationInfo: {
        uris: input.sourceUrl ? [input.sourceUrl] : [],
      },
      postingPublishTime: {
        seconds: Math.floor(input.postedAt.getTime() / 1000),
      },
      customAttributes: {
        source: { stringValues: [input.source], filterable: true },
        sourceUrl: { stringValues: [input.sourceUrl], filterable: false },
      },
    };
    const comp = parseSalary(input.salary);
    if (comp) job.compensationInfo = { entries: [comp] };
    return job;
  });

  // Batch in chunks of 200 (API limit)
  const results = new Map<string, string>(); // postgresId → ctsJobName
  for (let i = 0; i < jobs.length; i += 200) {
    const chunk = jobs.slice(i, i + 200);
    try {
      const [operation] = await jobClient().batchCreateJobs({
        parent: tenantPath(),
        jobs: chunk,
      });
      const [response] = await operation.promise();
      if (response?.jobResults) {
        for (const result of response.jobResults) {
          if (result.job?.name && result.job?.requisitionId) {
            results.set(result.job.requisitionId, result.job.name);
          }
        }
      }
    } catch (err) {
      console.error(`CTS: Batch create failed for chunk ${i}-${i + chunk.length}:`, err);
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface CtsSearchOptions {
  query?: string;
  location?: string;
  distanceMiles?: number;
  // Commute-based search
  commuteMethod?: 'DRIVING' | 'TRANSIT' | 'WALKING' | 'CYCLING';
  commuteTimeMins?: number;
  commuteStartLat?: number;
  commuteStartLng?: number;
  // Filters
  employmentTypes?: string[];
  companyDisplayNames?: string[];
  // Pagination
  pageSize?: number;
  pageToken?: string;
  // Sorting
  orderBy?: string;
}

export interface CtsSearchResult {
  postgresJobId: string;   // requisitionId = our Prisma Job.id
  ctsJobName: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  matchScore?: number;
  commuteMinutes?: number;
}

export interface CtsSearchResponse {
  jobs: CtsSearchResult[];
  totalSize: number;
  nextPageToken?: string;
  spellCorrection?: string;
}

/**
 * Search jobs using CTS semantic search.
 */
export async function searchJobs(opts: CtsSearchOptions): Promise<CtsSearchResponse> {
  if (!isCtsEnabled()) throw new Error('CTS not configured');

  const jobQuery: any = {};

  if (opts.query) {
    jobQuery.query = opts.query;
  }

  // Location filter (distance-based)
  if (opts.location && !opts.commuteMethod) {
    jobQuery.locationFilters = [{
      address: opts.location,
      distanceInMiles: opts.distanceMiles || 30,
    }];
  }

  // Commute filter (time-based)
  if (opts.commuteMethod && opts.commuteStartLat != null && opts.commuteStartLng != null) {
    jobQuery.commuteFilter = {
      commuteMethod: opts.commuteMethod,
      travelDuration: { seconds: (opts.commuteTimeMins || 30) * 60 },
      startCoordinates: {
        latitude: opts.commuteStartLat,
        longitude: opts.commuteStartLng,
      },
      roadTraffic: 'BUSY_HOUR',
    };
  }

  if (opts.employmentTypes?.length) {
    jobQuery.employmentTypes = opts.employmentTypes;
  }

  if (opts.companyDisplayNames?.length) {
    jobQuery.companyDisplayNames = opts.companyDisplayNames;
  }

  const request: ISearchJobsRequest = {
    parent: tenantPath(),
    requestMetadata: {
      userId: 'jobscout-user',
      sessionId: `session-${Date.now()}`,
      domain: 'jobscout.local',
    },
    jobQuery,
    searchMode: 'JOB_SEARCH',
    jobView: 'JOB_VIEW_FULL',
    maxPageSize: opts.pageSize || 50,
    enableBroadening: true,
    orderBy: opts.orderBy || 'relevance desc',
  };

  if (opts.pageToken) {
    request.pageToken = opts.pageToken;
  }

  const [response] = await jobClient().searchJobs(request);

  const jobs: CtsSearchResult[] = (response.matchingJobs || []).map((match) => {
    const job = match.job!;
    return {
      postgresJobId: job.requisitionId || '',
      ctsJobName: job.name || '',
      title: job.title || '',
      company: job.companyDisplayName || '',
      location: job.addresses?.[0] || (job.derivedInfo?.locations?.[0]?.postalAddress?.addressLines?.[0]) || '',
      description: job.description || '',
      salary: formatCompensation(job.compensationInfo),
      matchScore: match.searchTextSnippet ? undefined : undefined,
      commuteMinutes: match.commuteInfo?.travelDuration
        ? Number(match.commuteInfo.travelDuration.seconds) / 60
        : undefined,
    };
  });

  return {
    jobs,
    totalSize: Number(response.totalSize || 0),
    nextPageToken: response.nextPageToken || undefined,
    spellCorrection: response.spellCorrection?.correctedText || undefined,
  };
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 255);
}

function parseSalary(
  salary: string | null | undefined,
): protos.google.cloud.talent.v4.CompensationInfo.ICompensationEntry | null {
  if (!salary) return null;

  // Try to extract numeric range: "$80,000 - $120,000" or "$80k-120k"
  const rangeMatch = salary.match(
    /\$?([\d,]+(?:\.\d+)?)\s*[kK]?\s*[-–—to]+\s*\$?([\d,]+(?:\.\d+)?)\s*[kK]?/,
  );

  if (rangeMatch) {
    let min = parseFloat(rangeMatch[1].replace(/,/g, ''));
    let max = parseFloat(rangeMatch[2].replace(/,/g, ''));

    // Handle "k" notation
    if (salary.toLowerCase().includes('k')) {
      if (min < 1000) min *= 1000;
      if (max < 1000) max *= 1000;
    }

    // Guess unit: if values < 200, probably hourly
    const unit = min < 200 ? 'HOURLY' : 'YEARLY';

    return {
      type: 'BASE',
      unit,
      range: {
        minCompensation: { currencyCode: 'USD', units: Math.round(min) },
        maxCompensation: { currencyCode: 'USD', units: Math.round(max) },
      },
    };
  }

  // Single value: "$120,000"
  const singleMatch = salary.match(/\$?([\d,]+(?:\.\d+)?)\s*[kK]?/);
  if (singleMatch) {
    let amount = parseFloat(singleMatch[1].replace(/,/g, ''));
    if (salary.toLowerCase().includes('k') && amount < 1000) amount *= 1000;
    const unit = amount < 200 ? 'HOURLY' : 'YEARLY';

    return {
      type: 'BASE',
      unit,
      amount: { currencyCode: 'USD', units: Math.round(amount) },
    };
  }

  return null;
}

function formatCompensation(
  info: protos.google.cloud.talent.v4.ICompensationInfo | null | undefined,
): string | undefined {
  if (!info) return undefined;

  const range = info.annualizedBaseCompensationRange || info.annualizedTotalCompensationRange;
  if (range?.minCompensation?.units && range?.maxCompensation?.units) {
    const min = Number(range.minCompensation.units);
    const max = Number(range.maxCompensation.units);
    return `$${min.toLocaleString()} - $${max.toLocaleString()}/year`;
  }

  const entry = info.entries?.[0];
  if (entry?.amount?.units) {
    return `$${Number(entry.amount.units).toLocaleString()}/${String(entry.unit || 'YEARLY').toLowerCase()}`;
  }
  if (entry?.range?.minCompensation?.units && entry?.range?.maxCompensation?.units) {
    const min = Number(entry.range.minCompensation.units);
    const max = Number(entry.range.maxCompensation.units);
    return `$${min.toLocaleString()} - $${max.toLocaleString()}/${String(entry.unit || 'YEARLY').toLowerCase()}`;
  }

  return undefined;
}

// ---------------------------------------------------------------------------
// Status / Health Check
// ---------------------------------------------------------------------------

export { isCtsEnabled };

export async function ctsHealthCheck(): Promise<{ ok: boolean; message: string }> {
  if (!isCtsEnabled()) {
    return { ok: false, message: 'CTS not configured (missing GOOGLE_CLOUD_PROJECT_ID or GOOGLE_APPLICATION_CREDENTIALS)' };
  }

  try {
    // Try listing companies — lightweight check
    const iterable = companyClient().listCompaniesAsync({
      parent: tenantPath(),
      pageSize: 1,
    });
    // Just check if the async iterator works (consume first result or none)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for await (const _ of iterable) {
      break;
    }
    return { ok: true, message: `CTS connected: ${tenantPath()}` };
  } catch (err: any) {
    return { ok: false, message: `CTS error: ${err.message || err}` };
  }
}
