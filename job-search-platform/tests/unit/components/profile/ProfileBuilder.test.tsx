/**
 * @jest-environment jsdom
 */
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ProfileBuilder } from '../../../../src/components/profile/ProfileBuilder';
import '@testing-library/jest-dom';

global.fetch = jest.fn() as jest.Mock;
const mockFetch = global.fetch as jest.Mock;

function mockProfileResponse(overrides: Record<string, unknown> = {}) {
  mockFetch.mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        contactInfo: {},
        workHistory: [],
        education: [],
        experiences: [],
        educations: [],
        skills: [],
        projects: [],
        certifications: [],
        ...overrides,
      }),
    }),
  );
}

// Mock useAutoSave hook
jest.mock('@/hooks/useAutoSave', () => ({
  useAutoSave: jest.fn(),
}));

describe('ProfileBuilder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockProfileResponse();
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

  test('shows split contact fields and formats a saved phone number', async () => {
    mockProfileResponse({
      contactInfo: {
        name: 'richard ruiz',
        phone: '9497434975',
      },
    });

    render(<ProfileBuilder />);

    expect(await screen.findByLabelText('First Name')).toHaveValue('Richard');
    expect(screen.getByLabelText('Last Name')).toHaveValue('Ruiz');
    expect(screen.getByLabelText('Phone')).toHaveValue('(949) 743-4975');
  });

  test('explains what skill refresh is using and shows the clearer action label', async () => {
    render(<ProfileBuilder />);

    fireEvent.click(await screen.findByRole('button', { name: 'Skills' }));

    expect(await screen.findByText(/Uses your saved work history, education, projects, and current skills/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Refresh suggestions/i })).toBeInTheDocument();
  });
});
