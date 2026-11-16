export default function SourcesMarquee({ jobs = [] }) {
  const sources = [...new Set(jobs
    .map((job) => String(job.source || job.job_source || "").trim())
    .filter((source) => source && !/^(online jobs|manual)$/i.test(source)))].slice(0, 12);

  return (
    <section className="border-t border-gray-200 bg-white py-10">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Listing attribution</p>
        <h2 className="mt-2 text-xl font-bold text-gray-900">Where current listings come from</h2>
        {sources.length ? (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {sources.map((source) => <span key={source} className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700">{source}</span>)}
          </div>
        ) : (
          <p className="mt-3 text-sm text-gray-500">Source names will appear here when listings with source attribution are available.</p>
        )}
      </div>
    </section>
  );
}
