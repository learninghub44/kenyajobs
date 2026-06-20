import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X, Check } from "lucide-react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("jw_cookie_consent");
      if (!consent) setVisible(true);
    } catch {}
  }, []);

  function accept() {
    try { localStorage.setItem("jw_cookie_consent", "accepted"); } catch {}
    setVisible(false);
    window.dispatchEvent(new Event("jw-cookie-consent-changed"));
  }

  function decline() {
    try { localStorage.setItem("jw_cookie_consent", "declined"); } catch {}
    setVisible(false);
    window.dispatchEvent(new Event("jw-cookie-consent-changed"));
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-gray-900/10 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center flex-shrink-0">
            <Cookie size={18} className="text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 mb-1">We use cookies</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              We use cookies to improve your experience and show relevant ads via Google AdSense.
              By clicking <strong>Accept</strong> you consent to our use of cookies as described in our{" "}
              <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
            </p>
          </div>
          <button onClick={decline} className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-1" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5 mt-4 sm:justify-end">
          <button onClick={decline}
            className="text-sm font-medium text-gray-500 hover:text-gray-800 px-5 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
            Decline optional cookies
          </button>
          <button onClick={accept}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors">
            <Check size={15} /> Accept All Cookies
          </button>
        </div>
      </div>
    </div>
  );
}
