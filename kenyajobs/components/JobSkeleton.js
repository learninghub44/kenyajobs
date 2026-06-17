const messages = [
  "Scanning job boards worldwide...",
  "Pulling fresh listings from Africa....",
  "Checking remote opportunities...",
  "Almost there, sorting by latest...",
];

export default function JobSkeleton({ count = 9 }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6 text-sm text-gray-500">
        <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <span className="animate-pulse">{messages[Math.floor(Date.now() / 2000) % messages.length]}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5"
            style={{ opacity: 1 - i * 0.06 }}>
            <div className="flex gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3.5 bg-gradient-to-r from-gray-200 to-gray-100 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gradient-to-r from-blue-100 to-blue-50 rounded animate-pulse w-1/2" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <div className="h-6 bg-gray-100 rounded-lg animate-pulse w-24" style={{ animationDelay: `${i * 0.1}s` }} />
              <div className="h-6 bg-gray-100 rounded-lg animate-pulse w-16" style={{ animationDelay: `${i * 0.15}s` }} />
            </div>
            <div className="h-9 bg-blue-50 rounded-xl animate-pulse mt-4" style={{ animationDelay: `${i * 0.05}s` }} />
          </div>
        ))}
      </div>
    </div>
  );
}
