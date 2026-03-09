'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ResumePDF } from '@/components/resume/ResumePDF';
import { ResumePreview } from '@/components/resume/ResumePreview';
import type { ResumeDocumentData } from '@/lib/resume-document';
import { generateFileName } from '@/lib/file-naming';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { generateAndPreviewResume } from '@/lib/resume-generator';
import { saveResume } from './actions';
import { AISettingsRail } from '@/components/resume/AISettingsRail';
import {
    buildVoiceProfilePrompt,
    mapStrategyToExaggerationLevel,
    RESUME_WRITER_ZERO_PROFILE,
    type ResumeVoiceProfile,
    type ResumeWritingStrategy,
} from '@/lib/resume/voice-profile';
import {
    Wand2,
    Download,
    Save,
    FileText,
    User,
    Briefcase,
    Wrench,
    Loader2,
    CheckCircle,
    XCircle,
    Plus,
    Trash2,
    ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
    { ssr: false }
);

type ResumeData = ResumeDocumentData;


// Initial state
const initialResumeState: ResumeData = {
    contactInfo: { name: '', email: '', phone: '', location: '' },
    summary: '',
    experience: [],
    education: [],
    skills: [],
};

const PDFDownloadButton = React.memo(({ data, fileName }: { data: ResumeData; fileName: string }) => (
    <PDFDownloadLink document={<ResumePDF content={data} />} fileName={fileName}>
        {({ loading: pdfLoading }) => (
            <Button variant="outline" disabled={pdfLoading} className="gap-2">
                {pdfLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                PDF
            </Button>
        )}
    </PDFDownloadLink>
), (prev, next) => prev.data === next.data && prev.fileName === next.fileName);

interface Job {
    id: string;
    title: string;
    company: string;
}

export default function ResumeBuilder({ jobs, initialProfile }: { jobs: Job[], initialProfile?: any }) {
    const searchParams = useSearchParams();
    const [jobId, setJobId] = useState(searchParams.get('jobId') || '');

    // Resume data state
    const [resumeData, setResumeData] = useState<ResumeData>(() => {
        if (initialProfile) {
            return {
                contactInfo: initialProfile.contactInfo || { name: '', email: '', phone: '', location: '' },
                summary: initialProfile.contactInfo?.summary || '',
                experience: initialProfile.experiences?.map((e: any) => ({
                    id: e.id || crypto.randomUUID(),
                    company: e.company || '',
                    title: e.position || '',
                    location: e.location || '',
                    startDate: e.startDate ? new Date(e.startDate).toISOString().split('T')[0] : '',
                    endDate: e.endDate ? new Date(e.endDate).toISOString().split('T')[0] : '',
                    description: e.description || '',
                })) || [],
                education: initialProfile.educations?.map((e: any) => ({
                    id: e.id || crypto.randomUUID(),
                    school: e.school || '',
                    degree: e.degree || '',
                    location: '',
                    startDate: e.startDate ? new Date(e.startDate).toISOString().split('T')[0] : '',
                    endDate: e.endDate ? new Date(e.endDate).toISOString().split('T')[0] : '',
                })) || [],
                skills: initialProfile.skills || [],
            };
        }
        return initialResumeState;
    });

    // Preview state (separate from edit state to prevent flickering)
    const [previewData, setPreviewData] = useState<ResumeData>(resumeData);

    // Update preview when component mounts/data loads
    useEffect(() => {
        setPreviewData(resumeData);
    }, []); // Only on mount, explicit updates thereafter

    // UI state
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [activeTab, setActiveTab] = useState('contact');

    // AI settings state
    const [writingStrategy, setWritingStrategy] = useState<ResumeWritingStrategy>('balanced');
    const [voiceProfile, setVoiceProfile] = useState<ResumeVoiceProfile>(RESUME_WRITER_ZERO_PROFILE);

    // Handlers
    const updateContact = (field: string, value: string) => {
        setResumeData(prev => ({
            ...prev,
            contactInfo: { ...prev.contactInfo, [field]: value },
        }));
    };

    const updateExperience = (index: number, field: string, value: string) => {
        setResumeData(prev => {
            const newExp = [...prev.experience];
            newExp[index] = { ...newExp[index], [field]: value };
            return { ...prev, experience: newExp };
        });
    };

    const addExperience = () => {
        setResumeData(prev => ({
            ...prev,
            experience: [...prev.experience, { id: crypto.randomUUID(), company: '', title: '', location: '', startDate: '', endDate: '', description: '' }],
        }));
    };

    const removeExperience = (index: number) => {
        setResumeData(prev => ({
            ...prev,
            experience: prev.experience.filter((_, i) => i !== index),
        }));
    };

    const handleGenerate = async () => {
        if (!jobId) {
            alert('Please select a job first');
            return;
        }
        setLoading(true);
        try {
            const result = await generateAndPreviewResume(
                jobId,
                mapStrategyToExaggerationLevel(writingStrategy),
                buildVoiceProfilePrompt(voiceProfile, writingStrategy),
            );

            if (result.success && result.content) {
                setResumeData(result.content);
                setActiveTab('summary');
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
            alert('Please select a job first');
            return;
        }
        setIsSaving(true);
        setSaveStatus('idle');
        try {
            const appId = searchParams.get('applicationId') || undefined;
            const result = await saveResume(jobId, resumeData, appId);

            if (result.success) {
                setSaveStatus('success');
                setTimeout(() => setSaveStatus('idle'), 3000);
            } else {
                setSaveStatus('error');
                alert('Failed to save: ' + result.error);
            }
        } catch (error) {
            console.error(error);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    const updatePreview = () => {
        setPreviewData(resumeData);
        toast.success("Preview updated");
    };

    const selectedJob = jobs.find(j => j.id === jobId);
    const exportBaseName = selectedJob
        ? generateFileName('YYYY-MM-DD - {company} - {role}', selectedJob as any)
        : 'resume';

    const handleDocxDownload = async () => {
        try {
            const response = await fetch('/api/resume/export/docx', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeData,
                    fileName: `${exportBaseName}.docx`,
                    job: selectedJob ? { company: selectedJob.company, title: selectedJob.title } : null,
                }),
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => null);
                throw new Error(payload?.error || 'DOCX export failed');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${exportBaseName}.docx`;
            link.click();
            URL.revokeObjectURL(url);
            toast.success('DOCX downloaded');
        } catch (error) {
            console.error(error);
            toast.error('Failed to export DOCX');
        }
    };

    // Memoize the preview section to prevent any possible re-renders/flickering
    const memoizedPreview = React.useMemo(() => (
        <ResumePreview data={previewData} mode="dark" />
    ), [previewData]);

    return (
        <div className="flex h-full flex-col bg-background">
            {/* Header */}
            <header className="flex items-center justify-between border-b px-4 py-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center gap-4">
                    <Select value={jobId} onValueChange={setJobId}>
                        <SelectTrigger className="w-[320px]">
                            <SelectValue placeholder="Choose the job this draft is for..." />
                        </SelectTrigger>
                        <SelectContent>
                            {jobs.map((job) => (
                                <SelectItem key={job.id} value={job.id}>
                                    <span className="font-medium">{job.company}</span>
                                    <span className="text-muted-foreground"> — {job.title}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleGenerate}
                        disabled={loading || !jobId}
                        className="gap-2"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Wand2 className="h-4 w-4" />
                        )}
                        {loading ? 'Rewriting...' : 'Rewrite Draft'}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleSave}
                        disabled={isSaving}
                        className={cn(
                            "gap-2",
                            saveStatus === 'success' && "text-emerald-600 border-emerald-500/50",
                            saveStatus === 'error' && "text-red-600 border-red-500/50"
                        )}
                    >
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : saveStatus === 'success' ? (
                            <CheckCircle className="h-4 w-4" />
                        ) : saveStatus === 'error' ? (
                            <XCircle className="h-4 w-4" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        {saveStatus === 'success' ? 'Saved' : saveStatus === 'error' ? 'Failed' : 'Save'}
                    </Button>

                    <Button variant="outline" onClick={handleDocxDownload} className="gap-2">
                        <FileText className="h-4 w-4" />
                        DOCX
                    </Button>

                    <PDFDownloadButton data={resumeData} fileName={`${exportBaseName}.pdf`} />
                </div>
            </header>

            {/* Main 3-Panel Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Rail - AI Settings */}
                <aside className="w-72 border-r bg-background/95 flex-shrink-0 xl:w-80">
                    <AISettingsRail
                        profile={voiceProfile}
                        onProfileChange={setVoiceProfile}
                        strategy={writingStrategy}
                        onStrategyChange={setWritingStrategy}
                    />
                </aside>

                {/* Center - Editor */}
                <main className="flex-1 overflow-y-auto p-6 bg-background">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <div className="mb-6 grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
                            <Card className="border-border/60 bg-card/70 shadow-sm">
                                <CardHeader className="pb-3">
                                    <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary/80">
                                        Resume Draft For This Job
                                    </div>
                                    <CardTitle className="text-xl">
                                        {selectedJob
                                            ? `${selectedJob.title} at ${selectedJob.company}`
                                            : 'Choose a job to start tailoring this draft'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm leading-6 text-muted-foreground">
                                    <p>
                                        Starts from Career Data, then becomes the working draft for this one job.
                                    </p>
                                    <p>
                                        Editing here changes this draft only. It does not rewrite your master Career Data.
                                    </p>
                                </CardContent>
                            </Card>

                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                                <Card className="border-border/60 bg-card/70 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                            Source
                                        </div>
                                        <CardTitle className="text-base">Career Data</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm leading-6 text-muted-foreground">
                                        Contact details, summary, work history, and skills are pulled from your Career page first.
                                    </CardContent>
                                </Card>

                                <Card className="border-border/60 bg-card/70 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                            Output
                                        </div>
                                        <CardTitle className="text-base">Job-specific draft</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm leading-6 text-muted-foreground">
                                        Rewrite, adjust, refresh the preview, then save or export the version you want to send.
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-6 gap-4">
                            <div className="space-y-2">
                                <div className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                                    Draft Sections
                                </div>
                                <TabsList className="bg-secondary/50">
                                    <TabsTrigger value="contact" className="gap-2">
                                        <User className="h-4 w-4" />
                                        Basics
                                    </TabsTrigger>
                                    <TabsTrigger value="summary" className="gap-2">
                                        <FileText className="h-4 w-4" />
                                        Summary
                                    </TabsTrigger>
                                    <TabsTrigger value="experience" className="gap-2">
                                        <Briefcase className="h-4 w-4" />
                                        Work History
                                    </TabsTrigger>
                                    <TabsTrigger value="skills" className="gap-2">
                                        <Wrench className="h-4 w-4" />
                                        Skills
                                    </TabsTrigger>
                                </TabsList>
                                <p className="text-xs text-muted-foreground">
                                    Edit the current draft section by section. Your master Career Data stays on the Career page.
                                </p>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={updatePreview}
                                className="h-auto flex-col gap-1 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 group"
                                aria-label="Refresh Preview"
                            >
                                <div className="p-1 rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                                    <ArrowRight className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-xs text-primary/80">Refresh Preview</span>
                            </Button>
                        </div>

                        <TabsContent value="contact">
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-base">Draft Basics</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Adjust the identity and contact details shown on this specific resume.
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label>Full Name</Label>
                                        <Input
                                            value={resumeData.contactInfo?.name || ''}
                                            onChange={(e) => updateContact('name', e.target.value)}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Email</Label>
                                            <Input
                                                type="email"
                                                value={resumeData.contactInfo?.email || ''}
                                                onChange={(e) => updateContact('email', e.target.value)}
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Phone</Label>
                                            <Input
                                                value={resumeData.contactInfo?.phone || ''}
                                                onChange={(e) => updateContact('phone', e.target.value)}
                                                placeholder="(555) 123-4567"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Location</Label>
                                        <Input
                                            value={resumeData.contactInfo?.location || ''}
                                            onChange={(e) => updateContact('location', e.target.value)}
                                            placeholder="San Francisco, CA"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="summary">
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-base">Draft Summary</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        This is the opening pitch for this job, not your permanent master summary.
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        value={resumeData.summary || ''}
                                        onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                                        placeholder="A brief summary of your professional background and career objectives..."
                                        rows={6}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="experience">
                            <div className="space-y-4">
                                {resumeData.experience.map((exp, index) => (
                                    <Card key={index} className="border-border/50 shadow-sm">
                                        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-base">Work History {index + 1}</CardTitle>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => removeExperience(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label>Company</Label>
                                                    <Input
                                                        value={exp.company}
                                                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                                        placeholder="Company Name"
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Title</Label>
                                                    <Input
                                                        value={exp.title}
                                                        onChange={(e) => updateExperience(index, 'title', e.target.value)}
                                                        placeholder="Job Title"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label>Start Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={exp.startDate}
                                                        onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>End Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={exp.endDate}
                                                        onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Description</Label>
                                                <Textarea
                                                    value={exp.description}
                                                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                                                    placeholder="Describe your responsibilities and achievements..."
                                                    rows={3}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                <Button variant="outline" onClick={addExperience} className="w-full gap-2 border-dashed border-border hover:bg-secondary/50">
                                    <Plus className="h-4 w-4" />
                                    Add Work History
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="skills">
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-base">Skills</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Keep this list focused on the skills you want this version of the resume to emphasize.
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        value={Array.isArray(resumeData.skills) ? resumeData.skills.join(', ') : ''}
                                        onChange={(e) => setResumeData(prev => ({
                                            ...prev,
                                            skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean),
                                        }))}
                                        placeholder="TypeScript, React, Node.js, PostgreSQL..."
                                        rows={4}
                                    />
                                    <p className="text-xs text-muted-foreground mt-2">Separate skills with commas</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </main>

                {/* Right - PDF Preview */}
                <aside className="w-[45%] border-l bg-muted/10 flex flex-col flex-shrink-0">
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/5">
                        <span className="text-sm font-medium">Resume Page Preview</span>
                        <span className="text-xs text-muted-foreground">Refresh after edits</span>
                    </div>
                    <div className="flex-1 p-4">
                        <div className="h-full bg-card rounded-lg shadow-lg overflow-hidden border border-border relative group">
                            {memoizedPreview}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
