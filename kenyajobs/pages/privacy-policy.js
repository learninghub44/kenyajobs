// pages/privacy-policy.js
import Head from "next/head";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | KenyaJobs.co.ke</title>
        <meta name="description" content="Privacy policy for KenyaJobs.co.ke" />
      </Head>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-8">Last updated: January 2026</p>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-8 text-gray-600 leading-relaxed">

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">1. Information We Collect</h2>
            <p>KenyaJobs.co.ke does not require you to create an account or provide personal information to browse jobs. We may collect anonymous usage data such as pages visited and search queries to improve our service.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">2. How We Use Information</h2>
            <p>Any data collected is used solely to improve the user experience on KenyaJobs.co.ke. We do not sell, trade, or share your personal information with third parties.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">3. Third Party Links</h2>
            <p>Our website contains links to third-party job listings. When you click "Apply Now", you will be redirected to the employer's or recruiter's website. We are not responsible for the privacy practices of those websites.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">4. Cookies</h2>
            <p>We may use cookies to enhance your browsing experience. You can choose to disable cookies through your browser settings. This will not prevent you from using the site.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">5. Google AdSense</h2>
            <p>We use Google AdSense to display advertisements. Google may use cookies to serve ads based on your visits to our site and other sites on the internet. You can opt out of personalised advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Ad Settings</a>.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">6. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated date.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">7. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <a href="mailto:hello@kenyajobs.co.ke" className="text-blue-600 hover:underline">hello@kenyajobs.co.ke</a>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:underline text-sm">← Back to Jobs</Link>
        </div>
      </div>
    </>
  );
}