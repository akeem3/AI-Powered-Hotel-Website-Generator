/**
 * Add View More Buttons to WebsiteConfig Fixtures
 *
 * Issue #4: Adds "View More" buttons to teaser sections in existing WebsiteConfig fixtures.
 * This script updates existing WebsiteConfig files without re-running the full migration.
 *
 * Usage:
 *   npx tsx scripts/add-view-more-buttons.ts [--fixture <name>]
 *
 * Examples:
 *   # Update the-pemberton-grand.json
 *   npx tsx scripts/add-view-more-buttons.ts --fixture the-pemberton-grand
 *
 *   # Update all WebsiteConfig fixtures
 *   npx tsx scripts/add-view-more-buttons.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { WebsiteConfigSchema } from '../web-app/lib/generation/split-to-pages';

interface Component {
  type: string;
  variant?: Record<string, unknown>;
  props?: Record<string, unknown>;
  order: number;
  wrapper?: unknown;
}

interface PageConfig {
  components: Component[];
  title?: string;
  description?: string;
}

interface WebsiteConfig {
  pages: {
    homepage: PageConfig;
    rooms: PageConfig;
    roomDetail: Record<string, PageConfig & { room?: unknown }>;
    gallery: PageConfig;
    amenities: PageConfig;
    reviews: PageConfig;
    contact: PageConfig;
    about: PageConfig;
    faq: PageConfig;
  };
  source?: unknown;
}

/**
 * Create a LinkButton component for "View More" functionality
 */
function createLinkButton(
  text: string,
  href: string,
  ariaLabel: string,
  order: number
): Component {
  return {
    type: 'linkButton',
    variant: { style: 'primary' },
    props: {
      text,
      href,
      ariaLabel,
      center: true,
    },
    order,
  };
}

/**
 * Add View More buttons to homepage teaser sections
 */
function addViewMoreButtonsToHomepage(config: WebsiteConfig): WebsiteConfig {
  const homepage = config.pages.homepage;
  const components = [...homepage.components];

  // Find existing component types
  const hasRooms = components.some(c => c.type === 'rooms');
  const hasGallery = components.some(c => c.type === 'gallery');
  const hasAmenities = components.some(c => c.type === 'amenities');

  // Find the maximum order
  const maxOrder = Math.max(...components.map(c => c.order), 0);

  // Add buttons after each teaser section
  // We insert them in reverse order to maintain correct order
  if (hasAmenities) {
    components.push(createLinkButton('View All Amenities', '/amenities', 'View all amenities and facilities', maxOrder + 3));
  }

  if (hasGallery) {
    components.push(createLinkButton('View Full Gallery', '/gallery', 'View full photo gallery', maxOrder + 2));
  }

  if (hasRooms) {
    components.push(createLinkButton('View All Rooms', '/rooms', 'View all rooms and suites', maxOrder + 1));
  }

  // Sort by order
  components.sort((a, b) => a.order - b.order);

  return {
    ...config,
    pages: {
      ...config.pages,
      homepage: {
        ...homepage,
        components,
      },
    },
  };
}

/**
 * Also transform navigation links from hash-based to page-based (Task #2)
 */
function transformNavigationLinks(config: WebsiteConfig): WebsiteConfig {
  const hashToPageMap: Record<string, string> = {
    '#about': '/about',
    '#rooms': '/rooms',
    '#amenities': '/amenities',
    '#gallery': '/gallery',
    '#booking': '/booking',
    '#reviews': '/reviews',
    '#contact': '/contact',
    '#faq': '/faq',
    '#testimonials': '/reviews',
  };

  function transformHref(href: string): string {
    if (href.startsWith('/')) return href; // Already page-based
    if (hashToPageMap[href]) return hashToPageMap[href];
    return href; // External links or unknown patterns
  }

  function transformComponent(component: Component): Component {
    if (component.type !== 'navigation') return component;

    const props = component.props || {};
    const links = (props.links as Array<{ label: string; href: string }>) || [];
    const ctaButton = props.ctaButton as { text: string; href: string } | undefined;

    return {
      ...component,
      props: {
        ...props,
        links: links.map(link => ({
          ...link,
          href: transformHref(link.href),
        })),
        ctaButton: ctaButton
          ? {
              ...ctaButton,
              href: transformHref(ctaButton.href),
            }
          : undefined,
      },
    };
  }

  // Transform navigation components on all pages
  const transformedConfig = { ...config };
  for (const pageKey of Object.keys(config.pages)) {
    const page = transformedConfig.pages[pageKey as keyof typeof config.pages];
    page.components = page.components.map(transformComponent);
  }

  return transformedConfig;
}

/**
 * Update a single fixture file
 */
async function updateFixture(fixtureName: string): Promise<{
  success: boolean;
  fixtureName: string;
  error?: string;
}> {
  const fixturesDir = path.resolve(process.cwd(), 'web-app/fixtures/configs');
  const fixturePath = path.join(fixturesDir, `${fixtureName}.json`);

  console.log(`\n🔄 Updating: ${fixtureName}.json`);

  if (!fs.existsSync(fixturePath)) {
    return {
      success: false,
      fixtureName,
      error: `Fixture file not found: ${fixturePath}`,
    };
  }

  try {
    // Read existing config
    console.log('  → Reading WebsiteConfig...');
    const content = fs.readFileSync(fixturePath, 'utf8');
    const config = JSON.parse(content) as WebsiteConfig;

    // Validate it's a WebsiteConfig
    console.log('  → Validating WebsiteConfig...');
    const validatedConfig = WebsiteConfigSchema.parse(config);

    // Transform navigation links (Task #2)
    console.log('  → Transforming navigation links...');
    const withNavLinks = transformNavigationLinks(validatedConfig);

    // Add View More buttons (Task #4)
    console.log('  → Adding View More buttons...');
    const withViewMoreButtons = addViewMoreButtonsToHomepage(withNavLinks);

    // Validate result
    console.log('  → Validating result...');
    const finalConfig = WebsiteConfigSchema.parse(withViewMoreButtons);

    // Write back
    console.log('  → Writing updated fixture...');
    fs.writeFileSync(fixturePath, JSON.stringify(finalConfig, null, 2));

    console.log(`  ✅ Updated: ${fixtureName}.json`);

    return { success: true, fixtureName };
  } catch (error: any) {
    console.error(`  ❌ Update failed: ${error.message}`);
    return {
      success: false,
      fixtureName,
      error: error.message,
    };
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  let fixtureName: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--fixture' && args[i + 1]) {
      fixtureName = args[i + 1];
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Add View More Buttons to WebsiteConfig Fixtures

Usage:
  npx tsx scripts/add-view-more-buttons.ts [options]

Options:
  --fixture <name>  Update a specific fixture (without .json extension)
  --help, -h        Show this help message

Examples:
  # Update the-pemberton-grand.json
  npx tsx scripts/add-view-more-buttons.ts --fixture the-pemberton-grand

  # Update all WebsiteConfig fixtures
  npx tsx scripts/add-view-more-buttons.ts
      `);
      process.exit(0);
    }
  }

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     Add View More Buttons & Transform Navigation Links      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  const fixturesDir = path.resolve(process.cwd(), 'web-app/fixtures/configs');

  if (!fs.existsSync(fixturesDir)) {
    console.error(`\n❌ Fixtures directory not found: ${fixturesDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(fixturesDir);
  const jsonFiles = files.filter(f => f.endsWith('.json'));

  let results: Array<{ success: boolean; fixtureName: string; error?: string }> = [];

  if (fixtureName) {
    // Update specific fixture
    const result = await updateFixture(fixtureName);
    results.push(result);
  } else {
    // Update all fixtures
    console.log(`\nFound ${jsonFiles.length} fixtures to update:`);
    for (const file of jsonFiles) {
      const name = file.replace('.json', '');
      const result = await updateFixture(name);
      results.push(result);
    }
  }

  // Print summary
  console.log('\n──────────────────────────────────────────────────────────────');
  console.log('\n📊 Update Summary');
  console.log('');

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  console.log(`Total fixtures: ${results.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${failCount}`);

  if (failCount > 0) {
    console.log('\n❌ Failed updates:');
    for (const result of results.filter(r => !r.success)) {
      console.log(`  - ${result.fixtureName}: ${result.error}`);
    }
    process.exit(1);
  }

  console.log('\n✅ All updates completed successfully!');
  console.log('\nYou can now refresh your browser to see the changes.');
}

main().catch((error) => {
  console.error('\n💥 Fatal Error:');
  console.error(error);
  process.exit(1);
});
