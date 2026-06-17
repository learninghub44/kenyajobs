import Head from "next/head";
import { useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";
import CategoryTabs from "@/components/CategoryTabs";
import JobCard from "@/components/JobCard";
import JobSkeleton from "@/components/JobSkeleton";

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sources, setSources] = useState({ loaded: 0, total: 5 });

  // Merge new jobs into state without duplicates
  const mergeJobs = (prev, incoming) => {
    const ids = new Set(prev.map(j => j.id));
    return [...prev, ...incoming.filter(j => !ids.has(j.id))].slice(0, 60);
  };

  useEffect(() => {
    // Each source streams in independently — show as soon as it arrives
    const fetchSource = async (url, sliceCount, sourceLabel) => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${sourceLabel}: HTTP ${res.status}`);
        const data = await res.json();
        const items = Array.isArray(data) ? data.slice(0, sliceCount) : [];
        if (items.length > 0) {
          setJobs(prev => mergeJobs(prev, items));
          setLoading(false);
        }
      } catch (e) {
        console.warn(`Failed to load ${sourceLabel}:`, e.message);
      } finally {
        setSources(prev => ({ ...prev, loaded: prev.loaded + 1 }));
      }
    };

    // Fire all in parallel — each updates UI the moment it resolves
    fetchSource("/api/kenya-jobs", 20, "Kenya Jobs");
    fetchSource("/api/remote-jobs", 15, "Remote Jobs");
    fetchSource("/api/entry-level-jobs", 8, "Entry Level");
    fetchSource("/api/graduate-jobs", 8, "Graduate");
    fetchSource("/api/wfh-jobs", 8, "Work From Home");

    // Safety: turn off spinner after 12s even if some sources stall
    const timeout = setTimeout(() => setLoading(false), 12000);
    return () => clearTimeout(timeout);
  }, []);

  const allLoaded = sources.loaded >= sources.total;

  return (
    <>
      <Head>
        <title>Kenya Jobs | Remote | Entry Level | Graduate — JobsWorldwide</title>
        <meta name="description" content="Find the latest Kenya jobs, remote jobs, entry level, graduate and work from home jobs. Updated daily." />
      </Head>

      {/* Hero */}
      <section className="bg-blue-600 text-white py-16 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-3">Find Your Next Job, Anywhere in the World</h1>
        <p className="text-blue-100 mb-8 text-lg">Kenya · Remote · Entry Level · Graduate · Work From Home — Updated Daily</p>
        <SearchBar placeholder="Search jobs e.g. accountant, developer, nurse..." />
      </section>

      {/* Ad */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="bg-gray-200 text-gray-400 text-center text-sm py-6 rounded-xl">Advertisement</div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4">
        <CategoryTabs />
      </div>

      {/* Jobs */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Latest Jobs</h2>
          {!allLoaded && jobs.length > 0 && (
            <span className="text-xs text-blue-500 animate-pulse">
              Loading more sources… ({sources.loaded}/{sources.total})
            </span>
          )}
          {jobs.length > 0 && (
            <span className="text-xs text-gray-400">{jobs.length} jobs found</span>
          )}
        </div>

        {loading && jobs.length === 0 && <JobSkeleton count={9} />}

        {jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, index) => (
              <>
                <JobCard key={job.id || index} job={job} />
                {(index + 1) % 5 === 0 && (
                  <div key={`ad-${index}`} className="col-span-1 md:col-span-2 lg:col-span-3 bg-gray-200 text-gray-400 text-center text-sm py-6 rounded-xl">
                    Advertisement
                  </div>
                )}
              </>
            ))}
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium">No jobs found right now.</p>
            <p className="text-sm mt-1">Please check back shortly — sources update every 30 minutes.</p>
          </div>
        )}
      </section>
    </>
  );
}
