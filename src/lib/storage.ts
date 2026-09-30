import {
  DEFAULT_DAILY_GOAL,
  STORAGE_KEY,
  type DailyStats,
  type ProgressState,
  type ThemeMode,
} from "./types";
import { todayKey } from "./srs";
import { lessons } from "@/data/lessons";

export function emptyDaily(date = todayKey()): DailyStats {
  return {
    date,
    xp: 0,
    lessonsCompleted: 0,
    reviewsCompleted: 0,
    wordsLearned: 0,
  };
}

export function createDefaultProgress(): ProgressState {
  return {
    version: 1,
    streak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    totalXp: 0,
    dailyGoal: DEFAULT_DAILY_GOAL,
    theme: "system",
    words: {},
    completedLessons: [],
    daily: emptyDaily(),
    unlockedLessons: [lessons[0]?.id ?? "greetings"],
  };
}

function rollDailyIfNeeded(state: ProgressState): ProgressState {
  const today = todayKey();
  if (state.daily.date === today) return state;
  return { ...state, daily: emptyDaily(today) };
}

/** Update streak based on last active date vs today */
export function touchActivity(state: ProgressState): ProgressState {
  const today = todayKey();
  const next = rollDailyIfNeeded(state);

  if (next.lastActiveDate === today) return next;

  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return todayKey(d);
  })();

  let streak = next.streak;
  if (next.lastActiveDate === yesterday) {
    streak += 1;
  } else if (next.lastActiveDate !== today) {
    streak = 1;
  }

  return {
    ...next,
    streak,
    longestStreak: Math.max(next.longestStreak, streak),
    lastActiveDate: today,
  };
}

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return createDefaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultProgress();
    const parsed = JSON.parse(raw) as ProgressState;
    if (!parsed || parsed.version !== 1) return createDefaultProgress();
    return rollDailyIfNeeded({
      ...createDefaultProgress(),
      ...parsed,
      words: parsed.words ?? {},
      completedLessons: parsed.completedLessons ?? [],
      unlockedLessons:
        parsed.unlockedLessons?.length
          ? parsed.unlockedLessons
          : [lessons[0]?.id ?? "greetings"],
      daily: parsed.daily ?? emptyDaily(),
    });
  } catch {
    return createDefaultProgress();
  }
}

export function saveProgress(state: ProgressState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

export function resetProgress(keepTheme?: ThemeMode): ProgressState {
  const fresh = createDefaultProgress();
  if (keepTheme) fresh.theme = keepTheme;
  saveProgress(fresh);
  return fresh;
}

const THEMES: ThemeMode[] = ["light", "dark", "system"];

/** Validate and normalize imported ProgressState JSON. Returns null if invalid. */
export function parseProgressImport(
  raw: unknown,
  keepTheme?: ThemeMode
): ProgressState | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Partial<ProgressState>;
  if (p.version !== 1) return null;
  if (typeof p.totalXp !== "number" || typeof p.dailyGoal !== "number") return null;
  if (!p.words || typeof p.words !== "object") return null;
  if (!Array.isArray(p.completedLessons) || !Array.isArray(p.unlockedLessons)) {
    return null;
  }

  const theme: ThemeMode =
    keepTheme ??
    (p.theme && THEMES.includes(p.theme as ThemeMode)
      ? (p.theme as ThemeMode)
      : "system");

  const base = createDefaultProgress();
  const merged: ProgressState = {
    ...base,
    ...p,
    version: 1,
    theme,
    words: p.words as ProgressState["words"],
    completedLessons: p.completedLessons as string[],
    unlockedLessons:
      (p.unlockedLessons as string[])?.length
        ? (p.unlockedLessons as string[])
        : base.unlockedLessons,
    daily:
      p.daily && typeof p.daily === "object" && typeof p.daily.date === "string"
        ? {
            date: p.daily.date,
            xp: Number(p.daily.xp) || 0,
            lessonsCompleted: Number(p.daily.lessonsCompleted) || 0,
            reviewsCompleted: Number(p.daily.reviewsCompleted) || 0,
            wordsLearned: Number(p.daily.wordsLearned) || 0,
          }
        : emptyDaily(),
    streak: Number(p.streak) || 0,
    longestStreak: Number(p.longestStreak) || 0,
    lastActiveDate:
      typeof p.lastActiveDate === "string" || p.lastActiveDate === null
        ? p.lastActiveDate
        : null,
    totalXp: Math.max(0, Number(p.totalXp) || 0),
    dailyGoal: Math.max(10, Math.min(500, Number(p.dailyGoal) || DEFAULT_DAILY_GOAL)),
  };

  return rollDailyIfNeeded(merged);
}
