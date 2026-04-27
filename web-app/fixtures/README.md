# Fixtures Directory

This directory contains sample `HomepageConfig` JSON fixtures for the dynamic preview page.

## Purpose

These fixtures are used by `/preview?config={name}` to demonstrate different hotel website configurations without running the full LangGraph generation pipeline. Each fixture represents a hand-crafted example of how the component system can produce visually different websites.

## Available Fixtures

### 1. luxury-boutique.json
- **Hotel Type:** Luxury boutique hotel
- **Target Audience:** Couples
- **Location:** Santorini, Greece
- **Components:** 8 (hero, navigation, gallery, rooms, testimonials, amenities, booking, contact)
- **Emphasis:** Gallery (masonry layout) and testimonials (featured)
- **Style:** Elegant, immersive with gold accent headers
- **Preview:** `http://localhost:3000/preview?config=luxury-boutique`

### 2. budget-hostel.json
- **Hotel Type:** Budget hostel
- **Target Audience:** Backpackers
- **Location:** Bangkok, Thailand
- **Components:** 5 (navigation, hero, rooms, amenities, contact)
- **Layout:** Minimal single-column layout
- **Style:** Clean, functional
- **Preview:** `http://localhost:3000/preview?config=budget-hostel`

### 3. business-hotel.json
- **Hotel Type:** Business hotel
- **Target Audience:** Business travelers
- **Location:** Singapore Central Business District
- **Components:** 7 (navigation, hero, rooms, amenities, testimonials, booking, contact)
- **Emphasis:** Rooms and booking widget
- **Brand:** Sterling Executive (professional style)
- **Preview:** `http://localhost:3000/preview?config=business-hotel`

## Fixture Format

Each fixture must conform to the `HomepageConfigSchema` from `web-app/app/langgraph/agents/schemas`:

```json
{
  "generationId": "hotel-name-v1",
  "timestamp": "2026-02-18T00:00:00Z",
  "hotelParameters": {
    "hotelType": "luxury|boutique|business|resort|budget",
    "targetAudience": "business|leisure|family|couples|backpackers",
    "brandPersonality": "elegant|modern|friendly|professional|adventurous",
    "hotelName": "Hotel Name",
    "location": "City, Country"
  },
  "components": [
    {
      "type": "hero|navigation|rooms|gallery|testimonials|amenities|booking|contact",
      "variant": { /* variant options */ },
      "props": { /* component props */ },
      "order": 0
    }
  ],
  "layoutStructure": "single-column|grid|mixed",
  "emphasisComponents": ["component1", "component2"],
  "validationStatus": "PASS|WARNING|FAIL"
}
```

## Security

**IMPORTANT:** All fixture names must pass the `CONFIG_NAME_REGEX` validation (`^[a-zA-Z0-9-_]+$`):

- ✅ Valid: `luxury-boutique`, `budget_hostel`, `hotel123`
- ❌ Invalid: `luxury.boutique`, `../etc/passwd`, `config/../../../malicious`

This prevents path traversal attacks when loading fixtures from the filesystem.

## Usage

```tsx
import { loadFixture, getAvailableFixtures } from '@/lib/validation/fixtureValidation';

// Load a specific fixture
const config = loadFixture('luxury-boutique');

// Get all available fixtures
const fixtures = getAvailableFixtures(); // ['luxury-boutique', 'budget-hostel', 'business-hotel']
```

## Related

- **Epic 16:** Dynamic Preview & Config Validation
- **Story 16.1:** Dynamic Preview Page
- **Story 16.2:** Sample HomepageConfig Fixtures
- **Story 16.3:** Visual Comparison & Gap Analysis

## Development

When adding new fixtures:

1. Ensure the JSON passes `HomepageConfigSchema` validation
2. Use a descriptive name with only alphanumeric characters, hyphens, and underscores
3. Add a comment in the JSON describing what makes this fixture unique
4. Test in the preview page: `/preview?config={your-fixture-name}`
5. Verify image URLs end with `#.webp` and `#.m.webp` for gallery images
