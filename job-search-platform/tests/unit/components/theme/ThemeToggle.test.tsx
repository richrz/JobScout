/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useTheme } from 'next-themes';

// Mock next-themes
jest.mock('next-themes', () => ({
    useTheme: jest.fn(),
}));

describe('ThemeToggle', () => {
    const mockSetTheme = jest.fn();

    beforeEach(() => {
        mockSetTheme.mockClear();
        (useTheme as jest.Mock).mockReturnValue({
            theme: 'light',
            setTheme: mockSetTheme,
        });
    });

    it('renders toggle button', () => {
        render(<ThemeToggle />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('toggles to dark mode when clicked if currently light', () => {
        (useTheme as jest.Mock).mockReturnValue({
            theme: 'light',
            setTheme: mockSetTheme,
        });

        render(<ThemeToggle />);
        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(mockSetTheme).toHaveBeenCalledWith('dark');
    });

    it('toggles to light mode when clicked if currently dark', () => {
        (useTheme as jest.Mock).mockReturnValue({
            theme: 'dark',
            setTheme: mockSetTheme,
        });

        render(<ThemeToggle />);
        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(mockSetTheme).toHaveBeenCalledWith('light');
    });
});
