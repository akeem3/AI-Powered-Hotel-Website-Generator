import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import '@testing-library/jest-dom';

describe('Button Component', () => {
  // Test 1: Rendering with children text should succeed
  describe('Rendering', () => {
    it('renders with children text successfully', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click me');
    });

    it('renders with different children content', () => {
      render(<Button>Submit Form</Button>);
      const button = screen.getByRole('button', { name: /submit form/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Submit Form');
    });

    it('renders with JSX children', () => {
      render(
        <Button>
          <span data-testid="custom-content">Custom Content</span>
        </Button>,
      );
      const customContent = screen.getByTestId('custom-content');
      expect(customContent).toBeInTheDocument();
      expect(customContent).toHaveTextContent('Custom Content');
    });
  });

  // Test 2: Handling a click event and verifying the callback function is invoked
  describe('Click Events', () => {
    it('handles click events and calls the callback function', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('calls callback function multiple times on multiple clicks', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('passes event object to click handler', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'click',
          target: button,
        }),
      );
    });
  });

  // Test 3: Verifying accessibility features
  describe('Accessibility', () => {
    it('has correct button role', () => {
      render(<Button>Accessible Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('supports disabled state for accessibility', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('disabled');
    });

    it('supports aria-label for better accessibility', () => {
      render(<Button aria-label="Close dialog">×</Button>);
      const button = screen.getByRole('button', { name: /close dialog/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Close dialog');
    });

    it('supports aria-describedby for additional context', () => {
      render(
        <div>
          <p id="button-description">This action will save your changes</p>
          <Button aria-describedby="button-description">Save</Button>
        </div>,
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'button-description');
    });

    it('supports custom aria attributes', () => {
      render(<Button aria-expanded="true">Toggle Menu</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });
  });

  // Test 4: Snapshot test for the component
  describe('Snapshot Tests', () => {
    it('matches snapshot for default button', () => {
      const { container } = render(<Button>Default Button</Button>);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('matches snapshot for different variants', () => {
      const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;

      variants.forEach((variant) => {
        const { container } = render(<Button variant={variant}>{variant} Button</Button>);
        expect(container.firstChild).toMatchSnapshot(`Button-${variant}`);
      });
    });

    it('matches snapshot for different sizes', () => {
      const sizes = ['default', 'sm', 'lg', 'icon'] as const;

      sizes.forEach((size) => {
        const { container } = render(<Button size={size}>{size} Button</Button>);
        expect(container.firstChild).toMatchSnapshot(`Button-size-${size}`);
      });
    });

    it('matches snapshot with additional props', () => {
      const { container } = render(
        <Button disabled className="custom-class" data-testid="test-button">
          Custom Button
        </Button>,
      );
      expect(container.firstChild).toMatchSnapshot('Button-with-props');
    });
  });

  // Additional comprehensive tests for thorough coverage
  describe('Button Variants and Sizes', () => {
    it('applies variant classes correctly', () => {
      const { container } = render(<Button variant="destructive">Delete</Button>);
      const button = container.firstChild as HTMLElement;
      expect(button).toHaveClass('bg-destructive');
    });

    it('applies size classes correctly', () => {
      const { container } = render(<Button size="lg">Large Button</Button>);
      const button = container.firstChild as HTMLElement;
      expect(button).toHaveClass('h-10');
    });

    it('applies custom className along with variant classes', () => {
      const { container } = render(
        <Button variant="outline" className="custom-class">
          Custom Button
        </Button>,
      );
      const button = container.firstChild as HTMLElement;
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('border');
    });
  });

  describe('Button as Child (asChild prop)', () => {
    it('renders as different element when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>,
      );
      const link = screen.getByRole('link', { name: /link button/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });

    it('handles click events on asChild elements', () => {
      const handleClick = jest.fn();
      render(
        <Button asChild onClick={handleClick}>
          <span>Clickable Span</span>
        </Button>,
      );

      const span = screen.getByText('Clickable Span');
      fireEvent.click(span);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Button States', () => {
    it('can be disabled', () => {
      const handleClick = jest.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled Button
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();

      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('supports all standard button attributes', () => {
      render(
        <Button type="submit" name="submit-btn" value="submit" form="test-form">
          Submit Button
        </Button>,
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('name', 'submit-btn');
      expect(button).toHaveAttribute('value', 'submit');
      expect(button).toHaveAttribute('form', 'test-form');
    });
  });
});
