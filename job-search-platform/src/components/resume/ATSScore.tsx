"use client";

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, AlertTriangle, CheckCircle, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface ATSScoreProps {
    resumeText: string;
    jobDescription: string;
    jobId?: string;
}

interface AnalysisResult {
    score: number;
    missingKeywords: string[];
    matchedKeywords: string[];
}

export function ATSScore({ resumeText, jobDescription, jobId }: ATSScoreProps) {
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/resume/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeText, jobDescription, jobId }),
            });
            const data = await response.json();
            if (data.success) {
                setResult(data.data);
            } else {
                setError(data.error || 'Analysis failed');
            }
        } catch (err) {
            setError('Failed to connect to analysis service');
        } finally {
            setLoading(false);
        }
    };

    if (!result && !loading) {
        return (
            <GlassCard className="p-0 overflow-hidden">
                <EmptyState
                    icon={Sparkles}
                    title="ATS Compatibility Check"
                    description="See how well your resume matches this job description before applying."
                    action={{
                        label: "Run Analysis",
                        onClick: handleAnalyze
                    }}
                    className="border-0 bg-transparent py-10"
                />
                {error && <p className="text-xs text-red-500 text-center pb-4">{error}</p>}
            </GlassCard>
        );
    }

    if (loading) {
        return (
            <GlassCard className="p-12 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                <p className="text-sm font-medium animate-pulse">Analyzing Keywords & Semantics...</p>
            </GlassCard>
        );
    }

    if (!result) return null;

    const scoreColor = result.score >= 75 ? 'text-emerald-500' : result.score >= 50 ? 'text-amber-500' : 'text-rose-500';
    const ringColor = result.score >= 75 ? 'stroke-emerald-500' : result.score >= 50 ? 'stroke-amber-500' : 'stroke-rose-500';

    return (
        <GlassCard className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    ATS Score
                </h3>
                <Button variant="ghost" size="sm" onClick={handleAnalyze} className="h-8 w-8 p-0">
                    <RefreshCcw className="w-4 h-4" />
                </Button>
            </div>

            <div className="flex items-center gap-6">
                {/* Radial Progress */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-slate-800" />
                        <motion.circle
                            initial={{ strokeDasharray: "251 251", strokeDashoffset: 251 }}
                            animate={{ strokeDashoffset: 251 - (251 * result.score) / 100 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            cx="48" cy="48" r="40"
                            stroke="currentColor" strokeWidth="8" fill="transparent"
                            className={`${ringColor} drop-shadow-lg`}
                            strokeLinecap="round"
                        />
                    </svg>
                    <span className={`absolute text-2xl font-bold ${scoreColor}`}>
                        {result.score}%
                    </span>
                </div>

                <div className="flex-1 space-y-1">
                    <p className="font-medium text-sm">
                        {result.score >= 75 ? 'Excellent Match!' : result.score >= 50 ? 'Good Potential' : 'Needs Optimization'}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {result.score >= 75
                            ? "Your resume contains most key terms and concepts."
                            : "Consider adding the missing keywords below to improve visibility."}
                    </p>
                </div>
            </div>

            {/* Keyword Gaps */}
            {result.missingKeywords.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-white/10">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-amber-500" /> Missing Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {result.missingKeywords.map(keyword => (
                            <Badge key={keyword} variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                {keyword}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* Matched Keywords (Collapsible or small preview) */}
            <div className="space-y-3 pt-4 border-t border-white/10">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-emerald-500" /> Matched
                </h4>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-hidden mask-gradient-b">
                    {result.matchedKeywords.map(keyword => (
                        <Badge key={keyword} variant="secondary" className="text-xs font-normal opacity-75">
                            {keyword}
                        </Badge>
                    ))}
                </div>
            </div>
        </GlassCard>
    );
}
