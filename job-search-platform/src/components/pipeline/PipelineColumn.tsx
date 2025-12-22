import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Application, Job } from '@prisma/client';
import { ApplicationCard } from './ApplicationCard';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Star, Send, Phone, Gift, X, FileSearch } from 'lucide-react';

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

// Column styling with distinct colors (kept for headers only)
const columnConfig: Record<string, {
    bg: string;
    border: string;
    text: string;
    icon: React.ElementType;
    cardBorder: string;
    glowClass?: string;
}> = {
    interested: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-500',
        icon: Star,
        cardBorder: 'border-l-blue-500',
    },
    applied: {
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/30',
        text: 'text-indigo-500',
        icon: Send,
        cardBorder: 'border-l-indigo-500',
    },
    screening: {
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/30',
        text: 'text-cyan-500',
        icon: FileSearch,
        cardBorder: 'border-l-cyan-500',
    },
    interview: {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        text: 'text-purple-500',
        icon: Phone,
        cardBorder: 'border-l-purple-500',
        glowClass: 'shadow-purple-500/20',
    },
    offer: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-500',
        icon: Gift,
        cardBorder: 'border-l-emerald-500',
        glowClass: 'shadow-emerald-500/30',
    },
    rejected: {
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        text: 'text-rose-500',
        icon: X,
        cardBorder: 'border-l-rose-500',
    },
};

export function PipelineColumn({ id, title, applications, color = 'gray', selectedIds, onToggleSelection }: PipelineColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });

    const config = columnConfig[id] || columnConfig.interested;
    const Icon = config.icon;

    return (
        <div className={cn(
            "flex flex-col min-w-[280px] h-full rounded-2xl transition-all duration-200",
            isOver ? "bg-secondary/50 ring-2 ring-primary/20" : "bg-transparent",
        )}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 pb-2">
                <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded-lg bg-card shadow-sm border border-border", config.text)}>
                        <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">{title}</h3>
                </div>
                <Badge variant="outline" className="text-xs font-bold border-border bg-card text-muted-foreground">
                    {applications.length}
                </Badge>
            </div>

            {/* Drop Zone */}
            <div
                ref={setNodeRef}
                className="flex-1 p-3 overflow-y-auto min-h-[150px] scrollbar-thin scrollbar-thumb-muted/10 scrollbar-track-transparent"
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
                                stageConfig={config}
                            />
                        ))}
                    </div>
                </SortableContext>

                {applications.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-border/50 bg-card/20 opacity-50">
                        <Icon className="w-8 h-8 mb-2 text-muted-foreground opacity-30" />
                        <p className="text-xs text-muted-foreground font-medium">Drop jobs here</p>
                    </div>
                )}
            </div>
        </div>
    );
}
