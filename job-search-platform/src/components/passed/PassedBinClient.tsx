'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Archive, RotateCcw, Search, CheckSquare } from 'lucide-react';

interface PassedItem {
    id: string;
    jobId: string;
    title: string;
    company: string;
    location: string | null;
    updatedAt: string;
    applicationStatus: string | null;
}

interface PassedBinClientProps {
    items: PassedItem[];
}

export function PassedBinClient({ items }: PassedBinClientProps) {
    const [query, setQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [visibleItems, setVisibleItems] = useState(items);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filteredItems = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) {
            return visibleItems;
        }

        return visibleItems.filter((item) =>
            [item.title, item.company, item.location || '']
                .join(' ')
                .toLowerCase()
                .includes(normalized)
        );
    }, [query, visibleItems]);

    const allFilteredSelected = filteredItems.length > 0 && filteredItems.every((item) => selectedIds.includes(item.id));

    function toggleSelection(id: string) {
        setSelectedIds((current) =>
            current.includes(id)
                ? current.filter((value) => value !== id)
                : [...current, id]
        );
    }

    function toggleSelectAllFiltered() {
        if (allFilteredSelected) {
            setSelectedIds((current) => current.filter((id) => !filteredItems.some((item) => item.id === id)));
            return;
        }

        const merged = new Set([...selectedIds, ...filteredItems.map((item) => item.id)]);
        setSelectedIds(Array.from(merged));
    }

    async function runAction(action: 'RESTORE' | 'ARCHIVE', workspaceIds: string[]) {
        if (workspaceIds.length === 0) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/passed/action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    workspaceIds,
                    action,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to process passed-bin action');
            }

            setVisibleItems((current) => current.filter((item) => !workspaceIds.includes(item.id)));
            setSelectedIds((current) => current.filter((id) => !workspaceIds.includes(id)));
        } catch (error) {
            console.error('Failed to update passed bin', error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search passed opportunities..."
                        className="pl-10"
                    />
                </div>

                {selectedIds.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" onClick={toggleSelectAllFiltered} className="gap-2">
                            <CheckSquare className="h-4 w-4" />
                            {allFilteredSelected ? 'Clear filtered' : 'Select filtered'}
                        </Button>
                        <Button variant="outline" onClick={() => runAction('ARCHIVE', selectedIds)} disabled={isSubmitting} className="gap-2">
                            <Archive className="h-4 w-4" />
                            Archive Selected
                        </Button>
                        <Button onClick={() => runAction('RESTORE', selectedIds)} disabled={isSubmitting} className="gap-2">
                            <RotateCcw className="h-4 w-4" />
                            Restore Selected
                        </Button>
                    </div>
                )}
            </div>

            {filteredItems.length === 0 ? (
                <div className="rounded-3xl border border-border bg-card p-10 text-center">
                    <h2 className="text-xl font-semibold text-foreground">Nothing waiting in Passed Bin</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Passed opportunities will show up here with a restore path instead of disappearing.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <div>
                                        <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground">{item.company}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                        <span>{item.location || 'Remote'}</span>
                                        <span>Passed {new Date(item.updatedAt).toLocaleDateString()}</span>
                                        {item.applicationStatus && (
                                            <span>Restore target: {item.applicationStatus}</span>
                                        )}
                                    </div>
                                </div>

                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(item.id)}
                                    onChange={() => toggleSelection(item.id)}
                                    className="mt-1 h-4 w-4 rounded-md border-border bg-background/50 text-primary focus:ring-primary cursor-pointer shadow-sm"
                                />
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <Button variant="outline" onClick={() => runAction('ARCHIVE', [item.id])} disabled={isSubmitting} className="gap-2">
                                    <Archive className="h-4 w-4" />
                                    Archive
                                </Button>
                                <Button onClick={() => runAction('RESTORE', [item.id])} disabled={isSubmitting} className="gap-2">
                                    <RotateCcw className="h-4 w-4" />
                                    Restore
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
