"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { lessons } from "@/data/lessons";
import {
  applyGrade,
  createWordProgress,
  isDue,
  markLearned,
  todayKey,
} from "@/lib/srs";
import {
  createDefaultProgress,
  loadProgress,
  parseProgressImport,
  resetProgress as resetStored,
  saveProgress,
  touchActivity,
} from "@/lib/storage";
import type { ProgressState, SRSGrade, ThemeMode } from "@/lib/types";

export function useProgress() {
  const [state, setState] = useState<ProgressState | null>(() =>
    typeof window === "undefined" ? null : loadProgress()
  );
  const [hydrated] = useState(() => typeof window !== "undefined");

  useEffect(() => {
    if (!hydrated || !state) return;
    saveProgress(state);
  }, [state, hydrated]);

  const update = useCallback((fn: (s: ProgressState) => ProgressState) => {
    setState((prev) => {
      const base = prev ?? createDefaultProgress();
      return fn(base);
    });
  }, []);

  const ensureWord = useCallback((s: ProgressState, wordId: string) => {
    if (s.words[wordId]) return s;
    return {
      ...s,
      words: { ...s.words, [wordId]: createWordProgress(wordId) },
    };
  }, []);

  const addXp = useCallback(
    (amount: number) => {
      update((s) => {
        const touched = touchActivity(s);
        return {
          ...touched,
          totalXp: touched.totalXp + amount,
          daily: { ...touched.daily, xp: touched.daily.xp + amount },
        };
      });
    },
    [update]
  );

  const recordLessonWord = useCallback(
    (wordId: string) => {
      update((s) => {
        let next = touchActivity(ensureWord(s, wordId));
        const prev = next.words[wordId];
        const wasLearned = prev.learned;
        const wp = markLearned(prev);
        next = {
          ...next,
          words: { ...next.words, [wordId]: wp },
          daily: {
            ...next.daily,
            wordsLearned: next.daily.wordsLearned + (wasLearned ? 0 : 1),
            xp: next.daily.xp + 5,
          },
          totalXp: next.totalXp + 5,
        };
        return next;
      });
    },
    [ensureWord, update]
  );

  const recordAnswer = useCallback(
    (wordId: string, correct: boolean, xp = 10) => {
      update((s) => {
        let next = touchActivity(ensureWord(s, wordId));
        const wp = { ...next.words[wordId] };
        wp.seen += 1;
        if (correct) {
          wp.correct += 1;
          wp.mastery = Math.min(100, wp.mastery + 5);
          next = {
            ...next,
            words: { ...next.words, [wordId]: wp },
            totalXp: next.totalXp + xp,
            daily: { ...next.daily, xp: next.daily.xp + xp },
          };
        } else {
          wp.mastery = Math.max(0, wp.mastery - 3);
          next = { ...next, words: { ...next.words, [wordId]: wp } };
        }
        return next;
      });
    },
    [ensureWord, update]
  );

  const recordReview = useCallback(
    (wordId: string, grade: SRSGrade) => {
      update((s) => {
        let next = touchActivity(ensureWord(s, wordId));
        const wp = applyGrade(next.words[wordId], grade);
        const xp = grade === "again" ? 2 : grade === "hard" ? 6 : grade === "good" ? 10 : 14;
        next = {
          ...next,
          words: { ...next.words, [wordId]: wp },
          totalXp: next.totalXp + xp,
          daily: {
            ...next.daily,
            xp: next.daily.xp + xp,
            reviewsCompleted: next.daily.reviewsCompleted + 1,
          },
        };
        return next;
      });
    },
    [ensureWord, update]
  );

  const completeLesson = useCallback(
    (lessonId: string, opts?: { practice?: boolean }) => {
      update((s) => {
        const next = touchActivity(s);
        const practice = opts?.practice === true;

        if (practice) {
          // Practice: no unlock progression, no lesson-complete XP bonus
          return next;
        }

        const alreadyCompleted = next.completedLessons.includes(lessonId);

        const idx = lessons.findIndex((l) => l.id === lessonId);
        const unlocked = new Set(next.unlockedLessons);
        unlocked.add(lessonId);
        if (idx >= 0 && idx + 1 < lessons.length) {
          unlocked.add(lessons[idx + 1].id);
        }
        const unlockedLessons = Array.from(unlocked);

        // Harden: replaying an already-completed lesson (even without
        // practice=1) must not grant another +20 XP / lessonsCompleted bump.
        if (alreadyCompleted) {
          return { ...next, unlockedLessons };
        }

        return {
          ...next,
          completedLessons: [...next.completedLessons, lessonId],
          unlockedLessons,
          daily: {
            ...next.daily,
            lessonsCompleted: next.daily.lessonsCompleted + 1,
            xp: next.daily.xp + 20,
          },
          totalXp: next.totalXp + 20,
        };
      });
    },
    [update]
  );

  const setDailyGoal = useCallback(
    (goal: number) => {
      update((s) => ({ ...s, dailyGoal: Math.max(10, Math.min(500, goal)) }));
    },
    [update]
  );

  const setTheme = useCallback(
    (theme: ThemeMode) => {
      update((s) => ({ ...s, theme }));
    },
    [update]
  );

  const setTipDismissed = useCallback(
    (dismissed: boolean) => {
      update((s) => ({ ...s, tipDismissed: dismissed }));
    },
    [update]
  );

  const resetAll = useCallback(() => {
    setState((prev) => resetStored(prev?.theme));
  }, []);

  /** Import progress; keep current theme by default so import does not surprise-flip UI. */
  const importProgress = useCallback(
    (data: unknown, options?: { keepTheme?: boolean }) => {
      const keep =
        options?.keepTheme === false
          ? undefined
          : state?.theme ?? undefined;
      const parsed = parseProgressImport(data, keep);
      if (!parsed) return false;
      setState(parsed);
      saveProgress(parsed);
      return true;
    },
    [state?.theme]
  );

  const exportProgress = useCallback((): ProgressState | null => {
    return state;
  }, [state]);

  const dueWordIds = useMemo(() => {
    if (!state) return [];
    const today = todayKey();
    return Object.values(state.words)
      .filter((w) => isDue(w, today))
      .map((w) => w.wordId);
  }, [state]);

  const learnedCount = useMemo(() => {
    if (!state) return 0;
    return Object.values(state.words).filter((w) => w.learned).length;
  }, [state]);

  return {
    state,
    hydrated,
    dueWordIds,
    learnedCount,
    addXp,
    recordLessonWord,
    recordAnswer,
    recordReview,
    completeLesson,
    setDailyGoal,
    setTheme,
    setTipDismissed,
    resetAll,
    importProgress,
    exportProgress,
  };
}
