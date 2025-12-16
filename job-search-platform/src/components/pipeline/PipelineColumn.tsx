import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Application, Job } from '@prisma/client';
import { ApplicationCard } from './ApplicationCard';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';

type ApplicationWithJob = Application & {
    job: Job;
};

interface PipelineColumnProps {
    id: string;
    title: string;
    applications: ApplicationWithJob[];
    color?: string;
    selectedIds: string[];
    onToggleSelection: (id: string) => void;
}

const colorMap: Record<string, string> = {
    discovered: 'bg-slate-500/10 border-slate-500/20 text-slate-500',
    interested: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
    applied: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500',
    interview: 'bg-purple-500/10 border-purple-500/20 text-purple-500',
    offer: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
    rejected: 'bg-rose-500/10 border-rose-500/20 text-rose-500',
    archived: 'bg-gray-500/10 border-gray-500/20 text-gray-500'
};

export function PipelineColumn({ id, title, applications, color = 'gray', selectedIds, onToggleSelection }: PipelineColumnProps) {
    const { setNodeRef } = useDroppable({
        id: id,
    });

    // Use ID for mapping to ensure consistency with STAGES array in parent
    const columnStyle = colorMap[id] || colorMap.discovered;

    return (
        <div className="flex flex-col min-w-[320px] h-full rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm shadow-xl">
            {/* Header */}
            <div className={cn("flex items-center justify-between p-4 border-b border-white/5 rounded-t-2xl", columnStyle)}>
                <h3 className="font-bold text-sm uppercase tracking-wider">{title}</h3>
                <Badge variant="secondary" className="bg-background/50 backdrop-blur-md shadow-sm border-0">
                    {applications.length}
                </Badge>
            </div>

            {/* Drop Zone */}
            <div
                ref={setNodeRef}
                className="flex-1 p-3 overflow-y-auto min-h-[150px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            >
                <SortableContext
                    id={id}
                    items={applications.map(app => app.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-3">
                        {applications.map((app) => (
                            <ApplicationCard
                                key={app.id}
                                application={app}
                                isSelected={selectedIds.includes(app.id)}
                                onToggleSelection={onToggleSelection}
                                selectionMode={selectedIds.length > 0}
                            />
                        ))}
                    </div>
                </SortableContext>

                {applications.length === 0 && (
                    <EmptyState
                        title="Empty Stage"
                        description=""
                        className="py-12 border-dashed border-white/10 bg-white/5"
                    />
                )}
            </div>
        </div>
    );
}
