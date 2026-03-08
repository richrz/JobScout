import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { InboxGrid } from "@/components/jobs/InboxGrid";
import { JobsFilterSidebar } from "@/components/jobs/JobsFilterSidebar";
import { JobSortSelect } from "@/components/jobs/JobSortSelect";
import { JobSearchInput } from "@/components/jobs/JobSearchInput";
import { ChevronLeft, ChevronRight, Briefcase } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Suspense } from "react";

// Force dynamic rendering to prevent caching
export const dynamic = "force-dynamic";

// Server Component
interface JobsPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};

  const parsedPage =
    typeof resolvedSearchParams.page === "string"
      ? parseInt(resolvedSearchParams.page, 10)
      : 1;
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit = 12;
  const offset = (page - 1) * limit;

  // Read all search/filter params
  const query =
    typeof resolvedSearchParams.q === "string"
      ? resolvedSearchParams.q
      : undefined;
  const sort =
    typeof resolvedSearchParams.sort === "string"
      ? resolvedSearchParams.sort
      : "newest";

  // Map sort parameter to orderBy clause
  const getOrderBy = (sortParam: string) => {
    switch (sortParam) {
      case "newest":
        return { postedAt: "desc" as const };
      case "oldest":
        return { postedAt: "asc" as const };
      case "company":
        return { company: "asc" as const };
      case "title":
        return { title: "asc" as const };
      case "match-best":
        return { compositeScore: "desc" as const };
      case "match-worst":
        return { compositeScore: "asc" as const };
      default:
        return { postedAt: "desc" as const };
    }
  };

  const orderBy = getOrderBy(sort);

  // Build Prisma where clause
  const andConditions: Prisma.JobWhereInput[] = [];

  // Text search across title + company + description
  if (query) {
    andConditions.push({
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { company: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    });
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // Inbox should only show discovery items that are not already being managed.
  if (userId) {
    andConditions.push({
      NOT: {
        workspaces: {
          some: { userId },
        },
      },
    });
  }

  const where: Prisma.JobWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const [jobs, totalCount] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: orderBy,
      take: limit,
      skip: offset,
    }),
    prisma.job.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  // Build pagination URL helper
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (p > 1) params.set("page", String(p));
    if (query) params.set("q", query);
    if (sort !== "newest") params.set("sort", sort);
    const qs = params.toString();
    return `/jobs${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="px-6 lg:px-8 py-8">
        <div className="max-w-[1600px] mx-auto">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Link
              href="/"
              className="text-muted-foreground text-sm font-medium hover:text-primary transition-colors"
            >
              Home
            </Link>
            <span className="text-muted-foreground/50 text-sm">/</span>
            <span className="text-foreground text-sm font-medium">Jobs</span>
          </div>

          {/* Header, Search & Sort */}
          <div className="flex flex-col gap-6 mb-10 border-b border-border pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                  Job Inbox
                </h1>
                <p className="text-muted-foreground mt-2 text-base">
                  {totalCount === 0 ? "No jobs match your search." : (
                    <>
                      We found{" "}
                      <span className="text-primary font-bold">{totalCount}</span>{" "}
                      job{totalCount !== 1 ? "s" : ""} matching your {query ? "search" : "profile"}.
                    </>
                  )}
                </p>
              </div>
              <Suspense fallback={null}>
                <JobSortSelect />
              </Suspense>
            </div>
            <Suspense fallback={null}>
              <JobSearchInput key={query ?? ""} initialQuery={query ?? ""} />
            </Suspense>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <Suspense fallback={null}>
              <JobsFilterSidebar />
            </Suspense>

            {/* Job Cards Grid */}
            <div className="lg:col-span-3">
              {jobs.length === 0 ? (
                <div className="text-center py-20 bg-card rounded-3xl border-none shadow-xl">
                  <div className="inline-flex items-center justify-center p-4 rounded-full bg-secondary mb-4">
                    <Briefcase className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    No matching jobs found
                  </h3>
                  <p className="text-muted-foreground text-base max-w-md mx-auto mb-6">
                    Try a different keyword search or change the sort order to
                    explore more results.
                  </p>
                  <Link href="/jobs">
                    <Button
                      variant="outline"
                      className="text-primary border-primary/20 hover:bg-primary/10"
                    >
                      Reset Filters
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  {/* Job Cards Grid */}
                  <InboxGrid jobs={jobs} />

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex items-center justify-center">
                      <nav className="flex items-center gap-3">
                        {page > 1 && (
                          <Link
                            href={buildPageUrl(page - 1)}
                            className="size-12 flex items-center justify-center rounded-2xl bg-card text-muted-foreground hover:text-foreground hover:bg-secondary transition-all shadow-sm"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </Link>
                        )}

                        <span className="size-12 flex items-center justify-center rounded-2xl bg-primary text-black font-bold shadow-[0_0_15px_rgba(53,227,117,0.4)]">
                          {page}
                        </span>

                        {page < totalPages && (
                          <Link
                            href={buildPageUrl(page + 1)}
                            className="size-12 flex items-center justify-center rounded-2xl bg-card text-muted-foreground hover:text-foreground hover:bg-secondary transition-all shadow-sm"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </Link>
                        )}
                      </nav>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
