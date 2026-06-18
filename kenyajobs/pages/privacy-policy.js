import Head from "next/head";
import Link from "next/link";

const UPDATED = "June 18, 2026";
const EMAIL = "hello@jobsworldwide.online";
const DOMAIN = "jobsworldwide.online";

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-100">{title}</h2>
      <div className="space-y-3 text-gray-600 text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function Ul({ items }) {
  return (
    <ul className="space-y-1.5 mt-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
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

      <div className="bg-gray-50 border-b border-gray-200 py-10">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-2">Legal</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: {UPDATED} &nbsp;·&nbsp; Effective immediately</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Sidebar TOC */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="sticky top-24">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Contents</p>
              <nav className="space-y-1">
                {toc.map(([id, label]) => (
                  <a key={id} href={`#${id}`}
                    className="block text-sm text-gray-500 hover:text-gray-900 hover:translate-x-0.5 transition-all py-0.5">
                    {label}
                  </a>
                ))}
              </nav>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link href="/terms-and-conditions" className="text-sm text-blue-600 hover:underline">
                  Terms & Conditions →
                </Link>
              </div>
            </div>
          </aside>

          {/* Body */}
          <main className="flex-1 space-y-10">

            <Section id="overview" title="1. Overview">
              <p>
                This Privacy Policy describes how <strong>JobsWorldwide</strong> ("we", "us", or "our"),
                operated at <strong>{DOMAIN}</strong>, handles information when you visit or use our website.
                JobsWorldwide is a free, independent job aggregator that pulls listings from multiple
                trusted global job boards and displays them in one place.
              </p>
              <p>
                We are committed to your privacy. <strong>We do not sell your personal data.</strong> We do not
                require you to register or log in to browse or search for jobs. This policy explains what
                limited data we do collect, why, and how you can control it.
              </p>
              <p>
                By using our website you agree to the practices described here. If you do not agree,
                please stop using the site and contact us with any questions.
              </p>
            </Section>

            <Section id="info-collected" title="2. Information We Collect">
              <p><strong>We do not collect personal information directly.</strong> You can browse all job
              listings and use the search without providing your name, email, or any other identifying detail.</p>

              <p className="font-medium text-gray-700 mt-4">Automatically collected data</p>
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
              <p className="mt-2">
                This data is processed in aggregate. We do not combine it with other sources to identify
                you personally.
              </p>

              <p className="font-medium text-gray-700 mt-4">Information you voluntarily provide</p>
              <p>If you email us directly or use a contact form, we will receive your email address
              and any information you include in the message. We use this only to respond to your enquiry.</p>

              <p className="font-medium text-gray-700 mt-4">Employer / job-poster information</p>
              <p>If you submit a job listing through our admin panel or by email request, we collect
              the company name, job details, and your contact email in order to display the listing.
              We do not share this with third parties.</p>
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
              <p className="mt-2">
                <strong>We do not use your data for automated profiling, targeted marketing, or sale to
                third parties.</strong>
              </p>
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
                We make reasonable efforts to source listings from reputable boards, but we cannot
                guarantee the accuracy, completeness, or legitimacy of every listing. If you encounter
                a suspicious listing, please report it to us at <a href={`mailto:${EMAIL}`}
                className="text-blue-600 hover:underline">{EMAIL}</a>.
              </p>
            </Section>

            <Section id="cookies" title="5. Cookies & Tracking">
              <p>
                We use a small number of cookies and similar technologies. A cookie is a small text
                file stored in your browser.
              </p>
              <p className="font-medium text-gray-700 mt-3">Essential cookies (always active)</p>
              <Ul items={[
                "Session state — remembers your search filters and preferences during your visit",
                "Security tokens — protect against cross-site request forgery (CSRF)",
              ]} />
              <p className="font-medium text-gray-700 mt-3">Analytics cookies (can be declined)</p>
              <Ul items={[
                "Aggregate page-view and navigation data to help us improve the site",
                "No cross-site tracking; data is not linked to your identity",
              ]} />
              <p className="font-medium text-gray-700 mt-3">Advertising cookies (Google AdSense)</p>
              <Ul items={[
                "Served by Google to display relevant ads — see Section 6 for full details",
              ]} />
              <p className="mt-3">
                You can disable or clear cookies at any time through your browser settings. Disabling
                essential cookies may affect site functionality. You can also use browser extensions
                such as uBlock Origin or Privacy Badger to control tracking across all sites you visit.
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
                "Visit Google Ad Settings: https://www.google.com/settings/ads",
                "Use the Digital Advertising Alliance opt-out tool: https://optout.aboutads.info/",
                "Use the Network Advertising Initiative opt-out: https://optout.networkadvertising.org/",
              ]} />
              <p className="mt-2">
                Google's use of advertising cookies is governed by the{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 hover:underline">Google Privacy Policy</a>.
                We do not have access to the data Google collects through AdSense.
              </p>
              <p className="mt-2">
                We also display sponsored listings managed directly by us. These are clearly labelled
                "Sponsored" and do not involve tracking cookies from our side.
              </p>
            </Section>

            <Section id="data-retention" title="7. Data Retention">
              <p>
                We retain aggregate analytics data for up to <strong>24 months</strong> to identify
                long-term trends and improve the site. Individual IP addresses, where temporarily
                logged by our hosting provider, are anonymised or deleted within <strong>30 days</strong>.
              </p>
              <p>
                Email correspondence is retained for as long as necessary to resolve your enquiry, then
                deleted. Job listing submissions (employer data) are retained for as long as the listing
                remains live, or until you request removal.
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
              <p className="mt-2">
                To exercise any of these rights, email us at{" "}
                <a href={`mailto:${EMAIL}`} className="text-blue-600 hover:underline">{EMAIL}</a>.
                We will respond within <strong>30 days</strong>. We may need to verify your identity
                before actioning a request.
              </p>
              <p className="mt-2">
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
                However, no method of data transmission over the internet or electronic storage is
                completely secure. We cannot guarantee absolute security. We encourage you not to
                share sensitive personal information (such as your ID number, banking details, or
                passwords) through any website, including ours.
              </p>
              <p>
                If you believe our systems have been compromised, please notify us immediately at{" "}
                <a href={`mailto:${EMAIL}`} className="text-blue-600 hover:underline">{EMAIL}</a>.
              </p>
            </Section>

            <Section id="children" title="10. Children's Privacy">
              <p>
                JobsWorldwide is a professional job board intended for users who are at least{" "}
                <strong>16 years old</strong> (or the minimum working age in your jurisdiction, if higher).
                We do not knowingly collect personal data from anyone under 16. If you believe a child
                has submitted information to us, please contact us immediately and we will delete it.
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
                Where required by law, we ensure appropriate safeguards are in place for such transfers
                (such as standard contractual clauses). For questions about international transfers,
                contact us at{" "}
                <a href={`mailto:${EMAIL}`} className="text-blue-600 hover:underline">{EMAIL}</a>.
              </p>
            </Section>

            <Section id="changes" title="12. Changes to This Policy">
              <p>
                We may update this Privacy Policy periodically to reflect changes in our practices,
                technology, legal requirements, or for other operational reasons. When we make material
                changes, we will update the "Last updated" date at the top of this page.
              </p>
              <p>
                We encourage you to review this page whenever you use our site. Continued use of
                JobsWorldwide after changes are posted constitutes your acceptance of the updated policy.
              </p>
            </Section>

            <Section id="contact" title="13. Contact Us">
              <p>For any questions, complaints, or requests relating to this Privacy Policy:</p>
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                <p className="font-semibold text-gray-800 mb-1">JobsWorldwide</p>
                <p>Email: <a href={`mailto:${EMAIL}`} className="text-blue-600 hover:underline">{EMAIL}</a></p>
                <p className="mt-1 text-gray-400 text-xs">We aim to respond within 2–3 business days.</p>
              </div>
            </Section>

            <div className="pt-8 border-t border-gray-200 flex flex-wrap gap-4 text-sm">
              <Link href="/" className="text-blue-600 hover:underline">← Back to Jobs</Link>
              <Link href="/terms-and-conditions" className="text-blue-600 hover:underline">Terms & Conditions →</Link>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
