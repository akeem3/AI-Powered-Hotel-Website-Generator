'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { navigationClassicVariants } from '@/lib/cva-variants';
import { NavigationConfig } from '@/lib/contracts/navigation.contract';
import { cn } from '@/lib/utils/utils';
import { useNavigationConfig } from '@/components/providers/NavigationProvider';

interface NavigationClassicProps extends NavigationConfig {
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

export function NavigationClassic(props: NavigationClassicProps) {
  const { brandName, links, ctaButton, logoUrl, className: _className, ...restProps } = props;
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
    <nav className={cn(navigationClassicVariants({ style: props.variant?.style }), props.className)}>
      {/* Desktop Navigation */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] items-center h-full w-full">
        {/* Logo */}
        <Link
          href={homepageHref}
          aria-label="Go to homepage"
          className="flex items-center gap-gap-card focus-ring rounded-lg ml-container justify-self-start"
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

        {/* Center Nav */}
        <ul className="flex gap-gap-section justify-self-center" aria-label="Primary navigation links">
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

        {/* CTA */}
        {ctaButton && (
          <div className="mr-container justify-self-end">
            <Link
              href={ctaHref!}
              className="px-gap-card py-2 bg-brand-secondary text-brand-primary rounded hover:bg-brand-secondary-hover transition-colors focus-ring-inverted"
            >
              {ctaButton.text}
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      <div className="flex items-center justify-between h-nav-height lg:hidden">
        {/* Logo */}
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

        {/* Hamburger Button */}
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

        {/* Mobile Drawer */}
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
      </div>
    </nav>
  );
}
