import {
  ADOPTABLE_STATUSES,
  ADOPTABLE_STATUS_META,
  canPurchase,
  isPubliclyListed,
  normalizeStatus,
  unavailabilityMessage,
  visibleForStatus,
} from "@/lib/adoptables/status";

describe("normalizeStatus", () => {
  it("accepts every valid lifecycle status", () => {
    for (const status of ADOPTABLE_STATUSES) {
      expect(normalizeStatus(status)).toBe(status);
    }
  });

  it("normalises mixed case and padding from legacy rows", () => {
    expect(normalizeStatus("Available")).toBe("available");
    expect(normalizeStatus("SOLD")).toBe("sold");
    expect(normalizeStatus("  Reserved  ")).toBe("reserved");
    expect(normalizeStatus("Hidden")).toBe("hidden");
  });

  it("maps known legacy aliases", () => {
    expect(normalizeStatus("in-progress")).toBe("pending");
    expect(normalizeStatus("claimed")).toBe("pending");
    expect(normalizeStatus("hold")).toBe("reserved");
    expect(normalizeStatus("draft")).toBe("hidden");
  });

  it("falls back to available so an unknown value can never hide a listing", () => {
    expect(normalizeStatus("wat")).toBe("available");
    expect(normalizeStatus(null)).toBe("available");
    expect(normalizeStatus(undefined)).toBe("available");
    expect(normalizeStatus(42)).toBe("available");
    expect(normalizeStatus({})).toBe("available");
  });

  it("derives hidden from the legacy visible flag when no status is given", () => {
    expect(normalizeStatus(undefined, false)).toBe("hidden");
    expect(normalizeStatus(null, false)).toBe("hidden");
    expect(normalizeStatus(undefined, true)).toBe("available");
  });

  it("prefers an explicit status over the visible flag", () => {
    expect(normalizeStatus("sold", true)).toBe("sold");
  });
});

describe("status metadata", () => {
  it("mirrors visible = status is not hidden", () => {
    for (const status of ADOPTABLE_STATUSES) {
      expect(visibleForStatus(status)).toBe(status !== "hidden");
    }
  });

  it("only hidden is unlisted, everything else stays in the public portfolio", () => {
    expect(isPubliclyListed("hidden")).toBe(false);
    for (const status of ["available", "pending", "reserved", "sold"] as const) {
      expect(isPubliclyListed(status)).toBe(true);
    }
  });

  it("allows claiming only while available or pending", () => {
    expect(canPurchase("available")).toBe(true);
    expect(canPurchase("pending")).toBe(true);
    expect(canPurchase("reserved")).toBe(false);
    expect(canPurchase("sold")).toBe(false);
    expect(canPurchase("hidden")).toBe(false);
  });

  it("gives every status a label and an explanation for the picker", () => {
    for (const status of ADOPTABLE_STATUSES) {
      const meta = ADOPTABLE_STATUS_META[status];
      expect(meta.label).toBe(status.toUpperCase());
      expect(meta.description.length).toBeGreaterThan(10);
    }
  });

  it("explains why an adoptable cannot be claimed", () => {
    expect(unavailabilityMessage("sold")).toMatch(/no longer available/i);
    expect(unavailabilityMessage("reserved")).toMatch(/reserved/i);
    expect(unavailabilityMessage("pending")).toMatch(/claimed/i);
  });

  it("survives a garbage status without throwing", () => {
    expect(() => unavailabilityMessage("nonsense")).not.toThrow();
    expect(canPurchase("nonsense")).toBe(true);
  });

  it("keeps every status visually distinct", () => {
    // The lifecycle relies on colour to separate states, so no two statuses may
    // collapse onto the same hue.
    const hues = ADOPTABLE_STATUSES.map((status) => ADOPTABLE_STATUS_META[status].dot);
    expect(new Set(hues).size).toBe(ADOPTABLE_STATUSES.length);
  });

  it("uses design tokens rather than the legacy blue palette", () => {
    // `sky-*` was the last raw Tailwind blue in the admin status metadata. Every
    // colour must now come from the theme so it cannot drift back to the old
    // Bluey's Creations blue.
    for (const status of ADOPTABLE_STATUSES) {
      const meta = ADOPTABLE_STATUS_META[status];
      for (const value of [meta.text, meta.bg, meta.border, meta.dot]) {
        expect(value).not.toMatch(/sky-|blue-/);
      }
    }
    expect(ADOPTABLE_STATUS_META.pending.dot).toBe("bg-[var(--accent-3)]");
  });
});