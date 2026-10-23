-- =============================================================================
-- New feature: "What I Won't Do" public page
-- =============================================================================
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> Paste -> Run
--
-- Adds the two tables that back the new /wont-do page:
--   * wont_do_categories  - the headings on the page
--   * wont_do_items      - the individual refusals underneath each heading
--
-- The content is edited from the admin panel ("What I Won't Do" tab) and is
-- read by the public page through GET /api/wont-do.
--
-- This script is idempotent: running it more than once is safe and produces the
-- same result. It only creates the two tables, one index and their row level
-- security policies. It does not read, modify or delete any existing data.
--
-- Visibility rules enforced here:
--   * Categories are public.
--   * Items are public ONLY while `visible = true`, so an unpublished item
--     cannot be read by an anonymous Supabase client even if it is rendered
--     somewhere by mistake.
--   * Writes require the authenticated or service_role role, matching every
--     other content table in this project.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Tables
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wont_do_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wont_do_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES wont_do_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS wont_do_items_category_idx ON wont_do_items (category_id);

-- -----------------------------------------------------------------------------
-- 2. Row level security
-- -----------------------------------------------------------------------------
ALTER TABLE wont_do_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE wont_do_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read wont_do_categories" ON wont_do_categories;
DROP POLICY IF EXISTS "Authenticated write wont_do_categories" ON wont_do_categories;
DROP POLICY IF EXISTS "Public read wont_do_items" ON wont_do_items;
DROP POLICY IF EXISTS "Authenticated write wont_do_items" ON wont_do_items;

CREATE POLICY "Public read wont_do_categories" ON wont_do_categories FOR SELECT USING (true);
CREATE POLICY "Authenticated write wont_do_categories" ON wont_do_categories FOR ALL USING ((auth.role() = 'authenticated' OR auth.role() = 'service_role'));
CREATE POLICY "Public read wont_do_items" ON wont_do_items FOR SELECT USING (visible = true);
CREATE POLICY "Authenticated write wont_do_items" ON wont_do_items FOR ALL USING ((auth.role() = 'authenticated' OR auth.role() = 'service_role'));

-- -----------------------------------------------------------------------------
-- 3. Verification (optional): should return two rows
-- -----------------------------------------------------------------------------
-- SELECT table_name FROM information_schema.tables
--  WHERE table_name IN ('wont_do_categories', 'wont_do_items')
--  ORDER BY table_name;
-- SELECT policyname, cmd FROM pg_policies
--  WHERE tablename IN ('wont_do_categories', 'wont_do_items')
--  ORDER BY tablename, policyname;
