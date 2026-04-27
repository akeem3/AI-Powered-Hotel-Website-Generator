/**
 * Generate Hotel Profiles for Scale Test
 *
 * Story 22.5: Scale Test - Generate 50 Hotels
 *
 * Programmatic profile generator that creates 50 hotel parameter profiles
 * for scale testing. Generates 4-5 hotels per archetype with randomized
 * names, locations (global spread), and audience combinations.
 *
 * Usage:
 *   npx tsx scripts/generate-hotel-profiles.ts [--output <path>]
 *
 * @module scripts/generate-hotel-profiles
 */

import type { HotelParameters } from '../web-app/app/langgraph/agents/schemas';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Hotel types available in the system
 */
const HOTEL_TYPES = ['luxury', 'boutique', 'business', 'resort', 'budget'] as const;

/**
 * Target audiences available in the system
 */
const TARGET_AUDIENCES = ['couples', 'business', 'family', 'leisure'] as const;

/**
 * Brand personalities available in the system
 */
const BRAND_PERSONALITIES = ['elegant', 'modern', 'adventurous', 'friendly', 'professional'] as const;

/**
 * The 12 Hotel Visual Archetypes
 */
const ARCHETYPES = [
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
  'Business Hotel',
] as const;

/**
 * Location data for global distribution
 */
const LOCATIONS_BY_REGION = {
  'North America': {
    countries: ['United States', 'Canada', 'Mexico'],
    cities: [
      { name: 'New York City', country: 'United States' },
      { name: 'Los Angeles', country: 'United States' },
      { name: 'Miami', country: 'United States' },
      { name: 'Chicago', country: 'United States' },
      { name: 'San Francisco', country: 'United States' },
      { name: 'Toronto', country: 'Canada' },
      { name: 'Vancouver', country: 'Canada' },
      { name: 'Mexico City', country: 'Mexico' },
      { name: 'Cancun', country: 'Mexico' },
      { name: 'Montreal', country: 'Canada' },
    ],
  },
  'Europe': {
    countries: ['United Kingdom', 'France', 'Italy', 'Spain', 'Germany', 'Switzerland', 'Netherlands', 'Portugal', 'Greece', 'Austria'],
    cities: [
      { name: 'London', country: 'United Kingdom' },
      { name: 'Paris', country: 'France' },
      { name: 'Rome', country: 'Italy' },
      { name: 'Barcelona', country: 'Spain' },
      { name: 'Berlin', country: 'Germany' },
      { name: 'Amsterdam', country: 'Netherlands' },
      { name: 'Zurich', country: 'Switzerland' },
      { name: 'Lisbon', country: 'Portugal' },
      { name: 'Athens', country: 'Greece' },
      { name: 'Vienna', country: 'Austria' },
      { name: 'Edinburgh', country: 'United Kingdom' },
      { name: 'Florence', country: 'Italy' },
    ],
  },
  'Asia': {
    countries: ['Japan', 'China', 'Thailand', 'Singapore', 'India', 'Indonesia', 'Malaysia', 'South Korea', 'Vietnam', 'Philippines'],
    cities: [
      { name: 'Tokyo', country: 'Japan' },
      { name: 'Kyoto', country: 'Japan' },
      { name: 'Shanghai', country: 'China' },
      { name: 'Bangkok', country: 'Thailand' },
      { name: 'Singapore', country: 'Singapore' },
      { name: 'Mumbai', country: 'India' },
      { name: 'Delhi', country: 'India' },
      { name: 'Bali', country: 'Indonesia' },
      { name: 'Seoul', country: 'South Korea' },
      { name: 'Ho Chi Minh City', country: 'Vietnam' },
      { name: 'Kuala Lumpur', country: 'Malaysia' },
      { name: 'Manila', country: 'Philippines' },
    ],
  },
  'Oceania': {
    countries: ['Australia', 'New Zealand', 'Fiji'],
    cities: [
      { name: 'Sydney', country: 'Australia' },
      { name: 'Melbourne', country: 'Australia' },
      { name: 'Brisbane', country: 'Australia' },
      { name: 'Auckland', country: 'New Zealand' },
      { name: 'Queenstown', country: 'New Zealand' },
      { name: 'Denarau Island', country: 'Fiji' },
    ],
  },
  'South America': {
    countries: ['Brazil', 'Argentina', 'Chile', 'Peru', 'Colombia', 'Uruguay'],
    cities: [
      { name: 'Rio de Janeiro', country: 'Brazil' },
      { name: 'São Paulo', country: 'Brazil' },
      { name: 'Buenos Aires', country: 'Argentina' },
      { name: 'Santiago', country: 'Chile' },
      { name: 'Lima', country: 'Peru' },
      { name: 'Cartagena', country: 'Colombia' },
      { name: 'Montevideo', country: 'Uruguay' },
    ],
  },
  'Middle East & Africa': {
    countries: ['UAE', 'Qatar', 'Morocco', 'South Africa', 'Egypt', 'Kenya', 'Tanzania', 'Jordan'],
    cities: [
      { name: 'Dubai', country: 'UAE' },
      { name: 'Doha', country: 'Qatar' },
      { name: 'Marrakech', country: 'Morocco' },
      { name: 'Cape Town', country: 'South Africa' },
      { name: 'Cairo', country: 'Egypt' },
      { name: 'Nairobi', country: 'Kenya' },
      { name: 'Arusha', country: 'Tanzania' },
      { name: 'Petra', country: 'Jordan' },
    ],
  },
} as const;

/**
 * Hotel name templates by archetype
 * Format: [Prefix] [Name] [Suffix]
 */
const HOTEL_NAME_TEMPLATES: Record<string, { prefixes: string[]; names: string[]; suffixes: string[] }> = {
  'Heritage Opulence': {
    prefixes: ['The', 'Grand', 'Royal', 'Imperial', 'Palace', 'Majestic'],
    names: ['Pemberton', 'Windsor', 'Sovereign', 'Regency', 'Heritage', 'Monarch', 'Crown', 'Dynasty'],
    suffixes: ['Hotel', 'Palace', 'House', 'Residence', 'Manor', 'Estate', 'Grand', 'Club'],
  },
  'Quiet Luxury': {
    prefixes: ['Haus', 'The', 'Maison', 'Villa', 'Residence', 'Retreat'],
    names: ['Minima', 'Serenity', 'Tranquil', 'Haven', 'Sanctuary', 'Bliss', 'Calm', 'Peaceful'],
    suffixes: ['Hotel', 'House', 'Suites', 'Residence', 'Retreat', 'Lodge', 'Inn', 'Boutique'],
  },
  'Boutique Editorial': {
    prefixes: ['The', 'Hotel', 'House', 'Gallery', 'Studio', 'Atelier'],
    names: ['Hoxton', 'Editorial', 'Curated', 'Collection', 'Portfolio', 'Narrative', 'Story', 'Volume'],
    suffixes: ['Southwark', 'Shoreditch', 'Williamsburg', 'Tribeca', 'Le Marais', 'Mitte', 'El Born', 'Nørrebro'],
  },
  'Urban Tech-Forward': {
    prefixes: ['YOTEL', 'Neo', 'Tech', 'Hub', 'Pod', 'Station'],
    names: ['Air', 'Connect', 'Link', 'Node', 'Grid', 'Matrix', 'Cloud', 'Stream'],
    suffixes: ['Boston Logan', 'JFK', 'LHR', 'CDG', 'HND', 'SIN', 'DXB', 'Transit'],
  },
  'Coastal Resort': {
    prefixes: ['One&Only', 'Four Seasons', 'St. Regis', 'Rosewood', 'Aman', 'COMO'],
    names: ['Le Saint-Geran', 'Reethi Rah', 'Maldives', 'Bora Bora', 'Maui', 'Phuket', 'Bali', 'Seychelles'],
    suffixes: ['Resort', 'Beach', 'Island', 'Cove', 'Lagoon', 'Retreat', 'Sanctuary', 'Villas'],
  },
  'Mountain/Wilderness': {
    prefixes: ['Explora', 'Amangiri', 'Singita', 'Four Seasons', 'Aman', 'Tierra'],
    names: ['Atacama', 'Patagonia', 'Serengeti', 'Masai Mara', 'Kruger', 'Banff', 'Aspen', 'Zermatt'],
    suffixes: ['Lodge', 'Resort', 'Camp', 'Safari', 'Retreat', 'Expedition', 'Adventure', 'Wilderness'],
  },
  'Wellness/Spa': {
    prefixes: ['COMO', 'Six Senses', 'Aman', 'SHA', 'Kamalaya', 'Chiva-Som'],
    names: ['Shambhala', 'Uma', 'Parrot Cay', 'Rejuvenation', 'Wellness', 'Sanctuary', 'Harmony', 'Balance'],
    suffixes: ['Estate', 'Resort', 'Retreat', 'Spa', 'Wellness', 'Sanctuary', 'Villa', 'Centre'],
  },
  'Heritage Cultural': {
    prefixes: ['Taj', 'Oberoi', 'Imperial', 'Mandarin Oriental', 'Peninsula', 'Raffles'],
    names: ['Palace', 'Mahal', 'Haveli', 'Fort', 'Heritage', 'Legacy', 'Tradition', 'Culture'],
    suffixes: ['New Delhi', 'Mumbai', 'Jaipur', 'Udaipur', 'Agra', 'Lucknow', 'Kolkata', 'Bangalore'],
  },
  'Eco Lodge': {
    prefixes: ['1 Hotel', 'Eco', 'Sustainable', 'Green', 'Nature', 'Earth'],
    names: ['South Beach', 'Central Park', 'West Hollywood', 'Brooklyn', 'Hollywood', 'Miami', 'Nashville', 'Austin'],
    suffixes: ['Hotel', 'Residence', 'House', 'Lodge', 'Retreat', 'Inn', 'Suites', 'Living'],
  },
  'Design/Art Hotel': {
    prefixes: ['21c', 'W', 'Ace', 'Standard', 'Andaz', 'Edition'],
    names: ['Museum', 'Gallery', 'Art', 'Design', 'Studio', 'Creative', 'Visionary', 'Contemporary'],
    suffixes: ['Nashville', 'Louisville', 'Cincinnati', 'Oklahoma City', 'Durham', 'Kansas City', 'Lexington', 'Bentonville'],
  },
  'Family Resort': {
    prefixes: ['Club Med', 'Beaches', 'Great Wolf', 'Disney', 'Universal', 'Nickelodeon'],
    names: ['Punta Cana', 'Cancun', 'Turkoise', 'Bora Bora', 'Columbus Isle', 'Sandpiper', 'Moorea', 'Phuket'],
    suffixes: ['Resort', 'Village', 'Club', 'Beach', 'Island', 'Paradise', 'Family', 'Kids'],
  },
  'Business Hotel': {
    prefixes: ['Marriott', 'Hilton', 'Hyatt', 'Sheraton', 'Westin', 'Courtyard'],
    names: ['Marquis', 'Grand', 'Plaza', 'Center', 'Tower', 'Gateway', 'Airport', 'Downtown'],
    suffixes: ['San Diego', 'New York', 'Chicago', 'Atlanta', 'Dallas', 'Houston', 'Phoenix', 'Denver'],
  },
};

/**
 * Archetype parameter mappings
 * Defines the typical hotel type, audience, and personality for each archetype
 */
const ARCHETYPE_MAPPINGS: Record<string, {
  hotelTypes: string[];
  targetAudiences: string[];
  brandPersonalities: string[];
}> = {
  'Heritage Opulence': {
    hotelTypes: ['luxury'],
    targetAudiences: ['couples', 'business', 'leisure'],
    brandPersonalities: ['elegant'],
  },
  'Quiet Luxury': {
    hotelTypes: ['boutique', 'luxury'],
    targetAudiences: ['couples', 'leisure'],
    brandPersonalities: ['modern', 'elegant'],
  },
  'Boutique Editorial': {
    hotelTypes: ['boutique'],
    targetAudiences: ['leisure', 'couples'],
    brandPersonalities: ['adventurous', 'modern'],
  },
  'Urban Tech-Forward': {
    hotelTypes: ['business'],
    targetAudiences: ['business'],
    brandPersonalities: ['modern', 'professional'],
  },
  'Coastal Resort': {
    hotelTypes: ['resort', 'luxury'],
    targetAudiences: ['couples', 'family', 'leisure'],
    brandPersonalities: ['elegant', 'friendly'],
  },
  'Mountain/Wilderness': {
    hotelTypes: ['luxury', 'resort'],
    targetAudiences: ['leisure', 'couples'],
    brandPersonalities: ['adventurous', 'elegant'],
  },
  'Wellness/Spa': {
    hotelTypes: ['luxury', 'boutique'],
    targetAudiences: ['leisure', 'couples'],
    brandPersonalities: ['elegant', 'friendly'],
  },
  'Heritage Cultural': {
    hotelTypes: ['luxury'],
    targetAudiences: ['business', 'leisure', 'couples'],
    brandPersonalities: ['elegant'],
  },
  'Eco Lodge': {
    hotelTypes: ['boutique'],
    targetAudiences: ['leisure', 'couples'],
    brandPersonalities: ['modern', 'friendly'],
  },
  'Design/Art Hotel': {
    hotelTypes: ['boutique'],
    targetAudiences: ['leisure', 'business', 'couples'],
    brandPersonalities: ['adventurous', 'modern'],
  },
  'Family Resort': {
    hotelTypes: ['resort'],
    targetAudiences: ['family'],
    brandPersonalities: ['friendly'],
  },
  'Business Hotel': {
    hotelTypes: ['business'],
    targetAudiences: ['business'],
    brandPersonalities: ['professional', 'modern'],
  },
};

/**
 * Seeded random number generator for reproducibility
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number = 12345) {
    this.seed = seed;
  }

  /**
   * Generate next random number between 0 and 1
   */
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  /**
   * Generate random integer between min and max (inclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Pick random element from array
   */
  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  /**
   * Shuffle array (Fisher-Yates)
   */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

/**
 * Generate a random hotel name for an archetype
 */
function generateHotelName(archetype: string, rng: SeededRandom): string {
  const templates = HOTEL_NAME_TEMPLATES[archetype];
  if (!templates) {
    // Fallback for unknown archetype
    return `Hotel ${archetype} ${rng.nextInt(1, 999)}`;
  }

  const prefix = rng.pick(templates.prefixes);
  const name = rng.pick(templates.names);
  const suffix = rng.pick(templates.suffixes);

  // Randomly decide whether to include all parts or skip some
  const includePrefix = rng.next() > 0.1;
  const includeSuffix = rng.next() > 0.05;

  const parts: string[] = [];
  if (includePrefix) parts.push(prefix);
  parts.push(name);
  if (includeSuffix) parts.push(suffix);

  return parts.join(' ');
}

/**
 * Get all cities flattened with region information
 */
function getAllCities(): Array<{ name: string; country: string; region: string }> {
  const cities: Array<{ name: string; country: string; region: string }> = [];

  for (const [region, data] of Object.entries(LOCATIONS_BY_REGION)) {
    for (const city of data.cities) {
      cities.push({
        name: city.name,
        country: city.country,
        region,
      });
    }
  }

  return cities;
}

/**
 * Generate scale test profiles
 *
 * @param seed Random seed for reproducibility
 * @returns Array of 50 hotel parameter profiles
 */
export function generateScaleTestProfiles(seed: number = 12345): Array<{
  id: string;
  archetype: string;
  parameters: HotelParameters;
}> {
  const rng = new SeededRandom(seed);
  const profiles: Array<{ id: string; archetype: string; parameters: HotelParameters }> = [];
  const allCities = getAllCities();

  // Generate 4-5 profiles per archetype (50 total)
  let profileIndex = 0;
  const shuffledArchetypes = rng.shuffle([...ARCHETYPES]);

  for (const archetype of shuffledArchetypes) {
    // Determine how many profiles for this archetype (4 or 5)
    // First 2 archetypes get 5 profiles, rest get 4 (to reach exactly 50)
    const archetypeIndex = shuffledArchetypes.indexOf(archetype);
    const profilesPerArchetype = archetypeIndex < 2 ? 5 : 4;

    const mapping = ARCHETYPE_MAPPINGS[archetype];
    if (!mapping) {
      console.warn(`No mapping found for archetype: ${archetype}`);
      continue;
    }

    for (let i = 0; i < profilesPerArchetype; i++) {
      // Select random parameters from archetype-appropriate options
      const hotelType = rng.pick(mapping.hotelTypes);
      const targetAudience = rng.pick(mapping.targetAudiences);
      const brandPersonality = rng.pick(mapping.brandPersonalities);

      // Select a random city (prefer different cities per archetype)
      const city = rng.pick(allCities);

      const parameters: HotelParameters = {
        hotelName: generateHotelName(archetype, rng),
        hotelType,
        targetAudience,
        brandPersonality,
        location: `${city.name}, ${city.country}`,
      };

      profiles.push({
        id: `scale-test-${profileIndex + 1}`,
        archetype,
        parameters,
      });

      profileIndex++;
    }
  }

  return profiles;
}

/**
 * Get scale test profiles as HotelParameters array
 * Compatible with batch generation script
 */
export function getScaleTestParameters(): HotelParameters[] {
  const profiles = generateScaleTestProfiles();
  return profiles.map((p) => p.parameters);
}

/**
 * Main function to generate and export profiles
 */
async function main() {
  const args = process.argv.slice(2);
  let outputPath = 'web-app/fixtures/diversity/scale-test-profiles.ts';
  let seed = 12345;

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output' && args[i + 1]) {
      outputPath = args[i + 1];
      i++;
    } else if (args[i] === '--seed' && args[i + 1]) {
      seed = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Generate Hotel Profiles for Scale Test

Usage:
  npx tsx scripts/generate-hotel-profiles.ts [options]

Options:
  --output <path>    Output file path (default: web-app/fixtures/diversity/scale-test-profiles.ts)
  --seed <number>    Random seed for reproducibility (default: 12345)
  --help, -h         Show this help message

Description:
  Generates 50 hotel parameter profiles for scale testing.
  Creates 4-5 profiles per archetype with randomized names,
  locations (global spread), and audience combinations.

  Output format: TypeScript file with SCALE_TEST_PROFILES export
      `);
      process.exit(0);
    }
  }

  console.log('🏨 Generating Scale Test Hotel Profiles');
  console.log('');
  console.log(`Seed: ${seed}`);
  console.log(`Output: ${outputPath}`);
  console.log('');

  // Generate profiles
  const profiles = generateScaleTestProfiles(seed);

  console.log(`Generated ${profiles.length} profiles`);
  console.log('');

  // Display summary by archetype
  const summary: Record<string, number> = {};
  for (const profile of profiles) {
    summary[profile.archetype] = (summary[profile.archetype] || 0) + 1;
  }

  console.log('Profiles by Archetype:');
  for (const [archetype, count] of Object.entries(summary)) {
    console.log(`  ${archetype}: ${count}`);
  }
  console.log('');

  // Display summary by region
  const regionSummary: Record<string, number> = {};
  for (const profile of profiles) {
    const location = profile.parameters.location;
    let region = 'Unknown';
    for (const [regionName, data] of Object.entries(LOCATIONS_BY_REGION)) {
      if (data.countries.some((c) => location.includes(c))) {
        region = regionName;
        break;
      }
    }
    regionSummary[region] = (regionSummary[region] || 0) + 1;
  }

  console.log('Profiles by Region:');
  for (const [region, count] of Object.entries(regionSummary)) {
    console.log(`  ${region}: ${count}`);
  }
  console.log('');

  // Generate TypeScript file content
  const fileContent = `/**
 * Scale Test Hotel Profiles
 *
 * Story 22.5: Scale Test - Generate 50 Hotels
 *
 * Auto-generated by scripts/generate-hotel-profiles.ts
 * Seed: ${seed}
 * Generated: ${new Date().toISOString()}
 *
 * 50 hotel parameter profiles for scale testing (4-5 per archetype).
 * Profiles include randomized hotel names, global location distribution,
 * and varied audience combinations.
 *
 * @module web-app/fixtures/diversity/scale-test-profiles
 */

import type { HotelParameters } from '@/app/langgraph/agents/schemas';

/**
 * Scale test hotel profiles (50 total)
 *
 * Generated with seed ${seed} for reproducibility.
 * Regenerate with: npx tsx scripts/generate-hotel-profiles.ts --seed ${seed}
 */
export const SCALE_TEST_PROFILES: HotelParameters[] = [
${profiles.map((p, index) => `  // ${index + 1}. ${p.archetype}: ${p.parameters.hotelName}
  {
    hotelName: '${p.parameters.hotelName}',
    hotelType: '${p.parameters.hotelType}',
    targetAudience: '${p.parameters.targetAudience}',
    brandPersonality: '${p.parameters.brandPersonality}',
    location: '${p.parameters.location}',
  }${index < profiles.length - 1 ? ',' : ''}`).join('\n')}
];

/**
 * Get archetype for a scale test profile
 *
 * @param index Profile index (0-49)
 * @returns Archetype name or 'unknown'
 */
export function getScaleTestProfileArchetype(index: number): string {
  const archetypes = [
${profiles.map((p) => `    '${p.archetype}',`).join('\n')}
  ];
  return archetypes[index] || 'unknown';
}

/**
 * Get all scale test profiles with metadata
 */
export function getScaleTestProfilesWithMetadata(): Array<{
  id: string;
  archetype: string;
  parameters: HotelParameters;
}> {
  return [
${profiles.map((p, index) => `    { id: '${p.id}', archetype: '${p.archetype}', parameters: SCALE_TEST_PROFILES[${index}] }${index < profiles.length - 1 ? ',' : '' }`).join('\n')}
  ];
}
`;

  // Ensure output directory exists
  const absoluteOutputPath = path.isAbsolute(outputPath)
    ? outputPath
    : path.resolve(process.cwd(), outputPath);
  const outputDir = path.dirname(absoluteOutputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write to file
  fs.writeFileSync(absoluteOutputPath, fileContent, 'utf8');
  console.log(`✅ Profile file created: ${absoluteOutputPath}`);
  console.log('');
  console.log(`To use these profiles:`);
  console.log(`  import { SCALE_TEST_PROFILES } from '@/fixtures/diversity/scale-test-profiles';`);
}

main().catch((error) => {
  console.error('\n💥 Fatal Error:');
  console.error(error);
  process.exit(1);
});
