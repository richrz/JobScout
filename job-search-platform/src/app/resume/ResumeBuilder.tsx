'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ResumePDF } from '@/components/resume/ResumePDF';
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
import {
    AISettingsRail,
    type PersonalitySettings,
    type AdvancedSettings,
} from '@/components/resume/AISettingsRail';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Dynamic PDF imports for SSR
const PDFViewer = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-full bg-muted/20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }
);

const PDFDownloadLink = dynamic(
    () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
    { ssr: false }
);

// Resume data type matching ResumePDF's ResumeContent interface
interface ResumeData {
    contactInfo: { name: string; email: string; phone: string; location: string };
    summary: string;
    experience: Array<{ id: string; title: string; company: string; location: string; startDate: string; endDate: string; description: string }>;
    education: Array<{ id: string; degree: string; school: string; location: string; startDate: string; endDate: string }>;
    skills: string[];
}

// Initial state
const initialResumeState: ResumeData = {
    contactInfo: { name: '', email: '', phone: '', location: '' },
    summary: '',
    experience: [],
    education: [],
    skills: [],
};

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

    // UI state
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [activeTab, setActiveTab] = useState('contact');

    // AI settings state
    const [personalitySettings, setPersonalitySettings] = useState<PersonalitySettings>({
        voice: 'professional',
        density: 'balanced',
        license: 'polish-up',
        insider: 'industry-aware',
    });
    const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
        requireEvidence: false,
        atsHeavy: false,
        prioritizeAchievements: true,
    });

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
            const strategyMap = {
                'just-facts': 'authentic',
                'polish-up': 'professional',
                'sell-hard': 'persuasive',
            } as const;
            const strategy = strategyMap[personalitySettings.license];

            const result = await generateAndPreviewResume(jobId, strategy as any);

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

    const selectedJob = jobs.find(j => j.id === jobId);

    return (
        <div className="flex h-full flex-col bg-background">
            {/* Header */}
            <header className="flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-4">
                    <Select value={jobId} onValueChange={setJobId}>
                        <SelectTrigger className="w-[320px]">
                            <SelectValue placeholder="Select a target job..." />
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
                        {loading ? 'Generating...' : 'Generate'}
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

                    <PDFDownloadLink document={<ResumePDF content={resumeData} />} fileName="resume.pdf">
                        {({ loading: pdfLoading }) => (
                            <Button variant="outline" disabled={pdfLoading} className="gap-2">
                                {pdfLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                Download
                            </Button>
                        )}
                    </PDFDownloadLink>
                </div>
            </header>

            {/* Main 3-Panel Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Rail - AI Settings */}
                <aside className="w-60 border-r bg-muted/30 flex-shrink-0">
                    <AISettingsRail
                        settings={personalitySettings}
                        onSettingsChange={setPersonalitySettings}
                        advancedSettings={advancedSettings}
                        onAdvancedSettingsChange={setAdvancedSettings}
                    />
                </aside>

                {/* Center - Editor */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-6">
                            <TabsTrigger value="contact" className="gap-2">
                                <User className="h-4 w-4" />
                                Contact
                            </TabsTrigger>
                            <TabsTrigger value="summary" className="gap-2">
                                <FileText className="h-4 w-4" />
                                Summary
                            </TabsTrigger>
                            <TabsTrigger value="experience" className="gap-2">
                                <Briefcase className="h-4 w-4" />
                                Experience
                            </TabsTrigger>
                            <TabsTrigger value="skills" className="gap-2">
                                <Wrench className="h-4 w-4" />
                                Skills
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="contact">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Contact Information</CardTitle>
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
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Professional Summary</CardTitle>
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
                                    <Card key={index}>
                                        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-base">Experience {index + 1}</CardTitle>
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
                                <Button variant="outline" onClick={addExperience} className="w-full gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Experience
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="skills">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Skills</CardTitle>
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
                <aside className="w-[45%] border-l bg-muted/20 flex flex-col flex-shrink-0">
                    <div className="px-4 py-3 border-b flex items-center justify-between">
                        <span className="text-sm font-medium">Preview</span>
                        <span className="text-xs text-muted-foreground">A4 Format</span>
                    </div>
                    <div className="flex-1 p-4">
                        <div className="h-full bg-white rounded-lg shadow-lg overflow-hidden">
                            <PDFViewer width="100%" height="100%" showToolbar={false}>
                                <ResumePDF content={resumeData} />
                            </PDFViewer>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
