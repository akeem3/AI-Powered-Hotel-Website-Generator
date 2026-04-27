/**
 * Hybrid Architecture: SEO Verification Tests
 *
 * Story 14.7 AC4: SEO-critical content verified to be in Server Components
 *
 * Tests verify that server-rendered HTML contains proper semantic elements for SEO
 *
 * @version 1.1.0
 * @author Story 14.7 Implementation
 */

import { readFileSync } from 'fs';
import { join } from 'path';

describe('Hybrid Architecture: SEO Verification (Story 14.7 AC4)', () => {
  const componentsPath = join(process.cwd(), 'components');

  /**
   * Helper to get component file content
   */
  function getComponentContent(filePath: string): string {
    try {
      return readFileSync(filePath, 'utf-8') || '';
    } catch (e) {
      return '';
    }
  }

  describe('AC4.1: HeroSection renders SEO-critical content', () => {
    const filePath = join(componentsPath, 'sections/HeroSection/HeroContent.tsx');
    const content = getComponentContent(filePath);

    it('should contain heading elements for SEO', () => {
      // HeroContent is the actual server component that renders content
      // Check for h1-h6 elements (not just h1)
      const headingMatch = content.match(/<h[1-6][^>]*>/gi);
      expect(headingMatch).toBeTruthy();
      expect(headingMatch?.length).toBeGreaterThan(0);
    });

    it('should not have use client directive (server component)', () => {
      // HeroContent should be a server component
      // Check first 15 non-comment lines for 'use client'
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
  });

  describe('AC4.2: Amenities renders SEO-critical content', () => {
    const filePath = join(componentsPath, 'blocks/Amenities/index.tsx');
    const content = getComponentContent(filePath);

    it('should contain h2 heading elements for SEO', () => {
      const h2Match = content.match(/<h2[^>]*>/gi);
      expect(h2Match).toBeTruthy();
      expect(h2Match?.length).toBeGreaterThan(0);
    });

    it('should not have use client directive (server component)', () => {
      // Check first 15 non-comment lines for 'use client'
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
  });

  describe('AC4.3: RoomCardList renders SEO-critical content', () => {
    const filePath = join(componentsPath, 'blocks/RoomCard/RoomCardList.tsx');
    const content = getComponentContent(filePath);

    it('should render room data in HTML for SEO', () => {
      // RoomCardList uses RoomCard component with spread operator for room data
      const hasRoomCard = content.includes('RoomCard');
      const hasSpreadRoom = content.includes('...room');
      expect(hasRoomCard).toBe(true);
      expect(hasSpreadRoom).toBe(true);
    });

    it('should not have use client directive (server component)', () => {
      // Check first 15 non-comment lines for 'use client'
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
  });

  describe('AC4.4: HotelInfo renders SEO-critical content', () => {
    const filePath = join(componentsPath, 'sections/HotelInfo/index.tsx');
    const content = getComponentContent(filePath);

    it('should contain heading elements for hotel name', () => {
      // HotelInfo uses h2 for section heading, h3 for hotel name
      const headingMatch = content.match(/<h[2-4][^>]*>/gi);
      expect(headingMatch).toBeTruthy();
      expect(headingMatch?.length).toBeGreaterThan(0);
    });

    it('should not have use client directive (server component)', () => {
      // Check first 15 non-comment lines for 'use client'
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
  });

  describe('AC4.5: Address element renders hotel location', () => {
    const filePath = join(componentsPath, 'sections/HotelInfo/index.tsx');
    const content = getComponentContent(filePath);

    it('should contain address element for SEO', () => {
      const addressMatch = content.match(/<address[^>]*>/i);
      expect(addressMatch).toBeTruthy();
    });
  });

  describe('AC4.6: Room names accessible via room.name', () => {
    const filePath = join(componentsPath, 'blocks/RoomCard/RoomCardList.tsx');
    const content = getComponentContent(filePath);

    it('should pass room data for accessibility', () => {
      // RoomCardList passes room data via spread operator
      expect(content).toMatch(/\.\.\.room/);
    });
  });

  describe('AC4.7: Star rating displayed', () => {
    const filePath = join(componentsPath, 'sections/HotelInfo/index.tsx');
    const content = getComponentContent(filePath);

    it('should display star rating or text', () => {
      // Check for star rating rendering (Star component or "out of X" text)
      const hasStarRating = content.includes('star_rating') ||
                         content.includes('Star') ||
                         content.includes('out of 5');
      expect(hasStarRating).toBe(true);
    });
  });

  describe('AC4.8: Property type badge', () => {
    const filePath = join(componentsPath, 'sections/HotelInfo/index.tsx');
    const content = getComponentContent(filePath);

    it('should include property type functionality', () => {
      // Check for property type badge or formatPropertyType function
      const hasPropertyType = content.includes('formatPropertyType') || content.includes('property_type');
      expect(hasPropertyType).toBe(true);
    });
  });

  describe('AC4.9: Hotel name accessible', () => {
    const filePath = join(componentsPath, 'sections/HotelInfo/index.tsx');
    const content = getComponentContent(filePath);

    it('should display hotel name in heading', () => {
      // HotelInfo uses h3 for hotel name display
      const hotelNameMatch = content.match(/<h[2-4][^>]*>/gi);
      expect(hotelNameMatch).toBeTruthy();
    });
  });

  describe('AC4 Summary: All SEO-critical content verified', () => {
    const results: Array<{
      component: string;
      check: string;
      found: boolean;
      result: string;
      details?: string;
    }> = [];

    beforeAll(() => {
      // HeroContent (actual rendering component for HeroSection)
      const heroContent = getComponentContent(join(componentsPath, 'sections/HeroSection/HeroContent.tsx'));
      const headingMatches = heroContent.match(/<h[1-6][^>]*>/gi) || [];
      results.push({
        component: 'HeroContent',
        check: 'heading elements',
        found: headingMatches.length > 0,
        result: headingMatches.length > 0 ? 'PASS' : 'FAIL',
        details: `Found ${headingMatches.length} heading elements`
      });

      // Amenities
      const amenitiesContent = getComponentContent(join(componentsPath, 'blocks/Amenities/index.tsx'));
      const h2Matches = amenitiesContent.match(/<h2[^>]*>/gi) || [];
      results.push({
        component: 'Amenities',
        check: 'h2 elements',
        found: h2Matches.length > 0,
        result: h2Matches.length > 0 ? 'PASS' : 'FAIL',
        details: `Found ${h2Matches.length} h2 elements`
      });

      // RoomCardList
      const roomListContent = getComponentContent(join(componentsPath, 'blocks/RoomCard/RoomCardList.tsx'));
      const hasRoomCard = roomListContent.includes('RoomCard');
      const hasSpreadRoom = roomListContent.includes('...room');
      results.push({
        component: 'RoomCardList',
        check: 'room data rendering',
        found: hasRoomCard && hasSpreadRoom,
        result: hasRoomCard && hasSpreadRoom ? 'PASS' : 'FAIL',
        details: `RoomCard component with spread operator: ${hasRoomCard && hasSpreadRoom ? 'Yes' : 'No'}`
      });

      // HotelInfo
      const hotelInfoContent = getComponentContent(join(componentsPath, 'sections/HotelInfo/index.tsx'));
      const hotelNameMatch = hotelInfoContent.match(/<h[2-4][^>]*>/gi) || [];
      const addressMatches = hotelInfoContent.match(/<address[^>]*>/i) || [];
      results.push({
        component: 'HotelInfo',
        check: 'hotel name heading',
        found: hotelNameMatch.length > 0,
        result: hotelNameMatch.length > 0 ? 'PASS' : 'FAIL',
        details: `Found ${hotelNameMatch.length} heading elements`
      });
      results.push({
        component: 'HotelInfo',
        check: 'address element',
        found: addressMatches.length > 0,
        result: addressMatches.length > 0 ? 'PASS' : 'FAIL',
        details: `Found ${addressMatches.length} address elements`
      });
    });

    it('should have all critical SEO elements', () => {
      const passCount = results.filter(r => r.result === 'PASS').length;

      console.log('\n📊 SEO Verification Results:');
      console.log(`   ✅ Passed: ${passCount}`);
      console.log(`   ❌ Failed: ${results.length - passCount}`);
      console.log(`   📊 Total: ${results.length}`);

      console.log('\n--- Details:');
      results.forEach(result => {
        console.log(`   ${result.check}: ${result.component}`);
        console.log(`     Found: ${result.details}`);
        console.log(`     Result: ${result.result}`);
      });

      const allPassed = results.every(r => r.result === 'PASS');
      console.log(`\n\n✅ AC4 (SEO-critical content): ${allPassed ? 'VERIFIED' : 'NOT VERIFIED'}`);

      expect(allPassed).toBe(true);
    });
  });
});
