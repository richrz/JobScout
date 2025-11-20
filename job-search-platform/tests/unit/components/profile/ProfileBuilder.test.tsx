/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProfileBuilder } from '../../../../src/components/profile/ProfileBuilder';
import '@testing-library/jest-dom';

describe('ProfileBuilder', () => {
  test('renders section navigation tabs', () => {
    render(<ProfileBuilder />);
    expect(screen.getByRole('button', { name: 'Contact Information' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Work History' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Education' })).toBeInTheDocument();
  });
});
