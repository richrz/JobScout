'use client';

import { ProfileBuilder } from '@/components/profile/ProfileBuilder';

export default function ProfilePage() {
    return (
        <div className="h-[calc(100vh-4rem)]">
            {/* ProfileBuilder takes up full height minus header */}
            <ProfileBuilder />
        </div>
    );
}
