import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders, setupUser } from '../../__tests__/utils/test-utils';
import Navigation, { Tab } from '../Navigation';

const mockTabs: Tab[] = [
  {
    id: 'promise',
    label: 'Promise API',
    description: 'Imperative data fetching with async/await',
  },
  {
    id: 'hook',
    label: 'Hook API',
    description: 'Declarative data fetching with useGrpc',
  },
  {
    id: 'suspense',
    label: 'Suspense API',
    description: 'Concurrent rendering with useSuspenseGrpc',
  },
];

describe('Navigation', () => {
  describe('Rendering', () => {
    it('renders all tabs', () => {
      renderWithProviders(
        <Navigation currentTab="promise" onTabChange={jest.fn()} tabs={mockTabs} />
      );

      mockTabs.forEach((tab) => {
        expect(screen.getByText(tab.label)).toBeInTheDocument();
        expect(screen.getByText(tab.description)).toBeInTheDocument();
      });
    });

    it('renders navigation element with correct class', () => {
      const { container } = renderWithProviders(
        <Navigation currentTab="promise" onTabChange={jest.fn()} tabs={mockTabs} />
      );

      const nav = container.querySelector('nav.navigation');
      expect(nav).toBeInTheDocument();
    });

    it('renders tabs as buttons', () => {
      renderWithProviders(
        <Navigation currentTab="promise" onTabChange={jest.fn()} tabs={mockTabs} />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(mockTabs.length);
    });

    it('renders empty state when no tabs provided', () => {
      const { container } = renderWithProviders(
        <Navigation currentTab="promise" onTabChange={jest.fn()} tabs={[]} />
      );

      const buttons = container.querySelectorAll('button');
      expect(buttons).toHaveLength(0);
    });
  });

  describe('Active State', () => {
    it('marks current tab as active', () => {
      renderWithProviders(
        <Navigation currentTab="hook" onTabChange={jest.fn()} tabs={mockTabs} />
      );

      const hookButton = screen.getByRole('button', { name: 'Hook API' });
      expect(hookButton).toHaveClass('active');
    });

    it('does not mark other tabs as active', () => {
      renderWithProviders(
        <Navigation currentTab="hook" onTabChange={jest.fn()} tabs={mockTabs} />
      );

      const promiseButton = screen.getByRole('button', { name: 'Promise API' });
      const suspenseButton = screen.getByRole('button', { name: 'Suspense API' });

      expect(promiseButton).not.toHaveClass('active');
      expect(suspenseButton).not.toHaveClass('active');
    });

    it('sets aria-pressed to true for active tab', () => {
      renderWithProviders(
        <Navigation currentTab="suspense" onTabChange={jest.fn()} tabs={mockTabs} />
      );

      const suspenseButton = screen.getByRole('button', { name: 'Suspense API' });
      expect(suspenseButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('sets aria-pressed to false for inactive tabs', () => {
      renderWithProviders(
        <Navigation currentTab="suspense" onTabChange={jest.fn()} tabs={mockTabs} />
      );

      const promiseButton = screen.getByRole('button', { name: 'Promise API' });
      const hookButton = screen.getByRole('button', { name: 'Hook API' });

      expect(promiseButton).toHaveAttribute('aria-pressed', 'false');
      expect(hookButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Interaction', () => {
    it('calls onTabChange when tab is clicked', async () => {
      const user = setupUser();
      const mockOnTabChange = jest.fn();

      renderWithProviders(
        <Navigation currentTab="promise" onTabChange={mockOnTabChange} tabs={mockTabs} />
      );

      const hookButton = screen.getByRole('button', { name: 'Hook API' });
      await user.click(hookButton);

      expect(mockOnTabChange).toHaveBeenCalledTimes(1);
      expect(mockOnTabChange).toHaveBeenCalledWith('hook');
    });

    it('calls onTabChange with correct tab id', async () => {
      const user = setupUser();
      const mockOnTabChange = jest.fn();

      renderWithProviders(
        <Navigation currentTab="promise" onTabChange={mockOnTabChange} tabs={mockTabs} />
      );

      // Click Suspense tab
      const suspenseButton = screen.getByRole('button', { name: 'Suspense API' });
      await user.click(suspenseButton);

      expect(mockOnTabChange).toHaveBeenCalledWith('suspense');
    });

    it('calls onTabChange even when clicking active tab', async () => {
      const user = setupUser();
      const mockOnTabChange = jest.fn();

      renderWithProviders(
        <Navigation currentTab="promise" onTabChange={mockOnTabChange} tabs={mockTabs} />
      );

      const promiseButton = screen.getByRole('button', { name: 'Promise API' });
      await user.click(promiseButton);

      expect(mockOnTabChange).toHaveBeenCalledWith('promise');
    });

    it('handles multiple clicks correctly', async () => {
      const user = setupUser();
      const mockOnTabChange = jest.fn();

      renderWithProviders(
        <Navigation currentTab="promise" onTabChange={mockOnTabChange} tabs={mockTabs} />
      );

      const hookButton = screen.getByRole('button', { name: 'Hook API' });
      await user.click(hookButton);
      await user.click(hookButton);

      expect(mockOnTabChange).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label attributes', () => {
      renderWithProviders(
        <Navigation currentTab="promise" onTabChange={jest.fn()} tabs={mockTabs} />
      );

      mockTabs.forEach((tab) => {
        const button = screen.getByRole('button', { name: tab.label });
        expect(button).toHaveAttribute('aria-label', tab.label);
      });
    });

    it('renders tabs in semantic nav element', () => {
      renderWithProviders(
        <Navigation currentTab="promise" onTabChange={jest.fn()} tabs={mockTabs} />
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('renders label and description with proper semantic structure', () => {
      renderWithProviders(
        <Navigation currentTab="promise" onTabChange={jest.fn()} tabs={mockTabs} />
      );

      const promiseButton = screen.getByRole('button', { name: 'Promise API' });
      const label = promiseButton.querySelector('.nav-tab-label');
      const description = promiseButton.querySelector('.nav-tab-description');

      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent('Promise API');
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent('Imperative data fetching with async/await');
    });
  });

  describe('Edge Cases', () => {
    it('handles single tab', () => {
      const singleTab = [mockTabs[0]];
      renderWithProviders(
        <Navigation currentTab="promise" onTabChange={jest.fn()} tabs={singleTab} />
      );

      expect(screen.getByRole('button', { name: 'Promise API' })).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toHaveLength(1);
    });

    it('handles many tabs', () => {
      const manyTabs = [
        ...mockTabs,
        { id: 'extra1', label: 'Extra 1', description: 'Extra tab 1' },
        { id: 'extra2', label: 'Extra 2', description: 'Extra tab 2' },
      ];

      renderWithProviders(
        <Navigation currentTab="promise" onTabChange={jest.fn()} tabs={manyTabs} />
      );

      expect(screen.getAllByRole('button')).toHaveLength(5);
    });

    it('handles tab id that does not match any tab', () => {
      renderWithProviders(
        <Navigation currentTab="nonexistent" onTabChange={jest.fn()} tabs={mockTabs} />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).not.toHaveClass('active');
        expect(button).toHaveAttribute('aria-pressed', 'false');
      });
    });

    it('renders tabs with special characters in labels', () => {
      const specialTabs: Tab[] = [
        { id: '1', label: 'Tab & Special', description: 'Description with <html>' },
        { id: '2', label: 'Tab "Quotes"', description: "Description's test" },
      ];

      renderWithProviders(
        <Navigation currentTab="1" onTabChange={jest.fn()} tabs={specialTabs} />
      );

      expect(screen.getByText('Tab & Special')).toBeInTheDocument();
      expect(screen.getByText('Tab "Quotes"')).toBeInTheDocument();
    });
  });

  describe('Re-rendering', () => {
    it('updates active tab when currentTab prop changes', () => {
      const { rerender } = renderWithProviders(
        <Navigation currentTab="promise" onTabChange={jest.fn()} tabs={mockTabs} />
      );

      let promiseButton = screen.getByRole('button', { name: 'Promise API' });
      expect(promiseButton).toHaveClass('active');

      rerender(<Navigation currentTab="hook" onTabChange={jest.fn()} tabs={mockTabs} />);

      promiseButton = screen.getByRole('button', { name: 'Promise API' });
      const hookButton = screen.getByRole('button', { name: 'Hook API' });

      expect(promiseButton).not.toHaveClass('active');
      expect(hookButton).toHaveClass('active');
    });

    it('handles tabs prop change', () => {
      const newTabs: Tab[] = [
        { id: 'new1', label: 'New Tab 1', description: 'New description 1' },
        { id: 'new2', label: 'New Tab 2', description: 'New description 2' },
      ];

      const { rerender } = renderWithProviders(
        <Navigation currentTab="promise" onTabChange={jest.fn()} tabs={mockTabs} />
      );

      expect(screen.getAllByRole('button')).toHaveLength(3);

      rerender(<Navigation currentTab="new1" onTabChange={jest.fn()} tabs={newTabs} />);

      expect(screen.getAllByRole('button')).toHaveLength(2);
      expect(screen.getByText('New Tab 1')).toBeInTheDocument();
      expect(screen.queryByText('Promise API')).not.toBeInTheDocument();
    });
  });
});
