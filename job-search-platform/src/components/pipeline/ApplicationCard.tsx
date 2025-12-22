import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Application, Job } from '@prisma/client';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, StickyNote, Loader2, Archive, Trash2, Clock, MapPin, CalendarDays } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateApplicationNotes, updateApplicationStatus, bulkDeleteApplications } from '@/app/actions/application';
import { ResumeUploadDialog } from './ResumeUploadDialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ApplicationWithJob = Application & {
    job: Job;
};

interface StageConfig {
    bg: string;
    border: string;
    text: string;
    cardBorder: string;
    glowClass?: string;
}

interface ApplicationCardProps {
    application: ApplicationWithJob;
    isSelected?: boolean;
    onToggleSelection?: (id: string) => void;
    selectionMode?: boolean;
    stageConfig?: StageConfig;
}

export function ApplicationCard({ application, isSelected, onToggleSelection, selectionMode, stageConfig }: ApplicationCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: application.id,
        data: {
            type: 'Application',
            application,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        scale: isDragging ? 1.05 : 1,
        zIndex: isDragging ? 999 : 'auto',
    };

    const [detailsOpen, setDetailsOpen] = useState(false);
    const [notes, setNotes] = useState(application.notes || '');
    const [isSaving, setIsSaving] = useState(false);

    async function handleSaveNotes() {
        setIsSaving(true);
        await updateApplicationNotes(application.id, notes);
        setIsSaving(false);
    }

    async function handleArchive() {
        await updateApplicationStatus(application.id, 'archived');
    }

    async function handleDelete() {
        if (confirm('Are you sure you want to delete this application?')) {
            await bulkDeleteApplications([application.id]);
        }
    }

    const history = (application.statusHistory as any[]) || [];

    // Determine card styling based on stage
    const cardClasses = cn(
        "p-4 cursor-grab active:cursor-grabbing rounded-xl border-l-4 transition-all duration-200",
        "bg-card hover:bg-card/90 hover:shadow-xl shadow-sm border-t border-r border-b border-border/50",
        stageConfig?.cardBorder || 'border-l-primary',
        isSelected && 'ring-2 ring-primary bg-primary/5',
        isDragging && 'opacity-50 rotate-2 scale-105 shadow-2xl'
    );

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative group touch-none">
            {/* Selection Checkbox */}
            <div
                className={`absolute top-2 right-2 z-20 ${selectionMode || isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
                onPointerDown={(e) => e.stopPropagation()}
            >
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelection?.(application.id)}
                    className="h-4 w-4 rounded-md border-border bg-background/50 text-primary focus:ring-primary cursor-pointer shadow-sm"
                />
            </div>

            <div className={cardClasses}>
                <div className="flex flex-col gap-2">
                    <div>
                        <h4 className="font-semibold text-sm leading-tight text-foreground line-clamp-2">{application.job.title}</h4>
                        <p className="text-xs text-muted-foreground font-medium mt-1">{application.job.company}</p>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-[80px]">{application.job.location || 'Remote'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            <span>{new Date(application.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1">
                            {application.notes && (
                                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] gap-1 bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                    <StickyNote className="w-3 h-3" /> Notes
                                </Badge>
                            )}
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onPointerDown={(e) => e.stopPropagation()}>
                            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-secondary" title="Details">
                                        <StickyNote className="h-3 w-3" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl bg-background border-border">
                                    <DialogHeader>
                                        <DialogTitle>Application Details</DialogTitle>
                                        <DialogDescription>
                                            {application.job.title} at {application.job.company}
                                        </DialogDescription>
                                    </DialogHeader>

                                    <Tabs defaultValue="notes" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 bg-muted">
                                            <TabsTrigger value="notes">Notes</TabsTrigger>
                                            <TabsTrigger value="history">History</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="notes" className="py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="notes">Notes</Label>
                                                <Textarea
                                                    id="notes"
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                    placeholder="Add your notes here..."
                                                    className="min-h-[200px] bg-background border-border"
                                                />
                                                <div className="flex justify-end mt-2">
                                                    <Button onClick={handleSaveNotes} disabled={isSaving}>
                                                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        Save Notes
                                                    </Button>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="history" className="py-4">
                                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted/10">
                                                {history.length === 0 ? (
                                                    <p className="text-sm text-muted-foreground text-center py-4">No history recorded.</p>
                                                ) : (
                                                    history.map((entry: any, index: number) => (
                                                        <div key={index} className="flex gap-3 text-sm border-b border-border/50 pb-3 last:border-0">
                                                            <div className="mt-0.5 p-1 rounded-full bg-muted">
                                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium capitalize text-foreground">{entry.status}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {new Date(entry.timestamp).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )).reverse()
                                                )}
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </DialogContent>
                            </Dialog>

                            <ResumeUploadDialog application={application} />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-secondary">
                                        <MoreHorizontal className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => setDetailsOpen(true)} className="focus:bg-muted">
                                        <StickyNote className="mr-2 h-4 w-4" /> View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-border" />
                                    <DropdownMenuItem onClick={handleArchive} className="focus:bg-muted">
                                        <Archive className="mr-2 h-4 w-4" /> Archive
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
