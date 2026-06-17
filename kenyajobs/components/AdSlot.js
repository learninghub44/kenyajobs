import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

// Renders, in priority order:
//   1. An admin-managed sponsored listing for this placement (from /api/ads)
//   2. A Google AdSense unit, if NEXT_PUBLIC_ADSENSE_CLIENT + adSlot are set
//   3. A quiet "Advertisement" placeholder, so layout doesn't jump once either
//      of the above is configured.
//
// placement should be one of: "homepage-grid", "listing-grid", "sidebar", "all"
export default function AdSlot({ placement = "all", adSlot, className = "" }) {
  const [ad, setAd] = useState(null);
  const [checked, setChecked] = useState(false);
  const adsenseRef = useRef(null);
  const adsensePushed = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/ads?placement=${encodeURIComponent(placement)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (cancelled) return;
        setAd(Array.isArray(data) && data.length > 0 ? data[0] : null);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setChecked(true); });
    return () => { cancelled = true; };
  }, [placement]);

  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const showAdsense = checked && !ad && adsenseClient && adSlot;

  useEffect(() => {
    if (!showAdsense || adsensePushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      adsensePushed.current = true;
    } catch {
      // AdSense script may not have loaded yet (ad blocker, slow network) — ignore.
    }
  }, [showAdsense]);

  if (ad) {
    return (
      <a
        href={ad.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className={`group block bg-white border border-amber-200 bg-amber-50/40 rounded-2xl p-5 hover:border-amber-300 hover:shadow-md transition-all duration-200 ${className}`}
      >
        <div className="flex items-start gap-3 mb-3">
          {ad.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ad.imageUrl} alt={ad.company || ad.title} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-amber-200" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
              {(ad.company || ad.title || "A").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            {ad.company && <p className="text-sm text-gray-500 font-medium truncate">{ad.company}</p>}
            <h3 className="font-semibold text-gray-900 text-base leading-snug group-hover:text-amber-700 transition-colors line-clamp-2">
              {ad.title}
            </h3>
          </div>
        </div>
        {ad.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{ad.description}</p>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-amber-100">
          <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">Sponsored</span>
          <span className="text-xs font-semibold text-amber-700 flex items-center gap-1 group-hover:gap-2 transition-all">
            Learn More <ArrowUpRight size={12} />
          </span>
        </div>
      </a>
    );
  }

  if (showAdsense) {
    return (
      <div ref={adsenseRef} className={className}>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={adsenseClient}
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  return (
    <div className={`bg-gray-100 text-gray-400 text-center text-xs py-5 rounded-xl border border-dashed border-gray-300 ${className}`}>
      Advertisement
    </div>
  );
}
