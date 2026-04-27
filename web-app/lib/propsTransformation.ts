/**
 * Props Transformation Utility with Security Filtering
 *
 * @trace epic: EPIC-07
 * @trace story: STORY-07.11
 * @trace reqs: AC4, AC10, AC12
 *
 * Why: Transforms config field names to component contract format while preventing
 * prototype pollution attacks. Maps Hero fields (heading→title, subheading→tagline)
 * and validates all URLs to block XSS via javascript: protocols. Critical security
 * layer that sanitizes props before spreading to components.
 *
 * Security Impact: Blocks VULN-002 (arbitrary injection) and VULN-003 (prototype
 * pollution) by whitelisting allowed prop keys and rejecting dangerous keys like
 * __proto__, constructor, prototype.
 *
 * @example
 * ```tsx
 * import { transformProps, filterSafeVariant } from '@/lib/propsTransformation';
 *
 * const safeProps = transformProps('hero', rawProps);
 * const safeVariant = filterSafeVariant(rawVariant);
 *
 * <Component variant={safeVariant} {...safeProps} />
 * ```
 */

import { validateUrlField } from './urlValidation';

/**
 * Unsplash hotel images used as fallback placeholders when generated configs
 * contain fake CDN URLs (cdn.example.com, backblazeb2.com).
 * Curated set covering hero, rooms, gallery, and general hotel imagery.
 */
const PLACEHOLDER_HOTEL_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1570213489059-0aac6626cade?auto=format&fit=crop&w=800&q=80',
];

const PLACEHOLDER_DOMAINS = ['cdn.example.com', 'backblazeb2.com', 'placeholder'];

/**
 * Replace placeholder/fake image URLs with real Unsplash hotel images.
 * Uses a simple hash of the URL string to deterministically pick an image,
 * so the same placeholder always maps to the same real image.
 */
function replacePlaceholderUrl(url: unknown): string | undefined {
  if (typeof url !== 'string') return undefined;
  const isPlaceholder = PLACEHOLDER_DOMAINS.some(d => url.includes(d));
  if (!isPlaceholder) return url;

  // Simple hash to pick a deterministic image
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) - hash + url.charCodeAt(i)) | 0;
  }
  return PLACEHOLDER_HOTEL_IMAGES[Math.abs(hash) % PLACEHOLDER_HOTEL_IMAGES.length];
}

/**
 * SECURITY: Keys that MUST be rejected to prevent prototype pollution
 *
 * These keys can be used to modify Object.prototype and pollute all objects
 * in the application. Blocking them prevents privilege escalation and RCE.
 */
const DANGEROUS_KEYS = new Set([
  '__proto__',
  'constructor',
  'prototype',
  '__defineGetter__',
  '__defineSetter__',
  '__lookupGetter__',
  '__lookupSetter__',
]);

/**
 * SECURITY: Whitelist of allowed prop keys per component type
 *
 * Only these keys will be passed to components. All other keys are rejected
 * to prevent arbitrary property injection. This is a defense-in-depth measure
 * that works alongside Zod contract validation.
 *
 * NOTE: Configuration fields like 'wrapper' (Story 18.5) are NOT included here
 * because they are NOT component props - they are renderer-level configuration.
 * The 'wrapper' field is validated by HomepageConfigSchema with SectionWrapperContract
 * and is consumed by SectionRenderer, never spread to component props.
 */
const ALLOWED_PROP_KEYS: Record<string, Set<string>> = {
  hero: new Set([
    'title',
    'tagline',
    'heading',
    'subheading',
    'headline',
    'description',
    'primaryCTA',
    'secondaryCTA',
    'image',
    'background',
    'backgroundImage',
    'backgroundImageMobile',
    'imageAlt',
    'ctaText',
    'ctaLink',
    'className',
    'variant',
  ]),
  navigation: new Set([
    'brandName',
    'links',
    'ctaButton',
    'logoUrl',
    'navigationLinks',
    'logoAlt',
    'logoSrc',
    'logoHref',
    'className',
    'variant',
  ]),
  rooms: new Set([
    'rooms',
    'title',
    'subtitle',
    'className',
    'variant',
  ]),
  gallery: new Set([
    'images',
    'title',
    'subtitle',
    'enableLightbox',
    'className',
    'variant',
  ]),
  amenities: new Set([
    'amenities',
    'title',
    'subtitle',
    'showCategory',
    'filterByCategory',
    'className',
    'variant',
  ]),
  testimonials: new Set([
    'testimonials',
    'title',
    'subtitle',
    'showDate',
    'showLocation',
    'className',
    'variant',
  ]),
  booking: new Set([
    'title',
    'subtitle',
    'checkInLabel',
    'checkOutLabel',
    'guestsLabel',
    'submitLabel',
    'submitButtonText',
    'className',
    'variant',
    'theme',
  ]),
  contact: new Set([
    'title',
    'subtitle',
    'address',
    'phone',
    'email',
    'formFields',
    'submitLabel',
    'submitButtonText',
    'className',
    'variant',
  ]),
  // Story 19.1: Footer Block
  footer: new Set([
    'hotelName',
    'address',
    'phone',
    'email',
    'socialLinks',
    'navigationLinks',
    'copyright',
    'footerHotelName',
    'footerAddress',
    'footerPhone',
    'footerEmail',
    'footerSocialLinks',
    'footerNavigationLinks',
    'className',
    'variant',
  ]),
  // Story 19.2: About / Hotel Story Block
  about: new Set([
    'heading',
    'content',
    'image',
    'highlights',
    'aboutHeading',
    'aboutContent',
    'aboutImage',
    'aboutImageMobile',
    'aboutImageAlt',
    'aboutHighlights',
    'className',
    'variant',
  ]),
  // Story 19.3: FAQ Block
  faq: new Set([
    'heading',
    'questions',
    'faqHeading',
    'faqQuestions',
    'className',
    'variant',
  ]),
  // Story 19.4: Features / USP Block
  features: new Set([
    'heading',
    'features',
    'featuresHeading',
    'className',
    'variant',
  ]),
  // Issue #4: LinkButton for View More buttons
  linkButton: new Set([
    'text',
    'href',
    'ariaLabel',
    'center',
    'className',
    'variant',
  ]),
};

/**
 * Filters props to only allowed keys, rejecting dangerous keys
 *
 * SECURITY: Prevents prototype pollution attacks by blocking __proto__,
 * constructor, prototype keys and only allowing whitelisted prop names.
 *
 * @param componentType - The component type (hero, navigation, etc.)
 * @param rawProps - Raw props from JSON config
 * @returns Filtered props object with only safe, allowed keys
 *
 * @example
 * ```tsx
 * const safeProps = filterSafeProps('hero', {
 *   __proto__: { admin: true },  // BLOCKED
 *   title: 'Welcome',             // Allowed
 *   unknownProp: 'value',         // BLOCKED (not in whitelist)
 * });
 * // Returns: { title: 'Welcome' }
 * ```
 */
export function filterSafeProps(
  componentType: string,
  rawProps: Record<string, unknown>
): Record<string, unknown> {
  const allowedKeys = ALLOWED_PROP_KEYS[componentType];

  if (!allowedKeys) {
    console.warn(
      `[Security] Unknown component type: ${componentType}, returning empty props`
    );
    return {};
  }

  // Use Object.keys() instead of Object.entries() for reliable iteration
  // This handles __proto__ and other special keys more consistently
  const keys = Object.keys(rawProps);
  const safeProps: Record<string, unknown> = {};

  for (const key of keys) {
    // SECURITY: Reject prototype pollution keys
    if (DANGEROUS_KEYS.has(key)) {
      console.error(`[Security] BLOCKED dangerous prop key: ${key}`);
      continue;
    }

    // Only allow whitelisted keys
    if (allowedKeys.has(key)) {
      safeProps[key] = rawProps[key];
    } else {
      console.warn(
        `[Security] Rejected unknown prop key for ${componentType}: ${key}`
      );
    }
  }

  return safeProps;
}

/**
 * Transforms Hero component props from config format to contract format
 *
 * Maps field names used in JSON config to field names expected by HeroSection
 * component contract. Also validates all URLs for security.
 *
 * Field mappings:
 * - heading → title
 * - subheading → tagline
 * - backgroundImage → image
 * - ctaText + ctaLink → primaryCTA object
 *
 * @param props - Raw props from config (may have config field names)
 * @returns Transformed props with contract field names and validated URLs
 */
function transformHeroProps(
  props: Record<string, unknown>
): Record<string, unknown> {
  const transformed: Record<string, unknown> = {
    // Map heading → title
    title: props.heading ?? props.title,
    // Map subheading → tagline
    tagline: props.subheading ?? props.tagline,
    // Map backgroundImage → image
    image: props.backgroundImage ?? props.image,
    // Pass through other fields
    headline: props.headline,
    description: props.description,
    className: props.className,
  };

  // Compose primaryCTA object from ctaText + ctaLink
  if (props.ctaText && props.ctaLink) {
    transformed.primaryCTA = {
      text: props.ctaText as string,
      href: validateUrlField(props.ctaLink), // SECURITY: Validate URL
    };
  } else if (props.primaryCTA && typeof props.primaryCTA === 'object') {
    const cta = props.primaryCTA as Record<string, unknown>;
    transformed.primaryCTA = {
      text: cta.text as string,
      href: validateUrlField(cta.href), // SECURITY: Validate URL
      ariaLabel: cta.ariaLabel as string | undefined,
    };
  }

  // Handle secondaryCTA if present
  if (props.secondaryCTA && typeof props.secondaryCTA === 'object') {
    const cta = props.secondaryCTA as Record<string, unknown>;
    transformed.secondaryCTA = {
      text: cta.text as string,
      href: validateUrlField(cta.href), // SECURITY: Validate URL
      ariaLabel: cta.ariaLabel as string | undefined,
    };
  }

  // Replace placeholder URLs and validate image
  if (transformed.image && typeof transformed.image === 'string') {
    transformed.image = replacePlaceholderUrl(transformed.image) ?? validateUrlField(transformed.image);
  }

  return transformed;
}

/**
 * Transforms Navigation props with URL validation for all links
 *
 * Validates href fields in navigationLinks array to prevent XSS.
 *
 * @param props - Raw navigation props from config
 * @returns Navigation props with validated link hrefs
 */
function transformNavigationProps(
  props: Record<string, unknown>
): Record<string, unknown> {
  const transformed = { ...props };

  // Validate links array hrefs
  if (Array.isArray(props.links)) {
    transformed.links = props.links.map((link: unknown) => {
      if (typeof link === 'object' && link !== null) {
        const linkObj = link as Record<string, unknown>;
        return {
          label: String(linkObj.label || ''),
          href: validateUrlField(linkObj.href),
        };
      }
      return link;
    });
  }

  // Validate CTA button URL
  if (props.ctaButton && typeof props.ctaButton === 'object') {
    const cta = props.ctaButton as Record<string, unknown>;
    transformed.ctaButton = {
      text: String(cta.text || ''),
      href: validateUrlField(cta.href),
    };
  }

  // Validate logoUrl if present
  if (props.logoUrl && typeof props.logoUrl === 'string') {
    transformed.logoUrl = validateUrlField(props.logoUrl);
  }

  // Legacy: validate old-style navigation link hrefs
  if (Array.isArray(props.navigationLinks)) {
    transformed.navigationLinks = props.navigationLinks.map((link: unknown) => {
      if (typeof link === 'object' && link !== null) {
        const linkObj = link as Record<string, unknown>;
        return {
          ...linkObj,
          href: validateUrlField(linkObj.href),
        };
      }
      return link;
    });
  }

  // Legacy: validate logoSrc/logoHref if present
  if (props.logoSrc && typeof props.logoSrc === 'string') {
    transformed.logoSrc = validateUrlField(props.logoSrc);
  }
  if (props.logoHref && typeof props.logoHref === 'string') {
    transformed.logoHref = validateUrlField(props.logoHref);
  }

  return transformed;
}

/**
 * Validates image URLs in gallery/rooms components
 *
 * Recursively validates all URL fields in nested objects and arrays.
 *
 * @param props - Props with potential image URLs
 * @returns Props with validated URLs
 */
function validateImageUrls(
  props: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...props };

  // Validate rooms array images
  if (Array.isArray(props.rooms)) {
    result.rooms = props.rooms.map((room: unknown) => {
      if (typeof room === 'object' && room !== null) {
        const roomObj = room as Record<string, unknown>;
        const validatedRoom = { ...roomObj };

        // Replace placeholder URLs and validate room.image
        if (validatedRoom.image && typeof validatedRoom.image === 'string') {
          validatedRoom.image = replacePlaceholderUrl(validatedRoom.image) ?? validateUrlField(validatedRoom.image);
        }

        // Validate images array
        if (Array.isArray(validatedRoom.images)) {
          validatedRoom.images = validatedRoom.images.map((img: unknown) => {
            if (typeof img === 'object' && img !== null) {
              const imgObj = img as Record<string, unknown>;
              return {
                ...imgObj,
                desktopUrl: imgObj.desktopUrl
                  ? replacePlaceholderUrl(imgObj.desktopUrl) ?? validateUrlField(imgObj.desktopUrl)
                  : undefined,
                mobileUrl: imgObj.mobileUrl
                  ? replacePlaceholderUrl(imgObj.mobileUrl) ?? validateUrlField(imgObj.mobileUrl)
                  : undefined,
              };
            }
            return img;
          });
        }

        return validatedRoom;
      }
      return room;
    });
  }

  // Replace placeholder URLs and validate images array
  if (Array.isArray(props.images)) {
    result.images = props.images.map((img: unknown) => {
      if (typeof img === 'object' && img !== null) {
        const imgObj = img as Record<string, unknown>;

        // Map legacy field names (src/srcMobile) to contract-expected names (desktopUrl/mobileUrl)
        // This fixes empty src errors when fixtures use old field names
        const desktopUrl = imgObj.desktopUrl ?? imgObj.src;
        const mobileUrl = imgObj.mobileUrl ?? imgObj.srcMobile;

        // Validate and process desktop URL
        let processedDesktopUrl: string | undefined;
        if (typeof desktopUrl === 'string' && desktopUrl.length > 0) {
          processedDesktopUrl = replacePlaceholderUrl(desktopUrl) ?? validateUrlField(desktopUrl);
        }

        // Validate and process mobile URL (fallback to desktop if not provided)
        let processedMobileUrl: string | undefined;
        if (typeof mobileUrl === 'string' && mobileUrl.length > 0) {
          processedMobileUrl = replacePlaceholderUrl(mobileUrl) ?? validateUrlField(mobileUrl);
        } else if (processedDesktopUrl) {
          processedMobileUrl = processedDesktopUrl;
        }

        return {
          ...imgObj,
          // Use contract-expected field names
          desktopUrl: processedDesktopUrl,
          mobileUrl: processedMobileUrl,
          // Remove legacy field names to avoid confusion
          src: undefined,
          srcMobile: undefined,
        };
      }
      return img;
    });
  }

  return result;
}

/**
 * Transforms Footer props with URL validation for social and navigation links
 *
 * Story 19.1: Footer Block
 * Maps ContentGenerator field names to FooterContract field names.
 * Validates all URLs in socialLinks and navigationLinks arrays.
 *
 * Field mappings:
 * - footerHotelName → hotelName
 * - footerAddress → address
 * - footerPhone → phone
 * - footerEmail → email
 * - footerSocialLinks → socialLinks
 * - footerNavigationLinks → navigationLinks
 *
 * @param props - Raw footer props from config
 * @returns Footer props with mapped field names and validated URLs
 */
function transformFooterProps(
  props: Record<string, unknown>
): Record<string, unknown> {
  const transformed: Record<string, unknown> = {
    // Map ContentGenerator field names to contract field names
    hotelName: props.footerHotelName ?? props.hotelName,
    address: props.footerAddress ?? props.address,
    phone: props.footerPhone ?? props.phone,
    email: props.footerEmail ?? props.email,
    // Pass through other fields
    copyright: props.copyright,
    className: props.className,
  };

  // Validate and transform socialLinks array
  const socialLinks = props.footerSocialLinks ?? props.socialLinks;
  if (Array.isArray(socialLinks)) {
    transformed.socialLinks = socialLinks.map((link: unknown) => {
      if (typeof link === 'object' && link !== null) {
        const linkObj = link as Record<string, unknown>;
        return {
          ...linkObj,
          url: validateUrlField(linkObj.url), // SECURITY: Validate URL
        };
      }
      return link;
    });
  }

  // Validate and transform navigationLinks array
  const navigationLinks = props.footerNavigationLinks ?? props.navigationLinks;
  if (Array.isArray(navigationLinks)) {
    transformed.navigationLinks = navigationLinks.map((link: unknown) => {
      if (typeof link === 'object' && link !== null) {
        const linkObj = link as Record<string, unknown>;
        return {
          ...linkObj,
          href: validateUrlField(linkObj.href), // SECURITY: Validate URL
        };
      }
      return link;
    });
  }

  return transformed;
}

/**
 * Transforms About props with image URL validation
 *
 * Story 19.2: About / Hotel Story Block
 * Maps ContentGenerator field names to AboutContract field names.
 * Validates image URL if provided.
 *
 * Field mappings:
 * - aboutHeading → heading
 * - aboutContent → content
 * - aboutImage → image
 * - aboutHighlights → highlights
 *
 * @param props - Raw about props from config
 * @returns About props with mapped field names and validated image URL
 */
function transformAboutProps(
  props: Record<string, unknown>
): Record<string, unknown> {
  const transformed: Record<string, unknown> = {
    // Map ContentGenerator field names to contract field names
    heading: props.aboutHeading ?? props.heading,
    content: props.aboutContent ?? props.content,
    // Pass through other fields
    highlights: props.aboutHighlights ?? props.highlights,
    className: props.className,
  };

  // Replace placeholder URLs and validate image
  const imageUrl = props.aboutImage ?? props.image;
  if (imageUrl && typeof imageUrl === 'string') {
    transformed.image = replacePlaceholderUrl(imageUrl) ?? validateUrlField(imageUrl);
  }

  return transformed;
}

/**
 * Transforms FAQ props (minimal transformation needed)
 *
 * Story 19.3: FAQ Block
 * Maps ContentGenerator field names to FAQContract field names.
 * No URL validation needed for FAQ content.
 *
 * Field mappings:
 * - faqHeading → heading
 * - questions → questions (same name)
 *
 * @param props - Raw FAQ props from config
 * @returns FAQ props with mapped field names
 */
function transformFaqProps(
  props: Record<string, unknown>
): Record<string, unknown> {
  return {
    // Map ContentGenerator field names to contract field names
    heading: props.faqHeading ?? props.heading,
    questions: props.faqQuestions ?? props.questions,
    // Pass through other fields
    className: props.className,
  };
}

/**
 * Transforms Features props with image URL validation
 *
 * Story 19.4: Features / USP Block
 * Maps ContentGenerator field names to FeaturesContract field names.
 * Validates image URLs in features array if present.
 *
 * Field mappings:
 * - featuresHeading → heading
 * - features → features (same name)
 *
 * @param props - Raw features props from config
 * @returns Features props with mapped field names and validated image URLs
 */
function transformFeaturesProps(
  props: Record<string, unknown>
): Record<string, unknown> {
  const transformed: Record<string, unknown> = {
    // Map ContentGenerator field names to contract field names
    heading: props.featuresHeading ?? props.heading,
    className: props.className,
  };

  // Transform features array and validate any image URLs
  const features = props.features;
  if (Array.isArray(features)) {
    transformed.features = features.map((feature: unknown) => {
      if (typeof feature === 'object' && feature !== null) {
        const featureObj = feature as Record<string, unknown>;
        const validatedFeature = { ...featureObj };

        // Validate image URL if present
        if (validatedFeature.image && typeof validatedFeature.image === 'string') {
          validatedFeature.image = validateUrlField(validatedFeature.image);
        }

        return validatedFeature;
      }
      return feature;
    });
  }

  return transformed;
}

/**
 * Main transformation function - applies security filtering and field mappings
 *
 * Performs three steps:
 * 1. Filter to only allowed prop keys (whitelist)
 * 2. Apply component-specific field name transformations
 * 3. Validate all URLs for security
 *
 * @param componentType - The component type string (hero, navigation, etc.)
 * @param rawProps - Raw props from JSON config
 * @returns Transformed and sanitized props safe for rendering
 *
 * @example
 * ```tsx
 * const safeProps = transformProps('hero', {
 *   heading: 'Welcome',           // Will be mapped to 'title'
 *   subheading: 'Our Hotel',      // Will be mapped to 'tagline'
 *   ctaText: 'Book Now',
 *   ctaLink: '/rooms',            // Will be composed into primaryCTA object
 *   __proto__: { admin: true },   // Will be BLOCKED
 * });
 * ```
 */
export function transformProps(
  componentType: string,
  rawProps: Record<string, unknown>
): Record<string, unknown> {
  // Step 1: SECURITY - Filter to only allowed keys
  const filteredProps = filterSafeProps(componentType, rawProps);

  // Step 2: Apply component-specific transformations
  let transformedProps: Record<string, unknown>;
  switch (componentType) {
    case 'hero':
      transformedProps = transformHeroProps(filteredProps);
      break;

    case 'navigation':
      transformedProps = transformNavigationProps(filteredProps);
      break;

    case 'gallery':
    case 'rooms':
      // Validate image URLs in arrays
      transformedProps = validateImageUrls(filteredProps);
      break;

    case 'amenities':
    case 'testimonials':
    case 'booking':
    case 'contact':
      // These mostly pass through directly after filtering
      transformedProps = filteredProps;
      break;

    // Story 19.1: Footer Block
    case 'footer':
      transformedProps = transformFooterProps(filteredProps);
      break;

    // Story 19.2: About / Hotel Story Block
    case 'about':
      transformedProps = transformAboutProps(filteredProps);
      break;

    // Story 19.3: FAQ Block
    case 'faq':
      transformedProps = transformFaqProps(filteredProps);
      break;

    // Story 19.4: Features / USP Block
    case 'features':
      transformedProps = transformFeaturesProps(filteredProps);
      break;

    default:
      console.warn(
        `[transformProps] Unknown component type: ${componentType}, returning filtered props`
      );
      transformedProps = filteredProps;
  }

  return transformedProps;
}

/**
 * Validates variant object keys against whitelist
 *
 * SECURITY: Prevents prototype pollution via variant objects by only
 * allowing primitive values (string, number, boolean) and rejecting
 * dangerous keys.
 *
 * @param variant - Variant object from config
 * @returns Sanitized variant object with only safe keys
 *
 * @example
 * ```tsx
 * const safeVariant = filterSafeVariant({
 *   __proto__: { hack: true },  // BLOCKED
 *   style: 'modern',             // Allowed
 *   layout: { nested: 'obj' },   // BLOCKED (non-primitive)
 * });
 * // Returns: { style: 'modern' }
 * ```
 */
export function filterSafeVariant(
  variant: Record<string, unknown> | undefined
): Record<string, unknown> {
  if (!variant || typeof variant !== 'object') {
    return {};
  }

  const safeVariant: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(variant)) {
    // SECURITY: Reject dangerous keys in variants too
    if (DANGEROUS_KEYS.has(key)) {
      console.error(`[Security] BLOCKED dangerous variant key: ${key}`);
      continue;
    }

    // Only allow primitive values in variants (defense in depth)
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      safeVariant[key] = value;
    } else {
      console.warn(
        `[Security] Rejected non-primitive variant value for key: ${key}`
      );
    }
  }

  // Map LLM agent field names to contract field names for navigation
  if ('navStyle' in safeVariant && !('style' in safeVariant)) {
    safeVariant.style = safeVariant.navStyle;
    delete safeVariant.navStyle;
  }
  if ('navLayout' in safeVariant && !('layout' in safeVariant)) {
    safeVariant.layout = safeVariant.navLayout;
    delete safeVariant.navLayout;
  }

  // Map legacy field names to contract field names for other components
  // Amenities: amenitiesLayout → layout
  if ('amenitiesLayout' in safeVariant && !('layout' in safeVariant)) {
    safeVariant.layout = safeVariant.amenitiesLayout;
    delete safeVariant.amenitiesLayout;
  }
  // Testimonials: testimonialsLayout → layout
  if ('testimonialsLayout' in safeVariant && !('layout' in safeVariant)) {
    safeVariant.layout = safeVariant.testimonialsLayout;
    delete safeVariant.testimonialsLayout;
  }
  // FAQ: faqLayout → layout
  if ('faqLayout' in safeVariant && !('layout' in safeVariant)) {
    safeVariant.layout = safeVariant.faqLayout;
    delete safeVariant.faqLayout;
  }
  // Features: featuresLayout → layout
  if ('featuresLayout' in safeVariant && !('layout' in safeVariant)) {
    safeVariant.layout = safeVariant.featuresLayout;
    delete safeVariant.featuresLayout;
  }

  // Gallery: galleryLayout → layout
  if ('galleryLayout' in safeVariant && !('layout' in safeVariant)) {
    safeVariant.layout = safeVariant.galleryLayout;
    delete safeVariant.galleryLayout;
  }
  // Gallery: gallerySpacing → spacing
  if ('gallerySpacing' in safeVariant && !('spacing' in safeVariant)) {
    safeVariant.spacing = safeVariant.gallerySpacing;
    delete safeVariant.gallerySpacing;
  }
  // Gallery: cardStyle is kept as-is (contract expects it)

  return safeVariant;
}
