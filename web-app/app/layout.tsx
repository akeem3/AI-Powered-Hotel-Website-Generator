import './globals.css';
import {
  Playfair_Display,
  Inter,
  Cormorant_Garamond,
  Libre_Baskerville,
  Space_Grotesk,
  Roboto_Slab,
  Source_Sans_3,
} from 'next/font/google';
import { cn } from '@/lib/utils/utils';
import type { Metadata } from 'next';

/**
 * Story 20.4a: Font Injection Pipeline
 *
 * Pre-loads 7 Google Fonts for all 6 typography personalities.
 * Each font is configured as a CSS variable for runtime selection.
 *
 * Font Mappings:
 * - serif-elegant: Cormorant Garamond (primary) / Playfair Display (fallback)
 * - serif-readable: Libre Baskerville
 * - sans-modern: Inter
 * - display-decorative: Space Grotesk
 * - slab-strong: Roboto Slab
 * - humanist-organic: Source Sans 3
 *
 * CSS Variables:
 * - --font-serif-elegant
 * - --font-serif-readable
 * - --font-sans-modern
 * - --font-display-decorative
 * - --font-slab-strong
 * - --font-humanist-organic
 * - --font-display (legacy, maps to serif-elegant)
 * - --font-body (legacy, maps to sans-modern)
 */

// serif-elegant (primary) - Wide-set serif, all caps headings
const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-serif-elegant',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

// serif-elegant (fallback) - For backward compatibility
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

// serif-readable - Readable serif
const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  variable: '--font-serif-readable',
  display: 'swap',
  weight: ['400', '700'],
});

// sans-modern - Modern sans-serif
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans-modern',
  display: 'swap',
});

// sans-modern (legacy, maps to --font-body)
const interLegacy = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

// display-decorative - Display fonts
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display-decorative',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

// slab-strong - Slab serif
const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  variable: '--font-slab-strong',
  display: 'swap',
  weight: ['100', '300', '400', '500', '700', '900'],
});

// humanist-organic - Humanist sans
const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-humanist-organic',
  display: 'swap',
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'The Sterling Executive Hotel',
  description: 'Luxury redefined for business travelers.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(
      // Story 20.4a: Typography personality fonts
      cormorantGaramond.variable,
      playfair.variable,
      libreBaskerville.variable,
      inter.variable,
      interLegacy.variable,
      spaceGrotesk.variable,
      robotoSlab.variable,
      sourceSans3.variable,
    )}>

      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased bg-surface-primary text-text-primary font-body">
        {children}
      </body>
    </html>
  );
}

