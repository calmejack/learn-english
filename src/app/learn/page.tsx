"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getLessonById, getWordById, lessons } from "@/data/lessons";
import { buildLessonExercises, buildMissedRedoExercises } from "@/lib/exercises";
import { ProgressBar } from "@/components/ProgressBar";
import { WordIntro } from "@/components/WordIntro";
import { MultipleChoice } from "@/components/MultipleChoice";
import { TypeAnswer } from "@/components/TypeAnswer";
import { SessionComplete } from "@/components/SessionComplete";
import { FeedbackToast } from "@/components/FeedbackToast";
import { useProgressContext } from "@/hooks/ProgressProvider";
import type { Exercise } from "@/lib/types";
import Link from "next/link";

function LearnInner() {
  const search = useSearchParams();
  const lessonId = search.get("lesson") ?? lessons[0]?.id;
  const practiceParam = search.get("practice") === "1";
  const lesson = getLessonById(lessonId ?? "");
  const { state, hydrated, recordLessonWord, recordAnswer, completeLesson } =
    useProgressContext();

  const [started, setStarted] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [index, setIndex] = useState(0);
  const [sessionXp, setSessionXp] = useState(0);
  const [done, setDone] = useState(false);
  const [toast, setToast] = useState<{ correct: boolean; msg: string } | null>(null);
  const [missedIds, setMissedIds] = useState<string[]>([]);
  const [inRedo, setInRedo] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [mainLen, setMainLen] = useState(0);

  const alreadyCompleted = useMemo(() => {
    if (!state || !lesson) return false;
    return state.completedLessons.includes(lesson.id);
  }, [state, lesson]);

  const practiceMode = practiceParam || alreadyCompleted;

  const unlocked = useMemo(() => {
    if (!state || !lesson) return false;
    return state.unlockedLessons.includes(lesson.id);
  }, [state, lesson]);

  if (!hydrated || !state) {
    return <div className="flex flex-1 items-center justify-center text-slate-500">加载中…</div>;
  }

  if (!lesson) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3">
        <p>未找到课程</p>
        <Link href="/" className="text-teal-600 underline">
          返回首页
        </Link>
      </main>
    );
  }

  if (!unlocked) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <p className="text-4xl" aria-hidden>
          🔒
        </p>
        <h1 className="text-xl font-bold">课程未解锁</h1>
        <p className="text-sm text-slate-500">请先完成前面的课程。</p>
        <Link
          href="/"
          className="mt-4 rounded-2xl bg-teal-600 px-5 py-3 font-semibold text-white"
        >
          回到今日
        </Link>
      </main>
    );
  }

  if (!started) {
    return (
      <main className="flex flex-1 flex-col">
        <header className="mb-6">
          <Link href="/" className="text-sm text-teal-600 dark:text-teal-400">
            ← 返回
          </Link>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-4xl" aria-hidden>
              {lesson.icon}
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {lesson.titleCn}
              </h1>
              <p className="text-sm text-slate-500">{lesson.title}</p>
            </div>
          </div>
          {practiceMode && (
            <p className="mt-3 rounded-2xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-800 dark:border-violet-900 dark:bg-violet-950/50 dark:text-violet-200">
              练习 Practice · 不计课程完成奖励，巩固已学内容
            </p>
          )}
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            {lesson.descriptionCn}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {lesson.wordIds.length} 个单词 · 生词卡 + 选择题 + 填空 + 拼写
            {practiceMode ? " · 练习模式" : ""}
          </p>
        </header>
        <ul className="mb-6 flex flex-wrap gap-2">
          {lesson.wordIds.map((id) => {
            const w = getWordById(id);
            return (
              <li
                key={id}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
              >
                {w?.en}
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={() => {
            const built = buildLessonExercises(lesson.wordIds);
            setExercises(built);
            setMainLen(built.length);
            setIndex(0);
            setSessionXp(0);
            setDone(false);
            setMissedIds([]);
            setInRedo(false);
            setCorrectCount(0);
            setAnsweredCount(0);
            setStarted(true);
          }}
          className="mt-auto w-full rounded-2xl bg-teal-600 px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-teal-600/25 hover:bg-teal-500"
        >
          {practiceMode ? "开始练习 Practice" : "开始学习 Start"}
        </button>
      </main>
    );
  }

  if (done) {
    const bonus = practiceMode || alreadyCompleted ? 0 : 20;
    return (
      <SessionComplete
        title={practiceMode ? "练习完成！" : "课程完成！"}
        subtitle={
          practiceMode
            ? `${lesson.titleCn} 练习结束。继续保持手感！`
            : `${lesson.titleCn} 学完了。坚持打卡，词汇会越来越牢。`
        }
        xp={sessionXp + bonus}
        streak={state.streak}
        practice={practiceMode}
        accuracy={
          answeredCount > 0
            ? { correct: correctCount, total: answeredCount }
            : undefined
        }
      />
    );
  }

  const current = exercises[index];
  if (!current) {
    return <div className="flex flex-1 items-center justify-center">准备中…</div>;
  }
  const word = getWordById(current.wordId);
  if (!word) return null;

  const finishSession = () => {
    completeLesson(lesson.id, { practice: practiceMode });
    setDone(true);
  };

  const advanceSafe = (correct: boolean, xpGain: number, isGraded: boolean) => {
    let nextMissed = missedIds;
    if (isGraded && !correct && !missedIds.includes(current.wordId)) {
      nextMissed = [...missedIds, current.wordId];
      setMissedIds(nextMissed);
    }

    if (isGraded) {
      setAnsweredCount((n) => n + 1);
      if (correct) {
        setCorrectCount((n) => n + 1);
        setSessionXp((x) => x + xpGain);
      }
    } else if (correct && xpGain > 0) {
      setSessionXp((x) => x + xpGain);
    }

    setToast({
      correct,
      msg: correct
        ? `正确！+${xpGain} XP`
        : inRedo
          ? "错题再练一次"
          : "再记一次，加油！",
    });
    window.setTimeout(() => setToast(null), 900);

    const next = index + 1;
    if (next >= exercises.length) {
      if (!inRedo) {
        const missed = nextMissed;
        if (missed.length > 0) {
          const redo = buildMissedRedoExercises(missed);
          if (redo.length > 0) {
            setInRedo(true);
            setExercises((prev) => [...prev, ...redo]);
            setIndex(next);
            return;
          }
        }
      }
      finishSession();
    } else {
      setIndex(next);
    }
  };

  const progressMax = Math.max(exercises.length, 1);
  const progressLabel = inRedo
    ? `错题重练 ${index - mainLen + 1}/${Math.max(exercises.length - mainLen, 1)}`
    : `${index + 1}/${mainLen || exercises.length}`;

  return (
    <main className="flex flex-1 flex-col">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/" className="text-sm text-slate-500 hover:text-teal-600">
          退出
        </Link>
        <div className="flex-1">
          <ProgressBar
            value={index}
            max={progressMax}
            color={inRedo ? "rose" : "teal"}
          />
        </div>
        <span className="text-xs tabular-nums text-slate-500">{progressLabel}</span>
      </div>

      {inRedo && index >= mainLen && (
        <p className="mb-3 rounded-xl bg-rose-50 px-3 py-2 text-center text-xs font-semibold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
          错题重练 · Missed words
        </p>
      )}

      {current.type === "intro" && (
        <WordIntro
          word={word}
          onContinue={() => {
            recordLessonWord(word.id);
            advanceSafe(true, 5, false);
          }}
        />
      )}

      {current.type === "mc-en-cn" && current.options && (
        <MultipleChoice
          key={`${current.wordId}-${index}-${inRedo ? "r" : "m"}`}
          prompt={word.en}
          promptSub={word.ipa}
          options={current.options}
          answer={current.answer}
          speakPrompt
          onResult={(correct) => {
            recordAnswer(word.id, correct, 10);
            advanceSafe(correct, correct ? 10 : 0, true);
          }}
        />
      )}

      {current.type === "mc-cn-en" && current.options && (
        <MultipleChoice
          key={`${current.wordId}-${index}-${inRedo ? "r" : "m"}`}
          prompt={word.cn}
          promptSub="选择对应英文"
          options={current.options}
          answer={current.answer}
          speakOptions
          onResult={(correct) => {
            recordAnswer(word.id, correct, 10);
            advanceSafe(correct, correct ? 10 : 0, true);
          }}
        />
      )}

      {current.type === "fill-blank" && (
        <TypeAnswer
          key={`${current.wordId}-${index}-${inRedo ? "r" : "m"}`}
          prompt="填空 Fill in the blank"
          promptSub={current.prompt}
          hint="根据例句填写英文单词"
          answer={current.answer}
          onResult={(correct) => {
            recordAnswer(word.id, correct, 12);
            advanceSafe(correct, correct ? 12 : 0, true);
          }}
        />
      )}

      {current.type === "type-en" && (
        <TypeAnswer
          key={`${current.wordId}-${index}-${inRedo ? "r" : "m"}`}
          prompt={word.cn}
          promptSub={`例句：${word.exampleCn}`}
          hint="根据中文拼写英文"
          answer={current.answer}
          onResult={(correct) => {
            recordAnswer(word.id, correct, 14);
            advanceSafe(correct, correct ? 14 : 0, true);
          }}
        />
      )}

      {toast && <FeedbackToast correct={toast.correct} message={toast.msg} />}
    </main>
  );
}

export default function LearnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center text-slate-500">加载中…</div>
      }
    >
      <LearnInner />
    </Suspense>
  );
}
