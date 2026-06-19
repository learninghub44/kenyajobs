import Head from "next/head";
import Link from "next/link";

const LAST_UPDATED = "19 June 2025";

function Section({ number, title, children }) {
  return (
    <section className="py-8 border-b border-gray-100 last:border-0">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-start gap-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-50 text-blue-600 text-sm font-bold flex items-center justify-center mt-0.5">{number}</span>
        {title}
      </h2>
      <div className="pl-10 text-gray-600 leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

function Bullet({ children }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-2.5" />
      <span>{children}</span>
    </li>
  );
}

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | JobsWorldwide</title>
        <meta name="description" content="Privacy Policy for JobsWorldwide — how we collect, use and protect your information." />
      </Head>

      {/* Page header */}
      <div className="bg-gray-950 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-blue-400 text-sm font-medium mb-3">Legal</p>
          <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-gray-400 text-base">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Intro box */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-10 text-gray-700 leading-relaxed">
          <p className="font-semibold text-gray-900 mb-2">Our commitment to your privacy</p>
          <p className="text-sm">
            JobsWorldwide operates at <strong>jobsworldwide.online</strong>. We believe privacy is a fundamental right.
            This policy explains clearly and honestly what information we collect, why we collect it, how we use it,
            and what rights you have. We will never sell your personal data.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">

          <Section number="1" title="Who We Are">
            <p>
              JobsWorldwide is a global job aggregation platform that collects and displays job listings from
              established third-party job boards and employer websites. We are not an employer, recruiter, or
              staffing agency. Our platform is a discovery and aggregation service only.
            </p>
            <p>
              For questions about this policy, contact us at:{" "}
              <a href="mailto:hello@jobsworldwide.online" className="text-blue-600 hover:underline font-medium">
                hello@jobsworldwide.online
              </a>
            </p>
          </Section>

          <Section number="2" title="What Information We Collect">
            <p>
              JobsWorldwide does not require you to create an account, register, or provide any personal information
              to browse and search for jobs. The following is a description of information that may be collected:
            </p>

            <div>
              <p className="font-semibold text-gray-800 mb-2">A. Information You Voluntarily Provide</p>
              <ul className="space-y-2">
                <Bullet>
                  <strong>Contact form / email enquiries:</strong> If you send us a message via the contact form
                  or by email, we collect your name, email address, and the content of your message in order
                  to respond to you.
                </Bullet>
                <Bullet>
                  <strong>Job posting requests:</strong> If you contact us to post a job, we collect your name,
                  company name, email address, and job details for the purpose of publishing your listing.
                </Bullet>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-gray-800 mb-2">B. Automatically Collected Data</p>
              <p className="mb-2">
                When you visit our website, standard web server and analytics tools may automatically collect:
              </p>
              <ul className="space-y-2">
                <Bullet>IP address (anonymised where possible)</Bullet>
                <Bullet>Browser type, version, and operating system</Bullet>
                <Bullet>Pages visited, time spent on pages, and navigation paths</Bullet>
                <Bullet>Referring website or search engine</Bullet>
                <Bullet>Search terms entered on our site</Bullet>
                <Bullet>Device type (desktop, mobile, tablet)</Bullet>
                <Bullet>Country and approximate region (derived from IP, not precise location)</Bullet>
              </ul>
              <p className="mt-3 text-sm text-gray-500">
                This data is collected in aggregate and is used solely to understand site usage patterns and
                improve the service. It cannot be used to identify you personally.
              </p>
            </div>
          </Section>

          <Section number="3" title="How We Use Your Information">
            <p>We use collected information for the following purposes only:</p>
            <ul className="space-y-2">
              <Bullet>To operate, maintain, and improve the JobsWorldwide platform</Bullet>
              <Bullet>To respond to your enquiries, messages, or job posting requests</Bullet>
              <Bullet>To understand which job categories and search terms are most popular</Bullet>
              <Bullet>To diagnose technical issues and monitor site performance</Bullet>
              <Bullet>To display relevant advertisements through Google AdSense</Bullet>
              <Bullet>To comply with legal obligations if required</Bullet>
            </ul>
            <p className="mt-2">
              We do <strong>not</strong> use your information for automated decision-making, profiling, or
              to send unsolicited marketing emails. We do <strong>not</strong> sell, rent, or share your
              personal data with any third party for their own marketing purposes.
            </p>
          </Section>

          <Section number="4" title="Third-Party Job Listings & External Links">
            <p>
              JobsWorldwide is a job aggregator. All job listings displayed on our site are sourced from
              third-party job boards, company websites, and RSS feeds. When you click <strong>"Apply Now"</strong>{" "}
              or <strong>"View Job"</strong>, you leave JobsWorldwide and are directed to an external website.
            </p>
            <p>
              Once you leave our site, the privacy practices and terms of that external website apply.
              We have no control over and accept no responsibility for the privacy practices, content, or
              data collection activities of any third-party website. We strongly encourage you to read the
              privacy policy of any website before submitting personal information to them.
            </p>
            <p>
              Third-party job sources we aggregate from include platforms such as Remotive, Jobicy,
              Arbeitnow, ReliefWeb, Adzuna, BrighterMonday, MyJobMag, and others. Each of these platforms
              operates under their own terms and privacy policies.
            </p>
          </Section>

          <Section number="5" title="Cookies & Tracking Technologies">
            <p>
              Cookies are small text files stored on your device by your browser. We use cookies for the
              following purposes:
            </p>
            <ul className="space-y-2">
              <Bullet>
                <strong>Essential cookies:</strong> Required for the site to function correctly, such as
                maintaining session state or security tokens.
              </Bullet>
              <Bullet>
                <strong>Analytics cookies:</strong> Used to understand how visitors use our site in aggregate.
                These do not identify you personally.
              </Bullet>
              <Bullet>
                <strong>Advertising cookies:</strong> Set by Google AdSense to serve ads relevant to your
                interests based on your browsing history.
              </Bullet>
            </ul>
            <p>
              You can control or disable cookies through your browser settings. Disabling cookies will not
              prevent you from browsing job listings on our site. For details on managing cookies, visit
              your browser&apos;s help documentation or{" "}
              <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer"
                className="text-blue-600 hover:underline">aboutcookies.org</a>.
            </p>
          </Section>

          <Section number="6" title="Google AdSense & Advertising">
            <p>
              We use Google AdSense to display advertisements on our site. Google AdSense uses cookies
              and similar technologies to serve ads based on your interests and prior browsing activity
              across websites that use Google services.
            </p>
            <p>
              Google&apos;s use of advertising cookies enables it and its partners to serve ads based on
              your visit to our site and other sites on the internet. You can opt out of personalised
              advertising at any time by visiting:
            </p>
            <ul className="space-y-2">
              <Bullet>
                <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 hover:underline">Google Ad Settings</a>{" "}
                — to manage your Google personalised ad preferences
              </Bullet>
              <Bullet>
                <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 hover:underline">YourAdChoices</a>{" "}
                — for industry-wide opt-out from interest-based advertising
              </Bullet>
            </ul>
            <p>
              For more information on how Google uses data when you use our site, see:{" "}
              <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer"
                className="text-blue-600 hover:underline">How Google uses information from sites that use its services</a>.
            </p>
          </Section>

          <Section number="7" title="Data Retention">
            <p>
              We retain information only for as long as necessary for the purposes described in this policy:
            </p>
            <ul className="space-y-2">
              <Bullet>
                Contact and enquiry emails are retained for up to 12 months to allow us to respond to
                follow-up questions and maintain a record of correspondence.
              </Bullet>
              <Bullet>
                Anonymised analytics data may be retained for up to 26 months to identify long-term trends
                in site usage.
              </Bullet>
              <Bullet>
                Job posting information provided by employers is retained for the duration of the listing
                and up to 90 days thereafter.
              </Bullet>
            </ul>
          </Section>

          <Section number="8" title="Data Security">
            <p>
              We implement appropriate technical and organisational measures to protect your information
              against unauthorised access, accidental loss, alteration, or disclosure. These include:
            </p>
            <ul className="space-y-2">
              <Bullet>HTTPS encryption for all data transmitted between your browser and our servers</Bullet>
              <Bullet>Access controls limiting who can access administrative systems</Bullet>
              <Bullet>Regular security reviews of our codebase and infrastructure</Bullet>
            </ul>
            <p>
              However, no method of transmitting or storing data over the internet is completely secure.
              While we take reasonable precautions, we cannot guarantee absolute security. If you believe
              your data has been compromised, please contact us immediately.
            </p>
          </Section>

          <Section number="9" title="Your Rights">
            <p>
              Depending on your location, you may have rights under applicable data protection laws,
              including:
            </p>
            <ul className="space-y-2">
              <Bullet><strong>Right of access:</strong> To request a copy of personal data we hold about you</Bullet>
              <Bullet><strong>Right to rectification:</strong> To request correction of inaccurate data</Bullet>
              <Bullet><strong>Right to erasure:</strong> To request deletion of your personal data</Bullet>
              <Bullet><strong>Right to restrict processing:</strong> To limit how we use your data</Bullet>
              <Bullet><strong>Right to data portability:</strong> To receive your data in a portable format</Bullet>
              <Bullet><strong>Right to object:</strong> To object to processing based on legitimate interests</Bullet>
            </ul>
            <p>
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:hello@jobsworldwide.online" className="text-blue-600 hover:underline font-medium">
                hello@jobsworldwide.online
              </a>. We will respond within 30 days. We may need to verify your identity before processing
              your request.
            </p>
          </Section>

          <Section number="10" title="Children's Privacy">
            <p>
              JobsWorldwide is intended for users who are 16 years of age or older. Our site is not
              directed at children under 16 and we do not knowingly collect personal information from
              children. If you believe a child has provided us with personal information, please contact
              us and we will delete it promptly.
            </p>
          </Section>

          <Section number="11" title="International Data Transfers">
            <p>
              Our site is accessible globally. If you are located outside Kenya, information you provide
              to us may be transferred to and processed in countries other than your own. By using our
              site, you consent to this transfer. We take steps to ensure that any such transfers comply
              with applicable data protection laws.
            </p>
          </Section>

          <Section number="12" title="Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices,
              technology, or legal requirements. When we make significant changes, we will update the
              "Last updated" date at the top of this page. We encourage you to review this page
              periodically to stay informed about how we protect your information.
            </p>
            <p>
              Continued use of JobsWorldwide after any changes to this policy constitutes your acceptance
              of the updated policy.
            </p>
          </Section>

          <Section number="13" title="Contact Us">
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our
              data practices, please contact us:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mt-2">
              <p className="font-semibold text-gray-900 mb-1">JobsWorldwide</p>
              <p className="text-sm text-gray-500 mb-3">Global job aggregation platform</p>
              <a href="mailto:hello@jobsworldwide.online"
                className="text-blue-600 hover:underline font-medium text-base">
                hello@jobsworldwide.online
              </a>
              <p className="text-sm text-gray-400 mt-2">We aim to respond to all enquiries within 2–3 business days.</p>
            </div>
          </Section>
        </div>

        {/* Bottom nav */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <Link href="/" className="text-blue-600 hover:underline">← Back to Jobs</Link>
          <div className="flex gap-5">
            <Link href="/terms-and-conditions" className="hover:text-gray-700 transition-colors">Terms & Conditions</Link>
            <Link href="/about" className="hover:text-gray-700 transition-colors">About Us</Link>
          </div>
        </div>
      </div>
    </>
  );
}
