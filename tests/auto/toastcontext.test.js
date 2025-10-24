import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../../src/contexts/ToastContext';

const wrapper = ({ children }) => <ToastProvider>{children}</ToastProvider>;

test('addToast and removeToast update toasts array', () => {
  const { result } = renderHook(() => useToast(), { wrapper });

  let id;
  act(() => {
    id = result.current.addToast('hello', 'info', 0);
  });

  // After adding, the toasts should include the new message
  expect(result.current.toasts.some(t => t.message === 'hello')).toBe(true);

  act(() => {
    result.current.removeToast(id);
  });

  expect(result.current.toasts.some(t => t.message === 'hello')).toBe(false);
});

test('convenience methods success/error add toasts', () => {
  const { result } = renderHook(() => useToast(), { wrapper });

  act(() => {
    result.current.success('yay', 0);
    result.current.error('uh oh', 0);
  });

  expect(result.current.toasts.some(t => t.message === 'yay')).toBe(true);
  expect(result.current.toasts.some(t => t.message === 'uh oh')).toBe(true);
});
