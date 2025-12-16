'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ResumePDF } from '@/components/resume/ResumePDF';
import { ResumeEditor } from '@/components/resume/ResumeEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateAndPreviewResume } from '@/lib/resume-generator';
import { saveResume } from './actions';
import { PDFDownloadLink } from '@react-pdf/renderer';

// Dynamically import PDFViewer to avoid SSR issues
const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    { ssr: false, loading: () => <div>Loading Preview...</div> }
);

// Initial empty state
const initialResume = {
    contactInfo: { name: '', email: '', phone: '', location: '' },
    summary: '',
    experience: [],
    education: [],
    skills: []
};

export default function ResumePage() {
    const searchParams = useSearchParams();
    const [jobId, setJobId] = useState(searchParams.get('jobId') || '');
    const [resumeData, setResumeData] = useState<any>(initialResume);
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleEnhance = async () => {
        if (!jobId) {
            alert('Please enter a Job ID');
            return;
        }
        setLoading(true);
        try {
            const result = await generateAndPreviewResume(jobId, 'balanced');
            if (result.success && result.content) {
                setResumeData(result.content);
            } else {
                alert('Failed to generate resume: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error(error);
            alert('Error generating resume');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Mock Application ID for now if not provided, or we need to find one
            // In real flow, we probably have an application ID. 
            // We'll use jobId as a proxy for Application creation if it doesn't exist?
            // For this task, let's assume valid applicationId is passed or we just pass jobId as dummy
            const appId = searchParams.get('applicationId') || 'test-app-id';
            const result = await saveResume(appId, resumeData);
            if (result.success) {
                alert('Resume saved to ' + result.path);
            } else {
                alert('Failed to save: ' + result.error);
            }
        } catch (error) {
            console.error(error);
            alert('Error saving resume');
        } finally {
            setIsSaving(false);
        }
    };

    // Helper to update nested state
    const updateResume = (section: string, value: any) => {
        setResumeData((prev: any) => ({ ...prev, [section]: value }));
    };

    const updateContact = (field: string, value: string) => {
        setResumeData((prev: any) => ({
            ...prev,
            contactInfo: { ...prev.contactInfo, [field]: value }
        }));
    };

    return (
        <div className="flex h-screen flex-col">
            <header className="flex items-center justify-between border-b p-4">
                <h1 className="text-xl font-bold">Resume Builder</h1>
                <div className="flex gap-2">
                    <div className="flex items-center gap-2">
                        <Label>Job ID:</Label>
                        <Input
                            value={jobId}
                            onChange={(e) => setJobId(e.target.value)}
                            placeholder="Enter Job ID"
                            className="w-32"
                        />
                    </div>
                    <Button onClick={handleEnhance} disabled={loading}>
                        {loading ? 'Generating...' : 'Enhance with AI'}
                    </Button>
                    <Button variant="outline" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                    <PDFDownloadLink
                        document={<ResumePDF content={resumeData} />}
                        fileName="resume.pdf"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                        {({ loading }) => (loading ? 'Preparing PDF...' : 'Download PDF')}
                    </PDFDownloadLink>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Editor Section */}
                <div className="w-1/2 overflow-y-auto p-6 border-r bg-slate-50">
                    <Tabs defaultValue="contact">
                        <TabsList className="mb-4">
                            <TabsTrigger value="contact">Contact</TabsTrigger>
                            <TabsTrigger value="summary">Summary</TabsTrigger>
                            <TabsTrigger value="experience">Experience</TabsTrigger>
                            <TabsTrigger value="skills">Skills</TabsTrigger>
                        </TabsList>

                        <TabsContent value="contact" className="space-y-4">
                            <Card className="p-4 space-y-4">
                                <div className="grid gap-2">
                                    <Label>Full Name</Label>
                                    <Input
                                        value={resumeData.contactInfo?.name || ''}
                                        onChange={(e) => updateContact('name', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Email</Label>
                                    <Input
                                        value={resumeData.contactInfo?.email || ''}
                                        onChange={(e) => updateContact('email', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Phone</Label>
                                    <Input
                                        value={resumeData.contactInfo?.phone || ''}
                                        onChange={(e) => updateContact('phone', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Location</Label>
                                    <Input
                                        value={resumeData.contactInfo?.location || ''}
                                        onChange={(e) => updateContact('location', e.target.value)}
                                    />
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="summary">
                            <Card className="p-4">
                                <Label className="mb-2 block">Professional Summary</Label>
                                {/* Using ResumeEditor (ProseMirror) for Summary */}
                                <ResumeEditor
                                    initialContent={resumeData.summary}
                                    onChange={(val) => updateResume('summary', val)}
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                    Note: Live preview updates as you type (HTML stripped for PDF).
                                </p>
                            </Card>
                        </TabsContent>

                        <TabsContent value="experience" className="space-y-4">
                            <Card className="p-4">
                                <p>Experience editing is currently read-only in this demo version.</p>
                                <pre className="text-xs bg-slate-100 p-2 mt-2 rounded overflow-auto max-h-64">
                                    {JSON.stringify(resumeData.experience, null, 2)}
                                </pre>
                            </Card>
                        </TabsContent>

                        <TabsContent value="skills">
                            <Card className="p-4">
                                <Label>Skills (Comma separated)</Label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={resumeData.skills?.join(', ') || ''}
                                    onChange={(e) => updateResume('skills', e.target.value.split(',').map(s => s.trim()))}
                                />
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Preview Section */}
                <div className="w-1/2 bg-slate-200 p-6 flex items-center justify-center">
                    <div className="bg-white shadow-lg h-full w-full max-w-[210mm]">
                        <PDFViewer width="100%" height="100%" className="border-none">
                            <ResumePDF content={resumeData} />
                        </PDFViewer>
                    </div>
                </div>
            </div>
        </div>
    );
}
