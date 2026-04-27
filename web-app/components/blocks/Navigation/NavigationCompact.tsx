'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { navigationCompactVariants } from '@/lib/cva-variants';
import { NavigationConfig } from '@/lib/contracts/navigation.contract';
import { cn } from '@/lib/utils/utils';
import { useNavigationConfig } from '@/components/providers/NavigationProvider';

interface NavigationCompactProps extends NavigationConfig {
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

export function NavigationCompact(props: NavigationCompactProps) {
  const { brandName, links, ctaButton, logoUrl, ...restProps } = props;
  const { currentLang, isPreview } = useNavigationConfig();
  const pathname = usePathname();
  const normalizedPath = pathname ? pathname.split(/[?#]/)[0] : '';
  const hasSearchOrHash = pathname ? /[?#]/.test(pathname) : false;

  // Mobile menu state
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen((prev) => !prev);

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

  return (
    <nav className={cn(navigationCompactVariants({ style: props.variant?.style }), props.className)}>
      {/* Desktop Navigation: Single row centered-links layout (lg+ breakpoint) */}
      <div className="hidden lg:flex lg:items-center lg:h-full lg:w-full lg:px-6">
        {/* Logo - Left */}
        <Link
          href={homepageHref}
          aria-label="Go to homepage"
          className="flex items-center gap-gap-card focus-ring rounded-lg flex-none"
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

        {/* Center Nav Links - Centered */}
        <ul className="flex-1 flex justify-center gap-gap-section" aria-label="Primary navigation links">
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

        {/* CTA - Right */}
        {ctaButton && (
          <div className="flex-none">
            <Link
              href={ctaHref!}
              className="px-gap-card py-2 bg-brand-secondary text-brand-primary rounded hover:bg-brand-secondary-hover transition-colors focus-ring-inverted"
            >
              {ctaButton.text}
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Navigation: Same as Classic - hamburger menu pattern (< lg breakpoint) */}
      <div className="flex lg:hidden">
        {/* Mobile Navbar Row: Logo (left) + Hamburger (right) */}
        <div className="flex items-center justify-between h-nav-height w-full px-container">
          {/* Logo - Left */}
          <Link
            href={homepageHref}
            aria-label={menuOpen ? 'Go to homepage' : `${brandName} logo`}
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-gap-card focus-ring rounded-lg"
          >
            <span className="bg-brand-secondary rounded-full size-9 flex items-center justify-center text-brand-primary font-bold text-size-caption">
              SE
            </span>
            <span className="text-brand-primary font-bold text-size-body select-none">Sterling Executive</span>
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

            {/* CTA in Mobile Drawer */}
            {ctaButton && (
              <div className="mt-4 text-center">
                <Link
                  href={ctaHref!}
                  onClick={() => setMenuOpen(false)}
                  className="inline-block px-gap-card py-2 bg-brand-secondary text-brand-primary rounded hover:bg-brand-secondary-hover transition-colors focus-ring-inverted"
                >
                  {ctaButton.text}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
