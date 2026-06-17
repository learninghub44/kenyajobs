import Head from "next/head";
import Link from "next/link";
import { Globe, Search, ShieldCheck, Zap, Mail, Users, Briefcase, GraduationCap, Laptop, Home } from "lucide-react";

export default function About() {
  return (
    <>
      <Head>
        <title>About JobsWorldwide | Global Job Board</title>
        <meta name="description" content="JobsWorldwide aggregates jobs from top global and African sources — remote, entry level, graduate and work from home." />
      </Head>

      <div className="max-w-3xl mx-auto px-4 py-16">

        {/* Hero */}
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-blue-600 text-white rounded-xl p-2">
            <Globe size={22} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">About JobsWorldwide</h1>
        </div>
        <p className="text-blue-600 font-medium mb-10">Your free global job board — updated daily</p>

        <div className="space-y-5">

          {/* Who We Are */}
          <div className="bg-white rounded-2xl border border-gray-200 p-7">
            <div className="flex items-center gap-2 mb-3">
              <Users size={18} className="text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Who We Are</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              JobsWorldwide is a free job aggregator that pulls real, live listings from trusted global and African and global job boards every day. We surface remote, entry level, graduate and work-from-home opportunities so you can find and apply in one place — no account needed.
            </p>
          </div>

          {/* What We Offer */}
          <div className="bg-white rounded-2xl border border-gray-200 p-7">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase size={18} className="text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">What We Offer</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: Laptop, label: "Remote Jobs", desc: "Work from anywhere in the world" },
                { icon: Briefcase, label: "Entry Level Jobs", desc: "Start your career with zero experience" },
                { icon: GraduationCap, label: "Graduate Jobs", desc: "Trainee programs for fresh graduates" },
                { icon: Home, label: "Work From Home", desc: "Legitimate online income opportunities" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
                  <div className="bg-blue-600 text-white rounded-lg p-1.5 mt-0.5 flex-shrink-0">
                    <Icon size={13} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{label}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-2xl border border-gray-200 p-7">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={18} className="text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">How It Works</h2>
            </div>
            <div className="space-y-3">
              {[
                { step: "1", text: "We pull jobs from 7+ global and African sources every time you visit" },
                { step: "2", text: "Browse or search by role, company, or keyword" },
                { step: "3", text: "Click Apply — you go directly to the employer's application page" },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{step}</div>
                  <p className="text-gray-600 text-sm leading-relaxed pt-0.5">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trust */}
          <div className="bg-white rounded-2xl border border-gray-200 p-7">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={18} className="text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">Safe & Trustworthy</h2>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm">
              Every listing links directly to the original employer or job board. We never charge job seekers, never ask for personal information, and we do not post fake jobs. If a listing looks suspicious, do not pay any fees to apply — legitimate employers never charge candidates.
            </p>
          </div>

          {/* Contact */}
          <div className="bg-blue-600 rounded-2xl p-7 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Mail size={18} />
              <h2 className="text-lg font-bold">Contact Us</h2>
            </div>
            <p className="text-blue-100 text-sm mb-5">Have a question, suggestion, or want to advertise with us? We&apos;d love to hear from you.</p>
            <a
              href="mailto:hello@jobsworldwide.online"
              className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm"
            >
              <Mail size={15} /> hello@jobsworldwide.online
            </a>
          </div>

        </div>
      </div>
    </>
  );
}
