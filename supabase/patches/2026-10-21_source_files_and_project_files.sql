-- =============================================================================
-- Terms of Service: new "Source Files and Project Files" section
-- =============================================================================
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> Paste -> Run
--
-- Purpose:
--   Adds a new TOS section that states source and working files are NOT part of a
--   commission by default, and are only provided at Bluey Commissions' discretion
--   (optionally for an additional fee agreed in advance).
--
-- Placement:
--   The new section is inserted directly after "Delivery of Digital Goods"
--   (id ...131, sort_order 20), so the document reads:
--       20. Delivery of Digital Goods
--       21. Source Files and Project Files   <-- new
--       22. Acceptance of Completed Work
--   ...and every following canonical section is shifted down by one.
--
-- Idempotency:
--   This script is safe to run more than once. If the section already exists the
--   renumbering step is skipped, the insert is skipped and the repair step leaves
--   the row where it is. It does not delete or recreate any other data.
--
-- It does NOT touch the FAQ. See the optional block at the bottom: the published
-- FAQ answer for "What files do I get?" still implies source files are handed over
-- on request, which is flagged for the owner's decision rather than changed here.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Make room for the new section: shift every section that currently sits at
--    or after sort_order 21 down by one.
--    Skipped entirely when the new section already exists, so re-running the
--    script cannot shuffle the document twice.
-- -----------------------------------------------------------------------------
UPDATE tos_sections
SET sort_order = sort_order + 1,
    updated_at = NOW()
WHERE sort_order >= 21
  AND NOT EXISTS (
    SELECT 1 FROM tos_sections WHERE id = '11111111-1111-1111-1111-111111111146'
  );

-- -----------------------------------------------------------------------------
-- 2. Insert the new section at sort_order 21.
--    No-op if the section already exists.
-- -----------------------------------------------------------------------------
INSERT INTO tos_sections (
  id, title, icon, section_type, content, items,
  highlight_box, box_type, box_title, sort_order, visible
)
SELECT
  '11111111-1111-1111-1111-111111111146',
  'Source Files and Project Files',
  '📂',
  'paragraphs',
  'Source and working files are not included in the price of a Commission unless this is explicitly agreed upon in advance.

Bluey Commissions is not obligated to provide any of the following, and none of these are supplied with a Commission unless we agree to include them:

- Blender `.blend` files
- Unity project files
- Editable source files
- Layered textures
- Scene files, rig files, or any other working files

You receive only the final deliverables that were explicitly agreed upon for your Commission. The digital files that make up the Completed Work are limited to those agreed deliverables, and never include source or working files unless we agree to provide them.

Providing source or project files is at our sole discretion. Where we agree to supply them, an additional fee may apply, and that fee must be agreed upon in advance before any files are handed over.

Purchasing a Commission does not transfer ownership of our source files, working files, or intellectual property rights beyond the usage rights granted to you under the Licence Granted to Clients section. All source files remain the property of Bluey Commissions unless ownership is explicitly transferred to you in writing.',
  '{}',
  'Source and project files are not included in a Commission unless agreed in advance, and may be subject to an additional fee.',
  'warning',
  'Source Files Not Included',
  21,
  TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM tos_sections WHERE id = '11111111-1111-1111-1111-111111111146'
);

-- -----------------------------------------------------------------------------
-- 3. Repair step: guarantee the new section ends up directly after
--    "Delivery of Digital Goods" even if it was moved by hand afterwards.
--    Everything between the two rows slides up by one and the new section takes
--    the freed slot.
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  v_delivery integer;
  v_new integer;
BEGIN
  SELECT sort_order INTO v_delivery
    FROM tos_sections WHERE id = '11111111-1111-1111-1111-111111111131';

  SELECT sort_order INTO v_new
    FROM tos_sections WHERE id = '11111111-1111-1111-1111-111111111146';

  IF v_delivery IS NOT NULL AND v_new IS NOT NULL AND v_new <> v_delivery + 1 THEN
    UPDATE tos_sections
       SET sort_order = sort_order - 1,
           updated_at = NOW()
     WHERE sort_order > v_delivery
       AND sort_order < v_new
       AND id <> '11111111-1111-1111-1111-111111111146';

    UPDATE tos_sections
       SET sort_order = v_delivery + 1,
           updated_at = NOW()
     WHERE id = '11111111-1111-1111-1111-111111111146';
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 4. Version metadata shown at the top and bottom of /tos.
--    A new section is an addition to the Terms, so the version moves 2.0 -> 2.1
--    and the "Last Updated" stamp moves to October 2026.
--    (Change these two values if you prefer a different version number.)
-- -----------------------------------------------------------------------------
UPDATE site_config SET value = '2.1',        updated_at = NOW() WHERE key = 'tos_version';
UPDATE site_config SET value = 'October 2026', updated_at = NOW() WHERE key = 'tos_last_updated';

-- =============================================================================
-- OPTIONAL - NOT APPLIED BY THIS SCRIPT
-- =============================================================================
-- Two further clauses conflict with the new section. They are left untouched so
-- the owner decides whether to change them. Uncomment the block you want.
--
-- (a) FAQ, "What files do I get?"
--     Current answer: "Unity-ready VRChat avatar files. Blender source files on
--     request."
--     "on request" reads as a standing offer and does not mention that source
--     files are not included in the price or that an extra fee may apply.
-- -----------------------------------------------------------------------------
-- UPDATE faq_items
-- SET answer = 'Unity-ready VRChat avatar files. Source and project files are not included by default; they are provided at our discretion and may require an additional fee agreed upon in advance.'
-- WHERE question = 'What files do I get?';
--
-- (b) Definitions, "Completed Work"
--     Current wording: "...including all digital files, edits, and modifications."
--     "all digital files" can be read as including working files. The new section
--     already limits the Completed Work to the agreed deliverables; this edit
--     makes the Definitions entry match.
-- -----------------------------------------------------------------------------
-- UPDATE tos_sections
-- SET content = replace(
--       content,
--       'including all digital files, edits, and modifications.',
--       'including the digital files that make up the agreed deliverables, edits, and modifications. Working and source files are not part of the Completed Work unless explicitly agreed upon in advance.'
--     ),
--     updated_at = NOW()
-- WHERE title = 'Definitions'
--   AND content LIKE '%including all digital files, edits, and modifications.%';

-- -----------------------------------------------------------------------------
-- Verification (optional): should list the section at sort_order 21
-- -----------------------------------------------------------------------------
-- SELECT title, sort_order, box_title FROM tos_sections
--  WHERE id = '11111111-1111-1111-1111-111111111146';
-- SELECT sort_order, title FROM tos_sections
--  WHERE id IN ('11111111-1111-1111-1111-111111111131',
--               '11111111-1111-1111-1111-111111111146',
--               '11111111-1111-1111-1111-111111111132')
--  ORDER BY sort_order;
-- SELECT key, value FROM site_config WHERE key IN ('tos_version', 'tos_last_updated');
