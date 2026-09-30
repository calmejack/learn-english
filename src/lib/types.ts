export type ThemeMode = "light" | "dark" | "system";

export interface Word {
  id: string;
  en: string;
  ipa?: string;
  cn: string;
  example: string;
  exampleCn: string;
  lessonId: string;
}

export interface Lesson {
  id: string;
  title: string;
  titleCn: string;
  description: string;
  descriptionCn: string;
  icon: string;
  color: string;
  wordIds: string[];
}

export type SRSGrade = "again" | "hard" | "good" | "easy";

export interface WordProgress {
  wordId: string;
  /** SM-2 ease factor, starts at 2.5 */
  ease: number;
  /** Current interval in days */
  interval: number;
  /** Successful repetitions in a row */
  repetitions: number;
  /** Next review due (ISO date string YYYY-MM-DD or full ISO) */
  due: string;
  /** 0–100 mastery estimate */
  mastery: number;
  /** Times seen in lessons/reviews */
  seen: number;
  /** Correct answers */
  correct: number;
  /** Learned (introduced in a lesson) */
  learned: boolean;
  lastReviewed?: string;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  xp: number;
  lessonsCompleted: number;
  reviewsCompleted: number;
  wordsLearned: number;
}

export interface ProgressState {
  version: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  totalXp: number;
  dailyGoal: number; // XP goal
  theme: ThemeMode;
  words: Record<string, WordProgress>;
  completedLessons: string[];
  daily: DailyStats;
  /** Lesson ids unlocked; first is always unlocked */
  unlockedLessons: string[];
}

export type ExerciseType =
  | "intro"
  | "mc-en-cn"
  | "mc-cn-en"
  | "fill-blank"
  | "type-en";

export interface Exercise {
  type: ExerciseType;
  wordId: string;
  /** For fill-blank: the sentence with ___ */
  prompt?: string;
  options?: string[];
  answer: string;
}

export const STORAGE_KEY = "learn-english-progress-v1";
export const DEFAULT_DAILY_GOAL = 50;
