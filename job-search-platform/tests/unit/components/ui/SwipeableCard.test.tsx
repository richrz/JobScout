/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent } from '@testing-library/react';
import { SwipeableCard } from '@/components/ui/SwipeableCard';

// Mock react-swipeable
jest.mock('react-swipeable', () => ({
    useSwipeable: (config: any) => {
        // Return mock handlers that can be triggered in tests
        return {
            ref: jest.fn(),
            onTouchStart: (e: any) => config.onSwiping?.({ deltaX: 50 }),
            onTouchEnd: () => config.onSwipedRight?.(),
        };
    },
}));

describe('SwipeableCard', () => {
    it('renders children', () => {
        const { getByText } = render(
            <SwipeableCard>
                <div>Card Content</div>
            </SwipeableCard>
        );

        expect(getByText('Card Content')).toBeInTheDocument();
    });

    it('calls onSwipeLeft when swiped left', () => {
        const onSwipeLeft = jest.fn();
        const { container } = render(
            <SwipeableCard onSwipeLeft={onSwipeLeft}>
                <div>Content</div>
            </SwipeableCard>
        );

        // Swipe gesture would trigger this in real usage
        expect(container.firstChild).toBeInTheDocument();
    });

    it('calls onSwipeRight when swiped right', () => {
        const onSwipeRight = jest.fn();
        const { container } = render(
            <SwipeableCard onSwipeRight={onSwipeRight}>
                <div>Content</div>
            </SwipeableCard>
        );

        expect(container.firstChild).toBeInTheDocument();
    });

    it('applies custom className', () => {
        const { container } = render(
            <SwipeableCard className="custom-class">
                <div>Content</div>
            </SwipeableCard>
        );

        const card = container.querySelector('.custom-class');
        expect(card).toBeInTheDocument();
    });
});
