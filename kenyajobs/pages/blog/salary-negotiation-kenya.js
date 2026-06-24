import Head from "next/head";
import Link from "next/link";

export default function SalaryNegotiation() {
  const SITE_URL = "https://kenyajobs.vercel.app";
  return (
    <>
      <Head>
        <title>How to Negotiate Your Salary in Kenya Without Losing the Offer | KenyaJobs Blog</title>
        <meta name="description" content="Practical salary negotiation advice for Kenyan job seekers. Scripts, tactics, and what not to say when discussing compensation." />
        <link rel="canonical" href={`${SITE_URL}/blog/salary-negotiation-kenya`} />
      </Head>
      <div style={{ fontFamily: "system-ui, sans-serif", background: "#F8F8F8", minHeight: "100vh" }}>
        <nav style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "12px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/" style={{ color: "#1B4FBD", fontWeight: 700, fontSize: "18px", textDecoration: "none" }}>KenyaJobs</Link>
          <Link href="/blog" style={{ color: "#6B7280", fontSize: "14px", textDecoration: "none", marginLeft: "auto" }}>← Back to Blog</Link>
        </nav>
        <main style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 24px" }}>
          <div style={{ marginBottom: "32px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#1B4FBD", textTransform: "uppercase", letterSpacing: "0.05em" }}>Career Growth</span>
            <h1 style={{ fontSize: "34px", fontWeight: 800, color: "#111827", marginTop: "8px", marginBottom: "12px", lineHeight: 1.3 }}>How to Negotiate Your Salary in Kenya Without Losing the Offer</h1>
            <p style={{ color: "#6B7280", fontSize: "14px" }}>6 min read · February 2025</p>
          </div>
          <div style={{ color: "#374151", lineHeight: 1.85, fontSize: "16px" }}>
            <p>Most Kenyans accept the first salary offer. Research consistently shows this costs professionals between KES 50,000 and KES 200,000 per year over a career — and that gap compounds every time your next salary is benchmarked against your current one.</p>
            <p style={{ marginTop: "16px" }}>Negotiating is normal, professional, and expected by most employers. An offer is not a take-it-or-leave-it ultimatum. Here's how to do it well.</p>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "36px", marginBottom: "12px" }}>Step 1: Know Your Number Before the Interview</h2>
            <p>Research the salary range for this role, sector, and seniority level before you step into any conversation. Sources: LinkedIn Salary Insights (for Kenyan roles), Glassdoor (check East Africa filter), Fuzu, and your professional network.</p>
            <p style={{ marginTop: "12px" }}>Have three numbers in mind: your ideal (aim high), your target (what you actually want), and your walk-away (the minimum you'd accept).</p>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "36px", marginBottom: "12px" }}>Step 2: Never Name a Number First</h2>
            <p>If asked "what are your salary expectations?", deflect with: "I'm flexible and open to discussing what you have budgeted for this role — what's the range you're working with?"</p>
            <p style={{ marginTop: "12px" }}>If they push, give a range: "Based on my research and experience, I'm looking at something in the range of KES 120,000–150,000." Always anchor high — you can come down, but rarely up.</p>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "36px", marginBottom: "12px" }}>Step 3: After the Offer — How to Counter</h2>
            <p>When they give you an offer, your script is: "Thank you — I'm really excited about this role and the team. I was hoping we could get closer to [your target]. Is there room to move on the base salary?"</p>
            <p style={{ marginTop: "12px" }}>Then stop talking. Silence is a powerful negotiation tool. Many hirers will either move or explain why they can't — and either answer is useful information.</p>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "36px", marginBottom: "12px" }}>Step 4: If They Won't Move on Salary, Negotiate Everything Else</h2>
            <p>Salary isn't the only compensation. If the base is fixed, ask about: earlier performance review (3 months instead of 12), signing bonus, medical cover (family vs individual), leave days, flexible working or WFH days, training budget, or job title.</p>
            <p style={{ marginTop: "12px" }}>A signing bonus, for example, is often easier to approve than an increased base because it's a one-time cost. A 6-month salary review is much better than a 12-month one if you expect to prove yourself quickly.</p>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "36px", marginBottom: "12px" }}>What Kills Negotiations</h2>
            <p>Avoid: giving ultimatums ("I won't take anything below..."), over-explaining your personal financial situation (irrelevant to your value), comparing to your current salary (that's the floor, not the target), or apologising for negotiating.</p>

            <div style={{ marginTop: "48px", padding: "24px", background: "#EFF6FF", borderRadius: "8px", border: "1px solid #BFDBFE" }}>
              <p style={{ fontWeight: 700, color: "#1E40AF", marginBottom: "8px" }}>Find your next role</p>
              <Link href="/" style={{ background: "#1B4FBD", color: "#fff", padding: "10px 20px", borderRadius: "6px", textDecoration: "none", fontWeight: 600, display: "inline-block" }}>Browse Jobs →</Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
