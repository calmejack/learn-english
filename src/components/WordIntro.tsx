"use client";

import type { Word } from "@/lib/types";
import { SpeakButton } from "./SpeakButton";

export function WordIntro({
  word,
  onContinue,
}: {
  word: Word;
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-teal-600 dark:text-teal-400">
          New word · 生词
        </p>
        <div className="flex items-center justify-center gap-3">
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            {word.en}
          </h2>
          <SpeakButton text={word.en} label="朗读单词" />
        </div>
        {word.ipa && (
          <p className="font-mono text-sm text-slate-500 dark:text-slate-400">
            {word.ipa}
          </p>
        )}
        <p className="text-2xl font-semibold text-slate-700 dark:text-slate-200">
          {word.cn}
        </p>
        <div className="mt-4 max-w-sm rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-start gap-2">
            <p className="min-w-0 flex-1 text-base leading-relaxed text-slate-800 dark:text-slate-100">
              {word.example}
            </p>
            <SpeakButton text={word.example} label="朗读例句" size="sm" />
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {word.exampleCn}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onContinue}
        className="mt-6 w-full rounded-2xl bg-teal-600 px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
      >
        继续 Continue
      </button>
    </div>
  );
}
