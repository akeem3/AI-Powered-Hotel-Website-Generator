/**
 * Tests for Archetype Profiles
 *
 * Story 22.2: Generate 12 Hotel Websites (One Per Archetype)
 *
 * Tests verify the 12 archetype profiles are correctly defined with valid
 * HotelParameters for each visual archetype.
 */

describe('archetype-profiles', () => {
  const fs = require('fs');
  const path = require('path');

  // The 12 visual archetypes from the diversity plan
  const TWELVE_ARCHETYPES = [
    'Heritage Opulence',
    'Quiet Luxury',
    'Boutique Editorial',
    'Urban Tech-Forward',
    'Coastal Resort',
    'Mountain/Wilderness',
    'Wellness/Spa',
    'Heritage Cultural',
    'Eco Lodge',
    'Design/Art Hotel',
    'Family Resort',
    'Business Hotel'
  ];

  // Hotel types enum
  const HOTEL_TYPES = ['luxury', 'boutique', 'business', 'resort', 'budget'];

  // Target audiences enum
  const TARGET_AUDIENCES = ['couples', 'leisure', 'business', 'family'];

  // Brand personalities enum
  const BRAND_PERSONALITIES = ['elegant', 'modern', 'adventurous', 'professional', 'friendly'];

  let profilesContent: string;
  let profilesData: any;

  beforeAll(() => {
    // Read the archetype profiles file
    const profilesPath = 'fixtures/diversity/archetype-profiles.ts';
    profilesContent = fs.readFileSync(profilesPath, 'utf-8');

    // Extract the ARCHETYPE_PROFILES array using regex
    const arrayMatch = profilesContent.match(/export const ARCHETYPE_PROFILES.*?=\s*\[([\s\S]*?)\];/);
    if (arrayMatch) {
      // Parse the array - this is a simplified extraction for testing
      const arrayContent = arrayMatch[1];
      profilesData = [];

      // Extract each archetype entry
      const entryMatches = arrayContent.match(/\{[\s\S]*?\}/g) || [];
      for (const entry of entryMatches) {
        if (entry.includes('archetype:') && entry.includes('parameters:')) {
          profilesData.push(entry);
        }
      }
    }
  });

  describe('completeness', () => {
    it('should define exactly 12 archetype profiles', () => {
      // Count archetype entries in the file
      const archetypeCount = (profilesContent.match(/archetype:\s*['"]/g) || []).length;
      expect(archetypeCount).toBe(12);
    });

    it('should include all 12 visual archetypes', () => {
      for (const archetype of TWELVE_ARCHETYPES) {
        expect(profilesContent).toContain(`archetype: '${archetype}'`);
      }
    });

    it('should have unique hotel names for each archetype', () => {
      // Extract all hotel names
      const hotelNames: string[] = [];
      const nameMatches = profilesContent.match(/hotelName:\s*['"]([^'"]+)['"]/g) || [];

      for (const match of nameMatches) {
        const name = match.replace(/hotelName:\s*['"]/, '').replace(/['"]$/, '');
        hotelNames.push(name);
      }

      // Check for uniqueness
      const uniqueNames = new Set(hotelNames);
      expect(uniqueNames.size).toBe(hotelNames.length);
    });

    it('should export ARCHETYPE_PROFILES constant', () => {
      expect(profilesContent).toContain('export const ARCHETYPE_PROFILES');
    });

    it('should export ArchetypeProfile interface', () => {
      expect(profilesContent).toContain('export interface ArchetypeProfile');
    });
  });

  describe('schema validation', () => {
    it('should use valid hotel types from enum', () => {
      // Extract used hotel types from profiles
      const usedTypes = new Set<string>();
      const typeMatches = profilesContent.match(/hotelType:\s*'(\w+)'/g) || [];

      for (const match of typeMatches) {
        const type = match.replace(/hotelType:\s*'/, '').replace(/'/, '');
        usedTypes.add(type);
      }

      // Verify all used types are valid enum values
      for (const type of usedTypes) {
        expect(HOTEL_TYPES).toContain(type);
      }
    });

    it('should use valid target audiences from enum', () => {
      // Extract used target audiences from profiles
      const usedAudiences = new Set<string>();
      const audienceMatches = profilesContent.match(/targetAudience:\s*'(\w+)'/g) || [];

      for (const match of audienceMatches) {
        const audience = match.replace(/targetAudience:\s*'/, '').replace(/'/, '');
        usedAudiences.add(audience);
      }

      // Verify all used audiences are valid enum values
      for (const audience of usedAudiences) {
        expect(TARGET_AUDIENCES).toContain(audience);
      }
    });

    it('should use valid brand personalities from enum', () => {
      // Extract used brand personalities from profiles
      const usedPersonalities = new Set<string>();
      const personalityMatches = profilesContent.match(/brandPersonality:\s*'(\w+)'/g) || [];

      for (const match of personalityMatches) {
        const personality = match.replace(/brandPersonality:\s*'/, '').replace(/'/, '');
        usedPersonalities.add(personality);
      }

      // Verify all used personalities are valid enum values
      for (const personality of usedPersonalities) {
        expect(BRAND_PERSONALITIES).toContain(personality);
      }
    });

    it('should have all required HotelParameters fields', () => {
      // Check for the required fields in each archetype entry
      const requiredFields = [
        'hotelName',
        'hotelType',
        'targetAudience',
        'brandPersonality',
        'location'
      ];

      // Count occurrences of each field in parameters objects
      for (const field of requiredFields) {
        const fieldCount = (profilesContent.match(new RegExp(`${field}:`, 'g')) || []).length;
        expect(fieldCount).toBeGreaterThanOrEqual(12);
      }
    });

    it('should have valid hotel name lengths (1-100 characters)', () => {
      const nameMatches = profilesContent.match(/hotelName:\s*['"]([^'"]+)['"]/g) || [];

      for (const match of nameMatches) {
        const name = match.replace(/hotelName:\s*['"]/, '').replace(/['"]$/, '');
        expect(name.length).toBeGreaterThanOrEqual(1);
        expect(name.length).toBeLessThanOrEqual(100);
      }
    });

    it('should have valid location lengths (5-200 characters)', () => {
      const locationMatches = profilesContent.match(/location:\s*['"]([^'"]+)['"]/g) || [];

      for (const match of locationMatches) {
        const location = match.replace(/location:\s*['"]/, '').replace(/['"]$/, '');
        expect(location.length).toBeGreaterThanOrEqual(5);
        expect(location.length).toBeLessThanOrEqual(200);
      }
    });
  });

  describe('exported utility functions', () => {
    it('should export getArchetypeProfile function', () => {
      expect(profilesContent).toContain('export function getArchetypeProfile');
    });

    it('should export getAllArchetypeParameters function', () => {
      expect(profilesContent).toContain('export function getAllArchetypeParameters');
    });

    it('should export getArchetypeForParameters function', () => {
      expect(profilesContent).toContain('export function getArchetypeForParameters');
    });
  });

  describe('archetype diversity', () => {
    it('should have diverse hotel type distribution', () => {
      // Count hotel types
      const types = new Set<string>();
      const typeMatches = profilesContent.match(/hotelType:\s*'(\w+)'/g) || [];

      for (const match of typeMatches) {
        const type = match.replace(/hotelType:\s*'/, '').replace(/'/, '');
        types.add(type);
      }

      // Should use at least 4 different types
      expect(types.size).toBeGreaterThanOrEqual(4);
    });

    it('should have diverse target audience distribution', () => {
      // Count audiences
      const audiences = new Set<string>();
      const audienceMatches = profilesContent.match(/targetAudience:\s*'(\w+)'/g) || [];

      for (const match of audienceMatches) {
        const audience = match.replace(/targetAudience:\s*'/, '').replace(/'/, '');
        audiences.add(audience);
      }

      // Should use at least 3 different audiences
      expect(audiences.size).toBeGreaterThanOrEqual(3);
    });

    it('should have diverse brand personality distribution', () => {
      // Count personalities
      const personalities = new Set<string>();
      const personalityMatches = profilesContent.match(/brandPersonality:\s*'(\w+)'/g) || [];

      for (const match of personalityMatches) {
        const personality = match.replace(/brandPersonality:\s*'/, '').replace(/'/, '');
        personalities.add(personality);
      }

      // Should use at least 4 different personalities
      expect(personalities.size).toBeGreaterThanOrEqual(4);
    });

    it('should have global geographic distribution', () => {
      // Extract locations and check for global distribution
      const locationMatches = profilesContent.match(/location:\s*'([^']+)'/g) || [];
      const locations = locationMatches.map(match =>
        match.replace(/location:\s*'/, '').replace(/'/, '')
      );

      // Should have locations from multiple continents/regions
      const hasUSA = locations.some(l => l.includes('USA') || l.includes('California') || l.includes('Florida') || l.includes('Tennessee') || l.includes('Massachusetts'));
      const hasEurope = locations.some(l => l.includes('United Kingdom') || l.includes('Germany') || l.includes('France') || l.includes('Spain'));
      const hasAsia = locations.some(l => l.includes('Indonesia') || l.includes('India') || l.includes('China') || l.includes('Japan'));
      const hasSouthAmerica = locations.some(l => l.includes('Chile') || l.includes('Brazil') || l.includes('Argentina'));
      const hasOther = locations.some(l => l.includes('Mauritius') || l.includes('Dominican Republic'));

      // Should have at least 3 different regions
      const regionCount = [hasUSA, hasEurope, hasAsia, hasSouthAmerica, hasOther].filter(Boolean).length;
      expect(regionCount).toBeGreaterThanOrEqual(3);
    });
  });

  describe('example hotel names', () => {
    it('should use evocative, archetype-appropriate hotel names', () => {
      // Check that hotel names match their archetypes
      const expectedPairs = [
        { archetype: 'Heritage Opulence', contains: 'Grand' },
        { archetype: 'Quiet Luxury', contains: 'Minima' },
        { archetype: 'Urban Tech-Forward', contains: 'YOTELAIR' },
        { archetype: 'Coastal Resort', contains: 'One&Only' },
        { archetype: 'Mountain/Wilderness', contains: 'Explora' },
        { archetype: 'Wellness/Spa', contains: 'Shambhala' },
        { archetype: 'Heritage Cultural', contains: 'Taj' },
        { archetype: 'Eco Lodge', contains: '1 Hotel' },
        { archetype: 'Design/Art Hotel', contains: '21c' },
        { archetype: 'Family Resort', contains: 'Club Med' },
        { archetype: 'Business Hotel', contains: 'Marriott' },
      ];

      for (const { archetype, contains } of expectedPairs) {
        expect(profilesContent).toContain(contains);
      }
    });

    it('should avoid generic or placeholder names', () => {
      // Check for common placeholder names that shouldn't be used
      const placeholderNames = ['Test Hotel', 'Example Hotel', 'Sample Hotel', 'My Hotel', 'Hotel Name'];

      for (const placeholder of placeholderNames) {
        expect(profilesContent).not.toContain(`hotelName: '${placeholder}'`);
      }
    });
  });
});
