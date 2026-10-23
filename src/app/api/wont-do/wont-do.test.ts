/**
 * @jest-environment node
 */
import { GET as publicGet } from "@/app/api/wont-do/route";
import { GET as manageGet } from "@/app/api/wont-do/manage/route";
import { POST as createCategory } from "@/app/api/wont-do/categories/route";
import { PUT as updateCategory, DELETE as deleteCategory } from "@/app/api/wont-do/categories/[id]/route";
import { POST as createItem } from "@/app/api/wont-do/items/route";
import { PUT as updateItem, DELETE as deleteItem } from "@/app/api/wont-do/items/[id]/route";
import { POST as reorder } from "@/app/api/wont-do/reorder/route";

const CAT_ID = "11111111-1111-1111-1111-111111111111";
const CAT_ID_2 = "22222222-2222-2222-2222-222222222222";
const ITEM_ID = "33333333-3333-3333-3333-333333333333";
const HIDDEN_ITEM_ID = "44444444-4444-4444-4444-444444444444";

type Row = Record<string, any>;

let mockStore: { categories: Row[]; items: Row[] } = { categories: [], items: [] };
let mockCalls: { table: string; op: string; payload?: any; filters?: any[] }[] = [];
let mockAuth: { ok: boolean } = { ok: true };
let mockNextId = 1;

function mockBuilder(table: string) {
  const key = table === "wont_do_categories" ? "categories" : "items";
  const rows = () => (mockStore as any)[key] as Row[];
  let filters: any[] = [];
  let payload: any = null;
  let op = "select";

  const apply = () =>
    rows().filter((row) =>
      filters.every(([col, val]) =>
        Array.isArray(val) ? val.includes(row[col]) : row[col] === val
      )
    );

  const builder: any = {
    select: () => builder,
    insert: (p: any) => {
      op = "insert";
      payload = p;
      mockCalls.push({ table, op, payload: p, filters: [...filters] });
      return builder;
    },
    update: (p: any) => {
      op = "update";
      payload = p;
      mockCalls.push({ table, op, payload: p, filters: [...filters] });
      return builder;
    },
    delete: () => {
      op = "delete";
      mockCalls.push({ table, op, filters: [...filters] });
      return builder;
    },
    eq: (col: string, val: any) => {
      filters.push([col, val]);
      return builder;
    },
    in: (col: string, val: any) => {
      filters.push([col, val]);
      return builder;
    },
    order: () => builder,
    limit: () => builder,
    maybeSingle: async () => ({ data: apply()[0] ?? null, error: null }),
    single: async () => {
      if (op === "insert") {
        const created = {
          id: payload.id ?? `00000000-0000-0000-0000-${String(mockNextId++).padStart(12, "0")}`,
          ...payload,
        };
        rows().push(created);
        return { data: created, error: null };
      }
      const target = apply()[0];
      if (op === "update" && target) Object.assign(target, payload);
      return { data: target ?? null, error: null };
    },
    then: (resolve: any, reject: any) => {
      if (op === "update") {
        for (const row of apply()) Object.assign(row, payload);
      }
      if (op === "delete") {
        const doomed = apply();
        for (const row of doomed) {
          const index = rows().indexOf(row);
          if (index >= 0) rows().splice(index, 1);
        }
      }
      return Promise.resolve({ data: apply(), error: null }).then(resolve, reject);
    },
  };
  return builder;
}

jest.mock("@/lib/supabase", () => ({
  supabaseAdmin: { from: (table: string) => mockBuilder(table) },
  supabase: null,
  isSupabaseConfigured: true,
}));

jest.mock("@/lib/auth/guard", () => ({
  requireAdminSession: jest.fn(async () => {
    if (mockAuth.ok) return { ok: true, session: { role: "owner" } };
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }),
}));

function jsonRequest(body: unknown) {
  return new Request("https://example.test/api/wont-do", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function params(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  mockStore = {
    categories: [
      { id: CAT_ID, title: "Content", description: "", sort_order: 0 },
      { id: CAT_ID_2, title: "Empty", description: "", sort_order: 1 },
    ],
    items: [
      {
        id: ITEM_ID,
        category_id: CAT_ID,
        title: "Published item",
        description: "",
        sort_order: 0,
        visible: true,
      },
      {
        id: HIDDEN_ITEM_ID,
        category_id: CAT_ID,
        title: "Draft item",
        description: "",
        sort_order: 1,
        visible: false,
      },
    ],
  };
  mockCalls = [];
  mockAuth = { ok: true };
  mockNextId = 1;
});

describe("GET /api/wont-do (public)", () => {
  it("returns only published items and drops empty categories", async () => {
    const res = await publicGet();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.categories).toHaveLength(2);
    expect(body.categories[0].title).toBe("Content");
    expect(body.categories[0].items.map((i: any) => i.id)).toEqual([ITEM_ID]);
  });

  it("never sends unpublished items to the public", async () => {
    const res = await publicGet();
    const text = JSON.stringify(await res.json());
    expect(text).not.toContain("Draft item");
    expect(text).not.toContain(HIDDEN_ITEM_ID);
  });

  it("works without an admin session", async () => {
    mockAuth = { ok: false };
    const res = await publicGet();
    expect(res.status).toBe(200);
  });
});

describe("admin routes are protected", () => {
  it("rejects an unauthenticated read of the management endpoint", async () => {
    mockAuth = { ok: false };
    const res = await manageGet();
    expect(res.status).toBe(401);
  });

  it("rejects an unauthenticated category create", async () => {
    mockAuth = { ok: false };
    const res = await createCategory(jsonRequest({ title: "Nope" }));
    expect(res.status).toBe(401);
  });

  it("rejects an unauthenticated item create", async () => {
    mockAuth = { ok: false };
    const res = await createItem(jsonRequest({ title: "Nope", category_id: CAT_ID }));
    expect(res.status).toBe(401);
  });

  it("rejects an unauthenticated category update", async () => {
    mockAuth = { ok: false };
    const res = await updateCategory(jsonRequest({ title: "Nope" }), params(CAT_ID));
    expect(res.status).toBe(401);
  });

  it("rejects an unauthenticated item update", async () => {
    mockAuth = { ok: false };
    const res = await updateItem(jsonRequest({ title: "Nope" }), params(ITEM_ID));
    expect(res.status).toBe(401);
  });

  it("rejects an unauthenticated delete", async () => {
    mockAuth = { ok: false };
    const res = await deleteItem(new Request("https://example.test"), params(ITEM_ID));
    expect(res.status).toBe(401);
  });

  it("rejects an unauthenticated reorder", async () => {
    mockAuth = { ok: false };
    const res = await reorder(jsonRequest({ categories: [CAT_ID], items: [] }));
    expect(res.status).toBe(401);
  });
});

describe("GET /api/wont-do/manage", () => {
  it("returns unpublished items to an admin", async () => {
    const res = await manageGet();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.items.map((i: any) => i.id)).toContain(HIDDEN_ITEM_ID);
  });
});

describe("categories", () => {
  it("creates a category and appends it to the end", async () => {
    const res = await createCategory(jsonRequest({ title: "New category" }));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.category.title).toBe("New category");
    expect(body.category.sort_order).toBe(2);
  });

  it("rejects a category without a title", async () => {
    const res = await createCategory(jsonRequest({ description: "no title" }));
    expect(res.status).toBe(400);
  });

  it("rejects a body that is not an object", async () => {
    const res = await createCategory(
      new Request("https://example.test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(["nope"]),
      })
    );
    expect(res.status).toBe(400);
  });

  it("rejects an over-long title", async () => {
    const res = await createCategory(jsonRequest({ title: "x".repeat(200) }));
    expect(res.status).toBe(400);
  });

  it("renames a category", async () => {
    const res = await updateCategory(jsonRequest({ title: "Renamed" }), params(CAT_ID));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.category.title).toBe("Renamed");
  });

  it("only writes the fields that were sent", async () => {
    await updateCategory(jsonRequest({ title: "Renamed" }), params(CAT_ID));
    const update = mockCalls.find((c) => c.op === "update");
    expect(Object.keys(update!.payload!).sort()).toEqual(["title", "updated_at"]);
  });

  it("rejects an update with nothing to change", async () => {
    const res = await updateCategory(jsonRequest({}), params(CAT_ID));
    expect(res.status).toBe(400);
  });

  it("rejects an invalid id", async () => {
    const res = await updateCategory(jsonRequest({ title: "x" }), params("not-a-uuid"));
    expect(res.status).toBe(400);
  });

  it("deletes a category and its items", async () => {
    const res = await deleteCategory(new Request("https://example.test"), params(CAT_ID));
    expect(res.status).toBe(200);
    expect(mockStore.categories.map((c) => c.id)).not.toContain(CAT_ID);
    expect(mockStore.items.map((i) => i.id)).not.toContain(ITEM_ID);
  });
});

describe("items", () => {
  it("creates an item inside a category", async () => {
    const res = await createItem(
      jsonRequest({ category_id: CAT_ID, title: "New item" })
    );
    const body = await res.json();
    expect(res.status).toBe(201);
    expect(body.item.category_id).toBe(CAT_ID);
    expect(body.item.visible).toBe(true);
  });

  it("refuses an item for a category that does not exist", async () => {
    const res = await createItem(
      jsonRequest({
        category_id: "99999999-9999-9999-9999-999999999999",
        title: "Orphan",
      })
    );
    expect(res.status).toBe(404);
  });

  it("refuses an item without a category", async () => {
    const res = await createItem(jsonRequest({ title: "Orphan" }));
    expect(res.status).toBe(400);
  });

  it("unpublishes an item without deleting it", async () => {
    const res = await updateItem(jsonRequest({ visible: false }), params(ITEM_ID));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.item.visible).toBe(false);
    expect(mockStore.items.map((i) => i.id)).toContain(ITEM_ID);
  });

  it("republishes an item", async () => {
    await updateItem(jsonRequest({ visible: true }), params(HIDDEN_ITEM_ID));
    const res = await publicGet();
    const body = await res.json();
    expect(body.categories[0].items.map((i: any) => i.id)).toContain(HIDDEN_ITEM_ID);
  });

  it("deletes an item", async () => {
    const res = await deleteItem(new Request("https://example.test"), params(ITEM_ID));
    expect(res.status).toBe(200);
    expect(mockStore.items.map((i) => i.id)).not.toContain(ITEM_ID);
  });
});

describe("reorder", () => {
  it("renumbers categories in the given order", async () => {
    const res = await reorder(jsonRequest({ categories: [CAT_ID_2, CAT_ID], items: [] }));
    expect(res.status).toBe(200);
    expect(mockStore.categories.find((c) => c.id === CAT_ID_2)!.sort_order).toBe(0);
    expect(mockStore.categories.find((c) => c.id === CAT_ID)!.sort_order).toBe(1);
  });

  it("numbers items per category", async () => {
    await reorder(
      jsonRequest({
        categories: [],
        items: [HIDDEN_ITEM_ID, ITEM_ID],
      })
    );
    expect(mockStore.items.find((i) => i.id === HIDDEN_ITEM_ID)!.sort_order).toBe(0);
    expect(mockStore.items.find((i) => i.id === ITEM_ID)!.sort_order).toBe(1);
  });

  it("rejects unknown ids", async () => {
    const res = await reorder(
      jsonRequest({
        categories: ["99999999-9999-9999-9999-999999999999"],
        items: [],
      })
    );
    expect(res.status).toBe(400);
  });

  it("rejects a malformed id", async () => {
    const res = await reorder(jsonRequest({ categories: ["nope"], items: [] }));
    expect(res.status).toBe(400);
  });
});

