'use client';

import React, { memo } from 'react';
import dynamic from 'next/dynamic';
import { ResumePDF } from './ResumePDF';
import { Loader2 } from 'lucide-react';
import type { ResumeDocumentData } from '@/lib/resume-document';

interface ResumePreviewProps {
    data: ResumeDocumentData;
    mode?: 'light' | 'dark';
}

const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-full bg-muted/10">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }
);

const ResumePreview = memo(({ data, mode = 'light' }: ResumePreviewProps) => {
    return (
        <PDFViewer
            width="100%"
            height="100%"
            showToolbar={false}
            className="h-full w-full border-none shadow-none outline-none focus:outline-none"
        >
            <ResumePDF content={data} mode={mode} />
        </PDFViewer>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function
    // Only re-render if data reference changes or mode changes
    return prevProps.data === nextProps.data && prevProps.mode === nextProps.mode;
});

ResumePreview.displayName = 'ResumePreview';

export { ResumePreview };
