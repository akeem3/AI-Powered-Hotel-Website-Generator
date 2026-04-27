/**
 * Migration Script: Convert HomepageConfig Fixtures to WebsiteConfig
 *
 * Story 25.6 Phase 3: Convert existing HomepageConfig fixtures to WebsiteConfig format.
 *
 * This script:
 * 1. Reads HomepageConfig fixtures from fixtures/configs/
 * 2. Validates against HomepageConfigSchema
 * 3. Calls splitToPages() to distribute components across pages
 * 4. Calls multiplyContent() to expand content to realistic volumes
 * 5. Writes back as WebsiteConfig with original HomepageConfig in source field
 *
 * Usage:
 *   npx tsx scripts/migrate-fixture-to-website-config.ts [--fixture <name>]
 *
 * Examples:
 *   # Convert the-pemberton-grand.json
 *   npx tsx scripts/migrate-fixture-to-website-config.ts --fixture the-pemberton-grand
 *
 *   # Convert all fixtures
 *   npx tsx scripts/migrate-fixture-to-website-config.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Import schemas and utilities using relative paths (same pattern as generate-homepage.ts)
import { HomepageConfigSchema } from '../web-app/app/langgraph/agents/schemas';
import {
  splitToPages,
  type WebsiteConfig,
  WebsiteConfigSchema,
} from '../web-app/lib/generation/split-to-pages';
import {
  multiplyContent,
  VOLUME_CONFIGS,
  type VolumeConfig,
} from '../web-app/lib/generation/multiply-content';
import { type HotelType } from '../web-app/lib/generation/seed-bank';

/**
 * Migrate a single fixture file from HomepageConfig to WebsiteConfig
 *
 * @param fixtureName - Name of the fixture (without .json extension)
 * @returns Success status with details
 */
async function migrateFixture(fixtureName: string): Promise<{
  success: boolean;
  fixtureName: string;
  roomCount?: number;
  galleryCount?: number;
  testimonialCount?: number;
  amenityCount?: number;
  faqCount?: number;
  error?: string;
}> {
  const fixturesDir = path.resolve(process.cwd(), 'web-app/fixtures/configs');
  const fixturePath = path.join(fixturesDir, `${fixtureName}.json`);

  console.log(`\n🔄 Migrating: ${fixtureName}.json`);

  // Check if fixture exists
  if (!fs.existsSync(fixturePath)) {
    return {
      success: false,
      fixtureName,
      error: `Fixture file not found: ${fixturePath}`,
    };
  }

  try {
    // Step 1: Read HomepageConfig
    console.log('  → Reading HomepageConfig...');
    const fixtureContent = fs.readFileSync(fixturePath, 'utf8');
    const homepageConfig = JSON.parse(fixtureContent);

    // Step 2: Validate against HomepageConfigSchema
    console.log('  → Validating against HomepageConfigSchema...');
    const validatedConfig = HomepageConfigSchema.parse(homepageConfig);

    // Extract metadata for multiplyContent
    const hotelType = validatedConfig.hotelParameters.hotelType as HotelType;
    const hotelName = validatedConfig.hotelParameters.hotelName;
    const generationId = validatedConfig.generationId || fixtureName;
    const volumeConfig = VOLUME_CONFIGS[hotelType] || VOLUME_CONFIGS.luxury;

    console.log(`     Hotel Type: ${hotelType}`);
    console.log(`     Volume Config: rooms=${volumeConfig.rooms.min}-${volumeConfig.rooms.max}, gallery=${volumeConfig.gallery.min}-${volumeConfig.gallery.max}`);

    // Step 3: Split to pages
    console.log('  → Splitting components across pages...');
    const websiteConfig = splitToPages(validatedConfig);
    console.log(`     Pages created: ${Object.keys(websiteConfig.pages).length}`);
    console.log(`     Room detail pages: ${Object.keys(websiteConfig.pages.roomDetail).length}`);

    // Step 4: Multiply content to realistic volumes
    console.log('  → Multiplying content to realistic volumes...');
    const multipliedConfig = multiplyContent(websiteConfig, {
      volumeConfig,
      seed: generationId,
      hotelType,
      hotelName,
    });

    // Extract counts for reporting
    const roomsPage = multipliedConfig.pages.rooms;
    const roomsComponent = roomsPage.components.find(c => c.type === 'rooms');
    const roomCount = roomsComponent?.props?.rooms?.length || 0;

    const galleryPage = multipliedConfig.pages.gallery;
    const galleryComponent = galleryPage.components.find(c => c.type === 'gallery');
    const galleryCount = galleryComponent?.props?.images?.length || 0;

    const reviewsPage = multipliedConfig.pages.reviews;
    const testimonialsComponent = reviewsPage.components.find(c => c.type === 'testimonials');
    const testimonialCount = testimonialsComponent?.props?.testimonials?.length || 0;

    const amenitiesPage = multipliedConfig.pages.amenities;
    const amenitiesComponent = amenitiesPage.components.find(c => c.type === 'amenities');
    const amenityCount = amenitiesComponent?.props?.amenities?.length || 0;

    const faqPage = multipliedConfig.pages.faq;
    const faqComponent = faqPage.components.find(c => c.type === 'faq');
    const faqCount = faqComponent?.props?.faqQuestions?.length || 0;

    console.log(`     Rooms: ${roomCount}`);
    console.log(`     Gallery: ${galleryCount}`);
    console.log(`     Testimonials: ${testimonialCount}`);
    console.log(`     Amenities: ${amenityCount}`);
    console.log(`     FAQ: ${faqCount}`);

    // Step 5: Validate against WebsiteConfigSchema
    console.log('  → Validating against WebsiteConfigSchema...');
    const validatedWebsiteConfig = WebsiteConfigSchema.parse(multipliedConfig);

    // Step 6: Write back as WebsiteConfig
    console.log('  → Writing WebsiteConfig...');
    fs.writeFileSync(fixturePath, JSON.stringify(validatedWebsiteConfig, null, 2));

    console.log(`  ✅ Migration complete: ${fixtureName}.json`);

    return {
      success: true,
      fixtureName,
      roomCount,
      galleryCount,
      testimonialCount,
      amenityCount,
      faqCount,
    };
  } catch (error: any) {
    console.error(`  ❌ Migration failed: ${error.message}`);
    return {
      success: false,
      fixtureName,
      error: error.message,
    };
  }
}

/**
 * Main migration function
 */
async function main() {
  const args = process.argv.slice(2);
  let fixtureName: string | undefined;

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--fixture' && args[i + 1]) {
      fixtureName = args[i + 1];
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Migrate Fixture to WebsiteConfig

Usage:
  npx tsx scripts/migrate-fixture-to-website-config.ts [options]

Options:
  --fixture <name>  Migrate a specific fixture (without .json extension)
  --help, -h        Show this help message

Examples:
  # Convert the-pemberton-grand.json
  npx tsx scripts/migrate-fixture-to-website-config.ts --fixture the-pemberton-grand

  # Convert all fixtures
  npx tsx scripts/migrate-fixture-to-website-config.ts
      `);
      process.exit(0);
    }
  }

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     Fixture to WebsiteConfig Migration                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  const fixturesDir = path.resolve(process.cwd(), 'web-app/fixtures/configs');

  // Ensure fixtures directory exists
  if (!fs.existsSync(fixturesDir)) {
    console.error(`\n❌ Fixtures directory not found: ${fixturesDir}`);
    process.exit(1);
  }

  let results: Array<{
    success: boolean;
    fixtureName: string;
    roomCount?: number;
    galleryCount?: number;
    testimonialCount?: number;
    amenityCount?: number;
    faqCount?: number;
    error?: string;
  }> = [];

  if (fixtureName) {
    // Migrate single fixture
    const result = await migrateFixture(fixtureName);
    results.push(result);
  } else {
    // Migrate all fixtures
    const files = fs.readdirSync(fixturesDir);
    const jsonFiles = files.filter(f => f.endsWith('.json') && !f.includes('website-config'));

    console.log(`\nFound ${jsonFiles.length} HomepageConfig fixtures to migrate:`);

    for (const file of jsonFiles) {
      const name = file.replace('.json', '').replace('-website-config', '');
      const result = await migrateFixture(name);
      results.push(result);
    }
  }

  // Print summary
  console.log('\n──────────────────────────────────────────────────────────────');
  console.log('\n📊 Migration Summary');
  console.log('');

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  console.log(`Total fixtures: ${results.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${failCount}`);

  if (failCount > 0) {
    console.log('\n❌ Failed migrations:');
    for (const result of results.filter(r => !r.success)) {
      console.log(`  - ${result.fixtureName}: ${result.error}`);
    }
  }

  if (successCount > 0) {
    console.log('\n✅ Successful migrations:');
    for (const result of results.filter(r => r.success)) {
      console.log(`  - ${result.fixtureName}:`);
      console.log(`    Rooms: ${result.roomCount}, Gallery: ${result.galleryCount}, Testimonials: ${result.testimonialCount}`);
      console.log(`    Amenities: ${result.amenityCount}, FAQ: ${result.faqCount}`);
    }
  }

  console.log('');

  // Exit with error code if any failures
  if (failCount > 0) {
    process.exit(1);
  }

  console.log('✅ All migrations completed successfully!');
}

main().catch((error) => {
  console.error('\n💥 Fatal Error during migration:');
  console.error(error);
  process.exit(1);
});
