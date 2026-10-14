import { buildAdoptablePayload } from "@/lib/adoptables/server";

/**
 * These tests pin the behaviour of the server-side payload builder, which is
 * the boundary between the client and the database. A regression here is
 * invisible in the editor because the editor keeps the value in draft state;
 * it only surfaces on the public page, which reads the stored row.
 */
describe("buildAdoptablePayload", () => {
  it("passes title through unchanged", () => {
    const payload = buildAdoptablePayload({ title: "Lyra — Starbound Companion" });
    expect(payload.title).toBe("Lyra — Starbound Companion");
  });

  it("trims and stores non-empty titles", () => {
    const payload = buildAdoptablePayload({ title: "  Nimbus  " });
    expect(payload.title).toBe("Nimbus");
  });

  it("drops an empty title so a saved name is never overwritten with blank", () => {
    // Clearing the Name field in the editor must not null out or blank the
    // stored title: the column is NOT NULL, so an empty payload is the only
    // safe outcome, and the existing value survives untouched.
    const payload = buildAdoptablePayload({ title: "", description: "kept" });
    expect("title" in payload).toBe(false);
    expect(payload.description).toBe("kept");
  });

  it("drops a whitespace-only title for the same reason", () => {
    const payload = buildAdoptablePayload({ title: "   " });
    expect("title" in payload).toBe(false);
  });
});