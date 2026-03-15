import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { cache, CacheKeys } from "@/lib/cache";
import { searchJobs, isCtsEnabled, type CtsSearchOptions } from "@/lib/cts/talent-service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const query = searchParams.get("q");

    // CTS search params
    const location = searchParams.get("location");
    const distanceMiles = searchParams.get("distance") ? parseInt(searchParams.get("distance")!) : undefined;
    const commuteMethod = searchParams.get("commuteMethod") as CtsSearchOptions["commuteMethod"] | null;
    const commuteTimeMins = searchParams.get("commuteTime") ? parseInt(searchParams.get("commuteTime")!) : undefined;
    const commuteStartLat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : undefined;
    const commuteStartLng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : undefined;
    const employmentTypes = searchParams.get("employmentTypes")?.split(",").filter(Boolean);

    // Use CTS when available and there's a search query or location filter
    if (isCtsEnabled() && (query || location || commuteMethod)) {
      return await ctsSearch({
        query: query || undefined,
        location: location || undefined,
        distanceMiles,
        commuteMethod: commuteMethod || undefined,
        commuteTimeMins,
        commuteStartLat,
        commuteStartLng,
        employmentTypes,
        pageSize: limit,
        pageToken: searchParams.get("pageToken") || undefined,
      });
    }

    // Fallback: Postgres search (for browsing without query, or CTS not configured)
    return await postgresSearch(page, limit, query);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 },
    );
  }
}

/**
 * CTS-powered semantic search with commute/location/compensation filters.
 */
async function ctsSearch(opts: CtsSearchOptions) {
  const result = await searchJobs(opts);

  // Fetch full Postgres records for the matched jobs (for workspace status, etc.)
  const postgresIds = result.jobs
    .map(j => j.postgresJobId)
    .filter(Boolean);

  const pgJobs = postgresIds.length > 0
    ? await prisma.job.findMany({
        where: { id: { in: postgresIds } },
      })
    : [];

  const pgMap = new Map(pgJobs.map(j => [j.id, j]));

  // Merge CTS search results with Postgres data (CTS result order preserved)
  const jobs = result.jobs.map(ctsJob => {
    const pg = pgMap.get(ctsJob.postgresJobId);
    if (pg) {
      return {
        ...pg,
        _cts: {
          matchScore: ctsJob.matchScore,
          commuteMinutes: ctsJob.commuteMinutes,
        },
      };
    }
    // Job exists in CTS but not Postgres (shouldn't happen, but handle gracefully)
    return {
      id: ctsJob.postgresJobId,
      title: ctsJob.title,
      company: ctsJob.company,
      location: ctsJob.location,
      description: ctsJob.description,
      salary: ctsJob.salary,
      source: 'cts',
      sourceUrl: '',
      postedAt: new Date(),
      createdAt: new Date(),
      _cts: {
        matchScore: ctsJob.matchScore,
        commuteMinutes: ctsJob.commuteMinutes,
      },
    };
  });

  return NextResponse.json({
    jobs,
    pagination: {
      page: 1,
      limit: opts.pageSize || 50,
      total: result.totalSize,
      totalPages: Math.ceil(result.totalSize / (opts.pageSize || 50)),
      nextPageToken: result.nextPageToken,
    },
    searchMeta: {
      engine: 'cts',
      spellCorrection: result.spellCorrection,
    },
  });
}

/**
 * Postgres fallback search (ILIKE, for browsing or when CTS is not configured).
 */
async function postgresSearch(page: number, limit: number, query: string | null) {
  const offset = (page - 1) * limit;
  const where: Prisma.JobWhereInput = {};

  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { company: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }

  const cacheKey = CacheKeys.jobList(page, query || undefined);
  const cachedResult = await cache.getOrSet(
    cacheKey,
    async () => {
      const [jobs, total] = await Promise.all([
        prisma.job.findMany({
          where,
          orderBy: { postedAt: "desc" },
          skip: offset,
          take: limit,
        }),
        prisma.job.count({ where }),
      ]);

      return {
        jobs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        searchMeta: { engine: 'postgres' },
      };
    },
    300,
  );

  return NextResponse.json(cachedResult);
}
