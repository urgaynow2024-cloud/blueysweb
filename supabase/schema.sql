-- Run this in your Supabase SQL editor (supabase.com -> your project -> SQL Editor)

-- Storage bucket for portfolio images
-- Create this manually in Supabase Dashboard -> Storage -> New bucket
-- Name: portfolio-images, Public: ON

-- Portfolio / Commission items
CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  platforms TEXT[] DEFAULT '{}',
  blender_work BOOLEAN DEFAULT FALSE,
  unity_work BOOLEAN DEFAULT FALSE,
  features TEXT[] DEFAULT '{}',
  optimization TEXT,
  primary_render TEXT DEFAULT '🎨',
  image_url TEXT,
  media_type TEXT DEFAULT 'image',
  before_after BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar TEXT DEFAULT '🎭',
  text TEXT NOT NULL,
  project TEXT,
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

-- Workflow / Process steps
CREATE TABLE IF NOT EXISTS workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emoji TEXT DEFAULT '📝',
  title TEXT NOT NULL,
  "desc" TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site configuration (key-value store)
CREATE TABLE IF NOT EXISTS site_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read" ON portfolio_items FOR SELECT USING (true);
CREATE POLICY "Public read" ON reviews FOR SELECT USING (true);
CREATE POLICY "Public read" ON pricing_tiers FOR SELECT USING (true);
CREATE POLICY "Public read" ON faq_items FOR SELECT USING (true);
CREATE POLICY "Public read" ON workflow_steps FOR SELECT USING (true);
CREATE POLICY "Public read" ON site_config FOR SELECT USING (true);

-- Allow all operations for anon key (client-side)
-- WARNING: For production, add Supabase Auth and restrict writes to authenticated users only
CREATE POLICY "Allow all" ON portfolio_items FOR ALL USING (true);
CREATE POLICY "Allow all" ON reviews FOR ALL USING (true);
CREATE POLICY "Allow all" ON pricing_tiers FOR ALL USING (true);
CREATE POLICY "Allow all" ON faq_items FOR ALL USING (true);
CREATE POLICY "Allow all" ON workflow_steps FOR ALL USING (true);
CREATE POLICY "Allow all" ON site_config FOR ALL USING (true);

-- Storage policies for portfolio-images bucket
-- Run these in Storage -> Policies after creating the bucket
CREATE POLICY "Public uploads" ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'portfolio-images');
CREATE POLICY "Public reads" ON storage.objects FOR SELECT 
  USING (bucket_id = 'portfolio-images');
CREATE POLICY "Public updates" ON storage.objects FOR UPDATE 
  USING (bucket_id = 'portfolio-images');
CREATE POLICY "Public deletes" ON storage.objects FOR DELETE 
  USING (bucket_id = 'portfolio-images');

-- Seed with default data (will only work if tables are empty)
INSERT INTO site_config (key, value) VALUES
  ('name', 'Bluey' || chr(39) || 's Avatar Commissions'),
  ('tagline', 'VRChat Avatar Edits • Blender Work • Unity Setup'),
  ('description', 'Clean, stylish, performance-friendly avatars built for VRChat.'),
  ('discord', 'BlueyBarks')
ON CONFLICT (key) DO NOTHING;
