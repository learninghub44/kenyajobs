// pages/index.js
import Head from "next/head";
import { useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";
import CategoryTabs from "@/components/CategoryTabs";
import JobCard from "@/components/JobCard";
import { fetchRemoteJobs, fetchEntryLevelJobs, fetchGraduateJobs, fetchWFHJobs } from "@/utils/api";

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadJobs() {
      try {
        setLoading(true);
        const [remote, entry, graduate, wfh] = await Promise.all([
          fetchRemoteJobs(),
          fetchEntryLevelJobs(),
          fetchGraduateJobs(),
          fetchWFHJobs(),
        ]);
        const mixed = [
          ...remote.slice(0, 5),
          ...entry.slice(0, 5),
          ...graduate.slice(0, 5),
          ...wfh.slice(0, 5),
        ];
        setJobs(mixed);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  return (
    <>
      <Head>
        <title>Remote Jobs Kenya 2026 | Entry Level | Graduate Jobs</title>
        <meta name="description" content="Find the latest remote jobs, entry level jobs, graduate jobs and work from home jobs in Kenya 2026." />
      </Head>

      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-16 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-3">Find Your Dream Job in Kenya</h1>
        <p className="text-blue-100 mb-8 text-lg">Remote, Entry Level, Graduate & Work From Home Jobs — Updated Daily</p>
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
        <h2 className="text-xl font-bold text-gray-800 mb-6">Latest Jobs in Kenya</h2>

        {loading && (
          <div className="text-center py-20 text-gray-500 text-lg">⏳ Loading jobs...</div>
        )}

        {error && (
          <div className="text-center py-20 text-red-500 text-lg">❌ Something went wrong. Please refresh.</div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-20 text-gray-500 text-lg">No jobs found at this time.</div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, index) => (
              <>
                <JobCard key={job.id || job.job_id || index} job={job} />
                {/* AdSense after every 5 cards */}
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