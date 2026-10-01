import { describe, expect, it } from "vitest";
import { createDefaultProgress, parseProgressImport } from "./storage";

describe("parseProgressImport", () => {
  it("accepts a valid progress object", () => {
    const valid = createDefaultProgress();
    valid.totalXp = 120;
    valid.streak = 3;
    valid.tipDismissed = true;
    const parsed = parseProgressImport(valid);
    expect(parsed).not.toBeNull();
    expect(parsed!.version).toBe(1);
    expect(parsed!.totalXp).toBe(120);
    expect(parsed!.streak).toBe(3);
    expect(parsed!.tipDismissed).toBe(true);
  });

  it("accepts JSON-shaped plain objects with required fields", () => {
    const raw = {
      version: 1,
      totalXp: 10,
      dailyGoal: 50,
      words: {},
      completedLessons: [],
      unlockedLessons: ["greetings"],
      tipDismissed: false,
    };
    const parsed = parseProgressImport(raw);
    expect(parsed).not.toBeNull();
    expect(parsed!.totalXp).toBe(10);
  });

  it("rejects null, non-objects, and garbage", () => {
    expect(parseProgressImport(null)).toBeNull();
    expect(parseProgressImport(undefined)).toBeNull();
    expect(parseProgressImport("not-json-object")).toBeNull();
    expect(parseProgressImport(42)).toBeNull();
    expect(parseProgressImport([])).toBeNull();
    expect(parseProgressImport({ version: 2, totalXp: 1, dailyGoal: 50, words: {}, completedLessons: [], unlockedLessons: [] })).toBeNull();
    expect(parseProgressImport({ version: 1 })).toBeNull();
    expect(parseProgressImport({ version: 1, totalXp: 1, dailyGoal: 50, words: "bad", completedLessons: [], unlockedLessons: [] })).toBeNull();
  });

  it("keeps theme override when requested", () => {
    const valid = { ...createDefaultProgress(), theme: "dark" as const };
    const parsed = parseProgressImport(valid, "light");
    expect(parsed!.theme).toBe("light");
  });
});
