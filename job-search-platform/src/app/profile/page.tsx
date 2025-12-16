
'use client';

import { ProfileBuilder } from '@/components/profile/ProfileBuilder';
import { Page } from '@/components/layout/Page';

export default function ProfilePage() {
    return (
        <Page width="full" className="h-[calc(100vh-4rem)] p-0 sm:p-0 lg:p-0 py-0 space-y-0">
            {/* ProfileBuilder takes up full height minus header */}
            <ProfileBuilder />
        </Page>
    );
}
