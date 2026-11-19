import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, MapPin, BriefcaseBusiness, Building2, Globe2, GraduationCap, CalendarDays, Banknote, CheckCircle2,
  Share2, ExternalLink, ShieldCheck, FileText, Star, Gift, ListChecks, Hash, Clock3, Layers, ClipboardList,
} from "lucide-react";
import ApplyForm from "@/components/ApplyForm";

const SECTION_ICONS = { Responsibilities: ListChecks, Requirements: ClipboardList, Qualifications: GraduationCap, Education: GraduationCap, Benefits: Gift, Compensation: Banknote, "How to apply": FileText };

function Card({ icon: Icon, title, children, tone = "blue" }) {
  const tones = { blue: "bg-blue-50 text-blue-700", green: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700" };
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-3 flex items-center gap-2.5">
        <span className={`grid h-8 w-8 place-items-center rounded-full ${tones[tone]}`}><Icon size={16} /></span>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function CheckList({ items }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-gray-700">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Chip({ icon: Icon, children }) {
  return <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700"><Icon size={13} className="text-gray-500" />{children}</span>;
}

export default function JobDetailLayout({ job, view, translatedJob, translationLoading, copied, onCopy, related, onRelatedClick }) {
  const [tab, setTab] = useState("description");
  const tabsRef = useRef(null);
  const onPlatform = view.onPlatform;

  useEffect(() => {
    const fromHash = () => { if (window.location.hash === "#apply") setTab("apply"); };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  function go(next) {
    setTab(next);
    requestAnimationFrame(() => tabsRef.current && window.scrollTo({ top: tabsRef.current.offsetTop - 8, behavior: "smooth" }));
  }

  const aboutSection = view.sections.find((s) => s.title === "Job description");
  const detailSections = view.sections.filter((s) => s.title !== "Job description" && !(s.title === "Education" && view.education && s.items.join(" ").length <= 48));
  const canApply = !(onPlatform && view.deadlinePassed);

  const applyCta = onPlatform
    ? (view.deadlinePassed
        ? <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700">Applications closed {view.deadlineLabel}</p>
        : <button type="button" onClick={() => go("apply")} className="w-full rounded-xl bg-emerald-600 px-5 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-emerald-700">Apply for this Position</button>)
    : <a href={view.applyUrl} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-emerald-700">Apply on {view.source} <ExternalLink size={16} /></a>;

  return (
    <div className="min-h-screen bg-slate-50 pb-28 md:pb-14">
      {/* Hero */}
      <header className="bg-gradient-to-b from-[#0b1f4d] via-[#12306e] to-[#1a4fb8] px-4 pb-9 pt-6 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <Link href="/" style={{ color: "rgba(255,255,255,0.85)" }} className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium hover:underline"><ArrowLeft size={15} /> Back to jobs</Link>
          <div className="mx-auto grid h-20 w-20 place-items-center overflow-hidden rounded-2xl bg-white text-2xl font-extrabold text-[#12306e] shadow-lg">
            {view.logo
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={view.logo} alt="" className="h-full w-full object-contain p-2" onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextElementSibling.style.display = "block"; }} />
              : null}
            <span style={{ display: view.logo ? "none" : "block" }}>{view.initials}</span>
          </div>
          <Link href={`/company/${view.companySlug}?name=${encodeURIComponent(view.company)}`} style={{ color: "#bae6fd" }} className="mt-4 inline-block text-sm font-semibold hover:underline">{view.company}</Link>
          <h1 style={{ color: "#ffffff" }} className="mt-1 text-3xl font-extrabold leading-tight sm:text-4xl">{view.title}</h1>
          {view.summary && <p style={{ color: "rgba(255,255,255,0.78)" }} className="mx-auto mt-3 max-w-xl text-sm leading-relaxed">{view.summary}</p>}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {job.jobRef && <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold"><Hash size={12} />Job No. {job.jobRef}</span>}
            <button type="button" onClick={onCopy} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold hover:bg-white/25"><Share2 size={12} />{copied ? "Link copied" : "Share"}</button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div ref={tabsRef} className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl">
          {[["description", "Job Description"], ["apply", "Apply"]].map(([id, label]) => (
            <button key={id} type="button" onClick={() => go(id)} aria-current={tab === id ? "page" : undefined}
              className={`flex-1 border-b-2 px-4 py-3.5 text-sm font-bold transition ${tab === id ? "border-emerald-600 text-emerald-700" : "border-transparent text-gray-500 hover:text-gray-800"}`}>{label}</button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-3xl space-y-4 px-4 pt-5">
        <div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900">
          <ShieldCheck size={20} className="mt-0.5 shrink-0 text-emerald-600" />
          <p><strong>Applying is always free.</strong> {view.company} and JOBS HUB KENYA will never ask you to pay to apply, be interviewed or be hired. If anyone asks you for money for this job, don&apos;t pay and report it to us in confidence.</p>
        </div>

        {translatedJob && <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800"><CheckCircle2 size={16} />Translated to English from {job.language || job.lang || "the original language"}.</div>}
        {translationLoading && !translatedJob && <div className="rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-600">Preparing the English version of this listing…</div>}

        {tab === "description" && (
          <>
            <div className="flex flex-wrap gap-2">
              {view.location && <Chip icon={MapPin}>{view.location}</Chip>}
              {view.modeLabel && <Chip icon={Globe2}>{view.modeLabel}</Chip>}
              {view.type && <Chip icon={BriefcaseBusiness}>{view.type}</Chip>}
              {view.industry && <Chip icon={Building2}>{view.industry}</Chip>}
              {view.levelLabel && <Chip icon={Layers}>{view.levelLabel}</Chip>}
              {view.education && <Chip icon={GraduationCap}>{view.education}</Chip>}
            </div>

            {view.salary && (
              <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Compensation</p>
                <p className="mt-1 text-2xl font-extrabold text-gray-900">{view.salary}</p>
              </div>
            )}

            {view.deadlineLabel && (
              <div className={`flex items-center gap-4 rounded-2xl border p-5 ${view.deadlinePassed ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
                <span className={`grid h-11 w-11 place-items-center rounded-xl bg-white ${view.deadlinePassed ? "text-red-600" : "text-amber-600"}`}><CalendarDays size={22} /></span>
                <div>
                  <p className={`text-[11px] font-bold uppercase tracking-wider ${view.deadlinePassed ? "text-red-700" : "text-amber-700"}`}>{view.deadlinePassed ? "Applications closed" : "Application deadline"}</p>
                  <p className="text-base font-bold text-gray-900">{view.deadlineLabel}</p>
                </div>
              </div>
            )}

            {aboutSection && (
              <Card icon={FileText} title="About the Job">
                <div className="space-y-3 text-[15px] leading-relaxed text-gray-700">{aboutSection.items.map((p, i) => <p key={i}>{p}</p>)}</div>
              </Card>
            )}

            {detailSections.map((section) => (
              <Card key={section.title} icon={SECTION_ICONS[section.title] || ListChecks} title={section.title === "Requirements" ? "Requirements" : section.title} tone={section.title === "Benefits" ? "green" : "blue"}>
                {section.items.length > 1 ? <CheckList items={section.items} /> : <p className="text-[15px] leading-relaxed text-gray-700">{section.items[0]}</p>}
              </Card>
            ))}

            {view.skillList.length > 0 && (
              <Card icon={Star} title="Required Skills" tone="amber">
                <div className="flex flex-wrap gap-2">{view.skillList.slice(0, 20).map((s, i) => <span key={i} className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">{s}</span>)}</div>
              </Card>
            )}

            {view.neededDocs.length > 0 && (
              <Card icon={FileText} title="Required Documents">
                <ul className="divide-y divide-gray-100">{view.neededDocs.map((d) => (
                  <li key={d} className="flex items-center justify-between gap-3 py-2.5 text-[15px] text-gray-700">
                    <span className="flex items-center gap-2.5"><CheckCircle2 size={17} className="text-emerald-600" />{d}</span>
                    <span className="text-xs font-bold text-red-600">Required</span>
                  </li>
                ))}</ul>
              </Card>
            )}

            <Card icon={Clock3} title="Job details">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {view.facts.map(([label, value]) => (<div key={label}><dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</dt><dd className="font-semibold text-gray-800">{value}</dd></div>))}
              </dl>
            </Card>

            <div className="hidden md:block">{canApply && applyCta}</div>
          </>
        )}

        {tab === "apply" && (
          onPlatform
            ? (view.deadlinePassed
                ? <Card icon={CalendarDays} title="Applications closed" tone="amber"><p className="text-[15px] text-gray-700">The application deadline for this job was {view.deadlineLabel}. Applications are no longer being accepted.</p></Card>
                : <ApplyForm job={job} />)
            : <Card icon={Globe2} title={`Apply on ${view.source}`}>
                <p className="mb-4 text-[15px] leading-relaxed text-gray-700">This listing is provided by {view.source}. You will complete your application on the original source.</p>
                {applyCta}
              </Card>
        )}

        {related.length > 0 && (
          <section className="pt-4">
            <h2 className="mb-3 text-lg font-bold text-gray-900">More opportunities</h2>
            <div className="space-y-2">{related.map((item, index) => (
              <Link key={item.id || index} href={`/job/${item.id || item.job_id}`} onClick={() => onRelatedClick(item)} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:border-blue-300">
                <div className="min-w-0"><p className="truncate font-semibold text-gray-900">{item.title || item.job_title}</p><p className="truncate text-sm text-gray-500">{item.company || item.company_name || "Company"} · {item.location || "Worldwide"}</p></div>
                <ExternalLink size={16} className="shrink-0 text-gray-400" />
              </Link>
            ))}</div>
          </section>
        )}
      </main>

      {tab === "description" && canApply && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
          <div className="mx-auto max-w-3xl">{applyCta}</div>
        </div>
      )}
    </div>
  );
}
