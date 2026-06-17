import Head from "next/head";
import { useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";
import CategoryTabs from "@/components/CategoryTabs";
import JobCard from "@/components/JobCard";

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load Remotive first (fast, free, reliable) — show immediately
    fetch("/api/remote-jobs")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setJobs(data.slice(0, 20));
          setLoading(false);
        }
      })
      .catch(() => {});

    // Then enrich with other sources as they arrive
    Promise.allSettled([
      fetch("/api/entry-level-jobs").then((r) => r.json()).catch(() => []),
      fetch("/api/graduate-jobs").then((r) => r.json()).catch(() => []),
      fetch("/api/wfh-jobs").then((r) => r.json()).catch(() => []),
    ]).then(([entry, grad, wfh]) => {
      const extra = [
        ...(entry.value || []).slice(0, 5),
        ...(grad.value || []).slice(0, 5),
        ...(wfh.value || []).slice(0, 5),
      ];
      setJobs((prev) => {
        const ids = new Set(prev.map((j) => j.id || j.job_id));
        const merged = [...prev, ...extra.filter((j) => !ids.has(j.id || j.job_id))];
        return merged.slice(0, 30);
      });
      setLoading(false);
    });
  }, []);

  return (
    <>
      <Head>
        <title>Remote Jobs | Entry Level | Graduate Jobs — JobsWorldwide</title>
        <meta name="description" content="Find the latest remote jobs, entry level, graduate and work from home jobs worldwide. Updated daily." />
      </Head>

      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-16 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-3">Find Your Next Job, Anywhere in the World</h1>
        <p className="text-blue-100 mb-8 text-lg">Remote · Entry Level · Graduate · Work From Home — Updated Daily</p>
        <SearchBar placeholder="Search jobs e.g. accountant, developer, nurse..." />
      </section>

      {/* AdSense Placeholder */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="bg-gray-200 text-gray-400 text-center text-sm py-6 rounded-xl">
          Advertisement
        </div>
      </div>

      {/* Category Tabs */}
      <div className="max-w-6xl mx-auto px-4">
        <CategoryTabs />
      </div>

      {/* Jobs Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Latest Jobs</h2>

        {loading && jobs.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse">
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <div className="h-6 bg-gray-100 rounded-lg w-20" />
                  <div className="h-6 bg-gray-100 rounded-lg w-16" />
                </div>
                <div className="h-9 bg-gray-200 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <div className="text-center py-20 text-gray-500">No jobs found at this time.</div>
        )}

        {jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, index) => (
              <>
                <JobCard key={job.id || job.job_id || index} job={job} />
                {(index + 1) % 5 === 0 && (
                  <div key={`ad-${index}`} className="col-span-1 md:col-span-2 lg:col-span-3 bg-gray-200 text-gray-400 text-center text-sm py-6 rounded-xl">
                    Advertisement
                  </div>
                )}
              </>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
