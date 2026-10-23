# Bluey's Creations — Website Update Script

## Overall Goal

Update the website so the entire experience feels **consistent, polished, space-themed, personal to Bluey, and intentionally designed** rather than looking like a generic AI-generated commission website.

Do **not** redesign each page independently. All pages should share the same visual system, spacing, typography, components, backgrounds, animations, buttons, and navigation.

---

# 1. Global Space Theme

The entire website needs a much stronger **cosmic / deep-space identity**.

Use:

- Deep navy / near-black backgrounds
- Subtle blue and purple space gradients
- Small stars scattered throughout the background
- Very subtle nebula/glow effects
- Soft blue/purple ambient lighting around important cards
- Dark glass-style cards where appropriate
- Small constellation/star details
- Smooth hover animations
- Subtle cosmic particles rather than excessive animations

The space theme should be visible across:

- Home
- Services
- Portfolio
- Adoptables
- FAQ
- TOS
- Credits
- Contact/commission pages
- Footer
- Navigation

Do **not** make every section look like a giant glowing sci-fi panel. Keep it clean and professional.

---

# 2. Fix Services Consistency

The `/services` page currently does **not match the services shown on the Home page**.

There must be **one shared source of truth** for commission tiers.

Do not maintain separate hardcoded service lists for Home and Services.

Create/reuse a shared data structure containing:

## Light Blender Work

**£15–£25**

- Accessory additions
- Simple clothing fitting
- Texture recolours
- Material edits
- Small Blender fixes
- Minor Unity setup

## Standard Avatar Work

**£30–£55**

- Multiple asset additions
- Clothing fitting
- Hair swaps
- Toggle setup
- Material setup
- Weight painting

## Advanced Avatar Work

**£60–£90**

- Full avatar overhauls
- Large Blender edits
- Heavy customisation
- Multiple clothing pieces
- Complex weight painting
- Extensive optimisation

The Home page and `/services` must pull from the **same data**.

If a tier changes later, it should update everywhere automatically.

---

# 3. Improve Services Page

The Services page should feel like a proper commission catalogue rather than a basic pricing section.

Include:

- Page introduction
- Commission tiers
- Clear descriptions
- What's included
- Pricing
- "Select Tier" / commission CTA
- Additional services
- Optional extras
- FAQ preview
- Clear final commission CTA

Each tier should have:

- Icon
- Name
- Price
- Short description
- Included work
- Clear button
- Hover state
- Consistent card height

Keep the **Standard Avatar Work** "Most Popular" indicator if it exists.

Do not use awkward button text such as:

> Most Popular — Select

Instead use:

> Select Standard

with the "Most Popular" badge displayed separately above the card.

---

# 4. Add Missing Credit Page

Create:

`/credits`

This page should be a proper website page and not simply a paragraph at the bottom of Home.

## Page title

**Credits**

Explain that the website uses various tools, libraries, assets, fonts, icons, and external resources and that proper credit is given to their creators.

Organise credits into sections such as:

### Website & Development

Credit the technologies and libraries used to build the website.

### Icons

Clearly credit the icon library used by the website.

### Fonts

List any external fonts used.

### Visual Assets

List any external backgrounds, textures, illustrations, stock resources, or other visual assets.

### Special Thanks

Optional section for people/resources that helped with the website.

Each credit should have:

- Name
- What it was used for
- Link where appropriate

Make the page visually match the rest of the website.

---

# 5. FAQ Page Needs a Complete Upgrade

The current `/faq` page feels too basic.

Redesign it into a proper searchable/organised FAQ experience.

## Add categories

For example:

- General
- Commissions
- Pricing
- Blender
- Unity
- Avatar Uploads
- Delivery
- Revisions
- Payments
- Refunds

Use expandable accordion questions.

Questions should be easy to scan.

Example:

**How long do commissions take?**

Answer explaining that turnaround depends on the complexity and current commission queue.

---

## Add FAQ Search

Add a small search box:

> Search questions...

Typing should filter FAQ questions immediately.

If there are no results:

> No questions found. Try another search or contact Bluey.

---

## Add Useful CTA

At the bottom:

> Still have questions?

**Can't find what you're looking for?**

[Contact Bluey]

---

# 6. TOS Must Be Clearly Seeable

The Terms of Service currently aren't prominent enough.

Create a dedicated:

`/tos`

page.

The TOS should be fully readable directly on the website.

**Do not hide the TOS behind a PDF download.**

Use:

- Proper headings
- Sections
- Numbered rules where appropriate
- Readable typography
- Good spacing
- Sticky/compact table of contents if useful

Suggested structure:

## Terms of Service

### 1. General

### 2. Commission Requests

### 3. Pricing & Payment

### 4. What I Will / Won't Work On

### 5. Revisions

### 6. Delivery

### 7. Cancellations

### 8. Refunds

### 9. Asset Ownership & Usage

### 10. Commercial Usage

### 11. Client Responsibilities

### 12. Portfolio Rights

### 13. Uploads & Files

### 14. Termination

### 15. Changes to These Terms

### 16. Contact

Use the **actual existing TOS wording/content** where available.

Do not invent legal promises or rewrite important legal terms without preserving their meaning.

---

# 7. Make TOS Accessible Everywhere

Add a visible TOS link to:

- Footer
- Commission/application page
- Checkout/payment flow if applicable
- Services page
- FAQ page

Before submitting a commission, provide a clear acknowledgement such as:

> I have read and agree to the Terms of Service.

with a link to `/tos`.

Do not make users hunt through the website to find the terms.

---

# 8. Navigation

Update the navigation/footer so important pages are discoverable.

Include:

- Home
- Services
- Portfolio
- Adopt
- FAQ
- TOS
- Credits
- Contact

Do not overcrowd the main navigation.

Less frequently visited pages such as Credits and TOS can live under a **More** menu if needed, but they must remain easy to find.

---

# 9. Footer Redesign

The footer should feel like part of the website rather than an afterthought.

Include:

## Bluey's Creations

Short description.

## Navigation

- Home
- Services
- Portfolio/Nsfw
- Adopt
- FAQ

## Information

- TOS
- Credits
- Privacy

## Contact

Relevant commission/contact links.

Add a subtle space background/star field.

Include copyright information.

---

# 10. Fix Admin Page UI/UX

The Admin page is currently **very broken and visually poor**.

The `/admin` page needs a proper UI/UX overhaul while keeping its existing functionality and permissions intact.

Do not just change colours or add more cards.

The Admin page should feel like a proper administration dashboard.

Improve:

- Overall layout
- Navigation
- Sidebar/header
- Dashboard structure
- Spacing
- Typography
- Cards
- Tables
- Buttons
- Forms
- Status indicators
- Tabs/sections
- Empty states
- Loading states
- Error states
- Mobile responsiveness

The Admin interface should use the same **Bluey's Creations space theme**, but it should still be practical and easy to use.

Do not make the admin panel overly flashy.

## Admin Dashboard

Clearly organise important areas such as:

- Overview
- Commissions
- Portfolio
- Adoptables
- Users
- Reports
- Settings
- Other existing admin tools

Only show sections that actually exist in the current application.

Do not create fake admin functionality.

## Admin UX

Make sure:

- Navigation is obvious
- Important actions are easy to find
- Destructive actions are clearly distinguished
- Tables are readable
- Forms are properly labelled
- Statuses are understandable
- Loading states exist
- Errors are clearly displayed
- Empty states are useful
- Admin pages do not feel cramped
- The layout works on smaller screens

**Do not break existing authentication, permissions, or admin functionality while redesigning the UI.**

First inspect the existing Admin implementation and preserve the underlying functionality.

---

# 11. Remove Generic AI-Looking Design

Avoid:

- Excessive gradients
- Huge glowing borders
- Random rounded rectangles everywhere
- Generic SaaS wording
- Repeated identical cards
- Excessive emojis
- Giant hero text with no personality
- Overuse of glassmorphism
- Sections that all look identical

The website should feel like **Bluey's actual commission site**, not an AI-generated startup landing page.

Use personality in the wording while keeping it professional.

---

# 12. Responsive Design

Check everything at:

- Desktop
- Laptop
- Tablet
- Mobile

Specifically verify:

- Pricing cards don't overflow
- Navigation works properly
- FAQ accordions fit mobile screens
- TOS text remains readable
- Credits links don't overflow
- Buttons don't become cramped
- Admin dashboard works on mobile
- Admin tables remain usable
- Space effects don't cause performance issues

---

# 13. Accessibility

Make sure:

- Buttons have clear labels
- Links are distinguishable
- Keyboard navigation works
- Accordions are keyboard accessible
- Focus states are visible
- Images have useful alt text
- Text has sufficient contrast
- Animations respect `prefers-reduced-motion`

---

# 14. Performance

Do not add huge animated backgrounds or expensive effects that hurt performance.

Use:

- Optimised images
- Next.js image optimisation where appropriate
- CSS effects where possible
- Lightweight star/particle effects
- Lazy loading for below-the-fold images

Avoid unnecessary client-side JavaScript.

---

# 15. Important Implementation Rule

**Do not create separate versions of the same information.**

Services, pricing, FAQ categories, navigation links, and other repeated website content should use shared components/data wherever possible.

For example:

Shared commission data

        ↓

Home Services Section

        ↓

Services Page

        ↓

Commission Selection

Changing a commission tier once should update every location where that tier appears.

---

# 16. Final Verification

After implementing everything:

## Home

- Space theme present
- Services match `/services`
- Credit page linked
- TOS accessible

## Services

- Same pricing/data as Home
- Better presentation
- Consistent styling
- Commission CTA works

## FAQ

- Redesigned
- Search works
- Accordions work
- Categories work
- Contact CTA works

## TOS

- Dedicated `/tos` page
- Fully readable
- Proper sections
- Linked from footer/navigation
- Linked from commission flow

## Credits

- Dedicated `/credits` page
- Properly organised
- All relevant resources credited
- Consistent space design

## Admin

- Admin page UI/UX properly redesigned
- Existing admin functionality still works
- Existing permissions/authentication still work
- Dashboard is organised
- Navigation is clear
- Tables/forms are usable
- Loading and error states work
- Mobile layout works
- No unnecessary fake admin features
- Admin page matches the overall website theme

## NSFW

- NSFW profile/portfolio functionality has not been accidentally removed
- Existing NSFW functionality remains compatible with the website
- NSFW content remains appropriately separated from normal portfolio content
- Existing NSFW visibility rules are preserved
- NSFW-related pages/components do not produce errors

## Global

- Navigation consistent
- Footer consistent
- Space theme consistent
- Mobile responsive
- No broken links
- No duplicate service data
- No console errors
- No unnecessary AI-looking UI

**Do not stop after changing the Home page. Check the actual `/services`, `/faq`, `/tos`, `/credits`, and `/admin` pages and make sure they all feel like parts of the same website.**