'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigationVariants } from '@/lib/cva-variants';
import { cn } from '@/lib/utils/utils';

type NavigationDesktopProps = {
  isMobileMenuOpen?: boolean;
  variant?: {
    style?: 'transparent' | 'solid' | 'glass';
    layout?: 'default' | 'compact' | 'tall';
  };
  currentLang?: string;
};

const getNavLinks = (lang?: string) => {
  // If lang is provided, prefix all links with it
  if (lang) {
    return [
      { href: `/${lang}`, label: 'Home' },
      { href: `/${lang}/rooms`, label: 'Rooms' },
      { href: `/${lang}/contact`, label: 'Contact' },
    ];
  }
  // Default links for root routes (no lang prefix)
  return [
    { href: '/', label: 'Home' },
    { href: '/rooms', label: 'Rooms' },
    { href: '/contact', label: 'Contact' },
  ];
};

export default function NavigationDesktop({ isMobileMenuOpen = false, variant, currentLang }: NavigationDesktopProps) {
  const pathname = usePathname();
  const normalizedPath = pathname ? pathname.split(/[?#]/)[0] : '';
  const hasSearchOrHash = pathname ? /[?#]/.test(pathname) : false;

  // AC4.2: Extract variant properties with defaults
  const { layout = 'default' } = variant || {};

  // AC4.2: Link padding based on navLayout variant
  const navPaddingClasses = {
    compact: 'px-2 py-1',
    default: 'px-4 py-2',
    tall: 'px-4 py-3'
  };

  const navLinks = getNavLinks(currentLang);

  return (
    <div
      className={cn(navigationVariants({ layout }), "hidden md:grid md:grid-cols-[1fr_auto_1fr] items-center w-full")}
      aria-hidden={isMobileMenuOpen ? 'true' : 'false'}
    >
      {/* Logo */}
      <Link
        href={currentLang ? `/${currentLang}` : '/'}
        aria-label="Go to homepage"
        className="flex items-center gap-gap-card focus-ring rounded-lg ml-container justify-self-start"

      >
        <span className="bg-brand-secondary rounded-full size-9 flex items-center justify-center text-brand-primary font-bold text-size-caption">
          SE
        </span>
        <span className="text-brand-primary font-bold text-size-h3 select-none">Sterling Executive</span>
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
                  navPaddingClasses[layout],
                  'rounded text-brand-primary transition-all duration-fast focus-ring',

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
      <div className="hidden md:block mr-container justify-self-end">
        <Link
          href={currentLang ? `/${currentLang}/book` : '/book'}
          className="px-gap-card py-2 bg-brand-secondary text-brand-primary rounded hover:bg-brand-secondary-hover transition-colors focus-ring-inverted"
        >
          Book
        </Link>
      </div>
    </div>
  );
}
