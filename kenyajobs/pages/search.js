import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import JobCard from "@/components/JobCard";
import JobSkeleton from "@/components/JobSkeleton";
import SearchBar from "@/components/SearchBar";
import { searchJobs } from "@/utils/api";
import { mergeManualJobs } from "@/utils/mergeJobs";
import { Search as SearchIcon } from "lucide-react";

export default function SearchResults() {
  const router = useRouter();
  const { q = "" } = router.query;
  const query = String(q || "").trim();
  const searched = router.isReady && query.length > 0;
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!router.isReady || !query) return;

    let cancelled = false;
    async function runSearch() {
      setLoading(true);
      const [liveData, manualData] = await Promise.all([
        searchJobs(query),
        fetch(`/api/manual-jobs?search=${encodeURIComponent(query)}`).then((r) => r.json()).catch(() => []),
      ]);
      if (cancelled) return;
      const liveJobs = Array.isArray(liveData) ? liveData : [];
      const manualJobs = Array.isArray(manualData) ? manualData : [];
      setJobs(mergeManualJobs(liveJobs, manualJobs));
      setLoading(false);
    }
    runSearch();

    return () => { cancelled = true; };
  }, [router.isReady, query]);

  return (
    <>
      <Head>
        <title>{q ? `"${q}" Jobs` : "Search Jobs"} | JobsWorldwide</title>
        <meta name="description" content="Search thousands of jobs worldwide by title, company, or keyword." />
      </Head>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <SearchBar placeholder="Job title, company, or keyword..." />
        </div>

        {searched && (
          <h1 className="text-xl font-bold text-gray-800 mb-1">
            {loading ? "Searching..." : `${jobs.length} result${jobs.length === 1 ? "" : "s"} for "${q}"`}
          </h1>
        )}

        {loading && <JobSkeleton count={9} />}

        {!loading && !searched && (
          <div className="text-center py-20 text-gray-500">
            <SearchIcon size={40} className="mx-auto text-gray-300 mb-4" />
            <p>Type something above to search jobs worldwide.</p>
          </div>
        )}

        {!loading && searched && jobs.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <SearchIcon size={40} className="mx-auto text-gray-300 mb-4" />
            <p>No jobs found for &quot;{q}&quot;. Try a different keyword.</p>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {jobs.map((job, i) => (
              <JobCard key={job.id || job.job_id || i} job={job} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
