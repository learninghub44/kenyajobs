// lib/apiResponseCache.js
//
// In-memory cache for the live job aggregator API routes (remote-jobs, africa-jobs,
// entry-level-jobs, graduate-jobs, wfh-jobs, internship-jobs).
//
// Why this exists: those routes each fan out to 5-25 free third-party APIs / RSS feeds
// per request. Some of those upstreams (notably the free rss2json.com proxy used for
// LinkedIn/Indeed/Kenya RSS in africa-jobs.js) have low rate limits. Without a cache,
// every visitor — and especially every click of the homepage "Refresh" button — re-fires
// the full fan-out, which can exhaust those rate limits within minutes and makes the
// whole site appear to have "no jobs" until the upstream limit window resets.
//
// This cache sits in front of the upstream fan-out:
//   - Fresh cache (< freshMs old)  -> served instantly, no upstream calls at all.
//   - Stale cache (< staleMs old)  -> served instantly AND a background refresh is kicked
//                                     off (stale-while-revalidate), so users never wait on
//                                     a slow/rate-limited upstream and the cache self-heals.
//   - No cache + upstream fails    -> we still return the last known good data if we have
//                                     ANY, even if older than staleMs, rather than [].
//
// Note: Vercel serverless functions can spin up fresh instances, so this in-memory cache
// is best-effort per-instance — it is a defense-in-distress layer that significantly cuts
// upstream request volume in practice (most invocations on a given warm instance hit it),
// not a guarantee. It complements, not replaces, the `Cache-Control` header already set by
// each route for Vercel's edge/CDN cache.

const store = new Map(); // key -> { data, fetchedAt, refreshing }

const DEFAULT_FRESH_MS = 10 * 60 * 1000;   // serve straight from cache
const DEFAULT_STALE_MS = 60 * 60 * 1000;   // serve + revalidate in background
// Beyond STALE_MS we still keep the entry as an emergency fallback if upstream fails.

/**
 * Get-or-fetch with stale-while-revalidate semantics.
 * @param {string} key - cache key, e.g. "remote-jobs"
 * @param {() => Promise<any[]>} fetcher - async function that does the real upstream fan-out
 * @param {{freshMs?: number, staleMs?: number}} [opts]
 */
export async function cachedFetch(key, fetcher, opts = {}) {
  const freshMs = opts.freshMs ?? DEFAULT_FRESH_MS;
  const staleMs = opts.staleMs ?? DEFAULT_STALE_MS;
  const entry = store.get(key);
  const now = Date.now();

  if (entry) {
    const age = now - entry.fetchedAt;

    if (age < freshMs) {
      return entry.data;
    }

    if (age < staleMs) {
      // Serve stale immediately, refresh in background (only one refresh at a time).
      if (!entry.refreshing) {
        entry.refreshing = true;
        fetcher()
          .then((fresh) => {
            if (Array.isArray(fresh) && fresh.length > 0) {
              store.set(key, { data: fresh, fetchedAt: Date.now(), refreshing: false });
            } else {
              entry.refreshing = false; // keep old data, try again next time
            }
          })
          .catch(() => { entry.refreshing = false; });
      }
      return entry.data;
    }
  }

  // No entry, or entry is older than staleMs: do a real fetch now.
  try {
    const fresh = await fetcher();
    if (Array.isArray(fresh) && fresh.length > 0) {
      store.set(key, { data: fresh, fetchedAt: now, refreshing: false });
      return fresh;
    }
    // Upstream returned nothing — fall back to old data if we have any, rather than [].
    if (entry) return entry.data;
    return fresh; // genuinely nothing available yet
  } catch (err) {
    console.error(`[apiResponseCache:${key}] fetch failed:`, err.message);
    if (entry) return entry.data; // serve last known good, however old
    return [];
  }
}
