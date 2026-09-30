"use client";

import { useEffect } from "react";
import type { SRSGrade } from "@/lib/types";

const grades: {
  grade: SRSGrade;
  label: string;
  labelEn: string;
  hint: string;
  key: string;
  className: string;
}[] = [
  {
    grade: "again",
    label: "重来",
    labelEn: "Again",
    hint: "今天再看",
    key: "1",
    className:
      "bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-200 dark:hover:bg-rose-900",
  },
  {
    grade: "hard",
    label: "困难",
    labelEn: "Hard",
    hint: "稍后再看",
    key: "2",
    className:
      "bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:hover:bg-amber-900",
  },
  {
    grade: "good",
    label: "良好",
    labelEn: "Good",
    hint: "正常间隔",
    key: "3",
    className:
      "bg-sky-100 text-sky-900 hover:bg-sky-200 dark:bg-sky-950 dark:text-sky-200 dark:hover:bg-sky-900",
  },
  {
    grade: "easy",
    label: "简单",
    labelEn: "Easy",
    hint: "拉长间隔",
    key: "4",
    className:
      "bg-emerald-100 text-emerald-900 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:hover:bg-emerald-900",
  },
];

export function SRSButtons({
  onGrade,
  enabled = true,
  /** When quiz was wrong, visually bias toward Again / Hard */
  suggestCareful = false,
}: {
  onGrade: (g: SRSGrade) => void;
  enabled?: boolean;
  suggestCareful?: boolean;
}) {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }
      const map: Record<string, SRSGrade> = {
        "1": "again",
        "2": "hard",
        "3": "good",
        "4": "easy",
      };
      const g = map[e.key];
      if (g) {
        e.preventDefault();
        onGrade(g);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, onGrade]);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {grades.map((g) => {
        const careful = suggestCareful && (g.grade === "again" || g.grade === "hard");
        const soft = suggestCareful && (g.grade === "good" || g.grade === "easy");
        return (
          <button
            key={g.grade}
            type="button"
            onClick={() => onGrade(g.grade)}
            disabled={!enabled}
            className={`min-h-[4.25rem] rounded-2xl px-3 py-3 text-center transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:opacity-50 ${g.className} ${
              careful ? "ring-2 ring-offset-1 ring-rose-400 dark:ring-offset-slate-950" : ""
            } ${soft ? "opacity-70" : ""}`}
          >
            <div className="text-sm font-bold">
              <span className="mr-1 inline-block rounded bg-black/5 px-1 text-[10px] dark:bg-white/10">
                {g.key}
              </span>
              {g.label} · {g.labelEn}
            </div>
            <div className="mt-0.5 text-[11px] opacity-80">
              {careful ? "推荐 · " : ""}
              {g.hint}
            </div>
          </button>
        );
      })}
    </div>
  );
}
