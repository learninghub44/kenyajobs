import Head from "next/head";
import { useEffect, useState } from "react";
import JobCard from "@/components/JobCard";
import JobSkeleton from "@/components/JobSkeleton";
import CategoryTabs from "@/components/CategoryTabs";
import AdSlot from "@/components/AdSlot";
import PageHeader from "@/components/PageHeader";
import { mergeManualJobs } from "@/utils/mergeJobs";
import { GraduationCap } from "lucide-react";

const filters = ["All", "Tech", "Finance", "Marketing", "NGO", "Design"];

export default function Internships() {
  const [jobs, setJobs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 20;

  useEffect(() => {
    Promise.all([
      fetch("/api/internship-jobs")
        .then(r => r.json())
        .then(data => Array.isArray(data) ? data : [])
        .catch(() => []),
      fetch("/api/manual-jobs?category=internship")
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
    setFiltered(jobs.filter(j =>
      String(j.title || j.job_title || "").toLowerCase().includes(filter.toLowerCase()) ||
      String(j.description || j.job_description || "").toLowerCase().includes(filter.toLowerCase())
    ));
  }

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <>
      <Head>
        <title>Internships in Kenya & Africa | JobsWorldwide</title>
        <meta name="description" content="Browse internship opportunities across Kenya, East Africa and globally. Start building your career with hands-on experience." />
      </Head>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <CategoryTabs />
        <PageHeader
          icon={GraduationCap}
          title="Internships"
          subtitle="Build real-world experience — paid & unpaid opportunities across Kenya and Africa"
          badge={jobs.length > 0 ? `${jobs.length} open internships` : undefined}
          gradient="linear-gradient(135deg, #7c3aed, #2563eb)"
        />

        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map(f => (
            <button key={f} onClick={() => handleFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                activeFilter === f
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:text-violet-600"
              }`}>
              {f}
            </button>
          ))}
        </div>

        {loading && <JobSkeleton count={9} />}

        {!loading && paginated.length === 0 && (
          <div className="text-center py-20 text-gray-500">No internships found right now — check back soon.</div>
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
              className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-violet-50">← Prev</button>
            <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-violet-50">Next →</button>
          </div>
        )}
      </div>
    </>
  );
}
