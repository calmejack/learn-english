"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProgressContext } from "@/hooks/ProgressProvider";

const items = [
  { href: "/", label: "今日", labelEn: "Today", icon: "☀️" },
  { href: "/learn", label: "学习", labelEn: "Learn", icon: "📚" },
  { href: "/review", label: "复习", labelEn: "Review", icon: "🔁", badge: "due" as const },
  { href: "/words", label: "词库", labelEn: "Words", icon: "📝" },
  { href: "/settings", label: "设置", labelEn: "Settings", icon: "⚙️" },
];

export function Nav() {
  const pathname = usePathname();
  const { dueWordIds, hydrated } = useProgressContext();
  const dueCount = hydrated ? dueWordIds.length : 0;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-950/90"
      aria-label="主导航 Main navigation"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const showBadge = item.badge === "due" && dueCount > 0;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`relative flex flex-col items-center gap-0.5 px-1 py-2 text-xs transition-colors ${
                  active
                    ? "text-teal-600 dark:text-teal-400"
                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span className="relative text-lg leading-none" aria-hidden>
                  {item.icon}
                  {showBadge && (
                    <span className="absolute -right-2.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white">
                      {dueCount > 99 ? "99+" : dueCount}
                    </span>
                  )}
                </span>
                <span className="font-medium">{item.label}</span>
                <span className="sr-only">
                  {item.labelEn}
                  {showBadge ? `, ${dueCount} due` : ""}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
