'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function JobSortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'newest';

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const params = new URLSearchParams(searchParams);

    if (newSort === 'newest') {
      params.delete('sort');
    } else {
      params.set('sort', newSort);
    }

    // Reset to page 1 when sorting changes
    params.delete('page');

    const queryString = params.toString();
    router.push(`/jobs${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
      <select
        value={currentSort}
        onChange={handleSortChange}
        className="appearance-none bg-card border-none text-foreground text-sm font-bold rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-secondary transition-colors shadow-sm"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="match-best">Best Match</option>
        <option value="match-worst">Lowest Match</option>
        <option value="company">Company (A-Z)</option>
        <option value="title">Job Title (A-Z)</option>
      </select>
    </div>
  );
}
