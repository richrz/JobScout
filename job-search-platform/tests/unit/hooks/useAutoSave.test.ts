/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from '../../../src/hooks/useAutoSave';
import { jest, describe, test, expect } from '@jest/globals';

jest.useFakeTimers();

describe('useAutoSave', () => {
  test('calls saveCallback after delay', () => {
    const callback = jest.fn();
    renderHook(() => useAutoSave({}, callback, 1000));

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalled();
  });

  test('resets timer on value change', () => {
    const callback = jest.fn();
    const { rerender } = renderHook(({ val }) => useAutoSave(val, callback, 1000), {
      initialProps: { val: 'initial' }
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    rerender({ val: 'updated' });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalled();
  });
});
