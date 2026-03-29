/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { TriageCard, type TriageJob } from '@/components/triage/TriageCard';

jest.mock('framer-motion', () => {
  const React = require('react');
  const sanitizeProps = (props: Record<string, unknown>) => {
    const {
      drag,
      dragConstraints,
      onDragStart,
      onDragEnd,
      ...domProps
    } = props;

    return domProps;
  };

  return {
    motion: {
      div: React.forwardRef(({ children, ...props }: any, ref: React.Ref<HTMLDivElement>) => (
        <div ref={ref} {...sanitizeProps(props)}>
          {children}
        </div>
      )),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useMotionValue: () => 0,
    useTransform: () => 0,
  };
});

const job: TriageJob = {
  id: 'job-1',
  title: 'Senior Solutions Engineer',
  company: 'Readable Systems',
  location: 'Denver, Colorado',
  salary: '$140,000',
  description:
    'This is a long description for the role. It should remain readable in the card preview and be fully available inside the detailed scrollable panel when the user asks to read more.',
  postedAt: '2026-03-27T00:00:00.000Z',
  source: 'indeed',
};

describe('TriageCard', () => {
  it('opens a full description panel from the card preview', () => {
    render(<TriageCard job={job} index={0} onSwipe={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /read full description/i }));

    expect(screen.getByRole('dialog', { name: /full job description/i })).toBeInTheDocument();
    expect(screen.getAllByText(job.description)[0]).toBeInTheDocument();
  });

  it('closes the full description panel', () => {
    render(<TriageCard job={job} index={0} onSwipe={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /read full description/i }));
    fireEvent.click(screen.getByRole('button', { name: /close full description/i }));

    expect(screen.queryByRole('dialog', { name: /full job description/i })).not.toBeInTheDocument();
  });
});
