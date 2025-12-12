'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useConfig } from '@/contexts/ConfigContext';

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
        <div className="mt-8 pt-6 border-t space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
                <Button size="lg">Apply Now</Button>
                <Button size="lg" variant="outline">Save Job</Button>

                {/* Resume Generation Section */}
                <div className="flex items-center gap-2">
                    <select
                        value={exaggerationLevel}
                        onChange={(e) => setExaggerationLevel(e.target.value as typeof exaggerationLevel)}
                        className="border rounded px-3 py-2 text-sm"
                    >
                        <option value="conservative">Conservative</option>
                        <option value="balanced">Balanced</option>
                        <option value="strategic">Strategic</option>
                    </select>
                    <Button
                        size="lg"
                        variant="secondary"
                        onClick={handleGenerateResume}
                        disabled={isGenerating}
                    >
                        {isGenerating ? '⏳ Generating...' : '✨ Generate Resume'}
                    </Button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Generated Resume Display */}
            {generatedResume && (
                <div className="bg-muted rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Generated Resume</h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigator.clipboard.writeText(generatedResume)}
                        >
                            📋 Copy
                        </Button>
                    </div>
                    <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap font-mono text-sm bg-background p-4 rounded border">
                        {generatedResume}
                    </div>
                </div>
            )}

            {/* LLM Configuration Notice */}
            {!config?.llm?.apiKey && (
                <p className="text-sm text-muted-foreground">
                    💡 Tip: Configure your LLM API key in <a href="/settings" className="text-primary underline">Settings</a> for resume generation.
                </p>
            )}
        </div>
    );
}
