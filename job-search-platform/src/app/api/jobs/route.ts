import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { cache, CacheKeys } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    const where: Prisma.JobWhereInput = {};

    // Optional Filters
    const query = searchParams.get("q");
    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { company: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    // Use cache for job listings (5 minute TTL)
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
        };
      },
      300, // 5 minutes cache
    );

    return NextResponse.json(cachedResult);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 },
    );
  }
}
