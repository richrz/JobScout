'use client';

import { useMemo, useState } from 'react';
import { Job } from '@prisma/client';
import { JobCard } from '@/components/jobs/JobCard';
import { Button } from '@/components/ui/button';
import { CheckSquare, Layers3, Star } from 'lucide-react';

interface InboxGridProps {
  jobs: Job[];
}

export function InboxGrid({ jobs }: InboxGridProps) {
  const [visibleJobs, setVisibleJobs] = useState<Job[]>(jobs);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allVisibleSelected = useMemo(
    () => visibleJobs.length > 0 && selectedIds.length === visibleJobs.length,
    [selectedIds, visibleJobs.length]
  );

  function handleResolved(jobId: string) {
    setVisibleJobs((current) => current.filter((job) => job.id !== jobId));
    setSelectedIds((current) => current.filter((id) => id !== jobId));
  }

  function toggleSelection(jobId: string) {
    setSelectedIds((current) =>
      current.includes(jobId)
        ? current.filter((id) => id !== jobId)
        : [...current, jobId]
    );
  }

  function toggleSelectAll() {
    setSelectedIds(allVisibleSelected ? [] : visibleJobs.map((job) => job.id));
  }

  async function runBatchAction(action: 'INTERESTED' | 'PASSED') {
    if (selectedIds.length === 0) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/triage/batch-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: selectedIds.map((jobId) => ({
            jobId,
            action,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Batch action failed');
      }

      setVisibleJobs((current) => current.filter((job) => !selectedIds.includes(job.id)));
      setSelectedIds([]);
    } catch (error) {
      console.error('Failed to run inbox batch action', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {selectedIds.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-sm text-foreground">
            <CheckSquare className="h-4 w-4 text-primary" />
            <span className="font-medium">{selectedIds.length} selected</span>
            <button
              type="button"
              className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              onClick={toggleSelectAll}
            >
              {allVisibleSelected ? 'Clear all' : 'Select all'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => runBatchAction('PASSED')}
              disabled={isSubmitting}
              className="gap-2"
            >
              <Layers3 className="h-4 w-4" />
              Pass Selected
            </Button>
            <Button onClick={() => runBatchAction('INTERESTED')} disabled={isSubmitting} className="gap-2">
              <Star className="h-4 w-4" />
              Save Selected
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {visibleJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            isSelected={selectedIds.includes(job.id)}
            selectionMode={selectedIds.length > 0}
            onToggleSelection={toggleSelection}
            onResolved={handleResolved}
          />
        ))}
      </div>
    </div>
  );
}
