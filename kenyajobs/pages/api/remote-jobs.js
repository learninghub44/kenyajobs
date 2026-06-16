export default async function handler(req, res) {
  try {
    const { category = "" } = req.query;
    const url = category
      ? `https://remotive.com/api/remote-jobs?category=${category}&limit=20`
      : `https://remotive.com/api/remote-jobs?limit=20`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Remotive fetch failed");
    const data = await response.json();
    res.status(200).json(data.jobs || []);
  } catch (error) {
    console.error("remote-jobs error:", error);
    res.status(500).json([]);
  }
}
