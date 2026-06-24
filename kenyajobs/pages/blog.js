import Head from "next/head";
import Link from "next/link";
import { BookOpen, TrendingUp, FileText, Briefcase, GraduationCap, ArrowRight } from "lucide-react";

const ARTICLES = [
  {
    slug: "how-to-write-a-kenyan-cv",
    icon: FileText,
    category: "CV & Applications",
    title: "How to Write a CV That Gets Shortlisted in Kenya",
    excerpt: "Most Kenyan job seekers are rejected before their CV is even read by a human. Here's how to beat the ATS and impress hiring managers.",
    readTime: "8 min",
    date: "June 2025",
  },
  {
    slug: "top-in-demand-jobs-kenya-2025",
    icon: TrendingUp,
    category: "Job Market",
    title: "The 10 Most In-Demand Jobs in Kenya in 2025",
    excerpt: "From fintech engineers to agri-tech specialists — these are the roles Kenyan employers are struggling to fill right now.",
    readTime: "6 min",
    date: "May 2025",
  },
  {
    slug: "remote-work-kenya-guide",
    icon: Briefcase,
    category: "Remote Work",
    title: "A Complete Guide to Landing Remote Work as a Kenyan",
    excerpt: "Remote work is real, growing, and paying well. Here's how to find legitimate remote roles and avoid scams.",
    readTime: "10 min",
    date: "April 2025",
  },
  {
    slug: "internships-guide-kenya",
    icon: GraduationCap,
    category: "Internships",
    title: "How to Get a Paid Internship in Kenya (Even Without Connections)",
    excerpt: "Internship hunting in Kenya feels impossible without 'connections' — but there's a structured approach that works.",
    readTime: "7 min",
    date: "March 2025",
  },
  {
    slug: "salary-negotiation-kenya",
    icon: BookOpen,
    category: "Career Growth",
    title: "How to Negotiate Your Salary in Kenya Without Losing the Offer",
    excerpt: "Most Kenyans accept the first offer. That costs them thousands every year. Here's how to negotiate confidently.",
    readTime: "6 min",
    date: "February 2025",
  },
];

export default function Blog() {
  const SITE_URL = "https://kenyajobs.vercel.app";

  return (
    <>
      <Head>
        <title>Career Blog — Job Search Advice for Kenyan Professionals | KenyaJobs</title>
        <meta name="description" content="Career advice, CV writing tips, job market insights, and guides for Kenyan job seekers. Practical articles for graduates, professionals, and remote workers." />
        <link rel="canonical" href={`${SITE_URL}/blog`} />
        <meta property="og:title" content="Career Blog — KenyaJobs" />
        <meta property="og:description" content="Career advice and job search guides for Kenyan professionals." />
        <meta property="og:url" content={`${SITE_URL}/blog`} />
      </Head>

      <div style={{ fontFamily: "system-ui, sans-serif", background: "#F8F8F8", minHeight: "100vh" }}>
        {/* Nav */}
        <nav style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "12px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/" style={{ color: "#1B4FBD", fontWeight: 700, fontSize: "18px", textDecoration: "none" }}>KenyaJobs</Link>
          <Link href="/blog" style={{ color: "#6B7280", fontSize: "14px", textDecoration: "none", marginLeft: "auto" }}>Blog</Link>
          <Link href="/cv-tips" style={{ color: "#6B7280", fontSize: "14px", textDecoration: "none" }}>CV Tips</Link>
        </nav>

        <main style={{ maxWidth: "860px", margin: "0 auto", padding: "48px 24px" }}>
          <div style={{ marginBottom: "40px" }}>
            <h1 style={{ fontSize: "36px", fontWeight: 800, color: "#111827", marginBottom: "12px" }}>Career Blog</h1>
            <p style={{ color: "#6B7280", fontSize: "17px", lineHeight: 1.7 }}>
              Practical job search advice, CV guides, and career insights written for Kenyan professionals.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {ARTICLES.map(({ slug, icon: Icon, category, title, excerpt, readTime, date }) => (
              <Link key={slug} href={`/blog/${slug}`} style={{ textDecoration: "none" }}>
                <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "24px", display: "flex", gap: "20px", cursor: "pointer" }}>
                  <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: "8px", background: "#EFF6FF", display: "grid", placeItems: "center", color: "#1B4FBD" }}>
                    <Icon size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#1B4FBD", textTransform: "uppercase", letterSpacing: "0.05em" }}>{category}</span>
                      <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{readTime} read · {date}</span>
                    </div>
                    <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", marginBottom: "6px", lineHeight: 1.4 }}>{title}</h2>
                    <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.6 }}>{excerpt}</p>
                  </div>
                  <ArrowRight size={18} color="#9CA3AF" style={{ flexShrink: 0, alignSelf: "center" }} />
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
