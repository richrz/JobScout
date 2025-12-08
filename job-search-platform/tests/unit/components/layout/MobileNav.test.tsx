/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MobileNav } from '@/components/layout/MobileNav';

// Mock Next.js router
jest.mock('next/navigation', () => ({
    usePathname: () => '/',
}));

describe('MobileNav', () => {
    it('renders navigation items', () => {
        render(<MobileNav />);

        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
        expect(screen.getByText(/Jobs/i)).toBeInTheDocument();
        expect(screen.getByText(/Pipeline/i)).toBeInTheDocument();
        expect(screen.getByText(/Settings/i)).toBeInTheDocument();
    });

    it('has touch-friendly tap targets (min 44px)', () => {
        const { container } = render(<MobileNav />);

        const navLinks = container.querySelectorAll('a');
        navLinks.forEach((link) => {
            // Check that link has min-h-[44px] and min-w-[44px] classes
            expect(link.className).toContain('min-h-[44px]');
            expect(link.className).toContain('min-w-[44px]');
        });
    });

    it('is fixed at bottom on mobile', () => {
        const { container } = render(<MobileNav />);

        const nav = container.querySelector('nav');
        expect(nav).toHaveClass('fixed');
        expect(nav).toHaveClass('bottom-0');
    });
});
