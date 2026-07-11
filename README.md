# Bluey's Avatar Commissions

A modern, production-ready Next.js website for VRChat avatar commissions, featuring portfolio management, review system, admin dashboard, and age-gated NSFW content.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase credentials to .env.local

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Required Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Important:** The `SUPABASE_SERVICE_ROLE_KEY` is required for server-side admin operations (portfolio uploads, reviews, site images, etc.). Get this from Supabase Dashboard → Project Settings → API → Service Role Key.

## Supabase Setup

### 1. Create Storage Bucket

1. Go to Supabase Dashboard → Storage → New bucket
2. Name: `portfolio-images`
3. Public bucket: **ON**
4. Click Create

### 2. Run Database Schema

1. Go to Supabase Dashboard → SQL Editor → New query
2. Paste the contents of `supabase/schema.sql`
3. Click Run

This creates all tables, RLS policies, and storage policies.

## Features

### Public Website

- **Hero Section** - Featured image with CTAs, badges, and stats
- **Portfolio Gallery** - Masonry layout with lightbox viewer, prev/next navigation, and escape key support
- **Services Section** - Avatar Editing, Blender Work, Unity Setup with managed images
- **Process Section** - Step-by-step commission workflow
- **Reviews Section** - Client reviews with star ratings and optional images
- **Pricing Section** - SFW pricing tiers with NSFW pricing link
- **FAQ Section** - Common questions with hover effects
- **Commission Queue** - Public queue page showing availability, slots, active commissions, progress, and wait times
- **Statistics Section** - Animated counters showing completed commissions, happy clients, ratings, experience, and more
- **Contact Form** - Commission request form
- **NSFW Section** - Age-gated adult content with separate portfolio and pricing

### Admin Dashboard (`/admin`)

Access with password: `blueyadmin`

- **Portfolio Management** - Upload, reorder, delete portfolio images with server-side storage
- **Site Images** - Manage hero and service images (Avatar Editing, Blender Work, Unity Setup)
- **NSFW Content** - Separate portfolio management for adult content
- **Queue Management** - Commission queue with status, slots, progress tracking, and wait times
- **Pricing Editor** - Edit pricing tiers with NSFW flag support
- **FAQ Editor** - Manage FAQ items
- **Process Editor** - Update workflow steps
- **Reviews Management** - Approve, edit, delete client reviews
- **Site Info** - Update site name, tagline, description, Discord

### Age Verification System

- Birthday/age input with quick-select buttons
- 18+ verification check with localStorage persistence (30 days)
- Reusable `AgeVerifier` component for NSFW sections
- Client-side age calculation

### Portfolio System

- Server-side upload via `/api/portfolio/upload`
- Database records created automatically
- Masonry CSS columns layout for natural image stacking
- Lightbox with prev/next/close/escape controls
- Drag-and-drop upload support
- Upload progress indicators
- Retry failed uploads
- Delete and reorder functionality

### Reviews System

- Public review submission form with optional image upload
- Star rating (1-5)
- Pending/approved workflow
- Admin can preview, approve, edit, or delete reviews
- Optional commission image upload
- Success confirmation messages

### NSFW System

- Separate `nsfw_portfolio_images` table
- Age verification gate
- NSFW-specific pricing tiers (`is_nsfw` flag on pricing_tiers)
- Admin-only NSFW portfolio management
- Public gallery with masonry layout and lightbox

### Server-Side API Routes

All writes use the Supabase service-role key to bypass RLS:

- `POST /api/portfolio/upload` - Upload portfolio images
- `DELETE /api/portfolio` - Delete portfolio images
- `POST /api/portfolio/reorder` - Reorder portfolio images
- `POST /api/admin/save` - Save all admin data
- `POST /api/reviews` - Submit review (pending status)
- `POST /api/site-images` - Upload site images (hero, services)
- `DELETE /api/site-images` - Delete site images
- `POST /api/upload` - Generic upload for review images
- `POST /api/nsfw/upload` - Upload NSFW portfolio images
- `DELETE /api/nsfw` - Delete NSFW images
- `POST /api/nsfw` - Reorder NSFW images

## Database Schema

### Tables

- `portfolio_images` - SFW portfolio images with sort order
- `nsfw_portfolio_images` - NSFW portfolio images with sort order
- `reviews` - Client reviews with `display_name`, `rating`, `review_text`, `status` (pending/approved), `image_url`
- `pricing_tiers` - Pricing tiers with `is_nsfw` flag
- `faq_items` - FAQ entries
- `workflow_steps` - Process steps
- `site_config` - Site metadata (name, tagline, description, discord)
- `site_images` - Managed images (hero, service images)

### Row Level Security

- Public read access for all tables
- Authenticated write access for admin operations via service-role key
- Storage policies for public uploads/reads on `portfolio-images` bucket

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Styling:** Tailwind CSS with custom CSS variables
- **Icons:** Lucide React
- **Fonts:** Inter (Google Fonts)

## Project Structure

```
src/
├── app/
│   ├── admin/page.tsx           # Admin dashboard
│   ├── nsfw/page.tsx            # NSFW gallery + pricing
│   ├── portfolio/page.tsx       # Public portfolio
│   ├── reviews/page.tsx         # Public reviews
│   ├── page.tsx                 # Homepage
│   └── api/                     # Server API routes
├── components/
│   ├── AgeVerifier.tsx          # Age verification modal
│   ├── Hero.tsx                 # Hero section
│   ├── PortfolioAdmin.tsx       # Admin portfolio manager
│   ├── NsfwPortfolioAdmin.tsx   # Admin NSFW manager
│   ├── SiteImagesAdmin.tsx      # Admin site images manager
│   ├── ClientReviewForm.tsx     # Public review submission
│   ├── FeaturedWork.tsx         # Homepage portfolio preview
│   ├── Navbar.tsx               # Navigation
│   └── Footer.tsx               # Footer
├── lib/
│   ├── supabase.ts              # Supabase clients (anon + admin)
│   └── db.ts                    # Database helper functions
├── data/
│   └── site.ts                  # Static site data and nav links
└── styles/
    └── globals.css              # Global styles and CSS variables

supabase/
└── schema.sql                   # Database schema and migrations
```

## Key Design Decisions

1. **Server-side writes only** - All database/storage writes go through API routes using the service-role key. The anon key client is client-side only and cannot write due to RLS policies.

2. **Age verification stored in localStorage** - No server-side session required. Verification lasts 30 days.

3. **Masonry layout for portfolios** - CSS columns (`columns-1 → sm:columns-2 → lg:columns-3`) with `break-inside-avoid` for natural image stacking without fixed heights.

4. **Separate SFW/NSFW storage** - NSFW content uses a separate table (`nsfw_portfolio_images`) and storage path (`nsfw/`) for clean separation.

5. **Review status workflow** - Reviews are saved as `pending` by default. Admin must approve before they appear publicly.

## Deployment

### Vercel (Recommended)

1. Push this repository to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

### Manual Deployment

```bash
npm run build
npm run start
```

Make sure to set environment variables in your hosting platform.

## Notes

- The admin password is hardcoded as `blueyadmin` in `src/app/admin/page.tsx`
- Age verification is client-side only and can be cleared by clearing localStorage
- All images are stored in the `portfolio-images` Supabase Storage bucket
- The site uses a dark theme with CSS custom properties for easy theming
