/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfigActions } from '../../../src/components/onboarding/ConfigActions';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

describe('ConfigActions', () => {
  const mockOnExport = jest.fn();
  const mockOnImport = jest.fn();
  const originalCreateObjectURL = URL.createObjectURL;

  beforeEach(() => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: jest.fn(() => 'blob:mock-url'),
    });
  });

  afterEach(() => {
    if (originalCreateObjectURL) {
      Object.defineProperty(URL, 'createObjectURL', {
        configurable: true,
        writable: true,
        value: originalCreateObjectURL,
      });
      return;
    }

    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      writable: true,
      value: undefined,
    });
  });

  test('renders export and import buttons', () => {
    render(<ConfigActions onExport={mockOnExport} onImport={mockOnImport} />);
    expect(screen.getByText(/Export Configuration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Import Configuration/i)).toBeInTheDocument();
  });

  test('calls onExport when export button is clicked', () => {
    render(<ConfigActions onExport={mockOnExport} onImport={mockOnImport} />);
    fireEvent.click(screen.getByText(/Export Configuration/i));
    expect(mockOnExport).toHaveBeenCalled();
  });
});
