/**
 * Unit Tests - Preview Error UI Component
 *
 * @trace epic: EPIC-16
 * @trace story: STORY-16.01
 * @trace reqs: AC3, AC4
 *
 * Why: Tests the error UI components that display helpful messages when
 * the preview page encounters issues loading configurations.
 *
 * Coverage:
 * - AC3: No config parameter error
 * - AC4: Invalid config name and not found errors
 * - Suggestion display for typos
 * - Available fixtures list
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  PreviewErrorUI,
  NoConfigErrorUI,
  InvalidNameErrorUI,
  ConfigNotFoundErrorUI,
  type PreviewErrorType,
} from '@/components/preview';

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock Button component
jest.mock('@/components/ui/button', () => ({
  __esModule: true,
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

describe('PreviewErrorUI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock process.env.NODE_ENV
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });
  });

  describe('AC3: No config error', () => {
    it('should display no config error message', () => {
      render(
        <PreviewErrorUI
          errorType="no-config"
          availableFixtures={['luxury-boutique', 'budget-hostel']}
        />
      );

      expect(screen.getByText('Available Fixtures')).toBeInTheDocument();
      expect(
        screen.getByText(/Select a configuration to preview, or add \?config=name to the URL/)
      ).toBeInTheDocument();
    });

    it('should display available fixtures list', () => {
      render(
        <PreviewErrorUI
          errorType="no-config"
          availableFixtures={['luxury-boutique', 'budget-hostel']}
        />
      );

      expect(screen.getByText(/Available configurations:/i)).toBeInTheDocument();
      expect(screen.getByText('luxury-boutique')).toBeInTheDocument();
      expect(screen.getByText('budget-hostel')).toBeInTheDocument();
    });

    it('should not show suggestions when no suggestions provided', () => {
      render(
        <PreviewErrorUI
          errorType="no-config"
          availableFixtures={['luxury-boutique']}
        />
      );

      expect(screen.queryByText(/Did you mean:/i)).not.toBeInTheDocument();
    });
  });

  describe('AC4: Invalid config name error', () => {
    it('should display invalid name error message', () => {
      render(
        <PreviewErrorUI
          errorType="invalid-name"
          userInput="../etc/passwd"
          availableFixtures={['luxury-boutique']}
        />
      );

      expect(screen.getByText('Invalid Configuration Name')).toBeInTheDocument();
      expect(
        screen.getByText(/can only contain letters, numbers, hyphens, and underscores/)
      ).toBeInTheDocument();
    });

    it('should display user input in code block', () => {
      render(
        <PreviewErrorUI
          errorType="invalid-name"
          userInput="test-invalid-name"
          availableFixtures={[]}
        />
      );

      expect(screen.getByText(/Your input:/i)).toBeInTheDocument();
      // User input is in a code block, check that code element exists
      const codeElements = document.querySelectorAll('code');
      expect(codeElements.length).toBeGreaterThan(0);
      // Find the code element with our user input
      const userInputCode = Array.from(codeElements).find(el => el.textContent === 'test-invalid-name');
      expect(userInputCode).toBeInTheDocument();
    });

    it('should display suggestions for typos', () => {
      render(
        <PreviewErrorUI
          errorType="invalid-name"
          userInput="luxry-typo-name"
          availableFixtures={['luxury-boutique', 'budget-hostel']}
          suggestions={['luxury-boutique']}
        />
      );

      expect(screen.getByText(/Did you mean:/i)).toBeInTheDocument();
      // There may be multiple links with the same name (suggestions + fixtures list)
      // Just check that at least one suggestion link exists
      const suggestionLinks = screen.getAllByRole('link', { name: 'luxury-boutique' });
      expect(suggestionLinks.length).toBeGreaterThan(0);
    });

    it('should render suggestion buttons as links', () => {
      render(
        <PreviewErrorUI
          errorType="invalid-name"
          userInput="wrong"
          availableFixtures={['luxury-boutique']}
          suggestions={['luxury-boutique']}
        />
      );

      const suggestionLinks = screen.getAllByRole('link');
      const suggestionLink = suggestionLinks.find((link) =>
        link.getAttribute('href')?.includes('luxury-boutique')
      );
      expect(suggestionLink).toBeInTheDocument();
    });
  });

  describe('AC4: Config not found error', () => {
    it('should display not found error message', () => {
      render(
        <PreviewErrorUI
          errorType="not-found"
          userInput="nonexistent"
          availableFixtures={['luxury-boutique']}
        />
      );

      expect(screen.getByText('Configuration Not Found')).toBeInTheDocument();
      expect(screen.getByText(/does not exist/)).toBeInTheDocument();
    });

    it('should display available fixtures for not found case', () => {
      render(
        <PreviewErrorUI
          errorType="not-found"
          userInput="wrong"
          availableFixtures={['luxury-boutique', 'budget-hostel']}
        />
      );

      expect(screen.getByText(/Available configurations:/i)).toBeInTheDocument();
      expect(screen.getByText('luxury-boutique')).toBeInTheDocument();
      expect(screen.getByText('budget-hostel')).toBeInTheDocument();
    });

    it('should display suggestions for similar names', () => {
      render(
        <PreviewErrorUI
          errorType="not-found"
          userInput="typo-name"
          availableFixtures={['luxury-boutique', 'budget-hostel']}
          suggestions={['luxury-boutique']}
        />
      );

      expect(screen.getByText(/Did you mean:/i)).toBeInTheDocument();
      // There may be multiple links with the same name (suggestions + fixtures list)
      // Just check that at least one suggestion link exists
      const suggestionLinks = screen.getAllByRole('link', { name: 'luxury-boutique' });
      expect(suggestionLinks.length).toBeGreaterThan(0);
    });
  });

  describe('Load failed error', () => {
    it('should display load failed error message', () => {
      render(
        <PreviewErrorUI
          errorType="load-failed"
          userInput="corrupted"
          availableFixtures={[]}
        />
      );

      expect(screen.getByText('Failed to Load Configuration')).toBeInTheDocument();
      expect(screen.getByText(/error reading the configuration file/)).toBeInTheDocument();
    });
  });

  describe('Validation failed error', () => {
    it('should display validation failed error message', () => {
      render(
        <PreviewErrorUI
          errorType="validation-failed"
          userInput="invalid-config"
          availableFixtures={[]}
        />
      );

      expect(screen.getByText('Invalid Configuration')).toBeInTheDocument();
      expect(screen.getByText(/contains invalid data/)).toBeInTheDocument();
    });
  });

  describe('Common elements', () => {
    it('should display return home button', () => {
      render(
        <PreviewErrorUI
          errorType="no-config"
          availableFixtures={[]}
        />
      );

      const homeButton = screen.getByRole('link', { name: /return to home/i });
      expect(homeButton).toBeInTheDocument();
      expect(homeButton).toHaveAttribute('href', '/');
    });

    it('should display error icon', () => {
      const { container } = render(
        <PreviewErrorUI
          errorType="no-config"
          availableFixtures={[]}
        />
      );

      // SVG has aria-hidden="true", so we check for its presence via querySelector
      const svg = container?.querySelector('svg[aria-hidden="true"]');
      expect(svg).toBeInTheDocument();
    });

    it('should not display developer info in production', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', writable: true });

      render(
        <PreviewErrorUI
          errorType="no-config"
          availableFixtures={[]}
        />
      );

      expect(screen.queryByText('Developer Information')).not.toBeInTheDocument();

      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', writable: true });
    });

    it('should display developer info in development', () => {
      render(
        <PreviewErrorUI
          errorType="no-config"
          userInput="test"
          availableFixtures={[]}
        />
      );

      expect(screen.getByText('Developer Information')).toBeInTheDocument();
    });

    it('should allow toggling developer details', () => {
      render(
        <PreviewErrorUI
          errorType="invalid-name"
          userInput="test"
          availableFixtures={[]}
          suggestions={[]}
        />
      );

      const summary = screen.getByText('Developer Information');
      expect(summary).toBeInTheDocument();

      // Click to toggle
      const user = userEvent.setup();
      user.click(summary);

      expect(screen.getByText('Error Type:')).toBeInTheDocument();
    });
  });

  describe('Empty states', () => {
    it('should handle empty available fixtures', () => {
      render(
        <PreviewErrorUI
          errorType="no-config"
          availableFixtures={[]}
        />
      );

      // Should not crash, should still show error title
      expect(screen.getByText('Available Fixtures')).toBeInTheDocument();
    });

    it('should handle missing optional props', () => {
      render(<PreviewErrorUI errorType="no-config" />);

      expect(screen.getByText('Available Fixtures')).toBeInTheDocument();
    });
  });

  describe('Semantic design tokens', () => {
    it('should use semantic tokens for error styling', () => {
      render(
        <PreviewErrorUI
          errorType="no-config"
          availableFixtures={[]}
        />
      );

      const errorTitle = screen.getByText('Available Fixtures');
      expect(errorTitle.className).toContain('text-brand-primary');
    });

    it('should use semantic tokens for fixture links', () => {
      render(
        <PreviewErrorUI
          errorType="no-config"
          availableFixtures={['luxury-boutique']}
        />
      );

      const fixtureLink = screen.getByRole('link', { name: 'luxury-boutique' });
      expect(fixtureLink.className).toContain('text-brand-primary');
    });
  });
});

describe('NoConfigErrorUI (Convenience Component)', () => {
  it('should render no config error with available fixtures', () => {
    render(
      <NoConfigErrorUI
        availableFixtures={['luxury-boutique', 'budget-hostel']}
      />
    );

    expect(screen.getByText('Available Fixtures')).toBeInTheDocument();
    expect(screen.getByText('luxury-boutique')).toBeInTheDocument();
    expect(screen.getByText('budget-hostel')).toBeInTheDocument();
  });
});

describe('InvalidNameErrorUI (Convenience Component)', () => {
  it('should render invalid name error with user input', () => {
    render(
      <InvalidNameErrorUI
        userInput="my-test-invalid"
        availableFixtures={[]}
        suggestions={[]}
      />
    );

    expect(screen.getByText('Invalid Configuration Name')).toBeInTheDocument();
    // Check that code element exists and contains our input
    const codeElements = document.querySelectorAll('code');
    const userInputCode = Array.from(codeElements).find(el => el.textContent === 'my-test-invalid');
    expect(userInputCode).toBeInTheDocument();
  });
});

describe('ConfigNotFoundErrorUI (Convenience Component)', () => {
  it('should render not found error with user input', () => {
    render(
      <ConfigNotFoundErrorUI
        userInput="my-test-value"
        availableFixtures={[]}
        suggestions={[]}
      />
    );

    expect(screen.getByText('Configuration Not Found')).toBeInTheDocument();
    // Check that code element exists and contains our input
    const codeElements = document.querySelectorAll('code');
    const userInputCode = Array.from(codeElements).find(el => el.textContent === 'my-test-value');
    expect(userInputCode).toBeInTheDocument();
  });
});
