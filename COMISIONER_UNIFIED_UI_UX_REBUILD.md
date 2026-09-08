# Comisioner — Unified UI/UX Rebuild

## IMPORTANT

This is a **whole-application UI/UX rebuild**, not a homepage facelift.

Comisioner should feel like **one complete, polished product** where every page uses the same visual language, spacing, components, interactions, and hierarchy.

Use **Bluey's Avatar Commissions** as a reference for consistency and simplicity, but **DO NOT copy its exact design**. Keep Comisioner's own identity and especially the **space/cosmic theme**.

Reference: https://www.blueycomissions.website/

---

# 1. REMOVE THE UGLY FULL-WIDTH TOP LINE

The current plain horizontal line across the top/header area is ugly and makes the UI feel rigid and generic.

**Remove it.**

Do not replace it with another obvious full-width line.

Avoid using a giant:

- `border-top`
- `border-bottom`
- `<hr>`
- 1px full-width separator

as the main visual separation.

Instead, separate areas through:

- spacing
- transparency
- backdrop blur
- subtle shadows
- faint glow
- soft gradients
- atmospheric nebula effects
- background depth

The separation should be **felt rather than drawn**.

If a border is genuinely needed for a small component, keep it subtle and local.

---

# 2. KEEP THE COSMIC IDENTITY

The space/cosmic theme is staying.

Comisioner should feel like:

**space + creator studio + premium portfolio + modern web app**

Keep:

- deep navy/black backgrounds
- purple/blue atmospheric glow
- subtle stars
- nebula gradients
- soft lighting
- transparent/low-opacity surfaces
- controlled glow
- clean typography

Do not turn it into a plain SaaS dashboard, flat purple website, or generic glassmorphism template.

Do not make everything glow.

---

# 3. ONE DESIGN SYSTEM FOR THE ENTIRE APPLICATION

Create one shared design system first.

Every page must use the same system for:

- typography
- headings
- spacing
- page widths
- buttons
- links
- navbar
- footer
- section headings
- cards
- glass surfaces
- image frames
- badges
- tags
- inputs
- selects
- checkboxes
- toggles
- tabs
- modals
- dropdowns
- tooltips
- alerts
- toasts
- loading states
- empty states
- error states
- pagination
- breadcrumbs
- page headers

Do not independently redesign each page.

---

# 4. STOP MAKING EVERYTHING A CARD

The UI currently feels too crowded because too many things are wrapped in rounded rectangles.

Do NOT make every section:

`[ CARD ] [ CARD ] [ CARD ]`

Use cards only when they actually improve grouping.

Prefer:

- whitespace
- typography
- image composition
- open layouts
- subtle backgrounds
- transparent surfaces
- atmospheric depth
- intentional section spacing

The site should feel more like a polished creator portfolio/studio and less like an admin dashboard.

---

# 5. REMOVE THE GIANT STAT BOX LOOK

Do not use giant dashboard-style statistic cards.

Instead of:

`120 Projects | 42 Reviews | 15 Services`

as three huge boxes, use a lightweight information row or integrate the information naturally into the hero/content.

Stats should support the design, not dominate it.

---

# 6. NAVIGATION

Create one consistent navbar across the public application.

It should be:

- clean
- compact
- easy to scan
- responsive
- atmospheric
- not overloaded with borders
- not surrounded by unnecessary boxes

Desktop should have:

- brand/logo
- primary navigation
- clear CTA
- sensible spacing

Mobile should have:

- clean menu button
- proper mobile navigation panel
- no cramped links
- no horizontal overflow

Active navigation can use subtle glow, text emphasis, or background tint.

Do not use another giant horizontal line.

---

# 7. PAGE HEADERS

All pages should use the same page-header structure:

Small eyebrow/category  
# Page Title  
Short description

Keep consistent:

- heading scale
- spacing
- max width
- eyebrow style
- paragraph width

---

# 8. HERO

Hero sections should feel spacious and atmospheric.

Avoid stuffing the hero with:

- giant cards
- excessive statistics
- too many badges
- multiple boxed sections
- unnecessary borders

Use:

- strong headline
- short supporting copy
- primary CTA
- secondary CTA
- subtle cosmic background
- portfolio imagery where appropriate
- small supporting metadata

---

# 9. PORTFOLIO

Portfolio should be image-led.

Prioritize:

- artwork
- avatars
- project imagery
- large previews
- clean categories
- simple filters

Avoid multiple nested cards around images.

Images should feel like the content.

Keep existing lightbox functionality and improve:

- transitions
- loading
- keyboard navigation
- mobile behavior
- captions/details
- close controls

---

# 10. SERVICES

Services should be easy to scan.

Use:

- clear titles
- descriptions
- pricing where applicable
- small metadata
- CTA

Do not make every service an enormous rounded card.

---

# 11. ADOPTABLES

Keep **all existing Adoptables functionality and data**.

Do not remove backend features.

Improve the presentation with:

- image-first listings
- clean pricing
- availability
- species/type
- tags
- featured state
- SFW/NSFW handling
- galleries
- detail pages

Adoptables must visually belong to the same design system.

---

# 12. CREDITS

Credits should feel like a real public website page, not an admin database.

Use:

- avatar
- name
- contribution/category
- optional links
- short description
- tasteful layout

Avoid a giant wall of cards.

---

# 13. PRICING

Make pricing easy to compare.

Use:

- clear price hierarchy
- service name
- what's included
- CTA
- optional add-ons

Do not make every price a giant glowing box.

---

# 14. FAQ

Use a clean, accessible accordion.

Questions should have:

- clear typography
- good spacing
- subtle hover/focus states

Do not put every FAQ inside a giant card.

---

# 15. REVIEWS

Reviews should feel human.

Use:

- avatar
- name
- review text
- rating if currently supported
- date if useful

Avoid giant dashboard widgets.

---

# 16. CONTACT / COMMISSION FORMS

Forms should feel premium and simple.

Use:

- clear labels
- consistent inputs
- helpful descriptions
- proper errors
- required indicators
- upload progress where applicable
- success feedback
- mobile-friendly layouts

Avoid excessive borders around every field group.

---

# 17. FOOTER

Create one shared footer for the public site.

Keep it:

- useful
- compact
- atmospheric
- easy to scan

Use spacing and typography rather than a giant boxed footer.

---

# 18. MICRO-INTERACTIONS

Add subtle polish:

- hover transitions
- button feedback
- image hover
- modal transitions
- toast animations
- loading transitions
- clear focus states

Do not over-animate.

---

# 19. RESPONSIVE DESIGN

Check every page on:

- desktop
- laptop
- tablet
- mobile

Fix:

- overflow
- cramped layouts
- giant headings
- broken grids
- navigation
- forms
- galleries
- modals
- buttons
- spacing

Do not simply shrink desktop components. Intentionally redesign layouts for mobile.

---

# 20. ACCESSIBILITY

Keep:

- keyboard navigation
- visible focus states
- readable contrast
- semantic HTML
- accessible buttons
- accessible modals
- accessible labels
- reduced-motion support
- image alt text

Cosmic glow must never hurt readability.

---

# 21. TECHNICAL ORDER

Before redesigning individual pages:

1. Inspect the existing component structure.
2. Find duplicated UI patterns.
3. Create shared design tokens.
4. Create/rework shared components.
5. Update global styling.
6. Update Navbar.
7. Update Footer.
8. Update shared buttons/forms/surfaces.
9. Migrate every public page to the system.

Do not create ten different implementations of the same component.

---

# 22. DO NOT BREAK FUNCTIONALITY

This is primarily a UI/UX rebuild.

Do not unnecessarily rewrite:

- Supabase logic
- authentication
- database logic
- uploads
- adoptable data
- portfolio data
- commission logic
- admin functionality
- NSFW age gating
- payment/access restrictions
- API routes

If something works, preserve it.

---

# 23. AUDIT EVERY PUBLIC ROUTE

At minimum check:

- Home
- Portfolio
- Services
- Adoptables
- Adoptable detail
- Credits
- Pricing
- Links
- NSFW
- FAQ
- Reviews
- Contact
- Commission
- About
- Terms
- Privacy
- every other public route currently present

Also check:

- loading states
- error states
- not-found
- empty states
- modals
- mobile menus
- notifications

---

# 24. IT MUST FEEL LIKE ONE WEBSITE

When moving between:

Home → Portfolio → Services → Adoptables → Credits → Pricing → FAQ → Reviews → Contact

it should immediately feel like the same product.

Not:

- Home = one design
- Portfolio = another
- Adoptables = dashboard
- Pricing = card grid
- Credits = database page
- Contact = form template

Instead:

**ONE COMISIONER DESIGN SYSTEM → EVERY PAGE**

---

# 25. THE VISUAL GOAL

Do not interpret this as “add more decoration.”

The goal is:

**Make everything more intentional.**

Less:

- boxes
- borders
- giant stats
- random separators
- duplicated styles
- cramped content
- unnecessary decoration

More:

- hierarchy
- whitespace
- imagery
- typography
- atmosphere
- consistency
- clear interactions
- subtle depth

---

# 26. ACTUALLY IMPLEMENT IT

This is critical.

Do not only:

- audit
- describe
- suggest
- create a plan
- make unused components

Actually modify the existing source code.

The final result must be visible in the running application.

---

# 27. VERIFY EVERYTHING

After implementation:

1. Run the project.
2. Check every public route.
3. Check desktop.
4. Check mobile.
5. Check navigation.
6. Check modals.
7. Check forms.
8. Check portfolio/gallery.
9. Check Adoptables.
10. Check Credits.
11. Check loading/error/empty states.
12. Search for leftover full-width horizontal lines.
13. Search for duplicated card styles.
14. Search for inconsistent spacing.
15. Fix pages that still look like the old UI.

---

# 28. FINAL ACCEPTANCE CHECKLIST

- [ ] Plain full-width top line is gone.
- [ ] No replacement giant decorative line was added.
- [ ] Cosmic theme remains.
- [ ] Entire app uses one coherent design system.
- [ ] Navbar is consistent everywhere.
- [ ] Footer is consistent everywhere.
- [ ] Typography is consistent.
- [ ] Buttons are consistent.
- [ ] Forms are consistent.
- [ ] Cards/surfaces are consistent.
- [ ] UI does not make everything a card.
- [ ] Giant stat boxes are removed/reworked.
- [ ] Portfolio is image-led.
- [ ] Adoptables feels like part of the same website.
- [ ] Credits feels like part of the same website.
- [ ] Pricing feels like part of the same website.
- [ ] FAQ/reviews/contact match the same visual language.
- [ ] Mobile layouts are intentionally designed.
- [ ] Existing functionality still works.
- [ ] No unnecessary backend/data functionality was removed.
- [ ] Site feels spacious rather than crowded.
- [ ] Site feels premium rather than dashboard-like.
- [ ] Cosmic atmosphere remains without overwhelming the content.

## FINAL DESIGN GOAL

Think:

**“A polished cosmic creator studio.”**

Not:

**“A dashboard made of rounded boxes.”**

And absolutely NOT:

**“A website with a random straight line separating everything.”**
