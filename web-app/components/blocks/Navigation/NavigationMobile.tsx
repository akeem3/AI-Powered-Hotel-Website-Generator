'use client';

import { Dispatch, SetStateAction } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils/utils';


interface NavigationMobileProps {
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  currentLang?: string;
}

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

export default function NavigationMobile({ menuOpen, setMenuOpen, currentLang }: NavigationMobileProps) {
  const pathname = usePathname();
  const normalizedPath = pathname ? pathname.split(/[?#]/)[0] : '';
  const hasSearchOrHash = pathname ? /[?#]/.test(pathname) : false;

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const navLinks = getNavLinks(currentLang);

  return (
    <div className="flex items-center justify-between h-nav-height md:hidden">
      {/* Logo */}
      <Link
        href={currentLang ? `/${currentLang}` : '/'}
        aria-label={menuOpen ? 'Go to homepage' : 'Sterling Executive logo'}
        onClick={() => setMenuOpen(false)}
        className="flex items-center gap-gap-card focus-ring rounded-lg"

      >
        <span className="bg-brand-secondary rounded-full size-9 flex items-center justify-center text-brand-primary font-bold text-size-caption">
          SE
        </span>
        <span className="text-brand-primary font-bold text-size-body select-none">Sterling Executive</span>
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
  );
}
