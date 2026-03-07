'use client';

import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface PipelineHeaderProps {
    interviewCount: number;
}

export function PipelineHeader({ interviewCount }: PipelineHeaderProps) {
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [company, setCompany] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim() && !title.trim()) {
            setError('Please enter at least a job URL or title.');
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/pipeline/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: url.trim(), title: title.trim(), company: company.trim() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to add application');
            setOpen(false);
            setUrl(''); setTitle(''); setCompany('');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex flex-col gap-2">
                <h1 className="text-foreground text-3xl font-bold leading-tight tracking-tight">My Application Pipeline</h1>
                <p className="text-muted-foreground text-base font-normal leading-normal">
                    {interviewCount > 0 ? (
                        <>You have <span className="text-primary font-medium">{interviewCount} interview{interviewCount > 1 ? 's' : ''}</span> coming up this week.</>
                    ) : (
                        <>Track your job applications across all stages.</>
                    )}
                </p>
            </div>
            <Button
                onClick={() => setOpen(true)}
                className="flex items-center justify-center gap-2 rounded-full h-12 px-6 bg-primary text-primary-foreground text-sm font-bold shadow-[0_0_15px_rgba(53,227,117,0.3)] hover:shadow-[0_0_20px_rgba(53,227,117,0.5)] transition-shadow"
            >
                <Plus className="w-5 h-5" />
                <span>Add Application</span>
            </Button>

            {/* Modal */}
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
                    <div
                        className="bg-card border border-border rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-bold text-foreground mb-1">Add Application</h2>
                        <p className="text-sm text-muted-foreground mb-6">Manually track a job you applied to.</p>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Job URL</label>
                                <input
                                    type="url"
                                    placeholder="https://jobs.example.com/..."
                                    value={url}
                                    onChange={e => setUrl(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Job Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Senior Software Engineer"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">Company</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Acme Corp"
                                    value={company}
                                    onChange={e => setCompany(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                                />
                            </div>

                            {error && (
                                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">{error}</p>
                            )}

                            <div className="flex gap-3 mt-2">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
                                <Button type="submit" className="flex-1" disabled={loading}>
                                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding...</> : 'Add to Pipeline'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
