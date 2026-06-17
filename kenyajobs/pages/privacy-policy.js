// pages/privacy-policy.js
import Head from "next/head";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | JobsWorldwide</title>
        <meta name="description" content="Privacy policy for JobsWorldwide — your free global job board." />
      </Head>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-8">Last updated: June 2025</p>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-8 text-gray-600 leading-relaxed">

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">1. About This Policy</h2>
            <p>This Privacy Policy explains how JobsWorldwide ("we", "our", or "us"), accessible at <strong>jobsworldwide.online</strong>, collects, uses, and protects information when you use our website. By using our site, you agree to the practices described in this policy.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">2. Information We Collect</h2>
            <p>JobsWorldwide does not require you to create an account or provide personal information to browse jobs. We may automatically collect anonymous usage data such as:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-500 text-sm">
              <li>Pages visited and time spent on each page</li>
              <li>Search queries entered on our site</li>
              <li>Browser type, device type, and operating system</li>
              <li>Referring website or source</li>
            </ul>
            <p className="mt-2">This data is collected in aggregate and cannot be used to identify you personally.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">3. How We Use Information</h2>
            <p>Any data collected is used solely to improve the experience on JobsWorldwide. Specifically, we use it to:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-500 text-sm">
              <li>Understand which job categories are most popular</li>
              <li>Improve site performance and search relevance</li>
              <li>Diagnose technical issues</li>
            </ul>
            <p className="mt-2">We do not sell, rent, trade, or share your personal information with third parties for marketing purposes.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">4. Third-Party Job Links</h2>
            <p>JobsWorldwide is a job aggregator. All job listings link directly to third-party employer websites, job boards, or recruitment platforms (such as BrighterMonday Kenya, MyJobMag, Remotive, Jobicy, and others). When you click "Apply Now", you leave our site and are subject to that third party's own privacy policy. We are not responsible for the privacy practices or content of those external websites.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">5. Cookies</h2>
            <p>We may use cookies and similar tracking technologies to enhance your browsing experience. Cookies help us remember your preferences and understand how visitors use our site. You can disable cookies in your browser settings at any time — this will not prevent you from using the site, though some features may be affected.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">6. Google AdSense & Advertising</h2>
            <p>We use Google AdSense to display advertisements on our site. Google and its partners may use cookies to serve ads based on your prior visits to our site and other websites. This is known as interest-based advertising. You can opt out of personalised advertising at any time by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Ad Settings</a> or by using the <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Digital Advertising Alliance opt-out tool</a>.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">7. Data Security</h2>
            <p>We take reasonable precautions to protect our website and any information processed through it. However, no method of internet transmission is 100% secure. We encourage you not to share sensitive personal information through any website.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">8. Children's Privacy</h2>
            <p>JobsWorldwide is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has submitted personal information to us, please contact us and we will delete it promptly.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons. Any updates will be posted on this page with a revised "Last updated" date. We encourage you to review this page periodically.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">10. Contact Us</h2>
            <p className="mb-2">If you have any questions, concerns, or requests regarding this Privacy Policy, please reach out to us:</p>
            <a href="mailto:hello@jobsworldwide.online" className="text-blue-600 hover:underline font-medium">hello@jobsworldwide.online</a>
            <p className="text-sm text-gray-400 mt-1">We aim to respond to all enquiries within 2–3 business days.</p>
          </div>

        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:underline text-sm">← Back to Jobs</Link>
        </div>
      </div>
    </>
  );
}
