import Head from "next/head";
import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, HelpCircle, Mail } from "lucide-react";

const FAQS = [
  {
    category: "For Job Seekers",
    questions: [
      {
        q: "Is JobsWorldwide free to use?",
        a: "Yes — completely free. You can browse, search, filter, and apply to any job on the platform without creating an account or paying anything. We will never charge job seekers.",
      },
      {
        q: "Do I need to create an account to apply?",
        a: "No. When you click 'Apply' on any listing, you are taken directly to the original employer's application page. We do not have an account system and we never collect your CV or personal data.",
      },
      {
        q: "Where do the jobs come from?",
        a: "We aggregate listings from 15+ trusted job boards including BrighterMonday, MyJobMag, Remotive, Jobicy, ReliefWeb, and others. Listings are pulled multiple times daily and deduplicated so you see each role only once.",
      },
      {
        q: "How often are jobs updated?",
        a: "Our system refreshes listings multiple times throughout the day. Most categories update every 30–60 minutes during business hours. You'll always see fresh listings at the top of each feed.",
      },
      {
        q: "A listing I applied to has expired. What happened?",
        a: "Job listings have closing dates set by the employer. Once a deadline passes, the original source removes the posting and it will no longer be accessible. We recommend applying promptly when you find a relevant role.",
      },
      {
        q: "Can I save jobs or get email alerts?",
        a: "Not yet — we're working on this feature. For now, we recommend bookmarking searches or checking the platform regularly. Job alerts via email are on our roadmap.",
      },
      {
        q: "I found a suspicious or fake job listing. What should I do?",
        a: "Do not apply and do not send any money. Legitimate employers will never ask you to pay to apply for a job. Please report it to us at hello@jobsworldwide.online and we will remove it and investigate the source.",
      },
    ],
  },
  {
    category: "For Employers",
    questions: [
      {
        q: "How do I post a job on JobsWorldwide?",
        a: "Email us at hello@jobsworldwide.online with your job details, or fill in the enquiry form on our Advertise page. We'll have your listing live within 24 hours. Pricing starts at KES 3,500 per listing.",
      },
      {
        q: "How long does a listing stay live?",
        a: "Standard listings are active for 30 days. Bundle packages offer 60-day listings. You can request an extension or early removal at any time.",
      },
      {
        q: "Where will my listing appear?",
        a: "Your job will appear in our main feed alongside aggregated listings. Featured postings are pinned to the top of the feed for 7 days and highlighted with a badge. All listings are also indexed by search engines.",
      },
      {
        q: "Do applicants apply through your platform?",
        a: "No — we link directly to your application page (your website, an ATS, or an email address). You receive applications exactly as if the candidate had found you directly. We are purely a discovery platform.",
      },
    ],
  },
  {
    category: "Technical",
    questions: [
      {
        q: "Why is a job I clicked showing a 'not found' error?",
        a: "Some listings are time-limited and may expire or be removed by the source board between when you first see them and when you click through. This is normal behaviour for aggregated listings. Try searching for the same role directly on the original board.",
      },
      {
        q: "The site is slow or a page isn't loading. What should I do?",
        a: "Try refreshing the page. If the issue persists, it may be a temporary API timeout from one of our upstream sources. Most issues resolve within a few minutes. Contact us at hello@jobsworldwide.online if the problem continues.",
      },
      {
        q: "Does JobsWorldwide work on mobile?",
        a: "Yes — the site is fully responsive and designed to work on all screen sizes including phones and tablets. You can browse and apply from any device.",
      },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-semibold text-gray-900 leading-relaxed">{q}</span>
        {open
          ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
          : <ChevronDown size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
        }
      </button>
      {open && (
        <p className="text-sm text-gray-600 leading-relaxed pb-4">{a}</p>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <>
      <Head>
        <title>Help & FAQs | JobsWorldwide</title>
        <meta name="description" content="Answers to common questions about JobsWorldwide — for job seekers and employers." />
      </Head>

      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Help Centre</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h1>
          <p className="text-base text-gray-500 max-w-xl">
            Everything you need to know about using JobsWorldwide — for job seekers and employers.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">

        {FAQS.map(({ category, questions }) => (
          <section key={category}>
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle size={16} className="text-blue-500" />
              <h2 className="text-lg font-bold text-gray-900">{category}</h2>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl px-6">
              {questions.map(({ q, a }) => (
                <FAQItem key={q} q={q} a={a} />
              ))}
            </div>
          </section>
        ))}

        {/* Still need help */}
        <section className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center">
          <Mail size={28} className="mx-auto text-blue-500 mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Still have a question?</h2>
          <p className="text-gray-500 text-sm mb-5">
            If your question isn't answered above, we're happy to help directly.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            Contact Us
          </Link>
        </section>
      </div>
    </>
  );
}
