import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Page Not Found | JobsWorldwide</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="relative w-full max-w-sm mx-auto mb-8 rounded-2xl overflow-hidden">
          <Image
            src="/dream-job-signpost.jpg"
            alt="Signpost pointing the way to your dream job"
            width={1280}
            height={854}
            className="w-full h-auto"
            priority
          />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">404 — wrong turn</h1>
        <p className="text-gray-500 mb-8">
          This page doesn&apos;t exist, but thousands of real opportunities still do. Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
            ← Back to Jobs
          </Link>
          <Link href="/search" className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-blue-300 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
            <Search size={15} /> Search Jobs
          </Link>
        </div>
      </div>
    </>
  );
}
