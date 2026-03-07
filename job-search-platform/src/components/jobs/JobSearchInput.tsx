'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface JobSearchInputProps {
    initialQuery?: string;
}

export function JobSearchInput({ initialQuery = '' }: JobSearchInputProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(initialQuery);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const pushSearch = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value.trim()) {
            params.set('q', value.trim());
        } else {
            params.delete('q');
        }
        params.delete('page'); // reset to page 1
        const qs = params.toString();
        router.push(`/jobs${qs ? `?${qs}` : ''}`);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => pushSearch(value), 400);
    };

    const handleClear = () => {
        setQuery('');
        pushSearch('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            pushSearch(query);
        }
    };

    return (
        <div className="relative group flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
                type="text"
                value={query}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Search jobs, companies..."
                className="w-full bg-card border border-border rounded-xl py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
            {query && (
                <button
                    onClick={handleClear}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}
