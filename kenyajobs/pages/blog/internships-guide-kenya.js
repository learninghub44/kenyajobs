import Head from "next/head";
import Link from "next/link";

export default function InternshipsGuide() {
  const SITE_URL = "https://kenyajobs.vercel.app";
  return (
    <>
      <Head>
        <title>How to Get a Paid Internship in Kenya | KenyaJobs Blog</title>
        <meta name="description" content="A structured guide to landing paid internships in Kenya — where to look, how to apply, and what to say when you don't have connections." />
        <link rel="canonical" href={`${SITE_URL}/blog/internships-guide-kenya`} />
      </Head>
      <div style={{ fontFamily: "system-ui, sans-serif", background: "#F8F8F8", minHeight: "100vh" }}>
        <nav style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "12px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/" style={{ color: "#1B4FBD", fontWeight: 700, fontSize: "18px", textDecoration: "none" }}>KenyaJobs</Link>
          <Link href="/blog" style={{ color: "#6B7280", fontSize: "14px", textDecoration: "none", marginLeft: "auto" }}>← Back to Blog</Link>
        </nav>
        <main style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 24px" }}>
          <div style={{ marginBottom: "32px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#1B4FBD", textTransform: "uppercase", letterSpacing: "0.05em" }}>Internships</span>
            <h1 style={{ fontSize: "34px", fontWeight: 800, color: "#111827", marginTop: "8px", marginBottom: "12px", lineHeight: 1.3 }}>How to Get a Paid Internship in Kenya (Even Without Connections)</h1>
            <p style={{ color: "#6B7280", fontSize: "14px" }}>7 min read · March 2025</p>
          </div>
          <div style={{ color: "#374151", lineHeight: 1.85, fontSize: "16px" }}>
            <p>The idea that internships are only for those with relatives at the right companies is partly true — and partly an excuse. While networks help, there's a structured approach to getting paid internships in Kenya that doesn't require knowing someone.</p>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "36px", marginBottom: "12px" }}>Where Paid Internships Are Actually Advertised</h2>
            <ul style={{ paddingLeft: "24px", marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <li><strong>KenyaJobs Internships section</strong> — <Link href="/internships" style={{ color: "#1B4FBD" }}>Browse current internships</Link> updated daily.</li>
              <li><strong>LinkedIn</strong> — Filter for "Internship" job type and Kenya location. Set up alerts for your field.</li>
              <li><strong>Company career pages directly</strong> — Large employers like Safaricom, Equity Bank, Kenya Airways, KPMG, and Deloitte post internships on their own websites, often before aggregators pick them up.</li>
              <li><strong>UN Kenya internship portal</strong> — UN agencies post internships for Kenyan students regularly. These are competitive but pay a stipend.</li>
              <li><strong>Your university careers office</strong> — Often underused. Many companies recruit exclusively through direct university partnerships.</li>
            </ul>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "36px", marginBottom: "12px" }}>The Cold Outreach Method</h2>
            <p>Most internships are never advertised. Companies hire interns when someone impressive asks at the right time. The method: identify 20 companies you'd genuinely want to work at, find the LinkedIn profile of the department head or HR contact, and send a brief, specific message.</p>
            <p style={{ marginTop: "12px" }}>Template: "Hi [Name], I'm a 3rd-year BCom student at [university] specialising in [field]. I've been following [company]'s work on [specific project/initiative] and would love to explore whether you have any internship opportunities in [specific department] this semester. I've attached my CV — happy to connect at your convenience."</p>
            <p style={{ marginTop: "12px" }}>Send this to 20 companies. You will hear back from 3–5. That's how it works.</p>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "36px", marginBottom: "12px" }}>Your Application Must Include These Things</h2>
            <ul style={{ paddingLeft: "24px", marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>A single-page CV tailored to the company and role</li>
              <li>A cover letter that mentions one specific thing about the company (a product, a project, a value)</li>
              <li>Evidence of initiative: a project you built, a paper you wrote, a club you led, even a relevant side hustle</li>
              <li>A professional email address and a voicemail greeting on your phone — you'd be surprised how many candidates fail here</li>
            </ul>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "36px", marginBottom: "12px" }}>Negotiating the Internship Stipend</h2>
            <p>Many Kenyan internships start as unpaid and become paid when you push. It is entirely appropriate to ask: "Is there a stipend attached to the role, or is there flexibility to add one?" The worst answer is no. The best answer is yes, plus you've shown you understand your value.</p>
            <p style={{ marginTop: "12px" }}>Minimum wage in Kenya applies to employees — interns are legally separate. However, many companies do pay between KES 15,000 and KES 50,000/month for structured programmes.</p>

            <div style={{ marginTop: "48px", padding: "24px", background: "#EFF6FF", borderRadius: "8px", border: "1px solid #BFDBFE" }}>
              <p style={{ fontWeight: 700, color: "#1E40AF", marginBottom: "8px" }}>Browse internship listings</p>
              <Link href="/internships" style={{ background: "#1B4FBD", color: "#fff", padding: "10px 20px", borderRadius: "6px", textDecoration: "none", fontWeight: 600, display: "inline-block" }}>View Internships →</Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
