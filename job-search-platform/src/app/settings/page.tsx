
'use client';

import { SettingsPage } from '@/components/settings/SettingsPage';
import { ConfigProvider } from '@/contexts/ConfigContext';
import { Page } from '@/components/layout/Page';

export default function Settings() {
    return (
        <Page>
            <ConfigProvider>
                <SettingsPage />
            </ConfigProvider>
        </Page>
    );
}
