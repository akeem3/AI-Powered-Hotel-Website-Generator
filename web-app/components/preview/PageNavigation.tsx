/**
 * Page Navigation Component
 *
 * @trace epic: EPIC-25
 * @trace story: STORY-25.5
 * @trace reqs: Multi-page navigation support
 *
 * Why: Provides development-only page navigation UI for switching between pages
 * in multi-page website preview. Displays tabs for all available page types and
 * links to navigate between them using query parameters.
 *
 * Story 25.5: Adds navigation UI for previewing different pages of a generated
 * hotel website. Each page type has its own tab that links to the appropriate
 * URL with query parameters.
 *
 * Features:
 * - Horizontal tab list with page names
 * - Each tab links to /preview?config={name}&page={type}
 * - Current page highlighted as active
 * - Room detail pages show nested list of available room slugs
 * - Development-only visibility (respects PREVIEW_ENABLED)
 *
 * @example
 * ```tsx
 * <PageNavigation
 *   currentPage="rooms"
 *   configName="pemberton-grand"
 *   availableRoomSlugs={["deluxe-suite", "ocean-view"]}
 * />
 * ```
 */

'use client';

import Link from 'next/link';
import { type PageType } from '@/lib/generation/split-to-pages';
import { VALID_PAGE_TYPES } from '@/lib/preview/constants';

/**
 * Display names for page types
 *
 * User-friendly labels displayed in the navigation UI.
 */
const PAGE_DISPLAY_NAMES: Record<PageType, string> = {
  homepage: 'Home',
  rooms: 'Rooms',
  roomDetail: 'Room Details',
  gallery: 'Gallery',
  amenities: 'Amenities',
  reviews: 'Reviews',
  contact: 'Contact',
  about: 'About',
  faq: 'FAQ',
};

/**
 * Props for PageNavigation component
 */
export interface PageNavigationProps {
  /** The currently selected page type */
  currentPage: PageType;
  /** The configuration name being previewed */
  configName: string;
  /** Available room slugs (only used when currentPage is 'roomDetail') */
  availableRoomSlugs?: string[];
}

/**
 * Page Navigation Component
 *
 * Displays a horizontal navigation bar with tabs for each page type.
 * The current page is highlighted as active. When viewing the roomDetail
 * page, shows a nested list of available rooms.
 *
 * Only renders in development mode or when PREVIEW_ENABLED is true.
 */
export function PageNavigation({
  currentPage,
  configName,
  availableRoomSlugs = [],
}: PageNavigationProps) {
  // Environment gate: only render in development
  const isDevelopment =
    process.env.NODE_ENV === 'development' ||
    process.env.PREVIEW_ENABLED === 'true';

  if (!isDevelopment) {
    return null;
  }

  // Build the base URL for navigation links
  const baseUrl = `/preview?config=${configName}`;

  return (
    <nav
      className="border-b border-border-subtle bg-surface-elevated sticky top-0 z-40 shadow-sm"
      aria-label="Page navigation"
    >
      <div className="max-w-screen-xl mx-auto px-gap-card">
        {/* Horizontal tab list */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-border-default scrollbar-track-transparent hover:scrollbar-thumb-border-hover">
          {VALID_PAGE_TYPES.map((pageType) => {
            const isActive = currentPage === pageType;
            const displayName = PAGE_DISPLAY_NAMES[pageType];

            // Skip roomDetail in main navigation - it's accessed via individual rooms
            if (pageType === 'roomDetail') {
              return null;
            }

            return (
              <Link
                key={pageType}
                href={`${baseUrl}&page=${pageType}`}
                className={`
                  px-4 py-2 rounded-sm text-sm font-medium transition-all duration-150
                  whitespace-nowrap border border-transparent
                  ${isActive
                    ? 'bg-brand-primary text-text-inverted shadow-sm'
                    : 'bg-surface-primary text-text-primary hover:bg-surface-hover hover:border-border-default'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                {displayName}
              </Link>
            );
          })}
        </div>

        {/* Room detail pages nested list */}
        {currentPage === 'roomDetail' && availableRoomSlugs.length > 0 && (
          <div className="border-t border-border-subtle py-2">
            <p className="text-xs text-text-secondary uppercase tracking-wide font-semibold mb-2 px-1">
              Available Rooms
            </p>
            <div className="flex flex-wrap gap-2">
              {availableRoomSlugs.map((slug) => (
                <Link
                  key={slug}
                  href={`${baseUrl}&page=roomDetail&room=${slug}`}
                  className="px-3 py-1 text-xs bg-surface-primary border border-border-default rounded hover:bg-surface-hover hover:border-border-subtle transition-all duration-150"
                >
                  {slug}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

/**
 * Minimal page badge variant
 *
 * Smaller version for inline use when full navigation bar is not needed.
 * Shows current page name with link to return to homepage.
 */
export interface PageBadgeProps {
  /** The currently selected page type */
  currentPage: PageType;
  /** The configuration name being previewed */
  configName: string;
}

export function PageBadge({ currentPage, configName }: PageBadgeProps) {
  const isDevelopment =
    process.env.NODE_ENV === 'development' ||
    process.env.PREVIEW_ENABLED === 'true';

  if (!isDevelopment) {
    return null;
  }

  const displayName = PAGE_DISPLAY_NAMES[currentPage];
  const baseUrl = `/preview?config=${configName}`;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-elevated border border-border-default rounded-full text-xs">
      <Link
        href={`${baseUrl}&page=homepage`}
        className="text-text-secondary hover:text-text-primary transition-colors"
      >
        All Pages
      </Link>
      <span className="text-text-tertiary">•</span>
      <span className="font-semibold text-text-primary">{displayName}</span>
    </div>
  );
}

export default PageNavigation;
