import Head from "next/head";
import Link from "next/link";

const UPDATED = "June 18, 2026";
const EMAIL = "hello@jobsworldwide.online";
const DOMAIN = "jobsworldwide.online";

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 style={{ fontFamily: "DM Sans, sans-serif" }}
        className="text-xl font-semibold tracking-tight text-gray-900 mb-3 pb-2.5 border-b border-gray-100">
        {title}
      </h2>
      <div className="space-y-3 text-base text-gray-600 leading-[1.75]">{children}</div>
    </section>
  );
}

function Ul({ items }) {
  return (
    <ul className="space-y-2 mt-2 ml-1">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-base text-gray-600 leading-relaxed">
          <span className="mt-2 w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Mono({ children }) {
  return (
    <span style={{ fontFamily: "var(--font-mono)" }} className="text-sm text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
      {children}
    </span>
  );
}

export default function PrivacyPolicy() {
  const toc = [
    ["overview", "Overview"],
    ["info-collected", "Information We Collect"],
    ["how-we-use", "How We Use Information"],
    ["third-party-links", "Third-Party Job Links"],
    ["cookies", "Cookies & Tracking"],
    ["advertising", "Advertising (Google AdSense)"],
    ["data-retention", "Data Retention"],
    ["your-rights", "Your Rights"],
    ["security", "Data Security"],
    ["children", "Children's Privacy"],
    ["international", "International Transfers"],
    ["changes", "Changes to This Policy"],
    ["contact", "Contact Us"],
  ];

  return (
    <>
      <Head>
        <title>Privacy Policy | JobsWorldwide</title>
        <meta name="description" content="Privacy Policy for JobsWorldwide — how we collect, use, and protect your information." />
      </Head>

      {/* Page header */}
      <div className="bg-gray-50 border-b border-gray-200 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p style={{ fontFamily: "var(--font-mono)" }}
            className="text-sm uppercase tracking-widest text-gray-400 mb-3">
            Legal Document
          </p>
          <h1 style={{ fontFamily: "DM Sans, sans-serif" }}
            className="text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900 leading-tight mb-2">
            Privacy Policy
          </h1>
          <p style={{ fontFamily: "var(--font-mono)" }}
            className="text-sm text-gray-400">
            Last updated: <span className="text-gray-600">{UPDATED}</span>
            &nbsp;·&nbsp; Effective immediately
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Sidebar TOC */}
          <aside className="lg:w-52 flex-shrink-0">
            <div className="sticky top-24">
              <p style={{ fontFamily: "var(--font-mono)" }}
                className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
                Contents
              </p>
              <nav className="space-y-0.5">
                {toc.map(([id, label]) => (
                  <a key={id} href={`#${id}`}
                    className="block text-sm text-gray-500 hover:text-gray-900 px-2 py-1.5 rounded hover:bg-gray-50 transition-all">
                    {label}
                  </a>
                ))}
              </nav>
              <div className="mt-6 pt-5 border-t border-gray-200 space-y-2">
                <Link href="/terms-and-conditions"
                  className="block text-sm text-blue-600 hover:underline">
                  Terms & Conditions →
                </Link>
                <Link href="/"
                  className="block text-sm text-gray-400 hover:text-gray-700">
                  ← Back to Jobs
                </Link>
              </div>
            </div>
          </aside>

          {/* Body */}
          <main className="flex-1 space-y-10 min-w-0">

            <Section id="overview" title="1. Overview">
              <p>
                This Privacy Policy describes how <strong>JobsWorldwide</strong> ("we", "us", or "our"),
                operated at <Mono>{DOMAIN}</Mono>, handles information when you visit or use our website.
                JobsWorldwide is a free, independent job aggregator that pulls listings from multiple
                trusted global job boards and displays them in one place.
              </p>
              <p>
                We are committed to your privacy. <strong>We do not sell your personal data.</strong> We
                do not require you to register or log in to browse or search for jobs. This policy
                explains what limited data we do collect, why, and how you can control it.
              </p>
              <p>
                By using our website you agree to the practices described here. If you do not agree,
                please stop using the site and contact us with any questions.
              </p>
            </Section>

            <Section id="info-collected" title="2. Information We Collect">
              <p>
                <strong>We do not collect personal information directly.</strong> You can browse all
                job listings and use the search without providing your name, email, or any other
                identifying detail.
              </p>
              <p className="text-base font-semibold text-gray-800 mt-4"
                style={{ fontFamily: "DM Sans, sans-serif" }}>
                Automatically collected data
              </p>
              <p>When you visit our site, our hosting and analytics providers automatically record:</p>
              <Ul items={[
                "IP address (used only for geolocation at country/city level — never stored long-term)",
                "Browser type, version, and language settings",
                "Device type and operating system",
                "Pages visited, time on page, and navigation path",
                "Search queries you enter on our site",
                "Referring website or URL that brought you here",
                "Date and time of each request",
              ]} />
              <p>This data is processed in aggregate. We do not combine it with other sources to identify you personally.</p>
              <p className="text-base font-semibold text-gray-800 mt-4"
                style={{ fontFamily: "DM Sans, sans-serif" }}>
                Information you voluntarily provide
              </p>
              <p>
                If you email us directly, we will receive your email address and any information you
                include in the message. We use this only to respond to your enquiry.
              </p>
              <p className="text-base font-semibold text-gray-800 mt-4"
                style={{ fontFamily: "DM Sans, sans-serif" }}>
                Employer / job-poster information
              </p>
              <p>
                If you submit a job listing through our admin panel or by email, we collect the company
                name, job details, and your contact email to display the listing. We do not share this
                with third parties.
              </p>
            </Section>

            <Section id="how-we-use" title="3. How We Use Information">
              <p>We use the information we collect only to:</p>
              <Ul items={[
                "Operate and improve the website — including page performance, search relevance, and bug fixes",
                "Understand which job categories, locations, and features are most used",
                "Detect and prevent abuse, spam, or fraudulent use of our platform",
                "Respond to enquiries sent directly to us",
                "Comply with legal obligations where required",
              ]} />
              <p><strong>We do not use your data for automated profiling, targeted marketing, or sale to third parties.</strong></p>
            </Section>

            <Section id="third-party-links" title="4. Third-Party Job Links">
              <p>
                JobsWorldwide aggregates listings from external job boards and employer sites including,
                but not limited to: BrighterMonday, MyJobMag, Remotive, Jobicy, Arbeitnow, ReliefWeb,
                Adzuna, and others. Each listing links directly to the original source.
              </p>
              <p>
                <strong>When you click "Apply Now" or any external link, you leave our website.</strong> We
                have no control over, and are not responsible for, the privacy practices, content, or
                job posting authenticity of those third-party websites. We encourage you to read their
                privacy policies before submitting any personal information.
              </p>
              <p>
                If you encounter a suspicious listing, please report it to us at{" "}
                <a href={`mailto:${EMAIL}`}
                  style={{ fontFamily: "var(--font-mono)" }}
                  className="text-sm text-blue-600 hover:underline">{EMAIL}</a>.
              </p>
            </Section>

            <Section id="cookies" title="5. Cookies & Tracking">
              <p>We use a small number of cookies and similar technologies. A cookie is a small text file stored in your browser.</p>
              <p className="text-base font-semibold text-gray-800 mt-4"
                style={{ fontFamily: "DM Sans, sans-serif" }}>Essential cookies (always active)</p>
              <Ul items={[
                "Session state — remembers your search filters and preferences during your visit",
                "Security tokens — protect against cross-site request forgery (CSRF)",
              ]} />
              <p className="text-base font-semibold text-gray-800 mt-4"
                style={{ fontFamily: "DM Sans, sans-serif" }}>Analytics cookies (can be declined)</p>
              <Ul items={[
                "Aggregate page-view and navigation data to help us improve the site",
                "No cross-site tracking; data is not linked to your identity",
              ]} />
              <p className="text-base font-semibold text-gray-800 mt-4"
                style={{ fontFamily: "DM Sans, sans-serif" }}>Advertising cookies (Google AdSense)</p>
              <Ul items={["Served by Google to display relevant ads — see Section 6 for full details"]} />
              <p>
                You can disable or clear cookies at any time through your browser settings. You can also
                use browser extensions such as uBlock Origin or Privacy Badger to control tracking.
              </p>
            </Section>

            <Section id="advertising" title="6. Advertising (Google AdSense)">
              <p>
                We display advertisements provided by <strong>Google AdSense</strong>. Google and its
                partners use cookies to serve ads based on your prior visits to this and other websites —
                a practice called interest-based advertising.
              </p>
              <p>You can opt out of personalised advertising at any time:</p>
              <Ul items={[
                "Google Ad Settings — https://www.google.com/settings/ads",
                "Digital Advertising Alliance opt-out — https://optout.aboutads.info/",
                "Network Advertising Initiative opt-out — https://optout.networkadvertising.org/",
              ]} />
              <p>
                Google's use of advertising cookies is governed by the{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 hover:underline">Google Privacy Policy</a>.
                We do not have access to the data Google collects through AdSense.
              </p>
              <p>
                We also display sponsored listings managed directly by us. These are clearly labelled
                "Sponsored" and do not involve tracking cookies from our side.
              </p>
            </Section>

            <Section id="data-retention" title="7. Data Retention">
              <p>
                We retain aggregate analytics data for up to <strong>24 months</strong> to identify
                long-term trends. Individual IP addresses, where temporarily logged by our hosting
                provider, are anonymised or deleted within <strong>30 days</strong>.
              </p>
              <p>
                Email correspondence is retained for as long as necessary to resolve your enquiry, then
                deleted. Job listing submissions are retained for as long as the listing remains live,
                or until you request removal.
              </p>
            </Section>

            <Section id="your-rights" title="8. Your Rights">
              <p>
                Depending on your country of residence, you may have rights under applicable data
                protection law (including the Kenya Data Protection Act 2019, the EU/UK GDPR, and
                similar legislation). These may include:
              </p>
              <Ul items={[
                "Right of access — request a copy of any personal data we hold about you",
                "Right to rectification — ask us to correct inaccurate data",
                "Right to erasure — ask us to delete your data where we have no legal basis to retain it",
                "Right to restrict processing — ask us to pause processing of your data",
                "Right to data portability — receive your data in a machine-readable format",
                "Right to object — object to processing based on legitimate interests",
                "Right to withdraw consent — where processing is based on consent, withdraw it at any time",
              ]} />
              <p>
                To exercise any of these rights, email us at{" "}
                <a href={`mailto:${EMAIL}`}
                  style={{ fontFamily: "var(--font-mono)" }}
                  className="text-sm text-blue-600 hover:underline">{EMAIL}</a>.
                We will respond within <strong>30 days</strong>.
              </p>
              <p>
                If you are unsatisfied with our response, you have the right to lodge a complaint with
                your local data protection authority (in Kenya: the Office of the Data Protection
                Commissioner).
              </p>
            </Section>

            <Section id="security" title="9. Data Security">
              <p>
                We implement reasonable technical and organisational measures to protect information
                processed through our website — including HTTPS encryption for all traffic, access
                controls on our database and admin systems, and regular dependency updates.
              </p>
              <p>
                However, no method of data transmission or electronic storage is completely secure. We
                encourage you not to share sensitive personal information (such as your ID number,
                banking details, or passwords) through any website.
              </p>
              <p>
                If you believe our systems have been compromised, notify us immediately at{" "}
                <a href={`mailto:${EMAIL}`}
                  style={{ fontFamily: "var(--font-mono)" }}
                  className="text-sm text-blue-600 hover:underline">{EMAIL}</a>.
              </p>
            </Section>

            <Section id="children" title="10. Children's Privacy">
              <p>
                JobsWorldwide is intended for users who are at least <strong>16 years old</strong> (or
                the minimum working age in your jurisdiction, if higher). We do not knowingly collect
                personal data from anyone under 16. If you believe a child has submitted information
                to us, please contact us immediately and we will delete it.
              </p>
            </Section>

            <Section id="international" title="11. International Data Transfers">
              <p>
                Our website is served globally and our infrastructure may be hosted in data centres
                outside your country (including the United States and European Union). By using our
                site, you acknowledge that your information may be processed in countries that have
                different data protection standards than your own.
              </p>
              <p>
                Where required by law, we ensure appropriate safeguards are in place for such transfers.
                For questions, contact us at{" "}
                <a href={`mailto:${EMAIL}`}
                  style={{ fontFamily: "var(--font-mono)" }}
                  className="text-sm text-blue-600 hover:underline">{EMAIL}</a>.
              </p>
            </Section>

            <Section id="changes" title="12. Changes to This Policy">
              <p>
                We may update this Privacy Policy periodically to reflect changes in our practices,
                technology, or legal requirements. When we make material changes, we will update the
                "Last updated" date at the top of this page.
              </p>
              <p>
                Continued use of JobsWorldwide after changes are posted constitutes your acceptance
                of the updated policy.
              </p>
            </Section>

            <Section id="contact" title="13. Contact Us">
              <p>For any questions, complaints, or requests relating to this Privacy Policy:</p>
              <div className="mt-4 p-5 bg-gray-50 border border-gray-200 rounded-xl">
                <p style={{ fontFamily: "DM Sans, sans-serif" }}
                  className="font-semibold text-base text-gray-900 mb-2">JobsWorldwide</p>
                <p className="text-base text-gray-600">
                  Email:{" "}
                  <a href={`mailto:${EMAIL}`}
                    style={{ fontFamily: "var(--font-mono)" }}
                    className="text-sm text-blue-600 hover:underline">{EMAIL}</a>
                </p>
                <p style={{ fontFamily: "var(--font-mono)" }}
                  className="text-sm text-gray-400 mt-2">
                  Response time: 2–3 business days
                </p>
              </div>
            </Section>

            <div className="pt-8 border-t border-gray-200 flex flex-wrap gap-5 text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">← Back to Jobs</Link>
              <Link href="/terms-and-conditions" className="text-blue-600 hover:underline">Terms & Conditions →</Link>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
