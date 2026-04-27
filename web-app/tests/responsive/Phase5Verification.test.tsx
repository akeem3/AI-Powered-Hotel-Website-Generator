import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import {
  setViewport,
  testResponsiveBreakpoints,
  setupResponsiveMocks,
  BREAKPOINTS,
  customRender
} from './responsive-utils';

// Simple test component
const TestComponent: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div data-testid="test-component">
      <h1>{text}</h1>
      <div className="px-4 sm:px-6 lg:px-8">
        Responsive padding test
      </div>
    </div>
  );
};

// Setup mocks
beforeEach(() => {
  setupResponsiveMocks();
  jest.clearAllMocks();
});

describe('Phase 5 Verification Tests', () => {
  describe('Responsive Utilities', () => {
    it('should set viewport correctly', () => {
      setViewport(768, 1024);

      expect(window.innerWidth).toBe(768);
      expect(window.innerHeight).toBe(1024);
    });

    it('should setup responsive mocks', () => {
      setupResponsiveMocks();

      expect(global.ResizeObserver).toBeDefined();
      expect(global.IntersectionObserver).toBeDefined();
    });

    it('should have correct breakpoint values', () => {
      expect(BREAKPOINTS.mobile).toBe(375);
      expect(BREAKPOINTS.tablet).toBe(768);
      expect(BREAKPOINTS.desktop).toBe(1280);
      expect(BREAKPOINTS.wide).toBe(1536);
    });
  });

  describe('Test Component Responsive Behavior', () => {
    it('should render on mobile viewport', () => {
      setViewport(BREAKPOINTS.mobile);

      const { container } = customRender(<TestComponent text="Mobile Test" />);

      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Mobile Test')).toBeInTheDocument();
    });

    it('should render on tablet viewport', () => {
      setViewport(BREAKPOINTS.tablet);

      const { container } = customRender(<TestComponent text="Tablet Test" />);

      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Tablet Test')).toBeInTheDocument();
    });

    it('should render on desktop viewport', () => {
      setViewport(BREAKPOINTS.desktop);

      const { container } = customRender(<TestComponent text="Desktop Test" />);

      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Desktop Test')).toBeInTheDocument();
    });
  });

  describe('Responsive Breakpoints Test', () => {
    it('should test component across all breakpoints manually', async () => {
      const breakpoints = [
        { width: BREAKPOINTS.mobile, name: 'mobile' },
        { width: BREAKPOINTS.tablet, name: 'tablet' },
        { width: BREAKPOINTS.desktop, name: 'desktop' }
      ];

      for (const { width, name } of breakpoints) {
        setViewport(width);

        const { container, unmount } = customRender(
          <TestComponent text={`Breakpoint Test - ${name}`} />
        );

        expect(container.firstChild).toBeInTheDocument();
        expect(screen.getByText(`Breakpoint Test - ${name}`)).toBeInTheDocument();
        expect(container.querySelector('[data-testid="test-component"]')).toBeInTheDocument();

        console.log(`✅ TestComponent renders correctly on ${name} (${width}px)`);

        unmount();
      }
    });
  });

  describe('Performance Testing', () => {
    it('should render quickly on all viewports', async () => {
      const viewports = [BREAKPOINTS.mobile, BREAKPOINTS.tablet, BREAKPOINTS.desktop];
      const maxRenderTime = 50; // 50ms max

      for (const width of viewports) {
        setViewport(width);

        const startTime = performance.now();
        const { unmount } = customRender(<TestComponent text="Performance Test" />);
        const endTime = performance.now();

        const renderTime = endTime - startTime;
        expect(renderTime).toBeLessThan(maxRenderTime);

        console.log(`Performance at ${width}px: ${renderTime.toFixed(2)}ms`);

        unmount();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small viewport', () => {
      setViewport(320);

      const { container } = customRender(<TestComponent text="Small Viewport" />);

      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Small Viewport')).toBeInTheDocument();
    });

    it('should handle very large viewport', () => {
      setViewport(1920);

      const { container } = customRender(<TestComponent text="Large Viewport" />);

      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Large Viewport')).toBeInTheDocument();
    });

    it('should handle rapid viewport changes', () => {
      const { rerender } = customRender(<TestComponent text="Viewport Change Test" />);

      const viewports = [320, 768, 1024, 375, 1280, 600, 768, 1920];

      viewports.forEach(width => {
        setViewport(width);
        expect(() => rerender(<TestComponent text="Viewport Change Test" />)).not.toThrow();
        expect(screen.getByText('Viewport Change Test')).toBeInTheDocument();
      });
    });
  });
});