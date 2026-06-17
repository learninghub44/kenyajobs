import Head from "next/head";
import { useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";
import CategoryTabs from "@/components/CategoryTabs";
import JobCard from "@/components/JobCard";
import JobSkeleton from "@/components/JobSkeleton";

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load Kenya jobs + Remotive first (fast) — show immediately
    Promise.allSettled([
      fetch("/api/kenya-jobs").then(r => r.json()).catch(() => []),
      fetch("/api/remote-jobs").then(r => r.json()).catch(() => []),
    ]).then(([kenya, remote]) => {
      const initial = [
        ...(kenya.value || []).slice(0, 10),
        ...(remote.value || []).slice(0, 10),
      ];
      if (initial.length > 0) {
        setJobs(initial);
        setLoading(false);
      }
    });

    // Then merge in the rest
    Promise.allSettled([
      fetch("/api/entry-level-jobs").then(r => r.json()).catch(() => []),
      fetch("/api/graduate-jobs").then(r => r.json()).catch(() => []),
      fetch("/api/wfh-jobs").then(r => r.json()).catch(() => []),
    ]).then(results => {
      const extra = results
        .filter(r => r.status === "fulfilled" && Array.isArray(r.value))
        .flatMap(r => r.value.slice(0, 5));

      setJobs(prev => {
        const ids = new Set(prev.map(j => j.id));
        const merged = [...prev, ...extra.filter(j => !ids.has(j.id))];
        return merged.slice(0, 40);
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

      {/* Hero */}
      <section className="bg-blue-600 text-white py-16 px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold mb-3">Find Your Next Job, Anywhere in the World</h1>
        <p className="text-blue-100 mb-8 text-lg">Remote · Entry Level · Graduate · Work From Home — Updated Daily</p>
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
        <h2 className="text-xl font-bold text-gray-800 mb-6">Latest Jobs</h2>

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
      </section>
    </>
  );
}
