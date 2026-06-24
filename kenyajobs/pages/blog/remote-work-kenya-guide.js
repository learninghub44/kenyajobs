import Head from "next/head";
import Link from "next/link";

export default function RemoteWorkGuide() {
  const SITE_URL = "https://kenyajobs.vercel.app";
  return (
    <>
      <Head>
        <title>A Complete Guide to Landing Remote Work as a Kenyan | KenyaJobs Blog</title>
        <meta name="description" content="How to find legitimate remote work opportunities as a Kenyan professional — platforms, skills, rates, contracts, and avoiding scams." />
        <link rel="canonical" href={`${SITE_URL}/blog/remote-work-kenya-guide`} />
      </Head>
      <div style={{ fontFamily: "system-ui, sans-serif", background: "#F8F8F8", minHeight: "100vh" }}>
        <nav style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "12px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/" style={{ color: "#1B4FBD", fontWeight: 700, fontSize: "18px", textDecoration: "none" }}>KenyaJobs</Link>
          <Link href="/blog" style={{ color: "#6B7280", fontSize: "14px", textDecoration: "none", marginLeft: "auto" }}>← Back to Blog</Link>
        </nav>
        <main style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 24px" }}>
          <div style={{ marginBottom: "32px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#1B4FBD", textTransform: "uppercase", letterSpacing: "0.05em" }}>Remote Work</span>
            <h1 style={{ fontSize: "34px", fontWeight: 800, color: "#111827", marginTop: "8px", marginBottom: "12px", lineHeight: 1.3 }}>A Complete Guide to Landing Remote Work as a Kenyan</h1>
            <p style={{ color: "#6B7280", fontSize: "14px" }}>10 min read · April 2025</p>
          </div>
          <div style={{ color: "#374151", lineHeight: 1.85, fontSize: "16px" }}>
            <p>Remote work is not a future promise in Kenya — it's a present reality for tens of thousands of professionals. Customer service agents, software developers, content writers, virtual assistants, and financial analysts are earning USD-equivalent salaries without leaving Nairobi, Kisumu, or Mombasa.</p>
            <p style={{ marginTop: "16px" }}>But the landscape is also full of scams, underpayment, and poorly structured contracts. This guide helps you find the real opportunities and protect yourself.</p>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "36px", marginBottom: "12px" }}>Where to Find Legitimate Remote Jobs</h2>
            <p>The most reliable platforms for Kenyans seeking remote work are:</p>
            <ul style={{ paddingLeft: "24px", marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <li><strong>LinkedIn</strong> — Filter by "Remote" in job search. Many multinational companies operating in East Africa post here.</li>
              <li><strong>KenyaJobs Remote section</strong> — <Link href="/remote-jobs" style={{ color: "#1B4FBD" }}>Browse remote jobs</Link> curated for Kenyan professionals.</li>
              <li><strong>Andela / Turing / Toptal</strong> — These platforms vet you once and connect you with US/EU tech companies. High earning potential but competitive entry.</li>
              <li><strong>Upwork / Fiverr</strong> — Best for freelancers in writing, design, virtual assistance, and digital marketing. Takes time to build a profile but works well long-term.</li>
              <li><strong>NGO/INGO job boards</strong> — UNDP, IRC, Mercy Corps, and similar organisations regularly hire Kenyans for remote programme and communications roles.</li>
            </ul>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "36px", marginBottom: "12px" }}>Skills That Get Remote Roles Faster</h2>
            <p>The most in-demand remote skills in the Kenyan market right now: software development (JavaScript, Python, React), data analysis (SQL, Excel, Power BI), content writing and SEO, customer success/support, virtual assistance, digital marketing, and UX/UI design.</p>
            <p style={{ marginTop: "12px" }}>If your current skills don't map here, consider Google Career Certificates, Coursera, or ALX Africa — all offer recognised certifications at low or zero cost for Kenyans.</p>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "36px", marginBottom: "12px" }}>Getting Paid: What to Know</h2>
            <p>Payment is the most practical challenge. The main methods used by Kenyans for international remote income:</p>
            <ul style={{ paddingLeft: "24px", marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <li><strong>Wise (TransferWise)</strong> — Low fees, fast transfers to MPESA or Kenyan bank accounts. Best for most people.</li>
              <li><strong>Payoneer</strong> — Popular with Upwork/Fiverr contractors. Comes with a prepaid card usable at ATMs.</li>
              <li><strong>SWIFT/Bank Transfer</strong> — For larger, regular salary payments. KCB, Equity, and Absa all handle international transfers.</li>
            </ul>

            <h2 style={{ fontSize: "22px", fontWeight: 700, color: "#111827", marginTop: "36px", marginBottom: "12px" }}>How to Avoid Remote Work Scams</h2>
            <p>Red flags to watch for: any job that asks you to pay upfront for "training" or "registration", roles that promise very high pay for very simple tasks, employers who contact you out of nowhere via WhatsApp or Telegram, and contracts that don't specify the employing entity or payment method.</p>
            <p style={{ marginTop: "12px" }}>Legitimate remote employers will interview you properly, give you a contract, and pay via traceable, verifiable methods. They never ask for money from you.</p>

            <div style={{ marginTop: "48px", padding: "24px", background: "#EFF6FF", borderRadius: "8px", border: "1px solid #BFDBFE" }}>
              <p style={{ fontWeight: 700, color: "#1E40AF", marginBottom: "8px" }}>Browse remote jobs now</p>
              <Link href="/remote-jobs" style={{ background: "#1B4FBD", color: "#fff", padding: "10px 20px", borderRadius: "6px", textDecoration: "none", fontWeight: 600, display: "inline-block" }}>View Remote Jobs →</Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
