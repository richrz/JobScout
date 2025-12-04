import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Application, Job } from '@prisma/client';
import { ApplicationCard } from './ApplicationCard';
import { cn } from '@/lib/utils';

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

export function PipelineColumn({ id, title, applications, color = 'gray', selectedIds, onToggleSelection }: PipelineColumnProps) {
    const { setNodeRef } = useDroppable({
        id: id,
    });

    return (
        <div className="flex flex-col min-w-[300px] h-full">
            <div className={cn("flex items-center justify-between p-3 mb-2 rounded-t-md border-b-2",
                color === 'blue' ? 'border-blue-500 bg-blue-50' :
                    color === 'green' ? 'border-green-500 bg-green-50' :
                        color === 'yellow' ? 'border-yellow-500 bg-yellow-50' :
                            color === 'purple' ? 'border-purple-500 bg-purple-50' :
                                color === 'red' ? 'border-red-500 bg-red-50' :
                                    'border-gray-500 bg-gray-50'
            )}>
                <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-700">{title}</h3>
                <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-gray-500 shadow-sm">
                    {applications.length}
                </span>
            </div>

            <div
                ref={setNodeRef}
                className="flex-1 bg-gray-100/50 rounded-b-md p-2 overflow-y-auto min-h-[150px]"
            >
                <SortableContext
                    id={id}
                    items={applications.map(app => app.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {applications.map((app) => (
                        <ApplicationCard
                            key={app.id}
                            application={app}
                            isSelected={selectedIds.includes(app.id)}
                            onToggleSelection={onToggleSelection}
                            selectionMode={selectedIds.length > 0}
                        />
                    ))}
                </SortableContext>

                {applications.length === 0 && (
                    <div className="h-24 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-md">
                        Drop here
                    </div>
                )}
            </div>
        </div>
    );
}
