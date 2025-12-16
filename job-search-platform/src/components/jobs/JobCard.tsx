"use client";

import { Job } from "@prisma/client";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Building2, MapPin, Banknote, CalendarDays, ExternalLink } from "lucide-react";
import type { Route } from "next";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const score = Math.round((job.compositeScore || 0) * 100);
  
  // Determine score color
  const scoreColor = score >= 80 ? "text-emerald-500 ring-emerald-500/30 bg-emerald-500/10" 
    : score >= 60 ? "text-amber-500 ring-amber-500/30 bg-amber-500/10" 
    : "text-rose-500 ring-rose-500/30 bg-rose-500/10";

  return (
    <GlassCard className="flex flex-col h-full group" hoverEffect={true}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-inner">
             <Building2 className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1" title={job.title}>
              {job.title}
            </h3>
            <p className="text-sm text-muted-foreground">{job.company}</p>
          </div>
        </div>
        
        <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-full ring-2 ${scoreColor}`}>
          <span className="text-sm font-bold">{score}</span>
          <span className="text-[10px] font-medium opacity-80">%</span>
        </div>
      </div>

      <div className="space-y-2.5 mb-6 flex-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span className="truncate">{job.location || 'Remote'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Banknote className="w-4 h-4 text-slate-400" />
          <span>{job.salary || 'Competitive'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="w-4 h-4 text-slate-400" />
          <span>{new Date(job.postedAt).toLocaleDateString()}</span>
        </div>
        
        <div className="flex flex-wrap gap-2 pt-1">
           <Badge variant="secondary" className="text-xs font-normal">
              {job.source}
           </Badge>
           {job.cityMatch && (
              <Badge variant="outline" className="text-xs font-normal">
                 Matches Location
              </Badge>
           )}
        </div>
      </div>

      <div className="flex gap-3 mt-auto pt-4 border-t border-white/5">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link href={`/jobs/${job.id}` as Route}>
             Details
          </Link>
        </Button>
        <Button size="sm" className="flex-1 gap-2">
          Apply <ExternalLink className="w-3 h-3" />
        </Button>
      </div>
    </GlassCard>
  );
}
