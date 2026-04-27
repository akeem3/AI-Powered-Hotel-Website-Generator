/**
 * Preview Route - Dynamic Multi-Page Config Renderer
 *
 * @trace epic: EPIC-16
 * @trace story: STORY-16.01
 * @trace epic: EPIC-25
 * @trace story: STORY-25.5
 * @trace reqs: AC1, AC3, AC4, AC5, AC6, AC7, AC8, AC9
 * @trace epic_original: EPIC-07
 * @trace story_original: STORY-07.11
 *
 * Why: Provides a development-only route to visualize HomepageConfig and WebsiteConfig
 * fixtures via URL parameters. Loads configurations dynamically from the fixtures directory
 * with full security validation and displays helpful error messages for invalid inputs.
 *
 * Story 25.5: Extended to support multi-page navigation using query parameters.
 * Preview route now supports 9 page types (homepage, rooms, roomDetail, gallery, amenities,
 * reviews, contact, about, faq) with automatic content multiplication via splitToPages
 * and multiplyContent utilities.
 *
 * Security:
 * - Config names validated with CONFIG_NAME_REGEX (AC9) to prevent path traversal
 * - All configs validated with HomepageConfigSchema and STRICT_VALIDATION_CONFIG (AC8)
 * - Component props pass through transformProps and filterSafeVariant (AC7)
 * - Environment gate prevents unauthorized access in production
 *
 * Features:
 * - AC5: Debug header displays config metadata (generationId, hotelName, componentCount)
 * - AC6: Keyboard shortcut Ctrl+D / Cmd+D toggles debug header visibility
 * - Story 25.5: Multi-page navigation with ?page= parameter
 * - Story 25.5: Room detail pages with ?page=roomDetail&room={slug}
 * - Story 25.5: Page navigation UI for switching between pages
 * - Story 25.5: Content multiplication for realistic page volumes
 *
 * @example
 * ```bash
 * # Load homepage (default, backward compatible)
 * http://localhost:3000/preview?config=luxury-boutique
 * http://localhost:3000/preview?config=luxury-boutique&page=homepage
 *
 * # Story 25.5: Load specific pages
 * http://localhost:3000/preview?config=luxury-boutique&page=rooms
 * http://localhost:3000/preview?config=luxury-boutique&page=gallery
 * http://localhost:3000/preview?config=luxury-boutique&page=amenities
 *
 * # Story 25.5: Load room detail page
 * http://localhost:3000/preview?config=luxury-boutique&page=roomDetail&room=deluxe-suite
 *
 * # No config parameter - shows available fixtures (AC3)
 * http://localhost:3000/preview
 *
 * # Invalid config - shows error with suggestions (AC4)
 * http://localhost:3000/preview?config=invalid-name
 *
 * # Toggle debug header (AC6)
 * Press Ctrl+D or Cmd+D
 *
 * # Pipeline: loadFixture → validate → splitToPages → multiplyContent → select page → render
 * ```
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';

// Schema and validation
import { HomepageConfigSchema } from '@/app/langgraph/agents/schemas';
import { validateContract, STRICT_VALIDATION_CONFIG } from '@/lib/contractValidation';

// Story 25.5: Multi-page generation utilities
import {
  splitToPages,
  type WebsiteConfig,
  type PageType,
  WebsiteConfigSchema,
} from '@/lib/generation/split-to-pages';
import { VALID_PAGE_TYPES } from '@/lib/preview/constants';
import {
  multiplyContent,
  type VolumeConfig,
  VOLUME_CONFIGS,
} from '@/lib/generation/multiply-content';
import { type HotelType } from '@/lib/generation/seed-bank';

// Component renderer and Section wrapper
import ComponentRenderer from '@/components/renderers/ComponentRenderer';
import { COMPONENT_MAP, type ComponentType } from '@/components/renderers/componentMap';
import SectionRenderer from '@/components/renderers/SectionRenderer';
import { transformProps, filterSafeVariant } from '@/lib/propsTransformation';

// Story 18.5: Import section wrapper config type
import type { SectionWrapperConfig } from '@/lib/contracts/section-wrapper.contract';

// Fixture validation and loading (Phase 1)
import {
  sanitizeConfigNameWithDetails,
  getAvailableFixtures,
  getFixtureSuggestions,
  loadFixture,
  type SanitizationResult,
} from '@/lib/validation/fixtureValidation';

// Preview error UI components
import {
  NoConfigErrorUI,
  InvalidNameErrorUI,
  ConfigNotFoundErrorUI,
  PreviewErrorUI,
} from '@/components/preview';

// Debug header component (Phase 3)
import { DebugHeader } from '@/components/preview';

// Story 25.5: Page navigation component
import { PageNavigation } from '@/components/preview';

// Design token theme application (Epic 20)
import { ThemeApplier } from '@/components/ThemeApplier';

/**
 * SECURITY: Environment gate for production access
 *
 * Preview route is only accessible in development or if explicitly enabled
 * via PREVIEW_ENABLED environment variable. This prevents exposure of
 * generated configs in production deployments.
 */
const isPreviewEnabled =
  process.env.NODE_ENV === 'development' ||
  process.env.PREVIEW_ENABLED === 'true';

/**
 * Preview page props - receives search params from URL
 *
 * Story 25.5: Extended to support multi-page navigation with `page` and `room` parameters.
 *
 * @example
 * // URL: /preview?config=luxury-boutique
 * // props: { searchParams: { config: 'luxury-boutique' } }
 *
 * // URL: /preview?config=luxury-boutique&page=rooms
 * // props: { searchParams: { config: 'luxury-boutique', page: 'rooms' } }
 *
 * // URL: /preview?config=luxury-boutique&page=roomDetail&room=deluxe-suite
 * // props: { searchParams: { config: 'luxury-boutique', page: 'roomDetail', room: 'deluxe-suite' } }
 */
interface PreviewPageProps {
  searchParams: Promise<{ config?: string; page?: string; room?: string }>;
}

/**
 * Validates a loaded config against HomepageConfigSchema
 *
 * Uses STRICT_VALIDATION_CONFIG to reject invalid configs. This is the
 * same validation used by ComponentRenderer, providing an early validation
 * point before the component tree is created.
 *
 * Story 25.6: Handles both HomepageConfig and WebsiteConfig formats.
 * - If config has 'pages' field, it's WebsiteConfig - extract 'source' field
 * - If config has 'components' field, it's HomepageConfig - use directly
 *
 * @param config - The loaded config object to validate
 * @param configName - The name of the config (for error logging)
 * @returns The validated config, or null if validation fails
 *
 * @see AC8 - STRICT_VALIDATION_CONFIG enforcement
 */
function validatePreviewConfig(
  config: Record<string, unknown>,
  configName: string
): Record<string, unknown> | null {
  // Story 25.6: Handle WebsiteConfig format (has 'pages' field)
  // Extract the 'source' field which contains the original HomepageConfig
  let configToValidate: Record<string, unknown>;

  if ('pages' in config && config.pages && typeof config.pages === 'object') {
    // This is a WebsiteConfig - extract the source HomepageConfig
    console.info('[Preview] Detected WebsiteConfig format, extracting source HomepageConfig');

    if ('source' in config && config.source) {
      configToValidate = config.source as Record<string, unknown>;
    } else {
      console.error('[Preview] WebsiteConfig missing required source field');
      return null;
    }
  } else if ('components' in config && config.components && Array.isArray(config.components)) {
    // This is a HomepageConfig - use directly
    configToValidate = config;
  } else {
    console.error('[Preview] Unknown config format - missing both pages and components fields');
    return null;
  }

  try {
    return validateContract(
      HomepageConfigSchema,
      configToValidate,
      STRICT_VALIDATION_CONFIG,
      `PreviewHomepageConfig-${configName}`
    );
  } catch (error) {
    // Better error logging for ZodError
    const zodError = error as { issues?: Array<{ path: (string | number)[]; message: string }> };

    console.error('[Preview] Config validation failed:', {
      configName,
      issues: zodError.issues || [],
      error: error instanceof Error ? error.name : String(error),
    });
    return null;
  }
}

/**
 * Route Segment Config
 *
 * IMPORTANT: This route is development-only.
 * Environment checks inside the component prevent access in production.
 *
 * - In development: Route renders dynamically with searchParams
 * - In production with static export: Route shows "not available" message
 *
 * Note: Removed 'force-dynamic' to allow static export builds.
 * The component's internal environment checks provide security.
 */

/**
 * Preview Page Component
 *
 * Dynamically loads and renders HomepageConfig/WebsiteConfig fixtures based on URL parameters.
 * Handles all error states with helpful UI messages and maintains security through comprehensive
 * input validation and schema enforcement.
 *
 * Story 25.5: Multi-page pipeline integrates splitToPages and multiplyContent for realistic
 * content volumes across 9 page types.
 *
 * Pipeline (Story 25.5):
 * 1. Load fixture from filesystem (loadFixture)
 * 2. Validate against HomepageConfigSchema
 * 3. Split HomepageConfig into WebsiteConfig (splitToPages)
 * 4. Multiply content to realistic volumes (multiplyContent)
 * 5. Select page based on ?page= parameter (default: homepage)
 * 6. Render selected page's components
 *
 * Error Handling:
 * - AC3: No config parameter → List available fixtures
 * - AC4: Invalid config name → 404-style with suggestions
 * - AC5: Debug header displays metadata (generationId, hotelName, componentCount)
 * - AC6: Keyboard shortcut Ctrl+D / Cmd+D toggles debug header
 * - AC9: Path traversal attempts → Blocked by sanitizeConfigName
 * - AC8: Schema validation failures → Error message
 * - Story 25.5: splitToPages errors → Friendly error UI
 * - Story 25.5: multiplyContent errors → Graceful degradation to split config
 * - Story 25.5: Invalid page parameter → Fallback to homepage with console warning
 *
 * @returns Rendered component tree with selected page's components, or error UI
 *
 * @see AC1 - /preview?config={name} loads corresponding fixture
 * @see AC3 - /preview without config shows helpful error
 * @see AC4 - /preview?config={invalid} shows 404-style with suggestions
 * @see AC5 - Debug header displays config metadata
 * @see AC6 - Ctrl+D / Cmd+D toggles debug header visibility
 * @see Story 25.5 - Multi-page navigation with ?page={type} parameter
 * @see Story 25.5 - Room detail pages with ?page=roomDetail&room={slug}
 */
export default async function PreviewPage({ searchParams }: PreviewPageProps) {
  // SECURITY: Block access if preview is not enabled
  if (!isPreviewEnabled) {
    console.warn('[Preview] Access denied - PREVIEW_ENABLED not set');
    notFound();
  }

  // Await searchParams (Next.js 15+ requires Promise)
  const params = await searchParams;
  const rawConfigName = params?.config;
  const availableFixtures = getAvailableFixtures();

  // ========================================================================
  // AC3: No config parameter provided
  // ========================================================================
  if (!rawConfigName) {
    console.info('[Preview] No config parameter provided (AC3)');
    return <NoConfigErrorUI availableFixtures={availableFixtures} />;
  }

  // ========================================================================
  // AC9: Validate and sanitize config name (path traversal protection)
  // ========================================================================
  const sanitizationResult = sanitizeConfigNameWithDetails(rawConfigName);

  if (!sanitizationResult.success) {
    console.warn('[Preview] Config name validation failed (AC9)', {
      original: sanitizationResult.original,
      reason: sanitizationResult.reason,
    });

    // Get suggestions for common typos
    const suggestions = getFixtureSuggestions(sanitizationResult.original);

    return (
      <InvalidNameErrorUI
        userInput={sanitizationResult.original}
        availableFixtures={availableFixtures}
        suggestions={suggestions}
      />
    );
  }

  const sanitizedName = sanitizationResult.sanitizedName;

  // ========================================================================
  // AC1: Load the fixture from filesystem
  // ========================================================================
  const loadedConfig = loadFixture(sanitizedName);

  if (!loadedConfig) {
    console.warn('[Preview] Fixture not found or failed to load', {
      sanitizedName,
    });

    // Get suggestions for similar fixture names
    const suggestions = getFixtureSuggestions(sanitizedName);

    return (
      <ConfigNotFoundErrorUI
        userInput={sanitizedName}
        availableFixtures={availableFixtures}
        suggestions={suggestions}
      />
    );
  }

  // ========================================================================
  // AC8: Validate config with HomepageConfigSchema + STRICT_VALIDATION_CONFIG
  // ========================================================================
  const validatedConfig = validatePreviewConfig(loadedConfig, sanitizedName);

  if (!validatedConfig) {
    console.error('[Preview] Schema validation failed (AC8)', {
      sanitizedName,
    });
    return (
      <PreviewErrorUI
        errorType="validation-failed"
        userInput={sanitizedName}
        availableFixtures={availableFixtures}
      />
    );
  }

  // ========================================================================
  // Story 25.5: Multi-page pipeline - splitToPages → multiplyContent → select page
  // Story 25.6: Handle both HomepageConfig and WebsiteConfig fixture formats
  // ========================================================================

  // Extract parameters for page selection
  const pageParam = params?.page;
  const roomParam = params?.room;

  // Check if the loaded fixture is already a WebsiteConfig (has 'pages' field)
  const isLoadedConfigWebsiteConfig = 'pages' in loadedConfig && loadedConfig.pages;

  // Extract metadata from validated config (always HomepageConfig at this point)
  const generationId = (validatedConfig as { generationId?: string }).generationId || sanitizedName;
  const hotelName =
    (validatedConfig as {
      hotelParameters?: { hotelName?: string };
    }).hotelParameters?.hotelName || sanitizedName;
  const hotelType = (validatedConfig as {
    hotelParameters?: { hotelType?: HotelType };
  }).hotelParameters?.hotelType || 'luxury';
  const designTokens = (validatedConfig as any).designTokens;

  let multipliedConfig: WebsiteConfig;

  if (isLoadedConfigWebsiteConfig) {
    // Story 25.6: Loaded fixture is already WebsiteConfig format
    // It has already been through splitToPages and multiplyContent
    // Validate and use directly
    console.info('[Preview] Loaded fixture is already WebsiteConfig, skipping splitToPages/multiplyContent');

    // Validate the loaded WebsiteConfig
    try {
      // Validate against WebsiteConfigSchema to ensure structure is correct
      const validated = WebsiteConfigSchema.parse(loadedConfig);
      multipliedConfig = validated;

      console.info('[Preview] Using pre-processed WebsiteConfig', {
        sanitizedName,
        pageCount: Object.keys(multipliedConfig.pages).length,
      });
    } catch (error) {
      console.error('[Preview] WebsiteConfig validation failed:', {
        sanitizedName,
        error: error instanceof Error ? error.message : String(error),
      });
      return (
        <PreviewErrorUI
          errorType="load-failed"
          userInput={sanitizedName}
          availableFixtures={availableFixtures}
        />
      );
    }
  } else {
    // Original HomepageConfig format - need to run splitToPages and multiplyContent
    console.info('[Preview] Loaded fixture is HomepageConfig, running splitToPages/multiplyContent');

    // Step 1: Split HomepageConfig into WebsiteConfig (distribute components across pages)
    let websiteConfig: WebsiteConfig;
    try {
      websiteConfig = splitToPages(validatedConfig as any);
      console.info('[Preview] splitToPages completed successfully', {
        sanitizedName,
        pageCount: Object.keys(websiteConfig.pages).length,
      });
    } catch (error) {
      console.error('[Preview] splitToPages failed:', {
        sanitizedName,
        error: error instanceof Error ? error.message : String(error),
      });
      return (
        <PreviewErrorUI
          errorType="load-failed"
          userInput={sanitizedName}
          availableFixtures={availableFixtures}
        />
      );
    }

    // Step 2: Multiply content to realistic volumes using seed for determinism
    try {
      const volumeConfig = VOLUME_CONFIGS[hotelType] || VOLUME_CONFIGS.luxury;
      multipliedConfig = multiplyContent(websiteConfig, {
        volumeConfig,
        seed: generationId,
        hotelType,
        hotelName,
      });
      console.info('[Preview] multiplyContent completed successfully', {
        sanitizedName,
        hotelType,
        volumeConfig,
      });
    } catch (error) {
      console.error('[Preview] multiplyContent failed:', {
        sanitizedName,
        error: error instanceof Error ? error.message : String(error),
      });
      // Graceful degradation: use split config without multiplication
      console.warn('[Preview] Falling back to split config without multiplication');
      multipliedConfig = websiteConfig;
    }
  }

  // Step 3: Page selection with fallback to homepage
  let selectedPage: PageType = 'homepage';
  let selectedRoomSlug: string | undefined;

  // Validate page parameter against valid page types
  if (pageParam && VALID_PAGE_TYPES.includes(pageParam as PageType)) {
    selectedPage = pageParam as PageType;
  } else if (pageParam) {
    // Invalid page parameter - fall back to homepage with debug warning
    console.warn('[Preview] Invalid page parameter provided, falling back to homepage', {
      provided: pageParam,
      validTypes: VALID_PAGE_TYPES,
    });
  }

  // For roomDetail pages, validate room parameter is present
  if (selectedPage === 'roomDetail') {
    if (!roomParam) {
      console.warn('[Preview] roomDetail page requires room parameter, falling back to homepage');
      selectedPage = 'homepage';
    } else {
      selectedRoomSlug = roomParam;
      // Verify the room exists in the config
      const roomDetailPages = multipliedConfig.pages.roomDetail;
      if (!roomDetailPages[selectedRoomSlug]) {
        console.warn('[Preview] Room not found in roomDetail pages, falling back to homepage', {
          roomSlug: selectedRoomSlug,
          availableRooms: Object.keys(roomDetailPages),
        });
        selectedPage = 'homepage';
        selectedRoomSlug = undefined;
      }
    }
  }

  console.info('[Preview] Multi-page pipeline completed successfully', {
    sanitizedName,
    selectedPage,
    selectedRoomSlug,
  });

  // Calculate component count for the selected page (for DebugHeader)
  let componentCount = 0;
  if (selectedPage === 'roomDetail' && selectedRoomSlug) {
    const roomDetailConfig = multipliedConfig.pages.roomDetail[selectedRoomSlug] as any;
    componentCount = roomDetailConfig?.components?.length || 0;
  } else {
    const pageConfig = multipliedConfig.pages[selectedPage] as any;
    componentCount = pageConfig?.components?.length || 0;
  }

  // Extract available room slugs for PageNavigation (when viewing roomDetail pages)
  const availableRoomSlugs = Object.keys(multipliedConfig.pages.roomDetail || {}).sort();

  return (
    <main
      className="min-h-screen bg-surface-primary text-text-primary"
      data-mode="light"
    >
      {/* Epic 20: Apply design tokens (colors, typography, spacing, border radius) as CSS variables */}
      <ThemeApplier hotelId={sanitizedName} designTokens={designTokens}>
      {/* AC5, AC6: Debug Header with metadata display and keyboard shortcut toggle */}
      <DebugHeader
        generationId={generationId}
        hotelName={hotelName}
        componentCount={componentCount}
        initiallyVisible={true}
      />

      {/* Story 25.5: Page navigation UI for multi-page preview */}
      <PageNavigation
        currentPage={selectedPage}
        configName={sanitizedName}
        availableRoomSlugs={availableRoomSlugs}
      />

      {/* Story 25.5: Render selected page's components */}
      {(() => {
        // Get the components for the selected page
        let pageComponents: any[] = [];

        if (selectedPage === 'roomDetail' && selectedRoomSlug) {
          // For roomDetail pages, get the specific room's components
          const roomDetailConfig = multipliedConfig.pages.roomDetail[selectedRoomSlug] as any;
          pageComponents = roomDetailConfig?.components || [];
        } else {
          // For all other pages, get the page's components
          const pageConfig = multipliedConfig.pages[selectedPage] as any;
          pageComponents = pageConfig?.components || [];
        }

        // Handle empty pages - show indicator instead of crashing
        if (pageComponents.length === 0) {
          return (
            <div className="flex items-center justify-center py-gap-xl px-gap-card">
              <div className="text-center">
                <p className="text-lg text-text-primary font-semibold mb-2">
                  No Content for This Page
                </p>
                <p className="text-sm text-text-secondary mb-4">
                  The "{selectedPage}" page has no components configured.
                </p>
                <Link
                  href={`/preview?config=${sanitizedName}`}
                  className="inline-block px-4 py-2 bg-brand-primary text-text-inverted rounded hover:bg-brand-primary-hover transition-colors"
                >
                  Return to Homepage
                </Link>
              </div>
            </div>
          );
        }

        // Sort components by order property and render
        return pageComponents
          .slice()
          .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
          .map((componentConfig: {
            type: string;
            variant: Record<string, unknown>;
            props: Record<string, unknown>;
            order: number;
            wrapper?: SectionWrapperConfig;
          }, index: number) => {
            const Component = COMPONENT_MAP[componentConfig.type as keyof typeof COMPONENT_MAP];

            if (!Component) {
              console.error('[Preview] Unknown component type:', componentConfig.type);
              return null;
            }

            // AC7: Apply security filtering and prop transformation
            const safeProps = transformProps(componentConfig.type, componentConfig.props);
            const safeVariant = filterSafeVariant(componentConfig.variant);

            // Story 18.5: Pass wrapper config through to SectionRenderer
            // Note: wrapper is already validated by HomepageConfigSchema with SectionWrapperContract
            // No additional filtering needed - it's configuration, not component props
            const wrapperConfig = componentConfig.wrapper;

            // Render with SectionRenderer for intelligent wrapping
            // Wrap in div with id for hash-based navigation (#about, #rooms, etc.)
            return (
              <div key={`${componentConfig.type}-${index}`} id={componentConfig.type}>
              <SectionRenderer
                config={{
                  type: componentConfig.type,
                  variant: safeVariant,
                  props: safeProps,
                  order: componentConfig.order,
                  wrapper: wrapperConfig // Story 18.5: Pass wrapper config through
                }}
                Component={Component}
              />
              </div>
            );
          });
      })()}
      </ThemeApplier>
    </main>
  );
}
