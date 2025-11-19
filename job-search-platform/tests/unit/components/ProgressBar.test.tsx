/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '../../../src/components/ui/ProgressBar';
import '@testing-library/jest-dom';

describe('ProgressBar', () => {
  test('renders correctly', () => {
    render(<ProgressBar progress={50} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
  });

  test('displays correct width', () => {
    render(<ProgressBar progress={75} />);
    const indicator = screen.getByTestId('progress-indicator');
    expect(indicator).toHaveStyle({ width: '75%' });
  });
});
