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

      <div className="bg-gray-50 border-b border-gray-200 py-10">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-2">Legal</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Terms and Conditions</h1>
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
                <Link href="/privacy-policy" className="text-sm text-blue-600 hover:underline">
                  Privacy Policy →
                </Link>
              </div>
            </div>
          </aside>

          {/* Body */}
          <main className="flex-1 space-y-10">

            <Section id="acceptance" title="1. Acceptance of Terms">
              <p>
                Welcome to <strong>JobsWorldwide</strong>, a free global job aggregator accessible
                at <strong>{DOMAIN}</strong> and any subdomains or associated mobile applications
                (collectively, the "Site" or "Service"). The Site is operated by JobsWorldwide
                ("we", "us", or "our").
              </p>
              <p>
                By accessing or using the Site in any way — including browsing, searching, clicking
                job listings, using the AI Assistant, or submitting content — you confirm that you have
                read, understood, and agree to be bound by these Terms and Conditions ("Terms") and
                our <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>,
                which is incorporated here by reference.
              </p>
              <p>
                If you do not agree with any part of these Terms, you must stop using the Site
                immediately. We reserve the right to modify these Terms at any time — continued use
                of the Site after changes are posted constitutes acceptance.
              </p>
              <p>
                These Terms constitute a legally binding agreement between you and JobsWorldwide.
                If you are using the Site on behalf of an organisation, you represent that you are
                authorised to bind that organisation to these Terms.
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
                We also provide an AI-powered job search assistant to help users find relevant
                opportunities, and display contextual advertising through Google AdSense and
                direct sponsorships.
              </p>
              <p>
                <strong>JobsWorldwide is not a recruitment agency.</strong> We do not represent employers
                or candidates, facilitate hiring decisions, conduct background checks, or guarantee
                employment. We act solely as a channel for displaying job information collected
                from third-party sources.
              </p>
            </Section>

            <Section id="use" title="3. Permitted Use">
              <p>
                You may use the Site for lawful, personal, non-commercial purposes only — including
                searching for jobs, reading job descriptions, and following links to apply on external
                employer websites.
              </p>
              <p>You are permitted to:</p>
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
                "Scrape, crawl, index, copy, or systematically download job listings or site content using automated tools, bots, or scripts without our prior written consent",
                "Reproduce, republish, sell, resell, or commercially exploit any part of the Site or its content",
                "Bypass or interfere with any technical protection measures, authentication, or security features",
                "Submit false, misleading, fraudulent, or duplicate job listings",
                "Impersonate any person, company, or entity, or misrepresent your affiliation with any organisation",
                "Post or transmit spam, unsolicited communications, malware, or phishing content",
                "Use the Site in any way that violates applicable local, national, or international law",
                "Attempt to gain unauthorised access to any part of the Site, its servers, or our databases",
                "Use the AI Assistant to generate fraudulent content, scam materials, or to deceive job seekers or employers",
                "Collect or harvest personal data about other users from the Site",
              ]} />
              <p className="mt-2">
                We reserve the right to suspend or permanently ban any user or IP address that we
                reasonably believe has violated these prohibitions, without notice.
              </p>
            </Section>

            <Section id="third-party" title="5. Third-Party Content & Links">
              <p>
                The majority of job listings displayed on the Site originate from third-party job boards
                and employer websites. When you click "Apply Now" or any external link, you are leaving
                JobsWorldwide and visiting a third-party website. Those websites are governed by their
                own terms of service and privacy policies.
              </p>
              <p>
                <strong>We are not responsible for the content, accuracy, availability, or privacy
                practices of any third-party websites.</strong> Links to third-party sites do not
                constitute an endorsement, recommendation, or warranty by us. You access third-party
                sites entirely at your own risk.
              </p>
              <p>
                If a third-party site requests personal information (such as your CV, ID, or payment
                details), please review their privacy policy carefully before submitting anything.
                Legitimate employers will never ask for payment to apply for a job.
              </p>
            </Section>

            <Section id="job-accuracy" title="6. Job Listing Accuracy">
              <p>
                We aggregate listings from external sources and cannot independently verify every
                detail of every posting. Job listings displayed on the Site may:
              </p>
              <Ul items={[
                "Become filled, expired, or removed before we are able to update our records",
                "Contain inaccurate salary, location, or requirements information as provided by the original source",
                "In rare cases, include fraudulent listings that have not yet been identified by the source board",
              ]} />
              <p className="mt-2">
                <strong>We strongly encourage you to verify all job details directly with the employer
                before applying.</strong> Never pay any fee to apply for a job. If you suspect a listing
                is fraudulent, report it immediately to{" "}
                <a href={`mailto:${EMAIL}`} className="text-blue-600 hover:underline">{EMAIL}</a> and,
                where possible, to the source platform.
              </p>
              <p>
                We make reasonable efforts to remove expired or flagged listings promptly, but provide
                no warranty that the Site is free of inaccurate or fraudulent content at all times.
              </p>
            </Section>

            <Section id="employers" title="7. Employers & Job Posters">
              <p>
                Employers or recruiters who submit job listings to be featured on JobsWorldwide
                (whether directly via email or through our admin system) agree to the following
                additional conditions:
              </p>
              <Ul items={[
                "All listings submitted must represent genuine, current vacancies at a real organisation",
                "Listings must not be misleading, discriminatory, or in violation of any applicable employment law",
                "You must have the authority to advertise the role on behalf of the hiring company",
                "You grant us a non-exclusive, royalty-free licence to display, reformat, and distribute the listing content on the Site and in promotional materials",
                "We reserve the right to refuse, edit, or remove any listing at our sole discretion without explanation",
                "Sponsored (paid) listings are subject to separate pricing terms agreed at the time of booking",
                "Fraudulent or misleading listings will be removed immediately and may be reported to relevant authorities",
              ]} />
              <p className="mt-2">
                By submitting a listing, you confirm all details are accurate to the best of your
                knowledge and that the role is legally permitted to be advertised in the target market.
              </p>
            </Section>

            <Section id="ip" title="8. Intellectual Property">
              <p>
                The JobsWorldwide brand, logo, site design, original written content, and underlying
                software are the intellectual property of JobsWorldwide and are protected by applicable
                copyright, trademark, and other laws. You may not reproduce, copy, distribute, or
                create derivative works from these without our prior written consent.
              </p>
              <p>
                Job listing content originated by third-party boards or employers remains the
                intellectual property of those respective parties. We display it under the terms of
                their public APIs, RSS feeds, or direct agreements.
              </p>
              <p>
                If you believe any content on the Site infringes your intellectual property rights,
                please notify us at{" "}
                <a href={`mailto:${EMAIL}`} className="text-blue-600 hover:underline">{EMAIL}</a> with
                full details and we will investigate promptly.
              </p>
            </Section>

            <Section id="ai" title="9. AI Assistant">
              <p>
                The Site includes an AI-powered assistant ("AI Assistant") to help users search for
                and learn about job opportunities. The AI Assistant is powered by large language model
                technology and is provided for informational and convenience purposes only.
              </p>
              <Ul items={[
                "Responses from the AI Assistant are not guaranteed to be accurate, complete, or current",
                "The AI Assistant is not a career counsellor, legal adviser, or employment specialist",
                "Do not rely on AI Assistant responses as the sole basis for any career or employment decision",
                "Do not share sensitive personal information (ID numbers, passwords, bank details) with the AI Assistant",
                "Conversations with the AI Assistant may be reviewed by us in aggregate to improve the service",
              ]} />
              <p className="mt-2">
                We reserve the right to suspend or modify the AI Assistant at any time. Use of the
                AI Assistant is subject to these Terms in full.
              </p>
            </Section>

            <Section id="advertising" title="10. Advertising">
              <p>
                The Site is funded in part by advertising, including Google AdSense display ads and
                direct sponsored job listings. Sponsored listings are clearly labelled as "Sponsored".
              </p>
              <p>
                We do not endorse or take responsibility for the products, services, or employers
                featured in third-party advertisements. Clicking an advertisement takes you to a
                third-party website subject to its own terms and privacy policy.
              </p>
              <p>
                We do not accept advertising for anything illegal, fraudulent, harmful, or in violation
                of our policies. If you see an inappropriate advertisement, please report it to us.
              </p>
            </Section>

            <Section id="disclaimers" title="11. Disclaimers & Warranties">
              <p>
                <strong>THE SITE AND ALL CONTENT ARE PROVIDED "AS IS" AND "AS AVAILABLE", WITHOUT
                WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.</strong> To the fullest extent permitted by law,
                we disclaim all warranties including, without limitation:
              </p>
              <Ul items={[
                "That the Site will be available, uninterrupted, or error-free at all times",
                "That job listings are accurate, current, or free from fraudulent content",
                "That use of the Site will result in employment or any particular outcome",
                "That the Site is free of viruses, malware, or other harmful components",
                "Any implied warranties of merchantability, fitness for a particular purpose, or non-infringement",
              ]} />
              <p className="mt-2">
                Some jurisdictions do not allow the exclusion of implied warranties — in such cases
                these disclaimers apply to the maximum extent permitted by applicable law.
              </p>
            </Section>

            <Section id="liability" title="12. Limitation of Liability">
              <p>
                To the fullest extent permitted by applicable law, JobsWorldwide, its directors,
                employees, partners, agents, and suppliers shall not be liable for any indirect,
                incidental, special, consequential, or punitive damages arising out of your use
                of — or inability to use — the Site or any content on it, including but not limited to:
              </p>
              <Ul items={[
                "Loss of income, employment, or business opportunity",
                "Losses arising from reliance on inaccurate, expired, or fraudulent job listings",
                "Personal harm arising from contact with a third-party employer found through the Site",
                "Data loss, system damage, or security breaches on third-party websites",
                "Any other loss arising from use of the AI Assistant or any other Site feature",
              ]} />
              <p className="mt-2">
                In any event, our total aggregate liability to you for any claim arising from use of
                the Site shall not exceed <strong>KES 1,000 (Kenyan Shillings one thousand)</strong> or
                the equivalent in your local currency — even if we have been advised of the possibility
                of such damages.
              </p>
              <p>
                Some jurisdictions do not permit limitation or exclusion of liability for certain damages.
                In those jurisdictions our liability is limited to the extent permitted by law.
              </p>
            </Section>

            <Section id="indemnity" title="13. Indemnification">
              <p>
                You agree to indemnify, defend, and hold harmless JobsWorldwide and its officers,
                directors, employees, and agents from and against any and all claims, damages, losses,
                costs, and expenses (including reasonable legal fees) arising from:
              </p>
              <Ul items={[
                "Your use of or access to the Site",
                "Your violation of these Terms",
                "Content you submit, post, or transmit through the Site",
                "Your violation of any third-party rights, including intellectual property or privacy rights",
                "Any claim by a third party arising from your use of the Site",
              ]} />
            </Section>

            <Section id="termination" title="14. Termination">
              <p>
                We reserve the right to suspend or terminate your access to the Site — including the
                ability to submit listings or use the AI Assistant — at any time and for any reason,
                including but not limited to violation of these Terms, without notice and without
                liability to you.
              </p>
              <p>
                Upon termination, all provisions of these Terms which by their nature should survive
                will continue to apply — including Sections 8 (Intellectual Property), 11 (Disclaimers),
                12 (Limitation of Liability), and 13 (Indemnification).
              </p>
            </Section>

            <Section id="governing" title="15. Governing Law & Disputes">
              <p>
                These Terms are governed by and construed in accordance with the laws of
                <strong> Kenya</strong>, without regard to conflict of law principles.
              </p>
              <p>
                Any dispute arising from or relating to these Terms or your use of the Site shall
                first be addressed by contacting us at{" "}
                <a href={`mailto:${EMAIL}`} className="text-blue-600 hover:underline">{EMAIL}</a>.
                We will make reasonable efforts to resolve disputes informally within 30 days.
              </p>
              <p>
                If informal resolution fails, disputes shall be subject to the exclusive jurisdiction
                of the courts of Kenya. If you are accessing the Site from outside Kenya, you are
                responsible for compliance with any applicable local laws.
              </p>
            </Section>

            <Section id="changes" title="16. Changes to These Terms">
              <p>
                We may revise these Terms at any time. When we make material changes, we will update
                the "Last updated" date at the top of this page. We may also notify users through a
                notice on the Site homepage.
              </p>
              <p>
                Your continued use of the Site after changes are posted constitutes your acceptance
                of the revised Terms. If you do not agree to the revised Terms, you must stop using
                the Site.
              </p>
            </Section>

            <Section id="contact" title="17. Contact Us">
              <p>If you have questions about these Terms, please contact us:</p>
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                <p className="font-semibold text-gray-800 mb-1">JobsWorldwide</p>
                <p>Email: <a href={`mailto:${EMAIL}`} className="text-blue-600 hover:underline">{EMAIL}</a></p>
                <p className="mt-1 text-gray-400 text-xs">We aim to respond within 2–3 business days.</p>
              </div>
            </Section>

            <div className="pt-8 border-t border-gray-200 flex flex-wrap gap-4 text-sm">
              <Link href="/" className="text-blue-600 hover:underline">← Back to Jobs</Link>
              <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy →</Link>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
