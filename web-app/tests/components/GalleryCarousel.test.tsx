import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import GalleryCarousel from '@/components/blocks/ImageGallery/GalleryCarousel';

describe('GalleryCarousel Performance', () => {
  const images = [
    { id: '1', desktopUrl: '/1.jpg', mobileUrl: '/1.jpg', alt: '1' },
    { id: '2', desktopUrl: '/2.jpg', mobileUrl: '/2.jpg', alt: '2' },
    { id: '3', desktopUrl: '/3.jpg', mobileUrl: '/3.jpg', alt: '3' },
  ];

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('baseline vs optimized querySelector and offsetWidth measurements', () => {
    const querySelectorSpy = jest.spyOn(HTMLElement.prototype, 'querySelector');

    // Track offsetWidth calls
    const offsetWidthGetter = jest.fn().mockReturnValue(300);
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get: offsetWidthGetter,
    });

    const { container } = render(<GalleryCarousel images={images} />);

    const carouselContainer = container.querySelector('.scroll-smooth-behavior');
    expect(carouselContainer).toBeTruthy();

    // Reset spies right before scrolling
    querySelectorSpy.mockClear();
    offsetWidthGetter.mockClear();

    if (carouselContainer) {
      act(() => {
        fireEvent.scroll(carouselContainer, { target: { scrollLeft: 100 } });
        jest.runAllTimers();

        fireEvent.scroll(carouselContainer, { target: { scrollLeft: 200 } });
        jest.runAllTimers();

        fireEvent.scroll(carouselContainer, { target: { scrollLeft: 300 } });
        jest.runAllTimers();
      });

      console.log('querySelector calls during scroll:', querySelectorSpy.mock.calls.length);
      console.log('offsetWidth reads during scroll:', offsetWidthGetter.mock.calls.length);
    }
  });
});
