-- Supabase schema for Bluey Commissions — VRChat Creator Studio
-- Run this in: Supabase Dashboard → SQL Editor → New query → Paste → Run

-- =============================================================================
-- TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS portfolio_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  path TEXT,
  category TEXT DEFAULT 'VRChat Avatars',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'VRChat Avatars',
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  software_used TEXT[] DEFAULT '{}',
  completion_date TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES portfolio_projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  path TEXT,
  type TEXT DEFAULT 'image',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS before_after_sliders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES portfolio_projects(id) ON DELETE CASCADE,
  before_url TEXT NOT NULL,
  after_url TEXT NOT NULL,
  before_path TEXT,
  after_path TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  review_text TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  image_url TEXT,
  hidden BOOLEAN DEFAULT FALSE,
  rejected_reason TEXT,
  moderated_by TEXT,
  moderated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emoji TEXT DEFAULT '📝',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE workflow_steps DROP COLUMN IF EXISTS description;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'workflow_steps' AND column_name = 'desc') THEN
    ALTER TABLE workflow_steps RENAME COLUMN "desc" TO description;
  END IF;
END $$;
ALTER TABLE workflow_steps ALTER COLUMN description DROP NOT NULL;
ALTER TABLE workflow_steps ADD COLUMN IF NOT EXISTS description TEXT DEFAULT 'Workflow step description';

CREATE TABLE IF NOT EXISTS site_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_images (
  key TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nsfw_portfolio_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  path TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS homepage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL DEFAULT '',
  value TEXT NOT NULL DEFAULT '',
  suffix TEXT DEFAULT '',
  sublabel TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  emoji TEXT DEFAULT '',
  image_url TEXT,
  "desc" TEXT NOT NULL DEFAULT '',
  features TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS before_ordering_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emoji TEXT DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  "desc" TEXT NOT NULL DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tos_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  icon TEXT DEFAULT '',
  description TEXT DEFAULT '',
  items TEXT[] DEFAULT '{}',
  type TEXT DEFAULT 'section',
  is_visible BOOLEAN DEFAULT TRUE,
  colour TEXT DEFAULT 'accent',
  card_style TEXT DEFAULT 'default',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tos_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_number INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  changed_by TEXT DEFAULT 'admin',
  change_summary TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS website_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS portfolio_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL DEFAULT '',
  label TEXT NOT NULL DEFAULT '',
  visible BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS content_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL DEFAULT '',
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE commission_status AS ENUM ('open', 'accepted', 'waiting_assets', 'waiting_payment', 'in_progress', 'client_review', 'revision_requested', 'completed', 'cancelled');

CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT,
  client_discord TEXT,
  client_email TEXT,
  description TEXT NOT NULL,
  budget TEXT,
  deadline TEXT,
  reference_links TEXT,
  status commission_status DEFAULT 'open',
  priority TEXT DEFAULT 'normal',
  progress INTEGER DEFAULT 0,
  internal_notes TEXT,
  due_date TEXT,
  payment_status TEXT DEFAULT 'unpaid',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS commission_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_id UUID REFERENCES commissions(id) ON DELETE CASCADE,
  request_text TEXT NOT NULL,
  response_text TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS commission_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_id UUID REFERENCES commissions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  path TEXT,
  type TEXT DEFAULT 'file',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS queue_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_open BOOLEAN DEFAULT TRUE,
  status_text TEXT DEFAULT 'Open',
  status_color TEXT DEFAULT 'green',
  slots_total INTEGER DEFAULT 8,
  slots_used INTEGER DEFAULT 0,
  wait_time TEXT DEFAULT '2-3 weeks',
  notes TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_type TEXT NOT NULL,
  webhook_url TEXT,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE user_role AS ENUM ('owner', 'admin', 'moderator', 'content_editor');

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name user_role UNIQUE NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id TEXT,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  previous_value JSONB DEFAULT '{}'::jsonb,
  new_value JSONB DEFAULT '{}'::jsonb,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL,
  visitor_id TEXT,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS search_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  url TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maintenance_mode (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled BOOLEAN DEFAULT FALSE,
  message TEXT DEFAULT '',
  allowed_ips TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS changelog_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fbx_mashup_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT,
  client_discord TEXT,
  client_email TEXT,
  avatar_bases TEXT[] DEFAULT '{}',
  description TEXT NOT NULL,
  proof_of_ownership TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fbx_mashups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  model_a TEXT NOT NULL DEFAULT '',
  model_b TEXT NOT NULL DEFAULT '',
  price TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  image_url TEXT,
  image_path TEXT,
  how_to_get TEXT NOT NULL DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- MIGRATIONS / BACKFILLS (idempotent, non-destructive)
-- =============================================================================

ALTER TABLE portfolio_images ADD COLUMN IF NOT EXISTS path TEXT;
ALTER TABLE portfolio_images ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'VRChat Avatars';
CREATE INDEX IF NOT EXISTS portfolio_images_sort_idx ON portfolio_images (sort_order);
UPDATE portfolio_images SET category = 'VRChat Avatars' WHERE category IS NULL OR category = '';

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews') THEN
    BEGIN ALTER TABLE reviews ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT FALSE; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE reviews ADD COLUMN IF NOT EXISTS rejected_reason TEXT; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE reviews ADD COLUMN IF NOT EXISTS moderated_by TEXT; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE reviews ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ; EXCEPTION WHEN others THEN NULL; END;
    BEGIN ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(); EXCEPTION WHEN others THEN NULL; END;
  END IF;
END $$;
ALTER TABLE pricing_tiers ADD COLUMN IF NOT EXISTS is_nsfw BOOLEAN DEFAULT FALSE;

INSERT INTO queue_config (is_open, status_text, status_color, slots_total, slots_used, wait_time, notes, updated_at)
SELECT
  COALESCE((SELECT value FROM site_config WHERE key = 'queue_status' LIMIT 1) = 'open', TRUE),
  COALESCE((SELECT value FROM site_config WHERE key = 'queue_status' LIMIT 1), 'Open'),
  CASE WHEN (SELECT value FROM site_config WHERE key = 'queue_status' LIMIT 1) = 'open' THEN 'green' ELSE 'red' END,
  COALESCE(CAST((SELECT value FROM site_config WHERE key = 'queue_slots_total' LIMIT 1) AS INTEGER), 8),
  COALESCE(CAST((SELECT value FROM site_config WHERE key = 'queue_slots_used' LIMIT 1) AS INTEGER), 0),
  COALESCE((SELECT value FROM site_config WHERE key = 'queue_wait_time' LIMIT 1), '2-3 weeks'),
  COALESCE((SELECT value FROM site_config WHERE key = 'queue_notes' LIMIT 1), ''),
  COALESCE((SELECT value FROM site_config WHERE key = 'queue_last_updated' LIMIT 1)::TIMESTAMPTZ, NOW())
WHERE NOT EXISTS (SELECT 1 FROM queue_config);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE portfolio_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE before_after_sliders ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE before_ordering_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tos_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE tos_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderators ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_mode ENABLE ROW LEVEL SECURITY;
ALTER TABLE changelog_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE fbx_mashup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE fbx_mashups ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public read portfolio_images" ON portfolio_images;
  DROP POLICY IF EXISTS "Authenticated write portfolio_images" ON portfolio_images;
  DROP POLICY IF EXISTS "Public read portfolio_projects" ON portfolio_projects;
  DROP POLICY IF EXISTS "Authenticated write portfolio_projects" ON portfolio_projects;
  DROP POLICY IF EXISTS "Public read project_images" ON project_images;
  DROP POLICY IF EXISTS "Authenticated write project_images" ON project_images;
  DROP POLICY IF EXISTS "Public read before_after_sliders" ON before_after_sliders;
  DROP POLICY IF EXISTS "Authenticated write before_after_sliders" ON before_after_sliders;
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
  DROP POLICY IF EXISTS "Public read before_ordering_items" ON before_ordering_items;
  DROP POLICY IF EXISTS "Authenticated write before_ordering_items" ON before_ordering_items;
  DROP POLICY IF EXISTS "Public read tos_sections" ON tos_sections;
  DROP POLICY IF EXISTS "Authenticated write tos_sections" ON tos_sections;
  DROP POLICY IF EXISTS "Public read tos_versions" ON tos_versions;
  DROP POLICY IF EXISTS "Authenticated write tos_versions" ON tos_versions;
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
  DROP POLICY IF EXISTS "Public read moderators" ON moderators;
  DROP POLICY IF EXISTS "Authenticated write moderators" ON moderators;
  DROP POLICY IF EXISTS "Public read commission_submissions" ON commission_submissions;
  DROP POLICY IF EXISTS "Authenticated write commission_submissions" ON commission_submissions;
  DROP POLICY IF EXISTS "Public read moderation_log" ON moderation_log;
  DROP POLICY IF EXISTS "Authenticated write moderation_log" ON moderation_log;
  DROP POLICY IF EXISTS "Public read content_backups" ON content_backups;
  DROP POLICY IF EXISTS "Authenticated write content_backups" ON content_backups;
  DROP POLICY IF EXISTS "Public read commissions" ON commissions;
  DROP POLICY IF EXISTS "Authenticated write commissions" ON commissions;
  DROP POLICY IF EXISTS "Public read commission_revisions" ON commission_revisions;
  DROP POLICY IF EXISTS "Authenticated write commission_revisions" ON commission_revisions;
  DROP POLICY IF EXISTS "Public read commission_files" ON commission_files;
  DROP POLICY IF EXISTS "Authenticated write commission_files" ON commission_files;
  DROP POLICY IF EXISTS "Public read queue_config" ON queue_config;
  DROP POLICY IF EXISTS "Authenticated write queue_config" ON queue_config;
  DROP POLICY IF EXISTS "Public read notifications" ON notifications;
  DROP POLICY IF EXISTS "Authenticated write notifications" ON notifications;
  DROP POLICY IF EXISTS "Public read notification_settings" ON notification_settings;
  DROP POLICY IF EXISTS "Authenticated write notification_settings" ON notification_settings;
  DROP POLICY IF EXISTS "Public read roles" ON roles;
  DROP POLICY IF EXISTS "Authenticated write roles" ON roles;
  DROP POLICY IF EXISTS "Public read user_roles" ON user_roles;
  DROP POLICY IF EXISTS "Authenticated write user_roles" ON user_roles;
  DROP POLICY IF EXISTS "Public read audit_log" ON audit_log;
  DROP POLICY IF EXISTS "Authenticated write audit_log" ON audit_log;
  DROP POLICY IF EXISTS "Public read page_views" ON page_views;
  DROP POLICY IF EXISTS "Authenticated write page_views" ON page_views;
  DROP POLICY IF EXISTS "Public read search_index" ON search_index;
  DROP POLICY IF EXISTS "Authenticated write search_index" ON search_index;
  DROP POLICY IF EXISTS "Public read maintenance_mode" ON maintenance_mode;
  DROP POLICY IF EXISTS "Authenticated write maintenance_mode" ON maintenance_mode;
  DROP POLICY IF EXISTS "Public read changelog_entries" ON changelog_entries;
  DROP POLICY IF EXISTS "Authenticated write changelog_entries" ON changelog_entries;
  DROP POLICY IF EXISTS "Public read fbx_mashup_requests" ON fbx_mashup_requests;
  DROP POLICY IF EXISTS "Authenticated write fbx_mashup_requests" ON fbx_mashup_requests;
  DROP POLICY IF EXISTS "Public read fbx_mashups" ON fbx_mashups;
  DROP POLICY IF EXISTS "Authenticated write fbx_mashups" ON fbx_mashups;
END $$;

CREATE POLICY "Public read portfolio_images" ON portfolio_images FOR SELECT USING (true);
CREATE POLICY "Public read portfolio_projects" ON portfolio_projects FOR SELECT USING (true);
CREATE POLICY "Public read project_images" ON project_images FOR SELECT USING (true);
CREATE POLICY "Public read before_after_sliders" ON before_after_sliders FOR SELECT USING (true);
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (hidden IS NOT TRUE);
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
CREATE POLICY "Public read before_ordering_items" ON before_ordering_items FOR SELECT USING (true);
CREATE POLICY "Public read tos_sections" ON tos_sections FOR SELECT USING (true);
CREATE POLICY "Public read tos_versions" ON tos_versions FOR SELECT USING (true);
CREATE POLICY "Public read navigation_items" ON navigation_items FOR SELECT USING (true);
CREATE POLICY "Public read website_settings" ON website_settings FOR SELECT USING (true);
CREATE POLICY "Public read portfolio_categories" ON portfolio_categories FOR SELECT USING (true);
CREATE POLICY "Public read commission_form_fields" ON commission_form_fields FOR SELECT USING (true);
CREATE POLICY "Public read media_library" ON media_library FOR SELECT USING (true);
CREATE POLICY "Public read homepage_sections" ON homepage_sections FOR SELECT USING (true);
CREATE POLICY "Public read content_backups" ON content_backups FOR SELECT USING (true);
CREATE POLICY "Public read queue_config" ON queue_config FOR SELECT USING (true);
CREATE POLICY "Public read roles" ON roles FOR SELECT USING (true);
CREATE POLICY "Public read page_views" ON page_views FOR SELECT USING (true);
CREATE POLICY "Public read search_index" ON search_index FOR SELECT USING (true);
CREATE POLICY "Public read maintenance_mode" ON maintenance_mode FOR SELECT USING (true);
CREATE POLICY "Public read changelog_entries" ON changelog_entries FOR SELECT USING (published IS TRUE);
CREATE POLICY "Public read fbx_mashup_requests" ON fbx_mashup_requests FOR SELECT USING (false);
CREATE POLICY "Public read fbx_mashups" ON fbx_mashups FOR SELECT USING (visible IS TRUE);

CREATE POLICY "Public read moderators" ON moderators FOR SELECT USING (false);
CREATE POLICY "Public read commission_submissions" ON commission_submissions FOR SELECT USING (false);
CREATE POLICY "Public read moderation_log" ON moderation_log FOR SELECT USING (false);
CREATE POLICY "Public read commissions" ON commissions FOR SELECT USING (false);
CREATE POLICY "Public read commission_revisions" ON commission_revisions FOR SELECT USING (false);
CREATE POLICY "Public read commission_files" ON commission_files FOR SELECT USING (false);
CREATE POLICY "Public read notifications" ON notifications FOR SELECT USING (false);
CREATE POLICY "Public read notification_settings" ON notification_settings FOR SELECT USING (false);
CREATE POLICY "Public read user_roles" ON user_roles FOR SELECT USING (false);
CREATE POLICY "Public read audit_log" ON audit_log FOR SELECT USING (false);

CREATE POLICY "Authenticated write portfolio_images" ON portfolio_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write portfolio_projects" ON portfolio_projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write project_images" ON project_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write before_after_sliders" ON before_after_sliders FOR ALL USING (auth.role() = 'authenticated');
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
CREATE POLICY "Authenticated write before_ordering_items" ON before_ordering_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write tos_sections" ON tos_sections FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write tos_versions" ON tos_versions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write navigation_items" ON navigation_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write website_settings" ON website_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write portfolio_categories" ON portfolio_categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write commission_form_fields" ON commission_form_fields FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write media_library" ON media_library FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write homepage_sections" ON homepage_sections FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write moderators" ON moderators FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write commission_submissions" ON commission_submissions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write moderation_log" ON moderation_log FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write content_backups" ON content_backups FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write commissions" ON commissions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write commission_revisions" ON commission_revisions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write commission_files" ON commission_files FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write queue_config" ON queue_config FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write notifications" ON notifications FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write notification_settings" ON notification_settings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write roles" ON roles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write user_roles" ON user_roles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write audit_log" ON audit_log FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write page_views" ON page_views FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write search_index" ON search_index FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write maintenance_mode" ON maintenance_mode FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write changelog_entries" ON changelog_entries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write fbx_mashup_requests" ON fbx_mashup_requests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated write fbx_mashups" ON fbx_mashups FOR ALL USING (auth.role() = 'authenticated');

-- =============================================================================
-- STORAGE POLICIES
-- =============================================================================

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public uploads media" ON storage.objects;
  DROP POLICY IF EXISTS "Public reads media" ON storage.objects;
  DROP POLICY IF EXISTS "Public updates media" ON storage.objects;
  DROP POLICY IF EXISTS "Public deletes media" ON storage.objects;
END $$;

CREATE POLICY "Public uploads media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media');
CREATE POLICY "Public reads media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Public updates media" ON storage.objects FOR UPDATE USING (bucket_id = 'media');
CREATE POLICY "Public deletes media" ON storage.objects FOR DELETE USING (bucket_id = 'media');

-- =============================================================================
-- DEFAULT DATA (idempotent, non-destructive)
-- =============================================================================

INSERT INTO site_config (key, value) VALUES
  ('name', 'Bluey''s Avatar Commissions'),
  ('tagline', 'VRChat Avatar Edits • FBX Mashups • Custom Clothing • Textures • Optimisation'),
  ('description', 'Professional VRChat avatar commissions. FBX mashups, custom clothing, textures, materials, editing, and optimisation.'),
  ('discord', 'BlueyBarks'),
  ('discord_url', ''),
  ('queue_status', 'open'),
  ('queue_slots_total', '8'),
  ('queue_slots_used', '4'),
  ('queue_wait_time', '2-3 weeks'),
  ('queue_notes', 'Currently working through larger commissions. Small edits may be completed faster.'),
  ('queue_last_updated', '2026-07-11'),
  ('nsfw_rules', '{"requirements":["Ownership proof for all avatar bases","No stolen or leaked assets","Age verification for NSFW content"],"notAllowed":["Leaked avatars","Ripped avatars","Stolen assets","Pirated files","Unauthorised conversions"],"note":"Clients must provide proof of ownership for every avatar base used in NSFW commissions."}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO navigation_items (id, label, href, icon, sort_order, is_external, is_visible, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Home', '/', 'Home', 0, false, true, NOW(), NOW()),
  (gen_random_uuid(), 'Portfolio', '/portfolio', 'Package', 1, false, true, NOW(), NOW()),
  (gen_random_uuid(), 'Services', '/services', 'Scissors', 2, false, true, NOW(), NOW()),
  (gen_random_uuid(), 'FBX Mashups', '/fbx-mashups', 'Layers', 3, false, true, NOW(), NOW()),
  (gen_random_uuid(), 'Pricing', '/pricing', 'Tag', 4, false, true, NOW(), NOW()),
  (gen_random_uuid(), 'FAQ', '/faq', 'HelpCircle', 5, false, true, NOW(), NOW()),
  (gen_random_uuid(), 'Reviews', '/reviews', 'Star', 6, false, true, NOW(), NOW()),
  (gen_random_uuid(), 'Contact', '/contact', 'Phone', 7, false, true, NOW(), NOW()),
  (gen_random_uuid(), 'Commission', '/contact', 'Zap', 8, false, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO homepage_stats (label, value, suffix, sublabel, sort_order)
VALUES
  ('Commissions', '50+', '', 'Completed commissions', 0),
  ('Clients', '40+', '', 'Satisfied clients', 1),
  ('Rating', '5.0', '', 'Average client rating', 2),
  ('Reviews', '25+', '', 'Published reviews', 3),
  ('Blender', '5+', '', 'Years using Blender', 4),
  ('Unity', '5+', '', 'Years using Unity', 5),
  ('Response', '24h', '', 'Typical first reply time', 6),
  ('Delivery', '2-3w', '', 'Typical turnaround', 7)
ON CONFLICT DO NOTHING;

INSERT INTO hero_content (id, title, subtitle, description, primary_button_text, primary_button_url, secondary_button_text, secondary_button_url, image_url, image_alt, sort_order, created_at, updated_at)
SELECT
  gen_random_uuid(),
  'VRChat Avatar Studio',
  'FBX Mashups • Custom Clothing • Textures • Optimisation',
  'Professional VRChat avatar commissions. Specialising in FBX mashups, custom clothing, texture work, and performance optimisation.',
  'Start Commission',
  '/contact',
  'View Portfolio',
  '/portfolio',
  (SELECT url FROM site_images WHERE key = 'hero' LIMIT 1),
  'VRChat avatar commission showcase',
  0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM hero_content);

INSERT INTO services (id, title, emoji, image_url, "desc", features, sort_order, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Avatar Editing', '✏️', NULL, 'Texture recolours, accessory additions, clothing fitting, hair combinations, and small customisation edits for VRChat avatars.', ARRAY['Full avatar edit','Texture recolour','Clothing fit','Accessory add','1 revision included'], 0, NOW(), NOW()),
  (gen_random_uuid(), 'FBX Mashups', '🔧', NULL, 'Combine multiple avatar bases into a single custom avatar. Full rigging, texture work, and optimisation included.', ARRAY['Custom mashup','Full rigging','Texture bake','Unity setup','3 revisions included'], 1, NOW(), NOW()),
  (gen_random_uuid(), 'Custom Clothing', '👕', NULL, 'Custom clothing items fitted to your avatar. Tops, bottoms, accessories, and full outfit commissions.', ARRAY['Custom fit','Texture work','Material setup','Physics bones','2 revisions included'], 2, NOW(), NOW()),
  (gen_random_uuid(), 'Texturing', '🎨', NULL, 'Custom texture creation and editing. PBR materials, hand-painted details, and texture optimisation for VRChat.', ARRAY['PBR materials','Hand-painted','Texture optimisation','UDIM support','2 revisions included'], 3, NOW(), NOW()),
  (gen_random_uuid(), 'Optimisation', '⚡', NULL, 'Avatar optimisation for performance. Reduce draw calls, compress textures, and ensure Quest compatibility.', ARRAY['Draw call reduction','Texture compression','Quest compatible','Performance report','1 revision included'], 4, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO pricing_tiers (id, name, emoji, price, badge, popular, features, sort_order, is_nsfw, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Base Edit', '✏️', '£15', NULL, false, ARRAY['Full avatar edit','Texture recolour','1 revision','Performance friendly'], 0, false, NOW(), NOW()),
  (gen_random_uuid(), 'Standard', '🔧', '£30', 'Popular', true, ARRAY['Full customisation','Clothing fit','Accessories added','Weight painting','2 revisions'], 1, false, NOW(), NOW()),
  (gen_random_uuid(), 'Complex', '⚙️', '£55', NULL, false, ARRAY['FBX mashup','Advanced rigging','Multiple outfits','Unity SDK setup','3 revisions'], 2, false, NOW(), NOW()),
  (gen_random_uuid(), 'Custom Clothing', '👕', 'From £20', NULL, false, ARRAY['Custom fitted','Texture work','Material setup','Physics bones'], 3, false, NOW(), NOW()),
  (gen_random_uuid(), 'Optimisation', '⚡', 'From £10', NULL, false, ARRAY['Draw call reduction','Texture compression','Quest compatible','Performance report'], 4, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO workflow_steps (id, emoji, title, description, sort_order, created_at)
VALUES
  (gen_random_uuid(), '💬', 'Request', 'Message me with what you''re looking for and your avatar base.', 0, NOW()),
  (gen_random_uuid(), '📋', 'Planning', 'We discuss the details and I provide a quote before any work starts.', 1, NOW()),
  (gen_random_uuid(), '🎨', 'Development', 'I work on your avatar with regular progress updates.', 2, NOW()),
  (gen_random_uuid(), '🔁', 'Revisions', 'You review the work and request any changes until you''re happy.', 3, NOW()),
  (gen_random_uuid(), '📦', 'Delivery', 'Final files are sent after payment is complete.', 4, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO homepage_sections (id, section_key, label, visible, sort_order, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'hero', 'Hero', true, 0, NOW(), NOW()),
  (gen_random_uuid(), 'featured_work', 'Featured Work', true, 1, NOW(), NOW()),
  (gen_random_uuid(), 'services', 'Services', true, 2, NOW(), NOW()),
  (gen_random_uuid(), 'stats', 'Statistics', true, 4, NOW(), NOW()),
  (gen_random_uuid(), 'testimonials', 'Testimonials', true, 5, NOW(), NOW()),
  (gen_random_uuid(), 'process', 'Process', true, 6, NOW(), NOW()),
  (gen_random_uuid(), 'faq', 'FAQ', true, 7, NOW(), NOW()),
  (gen_random_uuid(), 'pricing', 'Pricing', true, 8, NOW(), NOW()),
  (gen_random_uuid(), 'availability', 'Commission Availability', true, 9, NOW(), NOW()),
  (gen_random_uuid(), 'cta', 'Call to Action', true, 10, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO roles (name, permissions, created_at) VALUES
  ('owner', '{"all":true}'::jsonb, NOW()),
  ('admin', '{"dashboard":true,"commissions":true,"queue":true,"reviews":true,"content":true,"settings":true,"users":true}'::jsonb, NOW()),
  ('moderator', '{"reviews":true,"submissions":true,"hide_content":true}'::jsonb, NOW()),
  ('content_editor', '{"content":true,"portfolio":true,"services":true,"pricing":true,"faq":true}'::jsonb, NOW())
ON CONFLICT (name) DO NOTHING;

INSERT INTO queue_config (id, is_open, status_text, status_color, slots_total, slots_used, wait_time, notes, updated_at)
SELECT gen_random_uuid(), TRUE, 'Open', 'green', 8, 0, '2-3 weeks', '', NOW()
WHERE NOT EXISTS (SELECT 1 FROM queue_config);

INSERT INTO notification_settings (notification_type, webhook_url, enabled, created_at, updated_at)
VALUES
  ('commission_submitted', NULL, TRUE, NOW(), NOW()),
  ('review_submitted', NULL, TRUE, NOW(), NOW()),
  ('contact_form_submitted', NULL, TRUE, NOW(), NOW()),
  ('queue_status_changed', NULL, TRUE, NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO maintenance_mode (id, enabled, message, allowed_ips, created_at, updated_at)
SELECT gen_random_uuid(), FALSE, '', '{}', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM maintenance_mode);

-- =============================================================================
-- SEED DATA: TOS, FORM FIELDS, CATEGORIES, BEFORE ORDERING
-- =============================================================================

INSERT INTO tos_sections (id, title, icon, description, items, type, is_visible, colour, card_style, sort_order, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Asset Ownership Policy', '🔒', 'All assets used in commissioned work must be legally owned by the client.', ARRAY[
    'Clients must own every avatar base used in commissions',
    'Proof of ownership required: purchase receipts, marketplace receipts, store confirmations, or creator confirmations',
    'If ownership cannot be verified, Bluey Commissions reserves the right to refuse the commission',
    'We do not work with leaked, ripped, stolen, or pirated assets',
    'Unauthorised conversions are not accepted'
  ], 'section', TRUE, 'accent', 'default', 0, NOW(), NOW()),
  (gen_random_uuid(), 'FBX Mashup Policy', '🧬', 'Rules for FBX mashup commissions.', ARRAY[
    'All avatar bases used in FBX mashups must be owned by the client',
    'Proof of ownership required for each base before work begins',
    'Mashups are delivered as single unified avatars',
    'Original rigging and weights are preserved where possible',
    'Client is responsible for ensuring they have rights to all components'
  ], 'section', TRUE, 'accent', 'default', 1, NOW(), NOW()),
  (gen_random_uuid(), 'Refund Policy', '💰', 'Important information about deposits, refunds, and cancellation fees.', ARRAY[
    '50% deposit required before work begins',
    'Deposits are non-refundable once work has started',
    'Refunds may be issued if work cannot be completed through no fault of the client',
    'Revision rounds are included in the base price - additional revisions may incur extra charges',
    'Cancelled commissions incur a cancellation fee covering work completed to date'
  ], 'warning', TRUE, 'warning', 'highlight', 2, NOW(), NOW()),
  (gen_random_uuid(), 'Behaviour Policy', '🤝', 'Expected conduct during the commission process.', ARRAY[
    'Clients must communicate respectfully at all times',
    'Harassment of any kind will result in immediate commission cancellation',
    'Abusive behaviour towards Bluey or other clients is not tolerated',
    'Deadlines must be agreed upon in advance and communicated clearly',
    'Reasonable communication delays are accepted - life happens'
  ], 'section', TRUE, 'accent', 'default', 3, NOW(), NOW()),
  (gen_random_uuid(), 'Blacklist Policy', '🚫', 'Serious consequences for TOS violations.', ARRAY[
    'Blacklisted users may be refused future commissions, updates, support, or any future services',
    'Reasons for blacklisting include: harassment, abuse, threats, fraud, chargeback abuse, lying, providing stolen assets, redistributing work, claiming work as their own, removing required credits, repeated TOS violations',
    'Blacklist status is permanent unless explicitly reviewed and overturned',
    'No explanation is required for blacklisting decisions',
    'Attempting to circumvent a blacklist will result in permanent exclusion'
  ], 'important', TRUE, 'danger', 'highlight', 4, NOW(), NOW()),
  (gen_random_uuid(), 'Privacy Policy', '🔐', 'How your personal information is handled.', ARRAY[
    'Personal information is collected only for commission purposes',
    'Data is not shared with third parties without consent',
    'Commission work may be featured in portfolio with client permission',
    'Discord usernames may be displayed in reviews if submitted',
    'Data can be deleted on request'
  ], 'section', TRUE, 'accent', 'default', 5, NOW(), NOW()),
  (gen_random_uuid(), 'Usage Rights', '📜', 'What you can and cannot do with commissioned work.', ARRAY[
    'Clients receive personal use rights to commissioned work',
    'Commercial use requires prior agreement and additional licensing',
    'Bluey Commissions retains the right to display work in portfolio',
    'Attribution credit is appreciated but not legally required unless specified',
    'Modifications by the client are allowed for personal use'
  ], 'section', TRUE, 'accent', 'default', 6, NOW(), NOW()),
  (gen_random_uuid(), 'Portfolio Rights', '🖼️', 'Rights regarding portfolio display of commissioned work.', ARRAY[
    'Commissioned work may be featured in portfolio and promotional materials',
    'Clients can request work be omitted from portfolio before commissioning',
    'NSFW work will only be displayed in age-verified sections',
    'Client attribution may be included in portfolio descriptions',
    'Portfolio display is at Bluey''s discretion'
  ], 'section', TRUE, 'accent', 'default', 7, NOW(), NOW()),
  (gen_random_uuid(), 'Client Responsibilities', '📋', 'What is expected from clients during a commission.', ARRAY[
    'Provide clear reference images and requirements',
    'Communicate feedback promptly during revision rounds',
    'Ensure all assets provided are legally owned or licensed',
    'Pay invoices on time as agreed',
    'Review work thoroughly before requesting additional revisions'
  ], 'section', TRUE, 'accent', 'default', 8, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO commission_form_fields (id, name, label, placeholder, type, required, options, max_size_mb, sort_order, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'name', 'Your Name', 'Enter your name', 'text', true, ARRAY[]::TEXT[], 10, 0, NOW(), NOW()),
  (gen_random_uuid(), 'discord', 'Discord Username', 'username#0000', 'text', true, ARRAY[]::TEXT[], 10, 1, NOW(), NOW()),
  (gen_random_uuid(), 'email', 'Email Address', 'your@email.com', 'email', false, ARRAY[]::TEXT[], 10, 2, NOW(), NOW()),
  (gen_random_uuid(), 'service_type', 'Service Type', 'Select a service', 'select', true, ARRAY['Avatar Editing','FBX Mashup','Custom Clothing','Texturing','Optimisation','Other'], 10, 3, NOW(), NOW()),
  (gen_random_uuid(), 'description', 'Project Description', 'Describe what you want...', 'textarea', true, ARRAY[]::TEXT[], 10, 4, NOW(), NOW()),
  (gen_random_uuid(), 'budget', 'Budget Range', '£XX - £XX', 'text', false, ARRAY[]::TEXT[], 10, 5, NOW(), NOW()),
  (gen_random_uuid(), 'deadline', 'Deadline', 'If you have one', 'text', false, ARRAY[]::TEXT[], 10, 6, NOW(), NOW()),
  (gen_random_uuid(), 'reference_links', 'Reference Links', 'Share links to references', 'textarea', false, ARRAY[]::TEXT[], 10, 7, NOW(), NOW()),
  (gen_random_uuid(), 'avatar_base', 'Avatar Base', 'Name of your avatar base', 'text', true, ARRAY[]::TEXT[], 10, 8, NOW(), NOW()),
  (gen_random_uuid(), 'proof_of_ownership', 'Proof of Ownership', 'Upload proof that you own this avatar base', 'file', true, ARRAY[]::TEXT[], 50, 9, NOW(), NOW()),
  (gen_random_uuid(), 'tos_agreement', 'Terms of Service', 'I agree to the Terms of Service', 'checkbox', true, ARRAY[]::TEXT[], 10, 10, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO portfolio_categories (id, name, sort_order, created_at)
VALUES
  (gen_random_uuid(), 'VRChat Avatars', 0, NOW()),
  (gen_random_uuid(), 'FBX Mashups', 1, NOW()),
  (gen_random_uuid(), 'Custom Clothing', 2, NOW()),
  (gen_random_uuid(), 'Textures', 3, NOW()),
  (gen_random_uuid(), 'Optimisation', 4, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO before_ordering_items (id, emoji, title, "desc", sort_order, created_at)
VALUES
  (gen_random_uuid(), '📋', 'Have your avatar base ready', 'Make sure you own or have rights to the avatar base you want edited.', 0, NOW()),
  (gen_random_uuid(), '🖼️', 'Gather reference images', 'Collect reference images showing what you want. The clearer the references, the better the result.', 1, NOW()),
  (gen_random_uuid(), '💬', 'Know your budget', 'Have an idea of your budget range. I''ll always provide a quote before starting.', 2, NOW()),
  (gen_random_uuid(), '📅', 'Consider your timeline', 'Think about your deadline. Complex commissions take longer.', 3, NOW()),
  (gen_random_uuid(), '📜', 'Read the Terms of Service', 'Make sure you understand the terms before ordering.', 4, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO fbx_mashups (id, title, model_a, model_b, price, description, image_url, how_to_get, tags, featured, sort_order, visible, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'Cyber Fox Mashup', 'Fox Avatar Base', 'Cyberpunk Avatar Base', '£45', 'A fusion of a fox avatar with cyberpunk aesthetics. Includes custom textures and full rigging.', NULL, 'Contact via Discord to purchase', ARRAY['Featured','Cyber'], true, 0, true, NOW(), NOW()),
  (gen_random_uuid(), 'Neon Wolf Mashup', 'Wolf Avatar Base', 'Neon Avatar Base', '£50', 'Combines a wolf base with neon elements. Perfect for streamers.', NULL, 'Contact via Discord to purchase', ARRAY['Featured','Neon'], true, 1, true, NOW(), NOW()),
  (gen_random_uuid(), 'Crystal Cat Mashup', 'Cat Avatar Base', 'Crystal Avatar Base', '£40', 'A delicate cat avatar merged with crystal-themed base. Soft pastel textures included.', NULL, 'Contact via Discord to purchase', ARRAY['Pastel','Cute'], false, 2, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING; 
