import Head from "next/head";
import Link from "next/link";

const LAST_UPDATED = "19 June 2025";

function Section({ number, title, children }) {
  return (
    <section className="py-8 border-b border-gray-100 last:border-0">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-start gap-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-50 text-blue-600 text-sm font-bold flex items-center justify-center mt-0.5">
          {number}
        </span>
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

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms & Conditions | JobsWorldwide</title>
        <meta name="description" content="Terms and Conditions for JobsWorldwide — the rules and guidelines for using our job aggregation platform." />
      </Head>

      {/* Page header */}
      <div className="bg-gray-950 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-blue-400 text-sm font-medium mb-3">Legal</p>
          <h1 className="text-4xl font-bold mb-3">Terms & Conditions</h1>
          <p className="text-gray-400 text-base">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">

        {/* Intro box */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-10 text-gray-700 leading-relaxed">
          <p className="font-semibold text-gray-900 mb-2">Please read these terms carefully</p>
          <p className="text-sm">
            By accessing or using <strong>jobsworldwide.online</strong> ("the Site", "JobsWorldwide", "we", "us", or "our"),
            you confirm that you have read, understood, and agree to be bound by these Terms and Conditions
            and our <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
            If you do not agree with any part of these terms, you must not use our Site.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">

          <Section number="1" title="About JobsWorldwide">
            <p>
              JobsWorldwide is a free online job aggregation platform that collects, indexes, and displays
              job listings sourced from established third-party job boards, company career pages, employer
              websites, and public RSS feeds. We bring together opportunities from multiple sources into a
              single, searchable platform to help job seekers discover roles more efficiently.
            </p>
            <p>
              JobsWorldwide is <strong>not</strong> an employer, recruiter, staffing agency, or employment
              service. We do not post original job listings on behalf of employers and we are not party to
              any employment relationship or negotiation between a job seeker and an employer.
            </p>
            <p>
              These Terms apply to all users of the Site, including job seekers, employers who contact us to
              post jobs, and any other visitors.
            </p>
          </Section>

          <Section number="2" title="Eligibility & Access">
            <p>By using this Site, you confirm that:</p>
            <ul className="space-y-2">
              <Bullet>You are at least 16 years of age</Bullet>
              <Bullet>You have the legal capacity to enter into a binding agreement</Bullet>
              <Bullet>You will use the Site only for lawful purposes and in accordance with these Terms</Bullet>
              <Bullet>
                If you are accessing the Site on behalf of an organisation or company, you have authority
                to bind that organisation to these Terms
              </Bullet>
            </ul>
            <p>
              We reserve the right to restrict or terminate access to the Site at any time, without notice,
              for any reason including breach of these Terms.
            </p>
          </Section>

          <Section number="3" title="Nature of Job Listings">
            <p>
              All job listings displayed on JobsWorldwide are aggregated from third-party sources. By using
              our Site, you acknowledge and agree that:
            </p>
            <ul className="space-y-2">
              <Bullet>
                We do not verify the accuracy, completeness, legality, or currency of any job listing.
                Listings may contain errors, may have expired, or may no longer be available at the time
                you view them.
              </Bullet>
              <Bullet>
                JobsWorldwide does not endorse any employer, job listing, product, service, or organisation
                featured or linked to on our Site.
              </Bullet>
              <Bullet>
                Job titles, salaries, locations, and other details are provided as-is from third-party
                sources. We cannot guarantee their accuracy.
              </Bullet>
              <Bullet>
                Some listings may be sponsored or featured placements. Where required by law, these will
                be identified as such.
              </Bullet>
              <Bullet>
                When you click "Apply Now" or "View Job", you leave JobsWorldwide and are directed to
                an external website. That site's own terms and privacy policy govern your interaction.
              </Bullet>
            </ul>
          </Section>

          <Section number="4" title="No Employment Relationship or Guarantee">
            <p>
              JobsWorldwide makes no representation or warranty that:
            </p>
            <ul className="space-y-2">
              <Bullet>Any job listing will result in employment</Bullet>
              <Bullet>Any employer you contact through our site is legitimate, reputable, or financially sound</Bullet>
              <Bullet>The hiring process described in any listing is accurate or up to date</Bullet>
              <Bullet>Salary ranges or compensation packages described in listings are accurate</Bullet>
              <Bullet>Any position listed is still vacant or accepting applications</Bullet>
            </ul>
            <p>
              You use job listings on our Site at your own risk. We strongly encourage you to research
              any employer thoroughly before applying or sharing personal information.
            </p>
          </Section>

          <Section number="5" title="Acceptable Use">
            <p>You agree to use the Site only for its intended purpose. You must not:</p>
            <ul className="space-y-2">
              <Bullet>
                Use any automated tool, bot, scraper, spider, or crawler to extract content from the
                Site without our prior written permission
              </Bullet>
              <Bullet>
                Reproduce, redistribute, publish, or commercially exploit any content from the Site
                without permission
              </Bullet>
              <Bullet>
                Attempt to gain unauthorised access to any part of our systems, servers, or databases
              </Bullet>
              <Bullet>
                Introduce or transmit any virus, malware, spyware, or any other harmful code
              </Bullet>
              <Bullet>
                Use the Site to send unsolicited communications (spam) to employers or other users
              </Bullet>
              <Bullet>
                Post false, misleading, or fraudulent information if you contact us to submit a job listing
              </Bullet>
              <Bullet>
                Impersonate any person, company, or entity
              </Bullet>
              <Bullet>
                Use the Site in any way that violates any applicable local, national, or international
                law or regulation
              </Bullet>
            </ul>
            <p>
              Violations may result in immediate termination of your access and may be reported to relevant
              law enforcement authorities.
            </p>
          </Section>

          <Section number="6" title="Intellectual Property">
            <p>
              The following intellectual property rights apply to content on JobsWorldwide:
            </p>
            <ul className="space-y-2">
              <Bullet>
                The JobsWorldwide name, logo, domain, brand identity, and original website design are the
                intellectual property of JobsWorldwide and may not be used without express written permission.
              </Bullet>
              <Bullet>
                Job listings, descriptions, and associated content remain the intellectual property of
                their respective employers or originating job boards.
              </Bullet>
              <Bullet>
                Original editorial content on our Site (such as the About page, help articles, and
                category descriptions) is owned by JobsWorldwide and may not be reproduced without permission.
              </Bullet>
            </ul>
            <p>
              Nothing in these Terms grants you any licence to use our intellectual property for any
              commercial purpose.
            </p>
          </Section>

          <Section number="7" title="User-Submitted Content (Job Postings)">
            <p>
              Employers and recruiters may contact us to submit job listings for publication on JobsWorldwide.
              By submitting a job listing, you represent and warrant that:
            </p>
            <ul className="space-y-2">
              <Bullet>The job listing is genuine, accurate, and currently available</Bullet>
              <Bullet>You have the authority to post the job on behalf of the hiring organisation</Bullet>
              <Bullet>
                The listing does not contain false, misleading, discriminatory, or illegal content
              </Bullet>
              <Bullet>
                The listing complies with all applicable employment laws in the relevant jurisdiction,
                including equal opportunity and anti-discrimination requirements
              </Bullet>
              <Bullet>You grant us a non-exclusive licence to display the listing on our Site</Bullet>
            </ul>
            <p>
              We reserve the right to refuse, edit, or remove any job listing at our sole discretion and
              without notice. We accept no liability for losses arising from the removal of a listing.
            </p>
          </Section>

          <Section number="8" title="Advertising">
            <p>
              JobsWorldwide displays third-party advertisements through Google AdSense and may feature
              sponsored job listings from time to time.
            </p>
            <ul className="space-y-2">
              <Bullet>
                Advertisements are served by Google and its partners based on cookies and your browsing
                history. We do not control the content of third-party ads.
              </Bullet>
              <Bullet>
                The presence of an advertisement on our Site does not constitute an endorsement of the
                advertised product, service, or organisation.
              </Bullet>
              <Bullet>
                Sponsored or featured job listings, where present, will be identified in accordance with
                applicable advertising standards and regulations.
              </Bullet>
            </ul>
          </Section>

          <Section number="9" title="Disclaimer of Warranties">
            <p>
              The Site and all content on it are provided <strong>"as is"</strong> and{" "}
              <strong>"as available"</strong> without any representation, warranty, or condition of any
              kind, whether express or implied. To the fullest extent permitted by applicable law, we
              disclaim all warranties, including but not limited to:
            </p>
            <ul className="space-y-2">
              <Bullet>Warranties of merchantability, fitness for a particular purpose, or non-infringement</Bullet>
              <Bullet>That the Site will be uninterrupted, error-free, or virus-free</Bullet>
              <Bullet>That job listings are accurate, complete, current, or suitable for your needs</Bullet>
              <Bullet>That any employer featured on the Site is legitimate or will respond to applications</Bullet>
            </ul>
          </Section>

          <Section number="10" title="Limitation of Liability">
            <p>
              To the fullest extent permitted by applicable law, JobsWorldwide and its operators, directors,
              employees, and agents shall not be liable for any:
            </p>
            <ul className="space-y-2">
              <Bullet>Direct, indirect, incidental, special, consequential, or punitive damages</Bullet>
              <Bullet>Loss of employment opportunity, income, profit, or data</Bullet>
              <Bullet>Damages resulting from your reliance on any job listing, employer, or third-party content</Bullet>
              <Bullet>Loss or damage caused by a third-party website you access through our site</Bullet>
              <Bullet>Interruptions to service, system failures, or data loss</Bullet>
            </ul>
            <p>
              This limitation applies whether the claim is based in contract, tort (including negligence),
              statute, or any other legal theory, even if we have been advised of the possibility of such
              damages.
            </p>
          </Section>

          <Section number="11" title="Indemnification">
            <p>
              You agree to indemnify, defend, and hold harmless JobsWorldwide and its operators, employees,
              and agents from and against any claims, liabilities, damages, losses, costs, and expenses
              (including reasonable legal fees) arising from or relating to:
            </p>
            <ul className="space-y-2">
              <Bullet>Your use of or access to the Site</Bullet>
              <Bullet>Your violation of these Terms and Conditions</Bullet>
              <Bullet>Any content you submit to us (such as a job listing)</Bullet>
              <Bullet>Your violation of any third-party right, including intellectual property rights</Bullet>
            </ul>
          </Section>

          <Section number="12" title="Third-Party Links & External Websites">
            <p>
              Our Site contains links to external websites and third-party platforms. These links are
              provided for your convenience only and do not constitute an endorsement of those sites
              or their content.
            </p>
            <p>
              We have no control over the content, privacy practices, or availability of external websites.
              We are not responsible for any harm or loss arising from your use of or access to any
              external website. You access external sites entirely at your own risk.
            </p>
          </Section>

          <Section number="13" title="Privacy">
            <p>
              Your use of the Site is also governed by our{" "}
              <Link href="/privacy-policy" className="text-blue-600 hover:underline font-medium">
                Privacy Policy
              </Link>
              , which is incorporated into these Terms by reference. By using the Site, you consent
              to the collection and use of information as described in the Privacy Policy.
            </p>
          </Section>

          <Section number="14" title="Changes to the Site & Terms">
            <p>
              We reserve the right to modify, suspend, or discontinue any aspect of the Site at any time
              without notice or liability. We may also update these Terms at any time. Changes will be
              effective immediately upon posting to this page with an updated "Last updated" date.
            </p>
            <p>
              Your continued use of the Site after any changes to these Terms constitutes your acceptance
              of the updated Terms. If you do not agree with the revised Terms, you should stop using
              the Site.
            </p>
          </Section>

          <Section number="15" title="Governing Law & Jurisdiction">
            <p>
              These Terms and Conditions and any dispute or claim arising out of or in connection with
              them (including non-contractual disputes) shall be governed by and construed in accordance
              with the <strong>laws of Kenya</strong>.
            </p>
            <p>
              Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of
              the courts of Kenya, without prejudice to any right you may have to bring proceedings
              in the courts of your country of residence if required by applicable law.
            </p>
          </Section>

          <Section number="16" title="Severability">
            <p>
              If any provision of these Terms is found by a court of competent jurisdiction to be invalid,
              illegal, or unenforceable, that provision shall be limited or eliminated to the minimum
              extent necessary so that these Terms shall otherwise remain in full force and effect and
              enforceable.
            </p>
          </Section>

          <Section number="17" title="Entire Agreement">
            <p>
              These Terms and Conditions, together with our Privacy Policy, constitute the entire agreement
              between you and JobsWorldwide with respect to your use of the Site and supersede all prior
              agreements, representations, and understandings.
            </p>
          </Section>

          <Section number="18" title="Contact Us">
            <p>
              If you have any questions, concerns, or feedback regarding these Terms and Conditions,
              please contact us:
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
            <Link href="/privacy-policy" className="hover:text-gray-700 transition-colors">Privacy Policy</Link>
            <Link href="/about" className="hover:text-gray-700 transition-colors">About Us</Link>
          </div>
        </div>
      </div>
    </>
  );
}
