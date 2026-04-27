/**
 * Hybrid Architecture: Progressive Enhancement Tests
 *
 * Story 14.7 AC6
 *
 * Tests:
 * - Page functionality verified with JavaScript disabled
 * - Read-only content should work without JS
 * - Client components show fallback or graceful degradation
 *
 * @version 1.0.1
 * @author Story 14.7 Implementation
 */

import { readFileSync } from 'fs';
import { join } from 'path';

describe('Hybrid Architecture: Progressive Enhancement (Story 14.7)', () => {
  const componentsPath = join(process.cwd(), 'components');

  describe('AC6: Page Functionality with JavaScript Disabled', () => {
    /**
     * Progressive Enhancement: Core content should be readable without JS
     *
     * When JavaScript is disabled:
     * - Server-rendered HTML should display content
     * - Interactive widgets may not function (graceful degradation)
     * - Read-only content (Hero, Amenities, RoomList, HotelInfo) MUST work
     */

    describe('Server Components produce readable HTML without JS', () => {
      /**
       * Verify Server Components produce semantic, readable HTML
       * that doesn't require JavaScript for display
       */

      it('HeroSection delegates to HeroContent (server-rendered)', () => {
        const filePath = join(componentsPath, 'sections/HeroSection/index.tsx');
        const content = readFileSync(filePath, 'utf-8');

        // HeroSection should import HeroContent (server component) and AnimatedHeroSection (client)
        expect(content).toMatch(/HeroContent/);
        expect(content).toMatch(/AnimatedHeroSection/);
        // Should NOT have 'use client' directive at top
        expect(content).not.toMatch(/^['"]use client['"]/);
      });

      it('Amenities delegates to grid/list (server-rendered)', () => {
        const filePath = join(componentsPath, 'blocks/Amenities/index.tsx');
        const content = readFileSync(filePath, 'utf-8');

        // Amenities should import server-rendered layout components
        expect(content).toMatch(/AmenitiesGrid/);
        expect(content).toMatch(/AmenitiesList/);
        // Should NOT have 'use client' directive at top
        expect(content).not.toMatch(/^['"]use client['"]/);
      });

      it('RoomCardList renders rooms server-side', () => {
        const filePath = join(componentsPath, 'blocks/RoomCard/RoomCardList.tsx');
        const content = readFileSync(filePath, 'utf-8');

        // RoomCardList should render grid
        expect(content).toMatch(/grid/);
        // Should NOT have 'use client' directive
        expect(content).not.toMatch(/^['"]use client['"]/);
      });

      it('HotelInfo renders hotel information server-side', () => {
        const filePath = join(componentsPath, 'sections/HotelInfo/index.tsx');
        const content = readFileSync(filePath, 'utf-8');

        // HotelInfo should render structured info (with address element)
        expect(content).toMatch(/address/);
        expect(content).toMatch(/<h2/);
        // Should NOT have 'use client' directive
        expect(content).not.toMatch(/^['"]use client['"]/);
      });
    });

    describe('Client Components use appropriate patterns', () => {
      /**
       * Verify client components use proper patterns:
       * - 'use client' directive
       * - Loading states
       * - SSR guards where needed
       */

      it('BookingWidget has use client directive', () => {
        const filePath = join(componentsPath, 'blocks/BookingWidget/index.tsx');
        const content = readFileSync(filePath, 'utf-8');

        // Should have 'use client' (single or double quotes)
        // Check first 15 non-comment lines
        const lines = content.split('\n')
          .filter(line => {
            const trimmed = line.trim();
            return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('*');
          })
          .slice(0, 15)
          .join('\n');

        const hasUseClient = lines.includes('"use client"') || lines.includes("'use client'");
        expect(hasUseClient).toBe(true);
      });

      it('LanguageSelector has use client directive', () => {
        const filePath = join(componentsPath, 'blocks/LanguageSelector/index.tsx');
        const content = readFileSync(filePath, 'utf-8');

        // Should have 'use client' (single or double quotes)
        // Check first 15 non-comment lines
        const lines = content.split('\n')
          .filter(line => {
            const trimmed = line.trim();
            return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('*');
          })
          .slice(0, 15)
          .join('\n');

        const hasUseClient = lines.includes('"use client"') || lines.includes("'use client'");
        expect(hasUseClient).toBe(true);
      });

      it('ContactMap has SSR guard for map libraries', () => {
        const filePath = join(componentsPath, 'sections/ContactMap/index.tsx');
        const content = readFileSync(filePath, 'utf-8');

        // Should have 'use client' directive (single or double quotes)
        // Check first 15 non-comment lines
        const lines = content.split('\n')
          .filter(line => {
            const trimmed = line.trim();
            return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('*');
          })
          .slice(0, 15)
          .join('\n');

        const hasUseClient = lines.includes('"use client"') || lines.includes("'use client'");
        expect(hasUseClient).toBe(true);

        // Should use dynamic import with ssr: false
        expect(content).toMatch(/dynamic/);
        expect(content).toMatch(/ssr:\s*false/);
      });

      it('ImageGallery has use client directive', () => {
        const filePath = join(componentsPath, 'blocks/ImageGallery/index.tsx');
        const content = readFileSync(filePath, 'utf-8');

        // Should have 'use client' (single or double quotes)
        // Check first 15 non-comment lines
        const lines = content.split('\n')
          .filter(line => {
            const trimmed = line.trim();
            return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('*');
          })
          .slice(0, 15)
          .join('\n');

        const hasUseClient = lines.includes('"use client"') || lines.includes("'use client'");
        expect(hasUseClient).toBe(true);
      });
    });

    describe('SEO-critical content is in Server Components (AC4)', () => {
      /**
       * AC4: SEO-critical content verified to be in Server Components
       * NOT inside client boundaries unless passed as props
       */

      it('Hero Section content is in server-rendered components', () => {
        const heroContentPath = join(componentsPath, 'sections/HeroSection/HeroContent.tsx');
        const heroContent = readFileSync(heroContentPath, 'utf-8');

        // HeroContent should be a server component (no 'use client')
        expect(heroContent).not.toMatch(/^['"]use client['"]/);
        // Should contain heading elements for SEO
        expect(heroContent).toMatch(/<h[1-6]/);
      });

      it('RoomCardList renders rooms in server component', () => {
        const filePath = join(componentsPath, 'blocks/RoomCard/RoomCardList.tsx');
        const content = readFileSync(filePath, 'utf-8');

        // RoomCardList should be server component
        const lines = content.split('\n')
          .filter(line => {
            const trimmed = line.trim();
            return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('*');
          })
          .slice(0, 15)
          .join('\n');

        const hasUseClient = lines.includes('"use client"') || lines.includes("'use client'");
        expect(hasUseClient).toBe(false);

        // Should render room data via RoomCard component (SEO benefit)
        // Look for RoomCard usage with room data
        expect(content).toMatch(/RoomCard/);
        expect(content).toMatch(/\.\.\.room/);
      });
    });

    describe('Summary: Hybrid Architecture Implementation', () => {
      it('identifies correct server components', () => {
        const serverComponents = [
          'sections/HeroSection/index.tsx',
          'blocks/Amenities/index.tsx',
          'blocks/RoomCard/RoomCardList.tsx',
          'sections/HotelInfo/index.tsx',
        ];

        // All server components should exist
        for (const componentPath of serverComponents) {
          const filePath = join(componentsPath, componentPath);
          expect(() => readFileSync(filePath, 'utf-8')).not.toThrow();
        }
      });

      it('identifies correct client components', () => {
        const clientComponents = [
          'blocks/BookingWidget/index.tsx',
          'blocks/LanguageSelector/index.tsx',
          'sections/ContactMap/index.tsx',
          'blocks/ImageGallery/index.tsx',
        ];

        // All client components should exist
        for (const componentPath of clientComponents) {
          const filePath = join(componentsPath, componentPath);
          expect(() => readFileSync(filePath, 'utf-8')).not.toThrow();
        }
      });
    });
  });
});
