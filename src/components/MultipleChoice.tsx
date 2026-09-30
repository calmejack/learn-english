"use client";

import { useEffect, useRef, useState } from "react";
import { SpeakButton } from "./SpeakButton";

export function MultipleChoice({
  prompt,
  promptSub,
  options,
  answer,
  onResult,
  speakPrompt = false,
  speakOptions = false,
}: {
  prompt: string;
  promptSub?: string;
  options: string[];
  answer: string;
  onResult: (correct: boolean) => void;
  /** Show TTS on the prompt (English shown) */
  speakPrompt?: boolean;
  /** Show TTS on each option (English options) */
  speakOptions?: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [shake, setShake] = useState(false);
  const [awaitingContinue, setAwaitingContinue] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const continueRef = useRef<HTMLButtonElement>(null);

  const finish = (correct: boolean) => {
    onResult(correct);
  };

  const choose = (opt: string) => {
    if (locked) return;
    setSelected(opt);
    setLocked(true);
    const correct = opt === answer;
    setWasCorrect(correct);
    if (correct) {
      window.setTimeout(() => finish(true), 650);
    } else {
      setShake(true);
      window.setTimeout(() => setShake(false), 500);
      setAwaitingContinue(true);
    }
  };

  // Keyboard 1–4 / A–D when not yet answered (skip when focus is in an input)
  useEffect(() => {
    if (locked) return;
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }
      const key = e.key.toLowerCase();
      let idx = -1;
      if (key >= "1" && key <= "4") idx = Number(key) - 1;
      else if (key >= "a" && key <= "d") idx = key.charCodeAt(0) - 97;
      if (idx >= 0 && idx < options.length) {
        e.preventDefault();
        choose(options[idx]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked, options]);

  useEffect(() => {
    if (awaitingContinue) {
      continueRef.current?.focus();
    }
  }, [awaitingContinue]);

  return (
    <div
      className={`flex flex-1 flex-col ${shake ? "anim-shake" : ""} ${
        locked && !wasCorrect ? "anim-flash-wrong" : ""
      }`}
    >
      <div className="mb-6 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">选择正确含义</p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            {prompt}
          </h2>
          {speakPrompt && <SpeakButton text={prompt} size="md" />}
        </div>
        {promptSub && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{promptSub}</p>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3" role="listbox" aria-label="答案选项">
        {options.map((opt, i) => {
          let style =
            "border-slate-200 bg-white hover:border-teal-400 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-teal-500";
          if (locked && opt === answer) {
            style =
              "border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-400 dark:bg-emerald-950 dark:text-emerald-100";
          } else if (locked && opt === selected && opt !== answer) {
            style =
              "border-rose-500 bg-rose-50 text-rose-900 dark:border-rose-400 dark:bg-rose-950 dark:text-rose-100";
          }
          return (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={selected === opt}
              disabled={locked}
              onClick={() => choose(opt)}
              className={`flex min-h-[3.25rem] items-center gap-2 rounded-2xl border-2 px-4 py-3.5 text-left text-base font-medium transition ${style}`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 break-words">{opt}</span>
            </button>
          );
        })}
      </div>

      {awaitingContinue && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/50">
          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-rose-700 dark:text-rose-300" role="status">
            <span>正确答案：{answer}</span>
            {speakOptions && <SpeakButton text={answer} size="sm" />}
          </p>
          <button
            ref={continueRef}
            type="button"
            onClick={() => finish(false)}
            className="mt-3 w-full rounded-2xl bg-slate-900 px-4 py-3.5 text-base font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
          >
            继续 Continue
          </button>
        </div>
      )}
    </div>
  );
}
