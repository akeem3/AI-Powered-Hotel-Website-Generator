# Component: Testimonials

## Component Purpose

Display customer reviews and testimonials with ratings, customer information, and quotes in various layouts to build trust and showcase guest experiences through social proof.

## File Location

- **File:** `web-app/components/blocks/Testimonials/index.tsx`
- **Category:** Block

## Props Schema (ZOD)

```typescript
export const TestimonialsContract = z.object({
  variant: z.object({
    layout: z.enum(['carousel', 'grid', 'featured']),
    columns: z.union([z.literal(2), z.literal(3)]).optional(),
    cardStyle: z.enum(['default', 'minimal', 'elevated']).optional()
  }),
  testimonials: z.array(
    z.object({
      id: z.string(),
      customerName: z.string().min(2).max(50),
      customerTitle: z.string().max(50).optional(),
      avatarUrl: z.string().url().optional(),
      rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
      quote: z.string().min(20).max(500),
      date: z.string().optional(),
      location: z.string().max(50).optional()
    })
  ).min(1).max(10),
  showDate: z.boolean().optional(),
  showLocation: z.boolean().optional(),
  className: z.string().optional()
}).strict();
```

## TypeScript Interface

```typescript
export interface TestimonialsConfig {
  variant: {
    layout: 'carousel' | 'grid' | 'featured';
    columns?: 2 | 3;
    cardStyle?: 'default' | 'minimal' | 'elevated';
  };
  testimonials: {
    id: string;
    customerName: string;
    customerTitle?: string;
    avatarUrl?: string;
    rating: 1 | 2 | 3 | 4 | 5;
    quote: string;
    date?: string;
    location?: string;
  }[];
  showDate?: boolean;
  showLocation?: boolean;
  className?: string;
}
```

## CVA Variants

### Available Variants

| Variant Dimension | Options | Default | Description |
|-------------------|---------|---------|-------------|
| layout | carousel \| grid \| featured | grid | Testimonial arrangement and presentation |
| columns | 2 \| 3 | 3 | Number of columns in grid layout |
| cardStyle | default \| minimal \| elevated | default | Visual styling of testimonial cards |

### Variant Combinations

**Recommended Combinations:**

| Hotel Type | Layout | Columns | CardStyle | Notes |
|------------|--------|---------|-----------|-------|
| Luxury | grid | 2 | elevated | Premium presentation with high ratings |
| Budget | featured | - | minimal | Single impactful testimonial |
| Boutique | grid | 2 | default | Artistic presentation with personality |
| Resort | carousel | 3 | default | Engaging rotating testimonials |
| Business | featured | - | elevated | Trust-building corporate testimonials |

**Avoid Combinations:**
- carousel + columns (carousel has own column logic)
- featured + columns (featured is single testimonial)
- minimal + high ratings (may appear under-emphasized)

## LLM Selection Guidelines

### Decision Tree

```
IF testimonialCount === 1 THEN
  layout = "featured"
  Focus on single impactful testimonial
  Emphasize high ratings and credible source

IF testimonialCount >= 6 THEN
  layout = "carousel"
  Rotate through multiple testimonials
  Maintain engagement with variety

IF testimonialCount BETWEEN 2-5 THEN
  layout = "grid"
  columns = 2 (for longer quotes) OR 3 (for shorter quotes)
  Balanced presentation without rotation

IF hotelType === "luxury" THEN
  layout = "grid" | "featured"
  columns = 2
  cardStyle = "elevated"
  Emphasize high ratings and premium experiences
  Focus on influential customers

IF hotelType === "budget" THEN
  layout = "featured"
  cardStyle = "minimal"
  Single powerful testimonial about value
  Emphasize satisfaction and affordability

IF hotelType === "boutique" THEN
  layout = "grid"
  columns = 2
  cardStyle = "default"
  Showcase unique experiences and personality
  Highlight distinctive hotel features

IF hotelType === "resort" THEN
  layout = "carousel"
  columns = 3
  cardStyle = "default"
  Engaging presentation with vacation testimonials
  Emphasize fun, family, and relaxation

IF hotelType === "business" THEN
  layout = "featured"
  cardStyle = "elevated"
  Corporate testimonial with business focus
  Emphasize reliability and professional service

IF targetAudience === "business-travelers" THEN
  layout = "featured"
  showLocation = true
  Customer title should emphasize business relevance
  Focus on efficiency, reliability, service quality

IF targetAudience === "leisure-travelers" THEN
  layout = "grid" | "carousel"
  Emphasize experience and satisfaction
  Show variety of guest types and experiences
  Include location information for context

IF averageRating >= 4.5 THEN
  layout = "grid"
  cardStyle = "elevated"
  Prominently display high ratings
  Multiple testimonials to reinforce excellence

IF averageRating < 3.5 THEN
  layout = "featured"
  cardStyle = "minimal"
  Single best testimonial
  Focus on positive aspects without over-emphasis

IF hasCorporateClients THEN
  layout = "featured"
  Include customer titles like "CEO" or "Director"
  Show business credibility and professional endorsement

IF hasInfluentialGuests THEN
  layout = "featured"
  Include recognizable names or titles
  Leverage social proof and credibility

IF placement === "home-page" THEN
  layout = "featured" | "carousel"
  Immediate impact with social proof
  Build trust quickly for new visitors

IF placement === "about-page" THEN
  layout = "grid"
  columns = 2 | 3
  Comprehensive social proof section
  Multiple testimonials for thoroughness

IF quoteLength > 300 THEN
  layout = "featured"
  columns = 2
  Give adequate space for longer content
  Avoid text crowding

IF quoteLength < 100 THEN
  layout = "grid"
  columns = 3
  Multiple shorter quotes for variety
  Efficient use of space
```

## Content Guidelines

### Customer Name
- **Length:** 2-50 characters (ZOD enforced)
- **Format:** First name + last name, or full name
- **Examples:** "John Smith", "Mary Johnson", "Dr. Robert Chen"

### Customer Title
- **Length:** Maximum 50 characters (ZOD enforced)
- **Purpose:** Provide credibility and context
- **Examples:** "CEO, TechCorp", "Travel Blogger", "Regular Guest"

### Avatar URL
- **Purpose:** Personalize testimonial with customer photo
- **Format:** Valid URL to customer avatar image
- **Requirements:** Professional headshot preferred
- **Optional:** Can use generic avatar if not available

### Rating
- **Format:** 1-5 stars (ZOD enforced enum)
- **Purpose:** Quick visual indicator of satisfaction
- **Display:** Star rating visualization
- **Selection:** Prioritize 4-5 star ratings for marketing impact

### Quote
- **Length:** 20-500 characters (ZOD enforced)
- **Purpose:** Customer's experience and feedback
- **Format:** Natural, authentic-sounding quotes
- **Content:** Specific experiences, benefits, or satisfaction points

### Date
- **Format:** ISO date string (optional)
- **Purpose:** Show recency and relevance
- **Display:** Formatted date (e.g., "October 2023")
- **Selection:** Prefer recent testimonials for relevance

### Location
- **Length:** Maximum 50 characters (ZOD enforced)
- **Format:** City, State/Country (optional)
- **Purpose:** Provide geographic context
- **Examples:** "New York, NY", "London, UK", "San Francisco, CA"

### Do/Don't Examples

**DO:**
- Use authentic, genuine customer quotes
- Include customer photos when available
- Show customer titles for credibility
- Prioritize 4-5 star ratings
- Use recent testimonials when possible
- Include location for geographic context
- Format quotes naturally and conversationally

**DON'T:**
- Use overly promotional language in quotes
- Invent testimonials or customer information
- Use stock photos without customer permission
- Include negative ratings prominently
- Make testimonials sound like marketing copy
- Forget to validate customer information
- Use extremely long quotes that lose impact

## Examples

### Example 1: Luxury Hotel Grid Testimonials

```json
{
  "variant": {
    "layout": "grid",
    "columns": 2,
    "cardStyle": "elevated"
  },
  "testimonials": [
    {
      "id": "luxury-exec-001",
      "customerName": "Sarah Mitchell",
      "customerTitle": "CEO, Global Enterprises",
      "avatarUrl": "https://cdn.example.com/testimonials/sarah-mitchell.webp",
      "rating": 5,
      "quote": "Exceptional service and attention to detail. The executive suite exceeded all expectations with breathtaking city views and personalized concierge service.",
      "date": "2024-01-15",
      "location": "New York, NY"
    }
  ],
  "showDate": true,
  "showLocation": true
}
```

**Rationale:** Grid layout with 2 columns provides space for longer luxury testimonials. Elevated style creates premium appearance. High ratings and customer titles build credibility for luxury positioning.

### Example 2: Budget Hotel Featured Testimonial

```json
{
  "variant": {
    "layout": "featured",
    "cardStyle": "minimal"
  },
  "testimonials": [
    {
      "id": "budget-fam-001",
      "customerName": "Jennifer Rodriguez",
      "customerTitle": "Family Traveler",
      "rating": 4,
      "quote": "Great value for money! Clean rooms, friendly staff, and perfect location for exploring the city. Our family had a wonderful stay without breaking the budget.",
      "date": "2024-02-10"
    }
  ],
  "showDate": true,
  "showLocation": false
}
```

**Rationale:** Featured layout highlights single impactful testimonial. Minimal style maintains clean, value-focused appearance. Family traveler title adds relatability for target audience. Good rating reinforces value proposition.

### Example 3: Boutique Hotel Grid Testimonials

```json
{
  "variant": {
    "layout": "grid",
    "columns": 2,
    "cardStyle": "default"
  },
  "testimonials": [
    {
      "id": "boutique-art-001",
      "customerName": "Marcus Chen",
      "customerTitle": "Interior Designer",
      "avatarUrl": "https://cdn.example.com/testimonials/marcus-chen.webp",
      "rating": 5,
      "quote": "Absolutely loved the artistic touches throughout the hotel. Every corner tells a story and the staff's attention to design details is remarkable. A true boutique experience!",
      "location": "Portland, OR"
    }
  ],
  "showDate": false,
  "showLocation": true
}
```

**Rationale:** Grid layout showcases multiple unique experiences. Default style complements boutique aesthetic. Interior designer title provides design credibility. Quote emphasizes artistic boutique characteristics.

### Example 4: Resort Hotel Carousel Testimonials

```json
{
  "variant": {
    "layout": "carousel",
    "columns": 3,
    "cardStyle": "default"
  },
  "testimonials": [
    {
      "id": "resort-family-001",
      "customerName": "The Thompson Family",
      "customerTitle": "Regular Guests",
      "rating": 5,
      "quote": "Our third annual vacation here and it just keeps getting better! The kids love the pool activities, my husband enjoys the golf course, and I appreciate the spa services. True paradise!",
      "date": "2024-03-01"
    }
  ],
  "showDate": true,
  "showLocation": false
}
```

**Rationale:** Carousel layout provides engaging rotation for resort guests. Default style maintains welcoming vacation atmosphere. Family testimonial emphasizes repeat business and variety of amenities.

### Example 5: Business Hotel Featured Testimonial

```json
{
  "variant": {
    "layout": "featured",
    "cardStyle": "elevated"
  },
  "testimonials": [
    {
      "id": "business-exec-001",
      "customerName": "David Park",
      "customerTitle": "Vice President, Sales",
      "avatarUrl": "https://cdn.example.com/testimonials/david-park.webp",
      "rating": 5,
      "quote": "Consistently excellent business accommodation. The executive floor provides privacy and productivity, while the business center meets all our professional needs. Highly recommended for corporate travel.",
      "date": "2024-01-20",
      "location": "Chicago, IL"
    }
  ],
  "showDate": true,
  "showLocation": true
}
```

**Rationale:** Featured layout emphasizes single powerful business endorsement. Elevated style creates professional, trustworthy appearance. Corporate title and quote focus on business travel needs and reliability.

## Constraints

### Technical Constraints
- Avatar images must be valid URLs with proper accessibility
- Rating system limited to 1-5 stars (ZOD enforced)
- Quote length between 20-500 characters (ZOD enforced)
- Customer name length 2-50 characters (ZOD enforced)
- Optional date and location fields with proper validation
- Responsive behavior for all layout variants

### Content Constraints
- Testimonials: 1-10 items maximum (ZOD enforced)
- Customer titles: Maximum 50 characters (ZOD enforced)
- Location: Maximum 50 characters (ZOD enforced)
- All content must be authentic and verifiable
- Customer privacy and consent requirements must be respected

### Performance Constraints
- Initial render time <150ms
- Carousel animation performance <200ms
- Bundle size impact <20KB gzipped
- Avatar image optimization required
- Smooth transitions and animations

## Accessibility Requirements

- **Screen Reader Support:** Proper ARIA labels for ratings and testimonials
- **Keyboard Navigation:** Full keyboard accessibility for carousel controls
- **Color Contrast:** WCAG 2.1 AA compliance for all text and UI elements
- **Avatar Accessibility:** Meaningful alt text for customer photos
- **Rating Display:** Accessible star rating representation
- **Focus Management:** Proper focus indicators and logical tab order
- **Carousel Controls:** Clear, accessible navigation controls
- **Text Scaling:** Support for browser text zoom levels

## Responsive Behavior

### Mobile (<768px)
- **Grid Layouts:** Single column, full-width testimonials
- **Carousel:** Optimized touch controls and swipe gestures
- **Featured:** Full-width single testimonial
- **Avatar Sizing:** Appropriate mobile dimensions
- **Text Sizing:** Readable font sizes for mobile viewing

### Tablet (768px - 1023px)
- **Grid Layouts:** 2 columns for grid layouts
- **Carousel:** Enhanced touch and cursor interaction
- **Featured:** Centered with appropriate width
- **Avatar Sizing:** Balanced mobile/desktop dimensions

### Desktop (≥1024px)
- **Grid Layouts:** Configurable 2-3 columns
- **Carousel:** Mouse wheel navigation and enhanced controls
- **Featured:** Centered with optimal width and spacing
- **Avatar Sizing:** Professional desktop dimensions
- **Enhanced Hover States:** Interactive feedback and animations

## Testing Guidelines

### Unit Tests
- Test all layout variants render correctly
- Verify ZOD contract validation for all testimonial fields
- Test rating system with all star values (1-5)
- Validate responsive behavior at different breakpoints
- Test carousel navigation and auto-play functionality
- Verify avatar image loading and error handling

### Visual Regression Tests
- Compare screenshots across all viewport sizes
- Test all layout combinations (grid, carousel, featured)
- Validate rating display and star visualization
- Test avatar images and customer information layout
- Verify hover states and interactive elements

### Content Tests
- Verify character limits for all text fields
- Test rating validation and display
- Validate quote length constraints
- Test customer title and location formatting
- Verify date display and formatting

### Accessibility Tests
- Verify keyboard navigation through carousel
- Test screen reader compatibility with testimonials
- Validate color contrast for text and ratings
- Test avatar alt text and accessibility
- Verify focus management and tab order

## Common Pitfalls

1. **Fake or Inauthentic Testimonials:** Using fabricated customer reviews
   - **Symptom:** Loss of credibility, potential legal issues
   - **Fix:** Only use real, verified customer testimonials with consent
   - **Prevention:** Establish proper testimonial collection and verification process

2. **Poor Quality Avatar Images:** Low-resolution or inappropriate photos
   - **Symptom:** Unprofessional appearance, poor user experience
   - **Fix:** Use high-quality, professional headshots with proper consent
   - **Prevention:** Establish avatar quality standards and guidelines

3. **Overly Promotional Quotes:** Testimonials sound like marketing copy
   - **Symptom:** Loss of authenticity, reduced credibility
   - **Fix:** Use genuine, natural customer language in quotes
   - **Prevention:** Guide customers to speak naturally about their experiences

4. **Inadequate Customer Attribution:** Missing names or generic titles
   - **Symptom:** Reduced credibility and trustworthiness
   - **Fix:** Include complete customer information with relevant titles
   - **Prevention:** Collect comprehensive customer information with consent

5. **Carousel Navigation Issues:** Poor accessibility or usability
   - **Symptom:** Users cannot navigate testimonials effectively
   - **Fix:** Implement comprehensive keyboard and touch navigation
   - **Prevention:** Design carousel with accessibility requirements from start

6. **Rating Display Problems:** Inconsistent or unclear rating visualization
   - **Symptom:** Users cannot understand rating at glance
   - **Fix:** Use clear, accessible star rating visualization
   - **Prevention:** Test rating display with various accessibility tools

7. **Responsive Layout Breaks:** Testimonials break at certain screen sizes
   - **Symptom:** Overlapping content or poor layout at breakpoints
   - **Fix:** Test responsive behavior at all standard breakpoints
   - **Prevention:** Design mobile-first responsive testimonials

8. **Content Length Issues:** Too short or overly long testimonials
   - **Symptom:** Insufficient detail or overwhelming content
   - **Fix:** Maintain 20-500 character range for optimal impact
   - **Prevention:** Establish quote length guidelines and review process

## Version History

| Date | Version | Notes |
|------|---------|-------|
| 2025-12-03 | 1.0 | Initial documentation created with comprehensive layout guidelines and content requirements |

## Related Documentation

**Architecture:**
- [PRD - Corporate Testimonials Using TestimonialCard Component](/docs/prd.md)
- [Story 2.1: Gallery, Testimonials, and Amenities Components](/docs/stories/2.1.story.md)
- [Story 1.11: Tailwind Design System](/docs/stories/1.11.story.md)

**Implementation:**
- [ZOD Contract: TestimonialsContract](/web-app/lib/contracts/testimonials.contract.ts#L7-L34)
- [CVA Variants: testimonialsVariants](/web-app/lib/cva-variants.ts#L303-L326)
- [Component Source Code](/web-app/components/blocks/Testimonials/index.tsx)

**LLM Generation (Epic 7):**
- **Used by:** StylingAgent (layout selection), ContentGenerator (testimonial content), AssemblyAgent (placement decisions)
- **Prompt Context:** Requires hotelType, targetAudience, testimonialCount, averageRating, placement parameters
- **Quality Gates:** ZOD validation, accessibility compliance, responsive testing, content authenticity verification
- **Cost Considerations:** High-impact component - optimize avatar loading and carousel animations for efficiency