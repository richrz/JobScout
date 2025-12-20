'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useConfig } from '@/contexts/ConfigContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Save, Send, FileText, Loader2, Check } from 'lucide-react';
import { ATSScore } from '@/components/resume/ATSScore';
import { Textarea } from '@/components/ui/textarea';
import { applyToJob } from '@/app/actions/application';

interface SerializedJob {
    id: string;
    title: string;
    company: string;
    description: string;
    location: string | null;
    salary: string | null;
    postedAt: string;
    createdAt: string;
    source: string;
    sourceUrl: string;
    compositeScore: number | null;
    latitude: number | null;
    longitude: number | null;
}

interface JobDetailClientProps {
    job: SerializedJob;
}

export function JobDetailClient({ job }: JobDetailClientProps) {
    const { config } = useConfig();
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedResume, setGeneratedResume] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [exaggerationLevel, setExaggerationLevel] = useState<'conservative' | 'balanced' | 'strategic'>('balanced');
    const [isApplying, setIsApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    
    // State for ATS Analysis
    const [resumeText, setResumeText] = useState('');
    const [showATS, setShowATS] = useState(false);

    const handleApply = async () => {
        setIsApplying(true);
        try {
            const result = await applyToJob(job.id);
            if (result.success) {
                setHasApplied(true);
            } else {
                setError(result.error || 'Failed to apply');
            }
        } catch (_) {
            setError('Failed to apply');
        } finally {
            setIsApplying(false);
        }
    };

    const handleGenerateResume = async () => {
        setIsGenerating(true);
        setError(null);
        setGeneratedResume(null);

        try {
            const response = await fetch('/api/resume/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId: job.id,
                    exaggerationLevel,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setGeneratedResume(result.content);
                // Pre-fill ATS analyzer with generated resume
                setResumeText(result.content);
                setShowATS(true);
            } else {
                setError(result.error || 'Failed to generate resume');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-4">
            <Button 
                size="lg" 
                className="w-full gap-2 shadow-lg shadow-primary/25"
                onClick={handleApply}
                disabled={isApplying || hasApplied}
            >
                {isApplying ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Applying...</>
                ) : hasApplied ? (
                    <><Check className="w-4 h-4" /> Applied</>
                ) : (
                    <><Send className="w-4 h-4" /> Apply Now</>
                )}
            </Button>
            <Button size="lg" variant="outline" className="w-full gap-2">
                <Save className="w-4 h-4" /> Save Job
            </Button>

            <div className="border-t border-white/10 my-4 pt-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" /> AI Resume Tailor
                </h4>
                
                <div className="space-y-3">
                    <Select value={exaggerationLevel} onValueChange={(val: any) => setExaggerationLevel(val)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Strategy" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="conservative">Conservative</SelectItem>
                            <SelectItem value="balanced">Balanced</SelectItem>
                            <SelectItem value="strategic">Strategic</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        size="lg"
                        variant="secondary"
                        className="w-full bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20"
                        onClick={handleGenerateResume}
                        disabled={isGenerating}
                    >
                        {isGenerating ? 'Tailoring...' : 'Generate Tailored CV'}
                    </Button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded text-sm">
                    {error}
                </div>
            )}

            {/* Generated Resume Display */}
            {generatedResume && (
                <div className="mt-4 animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Preview</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => navigator.clipboard.writeText(generatedResume)}
                        >
                            Copy
                        </Button>
                    </div>
                    <div className="bg-slate-950 rounded-lg border border-white/10 p-3 max-h-[200px] overflow-y-auto text-xs font-mono text-slate-300 scrollbar-thin scrollbar-thumb-white/10">
                        {generatedResume}
                    </div>
                </div>
            )}

            {/* ATS Analysis Toggle/Section */}
            <div className="border-t border-white/10 my-4 pt-4">
                <Button 
                    variant="ghost" 
                    className="w-full justify-between"
                    onClick={() => setShowATS(!showATS)}
                >
                    <span className="flex items-center gap-2 text-sm font-medium">
                        <FileText className="w-4 h-4 text-emerald-400" /> ATS Analyzer
                    </span>
                    <span className="text-xs text-muted-foreground">{showATS ? 'Hide' : 'Show'}</span>
                </Button>

                {showATS && (
                    <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                        {!resumeText && (
                            <Textarea 
                                placeholder="Paste your resume content here to analyze..."
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                className="text-xs font-mono min-h-[100px] bg-slate-950/50"
                            />
                        )}
                        
                        {resumeText && (
                            <ATSScore 
                                resumeText={resumeText} 
                                jobDescription={job.description} 
                                jobId={job.id} 
                            />
                        )}
                    </div>
                )}
            </div>

            {/* LLM Configuration Notice */}
            {!config?.llm?.apiKey && (
                <p className="text-xs text-muted-foreground text-center">
                    Requires API Key. <a href="/settings" className="underline hover:text-primary">Configure</a>
                </p>
            )}
        </div>
    );
}
