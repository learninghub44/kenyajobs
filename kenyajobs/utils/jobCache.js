// utils/jobCache.js
// Carries a job's data forward from a listing page to its detail page via sessionStorage,
// so the detail page doesn't have to re-fetch every live source and hope the same job
// (which may come from a slow/rate-limited RSS feed) reappears in the new response.
// Falls back gracefully if sessionStorage is unavailable (private browsing, SSR, etc.).

const PREFIX = "job-cache:";

export function saveJob(id, job) {
  if (typeof window === "undefined" || !id) return;
  try {
    window.sessionStorage.setItem(`${PREFIX}${id}`, JSON.stringify(job));
  } catch {
    // Storage full or unavailable — detail page will fall back to re-fetching.
  }
}

export function loadJob(id) {
  if (typeof window === "undefined" || !id) return null;
  try {
    const raw = window.sessionStorage.getItem(`${PREFIX}${id}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
