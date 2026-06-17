// utils/mergeJobs.js
// Merges manually-posted jobs (from /api/manual-jobs) into a list of live-pulled
// jobs so they appear seamlessly alongside each other. Featured manual jobs are
// bumped to the front; everything else is ordered by date, newest first.
export function mergeManualJobs(liveJobs = [], manualJobs = []) {
  const ids = new Set(liveJobs.map((j) => j.id));
  const merged = [...liveJobs, ...manualJobs.filter((j) => !ids.has(j.id))];
  return merged.sort((a, b) => {
    const af = a.featured ? 1 : 0;
    const bf = b.featured ? 1 : 0;
    if (af !== bf) return bf - af;
    return new Date(b.date || 0) - new Date(a.date || 0);
  });
}
