/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Step5Salary } from '../../../../src/components/onboarding/steps/Step5Salary';
import { useForm, FormProvider } from 'react-hook-form';
import '@testing-library/jest-dom';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    defaultValues: { salary_usd: { min: 0, max: 0 } }
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('Step5Salary', () => {
  test('renders min and max salary inputs', () => {
    render(
      <Wrapper>
        <Step5Salary />
      </Wrapper>
    );
    expect(screen.getByLabelText(/Minimum Salary/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Maximum Salary/i)).toBeInTheDocument();
  });
});
