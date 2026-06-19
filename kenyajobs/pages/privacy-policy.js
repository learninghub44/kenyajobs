import Head from "next/head";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | JobsWorldwide</title>
        <meta name="description" content="Privacy policy for JobsWorldwide." />
      </Head>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-10">Last updated: June 2025</p>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-8 text-gray-600 leading-relaxed">

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">1. About This Policy</h2>
            <p>This Privacy Policy explains how JobsWorldwide ("we", "our", or "us"), accessible at <strong>jobsworldwide.online</strong>, collects, uses, and protects information when you use our website.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">2. Information We Collect</h2>
            <p>JobsWorldwide does not require you to create an account or provide personal information to browse jobs. We may automatically collect anonymous usage data such as pages visited, search queries, browser type, and referring website. This data is collected in aggregate and cannot be used to identify you personally.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">3. How We Use Information</h2>
            <p>Any data collected is used solely to improve the experience on JobsWorldwide — to understand popular categories, improve search relevance, and diagnose technical issues. We do not sell, rent, or share your personal information with third parties for marketing purposes.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">4. Third-Party Job Links</h2>
            <p>JobsWorldwide is a job aggregator. All listings link directly to third-party employer websites or job boards. When you click "Apply Now", you leave our site and are subject to that third party's own privacy policy. We are not responsible for the content or privacy practices of those external websites.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">5. Cookies</h2>
            <p>We may use cookies to enhance your browsing experience. You can disable cookies in your browser settings at any time without losing access to the site.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">6. Google AdSense &amp; Advertising</h2>
            <p>We use Google AdSense to display advertisements. Google and its partners may use cookies to serve ads based on your prior visits. You can opt out via <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Ad Settings</a>.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">7. Data Security</h2>
            <p>We take reasonable precautions to protect our website. However, no method of internet transmission is 100% secure.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">8. Children&apos;s Privacy</h2>
            <p>JobsWorldwide is not directed at children under 13. We do not knowingly collect information from children.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">9. Changes to This Policy</h2>
            <p>We may update this policy from time to time. Updates will be posted on this page with a revised date.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">10. Contact Us</h2>
            <p className="mb-2">If you have any questions about this Privacy Policy, please contact us:</p>
            <a href="mailto:hello@jobsworldwide.online" className="text-blue-600 hover:underline font-medium">hello@jobsworldwide.online</a>
            <p className="text-sm text-gray-400 mt-1">We aim to respond within 2–3 business days.</p>
          </div>

        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:underline text-sm">Back to Jobs</Link>
        </div>
      </div>
    </>
  );
}
