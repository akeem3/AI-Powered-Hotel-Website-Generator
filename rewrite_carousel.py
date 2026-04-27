import re

with open('web-app/components/blocks/ImageGallery/GalleryCarousel.tsx', 'r') as f:
    content = f.read()

search_str = """  // Aspect ratio classes for inner container
  const aspectRatioClasses = {
    square: 'aspect-square',
    landscape: 'aspect-[4/3]',
    portrait: 'aspect-[3/4]'
  };

  // Get card width from the DOM
  const getCardWidth = useCallback(() => {
    if (!carouselRef.current) return 300;
    const firstCard = carouselRef.current.querySelector('figure');
    return firstCard ? firstCard.offsetWidth : 300;
  }, []);

  // Calculate scroll position for a given index
  const getScrollPosition = useCallback((index: number) => {
    const cardWidth = getCardWidth();
    const gapWidth = spacingValues[spacing];
    // Each card position = index * (cardWidth + gap)
    return index * (cardWidth + gapWidth);
  }, [getCardWidth, spacing]);

  // Handle scroll to update active index
  const handleScroll = useCallback(() => {
    if (!carouselRef.current) return;

    const scrollLeft = carouselRef.current.scrollLeft;
    const cardWidth = getCardWidth();
    const gapWidth = spacingValues[spacing];
    const cardTotalWidth = cardWidth + gapWidth;

    // Calculate which card is centered
    const newIndex = Math.round(scrollLeft / cardTotalWidth);
    const clampedIndex = Math.max(0, Math.min(newIndex, images.length - 1));

    if (clampedIndex !== activeIndex) {
      setActiveIndex(clampedIndex);
    }
  }, [images.length, activeIndex, getCardWidth, spacing]);"""

replace_str = """  // Aspect ratio classes for inner container
  const aspectRatioClasses = {
    square: 'aspect-square',
    landscape: 'aspect-[4/3]',
    portrait: 'aspect-[3/4]'
  };

  // Performance optimization: Cache card width to avoid DOM layout thrashing during scroll
  const [cachedCardWidth, setCachedCardWidth] = useState<number>(300);

  // Set up ResizeObserver to track width changes of the first card
  useEffect(() => {
    if (!carouselRef.current) return;

    const firstCard = carouselRef.current.querySelector('figure');
    if (!firstCard) return;

    // Initial measurement
    setCachedCardWidth(firstCard.offsetWidth || 300);

    let animationFrameId: number;
    const resizeObserver = new ResizeObserver((entries) => {
      // Use requestAnimationFrame to debounce updates and avoid ResizeObserver loop errors
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        for (const entry of entries) {
          const newWidth = entry.borderBoxSize?.[0]?.inlineSize ?? (entry.target as HTMLElement).offsetWidth;
          if (newWidth) {
            setCachedCardWidth(newWidth);
          }
        }
      });
    });

    resizeObserver.observe(firstCard);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [images]); // Re-run if images change, in case the first card identity changes

  // Calculate scroll position for a given index
  const getScrollPosition = useCallback((index: number) => {
    const gapWidth = spacingValues[spacing];
    // Each card position = index * (cardWidth + gap)
    return index * (cachedCardWidth + gapWidth);
  }, [cachedCardWidth, spacing]);

  // Handle scroll to update active index
  const handleScroll = useCallback(() => {
    if (!carouselRef.current) return;

    const scrollLeft = carouselRef.current.scrollLeft;
    const gapWidth = spacingValues[spacing];
    const cardTotalWidth = cachedCardWidth + gapWidth;

    // Calculate which card is centered
    const newIndex = Math.round(scrollLeft / cardTotalWidth);
    const clampedIndex = Math.max(0, Math.min(newIndex, images.length - 1));

    if (clampedIndex !== activeIndex) {
      setActiveIndex(clampedIndex);
    }
  }, [images.length, activeIndex, cachedCardWidth, spacing]);"""

new_content = content.replace(search_str, replace_str)

if new_content == content:
    print("Warning: Content not replaced. Search string might not match.")
else:
    with open('web-app/components/blocks/ImageGallery/GalleryCarousel.tsx', 'w') as f:
        f.write(new_content)
    print("Successfully replaced content.")
