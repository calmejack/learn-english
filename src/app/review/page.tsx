"use client";

import { useState } from "react";
import Link from "next/link";
import { getWordById } from "@/data/lessons";
import { buildReviewQueue } from "@/lib/exercises";
import { ProgressBar } from "@/components/ProgressBar";
import { MultipleChoice } from "@/components/MultipleChoice";
import { TypeAnswer } from "@/components/TypeAnswer";
import { SRSButtons } from "@/components/SRSButtons";
import { SessionComplete } from "@/components/SessionComplete";
import { FeedbackToast } from "@/components/FeedbackToast";
import { SpeakButton } from "@/components/SpeakButton";
import { useProgressContext } from "@/hooks/ProgressProvider";
import type { Exercise, SRSGrade } from "@/lib/types";

export default function ReviewPage() {
  const { state, hydrated, dueWordIds, recordReview, recordAnswer } =
    useProgressContext();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"quiz" | "grade">("quiz");
  const [lastCorrect, setLastCorrect] = useState(true);
  const [sessionXp, setSessionXp] = useState(0);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);
  const [toast, setToast] = useState<{ correct: boolean; msg: string } | null>(null);
  const [queueIds, setQueueIds] = useState<string[]>([]);

  if (!hydrated || !state) {
    return <div className="flex flex-1 items-center justify-center text-slate-500">加载中…</div>;
  }

  if (!started) {
    return (
      <main className="flex flex-1 flex-col">
        <header className="mb-6 pt-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            复习 Review
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            基于间隔重复（SM-2 风格）：Again / Hard / Good / Easy
          </p>
        </header>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-4xl font-bold text-rose-600 dark:text-rose-400">
            {dueWordIds.length}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">张卡片到期</p>
          <p className="mt-3 text-xs text-slate-500">
            每次最多复习 20 张。答完后自评难度，安排下次出现时间。
          </p>
        </div>
        {dueWordIds.length === 0 ? (
          <div className="mt-8 flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <p className="text-4xl" aria-hidden>
              ✨
            </p>
            <p className="font-semibold">暂无到期卡片</p>
            <p className="text-sm text-slate-500">去学一课新词，明天再来复习吧。</p>
            <Link
              href="/learn"
              className="mt-4 rounded-2xl bg-teal-600 px-5 py-3 font-semibold text-white"
            >
              去学习
            </Link>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              const ids = dueWordIds.slice(0, 20).filter((id) => !!getWordById(id));
              setQueueIds(ids);
              setExercises(buildReviewQueue(ids));
              setIndex(0);
              setPhase("quiz");
              setSessionXp(0);
              setDone(false);
              setStarted(true);
            }}
            className="mt-auto w-full rounded-2xl bg-teal-600 px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-teal-600/25 hover:bg-teal-500"
          >
            开始复习 Start review
          </button>
        )}
      </main>
    );
  }

  if (done || exercises.length === 0) {
    return (
      <SessionComplete
        title="复习完成！"
        subtitle={
          queueIds.length
            ? `处理了 ${queueIds.length} 张卡片。间隔复习会帮你记得更久。`
            : "没有需要复习的卡片。"
        }
        xp={sessionXp}
        streak={state.streak}
      />
    );
  }

  const current = exercises[index];
  if (!current) {
    return (
      <SessionComplete
        title="复习完成！"
        subtitle="没有需要复习的卡片。"
        xp={sessionXp}
        streak={state.streak}
      />
    );
  }
  const word = getWordById(current.wordId);
  if (!word) {
    // Should be rare after queue filter — finish rather than hang
    return (
      <SessionComplete
        title="复习完成！"
        subtitle={
          queueIds.length
            ? `处理了 ${queueIds.length} 张卡片。间隔复习会帮你记得更久。`
            : "没有需要复习的卡片。"
        }
        xp={sessionXp}
        streak={state.streak}
      />
    );
  }

  const finishGrade = (grade: SRSGrade) => {
    recordReview(word.id, grade);
    const xp =
      grade === "again" ? 2 : grade === "hard" ? 6 : grade === "good" ? 10 : 14;
    setSessionXp((x) => x + xp);
    setToast({ correct: grade !== "again", msg: `已记录 · +${xp} XP` });
    window.setTimeout(() => setToast(null), 800);

    const next = index + 1;
    if (next >= exercises.length) {
      setDone(true);
    } else {
      setIndex(next);
      setPhase("quiz");
    }
  };

  const afterQuiz = (correct: boolean) => {
    setLastCorrect(correct);
    recordAnswer(word.id, correct, 0);
    setPhase("grade");
    if (!correct) {
      setToast({ correct: false, msg: `答案：${current.answer}` });
      window.setTimeout(() => setToast(null), 1200);
    }
  };

  return (
    <main className="flex flex-1 flex-col">
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setStarted(false)}
          className="text-sm text-slate-500 hover:text-teal-600"
        >
          退出
        </button>
        <div className="flex-1">
          <ProgressBar value={index} max={exercises.length} color="rose" />
        </div>
        <span className="text-xs tabular-nums text-slate-500">
          {index + 1}/{exercises.length}
        </span>
      </div>

      {phase === "quiz" && current.type === "mc-en-cn" && current.options && (
        <MultipleChoice
          key={`${current.wordId}-${index}`}
          prompt={word.en}
          promptSub={word.ipa}
          options={current.options}
          answer={current.answer}
          speakPrompt
          onResult={afterQuiz}
        />
      )}

      {phase === "quiz" && current.type === "fill-blank" && (
        <TypeAnswer
          key={`${current.wordId}-${index}`}
          prompt="填空"
          promptSub={current.prompt}
          answer={current.answer}
          onResult={afterQuiz}
        />
      )}

      {phase === "quiz" && current.type === "type-en" && (
        <TypeAnswer
          key={`${current.wordId}-${index}`}
          prompt={word.cn}
          promptSub={word.exampleCn}
          answer={current.answer}
          onResult={afterQuiz}
        />
      )}

      {phase === "quiz" &&
        current.type !== "mc-en-cn" &&
        current.type !== "fill-blank" &&
        current.type !== "type-en" && (
          <TypeAnswer
            key={`${current.wordId}-${index}`}
            prompt={word.cn}
            answer={word.en}
            onResult={afterQuiz}
          />
        )}

      {phase === "grade" && (
        <div className="flex flex-1 flex-col">
          <div className="mb-6 text-center">
            <p className="text-sm text-slate-500">自评难度 How hard was it?</p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                {word.en}
              </h2>
              <SpeakButton text={word.en} />
            </div>
            <p className="mt-1 text-lg text-slate-600 dark:text-slate-300">{word.cn}</p>
            <p
              className={`mt-3 text-sm font-semibold ${
                lastCorrect
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {lastCorrect ? "你答对了" : "刚才答错了 — 建议选「重来」或「困难」"}
            </p>
            <div className="mx-auto mt-4 max-w-sm rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm dark:border-slate-700 dark:bg-slate-900">
              <p>{word.example}</p>
              <p className="mt-1 text-slate-500">{word.exampleCn}</p>
            </div>
          </div>
          <div className="mt-auto">
            <SRSButtons onGrade={finishGrade} suggestCareful={!lastCorrect} />
          </div>
        </div>
      )}

      {toast && <FeedbackToast correct={toast.correct} message={toast.msg} />}
    </main>
  );
}
