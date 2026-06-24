import Head from "next/head";
import Link from "next/link";

export default function CVArticle() {
  const SITE_URL = "https://kenyajobs.vercel.app";
  return (
    <>
      <Head>
        <title>How to Write a CV That Gets Shortlisted in Kenya | KenyaJobs Blog</title>
        <meta name="description" content="Step-by-step guide to writing a Kenyan CV that beats ATS systems and impresses hiring managers. Includes templates, dos and don'ts, and real examples." />
        <link rel="canonical" href={`${SITE_URL}/blog/how-to-write-a-kenyan-cv`} />
      </Head>
      <div style={{ fontFamily: "system-ui, sans-serif", background: "#F8F8F8", minHeight: "100vh" }}>
        <nav style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "12px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/" style={{ color: "#1B4FBD", fontWeight: 700, fontSize: "18px", textDecoration: "none" }}>KenyaJobs</Link>
          <Link href="/blog" style={{ color: "#6B7280", fontSize: "14px", textDecoration: "none", marginLeft: "auto" }}>← Back to Blog</Link>
        </nav>
        <main style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 24px" }}>
          <div style={{ marginBottom: "32px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#1B4FBD", textTransform: "uppercase", letterSpacing: "0.05em" }}>CV & Applications</span>
            <h1 style={{ fontSize: "34px", fontWeight: 800, color: "#111827", marginTop: "8px", marginBottom: "12px", lineHeight: 1.3 }}>How to Write a CV That Gets Shortlisted in Kenya</h1>
            <p style={{ color: "#6B7280", fontSize: "14px" }}>8 min read · June 2025</p>
          </div>
          <div style={{ color: "#374151", lineHeight: 1.85, fontSize: "16px" }}>
            <p>Most Kenyan job seekers are rejected before their CV is read by a human being. Applicant Tracking Systems (ATS) — software used by large employers — scan CVs for keywords before a recruiter ever opens your file. If your CV doesn't pass the algorithm, you're out.</p>
            <p style={{ marginTop: "20px" }}>Here's a practical, step-by-step guide to writing a CV that works in the Kenyan job market in 2025.</p>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "36px", marginBottom: "12px" }}>1. Start With a Tailored Summary</h2>
            <p>The top section of your CV — the professional summary — should be rewritten for every job application. It should be 2–3 sentences that directly mirror the job description. If the job asks for "5 years in B2B sales", your summary should say "5+ years in B2B sales".</p>
            <p style={{ marginTop: "12px" }}>Avoid generic openers like "I am a hardworking individual seeking a challenging role". These tell the reader nothing. Lead with your strongest qualification for that specific role.</p>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "36px", marginBottom: "12px" }}>2. Format for ATS, Not Just Humans</h2>
            <p>Many Kenyan job seekers use elaborate table-based or two-column CV templates. These look attractive in Microsoft Word but break catastrophically when processed by ATS software. The safest format is:</p>
            <ul style={{ paddingLeft: "24px", marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>Single-column layout with clear section headings</li>
              <li>Standard fonts: Calibri, Arial, Georgia (10–12pt body)</li>
              <li>No text boxes, headers/footers with important info, or embedded images</li>
              <li>Save as .docx for ATS submissions; PDF only when explicitly allowed</li>
            </ul>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "36px", marginBottom: "12px" }}>3. Quantify Every Achievement</h2>
            <p>The single biggest difference between CVs that get calls and CVs that don't is numbers. Recruiters respond to specifics because they can compare them.</p>
            <p style={{ marginTop: "12px" }}>Instead of: <em>"Managed a sales team"</em><br />Write: <em>"Managed a 6-person B2B sales team, growing revenue by 34% in 12 months to KES 18M annual target"</em></p>
            <p style={{ marginTop: "12px" }}>If you don't have exact numbers, estimate honestly: "Served approximately 80 customers daily" is far better than "Served customers".</p>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "36px", marginBottom: "12px" }}>4. Match Keywords From the Job Description</h2>
            <p>Read the job description carefully and identify the key skills and qualifications. Then make sure those exact phrases appear in your CV — not synonyms, the same words. If the JD says "stakeholder management", use that exact phrase.</p>
            <p style={{ marginTop: "12px" }}>This is not about lying. It's about translation: the things you've done map to these terms. Your job is to make that match explicit.</p>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "36px", marginBottom: "12px" }}>5. What to Include (and Exclude)</h2>
            <p><strong>Include:</strong> Contact info (phone, professional email, LinkedIn if active), professional summary, work experience (reverse chronological), education, certifications, key skills.</p>
            <p style={{ marginTop: "12px" }}><strong>Exclude:</strong> Photo, ID number, date of birth, marital status, nationality (unless specifically requested), references (say "available on request"), hobbies unless directly relevant.</p>
            <p style={{ marginTop: "12px" }}>Keep it to 1 page if you have under 3 years experience; 2 pages maximum for most roles. Hiring managers spend an average of 7 seconds on first review.</p>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "36px", marginBottom: "12px" }}>6. The Cover Letter Still Matters</h2>
            <p>Many Kenyan job seekers skip the cover letter or attach a generic template. This is a mistake for roles in NGOs, government, finance, and mid-to-senior positions. A well-written, specific cover letter can put you ahead of candidates with stronger CVs.</p>
            <p style={{ marginTop: "12px" }}>Check the <Link href="/cv-tips" style={{ color: "#1B4FBD" }}>CV Tips page</Link> for our complete cover letter guide.</p>

            <div style={{ marginTop: "48px", padding: "24px", background: "#EFF6FF", borderRadius: "8px", border: "1px solid #BFDBFE" }}>
              <p style={{ fontWeight: 700, color: "#1E40AF", marginBottom: "8px" }}>Ready to apply?</p>
              <p style={{ color: "#374151", marginBottom: "16px" }}>Browse thousands of current job listings across Kenya — entry level, graduate, remote, and professional roles.</p>
              <Link href="/" style={{ background: "#1B4FBD", color: "#fff", padding: "10px 20px", borderRadius: "6px", textDecoration: "none", fontWeight: 600, display: "inline-block" }}>Browse Jobs →</Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
