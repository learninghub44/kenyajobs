import Head from "next/head";
import Link from "next/link";

const UPDATED = "June 18, 2026";
const EMAIL = "hello@jobsworldwide.online";
const DOMAIN = "jobsworldwide.online";

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24">
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
      {children}
    </span>
  );
}

function SubHead({ children }) {
  return (
      className="text-base font-semibold text-gray-800 mt-4">
      {children}
    </p>
  );
}

export default function TermsAndConditions() {
  const toc = [
    ["acceptance", "Acceptance of Terms"],
    ["service", "Description of Service"],
    ["use", "Permitted Use"],
    ["prohibited", "Prohibited Conduct"],
    ["third-party", "Third-Party Content & Links"],
    ["job-accuracy", "Job Listing Accuracy"],
    ["employers", "Employers & Job Posters"],
    ["ip", "Intellectual Property"],
    ["ai", "AI Assistant"],
    ["advertising", "Advertising"],
    ["disclaimers", "Disclaimers & Warranties"],
    ["liability", "Limitation of Liability"],
    ["indemnity", "Indemnification"],
    ["termination", "Termination"],
    ["governing", "Governing Law"],
    ["changes", "Changes to These Terms"],
    ["contact", "Contact Us"],
  ];

  return (
    <>
      <Head>
        <title>Terms and Conditions | JobsWorldwide</title>
        <meta name="description" content="Terms and Conditions for using JobsWorldwide — please read before using our service." />
      </Head>

      {/* Page header */}
      <div className="bg-gray-50 border-b border-gray-200 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
            className="text-sm uppercase tracking-widest text-gray-400 mb-3">
            Legal Document
          </p>
            className="text-4xl sm:text-5xl font-semibold tracking-tight text-gray-900 leading-tight mb-2">
            Terms and Conditions
          </h1>
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
                <Link href="/privacy-policy"
                  className="block text-sm text-blue-600 hover:underline">
                  Privacy Policy →
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

            <Section id="acceptance" title="1. Acceptance of Terms">
              <p>
                Welcome to <strong>JobsWorldwide</strong>, a free global job aggregator accessible
                at <Mono>{DOMAIN}</Mono> and any associated subdomains or applications (collectively,
                the "Site" or "Service"), operated by JobsWorldwide ("we", "us", or "our").
              </p>
              <p>
                By accessing or using the Site in any way — including browsing, searching, clicking
                job listings, using the AI Assistant, or submitting content — you confirm that you
                have read, understood, and agree to be bound by these Terms and Conditions ("Terms")
                and our{" "}
                <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>,
                which is incorporated here by reference.
              </p>
              <p>
                If you do not agree with any part of these Terms, you must stop using the Site
                immediately. If you are using the Site on behalf of an organisation, you represent
                that you are authorised to bind that organisation to these Terms.
              </p>
            </Section>

            <Section id="service" title="2. Description of Service">
              <p>
                JobsWorldwide is a <strong>free, independent job aggregation platform</strong>. We
                collect and display job listings sourced from publicly available APIs, RSS feeds, and
                partner job boards worldwide — including but not limited to BrighterMonday, MyJobMag,
                Remotive, Jobicy, Arbeitnow, ReliefWeb, and Adzuna — alongside listings manually
                submitted by employers directly to us.
              </p>
              <p>
                We also provide an AI-powered job search assistant and display contextual advertising
                through Google AdSense and direct sponsorships.
              </p>
              <p>
                <strong>JobsWorldwide is not a recruitment agency.</strong> We do not represent
                employers or candidates, facilitate hiring decisions, conduct background checks, or
                guarantee employment. We act solely as a channel for displaying job information
                collected from third-party sources.
              </p>
            </Section>

            <Section id="use" title="3. Permitted Use">
              <p>
                You may use the Site for lawful, personal, non-commercial purposes only — including
                searching for jobs, reading job descriptions, and following links to apply on external
                employer websites. You are permitted to:
              </p>
              <Ul items={[
                "Browse and search job listings freely without creating an account",
                "Share individual job listing URLs for personal or informational purposes",
                "Use the AI Assistant for personal job-search guidance",
                "Contact us to report inaccurate, fraudulent, or expired listings",
              ]} />
            </Section>

            <Section id="prohibited" title="4. Prohibited Conduct">
              <p>You agree not to use the Site to:</p>
              <Ul items={[
                "Scrape, crawl, copy, or systematically download listings using automated tools, bots, or scripts without prior written consent",
                "Reproduce, republish, sell, or commercially exploit any part of the Site or its content",
                "Bypass or interfere with any technical protection measures, authentication, or security features",
                "Submit false, misleading, fraudulent, or duplicate job listings",
                "Impersonate any person, company, or entity, or misrepresent your affiliation with any organisation",
                "Post or transmit spam, unsolicited communications, malware, or phishing content",
                "Use the Site in any way that violates applicable local, national, or international law",
                "Attempt to gain unauthorised access to any part of the Site, its servers, or our databases",
                "Use the AI Assistant to generate fraudulent content or to deceive job seekers or employers",
                "Collect or harvest personal data about other users from the Site",
              ]} />
              <p>
                We reserve the right to suspend or permanently ban any user or IP address that violates
                these prohibitions, without notice.
              </p>
            </Section>

            <Section id="third-party" title="5. Third-Party Content & Links">
              <p>
                The majority of job listings displayed on the Site originate from third-party job boards
                and employer websites. When you click "Apply Now" or any external link, you leave
                JobsWorldwide and visit a third-party website governed by its own terms and privacy policy.
              </p>
              <p>
                <strong>We are not responsible for the content, accuracy, availability, or privacy
                practices of any third-party websites.</strong> Links do not constitute an endorsement
                or warranty. You access third-party sites entirely at your own risk.
              </p>
              <p>
                Legitimate employers will <strong>never</strong> ask for payment to apply for a job.
                If an employer or site requests payment before allowing you to apply, treat it as
                fraudulent and report it to us.
              </p>
            </Section>

            <Section id="job-accuracy" title="6. Job Listing Accuracy">
              <p>
                We aggregate listings from external sources and cannot independently verify every
                detail of every posting. Listings may:
              </p>
              <Ul items={[
                "Become filled, expired, or removed before we are able to update our records",
                "Contain inaccurate salary, location, or requirements information as provided by the original source",
                "In rare cases, include fraudulent listings not yet identified by the source board",
              ]} />
              <p>
                <strong>Always verify job details directly with the employer before applying.</strong>{" "}
                If you suspect a listing is fraudulent, report it immediately to{" "}
                <a href={`mailto:${EMAIL}`}
                  className="text-sm text-blue-600 hover:underline">{EMAIL}</a>{" "}
                and, where possible, to the source platform.
              </p>
            </Section>

            <Section id="employers" title="7. Employers & Job Posters">
              <p>
                Employers or recruiters who submit listings to be featured on JobsWorldwide agree to
                the following additional conditions:
              </p>
              <Ul items={[
                "All listings submitted must represent genuine, current vacancies at a real organisation",
                "Listings must not be misleading, discriminatory, or in violation of any applicable employment law",
                "You must have authority to advertise the role on behalf of the hiring company",
                "You grant us a non-exclusive, royalty-free licence to display and reformat the listing content on the Site",
                "We reserve the right to refuse, edit, or remove any listing at our sole discretion without explanation",
                "Sponsored (paid) listings are subject to separate pricing terms agreed at the time of booking",
                "Fraudulent or misleading listings will be removed immediately and may be reported to relevant authorities",
              ]} />
            </Section>

            <Section id="ip" title="8. Intellectual Property">
              <p>
                The JobsWorldwide brand, logo, site design, original written content, and underlying
                software are the intellectual property of JobsWorldwide and are protected by applicable
                copyright, trademark, and other laws. You may not reproduce or create derivative works
                from these without our prior written consent.
              </p>
              <p>
                Job listing content originated by third-party boards or employers remains the
                intellectual property of those respective parties. We display it under the terms of
                their public APIs, RSS feeds, or direct agreements.
              </p>
              <p>
                If you believe any content on the Site infringes your intellectual property rights,
                please notify us at{" "}
                <a href={`mailto:${EMAIL}`}
                  className="text-sm text-blue-600 hover:underline">{EMAIL}</a>.
              </p>
            </Section>

            <Section id="ai" title="9. AI Assistant">
              <p>
                The Site includes an AI-powered assistant to help users search for and learn about
                job opportunities. It is provided for informational and convenience purposes only.
              </p>
              <Ul items={[
                "Responses are not guaranteed to be accurate, complete, or current",
                "The AI Assistant is not a career counsellor, legal adviser, or employment specialist",
                "Do not rely on AI Assistant responses as the sole basis for any career decision",
                "Do not share sensitive personal information (ID numbers, passwords, bank details) with the assistant",
                "Conversations may be reviewed by us in aggregate to improve the service",
              ]} />
              <p>We reserve the right to suspend or modify the AI Assistant at any time.</p>
            </Section>

            <Section id="advertising" title="10. Advertising">
              <p>
                The Site is funded in part by advertising, including Google AdSense display ads and
                direct sponsored job listings. Sponsored listings are clearly labelled "Sponsored".
              </p>
              <p>
                We do not endorse or take responsibility for products, services, or employers featured
                in third-party advertisements. We do not accept advertising for anything illegal,
                fraudulent, or harmful. If you see an inappropriate advertisement, please report it to us.
              </p>
            </Section>

            <Section id="disclaimers" title="11. Disclaimers & Warranties">
              <p>
                <strong>THE SITE AND ALL CONTENT ARE PROVIDED "AS IS" AND "AS AVAILABLE", WITHOUT
                WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.</strong> To the fullest extent permitted by
                law, we disclaim all warranties including, without limitation:
              </p>
              <Ul items={[
                "That the Site will be available, uninterrupted, or error-free at all times",
                "That job listings are accurate, current, or free from fraudulent content",
                "That use of the Site will result in employment or any particular outcome",
                "That the Site is free of viruses, malware, or other harmful components",
                "Any implied warranties of merchantability, fitness for a particular purpose, or non-infringement",
              ]} />
            </Section>

            <Section id="liability" title="12. Limitation of Liability">
              <p>
                To the fullest extent permitted by applicable law, JobsWorldwide and its directors,
                employees, partners, and agents shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages arising from your use of the Site, including:
              </p>
              <Ul items={[
                "Loss of income, employment, or business opportunity",
                "Losses arising from reliance on inaccurate, expired, or fraudulent job listings",
                "Personal harm arising from contact with a third-party employer found through the Site",
                "Data loss, system damage, or security breaches on third-party websites",
                "Any other loss arising from use of the AI Assistant or any other Site feature",
              ]} />
              <p>
                In any event, our total aggregate liability to you shall not exceed{" "}
                <Mono>KES 1,000</Mono> (Kenyan Shillings one thousand) or the equivalent in your local
                currency — even if we have been advised of the possibility of such damages.
              </p>
            </Section>

            <Section id="indemnity" title="13. Indemnification">
              <p>
                You agree to indemnify, defend, and hold harmless JobsWorldwide and its officers,
                directors, employees, and agents from and against any claims, damages, losses, costs,
                and expenses (including reasonable legal fees) arising from:
              </p>
              <Ul items={[
                "Your use of or access to the Site",
                "Your violation of these Terms",
                "Content you submit, post, or transmit through the Site",
                "Your violation of any third-party rights, including intellectual property or privacy rights",
              ]} />
            </Section>

            <Section id="termination" title="14. Termination">
              <p>
                We reserve the right to suspend or terminate your access to the Site at any time and
                for any reason — including violation of these Terms — without notice and without
                liability to you.
              </p>
              <p>
                Provisions that by their nature should survive termination will continue to apply —
                including Sections 8 (Intellectual Property), 11 (Disclaimers), 12 (Limitation of
                Liability), and 13 (Indemnification).
              </p>
            </Section>

            <Section id="governing" title="15. Governing Law & Disputes">
              <p>
                These Terms are governed by and construed in accordance with the laws of{" "}
                <strong>Kenya</strong>, without regard to conflict of law principles.
              </p>
              <p>
                Any dispute arising from these Terms or your use of the Site shall first be addressed
                by contacting us at{" "}
                <a href={`mailto:${EMAIL}`}
                  className="text-sm text-blue-600 hover:underline">{EMAIL}</a>.
                We will make reasonable efforts to resolve disputes informally within{" "}
                <strong>30 days</strong>.
              </p>
              <p>
                If informal resolution fails, disputes shall be subject to the exclusive jurisdiction
                of the courts of Kenya.
              </p>
            </Section>

            <Section id="changes" title="16. Changes to These Terms">
              <p>
                We may revise these Terms at any time. When we make material changes, we will update
                the "Last updated" date at the top of this page. Your continued use of the Site after
                changes are posted constitutes your acceptance of the revised Terms.
              </p>
            </Section>

            <Section id="contact" title="17. Contact Us">
              <p>If you have questions about these Terms, please contact us:</p>
              <div className="mt-4 p-5 bg-gray-50 border border-gray-200 rounded-xl">
                  className="font-semibold text-base text-gray-900 mb-2">JobsWorldwide</p>
                <p className="text-base text-gray-600">
                  Email:{" "}
                  <a href={`mailto:${EMAIL}`}
                    className="text-sm text-blue-600 hover:underline">{EMAIL}</a>
                </p>
                  className="text-sm text-gray-400 mt-2">
                  Response time: 2–3 business days
                </p>
              </div>
            </Section>

            <div className="pt-8 border-t border-gray-200 flex flex-wrap gap-5 text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">← Back to Jobs</Link>
              <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy →</Link>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
