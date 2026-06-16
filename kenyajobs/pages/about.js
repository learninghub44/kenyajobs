// pages/about.js
import Head from "next/head";
import Link from "next/link";

export default function About() {
  return (
    <>
      <Head>
        <title>About KenyaJobs.co.ke | Jobs in Kenya 2026</title>
        <meta name="description" content="Learn about KenyaJobs.co.ke — Kenya's job board for remote, entry level, graduate and work from home jobs." />
      </Head>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">About KenyaJobs.co.ke</h1>
        <p className="text-blue-600 font-medium mb-8">Kenya's #1 Job Board for 2026</p>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6 text-gray-600 leading-relaxed">

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Who We Are</h2>
            <p>KenyaJobs.co.ke is a free job board dedicated to helping Kenyans find quality employment opportunities. We aggregate jobs from trusted sources across the internet so you never miss an opportunity.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">What We Offer</h2>
            <ul className="space-y-2">
              <li>✅ <strong>Remote Jobs</strong> — Work from anywhere in the world</li>
              <li>✅ <strong>Entry Level Jobs</strong> — Start your career with no experience</li>
              <li>✅ <strong>Graduate Jobs</strong> — Trainee programs for fresh graduates</li>
              <li>✅ <strong>Work From Home Jobs</strong> — Legitimate online income opportunities</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Our Mission</h2>
            <p>To make job searching easier and faster for every Kenyan — whether you are a fresh graduate, a student looking for attachment, or a professional seeking remote work.</p>
          </div>

         <div>
  <h2 className="text-xl font-bold text-gray-800 mb-2">Contact Us</h2>
  <p>Have a question, suggestion or want to advertise with us?</p>

  <a
    href="mailto:hello@kenyajobs.co.ke"
    className="inline-block mt-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
  >
    📧 hello@kenyajobs.co.ke
  </a>
</div>

        </div>
      </div>
    </>
  );
}