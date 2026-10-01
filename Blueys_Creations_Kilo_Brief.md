# Bluey's Creations — Kilo Website Fix & Improvement Brief

## Project

Website: https://www.blueycomissions.website/

This document is the master task list for cleaning up, fixing, and improving the Bluey's Creations website.

**IMPORTANT:** Do not blindly redesign or rewrite working functionality. Inspect the existing codebase and database first, identify the current implementation, and make changes in a controlled way.

---

# 🚨 CRITICAL RULES

## 1. NO FAKE DATA

This is extremely important.

DO NOT create:

- Fake customers
- Fake reviews
- Fake commission requests
- Fake sales
- Fake adoptables
- Fake statistics
- Fake portfolio projects
- Fake Discord users
- Fake orders
- Fake database records

If there is no real data, show a proper empty state.

Example:

```text
No reviews yet.

Be the first customer to leave a review!
```

NOT:

```text
★★★★★ 4.9/5
Based on 27 reviews
```

unless those reviews actually exist in the database.

---

# 2. DATABASE MUST BE THE SOURCE OF TRUTH

Do not hardcode production information into React components.

Bad:

```ts
const adoptables = [...]
```

Good:

```text
Database → API/server → UI
```

All dynamic information must come from the actual database.

This includes:

- Adoptables
- Adoptable status
- Commission requests
- Reviews
- Portfolio items
- Site settings
- Founder/admin settings
- Availability
- Prices where applicable

---

# 3. DO NOT BREAK EXISTING DATA

Before modifying database schemas:

1. Inspect the current schema.
2. Inspect existing records.
3. Check migrations.
4. Check relationships.
5. Make migrations safely.
6. Do not delete production data just to make the UI work.

If a migration is necessary, make it backwards-compatible where possible.

---

# 4. DO NOT CREATE MULTIPLE SYSTEMS FOR THE SAME THING

There should only be ONE source of truth for:

- Site settings
- Terms
- Commission status
- Adoptable status
- Reviews
- Navigation
- Branding
- User roles
- Founder permissions

Do not create a second parallel system because the first one is inconvenient.

---

# 🚨 PHASE 1 — FIX THE SITE FOUNDATION

## 1. Fix the deployment/version mismatch

The public website appears to contain multiple versions of the site.

Some routes use older branding/navigation while newer routes use the newer Bluey's Creations layout.

Inspect:

```text
/
/services
/portfolio
/adoptables
/nsfw
/faq
/contact
/commission
/pricing
/about
/reviews
/credits
/links
/tos
/privacy
```

Everything must use the same current:

- Branding
- Header
- Navigation
- Footer
- Typography
- Design system
- Theme
- Buttons
- Spacing
- Responsive behaviour

Remove old/legacy layouts.

---

# 2. Create ONE global layout

Create one shared site shell.

It should control:

```text
Header
Navigation
Main content container
Footer
Global announcement/status
Responsive navigation
```

Do not duplicate navigation markup across every page.

---

# 3. Simplify navigation

Main navigation should be approximately:

```text
Home
Services
Portfolio
Adoptables
Pricing
About
FAQ
```

Primary CTA:

```text
Start a Commission
```

Secondary/legal pages should live in the footer:

```text
Contact
Terms
Privacy
Credits
Links
```

NSFW should only appear if the page is actually complete and useful.

---

# 🚨 PHASE 2 — LEGAL PAGES

## 4. Fix `/tos`

The current `/tos` page is incomplete/empty.

It must contain the actual Terms of Service.

There must be ONE canonical Terms of Service page:

```text
/tos
```

Other pages should link to it.

Do not duplicate the entire TOS on Services/Pricing.

Use:

```text
Read the full Terms of Service →
```

instead.

---

## 5. Make legal information consistent

Review:

```text
/tos
/privacy
/faq
/services
/pricing
```

Make sure these do not contradict each other.

Pay particular attention to:

- Refunds
- Deposits
- Revisions
- Source files
- Asset ownership
- Delivery
- Cancellation
- NSFW work
- Commission cancellation
- Chargebacks

There must be one consistent policy.

---

# 🚨 PHASE 3 — COMMISSION SYSTEM

## 6. Rebuild/improve the commission flow

The commission process should be easy to understand.

Recommended flow:

```text
STEP 1
What do you need?

STEP 2
Avatar / Project details

STEP 3
Files & references

STEP 4
Contact details

STEP 5
Review & submit
```

Do not ask unnecessary questions.

---

## 7. Commission form fields

Potential fields:

```text
Name
Discord
Email

Service type
Avatar/base
Platform
PC
Quest
PC + Quest

Description
Requested changes
References
Asset information
Deadline
Budget

Attachments
```

Only show fields that are relevant to the selected service.

---

## 8. Commission submissions must actually save

When the user submits:

```text
Form
 ↓
Validation
 ↓
Server/API
 ↓
Database
 ↓
Confirmation
```

The UI must NOT say:

```text
Submitted!
```

unless the database actually confirms the submission.

Handle:

```text
Success
Validation error
Server error
Database error
Network error
```

properly.

---

# 🚨 PHASE 4 — ADOPTABLES

## 9. Build a proper adoptable system

Adoptables need real statuses.

At minimum:

```text
Available
Pending
Reserved
Sold
```

The database should store the actual status.

The frontend must display the database status.

---

## 10. Adoptable admin controls

The admin/founder panel must allow authorised users to:

```text
Create adoptable
Edit adoptable
Upload artwork
Upload gallery images
Set price
Set description
Set status
Mark as pending
Mark as reserved
Mark as sold
Return to available
Delete/archive
```

Do NOT fake these actions in the frontend.

---

## 11. Adoptable page

Each adoptable should have:

```text
Large artwork
Gallery
Name
Description
Price
Status
What's included
Asset/base information
Credits
Terms
Claim/purchase action
```

Example:

```text
MOCHI

£XX

🟢 AVAILABLE

Description...

Includes:
✓ ...
✓ ...
✓ ...

[Claim Adoptable]
```

---

## 12. Sold adoptables

Sold adoptables should automatically appear in:

```text
Sold Archive
```

Do not manually duplicate the same item into another list.

---

# 🚨 PHASE 5 — PORTFOLIO

## 13. Fix empty portfolio

The portfolio currently has no meaningful public work.

Do not add fake projects.

Instead create a database-backed portfolio system so real work can be added.

Admin should be able to:

```text
Create project
Edit project
Upload images
Set category
Set description
Publish/unpublish
Reorder
Delete/archive
```

Categories could include:

```text
Avatars
Textures
Blender
Unity
Optimisation
Clothing
Other
```

---

# 🚨 PHASE 6 — REVIEWS

## 14. Reviews

Reviews must be real.

Review moderation:

```text
Pending
Approved
Rejected
Hidden
```

Public page should only display approved reviews.

If there are no reviews:

```text
No reviews yet.

Completed a commission with Bluey?
Leave a review!
```

Do not create placeholder reviews.

---

# 🚨 PHASE 7 — NSFW PAGE

## 15. Fix or temporarily hide `/nsfw`

The current NSFW route does not contain useful content.

Either:

### Option A

Build the actual page with:

```text
18+ Notice
Eligibility
Accepted work
Prohibited work
Pricing information
Privacy information
Commission process
Terms
```

OR:

### Option B

Remove/hide the navigation link until the page is complete.

Never leave a mostly empty production page.

---

# 🚨 PHASE 8 — LINKS PAGE

## 16. Fix `/links`

Do not show an empty page.

If there are no configured links, display:

```text
No links have been added yet.
```

Preferably make links database/config driven so they can be edited from the admin panel.

Potential categories:

```text
Socials
Stores
VRChat
Discord
Patreon
Other
```

Only use real links.

---

# 🚨 PHASE 9 — ABOUT PAGE

## 17. Improve About

Keep it personal but concise.

Include:

```text
Who Bluey is
What Bluey creates
Experience
Specialities
Software/tools
PC/Quest support
```

Use actual information only.

Do not invent achievements, years of experience, clients, or statistics.

---

# 🚨 PHASE 10 — CONTACT

## 18. Simplify Contact

Contact should be for:

```text
General questions
Business enquiries
Partnerships
Other questions
```

Commission requests should go through:

```text
/commission
```

Do not duplicate the full commission form on Contact unless there is a strong reason.

---

# 🚨 PHASE 11 — PRICING

## 19. Make pricing easier to understand

Current pricing is structured around:

```text
Light
Standard
Advanced
```

Keep this if it matches the real pricing model, but explain what makes a project fall into each tier.

For example:

```text
Light
Simple edits / small changes

Standard
Multiple changes / clothing / Unity work

Advanced
Complex avatar work / extensive modifications
```

Do not promise fixed prices where the real price is quote-based.

Clearly state:

```text
Prices are estimates.
Final pricing depends on project complexity.
```

if that is actually how commissions work.

---

# 🚨 PHASE 12 — COMMISSION AVAILABILITY

## 20. Make commission status dynamic

Do not hardcode:

```text
Commissions Open
```

into every page.

Create a central setting:

```text
commissionStatus
```

Possible values:

```text
OPEN
LIMITED
CLOSED
```

Optional:

```text
availableSlots
queueCount
estimatedWait
```

The entire website should read from this setting.

Example:

```text
🟢 COMMISSIONS OPEN
```

or:

```text
🟡 LIMITED SLOTS
2 slots remaining
```

or:

```text
🔴 COMMISSIONS CLOSED
```

---

# 🚨 PHASE 13 — FOUNDER / ADMIN SYSTEM

## 21. Founder Center must actually save

The Founder/Admin settings must not just update the frontend temporarily.

When changing a setting:

```text
UI
 ↓
API
 ↓
Database
 ↓
Success response
 ↓
UI refresh
```

After refreshing the page, the value must still exist.

Test:

```text
Change setting
Save
Refresh page
Log out
Log back in
Check setting
```

If the setting disappears, it is not fixed.

---

## 22. Admin permissions

Use proper role/permission checks on the server.

Never rely on frontend visibility as the only security layer.

The server/API must independently verify permissions.

Possible roles:

```text
Founder
Admin
Moderator
Editor
```

Only give each role the permissions it actually needs.

---

# 🚨 PHASE 14 — EMPTY STATES

Every database-driven page needs a proper empty state.

Examples:

### Portfolio

```text
No portfolio projects yet.
```

### Reviews

```text
No reviews yet.
```

### Adoptables

```text
No adoptables are currently available.
```

### Links

```text
No links have been added yet.
```

### Admin

```text
No pending submissions.
```

Never use fake content to make an empty page look populated.

---

# 🚨 PHASE 15 — ERROR HANDLING

Every important page needs:

```text
Loading state
Empty state
Error state
Success state
```

Example:

```text
Something went wrong.

Please try again.
[Retry]
```

Never show raw errors such as:

```text
PrismaClientKnownRequestError
```

to public users.

Log technical errors server-side.

---

# 🚨 PHASE 16 — MOBILE / RESPONSIVE

Test everything on:

```text
Desktop
Tablet
Mobile
```

Pay particular attention to:

- Navigation
- Commission forms
- Image galleries
- Cards
- Tables
- Admin pages
- Modals
- Buttons
- Uploads
- Adoptable pages

No horizontal scrolling.

No elements overflowing the screen.

No desktop-only interactions.

---

# 🚨 PHASE 17 — PERFORMANCE

Check:

```text
Images
Lazy loading
Image sizes
Next.js image optimisation
Fonts
Animations
Unused JavaScript
Unused CSS
```

Do not add unnecessary animations.

The website should feel smooth rather than constantly moving.

---

# 🚨 PHASE 18 — SEO

Every public page should have appropriate:

```text
Title
Description
OpenGraph image
Canonical URL
```

At minimum:

```text
/
 /services
 /portfolio
 /adoptables
 /pricing
 /about
 /faq
 /contact
 /commission
```

Add proper `robots.txt` and sitemap where appropriate.

---

# 🚨 PHASE 19 — 404 / ERROR PAGES

Create proper:

```text
404
500/error
```

pages.

Example:

```text
404

Looks like this page wandered off. 🐾

[Back Home]
```

Do not show a raw Next.js error.

---

# 🚨 PHASE 20 — REMOVE LEGACY/PLACEHOLDER CONTENT

Search the entire codebase for:

```text
Lorem
placeholder
example
test
fake
dummy
picsum
TODO
FIXME
Bluey's Avatar Commissions
BComisioner
old navigation
old branding
```

Anything that is not intentionally production content should be removed.

Especially remove placeholder image providers such as:

```text
picsum.photos
```

from production content.

---

# 🎨 DESIGN DIRECTION

The site should feel like:

```text
Professional
Creative
Friendly
Modern
VRChat-focused
Personal
```

Avoid:

```text
Overly corporate UI
Huge blocks of text
Excessive gradients
Constant particles
Random seasonal effects
Over-animated backgrounds
Generic AI-looking cards
```

The work itself should be the visual focus.

---

# ❌ DO NOT ADD A SEASONAL THEME SYSTEM

Do NOT create or reintroduce:

```text
Halloween theme
Christmas theme
Snow particles
Leaves
Bats
Hearts
Fireworks
Sparkles
Seasonal background effects
```

unless explicitly requested later.

The core website should remain visually stable.

---

# 🎯 FINAL SITE STRUCTURE

Recommended final public structure:

```text
/
├── Home
├── Services
├── Portfolio
├── Adoptables
├── Pricing
├── About
├── FAQ
├── Commission
│
├── Contact
├── Terms
├── Privacy
├── Credits
└── Links
```

Admin:

```text
/admin
├── Dashboard
├── Commissions
├── Adoptables
├── Portfolio
├── Reviews
├── Users
├── Content
├── Site Settings
└── Founder Settings
```

---

# 🧪 FINAL TESTING CHECKLIST

## Public website

```text
[ ] Homepage works
[ ] Navigation consistent
[ ] Footer consistent
[ ] Mobile navigation works
[ ] Services works
[ ] Portfolio works
[ ] Adoptables works
[ ] Pricing works
[ ] About works
[ ] FAQ works
[ ] Commission form works
[ ] Contact works
[ ] Terms works
[ ] Privacy works
[ ] Credits works
[ ] Links works
[ ] 404 works
```

## Database

```text
[ ] No fake records
[ ] No fake statistics
[ ] No fake reviews
[ ] No fake adoptables
[ ] No hardcoded dynamic data
[ ] Existing records preserved
[ ] Save operations persist
[ ] Refresh does not lose data
```

## Admin

```text
[ ] Founder can edit settings
[ ] Settings persist
[ ] Commission requests appear
[ ] Adoptables can be created
[ ] Adoptable status can change
[ ] Portfolio can be managed
[ ] Reviews can be moderated
[ ] Permissions are enforced server-side
```

## Responsive

```text
[ ] Desktop
[ ] Laptop
[ ] Tablet
[ ] Mobile
```

## Production

```text
[ ] No console-breaking errors
[ ] No placeholder content
[ ] No old branding
[ ] No fake data
[ ] No broken links
[ ] No empty production pages unless intentional
[ ] No raw database errors exposed
[ ] No debug UI
[ ] No development-only buttons
```

---

# 🚨 MOST IMPORTANT INSTRUCTION TO KILO

Do NOT try to fix everything by randomly rewriting the project.

First inspect the existing:

```text
Project structure
Database schema
Prisma schema
API routes
Server actions
Authentication
Admin permissions
Site settings
Existing components
Existing layouts
Existing pages
```

Then make a clear list of what currently exists and what is broken.

Fix the **foundation and data flow first**, then the UI.

The final website must have:

```text
ONE design system
ONE layout
ONE navigation
ONE database source of truth
ONE commission system
ONE adoptables system
ONE admin system
ONE permission system
ONE Terms page
NO fake data
NO placeholder production content
NO legacy branding
```

Do not mark a feature as complete because the button visually works.

A feature is only complete when:

```text
Frontend
    ↓
Server/API
    ↓
Database
    ↓
Persistent data
    ↓
Refresh
    ↓
Still works
```
