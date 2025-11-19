/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Step4Exclude } from '../../../../src/components/onboarding/steps/Step4Exclude';
import { useForm, FormProvider } from 'react-hook-form';
import '@testing-library/jest-dom';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    defaultValues: { exclude_keywords: [] }
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('Step4Exclude', () => {
  test('renders input field for excluded keywords', () => {
    render(
      <Wrapper>
        <Step4Exclude />
      </Wrapper>
    );
    expect(screen.getByPlaceholderText(/Add a keyword to exclude/i)).toBeInTheDocument();
  });
});
