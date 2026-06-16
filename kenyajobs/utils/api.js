// utils/api.js — All API calls for KenyaJobs.co.ke

// ─────────────────────────────────────────
// 1. REMOTIVE — Remote Jobs (No key needed)
// ─────────────────────────────────────────
export async function fetchRemoteJobs(category = "") {
  try {
    const url = category
      ? `https://remotive.com/api/remote-jobs?category=${category}&limit=20`
      : `https://remotive.com/api/remote-jobs?limit=20`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Remotive fetch failed");
    const data = await res.json();
    return data.jobs || [];
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
    const res = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=entry+level+jobs+Kenya&page=${page}&num_pages=1`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
      }
    );
    if (!res.ok) throw new Error("JSearch entry level fetch failed");
    const data = await res.json();
    return data.data || [];
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
    const res = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=graduate+trainee+Kenya&page=${page}&num_pages=1`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
      }
    );
    if (!res.ok) throw new Error("JSearch graduate fetch failed");
    const data = await res.json();
    return data.data || [];
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
    const appId = process.env.NEXT_PUBLIC_ADZUNA_APP_ID;
    const appKey = process.env.NEXT_PUBLIC_ADZUNA_APP_KEY;

    const res = await fetch(
      `https://api.adzuna.com/v1/api/jobs/ke/search/${page}?app_id=${appId}&app_key=${appKey}&results_per_page=20&what=work+from+home`
    );
    if (!res.ok) throw new Error("Adzuna fetch failed");
    const data = await res.json();
    return data.results || [];
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
    const res = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}+Kenya&page=1&num_pages=1`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
      }
    );
    if (!res.ok) throw new Error("Search fetch failed");
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("searchJobs error:", error);
    return [];
  }
}