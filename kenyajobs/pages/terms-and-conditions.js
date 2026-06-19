import Head from "next/head";
import Link from "next/link";

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms &amp; Conditions | JobsWorldwide</title>
        <meta name="description" content="Terms and conditions for JobsWorldwide." />
      </Head>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms &amp; Conditions</h1>
        <p className="text-gray-400 text-sm mb-10">Last updated: June 2025</p>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-8 text-gray-600 leading-relaxed">

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using JobsWorldwide ("the Site"), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the Site.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">2. About JobsWorldwide</h2>
            <p>JobsWorldwide is a free job aggregation platform that collects and displays job listings from third-party sources including job boards, company websites, and RSS feeds. We do not post original job listings and are not involved in the hiring process.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">3. No Employment Relationship</h2>
            <p>JobsWorldwide is not an employer, recruiter, or employment agency. We do not guarantee the accuracy, completeness, or availability of any job listing. All applications are made directly with the third-party employer.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">4. Third-Party Content</h2>
            <p>All job listings displayed on JobsWorldwide are sourced from third-party websites. We are not responsible for the content, accuracy, or legality of listings provided by external sources. When you click "Apply Now", you are redirected to an external site and their terms apply.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">5. Acceptable Use</h2>
            <p>You agree not to use the Site to scrape content, post spam, attempt to hack or disrupt the platform, or use it for any unlawful purpose. We reserve the right to block access for violations.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">6. Intellectual Property</h2>
            <p>The JobsWorldwide name, logo, and original site content are the intellectual property of JobsWorldwide. Job listings remain the property of their respective owners. You may not reproduce or distribute our original content without permission.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">7. Disclaimer of Warranties</h2>
            <p>The Site is provided "as is" without any warranties of any kind. We do not guarantee uninterrupted access or that the site is free from errors or viruses.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">8. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, JobsWorldwide shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the Site or any job listing found on it.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">9. Advertising</h2>
            <p>The Site displays advertisements via Google AdSense and may feature sponsored job listings. Sponsored content will be clearly identified where required by law.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">10. Changes to Terms</h2>
            <p>We reserve the right to update these Terms at any time. Continued use of the Site after changes constitutes acceptance of the new Terms.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">11. Governing Law</h2>
            <p>These Terms are governed by the laws of Kenya. Any disputes shall be subject to the jurisdiction of the courts of Kenya.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">12. Contact</h2>
            <p className="mb-2">For any questions about these Terms, contact us at:</p>
            <a href="mailto:hello@jobsworldwide.online" className="text-blue-600 hover:underline font-medium">hello@jobsworldwide.online</a>
          </div>

        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:underline text-sm">Back to Jobs</Link>
        </div>
      </div>
    </>
  );
}
