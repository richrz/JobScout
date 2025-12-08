'use client';

import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Card } from '@/components/ui/card';

interface SwipeableCardProps {
    children: React.ReactNode;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    className?: string;
}

export function SwipeableCard({
    children,
    onSwipeLeft,
    onSwipeRight,
    className = ''
}: SwipeableCardProps) {
    const [swipeOffset, setSwipeOffset] = useState(0);

    const handlers = useSwipeable({
        onSwiping: (eventData) => {
            // Update visual feedback during swipe
            setSwipeOffset(eventData.deltaX);
        },
        onSwipedLeft: () => {
            setSwipeOffset(0);
            onSwipeLeft?.();
        },
        onSwipedRight: () => {
            setSwipeOffset(0);
            onSwipeRight?.();
        },
        onSwiped: () => {
            // Reset offset when swipe ends
            setSwipeOffset(0);
        },
        trackMouse: true,
        trackTouch: true,
    });

    return (
        <div {...handlers} className="touch-pan-y">
            <Card
                className={`transition-transform ${className}`}
                style={{
                    transform: `translateX(${swipeOffset}px)`,
                }}
            >
                {children}
            </Card>
        </div>
    );
}
