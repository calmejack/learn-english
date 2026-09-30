"use client";

import { useMemo, useState } from "react";
import { lessons, words } from "@/data/lessons";
import { masteryLabel, masteryLabelEn, createWordProgress } from "@/lib/srs";
import { useProgressContext } from "@/hooks/ProgressProvider";
import { SpeakButton } from "@/components/SpeakButton";

export default function WordsPage() {
  const { state, hydrated } = useProgressContext();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "learned" | "new">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useMemo(() => {
    if (!state) return [];
    const query = q.trim().toLowerCase();
    return words
      .map((w) => {
        const progress = state.words[w.id] ?? createWordProgress(w.id);
        return { word: w, progress };
      })
      .filter(({ word, progress }) => {
        if (filter === "learned" && !progress.learned) return false;
        if (filter === "new" && progress.learned) return false;
        if (!query) return true;
        return (
          word.en.toLowerCase().includes(query) ||
          word.cn.includes(query) ||
          word.example.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (a.progress.learned !== b.progress.learned) {
          return a.progress.learned ? -1 : 1;
        }
        return b.progress.mastery - a.progress.mastery;
      });
  }, [state, q, filter]);

  if (!hydrated || !state) {
    return <div className="flex flex-1 items-center justify-center text-slate-500">加载中…</div>;
  }

  const learned = Object.values(state.words).filter((w) => w.learned).length;

  return (
    <main className="flex flex-1 flex-col gap-4">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">词库 Words</h1>
        <p className="mt-1 text-sm text-slate-500">
          已学 {learned} / {words.length} · 搜索与掌握度
        </p>
      </header>

      <label className="block">
        <span className="sr-only">搜索单词</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索英文 / 中文 / 例句…"
          className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-900"
        />
      </label>

      <div className="flex gap-2" role="tablist" aria-label="筛选">
        {(
          [
            ["all", "全部"],
            ["learned", "已学"],
            ["new", "未学"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={filter === id}
            onClick={() => setFilter(id)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              filter === id
                ? "bg-teal-600 text-white"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-2 pb-4">
        {list.length === 0 && (
          <li className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700">
            没有匹配的单词
          </li>
        )}
        {list.map(({ word, progress }) => {
          const lesson = lessons.find((l) => l.id === word.lessonId);
          const open = openId === word.id;
          return (
            <li
              key={word.id}
              className="rounded-2xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : word.id)}
                >
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {word.en}
                    </span>
                    {word.ipa && (
                      <span className="font-mono text-xs text-slate-400">{word.ipa}</span>
                    )}
                  </div>
                  <div className="text-sm text-slate-700 dark:text-slate-200">{word.cn}</div>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">
                    {word.example}
                  </p>
                </button>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <SpeakButton text={word.en} size="sm" />
                  <div className="text-right">
                    <div
                      className={`text-xs font-semibold ${
                        progress.mastery >= 80
                          ? "text-emerald-600"
                          : progress.mastery >= 30
                            ? "text-sky-600"
                            : "text-slate-400"
                      }`}
                    >
                      {masteryLabel(progress.mastery)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {masteryLabelEn(progress.mastery)}
                    </div>
                    <div className="mt-1 text-[10px] text-slate-400">
                      {lesson?.icon} {lesson?.titleCn}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-teal-500 transition-all"
                  style={{ width: `${progress.mastery}%` }}
                  aria-hidden
                />
              </div>
              {open && (
                <div className="mt-3 space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-start gap-2">
                    <p className="min-w-0 flex-1 text-slate-800 dark:text-slate-100">
                      {word.example}
                    </p>
                    <SpeakButton text={word.example} size="sm" label="朗读例句" />
                  </div>
                  <p className="text-xs text-slate-500">{word.exampleCn}</p>
                  <dl className="grid grid-cols-2 gap-2 border-t border-slate-200/80 pt-2 text-xs dark:border-slate-800">
                    <div>
                      <dt className="text-slate-400">掌握度 Mastery</dt>
                      <dd className="font-semibold text-slate-800 dark:text-slate-100">
                        {progress.mastery}% · {masteryLabel(progress.mastery)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">下次复习 Next review</dt>
                      <dd className="font-semibold text-slate-800 dark:text-slate-100">
                        {progress.learned
                          ? progress.due.slice(0, 10)
                          : "未学 · 完成课程后安排"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">正确 / 见过</dt>
                      <dd className="font-semibold text-slate-800 dark:text-slate-100">
                        {progress.correct} / {progress.seen}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">朗读</dt>
                      <dd className="mt-0.5">
                        <SpeakButton text={word.en} size="sm" label="朗读单词" />
                      </dd>
                    </div>
                  </dl>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
