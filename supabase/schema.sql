-- Supabase schema for Bluey's Avatar Commissions
-- Run this in: Supabase Dashboard → SQL Editor → New query → Paste → Run

-- =============================================================================
-- STORAGE BUCKET (create manually first)
-- =============================================================================
-- Go to: Supabase Dashboard → Storage → New bucket
-- Name: portfolio-images
-- Public bucket: ON
-- Then come back and run the storage policy section below

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
  name TEXT NOT NULL,
  avatar TEXT DEFAULT '🎭',
  text TEXT NOT NULL,
  project TEXT,
  star_rating INTEGER DEFAULT 5,
  image_url TEXT,
  approved BOOLEAN DEFAULT FALSE,
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

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE portfolio_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public read" ON portfolio_images;
  DROP POLICY IF EXISTS "Authenticated write" ON portfolio_images;
  DROP POLICY IF EXISTS "Public read" ON reviews;
  DROP POLICY IF EXISTS "Authenticated write" ON reviews;
  DROP POLICY IF EXISTS "Public read" ON pricing_tiers;
  DROP POLICY IF EXISTS "Authenticated write" ON pricing_tiers;
  DROP POLICY IF EXISTS "Public read" ON faq_items;
  DROP POLICY IF EXISTS "Authenticated write" ON faq_items;
  DROP POLICY IF EXISTS "Public read" ON workflow_steps;
  DROP POLICY IF EXISTS "Authenticated write" ON workflow_steps;
  DROP POLICY IF EXISTS "Public read" ON site_config;
  DROP POLICY IF EXISTS "Authenticated write" ON site_config;
END $$;

-- Public read access for all tables
CREATE POLICY "Public read" ON portfolio_images FOR SELECT USING (true);
CREATE POLICY "Public read" ON reviews FOR SELECT USING (true);
CREATE POLICY "Public read" ON pricing_tiers FOR SELECT USING (true);
CREATE POLICY "Public read" ON faq_items FOR SELECT USING (true);
CREATE POLICY "Public read" ON workflow_steps FOR SELECT USING (true);
CREATE POLICY "Public read" ON site_config FOR SELECT USING (true);

-- Allow authenticated users to modify
CREATE POLICY "Authenticated write" ON portfolio_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write" ON reviews FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write" ON pricing_tiers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write" ON faq_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write" ON workflow_steps FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write" ON site_config FOR ALL USING (auth.role() = 'authenticated');

-- =============================================================================
-- STORAGE POLICIES
-- =============================================================================
-- IMPORTANT: storage.objects is a system table owned by Supabase.
-- You must create storage policies through the Dashboard UI, not SQL Editor.
--
-- Go to: Supabase Dashboard → Storage → portfolio-images → Policies → New policy
--
-- Create these 4 policies manually:
-- 1. "Public uploads"   - INSERT   - bucket_id = 'portfolio-images'
-- 2. "Public reads"     - SELECT   - bucket_id = 'portfolio-images'
-- 3. "Public updates"   - UPDATE   - bucket_id = 'portfolio-images'
-- 4. "Public deletes"   - DELETE   - bucket_id = 'portfolio-images'
--
-- For each policy:
-- - Allowed operation: select the operation type
-- - Policy definition: bucket_id = 'portfolio-images'
-- - Enable: Yes


-- =============================================================================
-- DEFAULT DATA
-- =============================================================================

INSERT INTO site_config (key, value) VALUES
  ('name', 'Bluey''s Avatar Commissions'),
  ('tagline', 'VRChat Avatar Edits • Blender Work • Unity Setup'),
  ('description', 'Clean, stylish, performance-friendly avatars built for VRChat.'),
  ('discord', 'BlueyBarks')
ON CONFLICT (key) DO NOTHING;
