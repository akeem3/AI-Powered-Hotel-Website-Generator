# Component: ContactForm

## Component Purpose

Contact inquiry form with validation for name, email, phone, subject, and message fields that enables visitors to submit general questions, booking inquiries, business requests, or event planning information.

## File Location

- **File:** `web-app/components/sections/ContactForm/index.tsx`
- **Category:** Section

## Props Schema (ZOD)

```typescript
export const ContactFormContract = z.object({
  name: z.string()
    .refine((value) => value.trim().length >= 2, {
      message: 'Name must be at least 2 characters',
    })
    .max(100, 'Name must be 100 characters or fewer')
    .refine((value) => /^[\p{L}\p{M}\s'.-]+$/u.test(value), {
      message: 'Name may only include letters, spaces, apostrophes, and hyphens',
    }),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string()
    .refine((value) => value.trim().length > 0, {
      message: 'Phone number cannot be empty',
    })
    .max(25, 'Phone number must be at most 25 characters')
    .regex(/^[+()\d\s-]+$/, 'Invalid phone number format')
    .refine((value) => !value.includes('--') && !value.includes('  '), {
      message: 'Phone number contains invalid repeated separators',
    })
    .refine((value) => {
      const openParens = (value.match(/\(/g) || []).length;
      const closeParens = (value.match(/\)/g) || []).length;
      return openParens === closeParens;
    }, { message: 'Phone number has unbalanced parentheses' })
    .refine((value) => {
      const digits = value.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 12) {
        return false;
      }
      // Additional formatting validation...
      return true;
    }, { message: 'Phone number must contain between 10 and 12 digits with valid country formatting' })
    .optional(),
  subject: z.enum(['General', 'Booking', 'Business', 'Events']),
  message: z.string()
    .refine((value) => value.trim().length >= 10, {
      message: 'Message must be at least 10 characters',
    })
    .max(1000, 'Message too long (max 1000 characters)')
}).strict();

export const ContactFormPropsSchema = z.object({
  variant: z.object({
    style: z.enum(['default', 'minimal', 'floating']).optional(),
    background: z.enum(['none', 'brand', 'muted']).optional()
  }).optional(),
  className: z.string().optional(),
  onSuccess: z.custom<() => void>().optional()
}).strict();
```

## TypeScript Interface

```typescript
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: 'General' | 'Booking' | 'Business' | 'Events';
  message: string;
}

export interface ContactFormProps {
  variant?: {
    style?: 'default' | 'minimal' | 'floating';
    background?: 'none' | 'brand' | 'muted';
  };
  className?: string;
  onSuccess?: () => void;
}
```

## CVA Variants

### Available Variants

| Variant Dimension | Options | Default | Description |
|-------------------|---------|---------|-------------|
| style | default \| minimal \| floating | default | Visual styling and layout approach |
| background | none \| brand \| muted | none | Background color treatment |

### Variant Combinations

**Recommended Combinations:**

| Hotel Type | Style | Background | Notes |
|------------|-------|------------|-------|
| Luxury | default | muted | Elegant card with subtle background |
| Budget | minimal | none | Clean, functional interface |
| Boutique | floating | brand | Modern overlay effect with brand accent |
| Resort | default | none | Friendly, approachable appearance |
| Business | default | muted | Professional, polished presentation |

**Avoid Combinations:**
- minimal + floating (contradictory layout approaches)
- floating + none background (visual separation issues)
- default + brand background (excessive visual weight)

## LLM Selection Guidelines

### Decision Tree

```
IF contactPageLayout === "featured" THEN
  style = "floating"
  background = "brand" | "muted"
  Prominent placement with visual emphasis

IF contactPageLayout === "standard" OR "sidebar" THEN
  style = "default" | "minimal"
  background = "none" | "muted"
  Integrated with page content

IF hotelType === "luxury" THEN
  style = "default"
  background = "muted"
  Professional, polished appearance
  Comprehensive form fields

IF hotelType === "budget" THEN
  style = "minimal"
  background = "none"
  Streamlined, functional interface
  Essential fields only

IF hotelType === "boutique" THEN
  style = "floating"
  background = "brand"
  Modern, artistic presentation
  Enhanced visual appeal

IF hotelType === "resort" THEN
  style = "default"
  background = "none"
  Welcoming, vacation-friendly appearance
  Clear call-to-action emphasis

IF hotelType === "business" THEN
  style = "default"
  background = "muted"
  Professional, efficient interface
  Business inquiry focus

IF primaryInquiryType === "business" THEN
  style = "default"
  Include comprehensive business fields
  Professional subject options
  Corporate-friendly styling

IF primaryInquiryType === "general" THEN
  style = "minimal" | "default"
  Streamlined interface
  Essential contact fields
  User-friendly validation

IF primaryInquiryType === "events" THEN
  style = "default"
  Include events subject option
  Enhanced message field for details
  Professional presentation

IF targetAudience === "mobile-heavy" THEN
  style = "minimal"
  Touch-optimized interface
  Simplified field layout
  Mobile-friendly validation

IF targetAudience === "desktop-heavy" THEN
  style = "default" | "floating"
  Enhanced presentation options
  Professional styling
  Comprehensive field options

IF brandPersonality === "modern" THEN
  style = "floating"
  Contemporary visual presentation
  Enhanced visual effects
  Artistic integration

IF brandPersonality === "traditional" THEN
  style = "default"
  Classic, professional appearance
- Consistent with brand identity
- Clear, functional interface

IF placement === "hero-overlay" THEN
  style = "floating"
  background = "brand"
  Prominent placement over imagery
  High contrast for readability

IF placement === "content-section" THEN
  style = "default" | "minimal"
  background = "none" | "muted"
  Integrated with page content
  Natural content flow
```

## Content Guidelines

### Name Field
- **Length:** 2-100 characters (ZOD enforced)
- **Format:** First name + last name, or full name
- **Characters:** Letters, spaces, apostrophes, hyphens only
- **Validation:** Required field with real-time validation
- **Examples:** "John Smith", "Mary O'Connor", "Jean-Paul Dubois"

### Email Field
- **Format:** Standard email format (user@domain.com)
- **Validation:** Required field with email format validation
- **Characters:** Standard email characters allowed
- **Examples:** "john.smith@example.com", "contact@hotel.com"

### Phone Field (Optional)
- **Length:** Maximum 25 characters (ZOD enforced)
- **Format:** International or local format with proper separators
- **Validation:** 10-12 digits required, balanced parentheses
- **Characters:** Digits, +, (, ), spaces, hyphens only
- **Examples:** "+1 (555) 123-4567", "555-123-4567", "+44 20 7123 4567"

### Subject Field
- **Options:** 'General', 'Booking', 'Business', 'Events' (ZOD enum)
- **Purpose:** Categorize inquiry type for routing
- **Required:** Yes, must select from predefined options
- **Default:** Usually 'General' or first option

### Message Field
- **Length:** 10-1000 characters (ZOD enforced)
- **Purpose:** Detailed inquiry or question content
- **Format:** Free text with proper validation
- **Required:** Yes, must have minimum meaningful content
- **Examples:** Complete sentences describing the inquiry

### Do/Don't Examples

**DO:**
- Use clear, descriptive field labels
- Provide immediate validation feedback
- Include helpful hints and examples
- Ensure proper international phone format support
- Test with various name formats and cultures
- Provide clear success/error messaging

**DON'T:**
- Use generic placeholders like "Enter text here"
- Accept invalid phone number formats
- Allow special characters in name fields
- Make message field too restrictive
- Forget international email format support
- Ignore accessibility requirements

## Examples

### Example 1: Luxury Hotel Default Contact Form

```json
{
  "variant": "default",
  "background": "muted",
  "className": "shadow-lg",
  "onSuccess": "() => handleLuxuryContactSuccess()"
}
```

**Rationale:** Default style provides elegant, professional appearance suitable for luxury hotel. Muted background creates subtle visual separation without overwhelming the page design. Comprehensive form fields support various inquiry types.

### Example 2: Budget Minimal Contact Form

```json
{
  "variant": "minimal",
  "background": "none",
  "className": "",
  "onSuccess": "() => handleBudgetContactSuccess()"
}
```

**Rationale:** Minimal variant provides clean, functional interface focused on efficiency. No background maintains simplicity and reduces visual complexity. Streamlined presentation aligns with budget-conscious brand positioning.

### Example 3: Boutique Floating Contact Form

```json
{
  "variant": "floating",
  "background": "brand",
  "className": "shadow-xl",
  "onSuccess": "() => handleBoutiqueContactSuccess()"
}
```

**Rationale:** Floating style creates modern, artistic presentation with elevated visual prominence. Brand background integrates with boutique's unique visual identity. Enhanced styling supports creative brand positioning.

### Example 4: Business Professional Contact Form

```json
{
  "variant": "default",
  "background": "muted",
  "className": "border border-border-default",
  "onSuccess": "() => handleBusinessContactSuccess()"
}
```

**Rationale:** Default variant provides professional, polished appearance suitable for business inquiries. Muted background maintains corporate aesthetic. Comprehensive validation supports business communication standards.

### Example 5: Resort Welcoming Contact Form

```json
{
  "variant": "default",
  "background": "none",
  "className": "shadow-md",
  "onSuccess": "() => handleResortContactSuccess()"
}
```

**Rationale:** Default style with no background creates friendly, approachable appearance perfect for resort inquiries. Natural integration with page content maintains vacation-friendly atmosphere. Comprehensive fields support various guest needs.

## Constraints

### Technical Constraints
- Real-time form validation with immediate feedback
- International phone number format support
- Email format validation with proper regex
- Accessibility compliance for all form elements
- Touch-optimized controls for mobile devices
- Integration with form submission backend/API

### Content Constraints
- Name: 2-100 characters, letters/spaces/apostrophes/hyphens only
- Email: Valid email format required
- Phone: Optional, 10-12 digits with proper formatting
- Subject: Must be one of 4 predefined options
- Message: 10-1000 characters required
- All validation messages must be user-friendly

### Performance Constraints
- Form rendering time <100ms
- Validation response time <50ms
- Bundle size impact <20KB gzipped
- Touch target optimization for mobile
- Smooth form submission without page reload

## Accessibility Requirements

- **Form Labels:** All inputs have associated labels with proper `htmlFor` attributes
- **Field Descriptions:** Additional context where needed for complex fields
- **Error Messages:** Programmatically associated with form fields
- **Keyboard Navigation:** Complete keyboard accessibility with logical tab order
- **Screen Reader Support:** ARIA labels, roles, and live regions for validation feedback
- **Color Contrast:** WCAG 2.1 AA compliance (4.5:1 for normal text, 3:1 for large text)
- **Focus Management:** Visible focus indicators and proper focus trapping
- **Touch Targets:** Minimum 44px × 44px for all interactive elements
- **Form Validation:** Real-time validation with screen reader announcements
- **Success/Error States:** Clear, accessible messaging for form outcomes

## Responsive Behavior

### Mobile (<768px)
- **Layout:** Stacked single-column layout
- **Field Sizing:** Full-width input fields with adequate spacing
- **Touch Targets:** 44px+ minimum touch targets for all controls
- **Keyboard:** Avoid mobile keyboard overlap with form fields
- **Validation:** Immediate feedback without blocking user input
- **Spacing:** Generous padding for thumb-friendly interaction
- **Button:** Full-width submission button with clear action text

### Tablet (768px - 1023px)
- **Layout:** Balanced single-column with enhanced spacing
- **Field Sizing:** Optimized for both touch and cursor interaction
- **Typography:** Readable font sizes for tablet viewing
- **Validation:** Enhanced error positioning and visibility

### Desktop (≥1024px)
- **Layout:** Single-column with optimal field width (max 600px)
- **Field Sizing:** Comfortable input sizes with clear visual hierarchy
- **Hover Effects:** Enhanced interactive states for better UX
- **Validation:** Inline error messages with clear positioning
- **Focus States:** Subtle focus indicators with good visibility

## Testing Guidelines

### Unit Tests
- Test all variant combinations render correctly
- Verify ZOD contract validation for all form fields
- Test form validation with various input combinations
- Validate accessibility attributes and ARIA compliance
- Test form submission with valid and invalid data
- Verify phone number validation with international formats

### Visual Regression Tests
- Compare screenshots across all viewport sizes
- Test all style variants (default, minimal, floating)
- Validate form states (pristine, valid, invalid, submitted)
- Test error message positioning and appearance
- Verify consistent spacing and alignment

### Integration Tests
- Test form submission with backend integration
- Validate form data transformation and formatting
- Test success/error handling scenarios
- Verify phone number international format support
- Test email validation with various formats

### Accessibility Tests
- Verify keyboard navigation flow is logical
- Test screen reader compatibility with form elements
- Validate color contrast compliance
- Test form validation with assistive technologies
- Verify touch target sizes on mobile devices

## Common Pitfalls

1. **Poor Phone Validation:** Accepting invalid international formats
   - **Symptom:** Users can submit invalid phone numbers
   - **Fix:** Implement comprehensive phone validation with international support
   - **Prevention:** Test phone numbers from various countries and formats

2. **Inaccessible Error Messages:** Errors not associated with form fields
   - **Symptom:** Screen readers cannot identify which field has errors
   - **Fix:** Use proper ARIA attributes and programmatic associations
   - **Prevention:** Test with screen readers during development

3. **Mobile Keyboard Overlap:** Form fields hidden by mobile keyboard
   - **Symptom:** Users cannot see input fields while typing on mobile
   - **Fix:** Implement proper viewport management and field positioning
   - **Prevention:** Test on various mobile devices and screen sizes

4. **Overly Restrictive Name Validation:** Rejecting valid international names
   - **Symptom:** Users with non-English names cannot submit forms
   - **Fix:** Use inclusive regex that supports international character sets
   - **Prevention:** Test with diverse name formats and cultural variations

5. **Poor Form Submission UX:** No feedback or unclear submission status
   - **Symptom:** Users don't know if form was submitted successfully
   - **Fix:** Implement clear success/error messaging and loading states
   - **Prevention:** Design user-friendly submission flow with proper feedback

6. **Insufficient Touch Targets:** Mobile controls too small for reliable interaction
   - **Symptom:** Users struggle to tap controls on mobile devices
   - **Fix:** Ensure minimum 44px × 44px touch targets for all interactive elements
   - **Prevention:** Design mobile-first with adequate touch spacing

7. **Email Validation Too Strict:** Rejecting valid email formats
   - **Symptom:** Users with valid emails cannot submit forms
   - **Fix:** Use comprehensive email regex that supports various valid formats
   - **Prevention:** Test with various email formats including international domains

8. **Form Accessibility Issues:** Missing labels or poor keyboard navigation
   - **Symptom:** Accessibility audit failures, poor user experience
   - **Fix:** Proper labels, ARIA attributes, and keyboard navigation
   - **Prevention:** Design for accessibility from the start, test with assistive technologies

## Version History

| Date | Version | Notes |
|------|---------|-------|
| 2025-12-03 | 1.0 | Initial documentation created with comprehensive validation guidelines and accessibility requirements |

## Related Documentation

**Architecture:**
- [PRD - FR3: Contact Page with Business Inquiry Integration](/docs/prd.md#fr3-contact-page-with-business-inquiry-integration)
- [Story 1.6: Contact Page with Basic Form](/docs/stories/1.6.story.md)
- [Story 1.11: Tailwind Design System](/docs/stories/1.11.story.md)

**Implementation:**
- [ZOD Contract: ContactFormContract](/web-app/lib/contracts/contact.contract.ts#L7-L61)
- [ZOD Props: ContactFormPropsSchema](/web-app/lib/contracts/contact.contract.ts#L65-L69)
- [CVA Variants: contactFormVariants](/web-app/lib/cva-variants.ts#L275-L297)
- [Component Source Code](/web-app/components/sections/ContactForm/index.tsx)

**LLM Generation (Epic 7):**
- **Used by:** StylingAgent (variant selection), ContentGenerator (form labels), AssemblyAgent (placement decisions)
- **Prompt Context:** Requires hotelType, targetAudience, contactPageLayout, primaryInquiryType parameters
- **Quality Gates:** ZOD validation, accessibility compliance, international format testing, form validation testing
- **Cost Considerations:** High-impact component - optimize validation logic and international format support for efficiency