// How long a job stays on the site, and counted from when.
//
//  * Jobs imported from other sites: from the date the source says it was
//    posted, for JOB_MAX_AGE_DAYS (default 30).
//  * Jobs whose source gives no usable date (missing, 1970, garbage): counted
//    from the day we first saw them, for JOB_UNDATED_MAX_AGE_DAYS (default 14),
//    because we cannot verify they are recent.
//  * Some sources stamp "now" on every fetch. Taking the earlier of the
//    reported date and the day we first saw the job stops those from looking
//    brand new forever.
//  * A job whose application deadline has passed is dropped.
//  * Jobs posted from the admin: from the day they were created, for the
//    package duration, or JOB_MAX_AGE_DAYS when there is no package (see
//    manualJobExpirySql in lib/manualJobs.js).
// Pure functions only (no database access), so they are easy to test.
import { parseJobDate } from "./jobDate.js";
import { isDeadlinePassed } from "./jobOptions.js";

const DAY = 86_400_000;
const DATE_FIELDS = ["date", "publication_date", "job_posted_at_datetime_utc", "pubDate", "datePosted", "created_at", "createdAt"];

function clampDays(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isInteger(n) && n >= 1 && n <= 365 ? n : fallback;
}
export const getMaxAgeDays = (env = process.env) => clampDays(env.JOB_MAX_AGE_DAYS, 30);
export const getUndatedMaxAgeDays = (env = process.env) => clampDays(env.JOB_UNDATED_MAX_AGE_DAYS, 14);

export function reportedPostedDate(job = {}) {
  for (const field of DATE_FIELDS) {
    const d = parseJobDate(job[field]);
    if (d) return d;
  }
  return null;
}

function jobDeadlinePassed(job, now) {
  return [job.applicationDeadline, job.application_deadline, job.deadline, job.expiryDate, job.expiry_date]
    .some((value) => value && isDeadlinePassed(String(value), now));
}

// firstSeen: Map of job id -> Date (or ISO string) the job first entered the cache.
export function resolveFreshJobs(jobs, firstSeen = new Map(), { now = new Date(), maxAgeDays = getMaxAgeDays(), undatedMaxAgeDays = getUndatedMaxAgeDays() } = {}) {
  const fresh = [];
  for (const job of Array.isArray(jobs) ? jobs : []) {
    if (!job) continue;
    if (jobDeadlinePassed(job, now)) continue;
    const reported = reportedPostedDate(job);
    const seenRaw = firstSeen.get(String(job.id ?? job.job_id ?? ""));
    const seen = seenRaw ? parseJobDate(seenRaw) : null;
    const candidates = [reported, seen].filter(Boolean);
    const effective = candidates.length ? new Date(Math.min(...candidates.map((d) => d.getTime()))) : now;
    // A "posted" date in the future is wrong; never let it extend a job's life.
    const start = effective.getTime() > now.getTime() ? now : effective;
    const limitDays = reported ? maxAgeDays : undatedMaxAgeDays;
    if (now.getTime() - start.getTime() > limitDays * DAY) continue;
    fresh.push({ ...job, date: start.toISOString() });
  }
  return fresh;
}
