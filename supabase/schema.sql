-- Supabase schema for Bluey's Avatar Commissions
-- Run this in: Supabase Dashboard → SQL Editor → New query → Paste → Run

-- =============================================================================
-- STORAGE BUCKET (create manually first)
-- =============================================================================
-- Go to: Supabase Dashboard → Storage → New bucket
-- Name: portfolio-images
-- Public bucket: ON
-- Then run the storage policy section below
--
-- IMPORTANT: If uploads fail with "Bad Request" or "StorageApiError":
-- 1. Confirm the bucket name is exactly: portfolio-images
-- 2. Ensure the bucket is set to Public
-- 3. Run the storage policy SQL below
-- 4. Check bucket limits and file size settings
-- =============================================================================

-- =============================================================================
-- TABLES
-- =============================================================================

-- Simple portfolio images — just URLs, no naming required
CREATE TABLE IF NOT EXISTS portfolio_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  category TEXT DEFAULT 'VRChat Avatars',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client reviews with approval workflow
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  review_text TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pricing tiers
CREATE TABLE IF NOT EXISTS pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '✨',
  price TEXT NOT NULL,
  badge TEXT,
  popular BOOLEAN DEFAULT FALSE,
  features TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  is_nsfw BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FAQ items
CREATE TABLE IF NOT EXISTS faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow / process steps
CREATE TABLE IF NOT EXISTS workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emoji TEXT DEFAULT '📝',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site config key-value store
CREATE TABLE IF NOT EXISTS site_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Managed site images
CREATE TABLE IF NOT EXISTS site_images (
  key TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NSFW portfolio images (separate from SFW)
CREATE TABLE IF NOT EXISTS nsfw_portfolio_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  path TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commission queue items
CREATE TABLE IF NOT EXISTS queue_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  stage TEXT DEFAULT 'Request Received',
  progress INTEGER DEFAULT 0,
  estimated_completion TEXT,
  status TEXT DEFAULT 'active',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social links / dynamic links page
CREATE TABLE IF NOT EXISTS social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- NEW TABLES FOR DYNAMIC CONTENT
-- =============================================================================

-- Hero / homepage hero content
CREATE TABLE IF NOT EXISTS hero_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  primary_button_text TEXT NOT NULL DEFAULT '',
  primary_button_url TEXT NOT NULL DEFAULT '',
  secondary_button_text TEXT NOT NULL DEFAULT '',
  secondary_button_url TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  image_alt TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Homepage statistics (dynamic, no fake data)
CREATE TABLE IF NOT EXISTS homepage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL DEFAULT '',
  value TEXT NOT NULL DEFAULT '',
  suffix TEXT DEFAULT '',
  sublabel TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services / service cards
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  emoji TEXT DEFAULT '',
  image_url TEXT,
  desc TEXT NOT NULL DEFAULT '',
  features TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FBX Mashup portfolio entries
CREATE TABLE IF NOT EXISTS fbx_mashups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  base_avatar TEXT NOT NULL DEFAULT '',
  parts_used TEXT[] DEFAULT '{}',
  changes_made TEXT[] DEFAULT '{}',
  software_used TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  before_image_url TEXT,
  after_image_url TEXT,
  description TEXT NOT NULL DEFAULT '',
  status TEXT DEFAULT 'completed',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Before ordering checklist items
CREATE TABLE IF NOT EXISTS before_ordering_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emoji TEXT DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  desc TEXT NOT NULL DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Terms of Service sections
CREATE TABLE IF NOT EXISTS tos_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  icon TEXT DEFAULT '',
  items TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Navigation menu items
CREATE TABLE IF NOT EXISTS navigation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL DEFAULT '',
  href TEXT NOT NULL DEFAULT '',
  icon TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_external BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Website settings
CREATE TABLE IF NOT EXISTS website_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio categories
CREATE TABLE IF NOT EXISTS portfolio_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commission form fields configuration
CREATE TABLE IF NOT EXISTS commission_form_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '',
  label TEXT NOT NULL DEFAULT '',
  placeholder TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'text',
  required BOOLEAN DEFAULT FALSE,
  options TEXT[] DEFAULT '{}',
  max_size_mb INTEGER DEFAULT 10,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media library entries
CREATE TABLE IF NOT EXISTS media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL,
  path TEXT,
  type TEXT DEFAULT 'image',
  alt_text TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Homepage section ordering / visibility
CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL DEFAULT '',
  label TEXT NOT NULL DEFAULT '',
  visible BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- MIGRATIONS
-- =============================================================================

-- Migrate portfolio_images to add category column
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'portfolio_images') THEN
    BEGIN ALTER TABLE portfolio_images ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'VRChat Avatars'; EXCEPTION WHEN others THEN NULL; END;
  END IF;
END $$;

-- Migrate reviews table to new schema if it already exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews') THEN
    -- Drop old columns if they exist
    BEGIN ALTER TABLE reviews DROP COLUMN IF EXISTS name; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE reviews DROP COLUMN IF EXISTS text; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE reviews DROP COLUMN IF EXISTS star_rating; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE reviews DROP COLUMN IF EXISTS approved; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE reviews DROP COLUMN IF EXISTS project; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE reviews DROP COLUMN IF EXISTS avatar; EXCEPTION WHEN others THEN NULL; END;

    -- Add new columns if they do not exist
    BEGIN ALTER TABLE reviews ADD COLUMN IF NOT EXISTS display_name TEXT; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE reviews ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 5; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE reviews ADD COLUMN IF NOT EXISTS review_text TEXT; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE reviews ADD COLUMN IF NOT EXISTS image_url TEXT; EXCEPTION WHEN others THEN NULL; END;
  END IF;
END $$;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE portfolio_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE nsfw_portfolio_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE fbx_mashups ENABLE ROW LEVEL SECURITY;
ALTER TABLE before_ordering_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tos_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public read portfolio_images" ON portfolio_images;
  DROP POLICY IF EXISTS "Authenticated write portfolio_images" ON portfolio_images;
  DROP POLICY IF EXISTS "Public read reviews" ON reviews;
  DROP POLICY IF EXISTS "Authenticated write reviews" ON reviews;
  DROP POLICY IF EXISTS "Public read pricing_tiers" ON pricing_tiers;
  DROP POLICY IF EXISTS "Authenticated write pricing_tiers" ON pricing_tiers;
  DROP POLICY IF EXISTS "Public read faq_items" ON faq_items;
  DROP POLICY IF EXISTS "Authenticated write faq_items" ON faq_items;
  DROP POLICY IF EXISTS "Public read workflow_steps" ON workflow_steps;
  DROP POLICY IF EXISTS "Authenticated write workflow_steps" ON workflow_steps;
  DROP POLICY IF EXISTS "Public read site_config" ON site_config;
  DROP POLICY IF EXISTS "Authenticated write site_config" ON site_config;
  DROP POLICY IF EXISTS "Public read site_images" ON site_images;
  DROP POLICY IF EXISTS "Authenticated write site_images" ON site_images;
  DROP POLICY IF EXISTS "Public read nsfw_portfolio_images" ON nsfw_portfolio_images;
  DROP POLICY IF EXISTS "Authenticated write nsfw_portfolio_images" ON nsfw_portfolio_images;
  DROP POLICY IF EXISTS "Public read queue_items" ON queue_items;
  DROP POLICY IF EXISTS "Authenticated write queue_items" ON queue_items;
  DROP POLICY IF EXISTS "Public read social_links" ON social_links;
  DROP POLICY IF EXISTS "Authenticated write social_links" ON social_links;
  DROP POLICY IF EXISTS "Public read hero_content" ON hero_content;
  DROP POLICY IF EXISTS "Authenticated write hero_content" ON hero_content;
  DROP POLICY IF EXISTS "Public read homepage_stats" ON homepage_stats;
  DROP POLICY IF EXISTS "Authenticated write homepage_stats" ON homepage_stats;
  DROP POLICY IF EXISTS "Public read services" ON services;
  DROP POLICY IF EXISTS "Authenticated write services" ON services;
  DROP POLICY IF EXISTS "Public read fbx_mashups" ON fbx_mashups;
  DROP POLICY IF EXISTS "Authenticated write fbx_mashups" ON fbx_mashups;
  DROP POLICY IF EXISTS "Public read before_ordering_items" ON before_ordering_items;
  DROP POLICY IF EXISTS "Authenticated write before_ordering_items" ON before_ordering_items;
  DROP POLICY IF EXISTS "Public read tos_sections" ON tos_sections;
  DROP POLICY IF EXISTS "Authenticated write tos_sections" ON tos_sections;
  DROP POLICY IF EXISTS "Public read navigation_items" ON navigation_items;
  DROP POLICY IF EXISTS "Authenticated write navigation_items" ON navigation_items;
  DROP POLICY IF EXISTS "Public read website_settings" ON website_settings;
  DROP POLICY IF EXISTS "Authenticated write website_settings" ON website_settings;
  DROP POLICY IF EXISTS "Public read portfolio_categories" ON portfolio_categories;
  DROP POLICY IF EXISTS "Authenticated write portfolio_categories" ON portfolio_categories;
  DROP POLICY IF EXISTS "Public read commission_form_fields" ON commission_form_fields;
  DROP POLICY IF EXISTS "Authenticated write commission_form_fields" ON commission_form_fields;
  DROP POLICY IF EXISTS "Public read media_library" ON media_library;
  DROP POLICY IF EXISTS "Authenticated write media_library" ON media_library;
  DROP POLICY IF EXISTS "Public read homepage_sections" ON homepage_sections;
  DROP POLICY IF EXISTS "Authenticated write homepage_sections" ON homepage_sections;
END $$;

-- Public read access for all tables
CREATE POLICY "Public read portfolio_images" ON portfolio_images FOR SELECT USING (true);
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Public read pricing_tiers" ON pricing_tiers FOR SELECT USING (true);
CREATE POLICY "Public read faq_items" ON faq_items FOR SELECT USING (true);
CREATE POLICY "Public read workflow_steps" ON workflow_steps FOR SELECT USING (true);
CREATE POLICY "Public read site_config" ON site_config FOR SELECT USING (true);
CREATE POLICY "Public read site_images" ON site_images FOR SELECT USING (true);
CREATE POLICY "Public read nsfw_portfolio_images" ON nsfw_portfolio_images FOR SELECT USING (true);
CREATE POLICY "Public read queue_items" ON queue_items FOR SELECT USING (true);
CREATE POLICY "Public read social_links" ON social_links FOR SELECT USING (true);
CREATE POLICY "Public read hero_content" ON hero_content FOR SELECT USING (true);
CREATE POLICY "Public read homepage_stats" ON homepage_stats FOR SELECT USING (true);
CREATE POLICY "Public read services" ON services FOR SELECT USING (true);
CREATE POLICY "Public read fbx_mashups" ON fbx_mashups FOR SELECT USING (true);
CREATE POLICY "Public read before_ordering_items" ON before_ordering_items FOR SELECT USING (true);
CREATE POLICY "Public read tos_sections" ON tos_sections FOR SELECT USING (true);
CREATE POLICY "Public read navigation_items" ON navigation_items FOR SELECT USING (true);
CREATE POLICY "Public read website_settings" ON website_settings FOR SELECT USING (true);
CREATE POLICY "Public read portfolio_categories" ON portfolio_categories FOR SELECT USING (true);
CREATE POLICY "Public read commission_form_fields" ON commission_form_fields FOR SELECT USING (true);
CREATE POLICY "Public read media_library" ON media_library FOR SELECT USING (true);
CREATE POLICY "Public read homepage_sections" ON homepage_sections FOR SELECT USING (true);

-- Allow authenticated users to modify
CREATE POLICY "Authenticated write portfolio_images" ON portfolio_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write reviews" ON reviews FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write pricing_tiers" ON pricing_tiers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write faq_items" ON faq_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write workflow_steps" ON workflow_steps FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write site_config" ON site_config FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write site_images" ON site_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write nsfw_portfolio_images" ON nsfw_portfolio_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write queue_items" ON queue_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write social_links" ON social_links FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write hero_content" ON hero_content FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write homepage_stats" ON homepage_stats FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write services" ON services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write fbx_mashups" ON fbx_mashups FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write before_ordering_items" ON before_ordering_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write tos_sections" ON tos_sections FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write navigation_items" ON navigation_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write website_settings" ON website_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write portfolio_categories" ON portfolio_categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write commission_form_fields" ON commission_form_fields FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write media_library" ON media_library FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write homepage_sections" ON homepage_sections FOR ALL USING (auth.role() = 'authenticated');

-- =============================================================================
-- STORAGE POLICIES
-- =============================================================================

-- Drop existing storage policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public uploads portfolio-images" ON storage.objects;
  DROP POLICY IF EXISTS "Public reads portfolio-images" ON storage.objects;
  DROP POLICY IF EXISTS "Public updates portfolio-images" ON storage.objects;
  DROP POLICY IF EXISTS "Public deletes portfolio-images" ON storage.objects;
END $$;

CREATE POLICY "Public uploads portfolio-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portfolio-images');
CREATE POLICY "Public reads portfolio-images" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio-images');
CREATE POLICY "Public updates portfolio-images" ON storage.objects FOR UPDATE USING (bucket_id = 'portfolio-images');
CREATE POLICY "Public deletes portfolio-images" ON storage.objects FOR DELETE USING (bucket_id = 'portfolio-images');

-- =============================================================================
-- DEFAULT DATA
-- =============================================================================

-- =============================================================================
-- MODERATOR / ROLE SYSTEM
-- =============================================================================

-- Moderator / staff accounts. Passwords are stored hashed (scrypt).
-- role: 'owner' (full access) or 'moderator' (limited, permission-gated).
CREATE TABLE IF NOT EXISTS moderators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'moderator',
  permissions JSONB NOT NULL DEFAULT '{"reviews":false,"submissions":false,"hide_content":false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT
);

-- Commission submissions from the public contact form.
-- status: pending | approved | rejected | hidden  (hidden = soft-removed)
CREATE TABLE IF NOT EXISTS commission_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  discord TEXT,
  email TEXT,
  description TEXT NOT NULL,
  budget TEXT,
  deadline TEXT,
  reference_links TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  hidden BOOLEAN DEFAULT FALSE,
  rejected_reason TEXT,
  moderated_by TEXT,
  moderated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit trail for every moderation action.
CREATE TABLE IF NOT EXISTS moderation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id TEXT,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  entity_label TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extend reviews with moderation metadata
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews') THEN
    BEGIN ALTER TABLE reviews ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT FALSE; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE reviews ADD COLUMN IF NOT EXISTS rejected_reason TEXT; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE reviews ADD COLUMN IF NOT EXISTS moderated_by TEXT; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE reviews ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(); EXCEPTION WHEN others THEN NULL; END;
  END IF;
END $$;

ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_log ENABLE ROW LEVEL SECURITY;

-- Reviews stay publicly readable, but hidden reviews must not appear.
DROP POLICY IF EXISTS "Public read reviews" ON reviews;
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (hidden IS NOT TRUE);

-- Sensitive tables: no anon/authenticated policies => only the service role
-- (used by server-side API routes) can read or write them.
-- Public/anon keys cannot read moderator accounts, submissions, or the log.

INSERT INTO site_config (key, value) VALUES
  ('name', 'Bluey''s Avatar Commissions'),
  ('tagline', 'VRChat Avatar Edits • Blender Work • Unity Setup'),
  ('description', 'Clean, stylish, performance-friendly avatars built for VRChat.'),
  ('discord', 'BlueyBarks'),
  ('queue_status', 'open'),
  ('queue_slots_total', '8'),
  ('queue_slots_used', '4'),
  ('queue_wait_time', '2-3 weeks'),
  ('queue_notes', 'Currently working through larger commissions. Small edits may be completed faster.'),
  ('queue_last_updated', '2026-07-11')
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- BACKUPS
-- =============================================================================

CREATE TABLE IF NOT EXISTS content_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL DEFAULT '',
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE content_backups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read content_backups" ON content_backups;
DROP POLICY IF EXISTS "Authenticated write content_backups" ON content_backups;

CREATE POLICY "Public read content_backups" ON content_backups FOR SELECT USING (true);
CREATE POLICY "Authenticated write content_backups" ON content_backups FOR ALL USING (auth.role() = 'authenticated');
