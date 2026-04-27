# Component: Amenities

## Component Purpose

Display hotel amenities and features with categorized icons, descriptions, and various layout options to showcase facilities, services, and property offerings to potential guests.

## File Location

- **File:** `web-app/components/blocks/Amenities/index.tsx`
- **Category:** Block

## Props Schema (ZOD)

```typescript
export const AmenitiesContract = z.object({
  variant: z.object({
    layout: z.enum(['grid', 'list', 'featured']),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    iconSize: z.enum(['small', 'medium', 'large']).optional(),
    iconStyle: z.enum(['default', 'muted', 'colored']).optional(),
    cardStyle: z.enum(['default', 'minimal', 'elevated']).optional()
  }),
  amenities: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(2).max(60),
      description: z.string().max(200).optional(),
      icon: z.string(),
      category: z.enum(['room', 'hotel', 'location', 'services']),
      featured: z.boolean().optional()
    })
  ).min(1),
  showCategory: z.boolean().optional(),
  filterByCategory: z.enum(['room', 'hotel', 'location', 'services']).optional(),
  className: z.string().optional()
}).strict();
```

> **Note:** The `AmenitiesProps` interface includes `heading` and `subheading` properties which are handled directly by the component and are not part of the Zod validation contract.

## TypeScript Interface

```typescript
export interface AmenitiesProps {
  heading?: string;
  subheading?: string;
  variant: {
    layout: 'grid' | 'list' | 'featured';
    columns?: 2 | 3 | 4;
    iconSize?: 'small' | 'medium' | 'large';
    iconStyle?: 'default' | 'muted' | 'colored';
    cardStyle?: 'default' | 'minimal' | 'elevated';
  };
  amenities: {
    id: string;
    name: string;
    description?: string;
    icon: string;
    category: 'room' | 'hotel' | 'location' | 'services';
    featured?: boolean;
  }[];
  showCategory?: boolean;
  filterByCategory?: 'room' | 'hotel' | 'location' | 'services';
  className?: string;
}
```

## CVA Variants

### Available Variants

| Variant Dimension | Options | Default | Description |
|-------------------|---------|---------|-------------|
| layout | grid \| list \| featured | grid | Amenity arrangement and presentation |
| columns | 2 \| 3 \| 4 | 3 | Number of columns in grid layout |
| iconSize | small \| medium \| large | medium | Icon sizing for amenity visual elements |
| iconStyle | default \| muted \| colored | default | Icon color and styling treatment |
| cardStyle | default \| minimal \| elevated | default | Visual styling of amenity containers |

### Variant Combinations

**Recommended Combinations:**

| Hotel Type | Layout | Columns | IconSize | IconStyle | CardStyle | Notes |
|------------|--------|---------|----------|----------|----------|-------|
| Luxury | featured | 4 | large | colored | elevated | Premium presentation with detailed spacing |
| Budget | list | - | small | muted | minimal | Efficient, functional display |
| Boutique | grid | 3 | medium | default | default | Modern, artistic presentation |
| Resort | grid | 4 | medium | colored | default | Family-friendly with visual appeal |
| Business | grid | 3 | medium | default | elevated | Professional, comprehensive display |

**Avoid Combinations:**
- list + columns (list has own layout logic)
- featured + 2 columns (featured needs 3+ columns)
- small + elevated (visual inconsistency)
- colored + minimal (style conflict)

## LLM Selection Guidelines

### Decision Tree

```
IF amenityCount <= 6 THEN
  layout = "list"
  Single column presentation with detailed focus
  Include descriptions for each amenity

IF amenityCount >= 12 THEN
  layout = "grid"
  columns = 4 | 3
  Organized categorization for easy scanning

IF amenityCount BETWEEN 7-11 THEN
  layout = "grid"
  columns = 3
  Balanced presentation with good visibility

IF hotelType === "luxury" THEN
  layout = "featured"
  columns = 4
  iconSize = "large"
  iconStyle = "colored"
  cardStyle = "elevated"
  Emphasize premium amenities and attention to detail

IF hotelType === "budget" THEN
  layout = "list"
  iconSize = "small"
  iconStyle = "muted"
  cardStyle = "minimal"
  Functional, efficient presentation
  Focus on essential amenities

IF hotelType === "boutique" THEN
  layout = "grid"
  columns = 3
  iconSize = "medium"
  iconStyle = "default"
  cardStyle = "default"
  Modern, artistic presentation
  Highlight unique amenities

IF hotelType === "resort" THEN
  layout = "grid"
  columns = 4
  iconSize = "medium"
  iconStyle = "colored"
  cardStyle = "default"
  Family-friendly, visually engaging
  Emphasize fun and relaxation amenities

IF hotelType === "business" THEN
  layout = "grid"
  columns = 3
  iconSize = "medium"
  iconStyle = "default"
  cardStyle = "elevated"
  Professional, comprehensive display
  Focus on business-oriented amenities

IF primaryAmenityType === "business-facilities" THEN
  filterByCategory = "services"
  Show meeting rooms, business center, Wi-Fi
  Emphasize productivity features

IF primaryAmenityType === "luxury-features" THEN
  filterByCategory = "hotel"
  Show spa, fine dining, concierge
  Emphasize premium services

IF primaryAmenityType === "room-comforts" THEN
  filterByCategory = "room"
  Show premium bedding, climate control, entertainment
  Focus on guest room enhancements

IF primaryAmenityType === "location-benefits" THEN
  filterByCategory = "location"
  Show proximity to attractions, transportation, views
  Emphasize location advantages

IF showCategory = true THEN
  Group amenities by category
  Use category headers or visual separation
  Filter option for users

IF targetAudience === "business-travelers" THEN
  Prioritize "services" category amenities
  IconStyle = "default" | "elevated"
  Professional appearance

IF targetAudience === "leisure-travelers" THEN
  Show balanced mix of all categories
  IconStyle = "colored" for engagement
  Family-friendly presentation

IF targetAudience === "families" THEN
  Prioritize "hotel" and "location" categories
  IconSize = "medium" | "large"
  Visual appeal for children

IF placement === "sidebar" OR "compact" THEN
  layout = "list"
  columns = 2 (if grid)
  iconSize = "small"
  Space-efficient presentation

IF placement === "featured-section" THEN
  layout = "featured"
  columns = 4
  iconSize = "large"
  Prominent, detailed presentation

IF brandPersonality === "modern" THEN
  iconStyle = "colored"
  cardStyle = "default"
  Contemporary, vibrant appearance

IF brandPersonality === "traditional" THEN
  iconStyle = "muted" | "default"
  cardStyle = "minimal" | "default"
  Classic, professional appearance

IF hasFeaturedAmenities THEN
  Use featured layout OR mark specific amenities
  Highlight unique selling points
  Use cardStyle = "elevated" for emphasis

IF amenityDescriptions are detailed THEN
  layout = "list" | "featured"
  Provide adequate space for text
  Use larger iconSize for balance

IF amenityDescriptions are brief THEN
  layout = "grid"
  columns = 3 | 4
  Compact presentation with icons as focus
```

## Content Guidelines

### Amenity Name
- **Length:** 2-60 characters (ZOD enforced)
- **Format:** Clear, concise amenity description
- **Examples:** "Swimming Pool", "Free Wi-Fi", "Room Service", "Concierge", "Spa Services"

### Amenity Description
- **Length:** Maximum 200 characters (ZOD enforced)
- **Purpose:** Brief additional detail or benefit
- **Format:** Benefit-oriented and guest-focused
- **Examples:** "Heated pool with panoramic city views", "High-speed wireless internet throughout", "24-hour professional assistance"

### Amenity Icon
- **Purpose:** Visual representation of amenity type
- **Format:** Font Awesome class name or custom SVG path
- **Examples:** "fa-wifi", "fa-swimming-pool", "fa-parking", "fa-concierge-bell"

### Amenity Category
- **Options:** 'room', 'hotel', 'location', 'services' (ZOD enforced enum)
- **Room:** Guest room specific amenities (bedding, entertainment, climate)
- **Hotel:** Property-wide facilities (spa, dining, pool, fitness)
- **Location:** Geographic and accessibility benefits (views, transport, attractions)
- **Services:** Professional and convenience services (concierge, business center, room service)

### Featured Amenity
- **Purpose:** Highlight premium or unique amenities
- **Usage:** Special emphasis or visual highlighting
- **Criteria:** Premium offerings, unique features, competitive advantages

### Do/Don't Examples

**DO:**
- Use consistent icon naming conventions
- Include both common and unique amenities
- Group amenities by logical categories
- Use descriptive, benefit-oriented descriptions
- Include premium amenities for luxury positioning
- Ensure icon availability and compatibility
- Test icon rendering across browsers

**DON'T:**
- Use generic or unclear amenity names
- Overwhelm with too many amenities (max 20)
- Use low-quality or inconsistent icons
- Forget to include essential amenities like Wi-Fi
- Ignore mobile responsiveness considerations
- Use copyrighted icons without proper licensing
- Forget to test icon accessibility

## Examples

### Example 1: Luxury Hotel Featured Amenities

```json
{
  "variant": {
    "layout": "featured",
    "columns": 4,
    "iconSize": "large",
    "iconStyle": "colored",
    "cardStyle": "elevated"
  },
  "amenities": [
    {
      "id": "luxury-spa-001",
      "name": "Infinity Spa & Wellness Center",
      "description": "Full-service spa with massage therapy and beauty treatments",
      "icon": "fa-spa",
      "category": "hotel",
      "featured": true
    },
    {
      "id": "luxury-dining-002",
      "name": "Michelin-Star Restaurant",
      "description": "Fine dining with award-winning culinary experience",
      "icon": "fa-utensils",
      "category": "hotel",
      "featured": true
    }
  ],
  "showCategory": true
}
```

**Rationale:** Featured layout with 4 columns showcases premium amenities with adequate space. Large icons and colored styling create luxurious appearance. Elevated cardStyle adds premium polish. Spa and dining emphasized as luxury differentiators.

### Example 2: Budget Hotel List Amenities

```json
{
  "variant": {
    "layout": "list",
    "iconSize": "small",
    "iconStyle": "muted",
    "cardStyle": "minimal"
  },
  "amenities": [
    {
      "id": "budget-wifi-001",
      "name": "Free High-Speed Wi-Fi",
      "description": "Available throughout the property",
      "icon": "fa-wifi",
      "category": "services"
    },
    {
      "id": "budget-parking-002",
      "name": "Free Guest Parking",
      "description": "On-site parking available for all guests",
      "icon": "fa-parking",
      "category": "location"
    }
  ],
  "showCategory": false
}
```

**Rationale:** List layout provides efficient, space-saving presentation perfect for budget hotels. Small icons and muted styling maintain clean, functional appearance. Focus on essential amenities that provide real value to cost-conscious travelers.

### Example 3: Boutique Hotel Grid Amenities

```json
{
  "variant": {
    "layout": "grid",
    "columns": 3,
    "iconSize": "medium",
    "iconStyle": "default",
    "cardStyle": "default"
  },
  "amenities": [
    {
      "id": "boutique-art-001",
      "name": "Art Gallery",
      "description": "Rotating local artist exhibitions",
      "icon": "fa-palette",
      "category": "hotel",
      "featured": true
    },
    {
      "id": "boutique-coffee-002",
      "name": "Artisan Coffee Bar",
      "description": "Locally roasted specialty coffee",
      "icon": "fa-coffee",
      "category": "hotel"
    }
  ],
  "showCategory": true
}
```

**Rationale:** Grid layout with 3 columns provides balanced presentation for boutique's unique amenities. Default styling complements artistic aesthetic. Featured amenities highlight unique boutique differentiators like art gallery and artisanal coffee.

### Example 4: Resort Hotel Family Amenities

```json
{
  "variant": {
    "layout": "grid",
    "columns": 4,
    "iconSize": "medium",
    "iconStyle": "colored",
    "cardStyle": "default"
  },
  "amenities": [
    {
      "id": "resort-pool-001",
      "name": "Family Pool Complex",
      "description": "Multiple pools with waterslides and kids area",
      "icon": "fa-swimming-pool",
      "category": "hotel",
      "featured": true
    },
    {
      "id": "resort-kids-002",
      "name": "Kids Club",
      "description": "Supervised activities and entertainment",
      "icon": "fa-child",
      "category": "services"
    }
  ],
  "showCategory": true,
  "filterByCategory": "hotel"
}
```

**Rationale:** Grid layout with 4 columns accommodates resort's extensive amenities. Medium icons provide good visibility. Colored styling creates engaging, family-friendly appearance. Focus on family-oriented amenities like pool and kids activities.

### Example 5: Business Hotel Professional Amenities

```json
{
  "variant": {
    "layout": "grid",
    "columns": 3,
    "iconSize": "medium",
    "iconStyle": "default",
    "cardStyle": "elevated"
  },
  "amenities": [
    {
      "id": "business-center-001",
      "name": "Business Center",
      "description": "Fully equipped office space with printing services",
      "icon": "fa-briefcase",
      "category": "services",
      "featured": true
    },
    {
      "id": "business-meeting-002",
      "name": "Meeting Rooms",
      "description": "Conference facilities with AV equipment",
      "icon": "fa-users",
      "category": "hotel"
    }
  ],
  "showCategory": true,
  "filterByCategory": "services"
}
```

**Rationale:** Grid layout with 3 columns provides professional presentation. Default styling maintains business-appropriate appearance. Elevated cardStyle emphasizes importance of business amenities. FilterByCategory focuses on services relevant to business travelers.

## Constraints

### Technical Constraints
- Icon names must be valid Font Awesome classes or SVG paths
- Minimum 1 amenity required (ZOD enforced)
- Responsive behavior for all layout variants
- Icon consistency and visual coherence required
- Accessibility support for icon descriptions

### Content Constraints
- Amenity names: 2-60 characters (ZOD enforced)
- Descriptions: Maximum 200 characters (ZOD enforced)
- Categories: Must be one of 4 predefined types (ZOD enforced)
- Featured amenity marking for emphasis
- Optional category filtering functionality

### Performance Constraints
- Initial render time <150ms
- Icon loading optimization required
- Bundle size impact <25KB gzipped
- Smooth animations and transitions
- Efficient rendering for large amenity lists

## Accessibility Requirements

- **Icon Accessibility:** All icons have meaningful alt text or ARIA labels
- **Keyboard Navigation:** Full keyboard accessibility for filtering controls
- **Screen Reader Support:** Clear category and amenity descriptions
- **Color Contrast:** WCAG 2.1 AA compliance for text and icons
- **Focus Management:** Proper focus indicators for interactive elements
- **Text Scaling:** Support for browser text zoom levels
- **Icon Display:** High contrast icons for visibility

## Responsive Behavior

### Mobile (<768px)
- **Grid Layouts:** 1-2 columns depending on amenity count
- **List Layout:** Single column with stacked amenities
- **Featured Layout:** 2 columns with adequate spacing
- **Icon Sizing:** Small to medium icons for mobile
- **Text Scaling:** Readable font sizes for mobile viewing
- **Touch Targets:** Adequate spacing for touch interaction

### Tablet (768px - 1023px)
- **Grid Layouts:** 2-3 columns for balanced presentation
- **List Layout:** Single or 2 columns depending on content
- **Featured Layout:** 3 columns with enhanced spacing
- **Icon Sizing:** Medium icons for tablet viewing
- **Text Scaling:** Optimized font sizes for tablet

### Desktop (≥1024px)
- **Grid Layouts:** Configurable 2-4 columns
- **List Layout:** 1-2 columns for detailed presentation
- **Featured Layout:** 4 columns for comprehensive display
- **Icon Sizing:** Medium to large icons for desktop
- **Enhanced Features:** Hover states and advanced interactions
- **Text Scaling:** Standard desktop font sizes

## Testing Guidelines

### Unit Tests
- Test all layout variants render correctly
- Verify ZOD contract validation for all amenity fields
- Test category filtering functionality
- Validate responsive behavior at different breakpoints
- Test icon rendering and accessibility
- Verify featured amenity highlighting

### Visual Regression Tests
- Compare screenshots across all viewport sizes
- Test all layout combinations (grid, list, featured)
- Validate icon styles and sizes
- Test category grouping and filtering
- Verify card styling and hover states

### Icon Testing
- Verify icon compatibility across browsers
- Test icon loading and fallback scenarios
- Validate icon accessibility with screen readers
- Test colored vs muted icon styles
- Verify icon sizing consistency

### Content Tests
- Verify character limits for amenity names
- Test amenity description length constraints
- Validate category assignment and filtering
- Test featured amenity functionality
- Verify amenity count limits (3-20)

## Common Pitfalls

1. **Icon Compatibility Issues:** Icons don't render or appear broken
   - **Symptom:** Missing icons or broken displays across browsers
   - **Fix:** Use reliable icon libraries and test compatibility
   - **Prevention:** Verify icon availability before implementation

2. **Overwhelming Amenity Lists:** Too many amenities causing clutter
   - **Symptom:** Poor user experience, information overload
   - **Fix:** Limit to 3-5 featured amenities per category
   - **Prevention:** Establish prioritized amenity selection criteria

3. **Poor Category Organization:** Inconsistent categorization
   - **Symptom:** Confusing user experience and filtering issues
   - **Fix:** Apply consistent category logic and validation
   - **Prevention:** Establish clear category definitions and examples

4. **Inconsistent Icon Sizing:** Variable icon sizes across components
   - **Symptom:** Unprofessional appearance, visual inconsistency
   - **Fix:** Maintain consistent icon sizing within variants
   - **Prevention:** Establish icon size guidelines for each variant

5. **Accessibility Issues:** Poor icon accessibility or descriptions
   - **Symptom:** Screen reader users cannot understand amenities
   - **Fix:** Provide proper ARIA labels and alt text for icons
   - **Prevention:** Design with accessibility requirements from start

6. **Responsive Layout Breaks:** Amenities break at certain screen sizes
   - **Symptom:** Overlapping content or poor layout at breakpoints
   - **Fix:** Test responsive behavior at all standard breakpoints
   - **Prevention:** Design mobile-first responsive amenities

7. **Missing Essential Amenities:** Forgetting important features like Wi-Fi
   - **Symptom:** Incomplete amenity listing, guest dissatisfaction
   - **Fix:** Include essential amenities like Wi-Fi, parking, breakfast
   - **Prevention:** Establish baseline essential amenity requirements

8. **Featured Amenity Overuse:** Too many amenities marked as featured
   - **Symptom:** No emphasis when everything is featured
   - **Fix:** Limit to 2-3 truly unique amenities per section
   - **Prevention:** Establish criteria for featured amenity selection

## Version History

| Date | Version | Notes |
|------|---------|-------|
| 2025-12-03 | 1.0 | Initial documentation created with comprehensive layout guidelines and content requirements |

## Related Documentation

**Architecture:**
- [PRD - Business Amenities Showcase Using FeatureList Component](/docs/prd.md)
- [Story 2.1: Gallery, Testimonials, and Amenities Components](/docs/stories/2.1.story.md)
- [Story 1.11: Tailwind Design System](/docs/stories/1.11.story.md)

**Implementation:**
- [ZOD Contract: AmenitiesContract](/web-app/lib/contracts/amenities.contract.ts#L7-L28)
- [CVA Variants: amenitiesVariants](/web-app/lib/cva-variants.ts#L336-L376)
- [Component Source Code](/web-app/components/blocks/Amenities/index.tsx)

**LLM Generation (Epic 7):**
- **Used by:** StylingAgent (layout selection), ContentGenerator (amenity selection), AssemblyAgent (placement decisions)
- **Prompt Context:** Requires hotelType, targetAudience, primaryAmenityType, placement parameters
- **Quality Gates:** ZOD validation, accessibility compliance, responsive testing, icon compatibility verification
- **Cost Considerations:** High-impact component - optimize icon loading and responsive rendering for efficiency