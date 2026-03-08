'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Eye, FileText } from 'lucide-react';
import { summarizeResumeDocuments } from '@/lib/resume/document-summary';

interface ResumeDocument {
    id: string;
    title: string;
    documentState: string;
    pdfSnapshot: string | null;
    createdAt: string;
    content: string;
}

interface ResumeDocumentsPanelProps {
    resumes: ResumeDocument[];
}

const STATE_LABELS: Record<string, string> = {
    REFERENCE: 'Existing Resume',
    WORKING_DRAFT: 'Working Draft',
    SAVED_VARIANT: 'Saved Variant',
    SUBMITTED_SNAPSHOT: 'Submitted Snapshot',
};

export function ResumeDocumentsPanel({ resumes }: ResumeDocumentsPanelProps) {
    const [selectedResume, setSelectedResume] = useState<ResumeDocument | null>(null);
    const summary = useMemo(() => summarizeResumeDocuments(
        resumes.map((resume) => ({
            id: resume.id,
            title: resume.title,
            documentState: resume.documentState as 'REFERENCE' | 'WORKING_DRAFT' | 'SAVED_VARIANT' | 'SUBMITTED_SNAPSHOT',
            createdAt: new Date(resume.createdAt),
            pdfSnapshot: resume.pdfSnapshot,
        }))
    ), [resumes]);

    const orderedResumes = useMemo(() => {
        const preferredOrder = [
            summary.workingDraft?.id,
            summary.reference?.id,
            ...summary.savedVariants.map((resume) => resume.id),
            summary.latestSubmittedSnapshot?.id,
        ].filter(Boolean);

        const priority = new Map(preferredOrder.map((id, index) => [id, index]));

        return [...resumes].sort((left, right) => {
            const leftPriority = priority.get(left.id) ?? Number.MAX_SAFE_INTEGER;
            const rightPriority = priority.get(right.id) ?? Number.MAX_SAFE_INTEGER;

            if (leftPriority !== rightPriority) {
                return leftPriority - rightPriority;
            }

            return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
        });
    }, [resumes, summary]);

    return (
        <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-foreground">Resume Documents</h3>
            <p className="text-sm text-muted-foreground">
                Your workspace now owns reference resumes, the working draft, and submitted snapshots.
            </p>

            {orderedResumes.length === 0 ? (
                <GlassCard className="p-4">
                    <p className="text-sm text-muted-foreground italic">
                        No resume documents have been attached to this workspace yet.
                    </p>
                </GlassCard>
            ) : (
                <div className="grid gap-3">
                    {orderedResumes.map((resume) => (
                        <GlassCard key={resume.id} className="p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-electric-green" />
                                    <div>
                                        <p className="font-medium text-foreground">{resume.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {STATE_LABELS[resume.documentState] || resume.documentState} • {new Date(resume.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {resume.pdfSnapshot ? (
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={resume.pdfSnapshot} target="_blank" rel="noopener noreferrer">
                                            <Eye className="w-4 h-4 mr-1" />
                                            View File
                                        </a>
                                    </Button>
                                ) : (
                                    <Button variant="outline" size="sm" onClick={() => setSelectedResume(resume)}>
                                        <Eye className="w-4 h-4 mr-1" />
                                        Preview
                                    </Button>
                                )}
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}

            {selectedResume && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <GlassCard className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-border flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-foreground">{selectedResume.title}</h4>
                                <p className="text-xs text-muted-foreground">
                                    {STATE_LABELS[selectedResume.documentState] || selectedResume.documentState}
                                </p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedResume(null)}>
                                Close
                            </Button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1">
                            <pre className="whitespace-pre-wrap text-sm text-foreground font-mono bg-deep-space/50 p-4 rounded-lg">
                                {selectedResume.content}
                            </pre>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
}
