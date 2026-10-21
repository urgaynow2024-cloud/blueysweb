/**
 * Tree helpers for the "What I Won't Do" page.
 *
 * Pure functions shared by the public API route and the admin panel so both
 * agree on ordering and on what "published" means.
 */

import type { WontDoCategory, WontDoCategoryView, WontDoItem } from "./types";

/** Sort rows by `sort_order`, keeping the original order for ties. */
export function sortByOrder<T extends { sort_order: number }>(rows: T[]): T[] {
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) =>
      a.row.sort_order === b.row.sort_order
        ? a.index - b.index
        : a.row.sort_order - b.row.sort_order
    )
    .map((entry) => entry.row);
}

/** The sort order a newly appended row should use. */
export function nextSortOrder(rows: { sort_order: number }[]): number {
  if (rows.length === 0) return 0;
  return Math.max(...rows.map((row) => row.sort_order)) + 1;
}

/**
 * Build the public view of the page.
 *
 * Only published items are shown, and a category with no published items is
 * dropped entirely so the public page never renders an empty heading.
 */
export function buildPublicTree(
  categories: WontDoCategory[],
  items: WontDoItem[]
): WontDoCategoryView[] {
  const published = items.filter((item) => item.visible === true);
  const byCategory = new Map<string, WontDoItem[]>();

  for (const item of published) {
    const bucket = byCategory.get(item.category_id);
    if (bucket) bucket.push(item);
    else byCategory.set(item.category_id, [item]);
  }

  const views: WontDoCategoryView[] = [];
  for (const category of sortByOrder(categories)) {
    const own = sortByOrder(byCategory.get(category.id) ?? []);
    if (own.length === 0) continue;
    views.push({ ...category, items: own });
  }
  return views;
}

/** Items that belong to a category, in display order. */
export function itemsForCategory(
  items: WontDoItem[],
  categoryId: string
): WontDoItem[] {
  return sortByOrder(items.filter((item) => item.category_id === categoryId));
}

/**
 * Move an entry within a list and renumber it.
 * Returns a new array; the input is never mutated.
 */
export function moveWithin<T>(list: T[], from: number, to: number): T[] {
  if (from === to) return list.slice();
  if (from < 0 || from >= list.length) return list.slice();
  if (to < 0 || to >= list.length) return list.slice();
  const next = list.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/**
 * Renumber a list so its `sort_order` values are 0, 1, 2 ... matching the
 * array order. Used after a reorder so the database stays gap free.
 */
export function renumber<T extends { sort_order: number }>(list: T[]): T[] {
  return list.map((row, index) => ({ ...row, sort_order: index }));
}
