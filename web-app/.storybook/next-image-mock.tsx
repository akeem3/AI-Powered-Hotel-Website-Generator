import React from 'react';

/**
 * Mock Next.js Image component for Storybook
 * Storybook doesn't use next.config.ts, so we need to mock the Image component
 */
export default function NextImage({
  src,
  alt,
  width,
  height,
  className,
  priority,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  priority?: boolean;
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      {...props}
    />
  );
}
