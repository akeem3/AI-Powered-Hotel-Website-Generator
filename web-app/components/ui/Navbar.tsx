'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import NavigationDesktop from '@/components/blocks/Navigation/NavigationDesktop';
import NavigationMobile from '@/components/blocks/Navigation/NavigationMobile';

interface NavbarProps {
  currentLang?: string;
}

export default function Navbar({ currentLang }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Auto-detect lang from pathname if not provided
  // Routes like /en, /th, /tr should have their lang extracted
  const detectedLang = currentLang || (() => {
    // Handle undefined pathname gracefully (can happen in some test scenarios)
    if (!pathname) return undefined;

    const segments = pathname.split('/');
    // Check if first segment is a supported locale (2-letter code)
    if (segments.length > 1 && segments[1] && /^[a-z]{2}$/.test(segments[1])) {
      return segments[1];
    }
    return undefined;
  })();

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-nav bg-surface-primary shadow-md" role="banner">

      {/* Accessibility: Skip Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only absolute top-gap-card/2 left-gap-card/2 bg-brand-secondary text-text-inverted px-gap-card py-2 rounded-xl z-nav"


      >
        Skip to main content
      </a>

      <nav
        className="w-full"

        role="navigation"
        aria-label="Primary site navigation"
      >
        <NavigationMobile menuOpen={menuOpen} setMenuOpen={setMenuOpen} currentLang={detectedLang} />
        <NavigationDesktop isMobileMenuOpen={menuOpen} currentLang={detectedLang} />
      </nav>
    </header>
  );
}
