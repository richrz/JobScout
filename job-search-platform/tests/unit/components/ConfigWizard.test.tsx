/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ConfigWizard } from '../../../src/components/onboarding/ConfigWizard';
import '@testing-library/jest-dom';

// Mock useConfig
jest.mock('../../../src/contexts/ConfigContext', () => ({
  useConfig: () => ({
    config: null,
    updateConfig: jest.fn(),
    reloadConfig: jest.fn(),
    isLoading: false,
    error: null
  })
}));

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  })
}));

describe('ConfigWizard', () => {
  test('renders the first step initially', () => {
    render(<ConfigWizard />);
    expect(screen.getByText('Target Cities')).toBeInTheDocument();
  });
});
