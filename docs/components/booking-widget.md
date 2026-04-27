# Component: BookingWidget

## Component Purpose

Responsive booking form with date selection, guest configuration, and room preferences that adapts between collapsible mobile interface and single-form desktop layout to capture booking inquiries.

## File Location

- **File:** `web-app/components/blocks/BookingWidget/index.tsx`
- **Category:** Block

## Props Schema (ZOD)

```typescript
export const BookingWidgetContract = z.object({
  variant: z.enum(['mobile', 'desktop']).optional(),
  theme: z.enum(['light', 'dark', 'glass']).optional(),
  className: z.string().optional(),
  onSubmit: z.custom<(...args: unknown[]) => void>().optional(),
  onRoomChange: z.custom<(...args: unknown[]) => void>().optional(),
  onDateChange: z.custom<(...args: unknown[]) => void>().optional(),
  onGuestChange: z.custom<(...args: unknown[]) => void>().optional(),
  defaultValues: z.object({
    checkIn: z.instanceof(Date).optional(),
    checkOut: z.instanceof(Date).optional(),
    adults: z.number().int().min(1).max(10).optional(),
    children: z.number().int().min(0).max(10).optional(),
    rooms: z.number().int().min(1).max(5).optional(),
    roomType: z.string().optional(),
    specialRequests: z.string().max(500).optional()
  }).optional()
});
```

## TypeScript Interface

```typescript
export interface BookingWidgetProps {
  variant?: 'mobile' | 'desktop';
  theme?: 'light' | 'dark' | 'glass';
  className?: string;
  onSubmit?: (data: BookingData) => void;
  defaultValues?: {
    checkIn?: Date;
    checkOut?: Date;
    adults?: number;
    children?: number;
    rooms?: number;
    roomType?: string;
    roomId?: string;
  };
}
```

## CVA Variants

### Available Variants

| Variant Dimension | Options | Default | Description |
|-------------------|---------|---------|-------------|
| variant | mobile \| desktop | desktop | Layout adaptation for device type |
| theme | light \| dark \| glass | light | Visual styling and color scheme |

### Variant Combinations

**Recommended Combinations:**

| Hotel Type | Variant | Theme | Notes |
|------------|---------|-------|-------|
| Luxury | desktop | glass | Sophisticated blur effect with premium appearance |
| Budget | mobile | light | Functional, clean interface for value seekers |
| Boutique | desktop | glass | Modern, artistic styling with transparency |
| Resort | mobile | light | Casual, approachable interface for vacationers |
| Business | desktop | light | Professional, clear interface for corporate travelers |

**Avoid Combinations:**
- mobile + dark (poor contrast on most devices)
- desktop + mobile variant (confusing layout mismatch)
- glass theme with complex backgrounds (readability issues)

## LLM Selection Guidelines

### Decision Tree

```
IF viewportWidth < 768px THEN
  variant = "mobile"
  Collapsible sections with 5 distinct areas
  Touch-optimized controls and spacing

IF viewportWidth >= 768px THEN
  variant = "desktop"
  Single-form layout with all fields visible
  Enhanced interaction states and hover effects

IF hotelType === "luxury" THEN
  theme = "glass" | "light"
  variant = "desktop" (prefer spacious layout)
  Emphasize premium experience and attention to detail

IF hotelType === "budget" THEN
  theme = "light"
  variant = "mobile" (space-efficient)
  Focus on functionality and value proposition

IF hotelType === "boutique" THEN
  theme = "glass" | "light"
  variant = "desktop"
  Modern, artistic styling with sophisticated interactions

IF hotelType === "resort" THEN
  theme = "light"
  variant = "mobile" | "desktop"
  Casual, vacation-friendly interface
  Emphasize dates and availability

IF hotelType === "business" THEN
  theme = "light"
  variant = "desktop"
  Professional, efficient interface
  Clear business travel considerations

IF placement === "hero-section" THEN
  theme = "glass" (over imagery) OR "light" (separate)
  Ensure contrast with background elements
  Prominent CTA button placement

IF placement === "sidebar" OR "footer" THEN
  theme = "light"
  variant = "mobile" (space-efficient)
  Compact but functional interface
  Clear hierarchy and flow

IF targetAudience === "mobile-heavy" THEN
  variant = "mobile"
  Touch-optimized controls
  Simplified date selection
  Streamlined guest configuration

IF targetAudience === "desktop-heavy" THEN
  variant = "desktop"
  Enhanced date picker interfaces
  Advanced filtering options
  Detailed room preferences

IF brandPersonality === "modern" THEN
  theme = "glass"
  Contemporary transparency effects
  Smooth animations and transitions

IF brandPersonality === "traditional" THEN
  theme = "light"
  Classic, professional appearance
  Clear, functional interface

IF primaryGoal === "quick-booking" THEN
  variant = "mobile" (regardless of device)
  Essential fields only
  Streamlined user flow
  Prominent booking button

IF primaryGoal === "detailed-planning" THEN
  variant = "desktop"
  Comprehensive preference options
  Advanced date selection
  Room type filtering
```

## Content Guidelines

### Form Field Labels
- **Check-in/Check-out:** Clear date format indicators (MM/DD/YYYY)
- **Guests:** Separate adults, children, and room counts
- **Room Preferences:** Common amenity options with checkboxes
- **Special Requests:** Text area with character limit indication
- **CTA Button:** Action-oriented, benefit-driven text

### Date Selection
- **Format:** MM/DD/YYYY or DD/MM/YYYY based on hotel location
- **Constraints:** Check-out must be after check-in
- **Default:** Check-in = today, Check-out = tomorrow
- **Validation:** Prevent past dates and impossible date ranges

### Guest Configuration
- **Adults:** 1-10 guests (ZOD enforced)
- **Children:** 0-10 children (ZOD enforced)
- **Rooms:** 1-5 rooms maximum (ZOD enforced)
- **Capacity:** Validate room capacity vs guest count

### Room Preferences
- **Categories:** Bed type, view type, accessibility, floor level
- **Options:** King/Queen, Ocean/City View, Accessible Room, High Floor
- **Format:** Checkbox selection with clear labels
- **Optional:** User can proceed without selecting preferences

### Special Requests
- **Length:** Maximum 500 characters (ZOD enforced)
- **Purpose:** Specific accommodation needs or preferences
- **Examples:** Early check-in, late checkout, anniversary celebration
- **Validation:** Optional field with character counter

### Do/Don't Examples

**DO:**
- Use clear, action-oriented field labels
- Provide immediate validation feedback
- Ensure 44px+ touch targets on mobile
- Show progress indication for multi-step mobile flow
- Include helpful hints and examples
- Test with real booking scenarios

**DON'T:**
- Use technical jargon in field labels
- Ignore mobile touch target requirements
- Forget date validation and error handling
- Make special requests required field
- Use ambiguous CTA button text
- Ignore accessibility requirements

## Examples

### Example 1: Luxury Hotel Desktop Booking Widget

```json
{
  "variant": "desktop",
  "theme": "glass",
  "className": "shadow-xl",
  "defaultValues": {
    "adults": 2,
    "children": 0,
    "rooms": 1
  },
  "onSubmit": "(data) => handleLuxuryBooking(data)"
}
```

**Rationale:** Glass theme creates sophisticated premium appearance that complements luxury hotel branding. Desktop variant provides spacious layout ideal for detailed planning and room preference selection.

### Example 2: Budget Mobile Booking Widget

```json
{
  "variant": "mobile",
  "theme": "light",
  "className": "shadow-md",
  "defaultValues": {
    "adults": 2,
    "children": 0,
    "rooms": 1
  },
  "onSubmit": "(data) => handleBudgetBooking(data)"
}
```

**Rationale:** Mobile variant maximizes space efficiency for budget-conscious travelers. Light theme maintains clean, functional appearance without unnecessary visual complexity.

### Example 3: Boutique Resort Booking Widget

```json
{
  "variant": "desktop",
  "theme": "glass",
  "defaultValues": {
    "adults": 2,
    "children": 0,
    "rooms": 1,
    "roomType": "Ocean View Suite"
  },
  "onSubmit": "(data) => handleBoutiqueBooking(data)"
}
```

**Rationale:** Glass theme creates modern, artistic appearance matching boutique aesthetic. Desktop layout showcases premium room options and detailed preferences for discerning guests.

### Example 4: Business Travel Mobile Booking

```json
{
  "variant": "mobile",
  "theme": "light",
  "defaultValues": {
    "adults": 1,
    "children": 0,
    "rooms": 1
  },
  "onSubmit": "(data) => handleBusinessBooking(data)"
}
```

**Rationale:** Mobile variant provides efficient booking interface for busy business travelers. Light theme maintains professional appearance.

### Example 5: Family Resort Desktop Booking

```json
{
  "variant": "desktop",
  "theme": "light",
  "defaultValues": {
    "adults": 2,
    "children": 2,
    "rooms": 1
  },
  "onSubmit": "(data) => handleFamilyBooking(data)"
}
```

**Rationale:** Desktop variant provides ample space for family booking details. Light theme creates welcoming, vacation-friendly appearance.

## Constraints

### Technical Constraints
- Component must handle responsive variant switching
- Form validation with real-time feedback required
- Date picker with range selection and validation
- State management for collapsible mobile sections
- Integration with external booking systems via callbacks
- Touch-optimized controls for mobile variant

### Content Constraints
- Special requests: Maximum 500 characters (ZOD enforced)
- Guest counts: Adults 1-10, Children 0-10, Rooms 1-5 (ZOD enforced)
- Date validation: Check-out must be after check-in (ZOD enforced)
- Room preferences: Optional checkbox selection
- Form fields: All fields accessible via keyboard navigation

### Performance Constraints
- Initial render time <150ms
- Form validation response <50ms
- Mobile section toggle animation <300ms
- Date picker calendar rendering <200ms
- Bundle size impact <25KB gzipped

## Accessibility Requirements

- **Form Labels:** All inputs have associated labels with `htmlFor` attributes
- **Keyboard Navigation:** Full keyboard accessibility with logical tab order
- **Screen Reader Support:** ARIA labels, roles, and live regions for validation
- **Color Contrast:** WCAG 2.1 AA compliance (4.5:1 for normal text, 3:1 for large text)
- **Focus Management:** Visible focus indicators and proper focus trapping in modals
- **Error Handling:** Clear error messages with programmatically associated inputs
- **Date Input:** Accessible date picker with keyboard navigation
- **Mobile Sections:** ARIA attributes for collapsible content regions
- **Touch Targets:** Minimum 44px × 44px for all interactive elements
- **Form Validation:** Real-time validation feedback with screen reader announcements

## Responsive Behavior

### Mobile (<768px)
- **Layout:** Collapsible sections with accordion-style interface
- **Sections:** 5 distinct areas (Dates, Guests & Rooms, Room Preferences, Special Requests, Book Now)
- **Controls:** Touch-optimized with 44px+ minimum touch targets
- **Date Selection:** Simplified calendar interface with clear touch targets
- **Guest Configuration:** Increment/decrement buttons with clear labels
- **Animation:** Smooth section expand/collapse transitions (300ms)
- **Spacing:** Generous padding for thumb-friendly interaction
- **CTA Button:** Full-width prominent button with clear action text

### Tablet (768px - 1023px)
- **Layout:** Desktop variant with responsive adjustments
- **Spacing:** Balanced padding optimized for tablet interaction
- **Touch Enhancement:** Larger touch targets while maintaining desktop layout
- **Form Fields:** Optimized for both touch and cursor interaction

### Desktop (≥1024px)
- **Layout:** Single-form layout with all fields visible
- **Date Selection:** Enhanced calendar interface with hover states
- **Guest Configuration:** Dropdown selectors with keyboard navigation
- **Room Preferences:** Checkbox grid with clear grouping
- **Validation:** Real-time validation with inline error messages
- **Hover Effects:** Enhanced interactive states and transitions
- **Keyboard Navigation:** Full keyboard accessibility with tab order

## Testing Guidelines

### Unit Tests
- Test all variant combinations render correctly
- Verify ZOD contract validation for all props
- Test form validation with various input combinations
- Validate responsive behavior at different breakpoints
- Test callback functions trigger correctly
- Verify date validation logic (check-out after check-in)

### Visual Regression Tests
- Compare screenshots across all viewport sizes
- Test all theme variants (light, dark, glass)
- Validate mobile section expansion/collapse animations
- Test form states (pristine, valid, invalid, submitted)
- Verify consistent spacing and alignment

### Integration Tests
- Test integration with booking system callbacks
- Validate date picker functionality and constraints
- Test guest configuration capacity validation
- Verify form submission with validation passes
- Test error handling and recovery scenarios

### Accessibility Tests
- Verify keyboard navigation flow is logical
- Test screen reader compatibility with form elements
- Validate color contrast compliance
- Test form validation with assistive technologies
- Verify mobile accordion accessibility

## Common Pitfalls

1. **Insufficient Touch Targets:** Mobile controls too small for reliable interaction
   - **Symptom:** Users struggle to tap controls on mobile devices
   - **Fix:** Ensure minimum 44px × 44px touch targets for all interactive elements
   - **Prevention:** Design mobile-first with adequate touch spacing

2. **Poor Date Validation:** Invalid date ranges accepted or unclear error messages
   - **Symptom:** Users can select check-out before check-in or confusing error states
   - **Fix:** Implement robust date validation with clear error messaging
   - **Prevention:** Test edge cases and provide helpful error messages

3. **Mobile Section Navigation:** Users get lost in collapsible sections
   - **Symptom:** Poor mobile user experience with accordion interface
   - **Fix:** Clear section indicators, progress tracking, and intuitive navigation
   - **Prevention:** User test mobile flow with various device sizes

4. **Form Submission Without Validation:** Invalid data submitted to backend
   - **Symptom:** Backend receives incomplete or invalid booking data
   - **Fix:** Comprehensive client-side validation before submission
   - **Prevention:** Implement ZOD schema validation for all form data

5. **Inaccessible Form Controls:** Poor screen reader or keyboard support
   - **Symptom:** Accessibility audit failures, poor user experience
   - **Fix:** Proper labels, ARIA attributes, and keyboard navigation
   - **Prevention:** Design for accessibility from the start, test with assistive technologies

6. **Performance Issues:** Slow form rendering or validation
   - **Symptom:** Laggy user interface, poor perceived performance
   - **Fix:** Optimize state management, debounce validation, efficient re-renders
   - **Prevention:** Profile component performance with various data sizes

7. **Theme Contrast Issues:** Poor readability with certain themes or backgrounds
   - **Symptom:** Text becomes unreadable with certain color combinations
   - **Fix:** Test contrast ratios across all theme variants and background contexts
   - **Prevention:** Design with accessibility contrast requirements in mind

8. **Callback Integration Issues:** Booking system integration failures
   - **Symptom:** Booking data not properly passed to external systems
   - **Fix:** Clear contract definition for callback data, error handling
   - **Prevention:** Document integration requirements and test with actual booking systems

## Version History

| Date | Version | Notes |
|------|---------|-------|
| 2025-12-03 | 1.0 | Initial documentation created with comprehensive responsive guidelines and accessibility requirements |

## Related Documentation

**Architecture:**
- [PRD - FR1: Homepage with Hero Section and Booking Integration](/docs/prd.md#fr1-homepage-with-hero-section-and-booking-integration)
- [PRD - FR11: Advanced Booking Widget with Responsive Variants](/docs/prd.md#fr11-advanced-booking-widget-with-responsive-variants)
- [Story 1.5: Booking Flow & Rooms Page Implementation](/docs/stories/1.5.story.md)
- [Story 1.11: Tailwind Design System](/docs/stories/1.11.story.md)

**Implementation:**
- [ZOD Contract: BookingWidgetContract](/web-app/lib/contracts/booking.contract.ts#L46-L55)
- [Booking Data Schema: BookingDataContract](/web-app/lib/contracts/booking.contract.ts#L5-L18)
- [CVA Variants: bookingWidgetVariants](/web-app/lib/cva-variants.ts#L248-L266)
- [Component Source Code](/web-app/components/blocks/BookingWidget/index.tsx)

**LLM Generation (Epic 7):**
- **Used by:** StylingAgent (variant/theme selection), AssemblyAgent (placement decisions), IntegrationAgent (callback configuration)
- **Prompt Context:** Requires hotelType, targetAudience, placement, viewportWidth, primaryGoal parameters
- **Quality Gates:** ZOD validation, accessibility compliance, responsive testing, form validation testing
- **Cost Considerations:** High-impact component - optimize form validation and state management for efficiency
