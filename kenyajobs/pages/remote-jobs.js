// pages/remote-jobs.js
import Head from "next/head";
import { useEffect, useState } from "react";
import JobCard from "@/components/JobCard";
import CategoryTabs from "@/components/CategoryTabs";
import { fetchRemoteJobs } from "@/utils/api";

const filters = ["All", "Software Development", "Customer Service", "Marketing", "Design"];

export default function RemoteJobs() {
  const [jobs, setJobs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 20;

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchRemoteJobs();
        setJobs(data);
        setFiltered(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleFilter(filter) {
    setActiveFilter(filter);
    setPage(1);
    if (filter === "All") {
      setFiltered(jobs);
    } else {
      setFiltered(jobs.filter((j) =>
        (j.category || "").toLowerCase().includes(filter.toLowerCase())
      ));
    }
  }

  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <>
      <Head>
        <title>Remote Jobs for Kenyans 2026 - Work From Anywhere</title>
        <meta name="description" content="Browse the latest remote jobs for Kenyans. Work from anywhere in the world." />
      </Head>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <CategoryTabs />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">🌍 Remote Jobs in Kenya</h1>
        <p className="text-gray-500 mb-6">Work from anywhere — updated daily</p>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                activeFilter === f
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-blue-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {loading && <div className="text-center py-20 text-gray-500">⏳ Loading jobs...</div>}
        {error && <div className="text-center py-20 text-red-500">❌ Something went wrong. Please refresh.</div>}
        {!loading && !error && paginated.length === 0 && (
          <div className="text-center py-20 text-gray-500">No jobs found for this filter.</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginated.map((job, index) => (
            <JobCard key={job.id || index} job={job} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-blue-50"
            >
              ← Prev
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-blue-50"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </>
  );
}