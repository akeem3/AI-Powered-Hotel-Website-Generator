# Component: HeroSection

## Component Purpose

Display prominent hero section with hotel imagery, headline, tagline, and primary call-to-action buttons to capture visitor attention and drive bookings.

## File Location

- **File:** `web-app/components/sections/HeroSection/index.tsx`
- **Category:** Section

## Props Schema (ZOD)

```typescript
export const HeroSectionContract = z.object({
  variant: z.object({
    style: z.enum(['modern', 'classic', 'minimal', 'bold', 'elegant']).optional(),
    layout: z.enum(['centered', 'split', 'minimal']).optional(),
    overlay: z.enum(['none', 'light', 'dark', 'gradient']).optional(),
    height: z.enum(['small', 'medium', 'large', 'fullscreen']).optional()
  }).optional(),
  title: z.string().min(1).max(200), // Note: Required by contract, but optional in component props (defaults provided)
  tagline: z.string().max(400).optional(),
  subtitle: z.string().max(400).optional(), // Note: Present in contract but unused by component
  headline: z.string().min(1).max(500), // Note: Required by contract, but optional in component props (defaults provided)
  description: z.string().max(800).optional(),
  primaryCTA: z.object({
    text: z.string().min(1).max(50),
    href: z.string().min(1).max(200),
    ariaLabel: z.string().optional()
  }).optional(),
  secondaryCTA: z.object({
    text: z.string().min(1).max(50),
    href: z.string().min(1).max(200),
    ariaLabel: z.string().optional()
  }).optional(),
  image: z.string().optional(),
  background: z.enum(['solid', 'gradient', 'image']).default('solid'),
  className: z.string().optional(),
  // Animation properties
  enableAnimations: z.boolean().optional(),
  animationDelay: z.number().optional(),
  // Content integration properties
  hotelId: z.string().optional(),
  enableContent: z.boolean().optional(),
}).strict();
```

## TypeScript Interface

```typescript
export interface HeroSectionProps {
  variant?: {
    style?: 'modern' | 'classic' | 'minimal' | 'bold' | 'elegant';
    layout?: 'centered' | 'split' | 'minimal';
    overlay?: 'none' | 'light' | 'dark' | 'gradient';
    height?: 'small' | 'medium' | 'large' | 'fullscreen';
  };
  title?: string;
  tagline?: string;
  headline?: string;
  description?: string;
  primaryCTA?: {
    text: string;
    href: string;
    ariaLabel?: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
    ariaLabel?: string;
  };
  image?: string;
  background?: 'solid' | 'gradient' | 'image';
  className?: string;
  enableAnimations?: boolean;
  animationDelay?: number;
  hotelId?: string;
  enableContent?: boolean;
}
```

## CVA Variants

### Available Variants

| Variant Dimension | Options | Default | Description |
|-------------------|---------|---------|-------------|
| style | modern \| classic \| minimal \| bold \| elegant | modern | Visual styling approach |
| layout | centered \| split \| minimal | centered | Content layout pattern |
| overlay | none \| light \| dark \| gradient | none | Background image overlay effect |
| height | small \| medium \| large \| fullscreen | medium | Vertical height of hero section |

### Variant Combinations

**Recommended Combinations:**

| Hotel Type | Style | Layout | Overlay | Height | Notes |
|------------|-------|--------|---------|--------|-------|
| Luxury | elegant | split | dark | medium | Premium feel with sophisticated drama |
| Budget | minimal | centered | none | small | Clean, approachable, fast-loading |
| Boutique | modern | split | gradient | medium | Trendy, artistic, visually engaging |
| Resort | bold | centered | light | fullscreen | Immersive, adventurous, spacious |
| Business | classic | centered | none | medium | Professional, reliable, efficient |

**Avoid Combinations:**
- minimal + dark overlay (poor contrast, readability issues)
- elegant + bold (conflicting style messages)
- minimal layout + large height (too much empty space)
- modern + classic (style inconsistency)

> **Note on Legacy Layouts:** The `fullscreen` layout is deprecated and automatically mapped to `layout: "centered"` with `height: "fullscreen"` for backward compatibility. New implementations should use `centered` layout with explicit `fullscreen` height.

## LLM Selection Guidelines

### Decision Tree

```
IF hotelType === "luxury" THEN
  style = "elegant" | "classic"
  layout = "split" | "centered"
  overlay = "dark" | "none"
  height = "medium" | "large"

IF hotelType === "budget" THEN
  style = "minimal"
  layout = "centered"
  overlay = "none"
  height = "small" | "medium"

IF hotelType === "boutique" THEN
  style = "modern" | "bold"
  layout = "split"
  overlay = "gradient" | "light"
  height = "medium"

IF hotelType === "resort" THEN
  style = "bold" | "modern"
  layout = "centered"
  overlay = "light" | "none"
  height = "large" | "fullscreen"

IF hotelType === "business" THEN
  style = "classic" | "elegant"
  layout = "centered" | "split"
  overlay = "none" | "dark"
  height = "medium"

IF targetAudience === "business" THEN
 优先 split layout for professional imagery
  Use classic or elegant styling
  Keep headline concise and benefit-focused

IF targetAudience === "leisure" THEN
  优先 centered layout with large/fullscreen height for immersive experience
  Use modern or bold styling
  Emphasize experience and relaxation

IF brandPersonality === "professional" THEN
  style = "classic" | "elegant"
  overlay = "none" | "dark"
  Use formal, benefit-oriented language

IF brandPersonality === "friendly" THEN
  style = "minimal" | "modern"
  overlay = "light" | "none"
  Use welcoming, approachable language
```

## Content Guidelines

### Title (Hotel Name)
- **Length:** 1-200 characters (ZOD enforced)
- **Purpose:** Hotel brand identification
- **Format:** Proper noun, hotel name only
- **Examples:**
  - "The Sterling Executive"
  - "Grand Vista Resort & Spa"
  - "Urban Boutique Hotel"

### Tagline
- **Length:** Maximum 400 characters (ZOD enforced)
- **Purpose:** Brand positioning statement
- **Tone:** Match brand personality
- **Examples:**
  - Luxury: "Experience World-Class Hospitality in the Heart of the City"
  - Budget: "Comfortable Stays Without Compromising Quality"
  - Boutique: "Where Artistic Design Meets Personalized Service"
  - Resort: "Your Tropical Paradise Awaits"
  - Business: "Efficiency and Elegance for the Modern Traveler"

### Headline
- **Length:** 1-500 characters (ZOD enforced)
- **Purpose:** Primary value proposition
- **Focus:** Hotel's unique selling point
- **Examples:**
  - Luxury: "Excellence in Every Detail"
  - Budget: "Smart Comfort for Smart Travelers"
  - Boutique: "Curated Experiences in Historic Surroundings"
  - Resort: "Escape to Your Perfect Getaway"
  - Business: "Where Productivity Meets Prestige"

### Description
- **Length:** Maximum 800 characters (ZOD enforced)
- **Purpose:** Expand on headline with specific benefits
- **Format:** 2-3 sentences maximum
- **Examples:**
  - Luxury: "Discover sophisticated accommodations with personalized service, premium amenities, and breathtaking city views from our executive suites."
  - Budget: "Clean, comfortable rooms with essential amenities, free WiFi, and convenient access to public transportation make us the perfect base for your city exploration."

### CTA Text
- **Primary CTA:** 1-50 characters (ZOD enforced)
- **Secondary CTA:** 1-50 characters (ZOD enforced)
- **Format:** Action-oriented verbs + clear outcome
- **Examples:**
  - Luxury: "Reserve Your Suite" | "Discover Premium Amenities"
  - Budget: "Check Availability" | "View Room Options"
  - Boutique: "Explore Rooms" | "Book Your Experience"
  - Resort: "Plan Your Escape" | "View Resort Packages"
  - Business: "Reserve Now" | "Book Meeting Space"

### Do/Don't Examples

**DO:**
- Use action-oriented CTA text
- Keep headline concise and impactful
- Ensure tagline reflects brand positioning
- Match tone to target audience
- Include relevant keywords for SEO

**DON'T:**
- Use generic phrases like "Click Here"
- Exceed character limits (ZOD will reject)
- Mix conflicting styles (elegant + bold)
- Use cliché hotel marketing language
- Forget mobile readability considerations

## Examples

### Example 1: Luxury Business Hotel

```json
{
  "variant": {
    "style": "elegant",
    "layout": "split",
    "overlay": "dark",
    "height": "medium"
  },
  "title": "The Sterling Executive",
  "tagline": "Experience Boutique Luxury in the Financial District",
  "headline": "Excellence in Every Detail",
  "description": "Discover sophisticated accommodations with personalized service, premium amenities, and breathtaking city views from our executive suites.",
  "primaryCTA": {
    "text": "Reserve Your Suite",
    "href": "/rooms",
    "ariaLabel": "Reserve your luxury suite at The Sterling Executive"
  },
  "secondaryCTA": {
    "text": "Virtual Tour",
    "href": "/tour",
    "ariaLabel": "Take a virtual tour of our luxury hotel"
  },
  "image": "https://cdn.example.com/hotel/luxury-business-lobby.webp",
  "background": "image"
}
```

**Rationale:** Elegant style with dark overlay creates sophisticated atmosphere. Split layout showcases hotel imagery alongside compelling copy. Medium height provides presence without overwhelming viewport.

### Example 2: Budget Family Hotel

```json
{
  "variant": {
    "style": "minimal",
    "layout": "centered",
    "overlay": "none",
    "height": "small"
  },
  "title": "Cityside Inn",
  "tagline": "Comfortable Stays Without Compromising Quality",
  "headline": "Smart Comfort for Smart Travelers",
  "description": "Clean, comfortable rooms with essential amenities, free WiFi, and convenient access to public transportation make us the perfect base for your city exploration.",
  "primaryCTA": {
    "text": "Check Availability",
    "href": "/rooms",
    "ariaLabel": "Check room availability at Cityside Inn"
  },
  "secondaryCTA": {
    "text": "View Rates",
    "href": "/rates",
    "ariaLabel": "View our affordable room rates"
  },
  "image": "https://cdn.example.com/hotel/budget-family-exterior.webp",
  "background": "image"
}
```

**Rationale:** Minimal style with no overlay maintains clean, approachable aesthetic. Centered layout focuses on value proposition. Small height prioritizes content discovery and fast loading.

### Example 3: Boutique Couples Hotel

```json
{
  "variant": {
    "style": "modern",
    "layout": "split",
    "overlay": "gradient",
    "height": "medium"
  },
  "title": "Artist's Loft Hotel",
  "tagline": "Where Artistic Design Meets Personalized Service",
  "headline": "Curated Experiences in Historic Surroundings",
  "description": "Immerse yourself in our unique blend of contemporary art, historic architecture, and personalized hospitality designed for discerning couples and creative professionals.",
  "primaryCTA": {
    "text": "Explore Rooms",
    "href": "/rooms",
    "ariaLabel": "Explore our uniquely designed boutique rooms"
  },
  "secondaryCTA": {
    "text": "Art Gallery",
    "href": "/gallery",
    "ariaLabel": "Visit our in-house art gallery"
  },
  "image": "https://cdn.example.com/hotel/boutique-artistic-lobby.webp",
  "background": "image"
}
```

**Rationale:** Modern style with gradient overlay creates artistic, contemporary feel. Split layout balances visual appeal with information. Medium height provides adequate space for brand storytelling.

### Example 4: Resort Leisure Hotel

```json
{
  "variant": {
    "style": "bold",
    "layout": "centered",
    "overlay": "light",
    "height": "fullscreen"
  },
  "title": "Paradise Beach Resort",
  "tagline": "Your Tropical Paradise Awaits",
  "headline": "Escape to Your Perfect Getaway",
  "description": "Experience pristine beaches, luxurious spa treatments, and world-class dining in our beachfront paradise designed for ultimate relaxation and adventure.",
  "primaryCTA": {
    "text": "Plan Your Escape",
    "href": "/packages",
    "ariaLabel": "Plan your tropical escape vacation package"
  },
  "secondaryCTA": {
    "text": "View Resort",
    "href": "/tour",
    "ariaLabel": "Take a virtual tour of Paradise Beach Resort"
  },
  "image": "https://cdn.example.com/hotel/resort-beach-aerial.webp",
  "background": "image"
}
```

**Rationale:** Bold style with light overlay creates immersive, adventurous atmosphere. Centered layout with fullscreen height maximizes visual impact of resort imagery.

### Example 5: Business Corporate Hotel

```json
{
  "variant": {
    "style": "classic",
    "layout": "centered",
    "overlay": "none",
    "height": "medium"
  },
  "title": "Corporate Towers Hotel",
  "tagline": "Where Productivity Meets Prestige",
  "headline": "Efficiency and Elegance for the Modern Traveler",
  "description": "Strategically located in the business district with state-of-the-art meeting facilities, high-speed internet, and executive services designed for corporate success.",
  "primaryCTA": {
    "text": "Reserve Now",
    "href": "/booking",
    "ariaLabel": "Reserve your room at Corporate Towers Hotel"
  },
  "secondaryCTA": {
    "text": "Meeting Facilities",
    "href": "/meetings",
    "ariaLabel": "View our meeting and conference facilities"
  },
  "image": "https://cdn.example.com/hotel/business-modern-lobby.webp",
  "background": "image"
}
```

**Rationale:** Classic style with no overlay maintains professional, clean aesthetic. Centered layout focuses on business value proposition. Medium height provides adequate presence without overwhelming business context.

## Constraints

### Technical Constraints
- Background images MUST be .webp format for optimal performance
- Component must render correctly at 375px, 768px, and 1280px breakpoints
- Framer Motion animations required for smooth entrance effects
- Next.js Image component mandatory for optimized loading
- Semantic HTML5 structure required (`<section>`, `<h1>`, `<h2>`)

### Content Constraints
- Title: 1-200 characters (ZOD enforced)
- Tagline: Maximum 400 characters (ZOD enforced)
- Headline: 1-500 characters (ZOD enforced)
- Description: Maximum 800 characters (ZOD enforced)
- CTA text: 1-50 characters each (ZOD enforced)
- No HTML markup in text fields
- URLs must be valid paths or absolute URLs

### Performance Constraints
- Largest Contentful Paint (LCP) < 2.5s
- First Input Delay (FID) < 100ms
- Cumulative Layout Shift (CLS) < 0.1
- Image optimization: WebP format with proper srcsets
- Bundle size impact: <25KB gzipped

## Accessibility Requirements

- **Semantic Structure:** Use `<section>` with `aria-labelledby="hero-title"`
- **Heading Hierarchy:** `<h2>` for hotel name, `<h1>` for main headline
- **ARIA Labels:** All CTA links must have descriptive `ariaLabel` props
- **Keyboard Navigation:** All interactive elements reachable via Tab key
- **Color Contrast:** WCAG 2.1 AA compliance (4.5:1 for normal text, 3:1 for large text)
- **Screen Reader Support:** Alternative text for all images
- **Touch Targets:** Minimum 44px × 44px for all interactive elements
- **Focus Management:** Visible focus indicators on all interactive elements

## Responsive Behavior

### Mobile (<768px)
- Single column layout with centered content
- Text sizes: title (2xl), headline (3xl), description (base)
- Padding: `px-6 py-16`
- CTA buttons: Full width stacked vertically
- Image aspect ratio: 4:3 optimized for mobile viewing

### Tablet (768px - 1023px)
- Transitional layout adjustments
- Text sizes: title (3xl), headline (4xl), description (lg)
- Padding: `px-10 py-20`
- CTA buttons: Side-by-side with appropriate spacing
- Split layout: 50/50 content distribution

### Desktop (≥1024px)
- Full layout capabilities activated
- Text sizes: title (4xl), headline (5xl-6xl), description (xl)
- Padding: `px-16 py-24`
- CTA buttons: Optimized spacing and hover states
- Split layout: Optimized content-to-image ratio (60/40)
- Fullscreen height: `min-h-screen` with proper content centering

## Testing Guidelines

### Unit Tests
- Test all variant combinations render correctly
- Verify ZOD contract validation for all props
- Test responsive behavior at different breakpoints
- Validate accessibility attributes and ARIA labels
- Test CTA link functionality and proper routing
- Verify image lazy loading and optimization

### Visual Regression Tests
- Compare screenshots across all viewport sizes
- Test all style variants (modern, classic, minimal, bold, elegant)
- Validate layout variants (centered, split, minimal)
- Test overlay effects (none, light, dark, gradient)
- Verify animation states and transitions
- Test with different image aspect ratios

### Integration Tests
- Verify component works with Next.js routing
- Test integration with Navigation component
- Validate proper image loading and error handling
- Test with actual hotel data from mock systems
- Verify performance metrics meet requirements
- Test accessibility with screen readers

### Cross-Browser Tests
- Chrome (latest), Firefox (latest), Safari (latest), Edge (latest)
- Validate consistent rendering across browsers
- Test Framer Motion animations compatibility
- Verify responsive behavior consistency

## Common Pitfalls

1. **Invalid Image Format:** LLM generates .jpg/.png instead of .webp
   - **Symptom:** ZOD validation fails with format error, poor performance
   - **Fix:** Strictly enforce .webp format in image URLs
   - **Prevention:** Include format examples in prompt template

2. **Text Content Too Long:** Headline exceeds 500 characters
   - **Symptom:** ZOD validation fails with "max 500 characters" error
   - **Fix:** ZOD `.max(500)` constraint prevents this at validation
   - **Prevention:** Provide character count guidance in content generation prompt

3. **Poor Contrast:** Light text on light overlay
   - **Symptom:** Accessibility tests fail (contrast ratio <4.5:1)
   - **Fix:** Use decision tree (minimal style → no/light overlay only)
   - **Prevention:** Include contrast validation in StylingAgent prompt

4. **Missing Mobile Image:** Only desktop URL provided
   - **Symptom:** Component shows placeholder or broken image on mobile
   - **Fix:** Component falls back to same image for both breakpoints
   - **Prevention:** Prompt explicitly requests both image formats if responsive needed

5. **Variant Conflict:** Incompatible style/layout combinations
   - **Symptom:** Visual inconsistencies, poor user experience
   - **Fix:** Use compound variants to override conflicting styles
   - **Prevention:** Include "Avoid Combinations" section in selection guidelines

6. **Improper Heading Structure:** Wrong heading levels or missing labels
   - **Symptom:** Accessibility audit fails, SEO issues
   - **Fix:** Use semantic heading hierarchy (h2 for title, h1 for headline)
   - **Prevention:** Document accessibility requirements in component guidelines

7. **Animation Performance:** Janky or missing animations
   - **Symptom:** Poor user experience, low performance scores
   - **Fix:** Ensure Framer Motion props are properly configured
   - **Prevention:** Test animation performance in different browsers

8. **CTA Accessibility:** Missing or poor ARIA labels
   - **Symptom:** Screen reader users cannot understand button purpose
   - **Fix:** Add descriptive `ariaLabel` props to all CTA links
   - **Prevention:** Include accessibility checklist in component documentation

## Version History

| Date | Version | Notes |
|------|---------|-------|
| 2025-12-03 | 1.0 | Initial documentation created with comprehensive CVA variants, ZOD schema integration, and Epic 7 LangGraph preparation guidelines |

## Related Documentation

**Architecture:**
- [PRD - FR3: Hero Section Component](/docs/prd.md#fr3-hero-section)
- [Story 1.4: Hero Section Implementation](/docs/stories/1.4.story.md)
- [Story 1.11: Tailwind Design System](/docs/stories/1.11.story.md)

**Implementation:**
- [ZOD Contract: HeroSectionContract](/web-app/lib/contracts/hero.contract.ts)
- [CVA Variants: heroVariants](/web-app/lib/cva-variants.ts#L31-L80)
- [Component Source Code](/web-app/components/sections/HeroSection/index.tsx)

**LLM Generation (Epic 7):**
- **Used by:** StylingAgent (variant selection), ContentGenerator (heading/CTA), AssemblyAgent (page composition)
- **Prompt Context:** Requires hotelType, targetAudience, brandPersonality, location parameters
- **Quality Gates:** ZOD validation, WCAG accessibility check, responsive rendering test
- **Cost Considerations:** High-impact component - optimize content length for cost efficiency
