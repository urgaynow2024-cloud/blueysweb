import {
  buildPublicTree,
  itemsForCategory,
  moveWithin,
  nextSortOrder,
  renumber,
  sortByOrder,
} from "@/lib/wont-do/tree";
import type { WontDoCategory, WontDoItem } from "@/lib/wont-do/types";

const CAT_A = "11111111-1111-1111-1111-111111111111";
const CAT_B = "22222222-2222-2222-2222-222222222222";

function category(id: string, sort_order: number, title = "Category"): WontDoCategory {
  return { id, title, description: "", sort_order };
}

function item(
  id: string,
  category_id: string,
  sort_order: number,
  visible = true
): WontDoItem {
  return { id, category_id, title: `Item ${id}`, description: "", sort_order, visible };
}

describe("sortByOrder", () => {
  it("orders rows by sort_order", () => {
    const rows = [
      { sort_order: 2, id: "c" },
      { sort_order: 0, id: "a" },
      { sort_order: 1, id: "b" },
    ];
    expect(sortByOrder(rows).map((r) => r.id)).toEqual(["a", "b", "c"]);
  });

  it("keeps the original order for ties", () => {
    const rows = [
      { sort_order: 0, id: "a" },
      { sort_order: 0, id: "b" },
    ];
    expect(sortByOrder(rows).map((r) => r.id)).toEqual(["a", "b"]);
  });
});

describe("nextSortOrder", () => {
  it("starts at zero for an empty list", () => {
    expect(nextSortOrder([])).toBe(0);
  });

  it("continues after the highest row", () => {
    expect(nextSortOrder([{ sort_order: 0 }, { sort_order: 7 }])).toBe(8);
  });
});

describe("buildPublicTree", () => {
  it("returns only published items", () => {
    const tree = buildPublicTree(
      [category(CAT_A, 0)],
      [item("i1", CAT_A, 0, true), item("i2", CAT_A, 1, false)]
    );
    expect(tree).toHaveLength(1);
    expect(tree[0].items.map((i) => i.id)).toEqual(["i1"]);
  });

  it("keeps categories even without published items", () => {
    const tree = buildPublicTree(
      [category(CAT_A, 0), category(CAT_B, 1)],
      [item("i1", CAT_A, 0, true), item("i2", CAT_B, 1, false)]
    );
    expect(tree.map((c) => c.id)).toEqual([CAT_A, CAT_B]);
  });

  it("orders categories and their items", () => {
    const tree = buildPublicTree(
      [category(CAT_B, 1), category(CAT_A, 0)],
      [item("i2", CAT_A, 1), item("i1", CAT_A, 0)]
    );
    expect(tree.map((c) => c.id)).toEqual([CAT_A, CAT_B]);
    expect(tree[0].items.map((i) => i.id)).toEqual(["i1", "i2"]);
  });

  it("ignores items whose category is missing", () => {
    const tree = buildPublicTree([category(CAT_A, 0)], [item("i1", "missing", 0)]);
    expect(tree).toHaveLength(1);
  });

  it("returns an empty list when there is nothing published", () => {
    expect(buildPublicTree([], [])).toEqual([]);
  });
});

describe("itemsForCategory", () => {
  it("returns the items of one category in order", () => {
    const items = [
      item("i2", CAT_A, 1),
      item("i1", CAT_A, 0),
      item("i3", CAT_B, 0),
    ];
    expect(itemsForCategory(items, CAT_A).map((i) => i.id)).toEqual(["i1", "i2"]);
  });
});

describe("moveWithin", () => {
  it("moves an entry without mutating the input", () => {
    const list = ["a", "b", "c"];
    expect(moveWithin(list, 2, 0)).toEqual(["c", "a", "b"]);
    expect(list).toEqual(["a", "b", "c"]);
  });

  it("ignores out of range moves", () => {
    const list = ["a", "b"];
    expect(moveWithin(list, 0, 5)).toEqual(["a", "b"]);
    expect(moveWithin(list, -1, 0)).toEqual(["a", "b"]);
  });
});

describe("renumber", () => {
  it("renumbers rows to match their position", () => {
    const rows = [
      { id: "a", sort_order: 9 },
      { id: "b", sort_order: 4 },
    ];
    expect(renumber(rows).map((r) => r.sort_order)).toEqual([0, 1]);
  });
});


