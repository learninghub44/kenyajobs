export default async function handler(req, res) {
  try {
    const { page = 1 } = req.query;
    const response = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=graduate+trainee+Kenya&page=${page}&num_pages=1`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
      }
    );
    if (!response.ok) throw new Error("JSearch graduate fetch failed");
    const data = await response.json();
    res.status(200).json(data.data || []);
  } catch (error) {
    console.error("graduate-jobs error:", error);
    res.status(500).json([]);
  }
}
