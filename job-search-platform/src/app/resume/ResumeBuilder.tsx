'use client';

import React, { useEffect, useRef, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  { ssr: false },
);

type ResumeData = ResumeDocumentData;
type DraftSectionId = 'contact' | 'summary' | 'experience' | 'skills';

const initialResumeState: ResumeData = {
  contactInfo: { name: '', email: '', phone: '', location: '' },
  summary: '',
  experience: [],
  education: [],
  skills: [],
};

const DRAFT_SECTIONS: Array<{
  id: DraftSectionId;
  label: string;
  description: string;
  icon: typeof User;
}> = [
  {
    id: 'contact',
    label: 'Basics',
    description: 'Name and contact details for this draft.',
    icon: User,
  },
  {
    id: 'summary',
    label: 'Summary',
    description: 'The opening pitch for this job.',
    icon: FileText,
  },
  {
    id: 'experience',
    label: 'Work History',
    description: 'The roles and proof you want emphasized.',
    icon: Briefcase,
  },
  {
    id: 'skills',
    label: 'Skills',
    description: 'The skill list shown on this draft.',
    icon: Wrench,
  },
];

const PDFDownloadButton = React.memo(
  ({ data, fileName }: { data: ResumeData; fileName: string }) => (
    <PDFDownloadLink document={<ResumePDF content={data} />} fileName={fileName}>
      {({ loading: pdfLoading }) => (
        <Button variant="outline" disabled={pdfLoading} className="gap-2">
          {pdfLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          PDF
        </Button>
      )}
    </PDFDownloadLink>
  ),
  (prev, next) => prev.data === next.data && prev.fileName === next.fileName,
);

interface Job {
  id: string;
  title: string;
  company: string;
}

export default function ResumeBuilder({
  jobs,
  initialProfile,
}: {
  jobs: Job[];
  initialProfile?: any;
}) {
  const searchParams = useSearchParams();
  const [jobId, setJobId] = useState(searchParams.get('jobId') || '');
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    if (initialProfile) {
      return {
        contactInfo: initialProfile.contactInfo || {
          name: '',
          email: '',
          phone: '',
          location: '',
        },
        summary: initialProfile.contactInfo?.summary || '',
        experience:
          initialProfile.experiences?.map((e: any) => ({
            id: e.id || crypto.randomUUID(),
            company: e.company || '',
            title: e.position || '',
            location: e.location || '',
            startDate: e.startDate
              ? new Date(e.startDate).toISOString().split('T')[0]
              : '',
            endDate: e.endDate
              ? new Date(e.endDate).toISOString().split('T')[0]
              : '',
            description: e.description || '',
          })) || [],
        education:
          initialProfile.educations?.map((e: any) => ({
            id: e.id || crypto.randomUUID(),
            school: e.school || '',
            degree: e.degree || '',
            location: '',
            startDate: e.startDate
              ? new Date(e.startDate).toISOString().split('T')[0]
              : '',
            endDate: e.endDate
              ? new Date(e.endDate).toISOString().split('T')[0]
              : '',
          })) || [],
        skills: initialProfile.skills || [],
      };
    }

    return initialResumeState;
  });
  const [previewData, setPreviewData] = useState<ResumeData>(resumeData);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [activeSection, setActiveSection] = useState<DraftSectionId>('contact');
  const [writingStrategy, setWritingStrategy] = useState<ResumeWritingStrategy>('balanced');
  const [voiceProfile, setVoiceProfile] = useState<ResumeVoiceProfile>(
    RESUME_WRITER_ZERO_PROFILE,
  );

  const sectionRefs = {
    contact: useRef<HTMLDivElement>(null),
    summary: useRef<HTMLDivElement>(null),
    experience: useRef<HTMLDivElement>(null),
    skills: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    setPreviewData(resumeData);
  }, []);

  const updateContact = (field: string, value: string) => {
    setResumeData((prev) => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, [field]: value },
    }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    setResumeData((prev) => {
      const nextExperience = [...prev.experience];
      nextExperience[index] = { ...nextExperience[index], [field]: value };
      return { ...prev, experience: nextExperience };
    });
  };

  const addExperience = () => {
    setResumeData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: crypto.randomUUID(),
          company: '',
          title: '',
          location: '',
          startDate: '',
          endDate: '',
          description: '',
        },
      ],
    }));
  };

  const removeExperience = (index: number) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  const jumpToSection = (sectionId: DraftSectionId) => {
    setActiveSection(sectionId);
    sectionRefs[sectionId].current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
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
        setPreviewData(result.content);
        setActiveSection('summary');
        requestAnimationFrame(() => {
          sectionRefs.summary.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        });
      } else {
        alert(`Failed to generate resume: ${result.error || 'Unknown error'}`);
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
        alert(`Failed to save: ${result.error}`);
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
    toast.success('Preview synced');
  };

  const selectedJob = jobs.find((job) => job.id === jobId);
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
          job: selectedJob
            ? { company: selectedJob.company, title: selectedJob.title }
            : null,
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

  const memoizedPreview = React.useMemo(
    () => <ResumePreview data={previewData} mode="dark" />,
    [previewData],
  );

  return (
    <div className="flex h-full flex-col bg-background">
      <header className="flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
          <Button onClick={handleGenerate} disabled={loading || !jobId} className="gap-2">
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
              'gap-2',
              saveStatus === 'success' && 'border-emerald-500/50 text-emerald-600',
              saveStatus === 'error' && 'border-red-500/50 text-red-600',
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
            {saveStatus === 'success'
              ? 'Saved'
              : saveStatus === 'error'
                ? 'Failed'
                : 'Save'}
          </Button>

          <Button variant="outline" onClick={handleDocxDownload} className="gap-2">
            <FileText className="h-4 w-4" />
            DOCX
          </Button>

          <PDFDownloadButton data={resumeData} fileName={`${exportBaseName}.pdf`} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden p-4 lg:p-6">
        <aside className="mr-4 w-72 flex-shrink-0 overflow-hidden rounded-[28px] border border-border/70 bg-background/95 xl:mr-6 xl:w-80">
          <AISettingsRail
            profile={voiceProfile}
            onProfileChange={setVoiceProfile}
            strategy={writingStrategy}
            onStrategyChange={setWritingStrategy}
          />
        </aside>

        <section className="flex min-h-0 flex-1 overflow-hidden rounded-[30px] border border-border/70 bg-card/30 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
          <div className="grid min-h-0 flex-1 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
            <div className="min-h-0 overflow-y-auto border-b border-border/70 xl:border-b-0 xl:border-r">
              <div className="space-y-6 p-5 lg:p-6">
                <div className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
                  <div className="rounded-[24px] border border-border/70 bg-gradient-to-br from-background via-background to-card/70 p-5 shadow-sm">
                    <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary/80">
                      Draft Workspace
                    </div>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                      {selectedJob
                        ? `${selectedJob.title} at ${selectedJob.company}`
                        : 'Choose a job to start shaping this draft'}
                    </h2>
                    <div className="mt-4 space-y-2 text-sm leading-6 text-muted-foreground">
                      <p>
                        Career Data is the source. This page is the working draft for the selected
                        job.
                      </p>
                      <p>
                        Edit sections here, sync the preview, then save or export the version you
                        actually want to send.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-[22px] border border-border/70 bg-background/70 p-4 shadow-sm">
                      <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        Source
                      </div>
                      <div className="mt-2 text-base font-semibold text-foreground">
                        Career Data
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Contact details, summary, work history, and skills are pulled in from your
                        Career page first.
                      </p>
                    </div>

                    <div className="rounded-[22px] border border-border/70 bg-background/70 p-4 shadow-sm">
                      <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        Output
                      </div>
                      <div className="mt-2 text-base font-semibold text-foreground">
                        Current draft
                      </div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Rewriting and section edits shape this resume draft only. They do not
                        rewrite your master Career Data.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-border/70 bg-background/65 p-4 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="space-y-2">
                      <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                        Jump to section
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {DRAFT_SECTIONS.map((section) => {
                          const Icon = section.icon;
                          return (
                            <Button
                              key={section.id}
                              type="button"
                              variant={activeSection === section.id ? 'default' : 'outline'}
                              className="gap-2 rounded-full"
                              onClick={() => jumpToSection(section.id)}
                            >
                              <Icon className="h-4 w-4" />
                              {section.label}
                            </Button>
                          );
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        One drafting workspace. No detached editing tabs.
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      onClick={updatePreview}
                      className="gap-2 rounded-full"
                      aria-label="Sync Preview"
                    >
                      <ArrowRight className="h-4 w-4" />
                      Sync Preview
                    </Button>
                  </div>
                </div>

                <div className="space-y-5">
                  <section
                    ref={sectionRefs.contact}
                    className="rounded-[26px] border border-border/70 bg-background/80 p-5 shadow-sm"
                  >
                    <div className="mb-5 space-y-2">
                      <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary/80">
                        Basics
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Name and contact details
                      </h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Adjust the identity and contact details shown on this specific draft.
                      </p>
                    </div>

                    <div className="space-y-4">
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
                    </div>
                  </section>

                  <section
                    ref={sectionRefs.summary}
                    className="rounded-[26px] border border-border/70 bg-background/80 p-5 shadow-sm"
                  >
                    <div className="mb-5 space-y-2">
                      <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary/80">
                        Summary
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Opening pitch</h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        This is the opening pitch for the selected job, not your permanent master
                        summary.
                      </p>
                    </div>

                    <Textarea
                      value={resumeData.summary || ''}
                      onChange={(e) =>
                        setResumeData((prev) => ({ ...prev, summary: e.target.value }))
                      }
                      placeholder="A brief summary of your professional background and career objectives..."
                      rows={6}
                    />
                  </section>

                  <section
                    ref={sectionRefs.experience}
                    className="rounded-[26px] border border-border/70 bg-background/80 p-5 shadow-sm"
                  >
                    <div className="mb-5 space-y-2">
                      <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary/80">
                        Work History
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">Roles and evidence</h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Keep the strongest examples here for this target role. You can trim or
                        sharpen emphasis without touching master data.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {resumeData.experience.map((exp, index) => (
                        <Card key={index} className="border-border/50 shadow-sm">
                          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base">
                              Work History {index + 1}
                            </CardTitle>
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
                                  onChange={(e) =>
                                    updateExperience(index, 'company', e.target.value)
                                  }
                                  placeholder="Company Name"
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label>Title</Label>
                                <Input
                                  value={exp.title}
                                  onChange={(e) =>
                                    updateExperience(index, 'title', e.target.value)
                                  }
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
                                  onChange={(e) =>
                                    updateExperience(index, 'startDate', e.target.value)
                                  }
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label>End Date</Label>
                                <Input
                                  type="date"
                                  value={exp.endDate}
                                  onChange={(e) =>
                                    updateExperience(index, 'endDate', e.target.value)
                                  }
                                />
                              </div>
                            </div>
                            <div className="grid gap-2">
                              <Label>Description</Label>
                              <Textarea
                                value={exp.description}
                                onChange={(e) =>
                                  updateExperience(index, 'description', e.target.value)
                                }
                                placeholder="Describe your responsibilities and achievements..."
                                rows={3}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      <Button
                        variant="outline"
                        onClick={addExperience}
                        className="w-full gap-2 border-dashed border-border hover:bg-secondary/50"
                      >
                        <Plus className="h-4 w-4" />
                        Add Work History
                      </Button>
                    </div>
                  </section>

                  <section
                    ref={sectionRefs.skills}
                    className="rounded-[26px] border border-border/70 bg-background/80 p-5 shadow-sm"
                  >
                    <div className="mb-5 space-y-2">
                      <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary/80">
                        Skills
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Skill list for this draft
                      </h3>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Keep only the skills you want visible on this version of the resume.
                      </p>
                    </div>

                    <Textarea
                      value={Array.isArray(resumeData.skills) ? resumeData.skills.join(', ') : ''}
                      onChange={(e) =>
                        setResumeData((prev) => ({
                          ...prev,
                          skills: e.target.value
                            .split(',')
                            .map((skill) => skill.trim())
                            .filter(Boolean),
                        }))
                      }
                      placeholder="TypeScript, React, Node.js, PostgreSQL..."
                      rows={4}
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Separate skills with commas
                    </p>
                  </section>
                </div>
              </div>
            </div>

            <aside className="border-t border-border/70 bg-muted/10 xl:border-t-0">
              <div className="p-5 lg:p-6">
                <div className="sticky top-0 space-y-4">
                  <div className="rounded-[24px] border border-border/70 bg-background/80 p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary/80">
                          Live Preview
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                          What the current draft looks like
                        </h3>
                        <p className="text-sm leading-6 text-muted-foreground">
                          This is the same draft you are editing on the left, shown in its export
                          layout.
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        onClick={updatePreview}
                        className="gap-2 rounded-full"
                        aria-label="Refresh Preview"
                      >
                        <ArrowRight className="h-4 w-4" />
                        Refresh Preview
                      </Button>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
                    {memoizedPreview}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
}
