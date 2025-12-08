'use client';

import { ConfigWizard } from '@/components/onboarding/ConfigWizard';
import { ConfigProvider } from '@/contexts/ConfigContext';

export default function OnboardingPage() {
    return (
        <ConfigProvider>
            <div className="container mx-auto py-10">
                <h1 className="text-3xl font-bold text-center mb-2">Job Search Configuration</h1>
                <p className="text-center text-muted-foreground mb-8">
                    Let's set up your preferences to find the perfect job matches.
                </p>
                <ConfigWizard />
            </div>
        </ConfigProvider>
    );
}
