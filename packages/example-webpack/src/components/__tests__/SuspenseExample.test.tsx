import React, { Suspense } from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, setupUser, mockSuccessResponse } from '../../__tests__/utils/test-utils';
import SuspenseExample from '../SuspenseExample';

// Mock the useSuspenseGrpc hook
const mockUseSuspenseGrpc = jest.fn();
jest.mock('@hallow/react', () => ({
  useSuspenseGrpc: (...args: any[]) => mockUseSuspenseGrpc(...args),
}));

// Mock the proto import
jest.mock('../../proto/greeting.proto', () => ({
  GreetingServiceStub: jest.fn(),
}));

describe('SuspenseExample', () => {
  const mockServerUrl = 'http://localhost:3000';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders component with heading and description', () => {
      renderWithProviders(<SuspenseExample serverUrl={mockServerUrl} />);

      expect(screen.getByText('Suspense API Example')).toBeInTheDocument();
      expect(screen.getByText(/Concurrent rendering using React Suspense and useSuspenseGrpc/i)).toBeInTheDocument();
    });

    it('renders input field with placeholder', () => {
      renderWithProviders(<SuspenseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    it('renders Send Greeting button', () => {
      renderWithProviders(<SuspenseExample serverUrl={mockServerUrl} />);

      expect(screen.getByRole('button', { name: /send greeting/i })).toBeInTheDocument();
    });

    it('renders code example section', () => {
      renderWithProviders(<SuspenseExample serverUrl={mockServerUrl} />);

      expect(screen.getByText('Code Example:')).toBeInTheDocument();
      const codeBlock = screen.getByText(/useSuspenseGrpc/);
      expect(codeBlock).toBeInTheDocument();
    });

    it('does not render result initially', () => {
      renderWithProviders(<SuspenseExample serverUrl={mockServerUrl} />);

      expect(screen.queryByText('Response:')).not.toBeInTheDocument();
      expect(screen.queryByText(/Loading data.../i)).not.toBeInTheDocument();
    });
  });

  describe('User Input', () => {
    it('allows typing in the name input', async () => {
      const user = setupUser();
      renderWithProviders(<SuspenseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name') as HTMLInputElement;
      await user.type(input, 'Alice');

      expect(input.value).toBe('Alice');
    });

    it('button is disabled when input is empty', () => {
      renderWithProviders(<SuspenseExample serverUrl={mockServerUrl} />);

      const button = screen.getByRole('button', { name: /send greeting/i });
      expect(button).toBeDisabled();
    });

    it('button is enabled when input has value', async () => {
      const user = setupUser();
      renderWithProviders(<SuspenseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, 'Bob');

      const button = screen.getByRole('button', { name: /send greeting/i });
      expect(button).not.toBeDisabled();
    });

    it('button is disabled when input has only whitespace', async () => {
      const user = setupUser();
      renderWithProviders(<SuspenseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, '   ');

      const button = screen.getByRole('button', { name: /send greeting/i });
      expect(button).toBeDisabled();
    });

    it('clears showResult when input changes', async () => {
      const user = setupUser();
      mockUseSuspenseGrpc.mockReturnValue(mockSuccessResponse('Test'));

      renderWithProviders(<SuspenseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      const button = screen.getByRole('button', { name: /send greeting/i });

      // Trigger result display
      await user.type(input, 'Test');
      await user.click(button);

      await waitFor(() => {
        expect(screen.queryByText(/Hello, Test!/i)).toBeInTheDocument();
      });

      // Change input
      await user.type(input, 'X');

      // Result should be hidden
      await waitFor(() => {
        expect(screen.queryByText(/Hello, Test!/i)).not.toBeInTheDocument();
      });
    });

    it('handles Enter key press to submit', async () => {
      const user = setupUser();
      mockUseSuspenseGrpc.mockReturnValue(mockSuccessResponse('Enter'));

      renderWithProviders(<SuspenseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, 'Enter{Enter}');

      await waitFor(() => {
        expect(screen.getByText(/Hello, Enter!/i)).toBeInTheDocument();
      });
    });
  });

  describe('Suspense Integration', () => {
    it('displays loading fallback during suspense', async () => {
      const user = setupUser();

      // Make useSuspenseGrpc throw a promise (suspense state)
      let resolvePromise: (value: any) => void;
      const suspensePromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockUseSuspenseGrpc.mockImplementation(() => {
        throw suspensePromise;
      });

      renderWithProviders(<SuspenseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, 'Charlie');

      const button = screen.getByRole('button', { name: /send greeting/i });
      await user.click(button);

      // Should show suspense fallback
      expect(screen.getByText(/Loading data.../i)).toBeInTheDocument();

      // Resolve the promise
      resolvePromise!(mockSuccessResponse('Charlie'));
    });

    it('displays result after suspense resolves', async () => {
      const user = setupUser();
      mockUseSuspenseGrpc.mockReturnValue(mockSuccessResponse('David'));

      renderWithProviders(<SuspenseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, 'David');

      const button = screen.getByRole('button', { name: /send greeting/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Hello, David!/i)).toBeInTheDocument();
      });
    });

    it('calls useSuspenseGrpc with correct parameters', async () => {
      const user = setupUser();
      mockUseSuspenseGrpc.mockReturnValue(mockSuccessResponse('Eve'));

      renderWithProviders(<SuspenseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, 'Eve');

      const button = screen.getByRole('button', { name: /send greeting/i });
      await user.click(button);

      await waitFor(() => {
        expect(mockUseSuspenseGrpc).toHaveBeenCalledWith(
          expect.any(Function), // stub loader
          mockServerUrl,
          expect.any(Function) // query function
        );
      });
    });
  });

  describe('Success Display', () => {
    beforeEach(async () => {
      const user = setupUser();
      mockUseSuspenseGrpc.mockReturnValue(mockSuccessResponse('Frank'));

      renderWithProviders(<SuspenseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, 'Frank');

      const button = screen.getByRole('button', { name: /send greeting/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Hello, Frank!/i)).toBeInTheDocument();
      });
    });

    it('displays response message', () => {
      expect(screen.getByText('Response:')).toBeInTheDocument();
      expect(screen.getByText(/Hello, Frank!/i)).toBeInTheDocument();
    });

    it('displays timestamp', () => {
      expect(screen.getByText(/Timestamp:/i)).toBeInTheDocument();
    });

    it('displays server version', () => {
      expect(screen.getByText(/Server Version:/i)).toBeInTheDocument();
      expect(screen.getByText('1.0.0')).toBeInTheDocument();
    });

    it('displays request ID', () => {
      expect(screen.getByText(/Request ID:/i)).toBeInTheDocument();
      expect(screen.getByText('test-request-id')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error when useSuspenseGrpc throws error', async () => {
      const user = setupUser();
      const testError = new Error('Suspense error');
      mockUseSuspenseGrpc.mockImplementation(() => {
        throw testError;
      });

      renderWithProviders(<SuspenseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, 'Grace');

      const button = screen.getByRole('button', { name: /send greeting/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Error:/i)).toBeInTheDocument();
        expect(screen.getByText(/Suspense error/i)).toBeInTheDocument();
      });
    });

    it('displays custom error fallback', async () => {
      const user = setupUser();
      const testError = new Error('Custom error message');
      mockUseSuspenseGrpc.mockImplementation(() => {
        throw testError;
      });

      renderWithProviders(<SuspenseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, 'Henry');

      const button = screen.getByRole('button', { name: /send greeting/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText('Custom error message')).toBeInTheDocument();
      });
    });

    it('displays retry button in error state', async () => {
      const user = setupUser();
      const testError = new Error('Retry test');
      mockUseSuspenseGrpc.mockImplementation(() => {
        throw testError;
      });

      renderWithProviders(<SuspenseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, 'Isaac');

      const sendButton = screen.getByRole('button', { name: /send greeting/i });
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });
    });

    it('resets error when retry button is clicked', async () => {
      const user = setupUser();
      const testError = new Error('Initial error');

      // First throw error
      mockUseSuspenseGrpc.mockImplementation(() => {
        throw testError;
      });

      renderWithProviders(<SuspenseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, 'Jack');

      const sendButton = screen.getByRole('button', { name: /send greeting/i });
      await user.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/Initial error/i)).toBeInTheDocument();
      });

      // Then succeed on retry
      mockUseSuspenseGrpc.mockReturnValue(mockSuccessResponse('Jack'));

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.queryByText(/Initial error/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles very long names', async () => {
      const user = setupUser();
      const longName = 'A'.repeat(1000);
      mockUseSuspenseGrpc.mockReturnValue(mockSuccessResponse(longName));

      renderWithProviders(<SuspenseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, longName);

      const button = screen.getByRole('button', { name: /send greeting/i });
      await user.click(button);

      await waitFor(() => {
        expect(mockUseSuspenseGrpc).toHaveBeenCalled();
      });
    });

    it('handles special characters in names', async () => {
      const user = setupUser();
      const specialName = "O'Brien <Test>";
      mockUseSuspenseGrpc.mockReturnValue(mockSuccessResponse(specialName));

      renderWithProviders(<SuspenseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, specialName);

      const button = screen.getByRole('button', { name: /send greeting/i });
      await user.click(button);

      await waitFor(() => {
        expect(mockUseSuspenseGrpc).toHaveBeenCalled();
      });
    });

    it('handles missing metadata gracefully', async () => {
      const user = setupUser();
      mockUseSuspenseGrpc.mockReturnValue({
        reply: 'Hello!',
        timestamp: new Date().toISOString(),
        // metadata is undefined
      });

      renderWithProviders(<SuspenseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, 'Kate');

      const button = screen.getByRole('button', { name: /send greeting/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Hello!/i)).toBeInTheDocument();
      });
    });

    it('handles rapid successive submissions', async () => {
      const user = setupUser();
      mockUseSuspenseGrpc.mockReturnValue(mockSuccessResponse('Laura'));

      renderWithProviders(<SuspenseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, 'Laura');

      const button = screen.getByRole('button', { name: /send greeting/i });

      // Click multiple times
      await user.click(button);
      await user.click(button);
      await user.click(button);

      // Should only trigger once since showResult is set to true after first click
      // and subsequent clicks won't change the state
      await waitFor(() => {
        expect(screen.getByText(/Hello, Laura!/i)).toBeInTheDocument();
      });
    });

    it('does not call useSuspenseGrpc when showResult is false', () => {
      renderWithProviders(<SuspenseExample serverUrl={mockServerUrl} />);

      expect(mockUseSuspenseGrpc).not.toHaveBeenCalled();
    });

    it('re-renders SuspenseContent when name changes after submission', async () => {
      const user = setupUser();

      mockUseSuspenseGrpc.mockReturnValue(mockSuccessResponse('Mike'));
      renderWithProviders(<SuspenseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, 'Mike');

      const button = screen.getByRole('button', { name: /send greeting/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Hello, Mike!/i)).toBeInTheDocument();
      });

      // Clear mock and change name
      jest.clearAllMocks();
      mockUseSuspenseGrpc.mockReturnValue(mockSuccessResponse('Nina'));

      await user.clear(input);
      await user.type(input, 'Nina');
      await user.click(button);

      await waitFor(() => {
        expect(mockUseSuspenseGrpc).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper input labels and placeholders', () => {
      renderWithProviders(<SuspenseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      expect(input).toHaveAttribute('placeholder', 'Enter your name');
    });

    it('button has descriptive text', () => {
      renderWithProviders(<SuspenseExample serverUrl={mockServerUrl} />);

      const button = screen.getByRole('button', { name: /send greeting/i });
      expect(button).toHaveTextContent('Send Greeting');
    });

    it('error message is clearly indicated', async () => {
      const user = setupUser();
      mockUseSuspenseGrpc.mockImplementation(() => {
        throw new Error('Accessibility test error');
      });

      renderWithProviders(<SuspenseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, 'Oscar');

      const button = screen.getByRole('button', { name: /send greeting/i });
      await user.click(button);

      await waitFor(() => {
        const errorElement = screen.getByText(/Error:/i);
        expect(errorElement.tagName).toBe('STRONG');
      });
    });
  });
});
