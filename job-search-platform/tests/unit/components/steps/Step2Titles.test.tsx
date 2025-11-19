/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Step2Titles } from '../../../../src/components/onboarding/steps/Step2Titles';
import { useForm, FormProvider } from 'react-hook-form';
import '@testing-library/jest-dom';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    defaultValues: { categories: [] }
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('Step2Titles', () => {
  test('renders input field for job titles', () => {
    render(
      <Wrapper>
        <Step2Titles />
      </Wrapper>
    );
    expect(screen.getByPlaceholderText(/Add a job title/i)).toBeInTheDocument();
  });
});
