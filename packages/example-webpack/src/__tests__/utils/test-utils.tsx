import React, { ReactElement, ReactNode, Suspense } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from '../../components/ErrorBoundary';

/**
 * Custom render options
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  withErrorBoundary?: boolean;
  withSuspense?: boolean;
  suspenseFallback?: ReactNode;
}

/**
 * Custom render function with common wrappers
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    withErrorBoundary = false,
    withSuspense = false,
    suspenseFallback = <div>Loading...</div>,
    ...renderOptions
  }: CustomRenderOptions = {}
): RenderResult {
  let Wrapper = ({ children }: { children: ReactNode }) => <>{children}</>;

  if (withErrorBoundary && withSuspense) {
    Wrapper = ({ children }: { children: ReactNode }) => (
      <ErrorBoundary>
        <Suspense fallback={suspenseFallback}>{children}</Suspense>
      </ErrorBoundary>
    );
  } else if (withErrorBoundary) {
    Wrapper = ({ children }: { children: ReactNode }) => (
      <ErrorBoundary>{children}</ErrorBoundary>
    );
  } else if (withSuspense) {
    Wrapper = ({ children }: { children: ReactNode }) => (
      <Suspense fallback={suspenseFallback}>{children}</Suspense>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Setup user event for interactions
 */
export function setupUser() {
  return userEvent.setup();
}

/**
 * Helper to wait for async updates
 */
export const waitForAsync = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Helper to create mock server URL
 */
export const getMockServerUrl = () => 'http://localhost:3000';

/**
 * Helper to mock successful gRPC response
 */
export const mockSuccessResponse = (name: string) => ({
  reply: `Hello, ${name}!`,
  timestamp: new Date().toISOString(),
  metadata: {
    server_version: '1.0.0',
    request_id: 'test-request-id',
  },
});

/**
 * Helper to mock gRPC error
 */
export const mockErrorResponse = (message: string, code = 'UNKNOWN') => {
  const error = new Error(message) as any;
  error.code = code;
  return error;
};

/**
 * Helper to mock streaming responses
 */
export const mockStreamResponse = (count: number, baseName: string) => {
  return Array.from({ length: count }, (_, i) => ({
    reply: `${baseName} ${i + 1}`,
    timestamp: new Date().toISOString(),
    metadata: {
      server_version: '1.0.0',
      request_id: `test-request-${i}`,
    },
  }));
};

/**
 * Helper to find element by text content
 */
export const findByTextContent = (text: string) => {
  return (content: string, element: Element | null) => {
    const hasText = (node: Element | null) =>
      node?.textContent === text || node?.textContent?.includes(text);
    const elementHasText = hasText(element);
    const childrenDontHaveText = Array.from(element?.children || []).every(
      (child) => !hasText(child as Element)
    );
    return elementHasText && childrenDontHaveText;
  };
};

/**
 * Helper to create test ID selector
 */
export const testId = (id: string) => `[data-testid="${id}"]`;

/**
 * Helper to mock console methods
 */
export const mockConsole = () => {
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
  };

  const mocks = {
    log: jest.spyOn(console, 'log').mockImplementation(),
    warn: jest.spyOn(console, 'warn').mockImplementation(),
    error: jest.spyOn(console, 'error').mockImplementation(),
  };

  return {
    restore: () => {
      console.log = originalConsole.log;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
    },
    mocks,
  };
};

/**
 * Helper to advance timers
 */
export const advanceTimers = async (ms: number) => {
  jest.advanceTimersByTime(ms);
  await waitForAsync();
};

/**
 * Re-export testing library utilities
 */
export * from '@testing-library/react';
export { userEvent };
