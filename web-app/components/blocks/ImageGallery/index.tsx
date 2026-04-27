'use client';

import { FC } from 'react';
import { cn } from '@/lib/utils/utils';
import { validateInDev } from '@/lib/contracts/validate.dev';
import { ImageGalleryContract, type ImageGalleryConfig } from '@/lib/contracts/gallery.contract';

import GalleryGrid from './GalleryGrid';
import GalleryMasonry from './GalleryMasonry';
import GalleryCarousel from './GalleryCarousel';
import { usePageContent } from '@/lib/content/hooks/usePageContent';
import { isContentEnabled } from '@/lib/content/featureFlags';
import { ImageGallerySkeleton } from '@/lib/content/skeleton/ImageGallerySkeleton';

// Backward compatibility: Accept both flat props and variant object structure
type ImageGalleryBaseProps = {
  layout?: 'grid' | 'masonry' | 'carousel';
  columns?: 2 | 3 | 4;
  aspectRatio?: 'square' | 'landscape' | 'portrait';
  spacing?: 'tight' | 'normal' | 'loose';
  cardStyle?: 'default' | 'minimal' | 'flat' | 'elevated';
  enableLightbox?: boolean;
  className?: string;
  /** Content key for identifying gallery section in content JSON */
  contentKey?: string;
  /** Hotel ID for fetching content */
  hotelId?: string;
  /** Override feature flag for this instance */
  enableContent?: boolean;
};

// Combine with contract but make images optional for content-first approach
type ImageGalleryProps = ImageGalleryBaseProps & {
  images?: ImageGalleryConfig['images'];
  variant?: ImageGalleryConfig['variant'];
};

const ImageGallery: FC<ImageGalleryProps> = (rawProps) => {
  // Normalize props to variant structure
  // Check if this is the new variant structure (has both variant AND images at top level)
  // or old flat structure (has layout, columns, etc. as flat props)
  const hasVariantStructure = 'variant' in rawProps && 'images' in rawProps;
  
  const normalizedProps: any = hasVariantStructure
    ? (rawProps as ImageGalleryConfig)
    : (() => {
        // Type guard for flat props structure
        type FlatProps = Exclude<ImageGalleryProps, ImageGalleryConfig>;
        const flatProps = rawProps as FlatProps;
        
        return {
          images: flatProps.images,
          variant: {
            layout: flatProps.layout || 'grid',
            ...((flatProps.columns !== undefined) && { columns: flatProps.columns }),
            ...((flatProps.aspectRatio !== undefined) && { aspectRatio: flatProps.aspectRatio }),
            ...((flatProps.spacing !== undefined) && { spacing: flatProps.spacing }),
            ...((flatProps.cardStyle !== undefined) && { cardStyle: flatProps.cardStyle })
          },
          ...((flatProps.enableLightbox !== undefined) && { enableLightbox: flatProps.enableLightbox }),
          ...((flatProps.className !== undefined) && { className: flatProps.className })
        };
      })();

  const props = validateInDev(ImageGalleryContract, normalizedProps as any, 'ImageGallery');
  const { images, variant, enableLightbox = true, className } = props;
  const { layout = 'grid', columns = 3, aspectRatio = 'landscape', spacing = 'normal', cardStyle = 'default' } = variant || {};

  // Extract content props from rawProps (since validateInDev might strip unknown props or normalizedProps might not have them)
  const { hotelId, enableContent, contentKey = 'gallery' } = rawProps as (ImageGalleryProps & { hotelId?: string; enableContent?: boolean; contentKey?: string });

  // Check if content system should be enabled for this component
  const contentEnabled = enableContent ?? isContentEnabled('gallery');

  // Fetch content (only if enabled and hotelId provided)
  const contentResult = usePageContent(
    hotelId,
    'homepage',
    'en'
  );

  // Determine loading state
  const isLoading = contentResult.isLoading;
  const hasProps = images && images.length > 0;
  const showSkeleton = isLoading && !hasProps && contentEnabled;

  if (showSkeleton) {
    return <ImageGallerySkeleton layout={layout} columns={columns} aspectRatio={aspectRatio} className={className} />;
  }

  // Log error in development if content load failed
  if (contentResult.error && process.env.NODE_ENV === 'development' && contentEnabled) {
    console.warn('[ImageGallery] Content load error, using props:', {
      error: contentResult.error,
      hotelId,
      contentKey,
    });
  }

  return (
    <div className={cn(
      "w-full overflow-hidden",
      className
    )}>
      {layout === 'grid' && (
        <GalleryGrid
          images={images}
          columns={columns}
          aspectRatio={aspectRatio}
          spacing={spacing}
          cardStyle={cardStyle}
          enableLightbox={enableLightbox}
        />
      )}
      
      {layout === 'masonry' && (
        <GalleryMasonry
          images={images}
          aspectRatio={aspectRatio}
          spacing={spacing}
          cardStyle={cardStyle}
          enableLightbox={enableLightbox}
        />
      )}
      
      {layout === 'carousel' && (
        <GalleryCarousel
          images={images}
          aspectRatio={aspectRatio}
          spacing={spacing}
          cardStyle={cardStyle}
          enableLightbox={enableLightbox}
        />
      )}
    </div>
  );
};

export default ImageGallery;
