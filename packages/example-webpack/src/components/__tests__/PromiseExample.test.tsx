import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, setupUser, mockSuccessResponse, mockErrorResponse } from '../../__tests__/utils/test-utils';
import PromiseExample from '../PromiseExample';
import { MockGreetingServiceStub } from '../../__tests__/mocks/proto-mock';

// Mock the proto import
jest.mock('../../proto/greeting.proto', () => ({
  GreetingServiceStub: MockGreetingServiceStub,
}));

describe('PromiseExample', () => {
  const mockServerUrl = 'http://localhost:3000';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders component with heading and description', () => {
      renderWithProviders(<PromiseExample serverUrl={mockServerUrl} />);

      expect(screen.getByText('Promise API Example')).toBeInTheDocument();
      expect(screen.getByText(/Imperative data fetching using async\/await pattern/i)).toBeInTheDocument();
    });

    it('renders input field with placeholder', () => {
      renderWithProviders(<PromiseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    it('renders Send Greeting button', () => {
      renderWithProviders(<PromiseExample serverUrl={mockServerUrl} />);

      expect(screen.getByRole('button', { name: /send greeting/i })).toBeInTheDocument();
    });

    it('renders code example section', () => {
      renderWithProviders(<PromiseExample serverUrl={mockServerUrl} />);

      expect(screen.getByText('Code Example:')).toBeInTheDocument();
      const codeBlock = screen.getByText(/GreetingServiceStub/);
      expect(codeBlock).toBeInTheDocument();
    });
  });

  describe('User Input', () => {
    it('allows typing in the name input', async () => {
      const user = setupUser();
      renderWithProviders(<PromiseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name') as HTMLInputElement;
      await user.type(input, 'Alice');

      expect(input.value).toBe('Alice');
    });

    it('button is disabled when input is empty', () => {
      renderWithProviders(<PromiseExample serverUrl={mockServerUrl} />);

      const button = screen.getByRole('button', { name: /send greeting/i });
      expect(button).toBeDisabled();
    });

    it('button is enabled when input has value', async () => {
      const user = setupUser();
      renderWithProviders(<PromiseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, 'Bob');

      const button = screen.getByRole('button', { name: /send greeting/i });
      expect(button).not.toBeDisabled();
    });

    it('button is disabled when input has only whitespace', async () => {
      const user = setupUser();
      renderWithProviders(<PromiseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, '   ');

      const button = screen.getByRole('button', { name: /send greeting/i });
      expect(button).toBeDisabled();
    });
  });

  describe('gRPC Call', () => {
    it('makes gRPC call when button is clicked', async () => {
      const user = setupUser();
      renderWithProviders(<PromiseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, 'Charlie');

      const button = screen.getByRole('button', { name: /send greeting/i });
      await user.click(button);

      await waitFor(() => {
        const stub = MockGreetingServiceStub.prototype;
        expect(stub.methods.greet).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Charlie',
            language: 'en',
            options: expect.objectContaining({
              style: 1, // CASUAL
              include_timestamp: true,
            }),
          })
        );
      });
    });

    it('displays loading state during gRPC call', async () => {
      const user = setupUser();
      renderWithProviders(<PromiseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, 'David');

      const button = screen.getByRole('button', { name: /send greeting/i });
      await user.click(button);

      expect(screen.getByText(/sending gRPC request.../i)).toBeInTheDocument();
      expect(button).toHaveTextContent('Loading...');
      expect(button).toBeDisabled();
    });

    it('displays success response after successful call', async () => {
      const user = setupUser();
      renderWithProviders(<PromiseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, 'Eve');

      const button = screen.getByRole('button', { name: /send greeting/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Hello, Eve!/i)).toBeInTheDocument();
      });
    });

    it('displays response metadata', async () => {
      const user = setupUser();
      renderWithProviders(<PromiseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, 'Frank');

      const button = screen.getByRole('button', { name: /send greeting/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Timestamp:/i)).toBeInTheDocument();
        expect(screen.getByText(/Server Version:/i)).toBeInTheDocument();
        expect(screen.getByText(/Request ID:/i)).toBeInTheDocument();
        expect(screen.getByText('1.0.0')).toBeInTheDocument();
        expect(screen.getByText('test-request-id')).toBeInTheDocument();
      });
    });

    it('handles Enter key press to submit', async () => {
      const user = setupUser();
      renderWithProviders(<PromiseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, 'Grace{Enter}');

      await waitFor(() => {
        expect(screen.getByText(/Hello, Grace!/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error when gRPC call fails', async () => {
      const user = setupUser();
      const mockError = mockErrorResponse('Network error', 'UNAVAILABLE');

      // Override the mock to throw error
      MockGreetingServiceStub.prototype.methods.greet = jest.fn().mockRejectedValue(mockError);

      renderWithProviders(<PromiseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, 'Henry');

      const button = screen.getByRole('button', { name: /send greeting/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Error:/i)).toBeInTheDocument();
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });

    it('shows error when submitting empty name', async () => {
      const user = setupUser();
      renderWithProviders(<PromiseExample serverUrl={mockServerUrl} />);

      // Manually trigger with empty input
      const input = screen.getByPlaceholderText('Enter your name') as HTMLInputElement;
      const button = screen.getByRole('button', { name: /send greeting/i });

      // Type and then clear
      await user.type(input, 'Test');
      await user.clear(input);

      // Button should be disabled, but let's test the internal logic
      // by programmatically calling with empty value isn't directly testable
      // without exposing the handler, so we verify button state instead
      expect(button).toBeDisabled();
    });

    it('clears previous results when making new request', async () => {
      const user = setupUser();
      renderWithProviders(<PromiseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      const button = screen.getByRole('button', { name: /send greeting/i });

      // First request
      await user.type(input, 'Isaac');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Hello, Isaac!/i)).toBeInTheDocument();
      });

      // Clear and make second request
      await user.clear(input);
      await user.type(input, 'Jack');
      await user.click(button);

      // Old result should be cleared during loading
      expect(screen.queryByText(/Hello, Isaac!/i)).not.toBeInTheDocument();
    });

    it('clears errors when making new request', async () => {
      const user = setupUser();
      const mockError = mockErrorResponse('First error');

      MockGreetingServiceStub.prototype.methods.greet = jest.fn().mockRejectedValueOnce(mockError);

      renderWithProviders(<PromiseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      const button = screen.getByRole('button', { name: /send greeting/i });

      // First request with error
      await user.type(input, 'Kate');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText(/First error/i)).toBeInTheDocument();
      });

      // Reset mock to succeed
      MockGreetingServiceStub.prototype.methods.greet = jest.fn().mockResolvedValue(mockSuccessResponse('Kate'));

      // Second request
      await user.clear(input);
      await user.type(input, 'Kate');
      await user.click(button);

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/First error/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('disables input during loading', async () => {
      const user = setupUser();
      renderWithProviders(<PromiseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, 'Laura');

      const button = screen.getByRole('button', { name: /send greeting/i });
      await user.click(button);

      expect(input).toBeDisabled();
    });

    it('re-enables controls after successful response', async () => {
      const user = setupUser();
      renderWithProviders(<PromiseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      const button = screen.getByRole('button', { name: /send greeting/i });

      await user.type(input, 'Mike');
      await user.click(button);

      await waitFor(() => {
        expect(input).not.toBeDisabled();
        expect(button).not.toBeDisabled();
      });
    });

    it('re-enables controls after error', async () => {
      const user = setupUser();
      const mockError = mockErrorResponse('Test error');
      MockGreetingServiceStub.prototype.methods.greet = jest.fn().mockRejectedValue(mockError);

      renderWithProviders(<PromiseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      const button = screen.getByRole('button', { name: /send greeting/i });

      await user.type(input, 'Nina');
      await user.click(button);

      await waitFor(() => {
        expect(input).not.toBeDisabled();
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles very long names', async () => {
      const user = setupUser();
      renderWithProviders(<PromiseExample serverUrl={mockServerUrl} />);

      const longName = 'A'.repeat(1000);
      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, longName);

      const button = screen.getByRole('button', { name: /send greeting/i });
      await user.click(button);

      await waitFor(() => {
        expect(MockGreetingServiceStub.prototype.methods.greet).toHaveBeenCalledWith(
          expect.objectContaining({
            name: longName,
          })
        );
      });
    });

    it('handles special characters in names', async () => {
      const user = setupUser();
      renderWithProviders(<PromiseExample serverUrl={mockServerUrl} />);

      const specialName = "O'Brien <Test>";
      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, specialName);

      const button = screen.getByRole('button', { name: /send greeting/i });
      await user.click(button);

      await waitFor(() => {
        expect(MockGreetingServiceStub.prototype.methods.greet).toHaveBeenCalledWith(
          expect.objectContaining({
            name: specialName,
          })
        );
      });
    });

    it('handles rapid successive clicks', async () => {
      const user = setupUser();
      renderWithProviders(<PromiseExample serverUrl={mockServerUrl} />);

      const input = screen.getByPlaceholderText('Enter your name');
      await user.type(input, 'Oscar');

      const button = screen.getByRole('button', { name: /send greeting/i });

      // Click multiple times rapidly
      await user.click(button);
      await user.click(button);
      await user.click(button);

      // Should only make one call (button is disabled after first click)
      await waitFor(() => {
        expect(MockGreetingServiceStub.prototype.methods.greet).toHaveBeenCalledTimes(1);
      });
    });
  });
});
