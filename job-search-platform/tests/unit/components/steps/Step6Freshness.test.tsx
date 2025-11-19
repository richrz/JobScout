/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Step6Freshness } from '../../../../src/components/onboarding/steps/Step6Freshness';
import { useForm, FormProvider } from 'react-hook-form';
import '@testing-library/jest-dom';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    defaultValues: { posted_within_hours: 24 }
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('Step6Freshness', () => {
  test('renders freshness selection', () => {
    render(
      <Wrapper>
        <Step6Freshness />
      </Wrapper>
    );
    expect(screen.getByText(/Last 24 Hours/i)).toBeInTheDocument();
  });
});
