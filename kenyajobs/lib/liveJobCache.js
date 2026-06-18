// lib/liveJobCache.js
// Every *-jobs API route writes the jobs it returns into this cache (fire-and-forget,
// never blocks the response). The job detail page reads from it as a fast, reliable
// fallback instead of re-querying every live source from scratch — which is what made
// some jobs intermittently fail to load on direct links / new tabs (a job can rotate out
// of an upstream feed's top-N window, or one of ~15 sources can simply time out on a given
// request, between when a job was first seen and when its detail page is opened).
import { query } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/db";

const MAX_BATCH = 200;

// Best-effort, non-blocking. Callers should NOT await this on the response's critical path.
export async function cacheJobs(jobs) {
  if (!isDatabaseConfigured() || !Array.isArray(jobs) || jobs.length === 0) return;
  const batch = jobs.filter((j) => j && j.id).slice(0, MAX_BATCH);
  if (batch.length === 0) return;

  try {
    // Bulk upsert via unnest — one round trip regardless of batch size.
    const ids = batch.map((j) => String(j.id));
    const data = batch.map((j) => JSON.stringify(j));
    await query(
      `INSERT INTO live_job_cache (id, data, updated_at)
       SELECT id, data, now() FROM unnest($1::text[], $2::jsonb[]) AS t(id, data)
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
      [ids, data]
    );
  } catch (err) {
    console.error("liveJobCache.cacheJobs error:", err.message);
  }
}

export async function getCachedJob(id) {
  if (!isDatabaseConfigured()) return null;
  try {
    const { rows } = await query(`SELECT data FROM live_job_cache WHERE id = $1`, [String(id)]);
    return rows[0] ? rows[0].data : null;
  } catch (err) {
    console.error("liveJobCache.getCachedJob error:", err.message);
    return null;
  }
}
