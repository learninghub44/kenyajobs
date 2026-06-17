import Link from "next/link";
import { useRouter } from "next/router";
import { Laptop, Briefcase, GraduationCap, Home } from "lucide-react";

const tabs = [
  { label: "Remote Jobs", href: "/remote-jobs", icon: Laptop },
  { label: "Entry Level", href: "/entry-level", icon: Briefcase },
  { label: "Graduate Jobs", href: "/graduate-jobs", icon: GraduationCap },
  { label: "Work From Home", href: "/work-from-home", icon: Home },
];

export default function CategoryTabs() {
  const router = useRouter();

  return (
    <div className="flex flex-wrap justify-center gap-2 my-6">
      {tabs.map((tab) => {
        const isActive = router.pathname === tab.href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            <Icon size={14} />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
