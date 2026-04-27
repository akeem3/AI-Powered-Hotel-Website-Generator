'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X, Calendar, Users } from 'lucide-react';
import { navigationExtendedVariants } from '@/lib/cva-variants';
import { NavigationConfig } from '@/lib/contracts/navigation.contract';
import { cn } from '@/lib/utils/utils';
import { useNavigationConfig } from '@/components/providers/NavigationProvider';

// FIXME: Replace dummy booking widget with BookingWidget component integration in future epic
// FIXME: Mobile booking modal is a placeholder - future epic will integrate actual BookingWidget with form validation

interface NavigationExtendedProps extends NavigationConfig {
  className?: string;
  /** Current locale code for link prefixing (e.g., 'en', 'th', 'zh') */
  currentLang?: string;
  /** @deprecated Use useNavigationConfig() hook instead - currentLang is now detected from context */
}

/** Extract up to 2 initials from a brand name, skipping articles */
function getBrandInitials(name: string): string {
  return name
    .split(' ')
    .filter(w => !['the', 'a', 'an'].includes(w.toLowerCase()))
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function NavigationExtended(props: NavigationExtendedProps) {
  const { brandName, links, ctaButton, logoUrl, ...restProps } = props;
  const { currentLang, isPreview } = useNavigationConfig();
  const pathname = usePathname();
  const normalizedPath = pathname ? pathname.split(/[?#]/)[0] : '';
  const hasSearchOrHash = pathname ? /[?#]/.test(pathname) : false;

  // Mobile menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  // Mobile booking modal state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const openBookingModal = () => setBookingModalOpen(true);
  const closeBookingModal = () => setBookingModalOpen(false);

  const initials = getBrandInitials(brandName);

  // Prefix links with language if needed (only in production, not preview)
  const navLinks = (currentLang && !isPreview)
    ? links.map(l => ({ ...l, href: `/${currentLang}${l.href}` }))
    : links;

  // Homepage href: /preview in preview mode, /{lang} in production, / root otherwise
  const homepageHref = isPreview ? '/preview' : (currentLang ? `/${currentLang}` : '/');
  const ctaHref = ctaButton
    ? (currentLang && !isPreview ? `/${currentLang}${ctaButton.href}` : ctaButton.href)
    : undefined;

  // Escape key handler to close booking modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && bookingModalOpen) {
        closeBookingModal();
      }
    };

    if (bookingModalOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [bookingModalOpen]);

  return (
    <nav className={cn(navigationExtendedVariants({ style: props.variant?.style }), props.className)}>
      {/* Desktop Navigation: Two-row asymmetric layout (lg+ breakpoint) */}
      <div className="hidden lg:block w-full">
        {/* Row 1: Logo (top-left) + Nav links (top-right) */}
        <div className="flex items-center justify-between w-full px-container py-gap-card">
          {/* Logo - Left */}
          <Link
            href={homepageHref}
            aria-label="Go to homepage"
            className="flex items-center gap-gap-card focus-ring rounded-lg"
          >
            {logoUrl ? (
              <img src={logoUrl} alt={brandName} className="h-9 w-auto object-contain" />
            ) : (
              <span className="bg-brand-secondary rounded-full size-9 flex items-center justify-center text-brand-primary font-bold text-size-caption">
                {initials}
              </span>
            )}
            <span className="text-brand-primary font-bold text-size-h3 select-none">{brandName}</span>
          </Link>

          {/* Nav Links - Right */}
          <ul className="flex gap-gap-section" aria-label="Primary navigation links">
            {navLinks.map(({ href, label }) => {
              const isActive = normalizedPath === href && !hasSearchOrHash;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'px-4 py-2 rounded text-brand-primary transition-all duration-fast focus-ring',
                      isActive ? 'font-semibold underline' : 'hover:font-semibold'
                    )}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Row 2: Full-width dummy booking widget bar */}
        <div className="bg-surface-primary border-t border-border-default shadow-sm px-container py-gap-card">
          <div className="flex items-center justify-between gap-gap-card max-w-7xl mx-auto">
            {/* Dates selector (static HTML - no functionality) */}
            <div className="flex items-center gap-gap-card">
              <div className="flex items-center gap-2 px-4 py-2 bg-surface-elevated rounded-lg border border-border-default">
                <Calendar className="w-5 h-5 text-text-muted" aria-hidden="true" />
                <div className="flex flex-col">
                  <span className="text-size-caption text-text-muted">Check-in</span>
                  <span className="text-size-body text-text-primary font-medium">Select dates</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-surface-elevated rounded-lg border border-border-default">
                <Calendar className="w-5 h-5 text-text-muted" aria-hidden="true" />
                <div className="flex flex-col">
                  <span className="text-size-caption text-text-muted">Check-out</span>
                  <span className="text-size-body text-text-primary font-medium">Select dates</span>
                </div>
              </div>
            </div>

            {/* Rooms & guests dropdown (static HTML - no functionality) */}
            <div className="flex items-center gap-2 px-4 py-2 bg-surface-elevated rounded-lg border border-border-default">
              <Users className="w-5 h-5 text-text-muted" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="text-size-caption text-text-muted">Rooms & Guests</span>
                <span className="text-size-body text-text-primary font-medium">2 Guests, 1 Room</span>
              </div>
            </div>

            {/* Special rates dropdown (static HTML - no functionality) */}
            <div className="px-4 py-2 bg-surface-elevated rounded-lg border border-border-default">
              <span className="text-size-body text-text-primary font-medium">Special Rates</span>
              <span className="text-size-caption text-text-muted ml-2">Corporate ▼</span>
            </div>

            {/* Book CTA button (static HTML - no functionality) */}
            <button
              className="px-gap-card py-3 bg-brand-secondary text-brand-primary rounded-lg font-semibold hover:bg-brand-secondary-hover transition-colors focus-ring-inverted whitespace-nowrap"
              type="button"
              aria-label="Check availability for booking"
            >
              Check Availability
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation: Single row + floating Book Now button + booking modal (< lg breakpoint) */}
      <div className="lg:hidden w-full">
        {/* Mobile Navbar Row: Logo (left) + Hamburger (right) */}
        <div className="flex items-center justify-between h-nav-height px-container">
          {/* Logo - Left */}
          <Link
            href={homepageHref}
            aria-label={menuOpen ? 'Go to homepage' : `${brandName} logo`}
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-gap-card focus-ring rounded-lg"
          >
            {logoUrl ? (
              <img src={logoUrl} alt={brandName} className="h-9 w-auto object-contain" />
            ) : (
              <span className="bg-brand-secondary rounded-full size-9 flex items-center justify-center text-brand-primary font-bold text-size-caption">
                {initials}
              </span>
            )}
            <span className="text-brand-primary font-bold text-size-body select-none">{brandName}</span>
          </Link>

          {/* Hamburger Button - Right */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            className="text-brand-primary hover:bg-brand-secondary/subtle"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? (
              <X className="size-6" aria-hidden="true" />
            ) : (
              <Menu className="size-6" aria-hidden="true" />
            )}
          </Button>
        </div>

        {/* Mobile Drawer - Hamburger Menu */}
        {menuOpen && (
          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            className="absolute top-nav-height left-0 w-full bg-surface-primary shadow-lg rounded-b-lg p-4 animate-in fade-in duration-standard z-sticky"
          >
            <ul className="flex flex-col items-center space-y-4">
              {navLinks.map(({ href, label }) => {
                const isActive = normalizedPath === href && !hasSearchOrHash;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        'block w-full text-center px-gap-card py-gap-card rounded text-brand-primary transition-all duration-fast focus-ring',
                        isActive ? 'font-semibold underline' : 'hover:font-semibold'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Floating "Book Now" Button - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-surface-primary/95 backdrop-blur-sm border-t border-border-default z-40">
          <button
            onClick={openBookingModal}
            className="w-full px-gap-card py-4 bg-brand-secondary text-brand-primary rounded-xl font-bold text-size-body hover:bg-brand-secondary-hover transition-colors focus-ring-inverted shadow-lg"
            type="button"
            aria-label="Open booking modal"
          >
            Book Now
          </button>
        </div>

        {/* Full-Page Booking Modal */}
        {bookingModalOpen && (
          <div
            className="fixed inset-0 z-modal flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Book your stay"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={closeBookingModal}
              aria-hidden="true"
            />

            {/* Modal Content */}
            <div className="relative w-full h-full bg-surface-primary flex flex-col animate-in slide-in-from-bottom duration-300">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-container py-gap-card border-b border-border-default bg-surface-primary">
                <button
                  onClick={closeBookingModal}
                  className="flex items-center gap-2 text-brand-primary hover:bg-brand-secondary/subtle px-3 py-2 rounded-lg transition-colors focus-ring"
                  type="button"
                  aria-label="Go back"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                  <span className="font-medium">Back</span>
                </button>
                <h2 className="text-size-h3 font-semibold text-text-primary">Book Your Stay</h2>
                <button
                  onClick={closeBookingModal}
                  className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-secondary rounded-lg transition-colors focus-ring"
                  type="button"
                  aria-label="Close booking modal"
                >
                  <X className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>

              {/* Modal Body - Form Fields */}
              <div className="flex-1 overflow-y-auto px-container py-gap-card space-y-gap-card">
                {/* Check-in Date */}
                <div className="bg-surface-elevated rounded-xl p-4 border border-border-default">
                  <label className="block text-size-caption text-text-muted mb-2">Check-in</label>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-brand-primary" aria-hidden="true" />
                    <span className="text-size-body text-text-primary font-medium">Select dates</span>
                  </div>
                </div>

                {/* Check-out Date */}
                <div className="bg-surface-elevated rounded-xl p-4 border border-border-default">
                  <label className="block text-size-caption text-text-muted mb-2">Check-out</label>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-brand-primary" aria-hidden="true" />
                    <span className="text-size-body text-text-primary font-medium">Select dates</span>
                  </div>
                </div>

                {/* Guests & Rooms */}
                <div className="bg-surface-elevated rounded-xl p-4 border border-border-default">
                  <label className="block text-size-caption text-text-muted mb-2">Guests & Rooms</label>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-brand-primary" aria-hidden="true" />
                    <div>
                      <span className="text-size-body text-text-primary font-medium">2 Guests</span>
                      <span className="text-text-muted mx-2">•</span>
                      <span className="text-size-body text-text-primary font-medium">1 Room</span>
                    </div>
                  </div>
                </div>

                {/* Room Type */}
                <div className="bg-surface-elevated rounded-xl p-4 border border-border-default">
                  <label className="block text-size-caption text-text-muted mb-2">Room Type</label>
                  <div className="flex items-center justify-between">
                    <span className="text-size-body text-text-primary font-medium">Standard Room</span>
                    <span className="text-text-muted">▼</span>
                  </div>
                </div>

                {/* Special Rates */}
                <div className="bg-surface-elevated rounded-xl p-4 border border-border-default">
                  <label className="block text-size-caption text-text-muted mb-2">Special Rates</label>
                  <div className="flex items-center justify-between">
                    <span className="text-size-body text-text-primary font-medium">Corporate Rate</span>
                    <span className="text-text-muted">▼</span>
                  </div>
                </div>
              </div>

              {/* Modal Footer - CTA Button */}
              <div className="px-container py-gap-card border-t border-border-default bg-surface-primary">
                <button
                  className="w-full px-gap-card py-4 bg-brand-secondary text-brand-primary rounded-xl font-bold text-size-body hover:bg-brand-secondary-hover transition-colors focus-ring-inverted shadow-lg"
                  type="button"
                  aria-label="Check availability for booking"
                >
                  Check Availability
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
