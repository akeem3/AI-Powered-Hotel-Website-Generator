/**
 * Generate Homepage Script
 *
 * Story 11.6: Generate single hotel website configuration
 * Story 25.6: Extended to generate multi-page WebsiteConfig output
 *
 * ## Overview
 *
 * CLI script that generates a hotel website configuration based on provided
 * hotel parameters. Invokes the HomepageGenerationWorkflow and outputs both
 * homepage-config and website-config files.
 *
 * ## Story 25.6: Multi-Page Generation
 *
 * The script now generates two output files:
 *
 * 1. **homepage-config-{generationId}.json**: Original single-page configuration
 *    - Validated against HomepageConfigSchema
 *    - Contains all components for the homepage
 *    - Includes hotel parameters, design tokens, and metadata
 *
 * 2. **website-config-{generationId}.json**: Multi-page configuration
 *    - Validated against WebsiteConfigSchema
 *    - Contains `pages` field with 9 page types:
 *      - homepage: Curated landing page
 *      - rooms: Full rooms listing
 *      - roomDetail: Individual room detail pages (map by room slug)
 *      - gallery: Full gallery page
 *      - amenities: Full amenities page
 *      - reviews: Guest reviews page (testimonials)
 *      - contact: Contact page
 *      - about: About page
 *      - faq: FAQ page
 *    - Contains `source` field with original HomepageConfig
 *    - Content multiplied to realistic volumes per hotel type
 *
 * ## Content Multiplication
 *
 * The script uses the `splitToPages()` and `multiplyContent()` utilities to:
 *
 * 1. **splitToPages()**: Distribute HomepageConfig components across pages
 *    - Navigation and footer appear on all pages
 *    - Homepage shows teaser content (3 rooms, 6 gallery images)
 *    - Dedicated pages show full content
 *
 * 2. **multiplyContent()**: Expand content to realistic volumes
 *    - Luxury: 8-15 rooms, 15-30 gallery images
 *    - Boutique: 6-12 rooms, 12-25 gallery images
 *    - Resort: 10-20 rooms, 25-50 gallery images
 *    - Business: 5-10 rooms, 10-20 gallery images
 *    - Budget: 3-8 rooms, 8-15 gallery images
 *    - Uses generationId as seed for deterministic output
 *
 * ## Graceful Degradation
 *
 * If website-config generation fails (splitToPages or multiplyContent errors),
 * the script continues with homepage-config output and logs a warning.
 * This ensures backward compatibility and prevents data loss.
 *
 * ## Usage
 *
 * ```bash
 * npx tsx scripts/generate-homepage.ts \
 *   --name "Hotel Name" \
 *   --type luxury \
 *   --audience couples \
 *   --personality elegant \
 *   --location "City, Country" \
 *   --output-dir output
 * ```
 *
 * ## Output Files
 *
 * - `{outputDir}/homepage-config-{generationId}.json`: HomepageConfig
 * - `{outputDir}/website-config-{generationId}.json`: WebsiteConfig
 * - `{outputDir}/latest-homepage-config.json`: Latest homepage reference
 * - `{outputDir}/latest-website-config.json`: Latest website reference
 * - `{outputDir}/content/{hotelId}/website-config.json`: Multi-page config
 * - `{outputDir}/content/{hotelId}/pages/homepage/content.json`: Content files
 * - `{outputDir}/content/{hotelId}/media/manifest.json`: Media manifest
 *
 * @module scripts/generate-homepage
 */

import { HomepageGenerationWorkflow } from '../web-app/app/langgraph/workflows/HomepageGenerationWorkflow';
import { HotelParameters, HotelParametersSchema } from '../web-app/app/langgraph/agents/schemas';
import { ContentJsonOutput } from '../web-app/app/langgraph/state/types';
import { HomepageContentSchema, MediaManifestSchema } from '../web-app/lib/content/schemas';
import * as fs from 'fs';
import * as path from 'path';

// Story 25.6: Multi-page generation utilities
import {
  splitToPages,
  multiplyContent,
  type WebsiteConfig,
  WebsiteConfigSchema,
} from '../web-app/lib/generation/split-to-pages';
import { type VolumeConfig, VOLUME_CONFIGS } from '../web-app/lib/generation/multiply-content';
import { type HotelType } from '../web-app/lib/generation/seed-bank';

/**
 * Story 11.6: Write content JSON files to output directory.
 *
 * Creates the following directory structure:
 * output/content/{hotelId}/
 * ├── pages/
 * │   └── homepage/
 * │       ├── content.json          # English (default)
 * │       ├── content.{locale}.json # Localized versions (Epic 13)
 * └── media/
 *     └── manifest.json             # Media asset references
 *
 * @param contentJson - Validated content JSON from ContentGenerator
 * @param hotelId - Sanitized hotel identifier for directory structure
 * @param outputBaseDir - Base output directory (default: 'output')
 */
async function writeContentFiles(
  contentJson: ContentJsonOutput,
  hotelId: string,
  outputBaseDir: string = 'output'
): Promise<void> {
  const contentDir = path.join(outputBaseDir, 'content', hotelId);

  // Validate content before writing (Story 11.6 AC5)
  try {
    HomepageContentSchema.parse(contentJson.homepage);
    MediaManifestSchema.parse(contentJson.mediaManifest);

    // Validate localized content (currently empty for English-only, Epic 13 will populate)
    for (const [locale, content] of Object.entries(contentJson.localizedHomepage)) {
      HomepageContentSchema.parse(content);
    }
  } catch (error: any) {
    console.error('[writeContentFiles] Validation failed before write:', error.message);
    throw new Error(`Content validation failed: ${error.message}`);
  }

  // Write English content (default)
  const pagesDir = path.join(contentDir, 'pages', 'homepage');
  fs.mkdirSync(pagesDir, { recursive: true });

  const contentJsonPath = path.join(pagesDir, 'content.json');
  fs.writeFileSync(contentJsonPath, JSON.stringify(contentJson.homepage, null, 2));
  console.log(`  ✓ Written: content.json (English)`);

  // Write localized versions (Epic 13: currently empty, future: es, fr, de)
  for (const [locale, content] of Object.entries(contentJson.localizedHomepage)) {
    if (locale !== 'en') {
      const localePath = path.join(pagesDir, `content.${locale}.json`);
      fs.writeFileSync(localePath, JSON.stringify(content, null, 2));
      console.log(`  ✓ Written: content.${locale}.json`);
    }
  }

  // Write media manifest
  const mediaDir = path.join(contentDir, 'media');
  fs.mkdirSync(mediaDir, { recursive: true });

  const manifestPath = path.join(mediaDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(contentJson.mediaManifest, null, 2));
  console.log(`  ✓ Written: media/manifest.json`);
}

/**
 * Story 25.6: Write WebsiteConfig JSON file to output directory.
 *
 * Creates a website-config JSON file containing the full multi-page configuration
 * with all components distributed across pages and content multiplied to realistic volumes.
 *
 * @param websiteConfig - Validated WebsiteConfig from splitToPages + multiplyContent
 * @param hotelId - Sanitized hotel identifier for directory structure
 * @param outputBaseDir - Base output directory (default: 'output')
 */
async function writeWebsiteConfig(
  websiteConfig: WebsiteConfig,
  hotelId: string,
  outputBaseDir: string = 'output'
): Promise<void> {
  // Validate WebsiteConfig before writing (Story 25.6 AC1)
  try {
    WebsiteConfigSchema.parse(websiteConfig);
  } catch (error: any) {
    console.error('[writeWebsiteConfig] Validation failed before write:', error.message);
    throw new Error(`WebsiteConfig validation failed: ${error.message}`);
  }

  // Ensure output directory exists
  const configDir = path.join(outputBaseDir, 'content', hotelId);
  fs.mkdirSync(configDir, { recursive: true });

  const configJsonPath = path.join(configDir, 'website-config.json');
  fs.writeFileSync(configJsonPath, JSON.stringify(websiteConfig, null, 2));
  console.log(`  ✓ Written: website-config.json (multi-page)`);
}

/**
 * CLI Script: Generate Homepage
 * 
 * Usage:
 * npx tsx scripts/generate-homepage.ts \
 *   --name "Grand Plaza Hotel" \
 *   --type luxury \
 *   --audience couples \
 *   --personality elegant \
 *   --location "Nice, France"
 */

async function main() {
  // Automatically load keys from web-app/.env so user only needs to provide parameters
  const envPath = path.resolve(process.cwd(), 'web-app/.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const [key, ...valueParts] = line.trim().split('=');
      const value = valueParts.join('=')?.trim().replace(/^["']|["']$/g, '');
      if (key && value && !process.env[key]) process.env[key] = value;
    });
  }

  const args = process.argv.slice(2);
  const rawParams: any = {};
  let outputDir = 'output';

  // Simple argument parser
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    if (arg === '--name') rawParams.hotelName = nextArg;
    if (arg === '--type') rawParams.hotelType = nextArg;
    if (arg === '--audience') rawParams.targetAudience = nextArg;
    if (arg === '--personality') rawParams.brandPersonality = nextArg;
    if (arg === '--location') rawParams.location = nextArg;
    if (arg === '--output-dir') outputDir = nextArg;
  }

  // Validate parameters using Zod schema for "No Room for Mistakes"
  const validation = HotelParametersSchema.safeParse(rawParams);

  if (!validation.success) {
    console.error('\n❌ Invalid Parameters:');
    validation.error.issues.forEach((err: any) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    
    console.log('\nUsage:');
    console.log('  npx tsx scripts/generate-homepage.ts \\');
    console.log('    --name "Hotel Name" \\');
    console.log('    --type [luxury|budget|boutique|resort|business] \\');
    console.log('    --audience [business|leisure|family|couples|backpackers] \\');
    console.log('    --personality [elegant|modern|friendly|professional|adventurous] \\');
    console.log('    --location "City, Country"');
    process.exit(1);
  }

  const params = validation.data;
  const sanitizedName = params.hotelName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const generationId = `${sanitizedName}-v${Date.now()}`;
  
  console.log('--------------------------------------------------');
  console.log('🚀 Starting Homepage Generation');
  console.log('--------------------------------------------------');
  console.log(`ID: ${generationId}`);
  console.log(`Hotel: ${params.hotelName}`);
  console.log(`Type: ${params.hotelType}`);
  console.log(`Target: ${params.targetAudience}`);
  console.log(`Personality: ${params.brandPersonality}`);
  console.log(`Location: ${params.location}`);
  console.log('--------------------------------------------------');

  try {
    const workflow = new HomepageGenerationWorkflow();
    const result = await workflow.invoke({
      generationId,
      hotelParameters: params
    });

    // Determine the outcome based on validationStatus and assembledConfig
    const hasValidConfig = result.validationStatus === 'pass' && result.assembledConfig;
    const hasPartialConfig = result.validationStatus !== 'pass' && result.assembledConfig;
    const hasNoConfig = !result.assembledConfig;

    if (hasValidConfig) {
      // Full success: validation passed and config exists
      console.log('\n✅ Generation Successful!');
      console.log(`Total Cost: $${result.totalCost.toFixed(4)}`);
    } else if (hasPartialConfig) {
      // Partial success: config exists but validation failed (e.g., workflow errors, contrast issues)
      console.log('\n⚠️  Generation Completed with Warnings');
      console.log(`Total Cost: $${result.totalCost.toFixed(4)}`);
      console.log(`Validation Status: ${result.validationStatus}`);
      if (result.validationErrors && result.validationErrors.length > 0) {
        console.log('Validation Errors:', result.validationErrors.join(', '));
      }
      if (result.errors && result.errors.length > 0) {
        console.log('Workflow Errors:', result.errors.length);
      }
    } else {
      // Complete failure: no config generated
      console.error('\n❌ Generation Failed.');
      console.error('Errors:', result.errors);
      console.error('Validation Errors:', result.validationErrors);
      process.exit(1);
    }

    // Save config if one was generated (full or partial success)
    if (result.assembledConfig) {
      // Ensure output directory exists (absolute path for reliability)
      const absoluteOutputDir = path.isAbsolute(outputDir) ? outputDir : path.resolve(process.cwd(), outputDir);
      if (!fs.existsSync(absoluteOutputDir)) {
        fs.mkdirSync(absoluteOutputDir, { recursive: true });
      }

      const outputPath = path.join(absoluteOutputDir, `homepage-config-${generationId}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(result.assembledConfig, null, 2));

      console.log(`\nConfig saved to: ${outputPath}`);

      // Also save a latest reference
      const latestPath = path.join(absoluteOutputDir, 'latest-homepage-config.json');
      fs.writeFileSync(latestPath, JSON.stringify(result.assembledConfig, null, 2));
      console.log(`Latest copy updated: ${latestPath}`);

      // Story 25.6: Generate multi-page configuration
      console.log('\n🔄 Generating multi-page configuration...');
      let websiteConfig: WebsiteConfig | undefined;

      try {
        // Step 1: Split HomepageConfig into WebsiteConfig
        console.log('  → Splitting components across pages...');
        websiteConfig = splitToPages(result.assembledConfig);
        console.log('  ✓ Components distributed across pages');

        // Step 2: Derive pipeline parameters
        const hotelType = result.assembledConfig.hotelParameters.hotelType as HotelType;
        const volumeConfig = VOLUME_CONFIGS[hotelType] || VOLUME_CONFIGS.luxury;
        const seed = generationId;

        // Step 3: Multiply content to realistic volumes
        console.log(`  → Multiplying content (target: ${volumeConfig.rooms.min}-${volumeConfig.rooms.max} rooms, ${volumeConfig.gallery.min}-${volumeConfig.gallery.max} gallery images)...`);
        websiteConfig = multiplyContent(websiteConfig, {
          volumeConfig,
          seed,
          hotelType,
          hotelName: params.hotelName,
        });
        console.log('  ✓ Content multiplied to realistic volumes');

        // Step 4: Write WebsiteConfig file
        console.log('  → Writing website-config.json...');
        await writeWebsiteConfig(websiteConfig, sanitizedName, absoluteOutputDir);
        console.log(`  ✓ Website config written to: ${path.join(absoluteOutputDir, 'content', sanitizedName, 'website-config.json')}`);

        // Also save a latest reference for website-config
        const latestWebsiteConfigPath = path.join(absoluteOutputDir, 'latest-website-config.json');
        fs.writeFileSync(latestWebsiteConfigPath, JSON.stringify(websiteConfig, null, 2));
        console.log(`  ✓ Latest website config updated: ${latestWebsiteConfigPath}`);

      } catch (error: any) {
        // Graceful degradation: log error but continue with homepage-config output
        console.error('\n⚠️  Warning: Failed to generate website-config:', error.message);
        console.error('Continuing with homepage-config output...');
        console.error('The homepage-config file has been successfully saved.');
      }

      // Story 11.6: Write content JSON files for runtime updates
      if (result.contentJson) {
        console.log('\n📝 Writing content JSON files...');
        try {
          await writeContentFiles(result.contentJson, sanitizedName, absoluteOutputDir);
          console.log(`\n✅ Content files written to: ${path.join(absoluteOutputDir, 'content', sanitizedName)}`);
        } catch (error: any) {
          console.error('\n⚠️  Warning: Failed to write content files:', error.message);
          // Don't fail the entire generation if content file writing fails
          console.error('Continuing with config output...');
        }
      }
    }
  } catch (error: any) {
    console.error('\n💥 Fatal Error during generation:');
    console.error(error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n💥 Unhandled Runtime Error:');
  console.error(error);
  process.exit(1);
});
