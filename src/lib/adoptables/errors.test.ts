import { classifyAdoptablesError } from "@/lib/adoptables/errors";

/**
 * The Adoptables page used to render "Adoptables are not set up yet" for every
 * failure, and it did so *before* ever running the query, gated on a
 * `db_setup_completed` row that a manually-applied schema never creates. These
 * tests pin the behaviour that replaced it: each failure mode must be
 * distinguishable, and a real query error must never be relabelled as a
 * missing schema.
 */

describe("classifyAdoptablesError", () => {
  it("treats Postgres 42P01 as a genuinely missing table", () => {
    const f = classifyAdoptablesError({
      code: "42P01",
      message: 'relation "adoptables" does not exist',
    });
    expect(f.kind).toBe("table_missing");
  });

  it("treats PostgREST PGRST205 as a missing table too", () => {
    // This is what the public anon client actually receives, because the
    // request goes through PostgREST rather than straight to Postgres.
    const f = classifyAdoptablesError({
      code: "PGRST205",
      message: "Could not find the table 'public.adoptables' in the schema cache.",
    });
    expect(f.kind).toBe("table_missing");
  });

  it("treats an RLS denial as a permission error, not a missing table", () => {
    const f = classifyAdoptablesError({
      code: "42501",
      message: "permission denied for table adoptables",
    });
    expect(f.kind).toBe("permission_denied");
  });

  it("treats a row-level security message as a permission error", () => {
    const f = classifyAdoptablesError({
      code: "",
      message: "new row violates row-level security policy for table \"adoptables\"",
    });
    expect(f.kind).toBe("permission_denied");
  });

  it("treats a failed fetch as a network error", () => {
    const f = classifyAdoptablesError(new TypeError("Failed to fetch"));
    expect(f.kind).toBe("network");
  });

  it("treats DNS and connection failures as network errors", () => {
    expect(classifyAdoptablesError(new TypeError("getaddrinfo ENOTFOUND api.supabase.io")).kind).toBe(
      "network",
    );
  });

  it("keeps a genuine query error visible instead of calling it a missing table", () => {
    // The regression this guards: an unexpected query failure must not tell the
    // owner to re-run SQL they already ran.
    const f = classifyAdoptablesError({
      code: "42703",
      message: 'column "adoptables.nope" does not exist',
    });
    // A missing column is still a schema mismatch, but it is reported as a
    // query failure with the real code visible rather than the old generic
    // "tables missing" message.
    expect(f.kind).toBe("query");
    expect(f.code).toBe("42703");
    expect(f.message).toContain("nope");
  });

  it("preserves the database code and message for unknown failures", () => {
    const f = classifyAdoptablesError({ code: "PGRST116", message: "JSON object requested, multiple rows returned" });
    expect(f.kind).toBe("query");
    expect(f.code).toBe("PGRST116");
    expect(f.message).toMatch(/multiple rows/);
  });

  it("handles a thrown plain object without a message", () => {
    const f = classifyAdoptablesError({});
    expect(f.kind).toBe("query");
    expect(f.detail.length).toBeGreaterThan(0);
  });

  it("never reports a permission or query failure as a missing table", () => {
    // The specific failure that produced the "run schema.sql again" message.
    for (const err of [
      { code: "42501", message: "permission denied for table adoptables" },
      { code: "PGRST205", message: "schema cache" },
      { code: "08006", message: "connection failure" },
    ]) {
      const kind = classifyAdoptablesError(err).kind;
      if (kind === "table_missing") {
        // Only the genuine schema-cache miss is allowed to be table_missing.
        expect(err.code).toBe("PGRST205");
      }
    }
  });
});
