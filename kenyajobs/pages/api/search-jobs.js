export default async function handler(req, res) {
  try {
    const { query = "" } = req.query;
    const response = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}+Kenya&page=1&num_pages=1`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
      }
    );
    if (!response.ok) throw new Error("Search fetch failed");
    const data = await response.json();
    res.status(200).json(data.data || []);
  } catch (error) {
    console.error("search-jobs error:", error);
    res.status(500).json([]);
  }
}
