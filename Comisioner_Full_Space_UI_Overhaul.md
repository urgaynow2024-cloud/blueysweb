# Comisioner.com — Full Space-Themed UI/UX Overhaul

## Core Goal

Redesign the entire Comisioner.com UI/UX so it feels polished, modern, spacious, premium, and intentionally designed while keeping the existing space/cosmic identity.

The current UI feels crowded because too many elements are presented as large dark rounded cards. Reduce visual clutter, improve hierarchy, and make the cosmic background feel like part of the actual experience.

## MOST IMPORTANT RULE

**DO NOT REMOVE THE SPACE THEME.**

Keep:
- Deep-space background
- Stars
- Purple/blue nebula atmosphere
- Cosmic gradients
- Subtle glows
- Futuristic atmosphere
- Dark overall appearance

The goal is to refine the space theme, not replace it.

---

# 1. Design Direction

Target feeling:

> 🌌 Premium creator marketplace floating inside a beautiful cosmic environment.

Not:

> 📊 Generic dark dashboard with lots of boxes.

Use the cosmic environment as the primary canvas.

---

# 2. Problems To Fix

Audit the entire application for:
- Excessive cards
- Too many rounded containers
- Large blocks of empty space
- Weak visual hierarchy
- Oversized statistics
- Excessive borders
- Excessive shadows
- Repeated card-within-card layouts
- Inconsistent spacing
- Inconsistent corner radii
- Generic dashboard styling
- Sections competing with each other
- Buttons that look like cards
- Too much information shown simultaneously

Do not simply change colours. Fix layout, hierarchy, spacing, component structure, typography, and visual rhythm.

---

# 3. Global Design System

## Background

Use:
- Very dark navy/black base
- Existing cosmic/nebula background
- Purple and blue atmospheric gradients
- Subtle stars
- Subtle animation only where useful

The background should remain atmospheric rather than distracting.

## Surfaces

Do NOT put every section inside an opaque black rectangle.

Prefer:
- Transparent/semi-transparent surfaces
- Subtle glass effect
- Very faint borders
- Soft cosmic glow
- Background visibility through surfaces

Only use a card when it actually helps group information.

## Borders

Use borders sparingly and keep them low contrast.

## Radius

Use a consistent radius system. Avoid huge pill-shaped containers unless the component is actually a pill/button/badge.

## Shadows

Avoid heavy black shadows everywhere. Use subtle depth and occasional purple/blue glow.

---

# 4. Typography

Improve the hierarchy.

### Page title
Large and visually important.

Example:
> ✦ Adoptables

### Subtitle
Smaller and muted.

Example:
> Find your next character among the stars.

### Section title
Medium-sized and clear.

### Supporting information
Small and subdued.

Avoid making every number huge.

---

# 5. Navigation

Redesign the global navigation so it feels simple and premium.

Suggested structure:

**COMISIONER ✦**

- Home
- Portfolio
- Services
- Adoptables
- About
- Credits

Right side:
- Theme/control icon where appropriate
- Primary `Commission Me` button

Do not overload navigation.

Mobile should use a clean responsive menu.

Navigation should visually integrate with the cosmic background rather than looking like a dashboard header.

---

# 6. Homepage

Create a strong visual hierarchy.

The hero should immediately communicate:
- Who the creator is
- What they do
- Main call-to-action
- Supporting visual identity

Use the cosmic background heavily.

Avoid putting hero content inside a giant card. Let content float naturally over the background.

---

# 7. Statistics / Creator Stats

The existing statistics area is too card-heavy.

Current style:
- Four giant boxes
- Large icons
- Huge numbers
- Tiny labels

Redesign this as a compact information group.

Example:

> ★ 5.0 Rating · 10 Reviews · 5–10 day turnaround · 0 Returning Clients

Or a subtle horizontal stats strip with separators.

Statistics should support the page rather than dominate it.

---

# 8. Portfolio

Make artwork the visual focus.

Use:
- Larger imagery
- Better aspect ratios
- More breathing room
- Minimal surrounding UI
- Subtle hover effects
- Lightbox/fullscreen viewing where appropriate

Avoid heavily decorated cards around every portfolio item.

Images should feel like artwork displayed in a gallery.

---

# 9. Services

Make services easier to scan.

Each service should clearly communicate:
- Name
- Description
- Starting price
- Important options
- Call-to-action

Use cards only where helpful. Keep the design visually lightweight.

---

# 10. Adoptables

This is one of the most important areas to redesign.

## Public Adoptables Page

The artwork should dominate the page.

Suggested structure:

### ✦ ADOPTABLES

> Find your next character among the stars.

Then a spacious visual gallery/grid.

Cards should be minimal.

Show:
- Artwork
- Character name
- Price
- Availability
- Featured indicator where applicable

Avoid huge black card backgrounds around every item.

---

# 11. Adoptable Detail Page

Make the artwork the hero.

Suggested structure:

```text
                 ✦ CHARACTER NAME

        ┌─────────────────────────────┐
        │                             │
        │          MAIN ART           │
        │                             │
        │                             │
        └─────────────────────────────┘

        thumbnails / gallery

        Character information
        Pricing
        Availability
        Included items
        VRChat information
        Rules / license

        [ Adopt Now ]
```

The media area should visually dominate.

Use a proper gallery/lightbox.

Keep all existing functionality.

---

# 12. Adoptable Media

Keep and improve:
- Main image
- Gallery images
- Before/after comparisons
- SFW/NSFW image handling

Use:
- Thumbnail navigation
- Fullscreen viewing
- Previous/next controls
- Smooth transitions
- Clear loading states
- Broken-image fallback
- Mobile-friendly gallery

Do not weaken or bypass existing NSFW age verification.

---

# 13. Adoptable Cards

Cards should feel lightweight.

Prefer:

```text
        ┌───────────────┐
        │               │
        │    ARTWORK    │
        │               │
        └───────────────┘

        Character Name
        £XX · Available
```

The artwork should provide most of the visual weight.

---

# 14. Credits Page

Create:

`/credits`

Make it feel like part of the cosmic world.

Suggested title:

> ✦ People Behind the Stars

Intro:

> A huge thank you to everyone who has helped, supported, tested, created, or contributed to this project. I genuinely appreciate every bit of support. 💜

Organise credits into:
- 🌟 Supporters
- 🎨 Artists
- 💻 Developers
- 🧪 Testers
- 🛠️ Helpers
- 🤝 Collaborators
- 📦 Assets / Resources
- 💜 Special Thanks

Use subtle profile/credit cards.

Do not make this look like an admin table.

Credits must come from the database.

---

# 15. Credits Visual Style

Credits should feel warm and personal.

Use:
- Avatars
- Names
- Contribution descriptions
- Category badges
- Optional links
- Subtle cosmic accents
- Gentle hover effects

Avoid excessive boxes.

The page should feel like a genuine thank-you wall.

---

# 16. About Page

Make the About section feel personal and creator-focused.

Use:
- Large heading
- Creator introduction
- Artwork/visuals
- Short story
- Skills/services
- Contact/commission CTA

Avoid making it feel like a corporate company page.

---

# 17. Reviews

Redesign reviews to feel more natural.

Avoid giant statistics cards followed by huge review cards.

Use:
- Compact rating summary
- Review count
- Individual review entries
- Avatar/name if available
- Date where appropriate
- Helpful visual separation

Make actual reviews the focus.

---

# 18. Forms

Audit every form.

Forms should have:
- Clear labels
- Good spacing
- Helpful descriptions
- Consistent inputs
- Clear required/optional states
- Good validation
- Clear errors
- Loading states
- Success states

Do not put every field inside its own card.

---

# 19. Admin UI

The admin dashboard can remain more functional than the public site.

Keep:
- Clear sections
- Predictable navigation
- Good spacing
- Consistent buttons
- Clear status indicators
- Useful tables where tables make sense

Do not force the decorative cosmic design into every admin component. Admin UI should prioritise usability.

---

# 20. Buttons

Establish a consistent hierarchy.

### Primary
Used for:
- Commission Me
- Adopt Now
- Save
- Create

### Secondary
Used for:
- Cancel
- View
- Edit
- Manage

### Destructive
Used for:
- Delete
- Remove

Buttons should not visually resemble large content cards.

---

# 21. Badges / Status

Create a consistent badge system for:
- Available
- Reserved
- Sold
- Featured
- NSFW
- SFW
- New
- Draft

Keep badges compact. Do not turn statuses into large boxes.

---

# 22. Empty States

Every important list should have a proper empty state.

Examples:

> ✦ No adoptables yet  
> Your next character will appear here.

> ✦ No credits yet  
> The people behind the project will appear here.

Make empty states friendly rather than broken-looking.

---

# 23. Loading States

Use:
- Skeletons
- Subtle cosmic shimmer
- Proper loading indicators

Do not make loading states visually heavier than actual content.

---

# 24. Error States

Errors must be clear and actionable.

Examples:
> Something went wrong loading this image.

> Upload failed. Try again.

Do not silently fail.

Avoid raw technical errors in public UI. Admin interfaces may show useful technical details where appropriate.

---

# 25. Responsive Design

Audit the entire site at:
- Desktop
- Laptop
- Tablet
- Mobile

Do not simply shrink desktop layouts.

Mobile should have intentionally designed:
- Navigation
- Galleries
- Cards
- Buttons
- Forms
- Statistics
- Modals
- Lightboxes

---

# 26. Animation

Keep animation subtle and atmospheric.

Good:
- Gentle glow
- Fade-in
- Small hover movement
- Smooth gallery transitions
- Background star movement if performant

Avoid:
- Excessive bouncing
- Large movement
- Constant pulsing
- Animations that make text difficult to read

The site should feel alive, not distracting.

---

# 27. Space Theme Rules

## KEEP
- Stars
- Nebula
- Purple
- Blue
- Deep navy
- Cosmic glow
- Dark environment
- Futuristic atmosphere

## REDUCE
- Giant black boxes
- Excessive rounded cards
- Heavy borders
- Heavy shadows
- Repetitive components
- Dashboard-like layouts

## ADD
- More negative space
- Better artwork presentation
- Better typography
- Subtle glass surfaces
- Better visual hierarchy
- More intentional cosmic accents

---

# 28. Performance

Do not sacrifice performance for visual effects.

Optimise:
- Background images
- Artwork
- Animations
- Blur effects
- Shadows
- Large galleries

Lazy-load images where appropriate.

Respect reduced-motion preferences.

---

# 29. Accessibility

Maintain or improve:
- Keyboard navigation
- Focus states
- Contrast
- Alt text
- Semantic HTML
- Screen reader labels
- Form accessibility

Do not sacrifice accessibility for the aesthetic.

---

# 30. Existing Functionality Must Stay

This is a UI/UX overhaul, NOT a backend rewrite.

Do not remove or break:
- Authentication
- User accounts
- Admin permissions
- Portfolio
- Services
- Reviews
- Adoptables
- Adoptable pricing
- SFW/NSFW pricing
- Bundle pricing
- Age verification
- Gallery images
- Before/after comparisons
- Featured status
- Visibility
- Sold status
- Reserved status
- Ordering
- Existing database data
- Existing Supabase storage
- Existing API routes unless genuinely required

Preserve existing URLs/routes wherever possible.

---

# 31. Implementation Strategy

Do not redesign one random page at a time without a system.

First:
1. Audit every public page.
2. Audit every admin page.
3. Identify duplicated UI patterns.
4. Identify inconsistent components.
5. Establish new design tokens.
6. Establish typography hierarchy.
7. Establish spacing system.
8. Establish button/badge/input styles.
9. Establish surface/card rules.
10. Establish responsive rules.

Then implement the redesign consistently.

---

# 32. Design Tokens

Create/reuse central tokens for:
- Background colours
- Surface opacity
- Border opacity
- Text colours
- Muted text
- Purple accent
- Blue accent
- Glow intensity
- Radius
- Spacing
- Typography sizes
- Shadows
- Transitions

Do not hard-code slightly different values throughout components.

---

# 33. Before Changing Components

Search the existing project for reusable components.

Reuse and improve existing:
- Buttons
- Cards
- Modals
- Inputs
- Gallery components
- Navigation
- Admin components
- Loading states
- Toasts
- Dialogs

Do not create multiple implementations of the same UI pattern.

---

# 34. Visual Audit Requirement

Before declaring the overhaul complete, inspect every major page visually.

Ask:
- Is there too much UI?
- Are there too many boxes?
- Is artwork the focus?
- Is the cosmic background visible?
- Is the page too dark?
- Is hierarchy obvious?
- Does anything feel cramped?
- Does anything feel unnecessarily huge?
- Does mobile look intentional?
- Does the page feel like Comisioner?

If a section looks like a generic SaaS dashboard, redesign it.

---

# 35. Final Acceptance Criteria

The finished site should feel:

- 🌌 Cosmic
- ✨ Premium
- 💜 Personal
- 🎨 Creator-focused
- 🐾 Friendly
- 🚀 Modern
- 🧹 Clean
- 🌙 Spacious

It should NOT feel:
- Like a generic dashboard
- Like a template
- Like every element is a card
- Crowded
- Box-heavy
- Visually noisy

## Final rule

**The space theme is NOT being removed.**

The goal is:

> **Take the existing Comisioner cosmic identity and make the UI worthy of it.**

Keep the stars. Keep the nebula. Keep the purple/blue atmosphere.

Just stop putting everything inside giant boxes. 💜🌌
