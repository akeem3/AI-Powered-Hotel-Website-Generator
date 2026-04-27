import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import TestimonialCarousel from '../../components/blocks/Testimonials/TestimonialCarousel';

const mockTestimonials = [
  { id: '1', customerName: 'Author 1', customerTitle: 'Role 1', location: 'Company 1', quote: 'Testimonial 1', rating: 5 },
  { id: '2', customerName: 'Author 2', customerTitle: 'Role 2', location: 'Company 2', quote: 'Testimonial 2', rating: 4 },
  { id: '3', customerName: 'Author 3', customerTitle: 'Role 3', location: 'Company 3', quote: 'Testimonial 3', rating: 5 },
];

describe('TestimonialCarousel Performance', () => {
  it('measures layout reads during scroll', () => {
    let layoutReads = 0;

    // Mock HTMLElement properties that cause layout thrashing
    const originalClientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth');
    const originalOffsetLeft = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetLeft');
    const originalScrollLeft = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollLeft');

    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      get: function() {
        if (this.classList && (this.classList.contains('overflow-x-auto') || this.parentElement?.classList.contains('overflow-x-auto'))) {
          layoutReads++;
        }
        return 100;
      },
      configurable: true
    });

    Object.defineProperty(HTMLElement.prototype, 'offsetLeft', {
      get: function() {
        if (this.classList && this.parentElement?.classList.contains('overflow-x-auto')) {
          layoutReads++;
        }
        return 0;
      },
      configurable: true
    });

    Object.defineProperty(Element.prototype, 'scrollLeft', {
      get: function() {
        if (this.classList && this.classList.contains('overflow-x-auto')) {
          layoutReads++;
        }
        return 0;
      },
      configurable: true
    });

    const { container } = render(
      <TestimonialCarousel testimonials={mockTestimonials} />
    );

    const scrollContainer = container.querySelector('.overflow-x-auto');

    // We expect the optimized version to do minimal layout reads (only on resize/mount, none during scroll)
    // The previous unoptimized version did 800 layout reads
    if (scrollContainer) {
      // Reset before we start our actual simulated scroll
      layoutReads = 0;

      // Simulate 100 rapid scroll events (typical of smooth scrolling on trackpad or mouse wheel)
      for (let i = 0; i < 100; i++) {
        fireEvent.scroll(scrollContainer, { target: { scrollLeft: i * 5 } });
      }

      console.log(`Optimized Layout Reads for 100 scroll events: ${layoutReads}`);

      // The scrollLeft is still read to calculate the center, but the child dimensions
      // are cached and rAF avoids thrashing.
      expect(layoutReads).toBeLessThan(200); // Should be way lower than 800
    }

    // Restore
    if (originalClientWidth) Object.defineProperty(HTMLElement.prototype, 'clientWidth', originalClientWidth);
    if (originalOffsetLeft) Object.defineProperty(HTMLElement.prototype, 'offsetLeft', originalOffsetLeft);
    if (originalScrollLeft) Object.defineProperty(Element.prototype, 'scrollLeft', originalScrollLeft);
  });
});
