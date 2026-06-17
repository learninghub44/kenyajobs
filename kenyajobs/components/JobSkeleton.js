import { useState, useEffect } from "react";

const messages = [
  "Scanning job boards worldwide...",
  "Pulling fresh listings from every continent...",
  "Checking remote opportunities...",
  "Almost there, sorting by latest...",
];

export default function JobSkeleton({ count = 9 }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 text-sm text-gray-500">
        <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <span className="animate-pulse">{messages[msgIndex]}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5"
            style={{ opacity: 1 - i * 0.06 }}>
            <div className="flex gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3.5 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-blue-100 rounded animate-pulse w-1/2" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <div className="h-6 bg-gray-100 rounded-lg animate-pulse w-24" />
              <div className="h-6 bg-gray-100 rounded-lg animate-pulse w-16" />
            </div>
            <div className="h-9 bg-blue-50 rounded-xl animate-pulse mt-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
