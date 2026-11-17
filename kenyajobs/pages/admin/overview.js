import Head from "next/head";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { Activity, Briefcase, CalendarDays, ClipboardList, FileText, Inbox, Link2, Megaphone, Radio, ArrowUpRight, ShieldCheck } from "lucide-react";

const sections = [
  { href: "/admin/jobs", title: "Jobs", description: "Create, edit, publish, unpublish and remove manually managed vacancies.", Icon: Briefcase, group: "Content" },
  { href: "/admin/submissions", title: "Job requests", description: "Review employer-submitted vacancies and process incoming requests.", Icon: Inbox, group: "Moderation" },
  { href: "/admin/event-submissions", title: "Event requests", description: "Review submitted events and manage their publication.", Icon: CalendarDays, group: "Moderation" },
  { href: "/admin/listings", title: "Listing lifecycle", description: "Monitor expiry, renewals and active or expiring paid listings.", Icon: ClipboardList, group: "Operations" },
  { href: "/admin/posting-links", title: "Employer links", description: "Create, monitor and revoke controlled employer submission links.", Icon: Link2, group: "Operations" },
  { href: "/admin/distribution", title: "Distribution centre", description: "Review duplicate-safe WhatsApp and Telegram announcements, approve posts and track publication.", Icon: Radio, group: "Audience" },
  { href: "/admin/ads", title: "Sponsored ads", description: "Manage sponsored placements, visibility and campaign priorities.", Icon: Megaphone, group: "Growth" },
  { href: "/admin/blog", title: "Blog & articles", description: "Draft, edit and publish career resources and editorial content.", Icon: FileText, group: "Content" },
  { href: "/admin/diagnostics", title: "Source diagnostics", description: "Check job-feed availability, response times and configured integrations.", Icon: Activity, group: "System" },
];

export default function AdminOverview() {
  const groups = ["Moderation", "Content", "Operations", "Audience", "Growth", "System"];
  return (
    <AdminLayout active="overview">
      <Head><title>Admin Overview | JOBS HUB KENYA</title><meta name="robots" content="noindex,nofollow" /></Head>
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-700">Control centre</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">Admin overview</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">Manage vacancies, submissions, paid listings, audience distribution and site operations from one workspace.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-800"><ShieldCheck size={15}/>Protected admin area</div>
        </div>
      </div>
      {groups.map(group => {
        const items = sections.filter(section => section.group === group);
        return (
          <section key={group} className="mb-7">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-gray-500">{group}</h3>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {items.map(({href,title,description,Icon}) => (
                <Link key={href} href={href} className="group flex min-h-[142px] flex-col rounded-xl border border-gray-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md sm:p-5">
                  <div className="flex items-center justify-between">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-gray-100 text-gray-700 transition-colors group-hover:bg-green-50 group-hover:text-green-800"><Icon size={18}/></span>
                    <ArrowUpRight size={16} className="text-gray-400 transition-colors group-hover:text-green-700"/>
                  </div>
                  <h4 className="mt-4 text-sm font-bold text-gray-900">{title}</h4>
                  <p className="mt-1 text-xs leading-5 text-gray-500">{description}</p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </AdminLayout>
  );
}
