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
-- MIGRATIONS
-- =============================================================================

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
  ('queue_last_updated', '2026-07-11'),
  ('stat_commissions', '150+'),
  ('stat_clients', '120+'),
  ('stat_returning', '40+'),
  ('stat_rating', '4.9'),
  ('stat_reviews', '85'),
  ('stat_experience', '2+'),
  ('stat_response', '1-3 hours'),
  ('stat_delivery', '5-10 days'),
  ('stat_blender', '2+'),
  ('stat_unity', '2+')
ON CONFLICT (key) DO NOTHING;
