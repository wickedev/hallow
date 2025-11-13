import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, setupUser, mockSuccessResponse, mockErrorResponse } from '../../__tests__/utils/test-utils';
import HookExample from '../HookExample';

// Mock the useGrpc hook
const mockUseGrpc = jest.fn();
jest.mock('@hallow/react', () => ({
  useGrpc: (...args: any[]) => mockUseGrpc(...args),
}));

// Mock the proto import
jest.mock('../../proto/greeting.proto', () => ({
  GreetingServiceStub: jest.fn(),
}));

describe('HookExample', () => {
  const mockServerUrl = 'http://localhost:3000';

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementation
    mockUseGrpc.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });
  });

  describe('Rendering', () => {
    it('renders component with heading and description', () => {
      renderWithProviders(<HookExample serverUrl={mockServerUrl} />);

      expect(screen.getByText('Hook API Example')).toBeInTheDocument();
      expect(screen.getByText(/Declarative data fetching using the useGrpc hook/i)).toBeInTheDocument();
    });

    it('renders input field with default value', () => {
      renderWithProviders(<HookExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.value).toBe('World');
    });

    it('renders Refetch button', () => {
      renderWithProviders(<HookExample serverUrl={mockServerUrl} />);

      expect(screen.getByRole('button', { name: /refetch/i })).toBeInTheDocument();
    });

    it('renders code example section', () => {
      renderWithProviders(<HookExample serverUrl={mockServerUrl} />);

      expect(screen.getByText('Code Example:')).toBeInTheDocument();
      const codeBlock = screen.getByText(/useGrpc/);
      expect(codeBlock).toBeInTheDocument();
    });
  });

  describe('useGrpc Hook Integration', () => {
    it('calls useGrpc hook with correct parameters', () => {
      renderWithProviders(<HookExample serverUrl={mockServerUrl} />);

      expect(mockUseGrpc).toHaveBeenCalledWith(
        expect.any(Function), // stub loader
        mockServerUrl,
        expect.any(Function), // query function
        ['World', 0] // dependencies
      );
    });

    it('passes updated dependencies when name changes', async () => {
      const user = setupUser();
      renderWithProviders(<HookExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.clear(input);
      await user.type(input, 'Alice');

      await waitFor(() => {
        expect(mockUseGrpc).toHaveBeenCalledWith(
          expect.any(Function),
          mockServerUrl,
          expect.any(Function),
          expect.arrayContaining(['Alice'])
        );
      });
    });

    it('increments trigger when refetch button is clicked', async () => {
      const user = setupUser();
      renderWithProviders(<HookExample serverUrl={mockServerUrl} />);

      const button = screen.getByRole('button', { name: /refetch/i });

      // Initial call
      expect(mockUseGrpc).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(String),
        expect.any(Function),
        ['World', 0]
      );

      // Click refetch
      await user.click(button);

      await waitFor(() => {
        expect(mockUseGrpc).toHaveBeenCalledWith(
          expect.any(Function),
          expect.any(String),
          expect.any(Function),
          ['World', 1]
        );
      });
    });
  });

  describe('Loading State', () => {
    it('displays loading indicator when loading is true', () => {
      mockUseGrpc.mockReturnValue({
        data: null,
        loading: true,
        error: null,
      });

      renderWithProviders(<HookExample serverUrl={mockServerUrl} />);

      expect(screen.getByText(/Fetching data.../i)).toBeInTheDocument();
    });

    it('shows loading text on button when loading', () => {
      mockUseGrpc.mockReturnValue({
        data: null,
        loading: true,
        error: null,
      });

      renderWithProviders(<HookExample serverUrl={mockServerUrl} />);

      const button = screen.getByRole('button', { name: /loading/i });
      expect(button).toHaveTextContent('Loading...');
    });

    it('disables button during loading', () => {
      mockUseGrpc.mockReturnValue({
        data: null,
        loading: true,
        error: null,
      });

      renderWithProviders(<HookExample serverUrl={mockServerUrl} />);

      const button = screen.getByRole('button', { name: /loading/i });
      expect(button).toBeDisabled();
    });

    it('does not display data or error during loading', () => {
      mockUseGrpc.mockReturnValue({
        data: null,
        loading: true,
        error: null,
      });

      renderWithProviders(<HookExample serverUrl={mockServerUrl} />);

      expect(screen.queryByText(/Response:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Error:/i)).not.toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    const mockData = mockSuccessResponse('World');

    beforeEach(() => {
      mockUseGrpc.mockReturnValue({
        data: mockData,
        loading: false,
        error: null,
      });
    });

    it('displays response data when available', () => {
      renderWithProviders(<HookExample serverUrl={mockServerUrl} />);

      expect(screen.getByText('Response:')).toBeInTheDocument();
      expect(screen.getByText(/Hello, World!/i)).toBeInTheDocument();
    });

    it('displays response metadata', () => {
      renderWithProviders(<HookExample serverUrl={mockServerUrl} />);

      expect(screen.getByText(/Timestamp:/i)).toBeInTheDocument();
      expect(screen.getByText(/Server Version:/i)).toBeInTheDocument();
      expect(screen.getByText(/Request ID:/i)).toBeInTheDocument();
      expect(screen.getByText('1.0.0')).toBeInTheDocument();
      expect(screen.getByText('test-request-id')).toBeInTheDocument();
    });

    it('formats timestamp correctly', () => {
      renderWithProviders(<HookExample serverUrl={mockServerUrl} />);

      const timestampText = screen.getByText(/Timestamp:/i).parentElement?.textContent;
      expect(timestampText).toMatch(/Timestamp:/);
      // Should contain a formatted date string
      expect(timestampText).toBeTruthy();
    });

    it('does not show loading or error states', () => {
      renderWithProviders(<HookExample serverUrl={mockServerUrl} />);

      expect(screen.queryByText(/Fetching data.../i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Error:/i)).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    const mockError = mockErrorResponse('Connection failed', 'UNAVAILABLE');

    beforeEach(() => {
      mockUseGrpc.mockReturnValue({
        data: null,
        loading: false,
        error: mockError,
      });
    });

    it('displays error message when error occurs', () => {
      renderWithProviders(<HookExample serverUrl={mockServerUrl} />);

      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
      expect(screen.getByText(/Connection failed/i)).toBeInTheDocument();
    });

    it('does not display data or loading during error', () => {
      renderWithProviders(<HookExample serverUrl={mockServerUrl} />);

      expect(screen.queryByText(/Response:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Fetching data.../i)).not.toBeInTheDocument();
    });

    it('button remains enabled during error state', () => {
      renderWithProviders(<HookExample serverUrl={mockServerUrl} />);

      const button = screen.getByRole('button', { name: /refetch/i });
      expect(button).not.toBeDisabled();
    });
  });

  describe('User Interaction', () => {
    it('allows typing in name input', async () => {
      const user = setupUser();
      renderWithProviders(<HookExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name') as HTMLInputElement;
      await user.clear(input);
      await user.type(input, 'Bob');

      expect(input.value).toBe('Bob');
    });

    it('updates data when name changes', async () => {
      const user = setupUser();

      // Start with World
      mockUseGrpc.mockReturnValue({
        data: mockSuccessResponse('World'),
        loading: false,
        error: null,
      });

      const { rerender } = renderWithProviders(<HookExample serverUrl={mockServerUrl} />);
      expect(screen.getByText(/Hello, World!/i)).toBeInTheDocument();

      // Change to Alice
      const input = screen.getByPlaceholderText('Enter your name');
      await user.clear(input);
      await user.type(input, 'Alice');

      // Update mock to return new data
      mockUseGrpc.mockReturnValue({
        data: mockSuccessResponse('Alice'),
        loading: false,
        error: null,
      });

      rerender(<HookExample serverUrl={mockServerUrl} />);
      await waitFor(() => {
        expect(screen.getByText(/Hello, Alice!/i)).toBeInTheDocument();
      });
    });

    it('refetch button increments trigger counter', async () => {
      const user = setupUser();
      renderWithProviders(<HookExample serverUrl={mockServerUrl} />);

      const button = screen.getByRole('button', { name: /refetch/i });

      // Click multiple times
      await user.click(button);
      await user.click(button);
      await user.click(button);

      // Verify trigger incremented in dependencies
      await waitFor(() => {
        const lastCall = mockUseGrpc.mock.calls[mockUseGrpc.mock.calls.length - 1];
        expect(lastCall[3]).toEqual(['World', 3]);
      });
    });
  });

  describe('State Transitions', () => {
    it('transitions from idle to loading to success', () => {
      // Idle state
      mockUseGrpc.mockReturnValue({ data: null, loading: false, error: null });
      const { rerender } = renderWithProviders(<HookExample serverUrl={mockServerUrl} />);
      expect(screen.queryByText(/Fetching data.../i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Response:/i)).not.toBeInTheDocument();

      // Loading state
      mockUseGrpc.mockReturnValue({ data: null, loading: true, error: null });
      rerender(<HookExample serverUrl={mockServerUrl} />);
      expect(screen.getByText(/Fetching data.../i)).toBeInTheDocument();

      // Success state
      mockUseGrpc.mockReturnValue({
        data: mockSuccessResponse('Test'),
        loading: false,
        error: null,
      });
      rerender(<HookExample serverUrl={mockServerUrl} />);
      expect(screen.queryByText(/Fetching data.../i)).not.toBeInTheDocument();
      expect(screen.getByText(/Hello, Test!/i)).toBeInTheDocument();
    });

    it('transitions from success to loading to error', () => {
      // Success state
      mockUseGrpc.mockReturnValue({
        data: mockSuccessResponse('Test'),
        loading: false,
        error: null,
      });
      const { rerender } = renderWithProviders(<HookExample serverUrl={mockServerUrl} />);
      expect(screen.getByText(/Hello, Test!/i)).toBeInTheDocument();

      // Loading state
      mockUseGrpc.mockReturnValue({ data: null, loading: true, error: null });
      rerender(<HookExample serverUrl={mockServerUrl} />);
      expect(screen.getByText(/Fetching data.../i)).toBeInTheDocument();

      // Error state
      mockUseGrpc.mockReturnValue({
        data: null,
        loading: false,
        error: mockErrorResponse('Failed'),
      });
      rerender(<HookExample serverUrl={mockServerUrl} />);
      expect(screen.getByText(/Error:/i)).toBeInTheDocument();
      expect(screen.getByText(/Failed/i)).toBeInTheDocument();
    });

    it('can recover from error to success', () => {
      // Error state
      mockUseGrpc.mockReturnValue({
        data: null,
        loading: false,
        error: mockErrorResponse('Network error'),
      });
      const { rerender } = renderWithProviders(<HookExample serverUrl={mockServerUrl} />);
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();

      // Success state
      mockUseGrpc.mockReturnValue({
        data: mockSuccessResponse('Recovered'),
        loading: false,
        error: null,
      });
      rerender(<HookExample serverUrl={mockServerUrl} />);
      expect(screen.queryByText(/Network error/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Hello, Recovered!/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty name input', async () => {
      const user = setupUser();
      renderWithProviders(<HookExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.clear(input);

      await waitFor(() => {
        expect(mockUseGrpc).toHaveBeenCalledWith(
          expect.any(Function),
          expect.any(String),
          expect.any(Function),
          ['', expect.any(Number)]
        );
      });
    });

    it('handles special characters in name', async () => {
      const user = setupUser();
      renderWithProviders(<HookExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.clear(input);
      await user.type(input, "O'Brien <Test>");

      await waitFor(() => {
        expect(mockUseGrpc).toHaveBeenCalledWith(
          expect.any(Function),
          expect.any(String),
          expect.any(Function),
          expect.arrayContaining(["O'Brien <Test>"])
        );
      });
    });

    it('handles missing metadata in response', () => {
      mockUseGrpc.mockReturnValue({
        data: {
          reply: 'Hello!',
          timestamp: new Date().toISOString(),
          // metadata is undefined
        },
        loading: false,
        error: null,
      });

      renderWithProviders(<HookExample serverUrl={mockServerUrl} />);

      expect(screen.getByText('Response:')).toBeInTheDocument();
      expect(screen.getByText(/Hello!/i)).toBeInTheDocument();
      // Should not crash when accessing metadata
    });

    it('handles very long response messages', () => {
      const longMessage = 'A'.repeat(10000);
      mockUseGrpc.mockReturnValue({
        data: {
          reply: longMessage,
          timestamp: new Date().toISOString(),
          metadata: { server_version: '1.0.0', request_id: 'test' },
        },
        loading: false,
        error: null,
      });

      renderWithProviders(<HookExample serverUrl={mockServerUrl} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });
  });
});
