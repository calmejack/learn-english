import { describe, expect, it } from "vitest";
import { applyGrade, createWordProgress, todayKey } from "./srs";

describe("todayKey", () => {
  it("formats as YYYY-MM-DD", () => {
    expect(todayKey(new Date(2026, 9, 1))).toBe("2026-10-01");
    expect(todayKey(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(todayKey(new Date(2025, 11, 31))).toBe("2025-12-31");
  });
});

describe("applyGrade", () => {
  const base = () => createWordProgress("w1");

  it("again resets interval/repetitions and lowers mastery", () => {
    const started = {
      ...base(),
      interval: 3,
      repetitions: 2,
      mastery: 40,
      ease: 2.5,
      learned: true,
    };
    const next = applyGrade(started, "again");
    expect(next.interval).toBe(0);
    expect(next.repetitions).toBe(0);
    expect(next.mastery).toBe(25);
    expect(next.ease).toBeCloseTo(2.3);
    expect(next.due).toBe(todayKey());
    expect(next.seen).toBe(started.seen + 1);
    expect(next.correct).toBe(started.correct);
  });

  it("hard sets short interval and bumps mastery", () => {
    const next = applyGrade(base(), "hard");
    expect(next.interval).toBe(1);
    expect(next.repetitions).toBe(1);
    expect(next.mastery).toBe(8);
    expect(next.ease).toBeLessThan(2.5);
    expect(next.learned).toBe(true);
    expect(next.correct).toBe(1);
    expect(next.due).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("good uses standard first intervals", () => {
    const first = applyGrade(base(), "good");
    expect(first.interval).toBe(1);
    expect(first.repetitions).toBe(1);
    expect(first.mastery).toBe(15);

    const second = applyGrade(first, "good");
    expect(second.interval).toBe(3);
    expect(second.repetitions).toBe(2);
    expect(second.mastery).toBe(30);
  });

  it("easy lengthens interval and raises ease/mastery", () => {
    const next = applyGrade(base(), "easy");
    expect(next.interval).toBe(2);
    expect(next.repetitions).toBe(1);
    expect(next.mastery).toBe(22);
    expect(next.ease).toBeGreaterThan(2.5);
    expect(next.learned).toBe(true);
  });
});
