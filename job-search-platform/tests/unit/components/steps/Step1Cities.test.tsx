/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Step1Cities } from '../../../../src/components/onboarding/steps/Step1Cities';
import { useForm, FormProvider } from 'react-hook-form';
import '@testing-library/jest-dom';

// Mock Wrapper to provide FormContext
const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm();
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('Step1Cities', () => {
  test('renders city input field', () => {
    render(
      <Wrapper>
        <Step1Cities />
      </Wrapper>
    );
    expect(screen.getByLabelText(/City Name/i)).toBeInTheDocument();
  });
});
