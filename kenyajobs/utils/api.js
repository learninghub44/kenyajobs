// utils/api.js — All API calls for KenyaJobs.co.ke
// Routes through internal Next.js API routes to avoid CORS and hide keys

// ─────────────────────────────────────────
// 1. REMOTIVE — Remote Jobs (No key needed)
// ─────────────────────────────────────────
export async function fetchRemoteJobs(category = "") {
  try {
    const url = category
      ? `/api/remote-jobs?category=${category}`
      : `/api/remote-jobs`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Remotive fetch failed");
    return await res.json();
  } catch (error) {
    console.error("fetchRemoteJobs error:", error);
    return [];
  }
}

// ─────────────────────────────────────────
// 2. JSEARCH — Entry Level Jobs
// ─────────────────────────────────────────
export async function fetchEntryLevelJobs(page = 1) {
  try {
    const res = await fetch(`/api/entry-level-jobs?page=${page}`);
    if (!res.ok) throw new Error("JSearch entry level fetch failed");
    return await res.json();
  } catch (error) {
    console.error("fetchEntryLevelJobs error:", error);
    return [];
  }
}

// ─────────────────────────────────────────
// 3. JSEARCH — Fresh Graduate Jobs
// ─────────────────────────────────────────
export async function fetchGraduateJobs(page = 1) {
  try {
    const res = await fetch(`/api/graduate-jobs?page=${page}`);
    if (!res.ok) throw new Error("JSearch graduate fetch failed");
    return await res.json();
  } catch (error) {
    console.error("fetchGraduateJobs error:", error);
    return [];
  }
}

// ─────────────────────────────────────────
// 4. ADZUNA — Work From Home Jobs
// ─────────────────────────────────────────
export async function fetchWFHJobs(page = 1) {
  try {
    const res = await fetch(`/api/wfh-jobs?page=${page}`);
    if (!res.ok) throw new Error("Adzuna fetch failed");
    return await res.json();
  } catch (error) {
    console.error("fetchWFHJobs error:", error);
    return [];
  }
}

// ─────────────────────────────────────────
// 5. SEARCH — Across all APIs
// ─────────────────────────────────────────
export async function searchJobs(query) {
  try {
    const res = await fetch(`/api/search-jobs?query=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Search fetch failed");
    return await res.json();
  } catch (error) {
    console.error("searchJobs error:", error);
    return [];
  }
}
