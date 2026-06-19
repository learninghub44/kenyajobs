import { useEffect, useRef } from "react";

// Every source with brand colour + SVG/letter logo
const SOURCES = [
  {
    name: "LinkedIn",
    color: "#0A66C2",
    bg: "#E8F0FB",
    icon: (
      <svg viewBox="0 0 24 24" fill="#0A66C2" width="20" height="20">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    name: "Indeed",
    color: "#003A9B",
    bg: "#E6ECF8",
    icon: (
      <svg viewBox="0 0 24 24" fill="#003A9B" width="20" height="20">
        <path d="M10.2 0C4.7 0 .2 4.5.2 10s4.5 10 10 10c2.5 0 4.8-.9 6.5-2.4l2.3 2.3 1.4-1.4-2.3-2.3c1.5-1.8 2.4-4 2.4-6.5C20.2 4.5 15.7 0 10.2 0zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm.8-12.5h-1.5v5l4.3 2.6.8-1.2-3.6-2.1V5.5z"/>
      </svg>
    ),
  },
  {
    name: "Remotive",
    color: "#6C3FC5",
    bg: "#F0EBFC",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <circle cx="12" cy="12" r="10" fill="#6C3FC5"/>
        <text x="6" y="16" fontSize="10" fill="white" fontWeight="bold">R</text>
      </svg>
    ),
  },
  {
    name: "Jobicy",
    color: "#FF5733",
    bg: "#FFF0EC",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <rect width="24" height="24" rx="6" fill="#FF5733"/>
        <text x="5" y="17" fontSize="11" fill="white" fontWeight="bold">J</text>
      </svg>
    ),
  },
  {
    name: "BrighterMonday",
    color: "#E8A000",
    bg: "#FFF8E6",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <circle cx="12" cy="12" r="10" fill="#E8A000"/>
        <text x="6.5" y="16" fontSize="10" fill="white" fontWeight="bold">BM</text>
      </svg>
    ),
  },
  {
    name: "ReliefWeb",
    color: "#0072BC",
    bg: "#E6F3FA",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <rect width="24" height="24" rx="4" fill="#0072BC"/>
        <text x="5" y="16" fontSize="9" fill="white" fontWeight="bold">RW</text>
      </svg>
    ),
  },
  {
    name: "The Muse",
    color: "#00B186",
    bg: "#E6FAF5",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <circle cx="12" cy="12" r="10" fill="#00B186"/>
        <text x="6" y="16" fontSize="10" fill="white" fontWeight="bold">M</text>
      </svg>
    ),
  },
  {
    name: "Arbeitnow",
    color: "#1A1A2E",
    bg: "#EBEBF5",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <rect width="24" height="24" rx="6" fill="#1A1A2E"/>
        <text x="5" y="16" fontSize="9" fill="white" fontWeight="bold">AN</text>
      </svg>
    ),
  },
  {
    name: "Himalayas",
    color: "#3B5BDB",
    bg: "#EEF2FF",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <rect width="24" height="24" rx="6" fill="#3B5BDB"/>
        <path d="M4 18 L8 10 L12 15 L16 8 L20 18Z" fill="white" opacity="0.9"/>
      </svg>
    ),
  },
  {
    name: "MyJobMag",
    color: "#C0392B",
    bg: "#FDECEA",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <circle cx="12" cy="12" r="10" fill="#C0392B"/>
        <text x="4.5" y="16" fontSize="9" fill="white" fontWeight="bold">MJM</text>
      </svg>
    ),
  },
  {
    name: "Fuzu",
    color: "#F97316",
    bg: "#FFF3EA",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <rect width="24" height="24" rx="6" fill="#F97316"/>
        <text x="5" y="16" fontSize="10" fill="white" fontWeight="bold">FZ</text>
      </svg>
    ),
  },
  {
    name: "UNDP",
    color: "#009EDB",
    bg: "#E5F5FC",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <circle cx="12" cy="12" r="10" fill="#009EDB"/>
        <text x="3" y="16" fontSize="8" fill="white" fontWeight="bold">UNDP</text>
      </svg>
    ),
  },
  {
    name: "Devex",
    color: "#2E86AB",
    bg: "#E8F4F8",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <rect width="24" height="24" rx="6" fill="#2E86AB"/>
        <text x="3" y="16" fontSize="9" fill="white" fontWeight="bold">DEV</text>
      </svg>
    ),
  },
  {
    name: "Corporate Staffing",
    color: "#1B4332",
    bg: "#E9F5EE",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <rect width="24" height="24" rx="6" fill="#1B4332"/>
        <text x="5.5" y="16" fontSize="10" fill="white" fontWeight="bold">CS</text>
      </svg>
    ),
  },
  {
    name: "NGO Jobs",
    color: "#7B2FBE",
    bg: "#F3E8FF",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <circle cx="12" cy="12" r="10" fill="#7B2FBE"/>
        <text x="4.5" y="16" fontSize="9" fill="white" fontWeight="bold">NGO</text>
      </svg>
    ),
  },
  {
    name: "Ajira (Govt KE)",
    color: "#006600",
    bg: "#E6F2E6",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
        <circle cx="12" cy="12" r="10" fill="#006600"/>
        <text x="4" y="16" fontSize="9" fill="white" fontWeight="bold">AJR</text>
      </svg>
    ),
  },
];

// Split into two rows for opposite direction scrolling
const ROW1 = SOURCES.slice(0, Math.ceil(SOURCES.length / 2));
const ROW2 = SOURCES.slice(Math.ceil(SOURCES.length / 2));

function MarqueeRow({ items, reverse = false, speed = 35 }) {
  // Duplicate for seamless loop
  const doubled = [...items, ...items, ...items];

  return (
    <div className="overflow-hidden w-full">
      <div
        className={`flex gap-3 w-max ${reverse ? "marquee-reverse" : "marquee"}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {doubled.map((src, i) => (
          <div
            key={`${src.name}-${i}`}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border flex-shrink-0 select-none"
            style={{
              backgroundColor: src.bg,
              borderColor: src.color + "30",
              minWidth: 160,
            }}
          >
            <div className="flex-shrink-0">{src.icon}</div>
            <span
              className="text-sm font-semibold whitespace-nowrap"
              style={{ color: src.color }}
            >
              {src.name}
            </span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .marquee {
          animation: scroll-left linear infinite;
        }
        .marquee-reverse {
          animation: scroll-right linear infinite;
        }
        @keyframes scroll-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        @keyframes scroll-right {
          0%   { transform: translateX(-33.333%); }
          100% { transform: translateX(0); }
        }
        .marquee:hover,
        .marquee-reverse:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

export default function SourcesMarquee() {
  return (
    <section className="bg-white border-t border-gray-100 py-12 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 mb-8 text-center">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Trusted sources powering this site
        </p>
        <h2 className="text-2xl font-bold text-gray-800 mt-1">
          Jobs pulled from {SOURCES.length}+ verified boards
        </h2>
      </div>

      <div className="space-y-3">
        <MarqueeRow items={ROW1} reverse={false} speed={30} />
        <MarqueeRow items={ROW2} reverse={true} speed={25} />
      </div>
    </section>
  );
}
