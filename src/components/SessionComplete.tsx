"use client";

import Link from "next/link";

export function SessionComplete({
  title,
  subtitle,
  xp,
  streak,
  accuracy,
  practice,
  extras,
}: {
  title: string;
  subtitle?: string;
  xp: number;
  streak: number;
  /** e.g. { correct: 8, total: 10 } */
  accuracy?: { correct: number; total: number };
  practice?: boolean;
  extras?: React.ReactNode;
}) {
  const pct =
    accuracy && accuracy.total > 0
      ? Math.round((accuracy.correct / accuracy.total) * 100)
      : null;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      <div
        className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-500 text-4xl shadow-lg shadow-orange-500/30"
        aria-hidden
      >
        {practice ? "💪" : "🔥"}
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 max-w-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
      )}
      <div
        className={`mt-8 grid w-full max-w-sm gap-3 ${
          accuracy ? "grid-cols-3" : "grid-cols-2"
        }`}
      >
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
          <div className="text-xs text-amber-800 dark:text-amber-300">本场 XP</div>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-200">
            +{xp}
          </div>
        </div>
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
          <div className="text-xs text-orange-800 dark:text-orange-300">连续打卡</div>
          <div className="text-2xl font-bold text-orange-700 dark:text-orange-200">
            {streak} 天
          </div>
        </div>
        {accuracy && pct !== null && (
          <div className="rounded-2xl border border-teal-500/20 bg-teal-500/10 p-4">
            <div className="text-xs text-teal-800 dark:text-teal-300">正确率</div>
            <div className="text-2xl font-bold text-teal-700 dark:text-teal-200">
              {pct}%
            </div>
            <div className="text-[10px] text-teal-700/70 dark:text-teal-300/70">
              {accuracy.correct}/{accuracy.total}
            </div>
          </div>
        )}
      </div>
      {streak >= 2 && !practice && (
        <p className="mt-4 text-sm font-medium text-orange-600 dark:text-orange-300">
          🔥 连续 {streak} 天，太棒了！Keep the streak!
        </p>
      )}
      {extras}
      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
        <Link
          href="/"
          className="rounded-2xl bg-teal-600 px-4 py-3.5 text-center text-base font-semibold text-white shadow-lg shadow-teal-600/25 hover:bg-teal-500"
        >
          回到今日 Back home
        </Link>
        <Link
          href="/review"
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-center text-base font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          去复习 Review due cards
        </Link>
      </div>
    </div>
  );
}
