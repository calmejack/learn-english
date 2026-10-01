"use client";

import Link from "next/link";
import { lessons, words } from "@/data/lessons";
import { ProgressBar } from "@/components/ProgressBar";
import { StatCard } from "@/components/StatCard";
import { useProgressContext } from "@/hooks/ProgressProvider";

export default function HomePage() {
  const { state, hydrated, dueWordIds, learnedCount, setTipDismissed } =
    useProgressContext();

  const dismissTip = () => {
    setTipDismissed(true);
  };

  if (!hydrated || !state) {
    return (
      <div className="flex flex-1 items-center justify-center text-slate-500">
        加载中…
      </div>
    );
  }

  const goalPct = Math.min(100, Math.round((state.daily.xp / state.dailyGoal) * 100));
  const nextLesson =
    lessons.find((l) => !state.completedLessons.includes(l.id) && state.unlockedLessons.includes(l.id)) ??
    lessons.find((l) => state.unlockedLessons.includes(l.id)) ??
    lessons[0];

  return (
    <main className="flex flex-1 flex-col gap-5">
      <header className="pt-2">
        <p className="text-sm font-medium text-teal-600 dark:text-teal-400">
          Daily English · 每日英语
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          今日学习 Today
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          短课 + 复习，稳住连续打卡。
        </p>
      </header>

      {!state.tipDismissed && (
        <div className="relative rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900 dark:border-teal-900 dark:bg-teal-950/50 dark:text-teal-100">
          <button
            type="button"
            onClick={dismissTip}
            className="absolute right-2 top-2 rounded-lg px-2 py-0.5 text-xs text-teal-700/70 hover:bg-teal-100 dark:text-teal-300 dark:hover:bg-teal-900"
            aria-label="关闭提示"
          >
            ✕
          </button>
          <p className="pr-6 font-medium">新手提示</p>
          <p className="mt-1 text-xs leading-relaxed text-teal-800/90 dark:text-teal-200/90">
            <strong>今日课</strong> 学新词 → <strong>复习</strong> 巩固到期卡片 →{" "}
            <strong>词库</strong> 查看掌握度。完成的课程可随时再练。
          </p>
        </div>
      )}

      <section className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              今日目标 Daily goal
            </h2>
            <p className="text-xs text-slate-500">
              {state.daily.xp} / {state.dailyGoal} XP · {goalPct}%
            </p>
          </div>
          {goalPct >= 100 && (
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              完成 ✓
            </span>
          )}
        </div>
        <ProgressBar value={state.daily.xp} max={state.dailyGoal} color="teal" label="XP progress" />
      </section>

      <section className="grid grid-cols-2 gap-3">
        <StatCard icon="🔥" label="连续打卡" value={`${state.streak}`} sub={`最长 ${state.longestStreak} 天`} accent="amber" />
        <StatCard icon="⭐" label="今日 XP" value={state.daily.xp} sub={`累计 ${state.totalXp}`} accent="violet" />
        <StatCard icon="📖" label="已学单词" value={learnedCount} sub={`共 ${words.length} 词`} accent="sky" />
        <StatCard icon="🔁" label="待复习" value={dueWordIds.length} sub="到期卡片" accent="rose" />
      </section>

      <section className="flex flex-col gap-3">
        <Link
          href={
            nextLesson
              ? state.completedLessons.includes(nextLesson.id)
                ? `/learn?lesson=${nextLesson.id}&practice=1`
                : `/learn?lesson=${nextLesson.id}`
              : "/learn"
          }
          className="flex items-center gap-4 rounded-3xl bg-gradient-to-br from-teal-600 to-cyan-600 p-4 text-white shadow-lg shadow-teal-600/25 transition hover:brightness-110"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl" aria-hidden>
            {nextLesson?.icon ?? "📚"}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <div className="text-xs font-medium text-teal-100">
              {nextLesson && state.completedLessons.includes(nextLesson.id)
                ? "练习课程 Practice"
                : "开始课程 Start lesson"}
            </div>
            <div className="truncate text-lg font-bold">
              {nextLesson ? `${nextLesson.titleCn} · ${nextLesson.title}` : "选择课程"}
            </div>
            <div className="truncate text-xs text-teal-100/90">
              {nextLesson?.descriptionCn}
            </div>
          </div>
          <span aria-hidden className="text-xl">
            →
          </span>
        </Link>

        <Link
          href="/review"
          className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-500"
        >
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              复习到期卡片 Review due
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {dueWordIds.length > 0
                ? `${dueWordIds.length} 张卡片等待复习`
                : "暂无到期 · 先去学新词吧"}
            </div>
          </div>
          <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            {dueWordIds.length}
          </span>
        </Link>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          课程 Lessons
        </h2>
        <ul className="flex flex-col gap-2">
          {lessons.map((lesson) => {
            const unlocked = state.unlockedLessons.includes(lesson.id);
            const done = state.completedLessons.includes(lesson.id);
            const href = done
              ? `/learn?lesson=${lesson.id}&practice=1`
              : `/learn?lesson=${lesson.id}`;
            return (
              <li key={lesson.id}>
                {unlocked ? (
                  <Link
                    href={href}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 transition hover:border-teal-400 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <span className="text-2xl" aria-hidden>
                      {lesson.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-slate-900 dark:text-white">
                        {lesson.titleCn}
                        <span className="ml-1 text-xs font-normal text-slate-500">
                          {lesson.title}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {lesson.wordIds.length} 词
                        {done ? " · 可再练" : ""}
                      </div>
                    </div>
                    {done ? (
                      <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-semibold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                        练习 · 已完成
                      </span>
                    ) : (
                      <span className="rounded-full bg-teal-100 px-2.5 py-1 text-[11px] font-semibold text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                        学习
                      </span>
                    )}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 px-3 py-3 opacity-60 dark:border-slate-700">
                    <span className="text-2xl grayscale" aria-hidden>
                      🔒
                    </span>
                    <div>
                      <div className="font-semibold text-slate-600 dark:text-slate-400">
                        {lesson.titleCn}
                      </div>
                      <div className="text-xs text-slate-500">完成上一课后解锁</div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
