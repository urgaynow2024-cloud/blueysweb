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
  hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT FALSE;

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

-- =============================================================================
-- FAQ items
-- =============================================================================

CREATE TABLE IF NOT EXISTS faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Terms of Service sections (editable from admin)
CREATE TABLE IF NOT EXISTS tos_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  icon TEXT DEFAULT '📄',
  section_type TEXT DEFAULT 'bullets' CHECK (section_type IN ('bullets', 'paragraphs')),
  content TEXT,
  items TEXT[] DEFAULT '{}',
  highlight_box TEXT,
  box_type TEXT DEFAULT 'info' CHECK (box_type IN ('info', 'warning', 'error')),
  box_title TEXT,
  sort_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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
-- FBX MASHUPS
-- =============================================================================

-- FBX Mashup projects (separate from portfolio)
CREATE TABLE IF NOT EXISTS fbx_mashups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  avatar_base TEXT,
  software_used TEXT[] DEFAULT '{}',
  price TEXT,
  featured BOOLEAN DEFAULT FALSE,
  visible BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FBX Mashup gallery images
CREATE TABLE IF NOT EXISTS fbx_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mashup_id UUID NOT NULL REFERENCES fbx_mashups(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  path TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FBX Mashup before & after comparisons
CREATE TABLE IF NOT EXISTS fbx_before_after (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mashup_id UUID NOT NULL REFERENCES fbx_mashups(id) ON DELETE CASCADE,
  before_url TEXT NOT NULL,
  after_url TEXT NOT NULL,
  before_path TEXT,
  after_path TEXT,
  label TEXT,
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

-- Migrate fbx_mashups table to ensure all columns exist (added after initial creation)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fbx_mashups') THEN
    BEGIN ALTER TABLE fbx_mashups ADD COLUMN IF NOT EXISTS avatar_base TEXT; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE fbx_mashups ADD COLUMN IF NOT EXISTS software_used TEXT[] DEFAULT '{}'; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE fbx_mashups ADD COLUMN IF NOT EXISTS price TEXT; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE fbx_mashups ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE fbx_mashups ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT TRUE; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE fbx_mashups ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE fbx_mashups ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(); EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE fbx_mashups ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(); EXCEPTION WHEN others THEN NULL; END;
  END IF;
END $$;

-- Migrate tos_sections table to ensure new columns exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tos_sections') THEN
    BEGIN ALTER TABLE tos_sections ADD COLUMN IF NOT EXISTS section_type TEXT DEFAULT 'bullets' CHECK (section_type IN ('bullets', 'paragraphs')); EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE tos_sections ADD COLUMN IF NOT EXISTS content TEXT; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE tos_sections ADD COLUMN IF NOT EXISTS box_type TEXT DEFAULT 'info' CHECK (box_type IN ('info', 'warning', 'error')); EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE tos_sections ADD COLUMN IF NOT EXISTS box_title TEXT; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE tos_sections ADD COLUMN IF NOT EXISTS items TEXT[] DEFAULT '{}'; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE tos_sections ADD COLUMN IF NOT EXISTS highlight_box TEXT DEFAULT ''; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE tos_sections ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT TRUE; EXCEPTION WHEN others THEN NULL; END;
  END IF;
END $$;

-- =============================================================================
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
ALTER TABLE fbx_mashups ENABLE ROW LEVEL SECURITY;
ALTER TABLE fbx_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE fbx_before_after ENABLE ROW LEVEL SECURITY;
ALTER TABLE tos_sections ENABLE ROW LEVEL SECURITY;

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
   DROP POLICY IF EXISTS "Public read fbx_mashups" ON fbx_mashups;
   DROP POLICY IF EXISTS "Authenticated write fbx_mashups" ON fbx_mashups;
   DROP POLICY IF EXISTS "Public read fbx_gallery" ON fbx_gallery;
   DROP POLICY IF EXISTS "Authenticated write fbx_gallery" ON fbx_gallery;
   DROP POLICY IF EXISTS "Public read fbx_before_after" ON fbx_before_after;
   DROP POLICY IF EXISTS "Authenticated write fbx_before_after" ON fbx_before_after;
   DROP POLICY IF EXISTS "Public read tos_sections" ON tos_sections;
   DROP POLICY IF EXISTS "Authenticated write tos_sections" ON tos_sections;
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

-- FBX Mashups: public read, authenticated write
CREATE POLICY "Public read fbx_mashups" ON fbx_mashups FOR SELECT USING (true);
CREATE POLICY "Authenticated write fbx_mashups" ON fbx_mashups FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public read fbx_gallery" ON fbx_gallery FOR SELECT USING (true);
CREATE POLICY "Authenticated write fbx_gallery" ON fbx_gallery FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Public read fbx_before_after" ON fbx_before_after FOR SELECT USING (true);
CREATE POLICY "Authenticated write fbx_before_after" ON fbx_before_after FOR ALL USING (auth.role() = 'authenticated');

-- TOS sections: public read, authenticated write
CREATE POLICY "Public read tos_sections" ON tos_sections FOR SELECT USING (true);
CREATE POLICY "Authenticated write tos_sections" ON tos_sections FOR ALL USING (auth.role() = 'authenticated');

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

-- FBX mashups storage bucket and policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'fbx-mashups') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('fbx-mashups', 'fbx-mashups', true);
  END IF;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public uploads fbx-mashups" ON storage.objects;
  DROP POLICY IF EXISTS "Public reads fbx-mashups" ON storage.objects;
  DROP POLICY IF EXISTS "Public updates fbx-mashups" ON storage.objects;
  DROP POLICY IF EXISTS "Public deletes fbx-mashups" ON storage.objects;
END $$;

CREATE POLICY "Public uploads fbx-mashups" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'fbx-mashups');
CREATE POLICY "Public reads fbx-mashups" ON storage.objects FOR SELECT USING (bucket_id = 'fbx-mashups');
CREATE POLICY "Public updates fbx-mashups" ON storage.objects FOR UPDATE USING (bucket_id = 'fbx-mashups');
CREATE POLICY "Public deletes fbx-mashups" ON storage.objects FOR DELETE USING (bucket_id = 'fbx-mashups');

-- =============================================================================
-- DEFAULT DATA
-- =============================================================================

-- =============================================================================
-- CLEANUP: Remove all FBX mashup demo/seed data
-- =============================================================================
-- If demo projects exist in the database (e.g. "Cyber Fox Mashup"), run the
-- TRUNCATE below in the Supabase SQL Editor to permanently remove them.
-- This is a one-time operation — it will NOT run automatically with the schema.
--
-- TRUNCATE TABLE fbx_before_after, fbx_gallery, fbx_mashups CASCADE;

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
    ('stat_unity', '2+'),
    ('tos_last_updated', 'August 2025'),
    ('tos_version', '2.0')
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- PRICING TIERS SEED DATA
-- =============================================================================
INSERT INTO pricing_tiers (id, name, emoji, price, badge, popular, features, sort_order, is_nsfw) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Light Blender Work', '✨', '£15–£25', NULL, FALSE, ARRAY[
    'Accessory additions', 'Simple clothing fitting', 'Texture recolours', 'Material edits',
    'Small Blender fixes', 'Minor Unity setup', 'Basic PhysBone setup', 'Small avatar adjustments'
  ], 0, FALSE),
  ('11111111-1111-1111-1111-111111111102', 'Standard Avatar Work', '🛠', '£30–£55', 'Most Requested', TRUE, ARRAY[
    'Multiple asset additions', 'Clothing fitting', 'Hair swaps', 'Toggle setup',
    'Material setup', 'Weight painting', 'Avatar optimisation', 'Shader setup',
    'Unity setup', 'Moderate Blender work'
  ], 1, FALSE),
  ('11111111-1111-1111-1111-111111111103', 'Advanced Avatar Work', '🔥', '£60–£90', NULL, FALSE, ARRAY[
    'Full avatar overhauls', 'Large Blender edits', 'Heavy customisation', 'Multiple clothing pieces',
    'Complex weight painting', 'Extensive optimisation', 'Complete Unity setup', 'Large toggle systems',
    'Texture work', 'Advanced modifications'
  ], 2, FALSE)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Uncomment to run: removes every row from FBX tables so you can start fresh
-- =============================================================================
-- TRUNCATE TABLE fbx_before_after, fbx_gallery, fbx_mashups CASCADE;
-- SELECT pg_catalog.pg_notify('pgrst', 'reload schema');

-- =============================================================================
-- TERMS OF SERVICE SEED DATA
-- =============================================================================
-- If tos_sections already has data, these will NOT overwrite existing rows.
-- To reset to defaults, truncate then re-run this section.
INSERT INTO tos_sections (id, title, icon, section_type, content, items, highlight_box, box_type, box_title, sort_order, visible) VALUES
('11111111-1111-1111-1111-111111111111', 'Definitions', '📚', 'paragraphs', 'For the purposes of these Terms of Service, the following terms shall have the meanings set forth below:

**Bluey Commissions**, **we**, **us**, or **our** refers to Bluey Commissions, operating under the business name associated with the VRChat avatar editing services provided.

**Client**, **you**, or **your** refers to any individual or entity that engages Bluey Commissions for services, whether through commission requests, direct contact, or any other means.

**Services** refers to all digital art, 3D modelling, avatar editing, avatar optimisation, clothing creation, texture editing, material setup, Unity configuration, FBX editing, FBX mashups, and any other services offered by Bluey Commissions.

**Commission** or **Project** refers to any request, order, or work undertaken by Bluey Commissions at the Client''s direction, whether accepted or pending acceptance.

**Assets** refers to any digital files, models, textures, avatars, references, or other materials provided by the Client to Bluey Commissions for the purpose of fulfilling a Commission.

**Completed Work** refers to the final deliverables produced by Bluey Commissions upon completion of a Commission, including all digital files, edits, and modifications.

**Platform** refers to VRChat and any other platform where avatars or assets may be used, modified, or displayed by the Client.', '{}', '', 'info', NULL, 0, TRUE),
('11111111-1111-1111-1111-111111111112', 'Acceptance of Terms', '✅', 'paragraphs', 'By submitting a commission request, placing a deposit, or otherwise engaging Bluey Commissions for Services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. These Terms constitute a legally binding agreement between you and Bluey Commissions.

If you do not agree with any part of these Terms, you must not engage Bluey Commissions for Services. You are responsible for reviewing these Terms prior to each commission request.

Bluey Commissions reserves the right to update these Terms at any time. The most current version will always be available at /tos. Continued use of our Services following any changes constitutes acceptance of the revised Terms.', '{}', 'Important: By proceeding with a commission, you affirm your agreement to these Terms.', 'warning', 'Legal Binding', 1, TRUE),
('11111111-1111-1111-1111-111111111113', 'Eligibility', '🔒', 'paragraphs', 'You must be at least 18 (eighteen) years of age to engage Bluey Commissions for Services. By submitting a commission request, you represent and warrant that you are at least 18 years old.

If you are engaging Bluey Commissions on behalf of a company, organisation, or other legal entity, you represent that you have the authority to bind such entity to these Terms. If you do not have such authority, you must not submit a commission request.

Bluey Commissions may refuse service to any individual or entity at our sole discretion.', '{}', '', 'info', NULL, 2, TRUE),
('11111111-1111-1111-1111-111111111114', 'Commission Requests', '📨', 'paragraphs', 'Commission requests are submitted through the official contact form at blueysweb.com or via Discord (@BlueyBarks). All commission requests are subject to availability and acceptance by Bluey Commissions.

To submit a commission request, you must provide:
- Your preferred method of contact (Discord or email)
- A description of the requested work
- Reference images, links, or files as applicable
- Any additional information that may help assess the request

Bluey Commissions will review your request and may respond with questions, clarifications, or a quotation. We are under no obligation to accept any commission request.', '{}', '', 'info', NULL, 3, TRUE),
('11111111-1111-1111-1111-111111111115', 'Quotations & Estimates', '💷', 'paragraphs', 'If your commission request is accepted, Bluey Commissions will provide a quotation based on the estimated complexity, scope, and time required to complete the work. All quotations are estimates only and are not guaranteed to be accurate.

The final price may differ from the estimate based on:
- Complexity discovered during the work
- Additional requests or changes beyond the original scope
- Availability of assets or references
- Technical constraints encountered

Bluey Commissions will notify you if the final price is expected to differ significantly from the estimate before proceeding with additional work.', '{}', '', 'info', NULL, 4, TRUE),
('11111111-1111-1111-1111-111111111116', 'Services Provided', '🛠', 'bullets', '{}', ARRAY[
  'VRChat Avatar Editing',
  'Blender Work (modelling, sculpting, retopology, UV unwrapping)',
  'Unity Work (import, configuration, component setup)',
  'Avatar Optimisation (Quest and PC performance targets)',
  'Clothing Creation (modelling, fitting, texturing)',
  'Clothing Fitting to existing avatars',
  'Texture Editing and Creation',
  'Material Editing and Shader Setup',
  'Weight Painting and Rigging',
  'Toggle Setup (clothing, accessories, expressions)',
  'PhysBone Setup and Configuration',
  'FBX Editing and Conversion',
  'FBX Mashups (combining multiple avatar bases into a single FBX)'
], '', 'info', NULL, 5, TRUE),
('11111111-1111-1111-1111-111111111117', 'Client Responsibilities', '📋', 'paragraphs', 'You are responsible for providing all necessary information, references, assets, and access required to complete the Commission. This includes:

- Providing clear, high-quality reference images or descriptions
- Supplying all required avatar files, models, and assets in the correct format
- Being available for communication during the agreed timeframe
- Reviewing deliverables promptly and providing timely feedback
- Notifying Bluey Commissions of any issues or concerns

Delays caused by the Client''s failure to provide required information or feedback may extend the estimated completion time. Bluey Commissions is not responsible for delays caused by Client unresponsiveness.', '{}', '', 'info', NULL, 6, TRUE),
('11111111-1111-1111-1111-111111111118', 'Communication', '💬', 'paragraphs', 'All communication between Bluey Commissions and the Client will be conducted through the agreed-upon channel (Discord or email). Bluey Commissions will make reasonable efforts to respond within 24-48 hours, though response times may vary depending on workload and availability.

By submitting a commission request, you consent to receive communications from us, including emails, Discord messages, and notifications. You agree that electronic communications constitute a legally binding record of the agreement between you and Bluey Commissions.

You must inform Bluey Commissions of any changes to your contact information. We are not responsible for missed communications due to incorrect contact details.', '{}', '', 'info', NULL, 7, TRUE),
('11111111-1111-1111-1111-111111111119', 'Asset Ownership', '⚠️', 'paragraphs', 'You represent and warrant that you have the legal right and authority to provide all Assets to Bluey Commissions for the purpose of fulfilling the Commission. This includes:

- Ownership or licensed rights to any avatar base, model, texture, or other digital asset
- The right to sublicense or grant permissions for the use of such assets
- Non-infringement of any third-party rights, including but not limited to copyright, trademark, and personality rights
- Compliance with all applicable laws and regulations

Bluey Commissions shall not be liable for any claims, damages, or disputes arising from the use of Assets that you do not own or have permission to use. If any such claim arises, you agree to indemnify and hold harmless Bluey Commissions from all liability.', '{}', 'You must be able to prove ownership or licensing rights for every asset you provide. If proof cannot be supplied, the commission will not proceed.', 'error', 'Client Responsibility', 8, TRUE),
('11111111-1111-1111-1111-111111111120', 'Proof of Ownership Requirements', '🔎', 'paragraphs', 'Bluey Commissions may request proof of ownership or licensing for any Asset provided by the Client. Proof must be submitted in a form acceptable to us and may include:

- Receipt from Booth, Gumroad, Jinxxy, or other legitimate marketplace
- Official store receipt or invoice
- Direct permission from the original creator (with contact information for verification)
- Any other documentation that demonstrates legal right to use the Asset

For FBX Mashup commissions specifically, proof of ownership for every avatar base used in the mashup is mandatory. This must be provided before work can begin.

If you cannot provide satisfactory proof of ownership, Bluey Commissions reserves the right to refuse or cancel the commission. Any deposit paid will be refunded in full if the cancellation occurs before work begins.', '{}', '', 'info', NULL, 9, TRUE),
('11111111-1111-1111-1111-111111111121', 'FBX Mashup Policy', '🔗', 'paragraphs', 'FBX Mashups involve combining multiple avatar bases into a single FBX file. Due to the complexity and legal considerations involved, the following additional rules apply:

**Proof of Ownership**: You must provide proof of ownership or licensing for every avatar base used in the mashup. Accepted proof includes receipts from Booth, Gumroad, Jinxxy, official creator stores, and other legitimate marketplaces. Without proof for every base, the commission will not be accepted.

**No Unauthorised Assets**: Bluey Commissions will not knowingly work with leaked, ripped, pirated, stolen, or otherwise unauthorised assets. If any asset used in a mashup cannot be verified, the commission will be cancelled immediately.

**Single Client Use Only**: FBX mashup results are created for the individual Client who commissioned the work. Redistribution, resale, or sharing of mashup results with other parties is strictly prohibited unless explicitly agreed upon.

**Complexity Pricing**: FBX mashup pricing depends on the number of bases being merged, the complexity of the mashup, and the amount of required Blender and Unity work. Pricing is quoted per project and may differ from standard avatar editing rates.', '{}', 'All avatar bases must be owned or licensed by you. Proof may be requested at any time before, during, or after the commission.', 'warning', 'FBX Mashup Requirements', 10, TRUE),
('11111111-1111-1111-1111-111111111122', 'Third-Party Assets', '🧩', 'paragraphs', 'If you request work involving third-party assets (models, textures, avatars, or other digital content not created by you or Bluey Commissions), you are responsible for ensuring that you have the necessary rights to use, modify, and distribute those assets.

Bluey Commissions may, at our discretion, request proof of ownership or licensing for third-party assets before proceeding with the work. If proof is not provided, we may refuse the commission or remove the third-party assets from the scope of work.

You agree to indemnify and hold harmless Bluey Commissions against any claims, damages, or liabilities arising from the use of third-party assets in our work.', '{}', '', 'info', NULL, 11, TRUE),
('11111111-1111-1111-1111-111111111123', 'Copyright & Intellectual Property', '©️', 'paragraphs', 'All intellectual property rights in deliverables created by Bluey Commissions remain the property of Bluey Commissions, except where explicit written agreements state otherwise. This includes all original work produced as part of a Commission, including but not limited to 3D models, textures, materials, rigging, and configuration files.

The Client receives a limited licence to use the Completed Work for personal, non-commercial purposes as described in the Licence Granted section below. No ownership rights are transferred to the Client unless explicitly stated in writing.

Any trademarks, logos, or copyrighted material belonging to third parties remain the property of their respective owners. Bluey Commissions does not claim ownership of any third-party content provided by the Client.', '{}', '', 'info', NULL, 12, TRUE),
('11111111-1111-1111-1111-111111111124', 'Licence Granted to Clients', '📄', 'paragraphs', 'Upon full payment for a Commission, Bluey Commissions grants the Client a non-exclusive, non-transferable, non-sublicensable licence to use the Completed Work for the following purposes:

- Personal use within VRChat and other compatible 3D platforms
- Modification and further editing of the avatar or asset for personal use
- Display and sharing within the scope of personal, non-commercial activities

The following uses are NOT permitted unless explicitly agreed in writing:
- Resale, redistribution, or commercial use of the Completed Work
- Using the Completed Work as a base for creating derivatives for other clients
- Claiming the Completed Work as your own creation
- Distributing the Completed Work outside of the agreed scope

Any breach of this licence agreement may result in the immediate revocation of the licence and refusal of future services.', '{}', '', 'info', NULL, 13, TRUE),
('11111111-1111-1111-1111-111111111125', 'Portfolio & Showcase Rights', '🖼️', 'paragraphs', 'Bluey Commissions reserves the right to use, reproduce, display, and distribute images, screenshots, or other representations of the Completed Work for portfolio, marketing, and promotional purposes. This includes display on websites, social media, and other platforms.

If you do not wish for your Commission to appear in our portfolio, you must request exclusion in writing before the work begins. Requests for exclusion made after completion will not be accepted.

We may also include the Completed Work in demo reels, showcases, or promotional materials without additional compensation to you.', '{}', '', 'info', NULL, 14, TRUE),
('11111111-1111-1111-1111-111111111126', 'Payment Terms', '💳', 'paragraphs', 'Payment is required via the method specified during the commission process. All prices are in GBP unless otherwise stated.

A deposit (typically 50% of the estimated total) is required to commence work. The remaining balance (50%) is due before final delivery of the Completed Work.

Payment is processed through Stripe, PayPal, or bank transfer, depending on the agreed method. All payment details will be communicated through secure channels.

Late payments may result in delays to the commission timeline or cancellation of the commission.', '{}', 'Full payment is required before final delivery.', 'warning', 'Payment Required', 15, TRUE),
('11111111-1111-1111-1111-111111111127', 'Refund Policy', '💸', 'paragraphs', 'Due to the nature of digital creative services, refunds are extremely limited and are only available under the following circumstances:

- **Before work begins**: The full deposit is refundable if the commission is cancelled before any work starts. However, a small administrative fee may apply.
- **After work begins**: No refunds are available once work has commenced. The deposit covers time and planning already invested.
- **Partial cancellation**: If a commission is partially completed and cancelled, no refund will be issued for work already completed.
- **Dissatisfaction with results**: If you are not satisfied with the Completed Work, revisions will be provided as outlined in the Revisions section. Refunds are not available for subjective dissatisfaction.

All refund requests must be made in writing. Approved refunds will be processed using the original payment method within 5-10 business days.', '{}', 'Refunds are limited once work has begun. Please review all details carefully before committing to a commission.', 'warning', 'Limited Refunds', 16, TRUE),
('11111111-1111-1111-1111-111111111128', 'Chargebacks & Payment Disputes', '🚫', 'paragraphs', 'Initiating a chargeback, payment dispute, or claim against Bluey Commissions for a completed or in-progress Commission is strictly prohibited. By proceeding with a payment, you acknowledge that:

- You have received and agreed to these Terms
- You acknowledge receipt of Services commensurate with the payment made
- You do not have grounds for a chargeback or payment dispute

If a chargeback or payment dispute is initiated, Bluey Commissions reserves the right to:
- Immediately blacklist you from all future services
- Pursue legal action to recover the disputed amount
- Report the dispute to relevant payment processors and platforms

Any chargebacks or disputes that are resolved in our favour do not entitle you to any refund, compensation, or continuation of service.', '{}', 'Chargebacks are considered fraudulent and will result in immediate blacklisting.', 'error', 'No Chargebacks', 17, TRUE),
('11111111-1111-1111-1111-111111111129', 'Revisions', '🔄', 'paragraphs', 'Bluey Commissions offers revisions to ensure you are satisfied with the Completed Work. The revision policy is as follows:

- Minor revisions (colour changes, small adjustments, positioning tweaks) are included for up to 2 rounds per Commission.
- Major revisions (significant structural changes, new features, additional assets) may incur additional fees.
- Revision requests must be submitted within 7 days of delivery.
- Revisions are only available for the original scope of work. New additions are considered new Commissions.

Additional revision rounds or major changes may be subject to extra charges, which will be quoted before work begins.', '{}', '', 'info', NULL, 18, TRUE),
('11111111-1111-1111-1111-111111111130', 'Turnaround Times', '⏱️', 'paragraphs', 'Estimated completion times are provided as approximations only. Bluey Commissions will make reasonable efforts to meet estimated timelines, but we cannot guarantee completion by any specific date.

Factors that may affect completion times include:
- Complexity of the requested work
- Queue position and current workload
- Timeliness of Client responses and feedback
- Availability and quality of reference materials
- Technical issues or unforeseen circumstances

If delays are expected, we will communicate with you proactively. Time is not of the essence in the performance of Services.', '{}', '', 'info', NULL, 19, TRUE),
('11111111-1111-1111-1111-111111111131', 'Delivery of Digital Goods', '📦', 'paragraphs', 'Completed Work is delivered digitally via Discord file upload, Google Drive link, or other agreed-upon method. Bluey Commissions is not responsible for delivery failures caused by:

- Incorrect contact information provided by the Client
- Platform outages or restrictions (Discord, Google Drive, etc.)
- File size or format limitations
- Client-side technical issues

It is your responsibility to download and verify the Completed Work upon delivery. Once the work is delivered and you have confirmed satisfaction (or completed the revision process), the Commission is considered complete.', '{}', '', 'info', NULL, 20, TRUE),
('11111111-1111-1111-1111-111111111132', 'Acceptance of Completed Work', '✅', 'paragraphs', 'Upon delivery of the Completed Work, you have 48 hours to review and confirm acceptance. If no feedback or objection is received within 48 hours, the work is considered accepted and the Commission is deemed complete.

If you wish to request revisions or report issues, you must do so within 48 hours of delivery. Failure to provide feedback within this window waives your right to revisions for that delivery.', '{}', 'Work is considered accepted if no feedback is received within 48 hours of delivery.', 'warning', 'Acceptance Window', 21, TRUE),
('11111111-1111-1111-1111-111111111133', 'Support After Delivery', '🎧', 'paragraphs', 'Bluey Commissions provides limited support after delivery of the Completed Work:

- **Bug fixes**: Minor bugs or issues related to the delivered files (incorrect imports, missing components, etc.) will be fixed at no additional cost within 7 days of delivery.
- **Guidance**: Basic guidance on how to use or import the files will be provided upon request.
- **Major issues**: Significant problems or feature additions are treated as new revisions and may incur additional fees.

Support is provided through Discord or email and is subject to availability. We are not obligated to provide ongoing or indefinite support.', '{}', '', 'info', NULL, 22, TRUE),
('11111111-1111-1111-1111-111111111134', 'Refusal of Service', '🚫', 'paragraphs', 'Bluey Commissions reserves the right to refuse or cancel any Commission, in whole or in part, at our sole discretion, for any reason, including but not limited to:

- Violation of these Terms
- Inappropriate or abusive behaviour
- Unwillingness to provide required information or assets
- Unrealistic expectations or demands
- Requests involving illegal, harmful, or offensive content
- Inability to verify asset ownership
- Current high workload or unavailability

If a Commission is refused before work begins, any deposit paid will be refunded in full. If a Commission is cancelled after work has begun, the refund policy in the Refund Policy section applies.', '{}', '', 'info', NULL, 23, TRUE),
('11111111-1111-1111-1111-111111111135', 'Client Conduct', '👥', 'paragraphs', 'Bluey Commissions expects all Clients to communicate respectfully and professionally throughout the Commission process. Unacceptable behaviour includes, but is not limited to:

- Harassment, bullying, or abusive language directed at Bluey Commissions or other clients
- Threats of any kind, including threats of violence, legal action, or chargebacks
- Repeated unreasonable demands or excessive revision requests
- Discriminatory or offensive language
- Sharing of personal information without consent
- Disruptive behaviour in Discord servers or other communication channels

Any violation of this conduct policy may result in immediate cancellation of the Commission, refusal of future services, and permanent blacklisting.', '{}', 'Respectful communication is expected at all times.', 'warning', 'Code of Conduct', 24, TRUE),
('11111111-1111-1111-1111-111111111136', 'Blacklisting Policy', '🚫', 'paragraphs', 'Bluey Commissions maintains the right to permanently blacklist any Client from future services. Grounds for blacklisting include, but are not limited to:

- Harassment of Bluey Commissions or staff
- Harassment of other clients or community members
- Abuse of the revision system or payment structure
- Threats or intimidation
- Fraudulent activity or misrepresentation
- Chargeback abuse or payment disputes
- Lying about order details or asset ownership
- Providing stolen, leaked, ripped, or pirated assets
- Asset theft or distribution of unauthorized content
- Redistributing Bluey Commissions'' work without permission
- Claiming Bluey Commissions'' work as your own
- Selling Bluey Commissions'' work without authorisation
- Removing or altering required credits or watermarks
- Repeated breaches of these Terms of Service
- Attempting to scam or deceive Bluey Commissions in any way

Blacklisted clients will be refused service permanently and may be reported to relevant platforms or authorities if illegal activity is suspected.', '{}', 'We reserve the right to blacklist anyone who violates these Terms or engages in harmful behaviour.', 'error', 'Strict Enforcement', 25, TRUE),
('11111111-1111-1111-1111-111111111137', 'Privacy', '🔐', 'paragraphs', 'Bluey Commissions respects your privacy. This Privacy section summarises how we collect, use, and protect your information:

- **Data collected**: Name, Discord handle, email, commission details, and reference materials.
- **Purpose**: To process and fulfil your Commission request.
- **Storage**: Information is stored securely and retained only as long as necessary for business purposes.
- **No resale**: Your information will not be sold, traded, or rented to third parties.
- **Cookies**: This site may use cookies for basic functionality. No personal tracking cookies are used.
- **Third-party services**: We may use third-party platforms (Discord, Stripe, PayPal) for communication and payment processing. Your data is subject to their respective privacy policies.

For full privacy information, please contact us directly.', '{}', '', 'info', NULL, 26, TRUE),
('11111111-1111-1111-1111-111111111138', 'Limitation of Liability', '⚖️', 'paragraphs', 'To the fullest extent permitted by law, Bluey Commissions'' total liability to you for any claim arising from or related to these Terms or the Services, whether in contract, tort (including negligence), breach of statutory duty, or otherwise, shall be limited to the amount you paid to Bluey Commissions for the Commission giving rise to the claim.

Bluey Commissions shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation:
- Loss of profits, data, or revenue
- Loss of use or business opportunity
- Any indirect or intangible losses
- Damage to reputation or loss of goodwill

These limitations apply even if Bluey Commissions has been advised of the possibility of such damages.', '{}', '', 'info', NULL, 27, TRUE),
('11111111-1111-1111-1111-111111111139', 'Disclaimer', '⚠️', 'paragraphs', 'The Services are provided on an "as is" and "as available" basis. Bluey Commissions makes no warranties of any kind, whether express, implied, statutory, or otherwise.

Bluey Commissions does not warrant that:
- The Services will be uninterrupted, secure, or error-free
- The results obtained from the Services will be accurate or reliable
- Any defects will be corrected
- The Services will meet your specific requirements

While we strive for high quality in all deliverables, we cannot guarantee specific outcomes, compatibility with all platforms, or freedom from technical issues. You acknowledge that you use the Services at your own risk.', '{}', '', 'info', NULL, 28, TRUE),
('11111111-1111-1111-1111-111111111140', 'Force Majeure', '🌪️', 'paragraphs', 'Bluey Commissions shall not be liable for any failure or delay in performing any obligation under these Terms that is caused by circumstances beyond our reasonable control, including but not limited to:

- Acts of God (earthquakes, floods, storms, fires, pandemics)
- War, terrorism, or civil unrest
- Government restrictions or orders
- Strikes, lockouts, or labour disputes
- Internet outages or network failures
- Platform outages or policy changes (e.g. VRChat)
- Hardware or software failures
- Other events beyond reasonable control

If a force majeure event occurs, we will make reasonable efforts to notify you and minimise disruption to the Commission.', '{}', '', 'info', NULL, 29, TRUE),
('11111111-1111-1111-1111-111111111141', 'Changes to the Terms', '📝', 'paragraphs', 'Bluey Commissions reserves the right to modify or replace these Terms of Service at any time, at our sole discretion. When we do, we will update the "Last Updated" date at the top of this page and, where appropriate, the version number.

It is your responsibility to review these Terms periodically. Your continued engagement with Bluey Commissions after any changes constitutes acceptance of the revised Terms. If you do not agree with any change, you must discontinue using our Services and must not submit further commission requests.

Material changes will be communicated via the website or Discord.', '{}', '', 'info', NULL, 30, TRUE),
('11111111-1111-1111-1111-111111111142', 'Governing Law', '🏛️', 'paragraphs', 'These Terms are governed by and construed in accordance with the laws of England and Wales. Any disputes arising from or in connection with these Terms or the Services will be subject to the exclusive jurisdiction of the courts of England and Wales.

If any provision of these Terms is found to be invalid or unenforceable by a court of competent jurisdiction, the remaining provisions will remain in full force and effect.', '{}', '', 'info', NULL, 31, TRUE),
('11111111-1111-1111-1111-111111111143', 'Severability', '✂️', 'paragraphs', 'If any provision of these Terms is held by a court of competent jurisdiction to be invalid, illegal, or unenforceable, the remaining provisions will remain in full force and effect. The invalid, illegal, or unenforceable provision shall be replaced by a valid, legal, and enforceable provision that most closely reflects the parties'' original intent.', '{}', '', 'info', NULL, 32, TRUE),
('11111111-1111-1111-1111-111111111144', 'Entire Agreement', '📜', 'paragraphs', 'These Terms, together with any policies or documents referenced herein, constitute the entire agreement between you and Bluey Commissions with respect to the subject matter hereof and supersede any and all prior or contemporaneous communications, representations, agreements, or understandings, whether oral or written, whether electronic, or by any means of communication.

These Terms are not intended to confer any rights or benefits upon any third party, and no provision of these Terms will be construed as conferring any right or benefit to any third party.', '{}', '', 'info', NULL, 33, TRUE),
('11111111-1111-1111-1111-111111111145', 'Contact Information', '📧', 'paragraphs', 'If you have any questions about these Terms of Service, or wish to contact Bluey Commissions for any reason, please contact us through the following methods:

- **Discord**: @BlueyBarks
- **Email**: Available via the contact form at blueysweb.com
- **Website**: https://blueysweb.com

We will respond to your inquiry within a reasonable timeframe.', '{}', '', 'info', NULL, 34, TRUE)
ON CONFLICT (id) DO NOTHING;
