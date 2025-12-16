'use client';

import React, { useState } from 'react';
import { ResumeEditor } from '@/components/resume/ResumeEditor';
import { ResumePDF } from '@/components/resume/ResumePDF';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ResumePage() {
    const [resumeContent, setResumeContent] = useState<string>('');
    const [pdfContent, setPdfContent] = useState<any>({
        contactInfo: {
            name: 'Your Name',
            email: 'your.email@example.com',
            phone: '(555) 000-0000',
            location: 'City, State',
        },
        summary: 'Click "Generate Resume" to create a tailored resume for a job.',
        experience: [],
        education: [],
        skills: [],
    });
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [exaggerationLevel, setExaggerationLevel] = useState<'conservative' | 'balanced' | 'strategic'>('balanced');
    const [isGenerating, setIsGenerating] = useState(false);
    const [jobs, setJobs] = useState<any[]>([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(true);

    // Load available jobs on mount
    React.useEffect(() => {
        async function loadJobs() {
            try {
                const response = await fetch('/api/jobs');
                const data = await response.json();
                if (data.jobs) {
                    setJobs(data.jobs.slice(0, 10)); // Show first 10 jobs
                    if (data.jobs.length > 0) {
                        setSelectedJobId(data.jobs[0].id);
                    }
                }
            } catch (error) {
                console.error('Failed to load jobs:', error);
            } finally {
                setIsLoadingJobs(false);
            }
        }
        loadJobs();
    }, []);

    const handleEditorChange = (content: string) => {
        setResumeContent(content);
        // Parse HTML to update PDF preview in real-time
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'text/html');

            // Extract summary (first paragraph)
            const firstP = doc.querySelector('p');
            if (firstP && firstP.textContent) {
                setPdfContent((prev: any) => ({
                    ...prev,
                    summary: firstP.textContent || prev.summary,
                }));
            }
        } catch (error) {
            console.error('Failed to parse HTML:', error);
        }
    };

    const handleGenerate = async () => {
        if (!selectedJobId) {
            alert('Please select a job first');
            return;
        }

        setIsGenerating(true);
        try {
            const response = await fetch('/api/resume/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId: selectedJobId,
                    exaggerationLevel,
                }),
            });

            const data = await response.json();

            if (!data.success) {
                alert(`Failed to generate resume: ${data.error}`);
                return;
            }

            // Update both PDF content and editor HTML
            if (data.content) {
                setPdfContent(data.content);
            }
            if (data.content && typeof data.content === 'string') {
                setResumeContent(data.content);
            }
        } catch (error) {
            console.error('Failed to generate resume:', error);
            alert('Failed to generate resume. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveResume = async () => {
        if (!selectedJobId) {
            alert('Please select a job first');
            return;
        }

        if (!resumeContent && !pdfContent) {
            alert('Please generate a resume first');
            return;
        }

        try {
            // Save the generated resume to the Application record
            const resumePath = `/generated-resumes/${selectedJobId}-${Date.now()}.pdf`;

            const response = await fetch('/api/resume/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId: selectedJobId,
                    resumePath,
                }),
            });

            const data = await response.json();

            if (!data.success) {
                alert(`Failed to save resume: ${data.error}`);
                return;
            }

            alert('Resume saved successfully to application!');
        } catch (error) {
            console.error('Failed to save resume:', error);
            alert('Failed to save resume. Please try again.');
        }
    };

    return (
        <div className="container mx-auto p-6 h-screen flex flex-col">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Resume Generator</h1>
                <p className="text-muted-foreground">
                    Create tailored resumes for your job applications
                </p>
            </div>

            {/* Controls */}
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle>Generation Controls</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Job Selector */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Select Job</label>
                            <Select
                                value={selectedJobId || ''}
                                onValueChange={setSelectedJobId}
                                disabled={isLoadingJobs || jobs.length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={isLoadingJobs ? 'Loading jobs...' : 'Select a job'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {jobs.map((job) => (
                                        <SelectItem key={job.id} value={job.id}>
                                            {job.title} at {job.company}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Exaggeration Level Selector */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Exaggeration Level</label>
                            <Select value={exaggerationLevel} onValueChange={(value: any) => setExaggerationLevel(value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="conservative">Conservative (Factual)</SelectItem>
                                    <SelectItem value="balanced">Balanced (Professional)</SelectItem>
                                    <SelectItem value="strategic">Strategic (Confident)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 justify-end">
                        <Button onClick={handleGenerate} disabled={isGenerating || !selectedJobId}>
                            {isGenerating ? 'Generating...' : 'Generate Resume'}
                        </Button>
                        <Button onClick={handleSaveResume} variant="secondary" disabled={!resumeContent && !pdfContent}>
                            Save to Application
                        </Button>
                        <PDFDownloadLink
                            document={<ResumePDF content={pdfContent} />}
                            fileName={`Resume-${selectedJobId || 'draft'}-${new Date().toISOString().split('T')[0]}.pdf`}
                        >
                            {({ loading }) => (
                                <Button variant="outline" disabled={loading}>
                                    {loading ? 'Preparing PDF...' : 'Download PDF'}
                                </Button>
                            )}
                        </PDFDownloadLink>
                    </div>
                </CardContent>
            </Card>

            {/* Split Pane Layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
                {/* Editor Pane */}
                <Card className="flex flex-col overflow-hidden">
                    <CardHeader>
                        <CardTitle>Editor</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto">
                        <ResumeEditor
                            initialContent={resumeContent}
                            onChange={handleEditorChange}
                        />
                    </CardContent>
                </Card>

                {/* Preview Pane */}
                <Card className="flex flex-col overflow-hidden">
                    <CardHeader>
                        <CardTitle>PDF Preview</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden">
                        <div className="h-full border rounded">
                            <PDFViewer width="100%" height="100%" className="border-0">
                                <ResumePDF content={pdfContent} />
                            </PDFViewer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
