// components/CategoryTabs.js
import Link from "next/link";
import { useRouter } from "next/router";

const tabs = [
  { label: " Remote Jobs", href: "/remote-jobs" },
  { label: " Entry Level", href: "/entry-level" },
  { label: " Graduate Jobs", href: "/graduate-jobs" },
  { label: " Work From Home", href: "/work-from-home" },
];

export default function CategoryTabs() {
  const router = useRouter();

  return (
    <div className="flex flex-wrap justify-center gap-3 my-6">
      {tabs.map((tab) => {
        const isActive = router.pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
              isActive
                ? "bg-blue-600 text-white shadow"
                : "bg-white text-gray-600 border border-gray-300 hover:bg-blue-50 hover:text-blue-600"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}