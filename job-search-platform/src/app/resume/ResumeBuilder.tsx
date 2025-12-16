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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { generateAndPreviewResume } from '@/lib/resume-generator';
import { saveResume } from './actions';
import { PDFDownloadLink } from '@react-pdf/renderer';

// Dynamically import PDFViewer to avoid SSR issues
const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    { ssr: false, loading: () => <div>Loading Preview...</div> }
);

// Initial empty state
const initialResumeState = {
    contactInfo: { name: '', email: '', phone: '', location: '' },
    summary: '',
    experience: [],
    education: [],
    skills: []
};

interface Job {
    id: string;
    title: string;
    company: string;
}

export default function ResumeBuilder({ jobs, initialProfile }: { jobs: Job[], initialProfile?: any }) {
    const searchParams = useSearchParams();
    const [jobId, setJobId] = useState(searchParams.get('jobId') || '');

    // Initialize with profile data if available
    const [resumeData, setResumeData] = useState<any>(() => {
        if (initialProfile) {
            return {
                contactInfo: initialProfile.contactInfo || {},
                summary: initialProfile.contactInfo?.summary || '', // If summary exists?
                experience: initialProfile.experiences?.map((e: any) => ({
                    id: e.id,
                    company: e.company,
                    title: e.position,
                    startDate: e.startDate ? new Date(e.startDate).toISOString().split('T')[0] : '',
                    endDate: e.endDate ? new Date(e.endDate).toISOString().split('T')[0] : '',
                    description: e.description
                })) || [],
                education: initialProfile.educations?.map((e: any) => ({
                    id: e.id,
                    school: e.school,
                    degree: e.degree,
                    year: e.startDate ? new Date(e.startDate).getFullYear().toString() : ''
                })) || [],
                skills: initialProfile.skills || []
            };
        }
        return initialResumeState;
    });
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [strategy, setStrategy] = useState('strategic');

    const updateExperience = (index: number, field: string, value: string) => {
        const newExp = [...(resumeData.experience || [])];
        newExp[index] = { ...newExp[index], [field]: value };
        updateResume('experience', newExp);
    };

    const addExperience = () => {
        updateResume('experience', [...(resumeData.experience || []), { company: '', title: '', description: '' }]);
    };


    const handleEnhance = async () => {
        if (!jobId) {
            alert('Please enter a Job ID');
            return;
        }
        setLoading(true);
        try {
            const result = await generateAndPreviewResume(jobId, strategy as any);
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
        if (!jobId) {
            alert('Please select a Job ID first');
            return;
        }
        setIsSaving(true);
        try {
            // Only pass applicationId if it's a valid ID (from URL)
            const appId = searchParams.get('applicationId') || undefined;

            const result = await saveResume(jobId, resumeData, appId);

            if (result.success) {
                alert('Resume saved! You can view it at ' + result.path);
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
        <div className="flex h-full flex-col">
            <header className="flex items-center justify-between border-b p-4">
                <h1 className="text-xl font-bold">Resume Builder</h1>
                <div className="flex gap-2">
                    <div className="flex items-center gap-2">
                        <Label>Job:</Label>
                        <Select value={jobId} onValueChange={setJobId}>
                            <SelectTrigger className="w-[280px]">
                                <SelectValue placeholder="Select a job" />
                            </SelectTrigger>
                            <SelectContent>
                                {jobs.map((job) => (
                                    <SelectItem key={job.id} value={job.id}>
                                        {job.company} - {job.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>


                    <div className="flex items-center gap-2">
                        <Label>AI Strategy:</Label>
                        <Select value={strategy} onValueChange={setStrategy}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Strategy" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="strict">Strict (Literal)</SelectItem>
                                <SelectItem value="strategic">Strategic (Smart)</SelectItem>
                                <SelectItem value="visionary">Visionary (Bold)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={handleEnhance} disabled={loading || !jobId}>
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
                </div >
            </header >

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
                                    <input
                                        value={resumeData.contactInfo?.name || ''}
                                        onChange={(e) => updateContact('name', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Email</Label>
                                    <input
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
                            {(resumeData.experience || []).map((exp: any, index: number) => (
                                <Card key={index} className="p-4 space-y-4">
                                    <div className="flex justify-end">
                                        <Button variant="ghost" size="sm" onClick={() => {
                                            const newExp = [...resumeData.experience];
                                            newExp.splice(index, 1);
                                            updateResume('experience', newExp);
                                        }}>Remove</Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Company</Label>
                                            <Input
                                                value={exp.company || ''}
                                                onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label>Role</Label>
                                            <Input
                                                value={exp.title || ''}
                                                onChange={(e) => updateExperience(index, 'title', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Start</Label>
                                            <Input
                                                value={exp.startDate || ''}
                                                onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label>End</Label>
                                            <Input
                                                value={exp.endDate || ''}
                                                onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Description</Label>
                                        <textarea
                                            className="w-full border rounded-md p-2 text-sm"
                                            rows={4}
                                            value={exp.description || ''}
                                            onChange={(e) => updateExperience(index, 'description', e.target.value)}
                                        />
                                    </div>
                                </Card>
                            ))}
                            <Button onClick={addExperience} variant="outline" className="w-full">Add Experience</Button>
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
        </div >
    );
}
