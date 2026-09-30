import type { SRSGrade, WordProgress } from "./types";

/**
 * Today's date as YYYY-MM-DD in the *browser local* timezone.
 * Asia/Shanghai users get correct calendar-day rollover when the device TZ is
 * Asia/Shanghai (UTC+8). Streak / daily XP keys use this — not UTC midnight.
 */
export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return todayKey(dt);
}

export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const da = new Date(ay, am - 1, ad).getTime();
  const db = new Date(by, bm - 1, bd).getTime();
  return Math.round((db - da) / (24 * 60 * 60 * 1000));
}

export function createWordProgress(wordId: string): WordProgress {
  return {
    wordId,
    ease: 2.5,
    interval: 0,
    repetitions: 0,
    due: todayKey(),
    mastery: 0,
    seen: 0,
    correct: 0,
    learned: false,
  };
}

/**
 * SM-2 inspired scheduling.
 * again → reset, due today
 * hard → short interval, ease down
 * good → standard SM-2
 * easy → longer interval, ease up
 */
export function applyGrade(progress: WordProgress, grade: SRSGrade): WordProgress {
  const today = todayKey();
  let { ease, interval, repetitions, mastery, correct, seen } = progress;
  seen += 1;

  if (grade === "again") {
    repetitions = 0;
    interval = 0;
    ease = Math.max(1.3, ease - 0.2);
    mastery = Math.max(0, mastery - 15);
    return {
      ...progress,
      ease,
      interval,
      repetitions,
      due: today,
      mastery,
      seen,
      correct,
      lastReviewed: today,
    };
  }

  correct += 1;

  if (grade === "hard") {
    ease = Math.max(1.3, ease - 0.15);
    if (repetitions === 0) interval = 1;
    else interval = Math.max(1, Math.round(interval * 1.2));
    repetitions += 1;
    mastery = Math.min(100, mastery + 8);
  } else if (grade === "good") {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 3;
    else interval = Math.round(interval * ease);
    repetitions += 1;
    mastery = Math.min(100, mastery + 15);
  } else {
    // easy
    ease = Math.min(3.0, ease + 0.15);
    if (repetitions === 0) interval = 2;
    else if (repetitions === 1) interval = 5;
    else interval = Math.round(interval * ease * 1.3);
    repetitions += 1;
    mastery = Math.min(100, mastery + 22);
  }

  return {
    ...progress,
    ease,
    interval,
    repetitions,
    due: addDays(today, Math.max(1, interval)),
    mastery,
    seen,
    correct,
    lastReviewed: today,
    learned: true,
  };
}

/** Mark a word as newly learned after intro in a lesson */
export function markLearned(progress: WordProgress): WordProgress {
  const today = todayKey();
  return {
    ...progress,
    learned: true,
    seen: progress.seen + 1,
    mastery: Math.max(progress.mastery, 20),
    due: addDays(today, 1),
    interval: 1,
    repetitions: Math.max(progress.repetitions, 1),
    lastReviewed: today,
  };
}

export function isDue(progress: WordProgress, today = todayKey()): boolean {
  return progress.learned && progress.due <= today;
}

export function masteryLabel(mastery: number): string {
  if (mastery >= 80) return "精通";
  if (mastery >= 55) return "熟练";
  if (mastery >= 30) return "熟悉";
  if (mastery > 0) return "学习中";
  return "未学";
}

export function masteryLabelEn(mastery: number): string {
  if (mastery >= 80) return "Mastered";
  if (mastery >= 55) return "Strong";
  if (mastery >= 30) return "Familiar";
  if (mastery > 0) return "Learning";
  return "New";
}
