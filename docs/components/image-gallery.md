# Component: ImageGallery

## Component Purpose

Display hotel photography gallery with multiple layout options, lightbox functionality, and responsive image handling to showcase hotel aesthetics, room features, and property ambiance.

## File Location

- **File:** `web-app/components/blocks/ImageGallery/index.tsx`
- **Category:** Block

## Props Schema (ZOD)

```typescript
export const ImageGalleryContract = z.object({
  variant: z.object({
    layout: z.enum(['grid', 'masonry', 'carousel']),
    spacing: z.enum(['tight', 'normal', 'loose']).optional(),
    aspectRatio: z.enum(['square', 'landscape', 'portrait']).optional(),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    cardStyle: z.enum(['default', 'minimal', 'flat', 'elevated']).optional()
  }),
  images: z.array(
    z.object({
      id: z.string(),
      desktopUrl: z.string().min(1),
      mobileUrl: z.string().min(1),
      alt: z.string().min(5).max(150),
      caption: z.string().max(300).optional()
    })
  ).min(0),
  enableLightbox: z.boolean().optional(),
  className: z.string().optional()
}).strict();
```

## TypeScript Interface

```typescript
export interface ImageGalleryConfig {
  variant: {
    layout: 'grid' | 'masonry' | 'carousel';
    spacing?: 'tight' | 'normal' | 'loose';
    aspectRatio?: 'square' | 'landscape' | 'portrait';
    columns?: 2 | 3 | 4;
    cardStyle?: 'default' | 'minimal' | 'flat' | 'elevated';
  };
  images: {
    id: string;
    desktopUrl: string;
    mobileUrl: string;
    alt: string;
    caption?: string;
  }[];
  enableLightbox?: boolean;
  className?: string;
}
```

## CVA Variants

### Available Variants

| Variant Dimension | Options | Default | Description |
|-------------------|---------|---------|-------------|
| layout | grid \| masonry \| carousel | grid | Gallery arrangement and interaction pattern |
| spacing | tight \| normal \| loose | normal | Gap spacing between gallery items |
| aspectRatio | square \| landscape \| portrait | landscape | Image proportions for gallery items |
| columns | 2 \| 3 \| 4 | 3 | Number of columns in grid layout |
| cardStyle | default \| minimal \| flat \| elevated | default | Visual styling of gallery containers |

### Variant Combinations

**Recommended Combinations:**

| Hotel Type | Layout | Aspect Ratio | Columns | Notes |
|------------|--------|--------------|---------|-------|
| Luxury | masonry | landscape | 3 | Artistic arrangement with professional photography |
| Budget | grid | landscape | 2 | Clean, efficient presentation |
| Boutique | grid | square | 3 | Modern, artistic display with uniform dimensions |
| Resort | carousel | landscape | 3 | Immersive viewing experience for vacation photos |
| Business | grid | landscape | 4 | Professional, comprehensive property showcase |

**Avoid Combinations:**
- carousel + aspectRatio square (inconsistent carousel appearance)
- masonry + 4 columns (overcrowded layout)
- tight spacing + cardStyle flat (visual clutter)

## LLM Selection Guidelines

### Decision Tree

```
IF galleryPurpose === "artistic-showcase" THEN
  layout = "masonry"
  aspectRatio = "landscape"
  spacing = "normal"
  cardStyle = "default"
  Artistic arrangement with varied image sizes

IF galleryPurpose === "efficient-display" THEN
  layout = "grid"
  aspectRatio = "landscape"
  columns = 2 | 3
  spacing = "tight" | "normal"
  Consistent, organized presentation

IF galleryPurpose === "immersive-experience" THEN
  layout = "carousel"
  aspectRatio = "landscape"
  enableLightbox = true
  Full-screen viewing experience

IF hotelType === "luxury" THEN
  layout = "masonry"
  aspectRatio = "landscape"
  columns = 3
  spacing = "normal"
  cardStyle = "default"
  Professional photography showcase

IF hotelType === "budget" THEN
  layout = "grid"
  aspectRatio = "landscape"
  columns = 2
  spacing = "tight"
  cardStyle = "minimal"
  Efficient, value-focused presentation

IF hotelType === "boutique" THEN
  layout = "grid"
  aspectRatio = "square"
  columns = 3
  spacing = "normal"
  cardStyle = "default"
  Modern, artistic uniform display

IF hotelType === "resort" THEN
  layout = "carousel"
  aspectRatio = "landscape"
  columns = 3
  spacing = "normal"
  cardStyle = "default"
  Immersive vacation photography

IF hotelType === "business" THEN
  layout = "grid"
  aspectRatio = "landscape"
  columns = 4
  spacing = "normal"
  cardStyle = "minimal"
  Comprehensive property showcase

IF imageCount <= 6 THEN
  layout = "grid"
  Use organized grid for smaller collections

IF imageCount > 10 THEN
  layout = "carousel" OR "masonry"
  Use carousel for immersive viewing OR masonry for artistic variety

IF targetAudience === "visual-shoppers" THEN
  layout = "carousel"
  enableLightbox = true
  aspectRatio = "landscape"
  Focus on visual impact and detail viewing

IF targetAudience === "quick-scanners" THEN
  layout = "grid"
  columns = 3 | 4
  spacing = "tight"
  Rapid scanning capability

IF placement === "hero-section" THEN
  layout = "carousel"
  aspectRatio = "landscape"
  Prominent, immersive presentation

IF placement === "content-section" THEN
  layout = "grid" OR "masonry"
  columns = 2 | 3
  Integrated with page content

IF brandPersonality === "artistic" THEN
  layout = "masonry"
  cardStyle = "default"
  spacing = "normal"
  Emphasize visual variety and creativity

IF brandPersonality === "professional" THEN
  layout = "grid"
  cardStyle = "minimal"
  spacing = "normal"
  Clean, organized presentation

IF primaryImageType === "architecture" THEN
  aspectRatio = "landscape"
  Show building exteriors and spaces

IF primaryImageType === "portraits" THEN
  aspectRatio = "square" OR "portrait"
  Focus on room details and close-ups

IF primaryImageType === "experiences" THEN
  aspectRatio = "landscape"
  Showcase activities and amenities
```

## Content Guidelines

### Image Requirements
- **Format:** Desktop images must be .webp, mobile images must be .m.webp
- **Count:** 0+ images per gallery (ZOD enforced)
- **Alt Text:** 5-150 characters describing image content (ZOD enforced)
- **Captions:** Maximum 300 characters optional (ZOD enforced)
- **Responsive:** Separate URLs for desktop and mobile versions required

### Image Content Types
- **Architecture:** Building exteriors, facades, entrances, lobbies
- **Interiors:** Room types, common areas, dining spaces, amenities
- **Experiences:** Activities, dining, events, guest interactions
- **Details: design elements, furnishings, unique features
- **Views:** Landscapes, cityscapes, room views, surroundings

### Alt Text Guidelines
- **Purpose:** Describe image content for screen readers and SEO
- **Format:** Concise, descriptive sentences about what's visible
- **Examples:**
  - "Luxurious hotel lobby with marble flooring and contemporary seating"
  - "Ocean view hotel balcony with lounge chairs and sunset"
  - "Elegant restaurant with white tablecloths and soft lighting"

### Caption Guidelines
- **Purpose:** Provide additional context or storytelling
- **Length:** Maximum 200 characters (ZOD enforced)
- **Tone:** Match hotel brand personality and voice
- **Examples:** "Watch the sunset from our premium oceanfront suites"

### Do/Don't Examples

**DO:**
- Use high-quality .webp images for optimal performance
- Provide descriptive alt text for accessibility
- Include captions that enhance the guest experience
- Use consistent image quality and style throughout gallery
- Optimize mobile images separately for smaller screens
- Test lightbox functionality on various devices

**DON'T:**
- Use .jpg/.png formats (violates ZOD validation)
- Forget mobile image URLs (required field)
- Use generic alt text like "hotel image" or "photo"
- Exceed 20 images per gallery (performance impact)
- Include poor quality or low-resolution images
- Ignore accessibility considerations

## Examples

### Example 1: Luxury Hotel Masonry Gallery

```json
{
  "variant": {
    "layout": "masonry",
    "spacing": "normal",
    "aspectRatio": "landscape",
    "columns": 3,
    "cardStyle": "default"
  },
  "images": [
    {
      "id": "luxury-lobby-001",
      "desktopUrl": "https://cdn.example.com/hotel/luxury-lobby-grand.webp",
      "mobileUrl": "https://cdn.example.com/hotel/luxury-lobby-grand.m.webp",
      "alt": "Luxurious hotel lobby with marble columns and grand staircase",
      "caption": "Experience grandeur in our stunning lobby"
    },
    {
      "id": "luxury-suite-002",
      "desktopUrl": "https://cdn.example.com/hotel/luxury-suite-ocean.webp",
      "mobileUrl": "https://cdn.example.com/hotel/luxury-suite-ocean.m.webp",
      "alt": "Executive suite with panoramic ocean view through floor-to-ceiling windows"
    }
  ],
  "enableLightbox": true
}
```

**Rationale:** Masonry layout creates artistic, sophisticated presentation perfect for luxury hotel. Normal spacing provides visual breathing room. Landscape aspectRatio showcases hotel spaces effectively. Default cardStyle adds premium visual polish.

### Example 2: Budget Hotel Grid Gallery

```json
{
  "variant": {
    "layout": "grid",
    "spacing": "tight",
    "aspectRatio": "landscape",
    "columns": 2,
    "cardStyle": "minimal"
  },
  "images": [
    {
      "id": "budget-room-001",
      "desktopUrl": "https://cdn.example.com/hotel/budget-room-comfortable.webp",
      "mobileUrl": "https://cdn.example.com/hotel/budget-room-comfortable.m.webp",
      "alt": "Clean and comfortable hotel room with queen bed and modern amenities"
    },
    {
      "id": "budget-lobby-002",
      "desktopUrl": "https://cdn.example.com/hotel/budget-lobby-welcoming.webp",
      "mobileUrl": "https://cdn.example.com/hotel/budget-lobby-welcoming.m.webp",
      "alt": "Bright hotel lobby with reception desk and seating area"
    }
  ],
  "enableLightbox": false
}
```

**Rationale:** Grid layout provides organized, efficient presentation for budget-conscious guests. Tight spacing maximizes content visibility. Minimal cardStyle reduces visual complexity. Two columns ensure adequate image size on various screens.

### Example 3: Boutique Hotel Square Gallery

```json
{
  "variant": {
    "layout": "grid",
    "spacing": "normal",
    "aspectRatio": "square",
    "columns": 3,
    "cardStyle": "default"
  },
  "images": [
    {
      "id": "boutique-design-001",
      "desktopUrl": "https://cdn.example.com/hotel/boutique-design-artistic.webp",
      "mobileUrl": "https://cdn.example.com/hotel/boutique-design-artistic.m.webp",
      "alt": "Artistically designed boutique hotel room with unique wall art and modern furniture",
      "caption": "Where design meets comfort in perfect harmony"
    },
    {
      "id": "boutique-dining-002",
      "desktopUrl": "https://cdn.example.com/hotel/boutique-dining-intimate.webp",
      "mobileUrl": "https://cdn.example.com/hotel/boutique-dining-intimate.m.webp",
      "alt": "Intimate dining space with ambient lighting and chef's table view"
    }
  ],
  "enableLightbox": true
}
```

**Rationale:** Grid layout with square aspectRatio creates uniform, modern presentation perfect for boutique hotels. Normal spacing maintains visual clarity. Three columns balance image size with gallery density. Default cardStyle complements artistic aesthetic.

### Example 4: Resort Hotel Carousel Gallery

```json
{
  "variant": {
    "layout": "carousel",
    "spacing": "normal",
    "aspectRatio": "landscape",
    "columns": 3,
    "cardStyle": "default"
  },
  "images": [
    {
      "id": "resort-beach-001",
      "desktopUrl": "https://cdn.example.com/hotel/resort-beach-paradise.webp",
      "mobileUrl": "https://cdn.example.com/hotel/resort-beach-paradise.m.webp",
      "alt": "Tropical beach with palm trees and resort cabanas overlooking ocean",
      "caption": "Your private paradise awaits"
    },
    {
      "id": "resort-pool-002",
      "desktopUrl": "https://cdn.example.com/hotel/resort-pool-infinity.webp",
      "mobileUrl": "https://cdn.example.com/hotel/resort-pool-infinity.m.webp",
      "alt": "Infinity pool overlooking tropical ocean with lounge chairs and umbrellas"
    }
  ],
  "enableLightbox": true
}
```

**Rationale:** Carousel layout creates immersive, engaging experience perfect for resort vacations. Landscape aspectRatio showcases scenic views effectively. Lightbox enabled allows guests to explore details. Default spacing maintains visual flow.

### Example 5: Business Hotel Grid Gallery

```json
{
  "variant": {
    "layout": "grid",
    "spacing": "normal",
    "aspectRatio": "landscape",
    "columns": 4,
    "cardStyle": "minimal"
  },
  "images": [
    {
      "id": "business-conference-001",
      "desktopUrl": "https://cdn.example.com/hotel/business-conference-modern.webp",
      "mobileUrl": "https://cdn.example.com/hotel/business-conference-modern.m.webp",
      "alt": "Modern conference room with presentation screen and executive seating"
    },
    {
      "id": "business-executive-002",
      "desktopUrl": "https://cdn.example.com/hotel/business-executive-lounge.webp",
      "mobileUrl": "https://cdn.example.com/hotel/business-executive-lounge.m.webp",
      "alt": "Executive lounge with comfortable seating and work areas for business travelers"
    }
  ],
  "enableLightbox": true
}
```

**Rationale:** Grid layout with 4 columns provides comprehensive property showcase for business travelers. Minimal cardStyle maintains professional appearance. Normal spacing ensures clear visual organization. Lightbox enabled for detailed viewing of business facilities.

## Constraints

### Technical Constraints
- All images must be .webp format (desktop) and .m.webp (mobile)
- Minimum 0 images (ZOD enforced)
- Lazy loading implementation required for performance
- Lightbox functionality optional but recommended for detailed viewing
- Responsive image serving with proper srcsets

### Content Constraints
- Alt text: 5-150 characters minimum (ZOD enforced)
- Captions: Maximum 300 characters optional (ZOD enforced)
- Image URLs: Must be valid URLs with correct file extensions
- Image quality: High-resolution for professional presentation
- Consistent styling and quality across all images

### Performance Constraints
- Initial render time <200ms for gallery layout
- Image lazy loading to prevent initial load delays
- Bundle size impact <30KB gzipped for gallery component
- Lightbox modal performance <100ms to open
- Memory management for large image galleries

## Accessibility Requirements

- **Image Alt Text:** All images have descriptive alt text (5-150 chars)
- **Keyboard Navigation:** Full keyboard accessibility for gallery and lightbox
- **Screen Reader Support:** ARIA labels for gallery navigation and lightbox controls
- **Color Contrast:** WCAG 2.1 AA compliance for gallery controls and overlays
- **Focus Management:** Proper focus trapping in lightbox modal
- **Touch Targets:** Minimum 44px × 44px for gallery navigation controls
- **Image Loading:** Proper loading states and error handling
- **Carousel Navigation:** Clear controls with proper labeling

## Responsive Behavior

### Mobile (<768px)
- **Layout:** Single column or carousel depending on variant
- **Image Sizing:** Mobile-optimized .m.webp images
- **Touch Interaction:** Swipe gestures for carousel, touch-friendly gallery
- **Lightbox:** Full-screen modal with swipe navigation
- **Performance:** Lazy loading critical for mobile performance
- **Spacing:** Optimized spacing for touch interaction

### Tablet (768px - 1023px)
- **Grid Layouts:** 2-3 columns depending on configuration
- **Carousel:** Enhanced touch and cursor interaction
- **Image Quality:** Balance between mobile and desktop optimization
- **Lightbox:** Optimized modal size for tablet screens

### Desktop (≥1024px)
- **Grid Layouts:** 2-4 columns depending on configuration
- **Carousel:** Mouse wheel and keyboard navigation
- **Image Quality:** Full resolution desktop images
- **Lightbox:** Large modal with detailed image viewing
- **Hover Effects:** Enhanced interactive states for gallery items

## Testing Guidelines

### Unit Tests
- Test all layout variants render correctly
- Verify ZOD contract validation for image URLs and formats
- Test responsive behavior at different breakpoints
- Validate lightbox functionality and keyboard navigation
- Test lazy loading implementation
- Verify error handling for missing images

### Visual Regression Tests
- Compare screenshots across all viewport sizes
- Test all layout combinations (grid, masonry, carousel)
- Validate image aspect ratios and spacing
- Test lightbox modal appearance and behavior
- Verify hover states and interactive elements

### Performance Tests
- Image loading performance and optimization
- Lazy loading effectiveness
- Memory usage with large galleries
- Bundle size impact analysis
- Lightbox opening and closing performance

### Accessibility Tests
- Keyboard navigation through gallery and lightbox
- Screen reader compatibility with image alt text
- Focus management and trapping in lightbox
- Color contrast for controls and overlays
- Touch target sizing validation

## Common Pitfalls

1. **Incorrect Image Formats:** Using .jpg/.png instead of .webp
   - **Symptom:** ZOD validation fails with format error
   - **Fix:** Ensure all images are converted to .webp and .m.webp formats
   - **Prevention:** Include format requirements in image preparation guidelines

2. **Missing Mobile Images:** Only desktop URLs provided
   - **Symptom:** Mobile users see poor quality or broken images
   - **Fix:** Always provide both desktop and mobile image URLs
   - **Prevention:** Create mobile-optimized images during content preparation

3. **Poor Performance:** Loading all images simultaneously
   - **Symptom:** Slow page load times, poor user experience
   - **Fix:** Implement lazy loading for non-critical images
   - **Prevention:** Design gallery with performance optimization from start

4. **Inadequate Alt Text:** Generic or missing descriptions
   - **Symptom:** Accessibility audit failures, poor SEO
   - **Fix:** Provide descriptive alt text for all images (5-100 chars min)
   - **Prevention:** Include alt text requirements in content guidelines

5. **Carousel Navigation Issues:** Poor keyboard or touch support
   - **Symptom:** Users cannot navigate carousel properly
   - **Fix:** Implement comprehensive keyboard and touch navigation
   - **Prevention:** Test carousel with various input methods

6. **Lightbox Accessibility Problems:** Poor focus management or navigation
   - **Symptom:** Screen reader users cannot use lightbox effectively
   - **Fix:** Proper focus trapping and ARIA labels for lightbox controls
   - **Prevention:** Design lightbox with accessibility requirements

7. **Responsive Layout Breaks:** Gallery breaks at certain screen sizes
   - **Symptom:** Overlapping images or poor layout at breakpoints
   - **Fix:** Test responsive behavior at all standard breakpoints
   - **Prevention:** Design mobile-first responsive gallery

8. **Inconsistent Image Quality:** Mixed quality or styling
   - **Symptom:** Unprofessional appearance, poor brand presentation
   - **Fix:** Maintain consistent image quality and editing style
   - **Prevention:** Establish image quality standards and guidelines

## Version History

| Date | Version | Notes |
|------|---------|-------|
| 2025-12-03 | 1.0 | Initial documentation created with comprehensive layout guidelines and performance requirements |

## Related Documentation

**Architecture:**
- [PRD - FR4: Gallery Section with Professional Photography](/docs/prd.md#fr4-gallery-section-with-professional-photography)
- [Story 2.1: Gallery, Testimonials, and Amenities Components](/docs/stories/2.1.story.md)
- [Story 1.11: Tailwind Design System](/docs/stories/1.11.story.md)

**Implementation:**
- [ZOD Contract: ImageGalleryContract](/web-app/lib/contracts/gallery.contract.ts#L7-L26)
- [CVA Variants: galleryVariants](/web-app/lib/cva-variants.ts#L98-L152)
- [Component Source Code](/web-app/components/blocks/ImageGallery/index.tsx)

**LLM Generation (Epic 7):**
- **Used by:** StylingAgent (layout selection), ContentGenerator (image selection), AssemblyAgent (gallery placement)
- **Prompt Context:** Requires hotelType, targetAudience, galleryPurpose, primaryImageType parameters
- **Quality Gates:** ZOD validation, accessibility compliance, responsive testing, performance optimization
- **Cost Considerations:** High-impact component - optimize image loading and lazy loading for efficiency