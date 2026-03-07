'use client';

export function JobsFilterSidebar() {
    return (
        <aside className="lg:col-span-1 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="font-bold text-lg">Filters</h3>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
                <p className="text-sm font-medium text-foreground">
                    Structured filters are being tightened up.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    Use keyword search and sort for now while work-mode, salary,
                    and experience filters are rebuilt on normalized job data.
                </p>
                <div className="text-xs text-muted-foreground space-y-2 pt-2">
                    <p>Use search for titles, companies, skills, and keywords.</p>
                    <p>Use sorting to surface newest jobs or strongest matches.</p>
                </div>
            </div>
        </aside>
    );
}
