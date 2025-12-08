'use client';

import { SettingsPage } from '@/components/settings/SettingsPage';
import { ConfigProvider } from '@/contexts/ConfigContext';

export default function Settings() {
    return (
        <ConfigProvider>
            <SettingsPage />
        </ConfigProvider>
    );
}
