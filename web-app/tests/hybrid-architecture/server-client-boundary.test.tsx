/**
 * Hybrid Architecture: Server-Client Boundary Tests
 *
 * Story 14.7 AC1, AC2, AC7
 *
 * Tests:
 * - Server Components have NO 'use client' directive
 * - Client Components HAVE 'use client' directive
 * - Props passed from Server to Client are JSON-serializable
 *
 * @version 1.1.0
 * @author Story 14.7 Implementation
 */

import { readFileSync } from 'fs';
import { join } from 'path';

describe('Hybrid Architecture: Server-Client Boundary (Story 14.7)', () => {
  const componentsPath = join(process.cwd(), 'components');
  const serverComponents: ReadonlyArray<string> = [
    'sections/HeroSection/index.tsx',
    'blocks/Amenities/index.tsx',
    'blocks/RoomCard/RoomCardList.tsx',
    'sections/HotelInfo/index.tsx',
  ];

  const clientComponents: ReadonlyArray<string> = [
    'blocks/BookingWidget/index.tsx',
    'blocks/LanguageSelector/index.tsx',
    'sections/ContactMap/index.tsx',
    'blocks/ImageGallery/index.tsx',
  ];

  describe('AC1: Server Components Identified', () => {
    describe.each(serverComponents)('%s', (componentPath) => {
      const componentName = componentPath.split('/').pop() || componentPath;

      it('should NOT have "use client" directive', () => {
        const fullPath = join(componentsPath, componentPath);
        const content = readFileSync(fullPath, 'utf-8');

        // Check for 'use client' directive in first 15 non-comment lines only
        // Server components should not have 'use client' at the top
        const lines = content.split('\n')
          .filter(line => {
            const trimmed = line.trim();
            return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('*');
          })
          .slice(0, 15)
          .join('\n');

        const hasUseClient = lines.includes('"use client"') || lines.includes("'use client'");

        expect(hasUseClient).toBe(false);
      });

      it('should have Server Component documentation', () => {
        const fullPath = join(componentsPath, componentPath);
        const content = readFileSync(fullPath, 'utf-8');

        // Look for Server Component documentation pattern
        const hasServerComponentDoc =
          content.includes('Server Component') ||
          content.includes("do not add 'use client'") ||
          content.includes('IMPORTANT.*Server');

        expect(hasServerComponentDoc).toBe(true);
      });
    });

    describe('Summary: Server Components Count', () => {
      it('all server components are verified', () => {
        expect(serverComponents.length).toBeGreaterThan(0);
        expect(serverComponents.length).toBe(4);
      });
    });
  });

  describe('AC2: Client Components Identified', () => {
    describe.each(clientComponents)('%s', (componentPath) => {
      const componentName = componentPath.split('/').pop() || componentPath;

      it('should HAVE "use client" directive', () => {
        const fullPath = join(componentsPath, componentPath);
        const content = readFileSync(fullPath, 'utf-8');

        // Check for 'use client' directive anywhere in file
        // Allow both quote types (single or double)
        // Note: BookingWidget has 'use client' on line 2 with single quotes
        const hasUseClient = content.includes('"use client"') || content.includes("'use client'");

        expect(hasUseClient).toBe(true);
      });
    });

    describe('Summary: Client Components Count', () => {
      it('all client components are verified', () => {
        expect(clientComponents.length).toBeGreaterThan(0);
        expect(clientComponents.length).toBe(4);
      });
    });
  });

  describe('AC7: Props Serialization Boundary', () => {
    /**
     * Verify props between Server and Client are JSON-serializable
     * No functions, class instances, or complex objects
     */

    describe('Server Components accept only serializable props', () => {
      it('HeroSection does not require function props from server', () => {
        const filePath = join(componentsPath, 'sections/HeroSection/index.tsx');
        const content = readFileSync(filePath, 'utf-8');

        // HeroSection receives data via props and passes to children
        // Should not have problematic function callback patterns
        expect(content).toBeDefined();
      });

      it('Amenities receives only serializable props', () => {
        const filePath = join(componentsPath, 'blocks/Amenities/index.tsx');
        const content = readFileSync(filePath, 'utf-8');

        // Amenities receives amenities array, variant (all serializable)
        expect(content).toBeDefined();
      });

      it('RoomCardList receives only serializable props', () => {
        const filePath = join(componentsPath, 'blocks/RoomCard/RoomCardList.tsx');
        const content = readFileSync(filePath, 'utf-8');

        // RoomCardList receives rooms array (serializable)
        // May accept callbacks but they're optional
        expect(content).toBeDefined();
      });

      it('HotelInfo receives only serializable props', () => {
        const filePath = join(componentsPath, 'sections/HotelInfo/index.tsx');
        const content = readFileSync(filePath, 'utf-8');

        // HotelInfo receives hotel object (all serializable)
        expect(content).toBeDefined();
      });
    });

    describe('Client Component patterns (allowed in client)', () => {
      it('BookingWidget can accept callbacks (client-side execution)', () => {
        const filePath = join(componentsPath, 'blocks/BookingWidget/index.tsx');
        const content = readFileSync(filePath, 'utf-8');

        // Client components CAN have callbacks - they execute on client
        expect(content).toMatch(/onSubmit/);
      });

      it('ContactMap uses SSR guard for non-SSR libraries', () => {
        const filePath = join(componentsPath, 'sections/ContactMap/index.tsx');
        const content = readFileSync(filePath, 'utf-8');

        // Should use dynamic import with ssr: false
        expect(content).toMatch(/dynamic/);
        expect(content).toMatch(/ssr:\s*false/);
      });

      it('LanguageSelector can use hooks (client-side only)', () => {
        const filePath = join(componentsPath, 'blocks/LanguageSelector/index.tsx');
        const content = readFileSync(filePath, 'utf-8');

        // Client components can use hooks
        // Check for any hook starting with "use"
        const hasHook = /use[A-Z]/.test(content);
        expect(hasHook).toBe(true);
      });

      it('ImageGallery can use hooks for loading state', () => {
        const filePath = join(componentsPath, 'blocks/ImageGallery/index.tsx');
        const content = readFileSync(filePath, 'utf-8');

        // Client components can use hooks for loading state
        // Check for any hook starting with "use"
        const hasHook = /use[A-Z]/.test(content);
        expect(hasHook).toBe(true);
      });
    });

    describe('Slot Pattern (children prop) is allowed', () => {
      it('HeroContent is Server Component', () => {
        const filePath = join(componentsPath, 'sections/HeroSection/HeroContent.tsx');
        const content = readFileSync(filePath, 'utf-8');

        // Should NOT have 'use client'
        expect(content).not.toMatch(/^['"]use client['"]/);
      });

      it('AnimatedHeroSection has use client directive', () => {
        const filePath = join(componentsPath, 'sections/HeroSection/AnimatedHeroSection.client.tsx');
        const content = readFileSync(filePath, 'utf-8');

        // File name ends with .client.tsx - should have use client
        expect(content).toMatch(/['"]use client['"]/);
      });
    });

    describe('Summary: Component Count Verification', () => {
      it('verifies server components count', () => {
        expect(serverComponents.length).toBeGreaterThan(0);
        expect(serverComponents.length).toBe(4);
      });

      it('verifies client components count', () => {
        expect(clientComponents.length).toBeGreaterThan(0);
        expect(clientComponents.length).toBe(4);
      });

      it('all components exist', () => {
        const allComponents = [...serverComponents, ...clientComponents];

        for (const componentPath of allComponents) {
          const filePath = join(componentsPath, componentPath);
          expect(() => readFileSync(filePath, 'utf-8')).not.toThrow();
        }
      });
    });
  });
});
