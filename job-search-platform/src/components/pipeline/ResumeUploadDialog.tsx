import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, Upload, Eye } from 'lucide-react';
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
import { Application, Job } from '@prisma/client';
import { uploadResume } from '@/app/actions/application';
import { Input } from "@/components/ui/input";
import { summarizeResumeDocuments, type ResumeDocumentState } from '@/lib/resume/document-summary';

type ApplicationWithJob = Application & {
    job: Job;
    workspace?: {
        id: string;
        resumes: {
            id: string;
            title: string;
            documentState: string;
            pdfSnapshot: string | null;
            createdAt: Date;
        }[];
    } | null;
};

export function ResumeUploadDialog({ application }: { application: ApplicationWithJob }) {
    const [open, setOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const summary = summarizeResumeDocuments(
        (application.workspace?.resumes || []).map((resume) => ({
            ...resume,
            documentState: resume.documentState as ResumeDocumentState,
        }))
    );
    const currentDocument = summary.workingDraft || summary.reference || summary.latestSubmittedSnapshot;
    const currentLabel = currentDocument?.title || currentDocument?.pdfSnapshot?.split('/').pop() || null;
    const currentHref = currentDocument?.pdfSnapshot || null;

    async function handleUpload() {
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        await uploadResume(application.id, formData);
        setIsUploading(false);
        setOpen(false);
        setFile(null);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" title="Resume">
                    <FileText className={`h-3 w-3 ${summary.hasAnyDocuments ? 'text-blue-500' : ''}`} />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Resume</DialogTitle>
                    <DialogDescription>
                        Manage resume for {application.job.title}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {currentLabel && (
                        <div className="flex items-center justify-between p-3 border rounded-md bg-slate-50">
                            <span className="text-sm truncate max-w-[200px]">
                                {currentLabel}
                            </span>
                            {currentHref ? (
                                <Button variant="outline" size="sm" asChild>
                                    <a href={currentHref} target="_blank" rel="noopener noreferrer">
                                        <Eye className="mr-2 h-3 w-3" />
                                        View
                                    </a>
                                </Button>
                            ) : (
                                <span className="text-xs text-muted-foreground">Saved in workspace</span>
                            )}
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="resume">Upload New Resume</Label>
                        <Input
                            id="resume"
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleUpload} disabled={!file || isUploading}>
                        {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
