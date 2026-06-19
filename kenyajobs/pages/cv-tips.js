import Head from "next/head";
import { FileText, CheckCircle2, XCircle, Lightbulb, ArrowRight } from "lucide-react";
import Link from "next/link";

const CV_DOS = [
  "Tailor your CV to each job — mirror the keywords in the job description",
  "Lead with a 3-line professional summary that matches the role",
  "Quantify achievements: 'Increased sales by 30%' beats 'Improved sales'",
  "Keep it to 1–2 pages for roles under 10 years of experience",
  "Use a clean, single-column format — ATS systems struggle with tables",
  "Include a professional email address (firstname.lastname@gmail.com)",
  "List education in reverse chronological order with graduation year",
  "Add relevant certifications (Google, Coursera, local professional bodies)",
];

const CV_DONTS = [
  "Don't include a photo — it invites unconscious bias and wastes space",
  "Don't use 'Responsible for...' — say what you actually achieved",
  "Don't list every job you've ever had — focus on the last 5–7 years",
  "Don't use fancy graphics, colours, or multi-column layouts for ATS roles",
  "Don't list references — write 'Available on request' or omit entirely",
  "Don't use the same generic CV for every application",
  "Don't include your ID number, date of birth, or marital status",
  "Don't use small fonts below 10pt to cram in more content",
];

const COVER_LETTER_TIPS = [
  {
    step: "01",
    title: "Open with the role and why you",
    body: "State exactly which job you're applying for, then immediately explain why you're a strong fit — not why you want the job.",
  },
  {
    step: "02",
    title: "One paragraph, one achievement",
    body: "Pick your strongest achievement relevant to this role. Explain what you did, how you did it, and what it resulted in.",
  },
  {
    step: "03",
    title: "Show you know the employer",
    body: "Mention something specific about the company — a recent initiative, their mission, or a product you've used. It shows genuine interest.",
  },
  {
    step: "04",
    title: "Close with a clear call to action",
    body: "End by expressing enthusiasm and inviting next steps. Keep it brief: 'I'd welcome the chance to discuss this further.'",
  },
];

const INTERVIEW_TIPS = [
  { tip: "Research the company the night before — know their products, mission, and recent news" },
  { tip: "Prepare STAR stories (Situation, Task, Action, Result) for common behavioural questions" },
  { tip: "Have 2–3 questions ready to ask the interviewer — it shows genuine interest" },
  { tip: "Dress one level above the company's typical dress code" },
  { tip: "Arrive 10 minutes early; for virtual interviews, test your setup 30 minutes before" },
  { tip: "Send a short thank-you email within 24 hours of the interview" },
];

export default function CVTips() {
  return (
    <>
      <Head>
        <title>CV Tips & Career Resources for Kenyan Job Seekers | JobsWorldwide</title>
        <meta name="description" content="Free CV tips, cover letter advice, and interview guidance tailored for Kenyan and African job seekers." />
      </Head>

      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Career Resources</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">CV Tips & Career Advice</h1>
          <p className="text-base text-gray-500 max-w-xl">
            Practical, no-fluff guidance to help you stand out in the Kenyan and African job market — from writing your CV to acing the interview.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-14">

        {/* CV Dos & Don'ts */}
        <section>
          <p className="text-xs uppercase tracking-widest text-blue-600 mb-3 font-semibold">Your CV</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">CV Dos & Don'ts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <h3 className="font-bold text-gray-900">Do</h3>
              </div>
              <ul className="space-y-3">
                {CV_DOS.map(d => (
                  <li key={d} className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed">
                    <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <XCircle size={18} className="text-red-400" />
                <h3 className="font-bold text-gray-900">Don't</h3>
              </div>
              <ul className="space-y-3">
                {CV_DONTS.map(d => (
                  <li key={d} className="flex items-start gap-2.5 text-sm text-gray-600 leading-relaxed">
                    <XCircle size={14} className="text-red-300 flex-shrink-0 mt-0.5" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Cover Letter */}
        <section>
          <p className="text-xs uppercase tracking-widest text-blue-600 mb-3 font-semibold">Cover Letter</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How to write a cover letter that gets read</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COVER_LETTER_TIPS.map(({ step, title, body }) => (
              <div key={step} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
                  <span className="text-3xl font-black text-gray-100">{step}</span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
            <strong>Rule of thumb:</strong> A cover letter should be under 250 words. If it's longer, cut it in half. Hiring managers read dozens per day — get to the point.
          </div>
        </section>

        {/* Interview tips */}
        <section>
          <p className="text-xs uppercase tracking-widest text-blue-600 mb-3 font-semibold">The Interview</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Interview preparation checklist</h2>
          <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
            {INTERVIEW_TIPS.map(({ tip }, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-4">
                <CheckCircle2 size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Salary negotiation */}
        <section className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
          <Lightbulb size={24} className="text-amber-500 mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-3">Negotiating your salary in Kenya</h2>
          <div className="space-y-3 text-sm text-gray-600 leading-relaxed max-w-2xl">
            <p>Always research the market rate before your interview. Use job listings on this site to gauge what employers are offering for similar roles.</p>
            <p>When asked about expectations, give a range — not a single number. Your bottom figure should be the minimum you'd accept; your top should be realistic but aspirational.</p>
            <p>It's acceptable to ask for 24 hours to consider a written offer. Never accept on the spot unless you're completely satisfied with the terms.</p>
            <p>Beyond base salary, consider: medical cover, pension contributions, transport allowance, airtime, annual leave days, and remote flexibility.</p>
          </div>
        </section>

        {/* Browse jobs CTA */}
        <section className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ready to put this into practice?</h2>
          <p className="text-gray-500 text-sm mb-6">Browse thousands of live jobs across Kenya, Africa, and globally.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
              Browse Jobs <ArrowRight size={14} />
            </Link>
            <Link href="/internships" className="inline-flex items-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
              Find Internships
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
