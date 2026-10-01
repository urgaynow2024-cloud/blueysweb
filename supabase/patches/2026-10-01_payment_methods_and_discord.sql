-- =============================================================================
-- Policy update: payment methods + Discord requirement
-- =============================================================================
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> Paste -> Run
--
-- Approved by the site owner on 2026-10-01:
--   * PayPal is the ONLY accepted payment method.
--     Stripe, bank transfer, card payments, Payhip and cryptocurrency are not
--     accepted.
--   * Clients MUST join the Bluey's Creation Discord server before a commission
--     can be accepted. The PayPal invoice and payment details are provided
--     through Discord.
--
-- This script is idempotent: running it more than once is safe and produces the
-- same result. It only touches the two policy rows described below and does not
-- delete or recreate any other data.
--
-- It deliberately does NOT touch the revision-request window. That policy is
-- still unresolved (the Terms currently say 7 days in "Revisions" and 48 hours
-- in "Acceptance of Completed Work").
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Terms of Service -> "Payment Terms" (sort_order 15)
-- -----------------------------------------------------------------------------
UPDATE tos_sections
SET content = 'Payment is required via the method specified during the commission process. All prices are in GBP unless otherwise stated.

A deposit (typically 50% of the estimated total) is required to commence work. The remaining balance (50%) is due before final delivery of the Completed Work.

**PayPal is the only accepted payment method.** All commissions are paid via a PayPal invoice issued by Bluey''s Creation. No other payment method is accepted, including card payments, Stripe, Payhip, bank transfer, or cryptocurrency.

**Clients must join the Bluey''s Creation Discord server before a commission can be accepted.** The PayPal invoice and all payment details are provided through Discord. Commissions from clients who have not joined the server cannot be accepted or processed.

Late payments may result in delays to the commission timeline or cancellation of the commission.',
    highlight_box = 'PayPal only. Clients must join the Discord server before a commission can be accepted.',
    updated_at = NOW()
WHERE title = 'Payment Terms';

-- -----------------------------------------------------------------------------
-- 2. Terms of Service -> "Privacy": Stripe is no longer used as a payment
--    processor, so it must not be listed as a third-party service.
-- -----------------------------------------------------------------------------
UPDATE tos_sections
SET content = replace(
      content,
      'We may use third-party platforms (Discord, Stripe, PayPal) for communication and payment processing.',
      'We may use third-party platforms (Discord and PayPal) for communication and payment processing.'
    ),
    updated_at = NOW()
WHERE title = 'Privacy'
  AND content LIKE '%Discord, Stripe, PayPal%';

-- -----------------------------------------------------------------------------
-- 3. FAQ -> payment methods
-- -----------------------------------------------------------------------------
UPDATE faq_items
SET answer = 'PayPal only, via a PayPal invoice issued by Bluey''s Creation. A 50% deposit is required before work begins.'
WHERE question = 'What payment methods?';

-- -----------------------------------------------------------------------------
-- 4. FAQ -> how to pay (adds the Discord requirement)
-- -----------------------------------------------------------------------------
UPDATE faq_items
SET answer = 'Payment is via a PayPal invoice. You must join the Discord server first, as the invoice and payment details are sent there. 50% deposit required before work starts, balance before delivery.'
WHERE question = 'How do I pay?';

-- -----------------------------------------------------------------------------
-- 5. FAQ -> Discord membership (added; no-op if it already exists)
-- -----------------------------------------------------------------------------
INSERT INTO faq_items (question, answer, sort_order)
SELECT 'Do I need to join the Discord server?',
       'Yes. Clients must join the Bluey''s Creation Discord server before a commission can be accepted, because invoices and payment details are provided there.',
       COALESCE((SELECT MAX(sort_order) + 1 FROM faq_items), 0)
WHERE NOT EXISTS (
  SELECT 1 FROM faq_items WHERE question = 'Do I need to join the Discord server?'
);

-- -----------------------------------------------------------------------------
-- Verification (optional): should return the updated rows
-- -----------------------------------------------------------------------------
-- SELECT title, highlight_box FROM tos_sections WHERE title = 'Payment Terms';
-- SELECT question, answer FROM faq_items WHERE question ILIKE '%payment%' OR question ILIKE '%discord%';
-- SELECT title, content FROM tos_sections WHERE title IN ('Payment Terms','Privacy');