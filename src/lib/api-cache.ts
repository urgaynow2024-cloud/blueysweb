/**
 * Minimal in-memory cache with a TTL and in-flight de-duplication.
 *
 * Why this exists
 * ---------------
 * The public site is client-rendered and several components fetch the
 * same tables on mount: the homepage, the Hero and FeaturedWork all
 * called getSiteImages(); the Hero and the availability panel both
 * called /api/queue/config(). Every page navigation also re-fetched
 * site config, pricing, FAQ and workflow from scratch.
 *
 * This module de-duplicates those reads:
 *   * concurrent callers share one in-flight request
 *   * successful responses are reused for a short TTL
 *
 * The TTL is deliberately short (tens of seconds, not minutes) so
 * content edits made in the admin panel still appear on the public
 * site almost immediately — caching must never make the site look
 * broken or stale, it only removes *duplicate* traffic.
 *
 * This is a per-browser-tab cache. It holds no secrets and never
 * persists to localStorage/sessionStorage.
 */

type CacheEntry<T> = { value: T; expires: number };

const store = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

export const DEFAULT_TTL_MS = 30_000;

/** Reads through the cache, sharing in-flight requests between callers. */
export function cached<T>(key: string, loader: () => PromiseLike<T>, ttlMs: number = DEFAULT_TTL_MS): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) {
    return Promise.resolve(hit.value as T);
  }

  const pending = inflight.get(key);
  if (pending) {
    return pending as Promise<T>;
  }

  const request = Promise.resolve(loader())
    .then((value) => {
      store.set(key, { value, expires: Date.now() + ttlMs });
      return value;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, request);
  return request;
}

/** Drops cached entries so the next read hits the source again. */
export function invalidateCache(prefix?: string): void {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const key of Array.from(store.keys())) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
