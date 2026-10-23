/**
 * Classifies a Supabase/Postgres failure into a state the UI can act on.
 *
 * Why this exists
 * ---------------
 * The Adoptables page used to decide everything from one `site_config` row
 * (`db_setup_completed`) and a single catch-all "not set up" branch. That flag
 * is only ever written by the owner-only POST /api/setup/database handler, so a
 * database initialised by pasting `supabase/schema.sql` into the Supabase SQL
 * Editor never gets it — even though every table exists. The page then showed
 * "Adoptables are not set up yet" and never even attempted a query.
 *
 * That is the wrong shape: it collapsed a missing table, an RLS denial, a
 * network failure and a genuine query bug into one message that told the owner
 * to re-run SQL they had already run. Each of those needs a different response,
 * so they are separated here and the real Postgres code and message are carried
 * through for the query case rather than discarded.
 */

export type AdoptablesFailureKind =
  | "not_configured"
  | "table_missing"
  | "permission_denied"
  | "network"
  | "query";

export interface AdoptablesFailure {
  kind: AdoptablesFailureKind;
  /** Postgres error code, e.g. 42P01. Empty for network failures. */
  code: string;
  /** The database's own message, kept verbatim for the query case. */
  message: string;
  /** Human-readable summary for the UI. */
  detail: string;
}

/** Postgres SQLSTATE codes we can act on specifically. */
const PG_UNDEFINED_TABLE = "42P01"; // undefined_table
const PG_INSUFFICIENT_PRIVILEGE = "42501"; // insufficient_privilege
const PG_UNAUTHORIZED = "28000"; // invalid_authorization_specification

export class AdoptablesQueryError extends Error {
  readonly failure: AdoptablesFailure;

  constructor(failure: AdoptablesFailure) {
    super(failure.detail);
    this.name = "AdoptablesQueryError";
    this.failure = failure;
  }
}

/**
 * Postgres sometimes reports an RLS denial as a permission error and sometimes
 * as a row-count mismatch. PostgREST returns an empty array for a policy that
 * filters everything out, so a policy problem is frequently invisible — the
 * caller must treat "table readable but zero rows" as its own state, which it
 * does.
 */
export function classifyAdoptablesError(error: unknown): AdoptablesFailure {
  const raw =
    error && typeof error === "object"
      ? (error as { message?: string; code?: string })
      : { message: String(error ?? "") };

  const message = raw.message ?? "";
  const code = raw.code ?? "";

  // A fetch that never reached Supabase. supabase-js surfaces these as a
  // TypeError("Failed to fetch") or an AbortError.
  const isNetwork =
    (error instanceof TypeError && /fetch|network|load failed/i.test(message)) ||
    /failed to fetch|networkerror|load failed|econnrefused|enotfound|etimedout|aborted/i.test(
      message,
    ) ||
    (error as { name?: string })?.name === "AbortError";

  if (isNetwork) {
    return {
      kind: "network",
      code,
      message,
      detail: "Could not reach the database. This is usually a temporary network problem.",
    };
  }

  if (
    code === PG_UNDEFINED_TABLE ||
    // PostgREST answers a relation it cannot resolve with PGRST205 ("Could not
    // find the table 'public.x' in the schema cache") rather than Postgres' own
    // 42P01. Only the latter was checked before, so a genuinely missing table
    // could fall through to the generic query state.
    code === "PGRST205" ||
    /relation .* does not exist/i.test(message) ||
    /schema .* does not exist/i.test(message) ||
    /not find .* in the schema cache|schema cache/i.test(message)
  ) {
    // Note a missing *column* is deliberately NOT treated as a missing schema.
    // That is an app/database version mismatch, so it is reported as a query
    // failure with its real code and message intact rather than sending the
    // owner off to re-run the schema.
    return {
      kind: "table_missing",
      code: code || "42P01",
      message,
      detail: "The adoptables tables are not present in the connected Supabase project.",
    };
  }

  if (
    code === PG_INSUFFICIENT_PRIVILEGE ||
    code === PG_UNAUTHORIZED ||
    /row-level security|row level security|permission denied|not authorized|unauthorized/i.test(
      message,
    )
  ) {
    return {
      kind: "permission_denied",
      code: code || "42501",
      message,
      detail:
        "Supabase refused the read. The anon key is blocked by RLS or the table grants.",
    };
  }

  // Anything else is a real query problem and must stay visible rather than
  // being relabelled as "tables are missing".
  return {
    kind: "query",
    code,
    message,
    detail: message || "The adoptables query failed for an unknown reason.",
  };
}

/** Wraps a Supabase error so callers can branch on `failure.kind`. */
export function toAdoptablesQueryError(error: unknown): AdoptablesQueryError {
  if (error instanceof AdoptablesQueryError) return error;
  return new AdoptablesQueryError(classifyAdoptablesError(error));
}

export function notConfiguredFailure(): AdoptablesFailure {
  return {
    kind: "not_configured",
    code: "",
    message: "",
    detail: "This deployment is missing its Supabase public URL or anon key.",
  };
}
