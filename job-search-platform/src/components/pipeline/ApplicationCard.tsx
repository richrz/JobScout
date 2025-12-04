import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Application, Job } from '@prisma/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, MoreHorizontal, StickyNote, Loader2, Archive, Trash2, Clock } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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

interface ApplicationCardProps {
    application: ApplicationWithJob;
    isSelected?: boolean;
    onToggleSelection?: (id: string) => void;
    selectionMode?: boolean;
}

export function ApplicationCard({ application, isSelected, onToggleSelection, selectionMode }: ApplicationCardProps) {
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
        opacity: isDragging ? 0.5 : 1,
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

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3 relative group">
            {/* Selection Checkbox */}
            <div
                className={`absolute top-2 right-2 z-10 ${selectionMode || isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
                onPointerDown={(e) => e.stopPropagation()}
            >
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelection?.(application.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
            </div>

            <Card className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium leading-tight">
                        {application.job.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{application.job.company}</p>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                    <div className="flex justify-between items-center mt-2">
                        <Badge variant="outline" className="text-[10px]">
                            {new Date(application.updatedAt).toLocaleDateString()}
                        </Badge>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onPointerDown={(e) => e.stopPropagation()}>

                            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" title="Details">
                                        <StickyNote className="h-3 w-3" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Application Details</DialogTitle>
                                        <DialogDescription>
                                            {application.job.title} at {application.job.company}
                                        </DialogDescription>
                                    </DialogHeader>

                                    <Tabs defaultValue="notes" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
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
                                                    className="min-h-[200px]"
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
                                            <div className="space-y-4 max-h-[300px] overflow-y-auto">
                                                {history.length === 0 ? (
                                                    <p className="text-sm text-muted-foreground text-center py-4">No history recorded.</p>
                                                ) : (
                                                    history.map((entry: any, index: number) => (
                                                        <div key={index} className="flex gap-3 text-sm border-b pb-3 last:border-0">
                                                            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                            <div>
                                                                <p className="font-medium capitalize">{entry.status}</p>
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
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <MoreHorizontal className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => setDetailsOpen(true)}>
                                        <StickyNote className="mr-2 h-4 w-4" /> View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleArchive}>
                                        <Archive className="mr-2 h-4 w-4" /> Archive
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
