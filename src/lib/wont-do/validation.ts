/**
 * Server-side validation for "What I Won't Do" write requests.
 *
 * Every write route parses its body through these helpers, so a malformed or
 * hostile payload can never reach the database unchecked. The functions are
 * pure and unit tested.
 */

export const CATEGORY_TITLE_MAX = 120;
export const ITEM_TITLE_MAX = 160;
export const DESCRIPTION_MAX = 600;
export const SORT_ORDER_MAX = 10000;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ValidationResult<T> {
  ok: boolean;
  value?: T;
  error?: string;
}

function fail<T>(error: string): ValidationResult<T> {
  return { ok: false, error };
}

function pass<T>(value: T): ValidationResult<T> {
  return { ok: true, value };
}

/** True for a canonical 8-4-4-4-12 UUID string. */
export function isUuid(input: unknown): boolean {
  return typeof input === "string" && UUID_RE.test(input.trim());
}

/**
 * Normalise free text: coerce to string, collapse whitespace, trim.
 * Returns an empty string for null/undefined so optional fields stay optional.
 */
export function cleanText(input: unknown): string {
  if (input === null || input === undefined) return "";
  if (typeof input !== "string" && typeof input !== "number") return "";
  return input.toString().replace(/\s+/g, " ").trim();
}

/** Validate a required title. */
export function parseTitle(input: unknown, max: number): ValidationResult<string> {
  const value = cleanText(input);
  if (!value) return fail("A title is required");
  if (value.length > max) return fail(`Title must be ${max} characters or fewer`);
  return pass(value);
}

/** Validate an optional description. */
export function parseDescription(input: unknown): ValidationResult<string> {
  if (input === null || input === undefined) return pass("");
  if (typeof input !== "string") return fail("Description must be text");
  const value = input.replace(/\r\n/g, "\n").trim();
  if (value.length > DESCRIPTION_MAX) {
    return fail(`Description must be ${DESCRIPTION_MAX} characters or fewer`);
  }
  return pass(value);
}

/** Validate a sort order. Accepts finite integers only. */
export function parseSortOrder(input: unknown): ValidationResult<number> {
  if (input === null || input === undefined) return fail("Sort order is required");
  const value = typeof input === "number" ? input : Number(input);
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return fail("Sort order must be a whole number");
  }
  if (value < 0 || value > SORT_ORDER_MAX) {
    return fail(`Sort order must be between 0 and ${SORT_ORDER_MAX}`);
  }
  return pass(value);
}

/** Validate the publish flag. */
export function parseVisible(input: unknown): ValidationResult<boolean> {
  if (input === true || input === false) return pass(input);
  if (input === "true") return pass(true);
  if (input === "false") return pass(false);
  return fail("Published must be true or false");
}

export interface CategoryInput {
  title?: string;
  description?: string;
  sort_order?: number;
}

/**
 * Parse a category body. Only the fields present in the payload are validated,
 * so a PUT can rename a category without resending its description.
 */
export function parseCategoryBody(
  body: unknown,
  { requireTitle = false }: { requireTitle?: boolean } = {}
): ValidationResult<CategoryInput> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return fail("Invalid request body");
  }
  const raw = body as Record<string, unknown>;
  const out: CategoryInput = {};

  if (raw.title !== undefined || requireTitle) {
    const title = parseTitle(raw.title, CATEGORY_TITLE_MAX);
    if (!title.ok) return fail(title.error!);
    out.title = title.value;
  }
  if (raw.description !== undefined) {
    const description = parseDescription(raw.description);
    if (!description.ok) return fail(description.error!);
    out.description = description.value;
  }
  if (raw.sort_order !== undefined) {
    const sort = parseSortOrder(raw.sort_order);
    if (!sort.ok) return fail(sort.error!);
    out.sort_order = sort.value;
  }
  return pass(out);
}

export interface ItemInput {
  category_id?: string;
  title?: string;
  description?: string;
  sort_order?: number;
  visible?: boolean;
}

/** Parse an item body. Only the fields present in the payload are validated. */
export function parseItemBody(
  body: unknown,
  { requireTitle = false }: { requireTitle?: boolean } = {}
): ValidationResult<ItemInput> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return fail("Invalid request body");
  }
  const raw = body as Record<string, unknown>;
  const out: ItemInput = {};

  if (raw.category_id !== undefined) {
    if (!isUuid(raw.category_id)) return fail("Invalid category");
    out.category_id = (raw.category_id as string).trim();
  }
  if (raw.title !== undefined || requireTitle) {
    const title = parseTitle(raw.title, ITEM_TITLE_MAX);
    if (!title.ok) return fail(title.error!);
    out.title = title.value;
  }
  if (raw.description !== undefined) {
    const description = parseDescription(raw.description);
    if (!description.ok) return fail(description.error!);
    out.description = description.value;
  }
  if (raw.sort_order !== undefined) {
    const sort = parseSortOrder(raw.sort_order);
    if (!sort.ok) return fail(sort.error!);
    out.sort_order = sort.value;
  }
  if (raw.visible !== undefined) {
    const visible = parseVisible(raw.visible);
    if (!visible.ok) return fail(visible.error!);
    out.visible = visible.value;
  }
  return pass(out);
}

/**
 * Parse a reorder payload: two ordered arrays of ids.
 * Ids must be unique, valid UUIDs, and every entry must exist in the table
 * the caller is reordering.
 */
export function parseReorderBody(
  body: unknown
): ValidationResult<{ categories: string[]; items: string[] }> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return fail("Invalid request body");
  }
  const raw = body as Record<string, unknown>;

  const readList = (value: unknown, label: string): ValidationResult<string[]> => {
    if (value === undefined) return pass([]);
    if (!Array.isArray(value)) return fail(`${label} must be a list of ids`);
    if (value.length > 500) return fail(`${label} list is too long`);
    const ids: string[] = [];
    for (const entry of value) {
      if (!isUuid(entry)) return fail(`${label} contains an invalid id`);
      const id = (entry as string).trim();
      if (ids.includes(id)) return fail(`${label} contains a duplicate id`);
      ids.push(id);
    }
    return pass(ids);
  };

  const categories = readList(raw.categories, "Categories");
  if (!categories.ok) return fail(categories.error!);
  const items = readList(raw.items, "Items");
  if (!items.ok) return fail(items.error!);

  return pass({ categories: categories.value!, items: items.value! });
}
