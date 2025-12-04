'use client';

import React, { useState, useMemo } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
    DropAnimation
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Application, Job } from '@prisma/client';
import { PipelineColumn } from './PipelineColumn';
import { ApplicationCard } from './ApplicationCard';
import { updateApplicationStatus, bulkArchiveApplications, bulkDeleteApplications } from '@/app/actions/application';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Archive, Trash2, X } from 'lucide-react';

type ApplicationWithJob = Application & {
    job: Job;
};

const STAGES = [
    { id: 'discovered', title: 'Discovered', color: 'gray' },
    { id: 'interested', title: 'Interested', color: 'blue' },
    { id: 'applied', title: 'Applied', color: 'yellow' },
    { id: 'interview', title: 'Interview', color: 'purple' },
    { id: 'offer', title: 'Offer', color: 'green' },
    { id: 'rejected', title: 'Rejected', color: 'red' },
    { id: 'archived', title: 'Archived', color: 'gray' }
];

interface KanbanBoardProps {
    initialApplications: ApplicationWithJob[];
}

export function KanbanBoard({ initialApplications }: KanbanBoardProps) {
    const [applications, setApplications] = useState<ApplicationWithJob[]>(initialApplications);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

    function toggleSelection(id: string) {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    }

    function clearSelection() {
        setSelectedIds([]);
    }

    async function handleBulkArchive() {
        if (selectedIds.length === 0) return;
        setIsBulkActionLoading(true);
        await bulkArchiveApplications(selectedIds);
        setIsBulkActionLoading(false);
        clearSelection();
    }

    async function handleBulkDelete() {
        if (selectedIds.length === 0) return;
        if (!confirm('Are you sure you want to delete selected applications?')) return;
        setIsBulkActionLoading(true);
        await bulkDeleteApplications(selectedIds);
        setIsBulkActionLoading(false);
        clearSelection();
    }

    function handleExportCSV() {
        const headers = ['ID', 'Job Title', 'Company', 'Status', 'Date Applied', 'Notes'];
        const rows = applications.map(app => [
            app.id,
            app.job.title,
            app.job.company,
            app.status,
            app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '',
            app.notes || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'applications_export.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Prevent accidental drags
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Group applications by status
    const columns = useMemo(() => {
        const cols: Record<string, ApplicationWithJob[]> = {};
        STAGES.forEach(stage => {
            cols[stage.id] = applications.filter(app => app.status === stage.id);
        });
        return cols;
    }, [applications]);

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string);
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === 'Application';
        const isOverTask = over.data.current?.type === 'Application';

        if (!isActiveTask) return;

        // Dropping a Task over another Task
        if (isActiveTask && isOverTask) {
            setApplications((apps) => {
                const activeIndex = apps.findIndex((t) => t.id === activeId);
                const overIndex = apps.findIndex((t) => t.id === overId);

                if (apps[activeIndex].status !== apps[overIndex].status) {
                    // Status change handled in DragEnd usually, but for visual sortable list we might need logic here
                    // For simple Kanban, we usually just let DragEnd handle the status update
                    // But dnd-kit sortable needs items to be in the right list for animation
                    const newApps = [...apps];
                    newApps[activeIndex].status = apps[overIndex].status;
                    return arrayMove(newApps, activeIndex, overIndex);
                }

                return arrayMove(apps, activeIndex, overIndex);
            });
        }

        // Dropping a Task over a Column
        const isOverColumn = STAGES.some(s => s.id === overId);
        if (isActiveTask && isOverColumn) {
            setApplications((apps) => {
                const activeIndex = apps.findIndex((t) => t.id === activeId);
                if (apps[activeIndex].status !== overId) {
                    const newApps = [...apps];
                    newApps[activeIndex].status = overId as string;
                    return arrayMove(newApps, activeIndex, activeIndex); // Position doesn't matter much here
                }
                return apps;
            });
        }
    }

    async function handleDragEnd(event: DragEndEvent) {
        setActiveId(null);
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeApp = applications.find(app => app.id === activeId);
        if (!activeApp) return;

        let newStatus = activeApp.status;

        // If dropped over a column
        if (STAGES.some(s => s.id === overId)) {
            newStatus = overId;
        }
        // If dropped over another task
        else {
            const overApp = applications.find(app => app.id === overId);
            if (overApp) {
                newStatus = overApp.status;
            }
        }

        // Optimistic update already happened in DragOver, but let's ensure consistency
        if (activeApp.status !== newStatus) {
            // Call server action
            await updateApplicationStatus(activeId, newStatus);
        }
    }

    const [mounted, setMounted] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    const activeApplication = useMemo(() =>
        applications.find(app => app.id === activeId),
        [activeId, applications]);

    if (!mounted) return null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col h-full">
                {/* Bulk Actions Toolbar */}
                {selectedIds.length > 0 && (
                    <div className="bg-blue-50 border-b border-blue-100 p-2 flex items-center justify-between mb-4 rounded-md">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-blue-700">{selectedIds.length} selected</span>
                            <Button variant="ghost" size="sm" onClick={clearSelection} className="h-6 w-6 p-0 hover:bg-blue-100">
                                <X className="h-4 w-4 text-blue-700" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={handleBulkArchive} disabled={isBulkActionLoading} className="h-8 bg-white">
                                <Archive className="mr-2 h-3 w-3" />
                                Archive
                            </Button>
                            <Button size="sm" variant="destructive" onClick={handleBulkDelete} disabled={isBulkActionLoading} className="h-8">
                                <Trash2 className="mr-2 h-3 w-3" />
                                Delete
                            </Button>
                        </div>
                    </div>
                )}

                <div className="flex h-[calc(100vh-250px)] gap-4 overflow-x-auto pb-4">
                    {STAGES.map((stage) => (
                        <PipelineColumn
                            key={stage.id}
                            id={stage.id}
                            title={stage.title}
                            color={stage.color}
                            applications={columns[stage.id] || []}
                            selectedIds={selectedIds}
                            onToggleSelection={toggleSelection}
                        />
                    ))}
                </div>
            </div>

            <div className="fixed bottom-4 right-4">
                <Button onClick={handleExportCSV} variant="outline" className="shadow-lg bg-white">
                    Export CSV
                </Button>
            </div>

            {createPortal(
                <DragOverlay dropAnimation={dropAnimation}>
                    {activeApplication && (
                        <ApplicationCard application={activeApplication} />
                    )}
                </DragOverlay>,
                document.body
            )}
        </DndContext>
    );
}
