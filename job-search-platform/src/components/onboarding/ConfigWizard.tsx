import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { configSchema } from '@/lib/validations/config';

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
  const form = useForm({
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

  return (
    <div>
      <h1>{steps[currentStep - 1].title}</h1>
      {/* Form content will go here */}
    </div>
  );
}
