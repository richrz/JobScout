import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { configSchema } from '@/lib/validations/config';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Step1Cities } from '@/components/onboarding/steps/Step1Cities';
import { Step2Titles } from '@/components/onboarding/steps/Step2Titles';
import { Step3Include } from '@/components/onboarding/steps/Step3Include';
import { Step4Exclude } from '@/components/onboarding/steps/Step4Exclude';
import { Step5Salary } from '@/components/onboarding/steps/Step5Salary';
import { Step6Freshness } from '@/components/onboarding/steps/Step6Freshness';
import { ConfigActions } from '@/components/onboarding/ConfigActions';
import { useConfig } from '@/contexts/ConfigContext';
import { useRouter } from 'next/navigation';

const steps = [
  { id: 1, title: 'Target Cities' },
  { id: 2, title: 'Job Titles' },
  { id: 3, title: 'Include Keywords' },
  { id: 4, title: 'Exclude Keywords' },
  { id: 5, title: 'Salary Range' },
  { id: 6, title: 'Job Freshness' }
];

export function ConfigWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const methods = useForm({
    resolver: zodResolver(configSchema),
    defaultValues: {
      cities: [],
      categories: [],
      include_keywords: [],
      exclude_keywords: [],
      salary_usd: { min: 0, max: 0 },
      posted_within_hours: 24
    }
  });

  const { updateConfig } = useConfig();
  const router = useRouter();

  const progress = (currentStep / steps.length) * 100;

  const handleExport = () => {
    const data = methods.getValues();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'job-search-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (data: any) => {
    try {
      // Validate imported data against schema
      // Note: We might need to transform data if the export structure differs from form structure
      // For now assuming export matches form structure exactly.
      const validData = configSchema.parse(data);
      methods.reset(validData);
      alert('Configuration imported successfully!');
    } catch (error) {
      console.error('Import validation failed:', error);
      alert('Failed to import configuration: Invalid format.');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const searchConfig = {
        cities: data.cities,
        categories: data.categories || [],
        keywords: data.include_keywords || [],
        excludeKeywords: data.exclude_keywords || [],
        minSalary: data.salary_usd?.min,
        maxSalary: data.salary_usd?.max,
        recencyDays: data.posted_within_hours ? data.posted_within_hours / 24 : 30,
      };

      await updateConfig({ search: searchConfig as any });
      alert('Configuration saved!');
      router.push('/');
    } catch (error) {
      console.error('Failed to save config:', error);
      alert('Failed to save configuration');
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{steps[currentStep - 1].title}</h1>
          <ProgressBar progress={progress} />
        </div>

        <div className="min-h-[300px] border p-6 rounded-lg bg-white shadow-sm">
          {currentStep === 1 && <Step1Cities />}
          {currentStep === 2 && <Step2Titles />}
          {currentStep === 3 && <Step3Include />}
          {currentStep === 4 && <Step4Exclude />}
          {currentStep === 5 && <Step5Salary />}
          {currentStep === 6 && <Step6Freshness />}
        </div>

        <div className="flex justify-between items-center">
          <div className="space-x-4">
            <button
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            {currentStep < steps.length ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                onClick={methods.handleSubmit(onSubmit)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Finish & Save
              </button>
            )}
          </div>

          <ConfigActions onExport={handleExport} onImport={handleImport} />
        </div>
      </div>
    </FormProvider>
  );
}
