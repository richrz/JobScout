/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Step3Include } from '../../../../src/components/onboarding/steps/Step3Include';
import { useForm, FormProvider } from 'react-hook-form';
import '@testing-library/jest-dom';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({
    defaultValues: { include_keywords: [] }
  });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('Step3Include', () => {
  test('renders input field for keywords', () => {
    render(
      <Wrapper>
        <Step3Include />
      </Wrapper>
    );
    expect(screen.getByPlaceholderText(/Add a keyword/i)).toBeInTheDocument();
  });
});
