"use client";

import { Job } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreRadial } from "@/components/ui/score-radial";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Star, X } from "lucide-react";
import type { Route } from "next";
import { useState } from "react";
import { toggleJobInterest, dismissJob } from "@/app/actions/application";
import { cn } from "@/lib/utils";

interface JobCardProps {
  job: Job;
  initialStatus?: string | null;
}

export function JobCard({ job, initialStatus = null }: JobCardProps) {
  const score = Math.round((job.compositeScore || 0) * 100);
  const detailsHref = `/jobs/${job.id}` as Route;
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string | null>(initialStatus);
  const [isDismissed, setIsDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const isInterested = currentStatus === 'interested' || currentStatus === 'applied';

  const handleToggleInterest = async () => {
    setIsActionLoading(true);
    setError(null);
    try {
      const result = await toggleJobInterest(job.id);
      if (result.success) {
        setCurrentStatus(prev => prev ? null : 'interested');
      } else {
        if (result.error === 'Unauthorized') {
          router.push('/auth/signin');
          return;
        }
        setError(result.error || 'Operation failed');
      }
    } catch {
      setError('Operation failed');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDismiss = async () => {
    setIsActionLoading(true);
    setError(null);
    try {
      const result = await dismissJob(job.id);
      if (result.success) {
        setIsDismissed(true);
      } else {
        setError(result.error || 'Failed to dismiss');
      }
    } catch {
      setError('Failed to dismiss');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isDismissed) return null;

  return (
    <div className="flex flex-col h-full group p-6 rounded-2xl bg-card transition-all duration-300 hover:shadow-2xl hover:bg-card/90 relative overflow-hidden">
      {/* Hover Highlight */}
      <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Header - job title and company */}
      <div className="mb-4">
        <h3 className="text-xl font-bold leading-tight line-clamp-2" title={job.title}>
          <Link
            href={detailsHref}
            className="text-foreground transition-colors hover:text-primary focus:outline-none focus:text-primary"
          >
            {job.title}
          </Link>
        </h3>
        <p className="text-base text-muted-foreground mt-1 font-medium">{job.company}</p>
      </div>

      {/* Metadata with score */}
      <div className="flex gap-4 mb-5 flex-1">
        <div className="space-y-2 flex-1 text-sm text-muted-foreground/80">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
            <span className="truncate">{job.location || 'Remote'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
            <span>{job.salary || 'Competitive'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
            <span>{new Date(job.postedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Score indicator */}
        <div className="flex items-center">
          <ScoreRadial score={score} size={56} />
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge variant="secondary" className="text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80">
          {job.source}
        </Badge>
        {job.cityMatch && (
          <Badge variant="outline" className="text-xs font-medium border-primary/20 text-primary bg-primary/5">
            Matches Location
          </Badge>
        )}
      </div>

      <div className="flex gap-2 mt-auto pt-4 border-t border-border">
        <Button variant="ghost" size="sm" className="flex-1 hover:bg-secondary hover:text-foreground text-muted-foreground" asChild>
          <Link href={detailsHref}>
            Details
          </Link>
        </Button>
        <Button
          size="sm"
          variant={isInterested ? "default" : "outline"}
          className={cn(
            "flex-[2] gap-2 font-bold transition-all duration-300",
            isInterested
              ? "bg-primary text-black hover:bg-primary/90 shadow-[0_0_15px_rgba(53,227,117,0.3)]"
              : "border-primary/20 text-primary hover:bg-primary/10"
          )}
          onClick={handleToggleInterest}
          disabled={isActionLoading}
        >
          {isActionLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Star className={cn("w-4 h-4 transition-all", isInterested && "fill-current")} />
              <span>{isInterested ? "Interested" : "Save"}</span>
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="size-9 p-0 rounded-xl text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
          onClick={handleDismiss}
          disabled={isActionLoading}
          title="Dismiss job"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      {error && (
        <p className="text-xs text-red-400 mt-2 text-center font-medium bg-red-400/10 py-1 rounded">{error}</p>
      )}
      {currentStatus === 'applied' && (
        <p className="text-xs text-primary mt-2 text-center font-bold">In your application pipeline</p>
      )}
    </div>
  );
}
