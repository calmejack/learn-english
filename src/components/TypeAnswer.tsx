"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { answersMatch } from "@/lib/exercises";
import { SpeakButton } from "./SpeakButton";

export function TypeAnswer({
  prompt,
  promptSub,
  hint,
  answer,
  onResult,
  speakAnswer = true,
}: {
  prompt: string;
  promptSub?: string;
  hint?: string;
  answer: string;
  onResult: (correct: boolean) => void;
  speakAnswer?: boolean;
}) {
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<"ok" | "bad" | null>(null);
  const [locked, setLocked] = useState(false);
  const [shake, setShake] = useState(false);
  const [awaitingContinue, setAwaitingContinue] = useState(false);
  const continueRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (awaitingContinue) {
      continueRef.current?.focus();
    }
  }, [awaitingContinue]);

  const finish = (correct: boolean) => {
    onResult(correct);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (locked || !value.trim()) return;
    const correct = answersMatch(value, answer);
    setFeedback(correct ? "ok" : "bad");
    setLocked(true);
    if (correct) {
      window.setTimeout(() => finish(true), 650);
    } else {
      setShake(true);
      window.setTimeout(() => setShake(false), 500);
      setAwaitingContinue(true);
    }
  };

  return (
    <div
      className={`flex flex-1 flex-col ${shake ? "anim-shake" : ""} ${
        feedback === "bad" ? "anim-flash-wrong" : ""
      }`}
    >
      <div className="mb-6 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">{hint ?? "输入英文"}</p>
        <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
          {prompt}
        </h2>
        {promptSub && (
          <p className="mt-2 text-base leading-relaxed text-slate-600 dark:text-slate-300">
            {promptSub}
          </p>
        )}
      </div>
      <form onSubmit={submit} className="mt-auto flex flex-col gap-3">
        <label className="sr-only" htmlFor="type-answer">
          Your answer
        </label>
        <input
          id="type-answer"
          type="text"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          disabled={locked}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type in English…"
          className={`w-full rounded-2xl border-2 bg-white px-4 py-3.5 text-lg outline-none transition dark:bg-slate-900 ${
            feedback === "ok"
              ? "border-emerald-500"
              : feedback === "bad"
                ? "border-rose-500"
                : "border-slate-200 focus:border-teal-500 dark:border-slate-700"
          }`}
        />
        {feedback === "bad" && (
          <div
            className="flex items-center justify-center gap-2 text-sm text-rose-600 dark:text-rose-400"
            role="status"
          >
            <span>正确答案：{answer}</span>
            {speakAnswer && <SpeakButton text={answer} size="sm" />}
          </div>
        )}
        {feedback === "ok" && (
          <div
            className="flex items-center justify-center gap-2 text-sm text-emerald-600 dark:text-emerald-400"
            role="status"
          >
            <span>正确！Great!</span>
            {speakAnswer && <SpeakButton text={answer} size="sm" />}
          </div>
        )}
        {!awaitingContinue && (
          <button
            type="submit"
            disabled={locked || !value.trim()}
            className="w-full rounded-2xl bg-teal-600 px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            检查 Check
          </button>
        )}
        {awaitingContinue && (
          <button
            ref={continueRef}
            type="button"
            onClick={() => finish(false)}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3.5 text-base font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
          >
            继续 Continue
          </button>
        )}
      </form>
    </div>
  );
}
