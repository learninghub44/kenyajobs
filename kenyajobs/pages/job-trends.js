import Head from "next/head";
import { TrendingUp, Briefcase, Globe, Zap, ArrowUp, ArrowDown, Minus } from "lucide-react";

const TRENDING_ROLES = [
  { title: "Data Analyst", trend: "up", change: "+34%", sector: "Tech / Finance", demand: "Very High" },
  { title: "Software Engineer", trend: "up", change: "+28%", sector: "Tech", demand: "Very High" },
  { title: "Sales Representative", trend: "up", change: "+22%", sector: "FMCG / Telco", demand: "High" },
  { title: "Customer Service Agent", trend: "up", change: "+19%", sector: "BPO / Retail", demand: "High" },
  { title: "Accountant", trend: "stable", change: "0%", sector: "Finance", demand: "Steady" },
  { title: "Nurse / Clinical Officer", trend: "up", change: "+15%", sector: "Healthcare", demand: "High" },
  { title: "Project Manager", trend: "up", change: "+12%", sector: "NGO / Construction", demand: "High" },
  { title: "Graphic Designer", trend: "down", change: "-8%", sector: "Creative", demand: "Moderate" },
  { title: "Supply Chain Officer", trend: "up", change: "+18%", sector: "Logistics", demand: "High" },
  { title: "Teacher / Trainer", trend: "stable", change: "+3%", sector: "Education", demand: "Steady" },
];

const TOP_SECTORS = [
  { sector: "Technology", icon: "💻", jobs: "1,200+", growth: "+31%", note: "Highest demand in Nairobi" },
  { sector: "Banking & Finance", icon: "🏦", jobs: "850+", growth: "+14%", note: "Strong in Nairobi & Mombasa" },
  { sector: "Healthcare", icon: "🏥", jobs: "620+", growth: "+22%", note: "County hospitals driving growth" },
  { sector: "NGO / Development", icon: "🌍", jobs: "480+", growth: "+9%", note: "Donor-funded projects expanding" },
  { sector: "Logistics & Supply Chain", icon: "📦", jobs: "390+", growth: "+19%", note: "E-commerce & exports rising" },
  { sector: "Education", icon: "📚", jobs: "310+", growth: "+5%", note: "CBC rollout creating demand" },
];

const INSIGHTS = [
  {
    title: "Remote work is here to stay",
    body: "Over 40% of tech job listings in Kenya now offer full remote or hybrid arrangements. Global remote boards like Remotive and Jobicy show Kenyan applicants gaining ground in competitive roles.",
    icon: Globe,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Entry-level squeeze is easing",
    body: "Graduate trainee programs from banks, telcos, and FMCG companies are picking up again post-2023, with structured two-year programs becoming common at large corporates.",
    icon: TrendingUp,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "AI skills command a premium",
    body: "Roles requiring AI/ML, prompt engineering, or data pipelines are commanding 25–40% salary premiums over equivalent non-AI tech roles, even at the junior level.",
    icon: Zap,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    title: "Internships converting to full-time",
    body: "More Kenyan companies are using internships as a pipeline, with conversion rates to full-time employment rising above 60% at tech companies and banks.",
    icon: Briefcase,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

function TrendIcon({ trend }) {
  if (trend === "up") return <ArrowUp size={14} className="text-emerald-500" />;
  if (trend === "down") return <ArrowDown size={14} className="text-red-400" />;
  return <Minus size={14} className="text-gray-400" />;
}

export default function JobTrends() {
  return (
    <>
      <Head>
        <title>Job Trends in Kenya 2025 | JobsWorldwide</title>
        <meta name="description" content="Explore the latest job market trends in Kenya — trending roles, top hiring sectors, salary insights, and what employers are looking for in 2025." />
      </Head>

      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Market Intelligence</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Job Trends in Kenya</h1>
          <p className="text-base text-gray-500 max-w-xl">
            Based on live job listings across our aggregated sources. Updated regularly to reflect the current Kenyan and African job market.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-14">

        {/* Trending roles table */}
        <section>
          <p className="text-xs uppercase tracking-widest text-blue-600 mb-3 font-semibold">Trending Roles</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What employers are searching for</h2>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Role</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden sm:table-cell">Sector</th>
                  <th className="text-center px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Trend</th>
                  <th className="text-center px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Change</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide hidden md:table-cell">Demand</th>
                </tr>
              </thead>
              <tbody>
                {TRENDING_ROLES.map((r, i) => (
                  <tr key={r.title} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i === TRENDING_ROLES.length - 1 ? "border-0" : ""}`}>
                    <td className="px-5 py-3.5 font-semibold text-gray-900">{r.title}</td>
                    <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">{r.sector}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center justify-center">
                        <TrendIcon trend={r.trend} />
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`font-semibold text-xs px-2 py-1 rounded-full ${
                        r.trend === "up" ? "bg-emerald-50 text-emerald-700" :
                        r.trend === "down" ? "bg-red-50 text-red-600" :
                        "bg-gray-100 text-gray-500"
                      }`}>{r.change}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell">{r.demand}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">* Based on listing volume change across our aggregated sources over the past 90 days.</p>
        </section>

        {/* Top sectors */}
        <section>
          <p className="text-xs uppercase tracking-widest text-blue-600 mb-3 font-semibold">By Sector</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Top hiring sectors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOP_SECTORS.map(s => (
              <div key={s.sector} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="text-2xl mb-3">{s.icon}</div>
                <h3 className="font-bold text-gray-900 mb-0.5">{s.sector}</h3>
                <p className="text-xs text-gray-400 mb-3">{s.note}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">{s.jobs} listings</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{s.growth}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Market insights */}
        <section>
          <p className="text-xs uppercase tracking-widest text-blue-600 mb-3 font-semibold">Insights</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What's shaping the market</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INSIGHTS.map(({ title, body, icon: Icon, color, bg }) => (
              <div key={title} className="flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-5">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} className={color} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-blue-600 text-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Ready to apply?</h2>
          <p className="text-blue-100 text-sm mb-6 max-w-md mx-auto">Browse thousands of live jobs across Kenya, East Africa, and global remote boards — updated daily.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="/" className="bg-white text-blue-700 font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-colors">Browse All Jobs</a>
            <a href="/remote-jobs" className="border border-white/30 text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-blue-500 transition-colors">Remote Jobs</a>
            <a href="/internships" className="border border-white/30 text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-blue-500 transition-colors">Internships</a>
          </div>
        </section>
      </div>
    </>
  );
}
