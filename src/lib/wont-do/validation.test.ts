import {
  CATEGORY_TITLE_MAX,
  DESCRIPTION_MAX,
  isUuid,
  cleanText,
  parseCategoryBody,
  parseDescription,
  parseItemBody,
  parseReorderBody,
  parseSortOrder,
  parseTitle,
  parseVisible,
} from "@/lib/wont-do/validation";

const UUID_A = "11111111-1111-1111-1111-111111111111";
const UUID_B = "22222222-2222-2222-2222-222222222222";

describe("isUuid", () => {
  it("accepts canonical uuids", () => {
    expect(isUuid(UUID_A)).toBe(true);
    expect(isUuid(UUID_A.toUpperCase())).toBe(true);
    expect(isUuid(` ${UUID_A} `)).toBe(true);
  });

  it("rejects anything that is not a uuid", () => {
    expect(isUuid("")).toBe(false);
    expect(isUuid("not-a-uuid")).toBe(false);
    expect(isUuid("11111111-1111-1111-1111-11111111111")).toBe(false);
    expect(isUuid("11111111-1111-1111-1111-1111111111111")).toBe(false);
    expect(isUuid(null)).toBe(false);
    expect(isUuid(undefined)).toBe(false);
    expect(isUuid(42)).toBe(false);
  });
});

describe("cleanText", () => {
  it("collapses whitespace and trims", () => {
    expect(cleanText("  hello   world  ")).toBe("hello world");
    expect(cleanText("line\n\nbreak")).toBe("line break");
  });

  it("turns missing values into an empty string", () => {
    expect(cleanText(null)).toBe("");
    expect(cleanText(undefined)).toBe("");
    expect(cleanText({})).toBe("");
  });
});

describe("parseTitle", () => {
  it("requires a value", () => {
    const result = parseTitle("   ", CATEGORY_TITLE_MAX);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/required/i);
  });

  it("rejects titles that are too long", () => {
    const result = parseTitle("x".repeat(CATEGORY_TITLE_MAX + 1), CATEGORY_TITLE_MAX);
    expect(result.ok).toBe(false);
  });

  it("accepts a title at the limit", () => {
    const result = parseTitle("x".repeat(CATEGORY_TITLE_MAX), CATEGORY_TITLE_MAX);
    expect(result.ok).toBe(true);
    expect(result.value).toHaveLength(CATEGORY_TITLE_MAX);
  });
});

describe("parseDescription", () => {
  it("keeps newlines so explanations stay readable", () => {
    const result = parseDescription("first line\r\nsecond line");
    expect(result.ok).toBe(true);
    expect(result.value).toBe("first line\nsecond line");
  });

  it("treats a missing description as empty", () => {
    const result = parseDescription(undefined);
    expect(result.ok).toBe(true);
    expect(result.value).toBe("");
  });

  it("rejects over-long descriptions", () => {
    const result = parseDescription("x".repeat(DESCRIPTION_MAX + 1));
    expect(result.ok).toBe(false);
  });

  it("rejects non-text descriptions", () => {
    const result = parseDescription({ text: "nope" });
    expect(result.ok).toBe(false);
  });
});

describe("parseSortOrder", () => {
  it("accepts whole numbers", () => {
    expect(parseSortOrder(3)).toEqual({ ok: true, value: 3 });
    expect(parseSortOrder("7")).toEqual({ ok: true, value: 7 });
  });

  it("rejects fractions, non numbers and out of range values", () => {
    expect(parseSortOrder(1.5).ok).toBe(false);
    expect(parseSortOrder("abc").ok).toBe(false);
    expect(parseSortOrder(-1).ok).toBe(false);
    expect(parseSortOrder(Number.NaN).ok).toBe(false);
    expect(parseSortOrder(null).ok).toBe(false);
  });
});

describe("parseVisible", () => {
  it("accepts booleans and their string forms", () => {
    expect(parseVisible(true)).toEqual({ ok: true, value: true });
    expect(parseVisible(false)).toEqual({ ok: true, value: false });
    expect(parseVisible("true")).toEqual({ ok: true, value: true });
    expect(parseVisible("false")).toEqual({ ok: true, value: false });
  });

  it("rejects anything else", () => {
    expect(parseVisible("yes").ok).toBe(false);
    expect(parseVisible(1).ok).toBe(false);
    expect(parseVisible(null).ok).toBe(false);
  });
});

describe("parseCategoryBody", () => {
  it("rejects a non object body", () => {
    expect(parseCategoryBody(null).ok).toBe(false);
    expect(parseCategoryBody("nope").ok).toBe(false);
    expect(parseCategoryBody([]).ok).toBe(false);
  });

  it("only validates the fields that are present", () => {
    const result = parseCategoryBody({ description: "hello" });
    expect(result.ok).toBe(true);
    expect(result.value).toEqual({ description: "hello" });
  });

  it("requires a title when asked", () => {
    const result = parseCategoryBody({ description: "hello" }, { requireTitle: true });
    expect(result.ok).toBe(false);
  });

  it("ignores unknown fields", () => {
    const result = parseCategoryBody({ title: "Valid", is_admin: true, id: UUID_A });
    expect(result.ok).toBe(true);
    expect(result.value).toEqual({ title: "Valid" });
  });
});

describe("parseItemBody", () => {
  it("validates the category reference", () => {
    expect(parseItemBody({ title: "Item", category_id: UUID_A }).ok).toBe(true);
    const bad = parseItemBody({ title: "Item", category_id: "nope" });
    expect(bad.ok).toBe(false);
    expect(bad.error).toMatch(/invalid category/i);
  });

  it("validates the publish flag", () => {
    expect(parseItemBody({ title: "Item", visible: false }).value).toMatchObject({
      visible: false,
    });
    expect(parseItemBody({ title: "Item", visible: "maybe" }).ok).toBe(false);
  });
});

describe("parseReorderBody", () => {
  it("accepts two ordered id lists", () => {
    const result = parseReorderBody({ categories: [UUID_A, UUID_B], items: [] });
    expect(result.ok).toBe(true);
    expect(result.value).toEqual({ categories: [UUID_A, UUID_B], items: [] });
  });

  it("rejects invalid ids and duplicates", () => {
    expect(parseReorderBody({ categories: ["nope"] }).ok).toBe(false);
    expect(parseReorderBody({ categories: [UUID_A, UUID_A] }).ok).toBe(false);
  });

  it("rejects a non list", () => {
    expect(parseReorderBody({ categories: UUID_A }).ok).toBe(false);
  });

  it("treats a missing list as empty", () => {
    const result = parseReorderBody({});
    expect(result.ok).toBe(true);
    expect(result.value).toEqual({ categories: [], items: [] });
  });
});
