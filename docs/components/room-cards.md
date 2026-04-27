# Component: RoomCards

## Component Purpose

Display hotel room information with pricing, amenities, and booking actions in various card layouts to enable guests to compare and select accommodations.

## File Location

- **File:** `web-app/components/blocks/RoomCard/index.tsx`
- **Category:** Block

## Props Schema (ZOD)

```typescript
export const RoomCardFlatSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  type: z.string().min(1),
  price: z.number().positive(),
  capacity: z.number().positive().max(10),
  amenities: z.array(z.string()).optional().default([]),
  image: z.string().optional(),
  description: z.string().max(500).optional(),
  variant: z.enum(['compact', 'detailed', 'grid']).default('detailed'),
  imageHeight: z.enum(['default', 'tall', 'wide']).optional(),
  onBookNow: z.any().optional(),
  onViewDetails: z.any().optional(),
  className: z.string().optional()
}).strict();
```

## TypeScript Interface

```typescript
export interface RoomCardProps {
  id: string;
  name: string;
  type: string;
  price: number;
  capacity: number;
  amenities: string[];
  image?: string;
  description?: string;
  variant?: 'compact' | 'detailed' | 'grid';
  imageHeight?: 'default' | 'tall' | 'wide';
  onBookNow?: (roomId: string) => void;
  onViewDetails?: (roomId: string) => void;
  className?: string;
}
```

## CVA Variants

### Available Variants

| Variant Dimension | Options | Default | Description |
|-------------------|---------|---------|-------------|
| variant | compact \| detailed \| grid | detailed | Card layout complexity and information density |
| imageHeight | default \| tall \| wide | default | Image aspect ratio for room photography |

### Variant Combinations

**Recommended Combinations:**

| Hotel Type | Variant | Image Height | Notes |
|------------|---------|--------------|-------|
| Luxury | detailed | tall | Spacious layout with prominent imagery |
| Budget | compact | default | Efficient, information-focused presentation |
| Boutique | detailed | wide | Visual emphasis on unique room features |
| Resort | grid | default | Clean grid for comparing multiple options |
| Business | detailed | default | Professional layout with comprehensive details |

**Avoid Combinations:**
- grid + tall (inconsistent grid alignment)
- compact + wide (visual imbalance)
- detailed + limited amenities (appears incomplete)

## LLM Selection Guidelines

### Decision Tree

```
IF roomsPageLayout === "grid" THEN
  variant = "grid"
  imageHeight = "default"
  Consistent grid alignment for comparison

IF roomsPageLayout === "list" OR "featured" THEN
  variant = "detailed" | "compact"
  imageHeight = "tall" | "default"
  Emphasize individual room features

IF hotelType === "luxury" THEN
  variant = "detailed"
  imageHeight = "tall"
  Show premium features and spacious imagery
  Include comprehensive amenity lists

IF hotelType === "budget" THEN
  variant = "compact"
  imageHeight = "default"
  Focus on value and essential information
  Streamlined presentation for quick comparison

IF hotelType === "boutique" THEN
  variant = "detailed"
  imageHeight = "wide"
  Highlight unique design elements
  Emphasize distinctive amenities

IF hotelType === "resort" THEN
  variant = "grid" | "detailed"
  imageHeight = "default" | "wide"
  Balance feature showcase with comparison ease
  Show room views and resort amenities

IF hotelType === "business" THEN
  variant = "detailed"
  imageHeight = "default"
  Professional presentation with work amenities
  Clear booking workflow integration

IF targetAudience === "comparison-shoppers" THEN
  variant = "grid"
  Standardized layout for easy comparison
  Consistent information hierarchy

IF targetAudience === "experience-seekers" THEN
  variant = "detailed"
  Rich descriptions and feature highlights
  Emotional appeal through imagery

IF targetAudience === "budget-conscious" THEN
  variant = "compact"
  Clear pricing and value proposition
  Essential information only

IF roomType === "suite" OR "premium" THEN
  variant = "detailed"
  imageHeight = "tall" | "wide"
  Showcase luxury features and space

IF roomType === "standard" OR "economy" THEN
  variant = "compact" | "grid"
  imageHeight = "default"
  Efficient presentation, focus on value

IF imageCount > 3 THEN
  imageHeight = "wide"
  Showcase multiple room angles

IF amenityCount > 8 THEN
  variant = "detailed"
  Comprehensive amenity display
```

## Content Guidelines

### Room Name
- **Length:** 1-100 characters (ZOD enforced)
- **Format:** Descriptive room type + distinguishing features
- **Examples:** "Deluxe King Room", "Executive Suite", "Ocean View Studio", "Garden Cottage"

### Room Type
- **Purpose:** Quick categorization for filtering and comparison
- **Common Types:** Standard, Deluxe, Suite, Studio, Cottage, Villa, Penthouse
- **Length:** 1-50 characters recommended
- **Examples:** "King Room", "Double Queen Suite", "Ocean View Studio"

### Price
- **Format:** Numeric value for nightly rate
- **Currency:** Usually implied by hotel location
- **Precision:** No decimals for whole numbers, 2 decimals for partial amounts
- **Display:** Format with currency symbols in component (e.g., $299, €250)

### Capacity
- **Range:** 1-10 guests maximum (ZOD enforced)
- **Format:** Number representing maximum occupancy
- **Context:** Adults + children combinations
- **Examples:** 2 (couple), 4 (family), 8 (group)

### Amenities
- **Length:** Unlimited array, but practical limit 15 items
- **Format:** Short descriptive phrases
- **Categories:** Bed type, bathroom, technology, comfort, view, accessibility
- **Examples:** "King Bed", "Ocean View", "Mini Bar", "Work Desk", "Rain Shower"

### Description
- **Length:** Maximum 500 characters (ZOD enforced)
- **Purpose:** Highlight unique selling points and atmosphere
- **Format:** 2-4 sentences, benefit-oriented
- **Focus:** What makes this room special and worth the price

### Do/Don't Examples

**DO:**
- Use descriptive, benefit-oriented room names
- Include capacity in room type when relevant ("Family Suite")
- Price competitively based on features and location
- Group amenities by category for readability
- Write descriptions that sell the experience
- Include unique features that differentiate rooms

**DON'T:**
- Use generic room names without distinction
- Exceed 100 characters in room names
- Forget to include essential amenities
- Write technical descriptions instead of benefits
- Include unavailable or misleading features
- Ignore target audience preferences

## Examples

### Example 1: Luxury Suite Room Card

```json
{
  "id": "luxury-suite-001",
  "name": "Presidential Ocean View Suite",
  "type": "Executive Suite",
  "price": 599,
  "capacity": 4,
  "amenities": [
    "King Bed", "Ocean View", "Living Area", "Mini Bar",
    "Rain Shower", "Work Desk", "Balcony", "Marble Bathroom",
    "Coffee Maker", "Smart TV", "Luxury Linens"
  ],
  "image": "https://cdn.example.com/hotel/luxury-suite-ocean.webp",
  "description": "Experience unparalleled luxury in our Presidential Suite featuring breathtaking ocean views, a separate living area, and premium amenities designed for the discerning traveler.",
  "variant": "detailed",
  "imageHeight": "tall"
}
```

**Rationale:** Detailed variant showcases premium features and spacious layout. Tall image height emphasizes luxurious room dimensions and ocean views. Comprehensive amenity list justifies premium pricing.

### Example 2: Budget Standard Room Card

```json
{
  "id": "budget-std-001",
  "name": "Comfort Queen Room",
  "type": "Standard Queen",
  "price": 129,
  "capacity": 2,
  "amenities": [
    "Queen Bed", "Private Bathroom", "Free WiFi", "TV", "Air Conditioning"
  ],
  "image": "https://cdn.example.com/hotel/budget-queen-room.webp",
  "description": "Clean, comfortable room with essential amenities for a restful stay. Perfect for budget-conscious travelers seeking value and convenience.",
  "variant": "compact",
  "imageHeight": "default"
}
```

**Rationale:** Compact variant focuses on efficiency and value. Essential amenities highlight practical benefits. Description emphasizes cleanliness and value proposition appealing to budget travelers.

### Example 3: Boutique Design Room Card

```json
{
  "id": "boutique-design-001",
  "name": "Artist Loft King Room",
  "type": "Boutique King",
  "price": 289,
  "capacity": 2,
  "amenities": [
    "King Bed", "City View", "Art Gallery Access", "Premium Sound System",
    "Designer Furniture", "Rain Shower", "Mini Bar", "Work Station"
  ],
  "image": "https://cdn.example.com/hotel/boutique-artist-loft.webp",
  "description": "Immerse yourself in artistic luxury with our uniquely designed King Room featuring original artwork, premium sound system, and exclusive gallery access.",
  "variant": "detailed",
  "imageHeight": "wide"
}
```

**Rationale:** Detailed variant showcases unique artistic features. Wide image height emphasizes room design and artistic elements. Special amenities (art gallery access, premium sound) differentiate from standard rooms.

### Example 4: Resort Family Room Card

```json
{
  "id": "resort-family-001",
  "name": "Tropical Garden Family Suite",
  "type": "Family Suite",
  "price": 349,
  "capacity": 6,
  "amenities": [
    "King Bed", "Bunk Beds", "Garden View", "Mini Fridge",
    "Kids Activities", "Patio Access", "Coffee Maker", "Safe"
  ],
  "image": "https://cdn.example.com/hotel/resort-family-suite.webp",
  "description": "Spacious family suite with separate sleeping areas, garden views, and kid-friendly amenities. Perfect for families seeking comfort and convenience.",
  "variant": "grid",
  "imageHeight": "default"
}
```

**Rationale:** Grid variant enables easy comparison with other room options. Default image height maintains consistent grid layout. Family-focused amenities highlight suitability for children.

### Example 5: Business Executive Room Card

```json
{
  "id": "business-exec-001",
  "name": "Executive Business King",
  "type": "Business King",
  "price": 259,
  "capacity": 2,
  "amenities": [
    "King Bed", "City Skyline View", "Large Work Desk", "Ergonomic Chair",
    "High-Speed WiFi", "Coffee Maker", "Iron Board", "Room Service Access"
  ],
  "image": "https://cdn.example.com/hotel/business-executive-room.webp",
  "description": "Productivity-enhanced room designed for business travelers with large workspace, high-speed connectivity, and premium business amenities.",
  "variant": "detailed",
  "imageHeight": "default"
}
```

**Rationale:** Detailed variant showcases business-focused amenities and workspace. Default image height provides balanced presentation of work and comfort features. Description emphasizes productivity benefits.

## Constraints

### Technical Constraints
- Component must handle responsive breakpoints (mobile: 1 column, tablet: 2 columns, desktop: 3+ columns)
- Image optimization required (.webp format with responsive srcsets)
- Hover states and transitions for interactive elements
- Semantic HTML5 structure required (`<article>`, `<figure>`, `<figcaption>`)
- ARIA labels for interactive buttons and links

### Content Constraints
- Room name: 1-100 characters (ZOD enforced)
- Room type: 1-50 characters recommended
- Description: Maximum 500 characters (ZOD enforced)
- Capacity: 1-10 guests maximum (ZOD enforced)
- Price: Positive numeric value (ZOD enforced)
- Amenities: Array of strings, practical limit 15 items

### Performance Constraints
- Initial render time <100ms per card
- Image loading with lazy loading optimization
- Bundle size impact <15KB gzipped per card
- Grid layouts must maintain consistent sizing
- Hover animations <200ms duration

## Accessibility Requirements

- **Semantic Structure:** Use `<article>` for each room card with proper heading hierarchy
- **Image Accessibility:** Alt text describing room features and atmosphere
- **Button Labels:** Descriptive text for booking and details actions
- **Keyboard Navigation:** Full keyboard accessibility for all interactive elements
- **Screen Reader Support:** ARIA labels and roles for complex card layouts
- **Color Contrast:** WCAG 2.1 AA compliance (4.5:1 for normal text, 3:1 for large text)
- **Focus Management:** Clear focus indicators and logical tab order
- **Price Display:** Screen reader-friendly price formatting
- **Capacity Information:** Clear indication of maximum occupancy

## Responsive Behavior

### Mobile (<768px)
- **Layout:** Single column, full-width cards
- **Image Height:** Default or tall, optimized for mobile viewing
- **Typography:** Reduced text sizes with increased line height
- **Button Sizing:** 44px+ minimum touch targets
- **Information Priority:** Essential info first (name, price, capacity)
- **Amenities:** Truncate list with "Show more" option
- **Spacing:** Compact spacing with clear visual separation

### Tablet (768px - 1023px)
- **Layout:** 2-column grid for efficient comparison
- **Image Height:** Default height for consistent grid alignment
- **Typography:** Balanced sizing for tablet reading
- **Interactive Elements:** Enhanced touch targets and hover states
- **Information Density:** Moderate detail level with good readability

### Desktop (≥1024px)
- **Layout:** 3+ column grid for comprehensive comparison
- **Image Height:** All height variants available (default, tall, wide)
- **Typography:** Full size with optimal readability
- **Hover Effects:** Enhanced interactions with smooth transitions
- **Information Density:** Maximum detail level with all amenities visible
- **Actions:** Prominent booking and details buttons with clear calls-to-action

## Testing Guidelines

### Unit Tests
- Test all variant combinations render correctly
- Verify ZOD contract validation for all props
- Test responsive behavior at different breakpoints
- Validate accessibility attributes and ARIA labels
- Test image loading and error handling
- Verify booking and details callback functions

### Visual Regression Tests
- Compare screenshots across all viewport sizes
- Test all variant combinations (compact/detailed/grid)
- Validate image height variants (default/tall/wide)
- Test hover states and interactive elements
- Verify consistent card dimensions in grid layouts
- Test with different amenity list lengths

### Integration Tests
- Test RoomCard integration with RoomsPage
- Verify booking flow functionality
- Test room comparison features
- Validate filter and search integration
- Test room detail navigation
- Verify responsive grid behavior

### Performance Tests
- Bundle size impact testing
- Image loading optimization verification
- Large room list rendering performance
- Memory usage with multiple cards
- Animation performance testing

## Common Pitfalls

1. **Inconsistent Grid Layout:** Cards have varying heights causing misalignment
   - **Symptom:** Jagged grid appearance, poor visual rhythm
   - **Fix:** Use consistent imageHeight prop in grid layouts
   - **Prevention:** Standardize dimensions for grid variants

2. **Missing Essential Information:** Price or capacity not prominently displayed
   - **Symptom:** Users can't quickly compare key decision factors
   - **Fix:** Ensure price and capacity are always visible and prominent
   - **Prevention:** Design information hierarchy with key details first

3. **Poor Image Optimization:** Large image files slowing page load
   - **Symptom:** Slow page load times, poor performance scores
   - **Fix:** Use .webp format with proper compression and responsive images
   - **Prevention:** Implement image optimization in build process

4. **Inaccessible Booking Buttons:** Poor button labels or missing keyboard access
   - **Symptom:** Accessibility audit failures, poor user experience
   - **Fix:** Add descriptive labels and ensure keyboard navigation
   - **Prevention:** Test with screen readers and keyboard-only navigation

5. **Excessive Amenities List:** Too many items overwhelming users
   - **Symptom:** Information overload, decision paralysis
   - **Fix:** Prioritize top amenities, use categories, add "Show more"
   - **Prevention:** Establish amenity hierarchy and display rules

6. **Inconsistent Pricing:** Different price display formats across cards
   - **Symptom:** Confusing user experience, comparison difficulties
   - **Fix:** Standardize price formatting and currency display
   - **Prevention:** Create price formatting utility component

7. **Missing Mobile Optimization:** Text too small, touch targets inadequate
   - **Symptom:** Poor mobile usability, high bounce rates
   - **Fix:** Implement responsive typography and touch targets
   - **Prevention:** Design mobile-first with adequate touch targets

8. **Loading State Issues:** Cards appearing without content or images
   - **Symptom:** Poor perceived performance, visual jank
   - **Fix:** Implement proper loading states and placeholder content
   - **Prevention:** Design loading states for all card components

## Version History

| Date | Version | Notes |
|------|---------|-------|
| 2025-12-03 | 1.0 | Initial documentation created with comprehensive variant guidelines and accessibility requirements |

## Related Documentation

**Architecture:**
- [PRD - FR2: Rooms Page with Advanced Listing and Filtering](/docs/prd.md#fr2-rooms-page-with-advanced-listing-and-filtering)
- [Story 1.5: Booking Flow & Rooms Page Implementation](/docs/stories/1.5.story.md)
- [Story 1.11: Tailwind Design System](/docs/stories/1.11.story.md)

**Implementation:**
- [ZOD Contract: RoomCardFlatSchema](/web-app/lib/contracts/room.contract.ts#L6-L21)
- [CVA Variants: roomCardVariants](/web-app/lib/cva-variants.ts#L208-L221)
- [CVA Image Variants: roomCardImageVariants](/web-app/lib/cva-variants.ts#L226-L240)
- [Component Source Code](/web-app/components/blocks/RoomCard/index.tsx)
- [TypeScript Interfaces](/web-app/types/room.ts#L5-L19)

**LLM Generation (Epic 7):**
- **Used by:** StylingAgent (variant selection), ContentGenerator (room descriptions), AssemblyAgent (rooms page layout)
- **Prompt Context:** Requires hotelType, targetAudience, roomsPageLayout, roomType parameters
- **Quality Gates:** ZOD validation, accessibility compliance, responsive grid testing, price formatting validation
- **Cost Considerations:** High-impact component - optimize amenity display and image loading for efficiency