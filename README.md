# Daily English · 每日英语

A polished, mobile-first daily English learning web app for Chinese learners.
面向中文用户的每日英语学习网页应用：短课、XP / 连续打卡、间隔复习与词库。

Inspired by the ideas behind Duolingo (streaks and XP), Anki (SRS), and Memrise (vocab in context) — with an original UI (no cloned branding).

---

## Features · 功能

- **Today / 今日**: daily XP goal, streak, start lesson, due review count; dismissible first-time tip strip
- **Learn / 学习**: word intro (EN + IPA + CN + example), MC EN↔CN, fill-in-blank, type English
- **Pronunciation / 发音**: Web Speech API (en-US) SpeakButton on intros, MC prompts, type feedback, and word bank
- **Wrong-answer feedback**: show correct answer + require Continue before advancing; optional missed-word redo round
- **Practice / 练习**: redo completed lessons (?practice=1) — no unlock / lesson-complete XP bonus
- **Review / 复习**: SM-2–like Again / Hard / Good / Easy scheduling
- **Keyboard shortcuts**: MC 1–4 / A–D; SRS 1–4 (skipped while typing)
- **Words / 词库**: learned words, mastery bars, search, expandable detail + TTS
- **Settings / 设置**: daily goal, light / dark / system theme, export / import progress JSON, reset
- **Nav**: due-review badge count
- **Data / 数据**: ~78 seeded words across 7 themed lessons
- **Privacy**: progress in localStorage only — no auth

Out of scope: auth, payments, social, AI tutors, speech recognition (TTS only).

---

## Tech · 技术栈

- Next.js App Router + TypeScript + Tailwind CSS
- Client-side progress (localStorage)
- Seed data only (no paid APIs); pronunciation via browser Web Speech API

```
src/
  app/           # pages: /, /learn, /review, /words, /settings
  components/    # UI + exercise widgets (SpeakButton, etc.)
  data/lessons   # themed seed vocabulary
  hooks/         # progress + providers
  lib/           # SRS, storage, exercises, types
```

---

## Run · 运行

```bash
cd learn-english
npm install
npm run dev
```

Open http://localhost:3000

Other scripts:

```bash
npm run build
npm run start
npm run lint
npm test
```

Bun also works (`bun install` / `bun run dev`) if you prefer.

---

## Deploy · 线上

生产环境已公开部署（Deployment Protection 已关闭）：

**https://learn-english-ruby-nu.vercel.app**

备用别名：https://learn-english-calmejacks-projects.vercel.app

GitHub 仓库 `calmejack/learn-english` 已关联 Vercel 项目 `learn-english`。若访问仍提示登录 Vercel，请确认项目的 Deployment Protection 已关闭。

## Lessons · 课程主题

1. Greetings & Basics · 问候与基础
2. Food & Drink · 饮食
3. Travel · 旅行
4. Work & Study · 工作与学习
5. Daily Life · 日常生活
6. Feelings & People · 情感与人际
7. Nature & Places · 自然与地点

Complete a lesson to unlock the next. Completed lessons stay open for Practice. Reviews use due dates from the SRS scheduler.

---

## Future ideas · 后续想法

- More lesson packs / CEFR levels
- Optional PWA offline install
- Grammar mini-tips tied to example sentences
- Recorded native audio clips (beyond browser TTS)
- Optional cloud sync (still privacy-first)

---

## Dates & timezone · 日期时区

Streak and daily XP keys use the **browser local calendar** (`YYYY-MM-DD` via `todayKey()`), not UTC midnight. On a device set to **Asia/Shanghai**, the day rolls over at local midnight (UTC+8). Keep the device timezone correct for accurate streaks.

Typed / fill-blank answers are matched case-insensitively after trimming, smart-quote normalization, trailing punctuation strip, and optional leading *a/an/the* for single-word answers.

---

## License

MIT — build freely, keep learning daily.
