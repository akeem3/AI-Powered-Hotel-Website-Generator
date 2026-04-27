# Component: Navigation

## Component Purpose

Responsive navigation header with hotel branding, main menu items, and mobile hamburger menu that adapts seamlessly between desktop and mobile viewports.

## File Location

- **File:** `web-app/components/blocks/Navigation/index.tsx`
- **Category:** Block

## Props Schema (ZOD)

Since Epic 22, Navigation uses a data-driven `NavigationContract`:

```typescript
export const NavigationContract = z.object({
  brandName: z.string(),
  links: z.array(z.object({
    label: z.string(),
    href: z.string(),
  })),
  variant: z.object({
    style: z.enum(['transparent', 'solid', 'glass']).optional(),
    layout: z.enum(['default', 'compact', 'tall']).optional()
  }).optional(),
  ctaButton: z.object({
    label: z.string(),
    href: z.string(),
  }).optional(),
  logoUrl: z.string().optional(),
  className: z.string().optional()
}).strict();
```

## TypeScript Interface

```typescript
export interface NavigationProps {
  brandName: string;
  links: Array<{ label: string; href: string }>;
  variant?: {
    style?: 'transparent' | 'solid' | 'glass';
    layout?: 'default' | 'compact' | 'tall';
  };
  ctaButton?: { label: string; href: string };
  logoUrl?: string;
  className?: string;
}
```

## Multi-Page Presence

Navigation appears on **every page** of the generated website. The `splitToPages()` function (Epic 25) automatically includes navigation and footer components in every page configuration, ensuring consistent site-wide navigation across all `app/[lang]/` routes.

## CVA Variants

### Available Variants

| Variant Dimension | Options | Default | Description |
|-------------------|---------|---------|-------------|
| style | transparent \| solid \| glass | solid | Visual appearance and background treatment |
| layout | default \| compact \| tall | default | Navigation height and spacing |

### Variant Combinations

**Recommended Combinations:**

| Hotel Type | Style | Layout | Notes |
|------------|-------|--------|-------|
| Luxury | transparent | default | Elegant overlay on hero imagery |
| Budget | solid | compact | Clean, functional, space-efficient |
| Boutique | glass | default | Modern, sophisticated blur effect |
| Resort | transparent | tall | Immersive, maximizes hero visibility |
| Business | solid | default | Professional, reliable appearance |

**Avoid Combinations:**
- transparent + compact (insufficient space for menu items)
- glass + tall (excessive visual weight)
- transparent on light backgrounds (poor contrast)

## LLM Selection Guidelines

### Decision Tree

```
IF navigationPlacement === "over-hero-image" THEN
  style = "transparent" | "glass"
  layout = "default" | "tall"
  Use light text colors for contrast

IF navigationPlacement === "separate-from-hero" THEN
  style = "solid" | "glass"
  layout = "default" | "compact"
  Use brand-appropriate text colors

IF hotelType === "luxury" THEN
  style = "transparent" (over hero) OR "solid" (separate)
  layout = "default" (standard height)
  Prefer elegant, minimalist design

IF hotelType === "budget" THEN
  style = "solid"
  layout = "compact" (space-efficient)
  Focus on functionality over aesthetics

IF hotelType === "boutique" THEN
  style = "glass" | "transparent"
  layout = "default"
  Emphasize modern, sophisticated styling

IF hotelType === "resort" THEN
  style = "transparent" (immersive) OR "solid" (practical)
  layout = "tall" (prominence)
  Balance beauty with usability

IF hotelType === "business" THEN
  style = "solid"
  layout = "default"
  Professional, reliable appearance
  Clear hierarchy and CTAs

IF targetAudience === "mobile-heavy" THEN
  layout = "compact"
  Prioritize mobile experience
  Ensure touch targets are adequate

IF targetAudience === "desktop-heavy" THEN
  layout = "default" | "tall"
  Enhanced desktop experience
  More space for desktop features

IF brandPersonality === "modern" THEN
  style = "glass" | "transparent"
  Contemporary, clean aesthetics
  Blur effects and transparency

IF brandPersonality === "traditional" THEN
  style = "solid"
  Classic, reliable appearance
  Consistent branding across all pages
```

## Content Guidelines

### Navigation Menu Items
- **Standard Items:** Home, Rooms, Contact
- **Optional Items:** Amenities, Gallery, About, Dining
- **Maximum Items:** 7 primary navigation items
- **CTA Placement:** Booking button prominently displayed
- **Character Limits:** Menu item labels 1-15 characters

### Logo/Branding
- **Format:** Hotel name or logo
- **Placement:** Left side (consistent across breakpoints)
- **Click Behavior:** Links to homepage
- **Alt Text:** Descriptive for accessibility

### CTA Button Text
- **Primary CTA:** "Book Now", "Reserve", "Check Rates"
- **Character Length:** 2-4 words maximum
- **Action-Oriented:** Use clear, benefit-driven language
- **Placement:** Right side on desktop, prominent in mobile menu

### Do/Don't Examples

**DO:**
- Keep menu items concise and action-oriented
- Use consistent terminology across navigation
- Ensure 44px+ touch targets on mobile
- Include active state for current page
- Provide clear visual hierarchy
- Test contrast on all background styles

**DON'T:**
- Use generic labels like "Click Here"
- Exceed 7 primary navigation items
- Mix inconsistent terminology
- Forget mobile touch target optimization
- Ignore active page indication
- Use poor contrast combinations

## Examples

### Example 1: Luxury Business Hotel

```json
{
  "variant": {
    "style": "solid",
    "layout": "default"
  },
  "className": "shadow-sm"
}
```

**Rationale:** Solid style provides professional appearance with clear brand colors. Default layout offers adequate space for hotel branding and menu items. Perfect for business travelers who value clarity and functionality.

### Example 2: Boutique Resort Hotel

```json
{
  "variant": {
    "style": "glass",
    "layout": "default"
  }
}
```

**Rationale:** Glass style creates sophisticated modern appearance with backdrop blur effect. Complements boutique hotel's artistic aesthetic while maintaining readability. Works well over hero imagery.

### Example 3: Budget Family Hotel

```json
{
  "variant": {
    "style": "solid",
    "layout": "compact"
  }
}
```

**Rationale:** Solid style ensures clear functionality and reliability. Compact layout maximizes content space while maintaining usability. Ideal for budget-conscious guests who prioritize efficiency.

### Example 4: Tropical Resort

```json
{
  "variant": {
    "style": "transparent",
    "layout": "tall"
  }
}
```

**Rationale:** Transparent style allows immersive hero imagery visibility. Tall layout provides prominence and enhances resort experience. Perfect for vacation destinations where visual appeal drives bookings.

### Example 5: Urban Boutique Hotel

```json
{
  "variant": {
    "style": "glass",
    "layout": "compact"
  }
}
```

**Rationale:** Glass style creates modern, sophisticated urban aesthetic. Compact layout conserves vertical space while maintaining design integrity. Appeals to design-conscious urban travelers.

## Constraints

### Technical Constraints
- Component must handle responsive breakpoint at 768px
- Mobile state management with React hooks required
- Keyboard navigation support (Tab, Enter, Escape)
- Touch targets minimum 44px × 44px on mobile
- Semantic HTML5 structure required (`<nav>`, `<ul>`, `<a>`)

### Content Constraints
- Maximum 7 primary navigation items
- Menu item labels: 1-15 characters maximum
- CTA button text: 2-4 words maximum
- Hotel name/brand: 1-30 characters
- No nested dropdown menus (current implementation)

### Performance Constraints
- Initial render time <50ms
- Menu toggle animations <300ms
- Bundle size impact <10KB gzipped
- No layout shift during responsive transitions
- Mobile menu state persistence across route changes

## Accessibility Requirements

- **Semantic Structure:** Use `<nav>` with proper landmark labeling
- **Keyboard Navigation:** Full keyboard accessibility (Tab, Enter, Escape)
- **Focus Management:** Visible focus indicators, logical tab order
- **Screen Reader Support:** ARIA labels and roles for interactive elements
- **Color Contrast:** WCAG 2.1 AA compliance (4.5:1 for normal text)
- **Touch Targets:** Minimum 44px × 44px for all interactive elements
- **Mobile Menu:** Overlay with proper focus trapping and escape handling
- **Active State:** Clear indication of current page/location

## Responsive Behavior

### Mobile (<768px)
- **Layout:** Hamburger menu icon, slide-out drawer navigation
- **Menu Toggle:** Animated hamburger icon (three lines → X)
- **Drawer:** Full-screen overlay with navigation items
- **Touch Targets:** 44px+ minimum for reliable touch interaction
- **Animation:** Smooth slide-in/out transitions (300ms)
- **Close Actions:** X button, overlay click, Escape key
- **Logo:** Left-aligned, maintains brand consistency
- **CTA:** Prominent button within mobile menu

### Tablet (768px - 1023px)
- **Layout:** Desktop navigation starts at 768px breakpoint
- **Spacing:** Optimized for touch and cursor interaction
- **Hover States:** Enhanced for better user experience
- **Typography:** Balanced sizing for tablet reading

### Desktop (≥1024px)
- **Layout:** Horizontal navigation bar with full menu visibility
- **Menu Items:** Horizontal list with hover effects
- **Spacing:** Default 80px height (adjustable via layout variant)
- **Hover Effects:** Smooth transitions and visual feedback
- **Logo:** Left-aligned with appropriate sizing
- **CTA:** Prominent button on right side
- **Active States:** Clear indication of current page

## Testing Guidelines

### Unit Tests
- Test navigation renders in all style variants
- Verify mobile menu toggle functionality
- Test keyboard navigation and focus management
- Validate accessibility attributes and ARIA labels
- Test responsive behavior at different breakpoints
- Verify menu state persistence across route changes

### Visual Regression Tests
- Compare screenshots across all viewport sizes
- Test all style variants (transparent, solid, glass)
- Validate layout variants (default, compact, tall)
- Test hover and active states
- Verify mobile menu open/close animations
- Test with different hotel branding configurations

### Integration Tests
- Test navigation integration with Next.js routing
- Verify active page highlighting works correctly
- Test mobile menu behavior with page navigation
- Validate CTA button routing and functionality
- Test navigation state management
- Verify compatibility with different page layouts

### Cross-Browser Tests
- Chrome (latest), Firefox (latest), Safari (latest), Edge (latest)
- Test mobile menu animations across browsers
- Validate consistent responsive behavior
- Test keyboard navigation compatibility
- Verify focus management in different browsers

## Common Pitfalls

1. **Poor Mobile Touch Targets:** Menu items too small for reliable touch
   - **Symptom:** Users struggle to tap menu items on mobile
   - **Fix:** Ensure minimum 44px × 44px touch targets
   - **Prevention:** Design mobile-first with touch requirements

2. **Insufficient Contrast:** Light text on transparent/light backgrounds
   - **Symptom:** Navigation text becomes unreadable over hero images
   - **Fix:** Use appropriate text colors or background overlays
   - **Prevention:** Test contrast with all background combinations

3. **Missing Keyboard Navigation:** Cannot navigate with keyboard only
   - **Symptom:** Accessibility audit fails, poor user experience
   - **Fix:** Implement full keyboard support with focus management
   - **Prevention:** Design for keyboard navigation from the start

4. **Mobile Menu State Issues:** Menu doesn't close properly
   - **Symptom:** Mobile menu stays open after page navigation
   - **Fix:** Proper state management and route change handling
   - **Prevention:** Test state persistence across all navigation scenarios

5. **Too Many Menu Items:** Navigation becomes cluttered
   - **Symptom:** Poor user experience, cognitive overload
   - **Fix:** Limit to 7 primary items, use secondary navigation
   - **Prevention:** Plan information architecture carefully

6. **Active State Missing:** Users don't know current page
   - **Symptom:** Poor user experience, navigation confusion
   - **Fix:** Implement clear active state styling
   - **Prevention:** Include active state in all design variations

7. **Performance Issues:** Slow animations or layout shifts
   - **Symptom:** Poor perceived performance, user frustration
   - **Fix:** Optimize animations, prevent layout shifts
   - **Prevention:** Performance test with various content loads

8. **Responsive Breakpoint Issues:** Navigation breaks at certain screen sizes
   - **Symptom:** Overlapping elements, poor usability
   - **Fix:** Test thoroughly at all breakpoints
   - **Prevention:** Design with mobile-first responsive approach

## Version History

| Date | Version | Notes |
|------|---------|-------|
| 2025-12-03 | 1.0 | Initial documentation created with comprehensive responsive guidelines and LLM selection logic |

## Related Documentation

**Architecture:**
- [Story 1.3: Navigation Component Implementation](/docs/stories/1.3.story.md)
- [Story 1.11: Tailwind Design System](/docs/stories/1.11.story.md)

**Implementation:**
- [ZOD Contract: NavigationContract](/web-app/lib/contracts/navigation.contract.ts)
- [CVA Variants: navigationVariants](/web-app/lib/cva-variants.ts#L180-L199)
- [Component Source Code](/web-app/components/blocks/Navigation/index.tsx)

**LLM Generation (Epic 7):**
- **Used by:** StylingAgent (variant selection), AssemblyAgent (page layout)
- **Prompt Context:** Requires navigationPlacement, hotelType, targetAudience parameters
- **Quality Gates:** Responsive behavior validation, accessibility compliance, mobile usability testing
- **Cost Considerations:** High-impact component - optimize mobile menu efficiency for cost savings