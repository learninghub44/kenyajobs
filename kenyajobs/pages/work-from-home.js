import Head from "next/head";
import { useEffect, useState } from "react";
import JobCard from "@/components/JobCard";
import JobSkeleton from "@/components/JobSkeleton";
import CategoryTabs from "@/components/CategoryTabs";

const filters = ["All", "Data Entry", "Virtual Assistant", "Customer Service", "Writing"];


export default function WorkFromHome() {
  const [jobs, setJobs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 20;

  useEffect(() => {
    setLoading(true);
    // Try Adzuna first, fall back to Remotive customer-service category
    fetch("/api/wfh-jobs")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) return data;
        return fetch("/api/remote-jobs?category=customer-support").then((r) => r.json());
      })
      .then((data) => {
        const jobs = Array.isArray(data) ? data : [];
        setJobs(jobs);
        setFiltered(jobs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleFilter(filter) {
    setActiveFilter(filter);
    setPage(1);
    if (filter === "All") {
      setFiltered(jobs);
    } else {
      setFiltered(jobs.filter((j) =>
        String(j.title || j.job_title || "").toLowerCase().includes(filter.toLowerCase()) ||
        String(j.description || j.job_description || "").toLowerCase().includes(filter.toLowerCase())
      ));
    }
  }

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <>
      <Head>
        <title>Work From Home Jobs - Legitimate Online Jobs | JobsWorldwide</title>
        <meta name="description" content="Find legitimate work from home jobs. Data entry, virtual assistant and more." />
      </Head>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <CategoryTabs />
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Work From Home Jobs</h1>
        <p className="text-gray-500 mb-6">Legitimate online jobs — earn from home</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map((f) => (
            <button key={f} onClick={() => handleFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                activeFilter === f ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"}`}>
              {f}
            </button>
          ))}
        </div>

        {loading && <JobSkeleton count={9} />}

        {!loading && paginated.length === 0 && (
          <div className="text-center py-20 text-gray-500">No jobs found.</div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((job, i) => <JobCard key={job.id || job.job_id || i} job={job} />)}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-10">
            <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}
              className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-blue-50">← Prev</button>
            <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}
              className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40 hover:bg-blue-50">Next →</button>
          </div>
        )}
      </div>
    </>
  );
}
