import Head from "next/head";
import { useEffect, useState } from "react";
import JobCard from "@/components/JobCard";
import JobSkeleton from "@/components/JobSkeleton";
import CategoryTabs from "@/components/CategoryTabs";
import AdSlot from "@/components/AdSlot";
import PageHeader from "@/components/PageHeader";
import { mergeManualJobs } from "@/utils/mergeJobs";
import { Globe } from "lucide-react";

const COUNTRIES = ["All", "Kenya", "Nigeria", "South Africa", "Uganda", "Tanzania", "Ghana", "Egypt", "East Africa"];

export default function AfricaJobs() {
  const [jobs, setJobs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 20;

  useEffect(() => {
    Promise.all([
      fetch("/api/africa-jobs")
        .then(r => r.json())
        .then(data => Array.isArray(data) ? data : [])
        .catch(() => []),
      fetch("/api/manual-jobs?category=africa")
        .then(r => r.json())
        .catch(() => []),
    ]).then(([liveData, manualData]) => {
      const merged = mergeManualJobs(
        Array.isArray(liveData) ? liveData : [],
        Array.isArray(manualData) ? manualData : []
      );
      setJobs(merged);
      setFiltered(merged);
    }).finally(() => setLoading(false));
  }, []);

  function handleFilter(filter) {
    setActiveFilter(filter);
    setPage(1);
    if (filter === "All") return setFiltered(jobs);
    setFiltered(jobs.filter(j => {
      const loc = String(j.location || j.job_city || j.job_country || "").toLowerCase();
      const src = String(j.source || "").toLowerCase();
      return loc.includes(filter.toLowerCase()) || src.includes(filter.toLowerCase());
    }));
  }

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <>
      <Head>
        <title>Africa Jobs — Kenya, Nigeria, South Africa & More | JobsWorldwide</title>
        <meta name="description" content="Browse live job listings from across Africa — Kenya, Nigeria, South Africa, Ghana, Uganda, Tanzania and more. Aggregated from trusted African job boards." />
      </Head>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <CategoryTabs />
        <PageHeader
          icon={Globe}
          title="Africa Jobs"
          subtitle="Live listings from BrighterMonday, MyJobMag, Fuzu, ReliefWeb and 10+ African boards"
          badge={jobs.length > 0 ? `${jobs.length} live opportunities` : undefined}
          gradient="linear-gradient(135deg, #0891b2, #16a34a)"
        />

        {/* Country filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {COUNTRIES.map(c => (
            <button key={c} onClick={() => handleFilter(c)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                activeFilter === c
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:text-teal-600"
              }`}>
              {c}
            </button>
          ))}
        </div>

        {loading && <JobSkeleton count={9} />}

        {!loading && paginated.length === 0 && (
          <div className="text-center py-20 text-gray-500">No jobs found for this filter — try another country.</div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((job, i) => <JobCard key={job.job_id || job.id || i} job={job} />)}
          </div>
        )}

        {!loading && paginated.length > 0 && (
          <div className="mt-6">
            <AdSlot placement="listing-grid" adSlot="0000000000" />
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-10">
            <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}
              className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-teal-50">← Prev</button>
            <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-teal-50">Next →</button>
          </div>
        )}
      </div>
    </>
  );
}
