import { supabaseAdmin } from "@/lib/supabase";
import { normalizeStatus, visibleForStatus, type AdoptableStatus } from "./status";

/**
 * Every column the app is allowed to write on `adoptables`.
 *
 * `visible` is intentionally absent from writes: it is a mirror of the
 * lifecycle status and is derived on the server, so the two can never drift.
 */
export const ADOPTABLE_WRITABLE_FIELDS = [
  "title",
  "description",
  "category",
  "price",
  "availability",
  "featured",
  "sort_order",
  "species",
  "included_items",
  "rules_license",
  "vrchat_info",
  "sfw_price",
  "nsfw_price",
  "bundle_price",
  "sfw_price_usd",
  "nsfw_price_usd",
  "bundle_price_usd",
  "sfw_available",
  "nsfw_available",
  "bundle_available",
  "main_image",
  "main_image_path",
] as const;

export type AdoptableWritableField = (typeof ADOPTABLE_WRITABLE_FIELDS)[number];

const WRITABLE = new Set<string>(ADOPTABLE_WRITABLE_FIELDS);

/** Free-text fields are stored as NULL rather than "" so "no value" is unambiguous. */
const NULLABLE_TEXT = new Set<string>([
  "description",
  "category",
  "price",
  "species",
  "included_items",
  "rules_license",
  "vrchat_info",
  "sfw_price",
  "nsfw_price",
  "bundle_price",
  "sfw_price_usd",
  "nsfw_price_usd",
  "bundle_price_usd",
  "main_image",
  "main_image_path",
]);

/**
 * Builds a write payload from an untrusted request body.
 *
 * Only allow-listed columns are copied. When a status is present it is
 * normalised and `visible` is re-derived from it, which is what keeps the
 * database the single source of truth for the public lifecycle.
 */
export function buildAdoptablePayload(
  body: Record<string, unknown>,
  opts: { skip?: Set<string> } = {},
): Record<string, unknown> {
  const skip = opts.skip ?? new Set<string>();
  const payload: Record<string, unknown> = {};

  for (const [key, raw] of Object.entries(body)) {
    if (!WRITABLE.has(key) || skip.has(key)) continue;
    if (raw === undefined) continue;

    if (NULLABLE_TEXT.has(key)) {
      if (typeof raw !== "string") continue;
      const trimmed = raw.trim();
      payload[key] = trimmed.length > 0 ? trimmed : null;
      continue;
    }

    if (key === "availability") {
      const status = normalizeStatus(raw);
      payload.availability = status;
      payload.visible = visibleForStatus(status);
      continue;
    }

    if (key === "sort_order") {
      const num = Number(raw);
      payload.sort_order = Number.isFinite(num) ? Math.trunc(num) : 0;
      continue;
    }

    if (typeof raw === "boolean") {
      payload[key] = raw;
    }
  }

  // A caller that sends `visible` without a status still gets a consistent row.
  if (payload.availability === undefined && typeof body.visible === "boolean") {
    const status: AdoptableStatus = body.visible ? "available" : "hidden";
    payload.availability = status;
    payload.visible = visibleForStatus(status);
  }

  return payload;
}

function parseMissingColumn(errorMessage: string): string | null {
  const match = errorMessage.match(/'(\w+)'? column|Could not find the '(\w+)' column/);
  return match ? match[1] || match[2] : null;
}

export interface AdoptableWriteResult {
  row: Record<string, any> | null;
  error: string | null;
  /** Columns skipped because the deployed database does not have them yet. */
  skipped: string[];
}

/**
 * Runs an insert/update, retrying while the error is "column does not exist" so
 * a database that has not been migrated with the newest optional columns still
 * works instead of failing the whole save.
 *
 * The skip set is per-request rather than module-level, so one deployment
 * cannot permanently poison another request's payload.
 */
async function writeAdoptable(
  run: (payload: Record<string, unknown>) => PromiseLike<{ data: any; error: any }>,
  payload: Record<string, unknown>,
): Promise<AdoptableWriteResult> {
  const skip = new Set<string>();
  let current = payload;

  for (let attempt = 0; attempt < 6; attempt++) {
    const { data, error } = await run(current);
    if (!error) {
      return { row: data?.[0] ?? null, error: null, skipped: [...skip] };
    }

    const column = parseMissingColumn(error.message ?? "");
    if (column && !skip.has(column)) {
      skip.add(column);
      current = { ...current };
      delete current[column];
      if (column === "availability" || column === "visible") {
        delete current.availability;
        delete current.visible;
      }
      continue;
    }

    return { row: null, error: describeAvailabilityError(error.message ?? "Database error"), skipped: [...skip] };
  }

  return { row: null, error: "Max retries exceeded", skipped: [...skip] };
}

export async function createAdoptable(body: Record<string, unknown>): Promise<AdoptableWriteResult> {
  if (!supabaseAdmin) return { row: null, error: "Server not configured", skipped: [] };
  const payload = buildAdoptablePayload(body);
  if (!("title" in payload)) {
    payload.title = typeof body.title === "string" ? body.title.trim() : "";
  }
  return writeAdoptable(
    (p) => supabaseAdmin!.from("adoptables").insert([p]).select(),
    payload,
  );
}

export async function updateAdoptable(
  id: string,
  body: Record<string, unknown>,
): Promise<AdoptableWriteResult> {
  if (!supabaseAdmin) return { row: null, error: "Server not configured", skipped: [] };
  const payload = buildAdoptablePayload(body);
  if (Object.keys(payload).length === 0) {
    const { data, error } = await supabaseAdmin.from("adoptables").select("*").eq("id", id).single();
    return { row: data ?? null, error: error?.message ?? null, skipped: [] };
  }
  return writeAdoptable(
    (p) => supabaseAdmin!.from("adoptables").update(p).eq("id", id).select(),
    payload,
  );
}

/**
 * Postgres raises 23514 (check_violation) when the deployed `availability`
 * CHECK constraint predates the lifecycle migration. Reporting that verbatim
 * would just read "new row violates check constraint", so it is turned into an
 * instruction the admin can act on.
 */
function describeAvailabilityError(message: string): string {
  if (/23514|check constraint|availability/i.test(message)) {
    return (
      "This database has not been updated with the adoptable lifecycle migration yet, so it only " +
      "accepts available, sold and reserved. Run supabase/schema.sql in the Supabase SQL Editor to " +
      "enable pending and hidden."
    );
  }
  return message;
}

/**
 * Atomic status change used by the quick-status control and bulk actions.
 * Always mirrors `visible` so the public site reflects it immediately.
 */
export async function setAdoptableStatus(
  id: string,
  rawStatus: unknown,
): Promise<AdoptableWriteResult> {
  if (!supabaseAdmin) return { row: null, error: "Server not configured", skipped: [] };
  const status = normalizeStatus(rawStatus);
  const { data, error } = await supabaseAdmin
    .from("adoptables")
    .update({ availability: status, visible: visibleForStatus(status) })
    .eq("id", id)
    .select()
    .single();

  if (error) return { row: null, error: describeAvailabilityError(error.message), skipped: [] };
  return { row: data, error: null, skipped: [] };
}

export async function setAdoptableStatusBulk(
  ids: string[],
  rawStatus: unknown,
): Promise<{ updated: number; error: string | null }> {
  if (!supabaseAdmin) return { updated: 0, error: "Server not configured" };
  const status = normalizeStatus(rawStatus);
  const { data, error } = await supabaseAdmin
    .from("adoptables")
    .update({ availability: status, visible: visibleForStatus(status) })
    .in("id", ids)
    .select("id");
  if (error) return { updated: 0, error: describeAvailabilityError(error.message) };
  return { updated: data?.length ?? 0, error: null };
}

/** Removes an adoptable and the storage objects it owns. */
export async function deleteAdoptable(id: string): Promise<{ error: string | null }> {
  if (!supabaseAdmin) return { error: "Server not configured" };

  const [gallery, beforeAfter, row] = await Promise.all([
    supabaseAdmin.from("adoptable_gallery").select("path, storage_path, url").eq("adoptable_id", id),
    supabaseAdmin.from("adoptable_before_after").select("before_path, after_path").eq("adoptable_id", id),
    supabaseAdmin.from("adoptables").select("main_image_path").eq("id", id).single(),
  ]);

  const paths = new Set<string>();
  const addPath = (value: string | null | undefined) => {
    if (!value) return;
    const cleaned = value.replace(/^\/+/, "");
    if (cleaned && !/^https?:\/\//i.test(cleaned)) paths.add(cleaned);
  };

  for (const img of gallery.data ?? []) {
    addPath(img.path);
    addPath(img.storage_path);
  }
  for (const ba of beforeAfter.data ?? []) {
    addPath(ba.before_path);
    addPath(ba.after_path);
  }
  addPath(row.data?.main_image_path);

  if (paths.size > 0) {
    // Storage cleanup is best-effort: the database delete is what matters, and
    // an orphaned object must not block removing the listing.
    await supabaseAdmin.storage.from("portfolio-images").remove([...paths]);
  }

  // gallery and before_after rows cascade; delete them explicitly anyway so the
  // response is accurate on deployments without the FK cascade.
  await supabaseAdmin.from("adoptable_gallery").delete().eq("adoptable_id", id);
  await supabaseAdmin.from("adoptable_before_after").delete().eq("adoptable_id", id);

  const { error } = await supabaseAdmin.from("adoptables").delete().eq("id", id);
  return { error: error?.message ?? null };
}
