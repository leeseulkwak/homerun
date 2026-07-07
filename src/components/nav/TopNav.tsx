"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "피드", icon: "🏘️" },
  { href: "/track", label: "기록하기", icon: "🏃" },
  { href: "/ranking", label: "랭킹", icon: "🏆" },
  { href: "/challenges", label: "챌린지", icon: "🎯" },
  { href: "/profile", label: "마이", icon: "👤" },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-zinc-200 bg-white">
      <ul className="mx-auto flex max-w-md">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={`flex flex-col items-center gap-1 border-b-2 py-2 text-xs ${
                  active
                    ? "border-emerald-600 font-semibold text-emerald-600"
                    : "border-transparent text-zinc-500"
                }`}
              >
                <span className="text-lg leading-none">{tab.icon}</span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
