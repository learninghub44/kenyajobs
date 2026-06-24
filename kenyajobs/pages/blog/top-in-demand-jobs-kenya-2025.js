import Head from "next/head";
import Link from "next/link";

const JOBS = [
  { rank: "01", title: "Software Engineer / Developer", sector: "Tech & Fintech", salary: "KES 120,000–350,000/mo", why: "Kenya's tech ecosystem continues to grow, with Nairobi remaining Africa's leading tech hub. Demand outstrips supply significantly, particularly for mobile, backend, and cloud engineers." },
  { rank: "02", title: "Data Analyst / Data Scientist", sector: "Finance, Telecom, NGO", salary: "KES 80,000–250,000/mo", why: "Every sector is building data capacity. SQL, Python, and Power BI/Tableau are the key skills. Roles in financial services and development sector NGOs are most abundant." },
  { rank: "03", title: "Agri-Tech Specialist", sector: "Agriculture & Development", salary: "KES 70,000–180,000/mo", why: "Precision agriculture, supply chain digitisation, and climate-smart farming are attracting major investment. Roles blend agronomist expertise with digital tools." },
  { rank: "04", title: "Cybersecurity Analyst", sector: "Banking, Government, NGO", salary: "KES 90,000–280,000/mo", why: "With increasing digitalisation of government services and mobile money, cybersecurity skills are critically short. CBK and NCBA are among the major hirers." },
  { rank: "05", title: "Health Information Systems Officer", sector: "Health & NGO", salary: "KES 60,000–150,000/mo", why: "USAID, WHO, and county health departments are investing heavily in health data systems. DHIS2 and OpenMRS experience is highly valued." },
  { rank: "06", title: "Supply Chain & Logistics Manager", sector: "FMCG, Manufacturing, NGO", salary: "KES 80,000–200,000/mo", why: "Post-pandemic supply chain disruptions have made experienced logistics managers precious. CIPS and APICS certifications significantly increase earning potential." },
  { rank: "07", title: "Digital Marketing Specialist", sector: "E-Commerce, Media, FMCG", salary: "KES 50,000–150,000/mo", why: "Every brand needs SEO, paid media, and social strategy. Specialists who can combine creative work with analytics command the highest salaries." },
  { rank: "08", title: "Renewable Energy Engineer", sector: "Energy & Utilities", salary: "KES 100,000–300,000/mo", why: "Kenya's renewable energy sector — particularly solar and geothermal — is one of the continent's most advanced. Engineers with installation and grid integration experience are in high demand." },
  { rank: "09", title: "Monitoring & Evaluation Officer", sector: "Development & NGO", salary: "KES 60,000–160,000/mo", why: "International donors are demanding rigorous impact measurement. M&E roles now require quantitative skills alongside programme knowledge." },
  { rank: "10", title: "Registered Nurse (Critical Care)", sector: "Health", salary: "KES 50,000–120,000/mo", why: "ICU, theatre, and anaesthesia-trained nurses are the most in-demand health workers. Both public sector and private hospitals have critical shortages." },
];

export default function InDemandJobs() {
  const SITE_URL = "https://kenyajobs.vercel.app";
  return (
    <>
      <Head>
        <title>The 10 Most In-Demand Jobs in Kenya in 2025 | KenyaJobs Blog</title>
        <meta name="description" content="The roles Kenyan employers are struggling to fill in 2025 — with salary ranges, required skills, and where to find these jobs." />
        <link rel="canonical" href={`${SITE_URL}/blog/top-in-demand-jobs-kenya-2025`} />
      </Head>
      <div style={{ fontFamily: "system-ui, sans-serif", background: "#F8F8F8", minHeight: "100vh" }}>
        <nav style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "12px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/" style={{ color: "#1B4FBD", fontWeight: 700, fontSize: "18px", textDecoration: "none" }}>KenyaJobs</Link>
          <Link href="/blog" style={{ color: "#6B7280", fontSize: "14px", textDecoration: "none", marginLeft: "auto" }}>← Back to Blog</Link>
        </nav>
        <main style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 24px" }}>
          <div style={{ marginBottom: "32px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#1B4FBD", textTransform: "uppercase", letterSpacing: "0.05em" }}>Job Market</span>
            <h1 style={{ fontSize: "34px", fontWeight: 800, color: "#111827", marginTop: "8px", marginBottom: "12px", lineHeight: 1.3 }}>The 10 Most In-Demand Jobs in Kenya in 2025</h1>
            <p style={{ color: "#6B7280", fontSize: "14px" }}>6 min read · May 2025</p>
          </div>
          <div style={{ color: "#374151", lineHeight: 1.85, fontSize: "16px" }}>
            <p>Kenya's job market is uneven: some roles attract hundreds of applications per vacancy while employers in other sectors can't find qualified candidates at any price. This list covers the latter — roles where skills shortages are driving up salaries and opening opportunities for candidates who upskill strategically.</p>
            <p style={{ marginTop: "16px" }}>Salary ranges are based on advertised listings and market surveys as of early 2025. They reflect mid-to-senior experience levels; entry-level roles will be at the lower end.</p>

            <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {JOBS.map(({ rank, title, sector, salary, why }) => (
                <div key={rank} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "20px 24px", display: "flex", gap: "20px" }}>
                  <span style={{ fontSize: "28px", fontWeight: 900, color: "#E5E7EB", flexShrink: 0, lineHeight: 1 }}>{rank}</span>
                  <div>
                    <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>{title}</h2>
                    <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#6B7280", marginBottom: "10px" }}>
                      <span>{sector}</span>
                      <span style={{ fontWeight: 600, color: "#059669" }}>{salary}</span>
                    </div>
                    <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.7 }}>{why}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "48px", padding: "24px", background: "#EFF6FF", borderRadius: "8px", border: "1px solid #BFDBFE" }}>
              <p style={{ fontWeight: 700, color: "#1E40AF", marginBottom: "8px" }}>Browse current openings</p>
              <p style={{ color: "#374151", marginBottom: "16px" }}>See live listings for these and thousands of other roles across Kenya.</p>
              <Link href="/" style={{ background: "#1B4FBD", color: "#fff", padding: "10px 20px", borderRadius: "6px", textDecoration: "none", fontWeight: 600, display: "inline-block" }}>View All Jobs →</Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
