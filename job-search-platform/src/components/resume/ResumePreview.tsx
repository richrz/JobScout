'use client';

import React, { memo } from 'react';
import dynamic from 'next/dynamic';
import { ResumePDF } from './ResumePDF';
import { Loader2 } from 'lucide-react';

// Define ResumeData interface locally or import it if better located. 
// For now, mirroring the interface from ResumePDF.tsx which exports ResumePDFProps but relies on local ResumeContent.
// Ideally ResumeContent should be exported from ResumePDF.tsx

interface ResumeContent {
    contactInfo: {
        name: string;
        email: string;
        phone: string;
        location: string;
    };
    summary: string;
    experience: Array<{
        id: string;
        title: string;
        company: string;
        location: string;
        startDate: string;
        endDate: string;
        description: string;
    }>;
    education: Array<{
        id: string;
        degree: string;
        school: string;
        location: string;
        startDate: string;
        endDate: string;
    }>;
    skills: string[];
}

interface ResumePreviewProps {
    data: ResumeContent;
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
