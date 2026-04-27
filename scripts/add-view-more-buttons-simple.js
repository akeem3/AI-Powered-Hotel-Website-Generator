/**
 * Add View More Buttons & Transform Navigation Links (Simple Version)
 *
 * Simple script that directly manipulates JSON without complex imports.
 * This avoids the path alias resolution issues.
 *
 * Usage:
 *   node scripts/add-view-more-buttons-simple.js [--fixture <name>]
 */

const fs = require('fs');
const path = require('path');

/**
 * Transform navigation links from hash-based to page-based
 */
function transformNavigationLinks(config) {
  const hashToPageMap = {
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

  function transformHref(href) {
    if (href.startsWith('/')) return href;
    if (hashToPageMap[href]) return hashToPageMap[href];
    return href;
  }

  // Deep clone and transform
  const transformed = JSON.parse(JSON.stringify(config));

  // Transform all navigation components
  function transformComponents(components) {
    return components.map(component => {
      if (component.type === 'navigation' && component.props) {
        const newProps = { ...component.props };

        if (newProps.links) {
          newProps.links = newProps.links.map(link => ({
            ...link,
            href: transformHref(link.href),
          }));
        }

        if (newProps.ctaButton) {
          newProps.ctaButton = {
            ...newProps.ctaButton,
            href: transformHref(newProps.ctaButton.href),
          };
        }

        return { ...component, props: newProps };
      }
      return component;
    });
  }

  // Apply to all pages
  for (const pageKey of Object.keys(transformed.pages)) {
    transformed.pages[pageKey].components = transformComponents(transformed.pages[pageKey].components);
  }

  return transformed;
}

/**
 * Add View More buttons to homepage
 */
function addViewMoreButtons(config) {
  const transformed = JSON.parse(JSON.stringify(config));
  const homepage = transformed.pages.homepage;
  const components = [...homepage.components];

  // Check what teaser sections exist
  const hasRooms = components.some(c => c.type === 'rooms');
  const hasGallery = components.some(c => c.type === 'gallery');
  const hasAmenities = components.some(c => c.type === 'amenities');

  // Get max order for positioning
  const maxOrder = Math.max(...components.map(c => c.order), 0);
  let buttonOrder = maxOrder + 1;

  // Add buttons after each teaser section
  if (hasRooms) {
    components.push({
      type: 'linkButton',
      variant: { style: 'primary' },
      props: {
        text: 'View All Rooms',
        href: '/rooms',
        ariaLabel: 'View all rooms and suites',
        center: true,
      },
      order: buttonOrder++,
    });
  }

  if (hasGallery) {
    components.push({
      type: 'linkButton',
      variant: { style: 'primary' },
      props: {
        text: 'View Full Gallery',
        href: '/gallery',
        ariaLabel: 'View full photo gallery',
        center: true,
      },
      order: buttonOrder++,
    });
  }

  if (hasAmenities) {
    components.push({
      type: 'linkButton',
      variant: { style: 'primary' },
      props: {
        text: 'View All Amenities',
        href: '/amenities',
        ariaLabel: 'View all amenities and facilities',
        center: true,
      },
      order: buttonOrder++,
    });
  }

  // Sort by order
  components.sort((a, b) => a.order - b.order);

  transformed.pages.homepage.components = components;
  return transformed;
}

/**
 * Update a single fixture
 */
function updateFixture(fixtureName) {
  const fixturesDir = path.resolve(process.cwd(), 'web-app/fixtures/configs');
  const fixturePath = path.join(fixturesDir, `${fixtureName}.json`);

  console.log(`\n🔄 Updating: ${fixtureName}.json`);

  if (!fs.existsSync(fixturePath)) {
    console.error(`  ❌ File not found: ${fixturePath}`);
    return false;
  }

  try {
    // Read
    console.log('  → Reading...');
    const content = fs.readFileSync(fixturePath, 'utf8');
    let config = JSON.parse(content);

    // Check if it's a WebsiteConfig (has 'pages' field)
    if (!config.pages) {
      console.log('  ⚠️  Not a WebsiteConfig (missing "pages" field) - skipping');
      return true;
    }

    // Transform navigation links
    console.log('  → Transforming navigation links...');
    config = transformNavigationLinks(config);

    // Add View More buttons
    console.log('  → Adding View More buttons...');
    config = addViewMoreButtons(config);

    // Write
    console.log('  → Writing...');
    fs.writeFileSync(fixturePath, JSON.stringify(config, null, 2));

    console.log(`  ✅ Updated: ${fixtureName}.json`);
    return true;
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return false;
  }
}

/**
 * Main
 */
function main() {
  const args = process.argv.slice(2);
  let fixtureName = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--fixture' && args[i + 1]) {
      fixtureName = args[i + 1];
      i++;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Add View More Buttons & Transform Navigation Links

Usage:
  node scripts/add-view-more-buttons-simple.js [--fixture <name>]

Examples:
  node scripts/add-view-more-buttons-simple.js --fixture the-pemberton-grand
  node scripts/add-view-more-buttons-simple.js
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

  let successCount = 0;
  let failCount = 0;

  if (fixtureName) {
    // Update specific fixture
    const success = updateFixture(fixtureName);
    if (success) successCount++;
    else failCount++;
  } else {
    // Update all fixtures
    console.log(`\nFound ${jsonFiles.length} fixtures to update:\n`);
    for (const file of jsonFiles) {
      const name = file.replace('.json', '');
      const success = updateFixture(name);
      if (success) successCount++;
      else failCount++;
    }
  }

  // Summary
  console.log('\n──────────────────────────────────────────────────────────────');
  console.log('\n📊 Summary');
  console.log(`Total: ${jsonFiles.length}`);
  console.log(`✅ Success: ${successCount}`);
  if (failCount > 0) {
    console.log(`❌ Failed: ${failCount}`);
    process.exit(1);
  }

  console.log('\n✅ All updates completed!');
  console.log('\n👀 You can now refresh your browser to see the changes.');
  console.log('\nChanges applied:');
  console.log('  • Navigation links: #about → /about, #rooms → /rooms, etc.');
  console.log('  • View All Rooms button after rooms section');
  console.log('  • View Full Gallery button after gallery section');
  console.log('  • View All Amenities button after amenities section');
}

main();
