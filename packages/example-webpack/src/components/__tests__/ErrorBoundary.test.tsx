import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, setupUser, mockConsole } from '../../__tests__/utils/test-utils';
import ErrorBoundary from '../ErrorBoundary';

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow: boolean; message?: string }> = ({
  shouldThrow,
  message = 'Test error',
}) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  let consoleMock: ReturnType<typeof mockConsole>;

  beforeEach(() => {
    consoleMock = mockConsole();
  });

  afterEach(() => {
    consoleMock.restore();
  });

  describe('Rendering', () => {
    it('renders children when there is no error', () => {
      renderWithProviders(
        <ErrorBoundary>
          <div>Child component</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Child component')).toBeInTheDocument();
    });

    it('renders error UI when child component throws', () => {
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} message="Something went wrong" />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/⚠️ Something went wrong/i)).toBeInTheDocument();
    });

    it('displays error message in error UI', () => {
      const errorMessage = 'Custom error message';
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} message={errorMessage} />
        </ErrorBoundary>
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('displays error stack in details element', () => {
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} message="Stack error" />
        </ErrorBoundary>
      );

      const details = screen.getByText('Error Details');
      expect(details).toBeInTheDocument();

      const detailsElement = details.closest('details');
      expect(detailsElement).toBeInTheDocument();
    });

    it('renders Try Again button in error state', () => {
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  describe('Custom Fallback', () => {
    it('renders custom fallback when provided', () => {
      const customFallback = (error: Error, reset: () => void) => (
        <div>
          <p>Custom error: {error.message}</p>
          <button onClick={reset}>Custom retry</button>
        </div>
      );

      renderWithProviders(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} message="Fallback test" />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Custom error: Fallback test/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /custom retry/i })).toBeInTheDocument();
      expect(screen.queryByText(/⚠️ Something went wrong/i)).not.toBeInTheDocument();
    });

    it('passes error and reset function to custom fallback', () => {
      const mockFallback = jest.fn((error: Error, reset: () => void) => (
        <div>
          <p>{error.message}</p>
          <button onClick={reset}>Reset</button>
        </div>
      ));

      renderWithProviders(
        <ErrorBoundary fallback={mockFallback}>
          <ThrowError shouldThrow={true} message="Test message" />
        </ErrorBoundary>
      );

      expect(mockFallback).toHaveBeenCalled();
      const [error, reset] = mockFallback.mock.calls[0];
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test message');
      expect(typeof reset).toBe('function');
    });
  });

  describe('Error Recovery', () => {
    it('recovers from error when retry button is clicked', async () => {
      const user = setupUser();
      const { rerender } = renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Error state is shown
      expect(screen.getByText(/⚠️ Something went wrong/i)).toBeInTheDocument();

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);

      // Rerender with non-throwing component
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Error UI should be gone, children should render
      await waitFor(() => {
        expect(screen.queryByText(/⚠️ Something went wrong/i)).not.toBeInTheDocument();
        expect(screen.getByText('No error')).toBeInTheDocument();
      });
    });

    it('resets error state when custom fallback retry is clicked', async () => {
      const user = setupUser();
      const customFallback = (error: Error, reset: () => void) => (
        <button onClick={reset}>Custom reset</button>
      );

      const { rerender } = renderWithProviders(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const resetButton = screen.getByRole('button', { name: /custom reset/i });
      await user.click(resetButton);

      rerender(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /custom reset/i })).not.toBeInTheDocument();
        expect(screen.getByText('No error')).toBeInTheDocument();
      });
    });
  });

  describe('Error Logging', () => {
    it('logs error to console when error is caught', () => {
      renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} message="Logged error" />
        </ErrorBoundary>
      );

      expect(consoleMock.mocks.error).toHaveBeenCalled();
      const errorCall = consoleMock.mocks.error.mock.calls[0];
      expect(errorCall[0]).toContain('ErrorBoundary caught an error:');
    });
  });

  describe('Edge Cases', () => {
    it('handles multiple children', () => {
      renderWithProviders(
        <ErrorBoundary>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });

    it('catches errors from nested components', () => {
      const NestedComponent = () => (
        <div>
          <ThrowError shouldThrow={true} message="Nested error" />
        </div>
      );

      renderWithProviders(
        <ErrorBoundary>
          <NestedComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Nested error')).toBeInTheDocument();
    });

    it('maintains error state across re-renders until reset', async () => {
      const user = setupUser();
      const { rerender } = renderWithProviders(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} message="Persistent error" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Persistent error')).toBeInTheDocument();

      // Rerender with same props
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} message="Persistent error" />
        </ErrorBoundary>
      );

      // Error should still be displayed
      expect(screen.getByText('Persistent error')).toBeInTheDocument();

      // Click retry
      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);

      // Rerender without error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.queryByText('Persistent error')).not.toBeInTheDocument();
      });
    });
  });
});
