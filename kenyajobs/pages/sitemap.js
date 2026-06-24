import Head from "next/head";
import Link from "next/link";
import { Map, Briefcase, Users, FileText, Shield, ChevronRight } from "lucide-react";

const SECTIONS = [
  {
    title: "Browse Jobs",
    icon: Briefcase,
    color: "text-blue-600",
    bg: "bg-blue-50",
    links: [
      ["Home — All Jobs", "/"],
      ["Remote Jobs", "/remote-jobs"],
      ["Entry Level Jobs", "/entry-level"],
      ["Graduate Jobs", "/graduate-jobs"],
      ["Work From Home", "/work-from-home"],
      ["Internships", "/internships"],
      ["Africa Jobs", "/africa-jobs"],
      ["Search Jobs", "/search"],
    ],
  },
  {
    title: "For Candidates",
    icon: Users,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    links: [
      ["CV Tips & Career Advice", "/cv-tips"],
      ["Job Trends & Market Insights", "/job-trends"],
      ["Companies Hiring", "/companies"],
      ["Help / FAQs", "/faq"],
    ],
  },
  {
    title: "For Employers",
    icon: FileText,
    color: "text-violet-600",
    bg: "bg-violet-50",
    links: [
      ["Advertise / Post a Job", "/advertise"],
    ],
  },
  {
    title: "Company",
    icon: Shield,
    color: "text-amber-600",
    bg: "bg-amber-50",
    links: [
      ["About Us", "/about"],
      ["Contact Us", "/contact"],
      ["Privacy Policy", "/privacy-policy"],
      ["Terms & Conditions", "/terms-and-conditions"],
    ],
  },
];

export default function SitemapPage() {
  return (
    <>
      <Head>
        <title>Sitemap | JobsWorldwide</title>
        <meta name="description" content="Browse all pages on JobsWorldwide — job categories, career resources, employer tools, and company information." />
        <link rel="canonical" href="https://kenyajobs.vercel.app/sitemap" />
      </Head>

      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Site Navigation</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Sitemap</h1>
          <p className="text-base text-gray-500 max-w-xl">
            A complete overview of every page on JobsWorldwide — jump straight to what you're looking for.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {SECTIONS.map(({ title, icon: Icon, color, bg, links }) => (
            <div key={title} className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={16} className={color} />
                </div>
                <h2 className="font-bold text-gray-900">{title}</h2>
              </div>
              <ul className="space-y-1">
                {links.map(([label, href]) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="flex items-center justify-between text-sm text-gray-600 hover:text-blue-600 py-1.5 group transition-colors"
                    >
                      {label}
                      <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* XML sitemap link for reference */}
        <div className="mt-10 flex items-center gap-3 border-t border-gray-100 pt-8">
          <Map size={16} className="text-gray-400 flex-shrink-0" />
          <p className="text-sm text-gray-500">
            Looking for the XML version for search engines?{" "}
            <a href="/sitemap.xml" className="text-blue-600 hover:underline font-medium">
              View sitemap.xml
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
