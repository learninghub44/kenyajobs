import Link from "next/link";
import { AlertTriangle, Home, RefreshCw, Mail } from "lucide-react";

export default function ServerError() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">
        <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={28} className="text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Something went wrong</h1>
        <p className="text-lg text-gray-500 mb-8 leading-relaxed">
          Our server hit an unexpected error. This is on us — please try again in a moment or go back to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-base">
            <Home size={18} /> Back to Homepage
          </Link>
          <button onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors text-base">
            <RefreshCw size={18} /> Try Again
          </button>
        </div>
        <p className="mt-8 text-sm text-gray-400">
          If the problem persists, email us at{" "}
          <a href="mailto:hello@jobsworldwide.online" className="text-blue-600 hover:underline inline-flex items-center gap-1">
            <Mail size={13} /> hello@jobsworldwide.online
          </a>
        </p>
      </div>
    </div>
  );
}
