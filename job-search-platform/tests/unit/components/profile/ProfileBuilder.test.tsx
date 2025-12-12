/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ProfileBuilder } from '../../../../src/components/profile/ProfileBuilder';
import '@testing-library/jest-dom';

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      contactInfo: {},
      workHistory: [],
      education: [],
      skills: [],
      projects: [],
      certifications: []
    }),
  })
) as jest.Mock;

// Mock useAutoSave hook
jest.mock('@/hooks/useAutoSave', () => ({
  useAutoSave: jest.fn(),
}));

describe('ProfileBuilder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders section navigation tabs', async () => {
    render(<ProfileBuilder />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Contact Information' })).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Work History' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Education' })).toBeInTheDocument();
  });

  test('displays save status', async () => {
    render(<ProfileBuilder />);

    await waitFor(() => {
      expect(screen.getByText(/Saved/i)).toBeInTheDocument();
    });
  });
});
