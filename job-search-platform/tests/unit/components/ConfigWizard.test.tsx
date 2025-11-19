/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ConfigWizard } from '../../../src/components/onboarding/ConfigWizard';
import '@testing-library/jest-dom';

describe('ConfigWizard', () => {
  test('renders the first step initially', () => {
    render(<ConfigWizard />);
    expect(screen.getByText('Target Cities')).toBeInTheDocument();
  });
});
