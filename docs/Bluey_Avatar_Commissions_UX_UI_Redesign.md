# Bluey's Avatar Commissions — UX/UI Redesign Plan

## Goal

Redesign the website so it feels like a polished, personal artist/VRChat creator website rather than a generic template.

The redesign should improve:

- Navigation
- Visual hierarchy
- Animations
- Portfolio browsing
- Adoptable browsing
- Commission flow
- Mobile UX
- Accessibility
- Content consistency
- Overall personality

The site should feel **creative, personal, playful, polished, and distinctly Bluey**.

---

# 1. Overall Visual Direction

Move away from repetitive card grids and overly generic AI-looking layouts.

Use:

- Strong artwork-first presentation
- More intentional spacing
- Large visual moments
- Subtle motion
- Soft depth and layered backgrounds
- Personal branding
- Clear calls to action
- Consistent typography
- Consistent component styling

Animations should support the content rather than distract from it.

---

# 2. Page Transitions

Add smooth transitions between pages.

Recommended behaviour:

- Fade the old page out
- Slight upward movement for incoming content
- Keep transitions short
- Avoid long loading animations
- Preserve scroll position where appropriate
- Respect `prefers-reduced-motion`

Example:

```text
Page A
   ↓
fade + slight movement
   ↓
Page B
```

Do not use excessive full-screen transition effects.

---

# 3. Homepage Redesign

The homepage should immediately communicate:

> Who Bluey is  
> What Bluey makes  
> How someone can commission Bluey

## Hero

Create a large artwork-focused hero containing:

- Featured avatar/artwork
- Bluey's name/branding
- Short introduction
- Primary CTA: `Commission Me`
- Secondary CTA: `View My Work`
- Commission status indicator

Example:

```text
BLUEY BARKS

Avatar creator • VRChat artist • Digital creator

[ Commission Me ]   [ View My Work ]

● Commissions Open
```

The artwork should be the visual focus rather than the text.

---

# 4. Scroll-Based Homepage Structure

Recommended order:

1. Hero
2. Featured Work
3. What I Make
4. How Commissions Work
5. Adoptables
6. Services
7. Reviews
8. Final Commission CTA
9. Footer

Each section should feel visually different instead of being the same card component repeated.

---

# 5. Micro-Interactions

Add small interactions throughout the website.

## Buttons

On hover:

- Slight upward movement
- Subtle highlight
- Small scale change
- Smooth transition

## Links

Use:

- Animated underline
- Small movement
- Clear hover/focus state

## Cards

On hover:

- Slight lift
- Artwork zoom
- Subtle shadow/depth change

Keep these effects subtle.

---

# 6. Portfolio UX

The portfolio should be artwork-first.

## Gallery

Improve the gallery with:

- Large thumbnails
- Consistent aspect-ratio handling
- Category filters only where useful
- Fast image loading
- Lazy loading
- Clear hover states

## Portfolio Item

Clicking artwork should open a proper lightbox/detail view.

Include:

- Large image
- Image counter
- Previous/next buttons
- Keyboard navigation
- Escape to close
- Mobile swipe support
- Caption/details when available

Optional:

- Before/after slider
- Multiple image gallery
- Project information

---

# 7. Adoptables UX

Make Adoptables feel more like a small storefront.

Each adoptable should show:

- Large artwork
- Name
- Availability
- Price
- Short description
- Included items
- Model/base information
- Gallery
- Adoption CTA

Use clear status badges:

```text
AVAILABLE
SOLD
RESERVED
```

The detail page should feel like a product page rather than another generic content page.

Primary CTA:

```text
Adopt This Character
```

---

# 8. Commission Form Redesign

Avoid presenting a huge form all at once.

Use a multi-step process.

## Step 1 — About You

- Name
- Discord
- Email

## Step 2 — Project

- Commission type
- Avatar / texture / editing / other
- Budget if applicable

## Step 3 — Details

- Project description
- References
- Uploads

## Step 4 — Review

- Summary
- Terms confirmation
- Submit

Progress indicator:

```text
① About → ② Project → ③ Details → ④ Review
```

The form should include:

- Clear validation
- Inline error messages
- Upload progress
- Success animation
- Accessible labels
- Keyboard navigation
- Mobile-friendly controls

---

# 9. Upload UX

Improve image/file uploading substantially.

Use a visible upload zone:

```text
┌───────────────────────────────┐
│                               │
│       Drop files here         │
│                               │
│       or Browse Files         │
│                               │
│ PNG • JPG • WEBP               │
└───────────────────────────────┘
```

After selecting files:

- Show previews
- Show filenames
- Show file sizes
- Show upload progress
- Allow removal
- Display upload errors clearly
- Prevent accidental duplicate uploads

Do not make users guess whether an upload succeeded.

---

# 10. Mobile Navigation

Create a dedicated mobile navigation experience.

Menu:

```text
BLUEY

Portfolio
Commissions
Adoptables
Services
About
Reviews
Contact
```

Use a smooth open/close animation.

Requirements:

- Large touch targets
- Clear close button
- Keyboard accessibility
- Focus trapping where appropriate
- No horizontal overflow

---

# 11. Floating Commission CTA

Consider a subtle persistent CTA:

```text
♡ Commission Me
```

It can remain visible while browsing.

It should:

- Be unobtrusive
- Work on mobile
- Hide when already on the commission form
- Have a clear hover/focus state

---

# 12. Accessibility

Every animation and interaction must remain usable without animation.

Implement:

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable or simplify non-essential animations */
}
```

Also check:

- Keyboard navigation
- Focus states
- Colour contrast
- Image alt text
- Form labels
- Screen-reader announcements
- Button semantics
- Modal accessibility

---

# 13. Performance

Improve image and page performance.

Use:

- `next/image` where appropriate
- Responsive image sizes
- Lazy loading
- Proper image dimensions
- Optimised assets
- Reduced unnecessary JavaScript
- Avoid excessive particle effects

Do not sacrifice performance for visual effects.

---

# 14. Content Consistency

There is outdated contact/domain information in the project.

Incorrect/old content currently includes:

```text
Discord: @BlueyBarks
Email: Available via the contact form at blueysweb.com
Website: https://blueysweb.com
```

The website should use the current official site information:

```text
Discord: @BlueyBarks
Website: https://www.blueycomissions.website/
```

Do not leave references to:

```text
blueysweb.com
```

anywhere in public content if that is no longer the correct domain.

---

# 15. Canonical Site Configuration

Do not hard-code contact information separately throughout the application.

Create one canonical configuration object.

Example:

```ts
export const siteConfig = {
  name: "Bluey's Avatar Commissions",
  discord: "BlueyBarks",
  discordUrl: "...",
  websiteUrl: "https://www.blueycomissions.website/",
}
```

Pages/components should import this configuration.

Use it for:

- Footer
- Contact page
- Commission page
- FAQ
- Terms
- About
- Social links
- Metadata
- Structured data

This prevents outdated information from appearing in different parts of the website.

---

# 16. Database / Seed Cleanup

The old text appears to exist in SQL/database seed content.

Search the entire project for:

```text
blueysweb.com
```

Also search for:

```text
BlueyBarks
Discord
Website
Email
reasonable timeframe
```

Update the source of truth rather than only editing the rendered page.

After changing seed data:

- Update the appropriate migration/seed
- Ensure existing records are updated where necessary
- Verify the frontend reads the updated record
- Check that future database resets do not reintroduce the old domain

---

# 17. Footer Redesign

Create a useful footer containing:

```text
BLUEY

Avatar creator • VRChat artist

Portfolio
Commissions
Adoptables
Services
FAQ
Reviews
Contact

Discord
```

Then:

```text
© Bluey
Terms
Privacy
```

Avoid filling the footer with unnecessary links.

---

# 18. Reviews

Make reviews feel more personal.

Instead of a simple repetitive grid:

- Highlight one review
- Show supporting smaller reviews
- Add subtle motion
- Include optional avatar/name information
- Keep the layout readable

Do not make reviews overly animated.

---

# 19. Services

Present services visually.

Possible layout:

```text
AVATARS
Custom avatar work
[ View Service ]

TEXTURES
Custom textures and edits
[ View Service ]

EDITS
Avatar modifications
[ View Service ]
```

Each service should explain:

- What it includes
- What it does not include
- Starting price if applicable
- Typical process
- CTA

---

# 20. Loading / Empty / Error States

Every major interactive page needs proper states.

## Loading

Use lightweight skeletons rather than a giant spinner.

## Empty

Example:

```text
Nothing here yet :c

Check back soon!
```

## Error

Example:

```text
Oops! Something broke :c

Please try again or contact Bluey.
[ Try Again ]
```

Avoid exposing raw database errors to users.

---

# 21. Error Handling

Never display raw errors such as:

```text
PrismaClientKnownRequestError
```

or SQL/database output.

Users should receive friendly messages while detailed errors are logged internally.

---

# 22. Motion Guidelines

Use a consistent animation system.

Recommended timing:

- Micro interaction: 120–180ms
- Button/card transition: 180–250ms
- Section reveal: 350–500ms
- Page transition: 250–400ms

Use easing rather than linear movement.

Avoid:

- Constant bouncing
- Excessive parallax
- Huge zooms
- Long loading sequences
- Animations that block interaction

---

# 23. Visual Personality

The website should feel like **Bluey's website**, not a generic SaaS dashboard.

Use personality through:

- Artwork
- Small playful copy
- Custom decorative elements
- Subtle themed effects
- Personal branding
- Carefully selected illustrations
- Small surprises/interactions

The design should still remain professional enough for commissions.

---

# 24. Recommended Component System

Create reusable components for:

```text
AnimatedButton
PageTransition
Reveal
ArtworkCard
PortfolioGrid
PortfolioLightbox
AdoptableCard
AdoptableDetail
ServiceCard
ReviewCard
CommissionStepper
FileUploader
StatusBadge
FloatingCommissionCTA
MobileMenu
SectionHeader
EmptyState
ErrorState
LoadingSkeleton
```

This avoids every page developing its own slightly different UI.

---

# 25. Final UX Goal

The finished site should feel like:

> A polished personal artist portfolio combined with a premium commission experience and a small adoptable storefront.

The priority is not simply adding more effects.

The priority is:

**Clarity → Personality → Interaction → Performance → Accessibility**

Make the website easier to understand, nicer to browse, easier to commission through, and much more recognisably Bluey.
