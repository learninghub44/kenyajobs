export default async function handler(req, res) {
  try {
    const { page = 1 } = req.query;
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    const response = await fetch(
      `https://api.adzuna.com/v1/api/jobs/ke/search/${page}?app_id=${appId}&app_key=${appKey}&results_per_page=20&what=work+from+home`
    );
    if (!response.ok) throw new Error("Adzuna fetch failed");
    const data = await response.json();
    res.status(200).json(data.results || []);
  } catch (error) {
    console.error("wfh-jobs error:", error);
    res.status(500).json([]);
  }
}
