"use client";

import { Job } from "@prisma/client";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreRadial } from "@/components/ui/score-radial";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Check, Loader2 } from "lucide-react";
import type { Route } from "next";
import { useState } from "react";
import { applyToJob } from "@/app/actions/application";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const score = Math.round((job.compositeScore || 0) * 100);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleApply = async () => {
    setIsApplying(true);
    setError(null);
    try {
      const result = await applyToJob(job.id);
      if (result.success) {
        setHasApplied(true);
      } else {
        if (result.error === 'Unauthorized') {
          // Redirect to login
          router.push('/auth/signin');
          return;
        }
        setError(result.error || 'Failed to apply');
        console.error(result.error);
      }
    } catch (error) {
      setError('Failed to apply');
      console.error("Failed to apply", error);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <GlassCard className="flex flex-col h-full group p-card" hoverEffect={true}>
      {/* Header - job title and company */}
      <div className="mb-3">
        <h3 className="text-title-subsection leading-tight group-hover:text-primary transition-colors line-clamp-2" title={job.title}>
          {job.title}
        </h3>
        <p className="text-body-sm text-muted-foreground">{job.company}</p>
      </div>

      {/* Metadata with score */}
      <div className="flex gap-4 mb-4 flex-1">
        <div className="space-y-1.5 flex-1 text-body-sm text-muted-foreground">
          <div className="truncate">{job.location || 'Remote'}</div>
          <div>{job.salary || 'Competitive'}</div>
          <div>{new Date(job.postedAt).toLocaleDateString()}</div>
        </div>

        {/* Score indicator */}
        <div className="flex items-center">
          <ScoreRadial score={score} size={48} />
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="secondary" className="text-xs font-normal">
          {job.source}
        </Badge>
        {job.cityMatch && (
          <Badge variant="outline" className="text-xs font-normal">
            Matches Location
          </Badge>
        )}
      </div>

      <div className="flex gap-3 mt-auto pt-4 border-t border-white/5">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link href={`/jobs/${job.id}` as Route}>
            Details
          </Link>
        </Button>
        <Button
          size="sm"
          className="flex-1 gap-2 text-black font-semibold bg-blue-400 hover:bg-blue-500"
          onClick={handleApply}
          disabled={isApplying || hasApplied}
        >
          {isApplying ? (
            <>Saving <Loader2 className="w-3 h-3 animate-spin" /></>
          ) : hasApplied ? (
            <>In Pipeline <Check className="w-3 h-3" /></>
          ) : (
            <>Interested ⭐</>
          )}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-red-400 mt-2 text-center">{error}</p>
      )}
      {hasApplied && (
        <p className="text-xs text-blue-400 mt-2 text-center">Added to your pipeline!</p>
      )}
    </GlassCard>
  );
}
