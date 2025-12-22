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
    <div className="flex flex-col h-full group p-6 rounded-2xl bg-card transition-all duration-300 hover:shadow-2xl hover:bg-card/90 relative overflow-hidden">
      {/* Hover Highlight */}
      <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Header - job title and company */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2" title={job.title}>
          {job.title}
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

      <div className="flex gap-3 mt-auto pt-4 border-t border-border">
        <Button variant="ghost" size="sm" className="flex-1 hover:bg-secondary hover:text-foreground text-muted-foreground" asChild>
          <Link href={`/jobs/${job.id}` as Route}>
            Details
          </Link>
        </Button>
        <Button
          size="sm"
          className="flex-1 gap-2 text-black font-bold bg-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(57,224,121,0.3)] transition-all"
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
        <p className="text-xs text-red-400 mt-2 text-center font-medium bg-red-400/10 py-1 rounded">{error}</p>
      )}
      {hasApplied && (
        <p className="text-xs text-primary mt-2 text-center font-bold">Added to your pipeline!</p>
      )}
    </div>
  );
}
