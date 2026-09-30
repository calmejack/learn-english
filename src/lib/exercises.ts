import { getWordById, words } from "@/data/lessons";
import type { Exercise, Word } from "./types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDistractors(word: Word, field: "en" | "cn", count = 3): string[] {
  const pool = words
    .filter((w) => w.id !== word.id && w[field] !== word[field])
    .map((w) => w[field]);
  return shuffle(pool).slice(0, count);
}

function blankExample(word: Word): { prompt: string; answer: string } {
  const en = word.en;
  const lower = word.example.toLowerCase();
  const idx = lower.indexOf(en.toLowerCase());
  if (idx === -1) {
    return {
      prompt: `___ means "${word.cn}".`,
      answer: en,
    };
  }
  const before = word.example.slice(0, idx);
  const after = word.example.slice(idx + en.length);
  return {
    prompt: `${before}___${after}`,
    answer: en,
  };
}

export function buildLessonExercises(wordIds: string[]): Exercise[] {
  const exercises: Exercise[] = [];
  for (const id of wordIds) {
    const word = getWordById(id);
    if (!word) continue;

    exercises.push({
      type: "intro",
      wordId: id,
      answer: word.en,
    });

    const cnOptions = shuffle([word.cn, ...pickDistractors(word, "cn")]);
    exercises.push({
      type: "mc-en-cn",
      wordId: id,
      options: cnOptions,
      answer: word.cn,
    });

    const enOptions = shuffle([word.en, ...pickDistractors(word, "en")]);
    exercises.push({
      type: "mc-cn-en",
      wordId: id,
      options: enOptions,
      answer: word.en,
    });
  }

  const typed = shuffle(wordIds);
  for (const id of typed) {
    const word = getWordById(id);
    if (!word) continue;
    const { prompt, answer } = blankExample(word);
    exercises.push({
      type: "fill-blank",
      wordId: id,
      prompt,
      answer,
    });
    exercises.push({
      type: "type-en",
      wordId: id,
      answer: word.en,
    });
  }

  return exercises;
}

export function buildReviewQueue(wordIds: string[]): Exercise[] {
  const out: Exercise[] = [];
  for (const id of shuffle(wordIds)) {
    const word = getWordById(id);
    if (!word) continue;
    const roll = Math.random();
    if (roll < 0.34) {
      out.push({
        type: "mc-en-cn",
        wordId: id,
        options: shuffle([word.cn, ...pickDistractors(word, "cn")]),
        answer: word.cn,
      });
    } else if (roll < 0.67) {
      const { prompt, answer } = blankExample(word);
      out.push({ type: "fill-blank", wordId: id, prompt, answer });
    } else {
      out.push({ type: "type-en", wordId: id, answer: word.en });
    }
  }
  return out;
}

/**
 * Normalize typed answers for comparison:
 * trim, lowercase, collapse whitespace, straighten smart quotes,
 * strip trailing punctuation.
 */
export function normalizeAnswer(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[.,!?;:…]+$/g, "")
    .replace(/^["']+|["']+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripLeadingArticle(s: string): string {
  return s.replace(/^(a|an|the)\s+/i, "").trim();
}

/** True if strings match after normalization; optional a/an/the for single-word answers. */
export function answersMatch(input: string, expected: string): boolean {
  const a = normalizeAnswer(input);
  const b = normalizeAnswer(expected);
  if (a === b) return true;

  // Optional leading article when the expected answer is a single token
  if (!b.includes(" ")) {
    if (stripLeadingArticle(a) === b) return true;
  }
  if (!a.includes(" ")) {
    if (a === stripLeadingArticle(b)) return true;
  }
  return false;
}

/** One quick MC or type exercise per missed word (for 错题重练). */
export function buildMissedRedoExercises(wordIds: string[]): Exercise[] {
  const unique = Array.from(new Set(wordIds));
  const out: Exercise[] = [];
  for (const id of unique) {
    const word = getWordById(id);
    if (!word) continue;
    if (Math.random() < 0.5) {
      out.push({
        type: "mc-en-cn",
        wordId: id,
        options: shuffle([word.cn, ...pickDistractors(word, "cn")]),
        answer: word.cn,
      });
    } else {
      out.push({
        type: "type-en",
        wordId: id,
        answer: word.en,
      });
    }
  }
  return shuffle(out);
}
