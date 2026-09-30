"use client";

import { useRef, useState } from "react";
import { useProgressContext } from "@/hooks/ProgressProvider";
import type { ThemeMode } from "@/lib/types";
import { FeedbackToast } from "@/components/FeedbackToast";

const themes: { id: ThemeMode; label: string; labelEn: string }[] = [
  { id: "light", label: "浅色", labelEn: "Light" },
  { id: "dark", label: "深色", labelEn: "Dark" },
  { id: "system", label: "跟随系统", labelEn: "System" },
];

const LAST_EXPORT_KEY = "learn-english-last-export";

function formatExportHint(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    // Local calendar formatting for the device timezone (Asia/Shanghai when set)
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function SettingsPage() {
  const {
    state,
    hydrated,
    setDailyGoal,
    setTheme,
    resetAll,
    importProgress,
    exportProgress,
  } = useProgressContext();
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmImport, setConfirmImport] = useState(false);
  const [pendingImport, setPendingImport] = useState<unknown>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<{ correct: boolean; msg: string } | null>(null);
  const [lastExport, setLastExport] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(LAST_EXPORT_KEY);
    } catch {
      return null;
    }
  });
  const fileRef = useRef<HTMLInputElement>(null);

  if (!hydrated || !state) {
    return <div className="flex flex-1 items-center justify-center text-slate-500">加载中…</div>;
  }

  const showToast = (correct: boolean, msg: string) => {
    setToast({ correct, msg });
    window.setTimeout(() => setToast(null), 2200);
  };

  const handleExport = () => {
    const data = exportProgress();
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `learn-english-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    const now = new Date().toISOString();
    try {
      localStorage.setItem(LAST_EXPORT_KEY, now);
    } catch {
      // ignore
    }
    setLastExport(now);
    showToast(true, "已导出进度 JSON");
  };

  const onFileChosen = async (file: File | null) => {
    if (!file) return;
    setImportMsg(null);
    try {
      const text = await file.text();
      const json = JSON.parse(text) as unknown;
      setPendingImport(json);
      setConfirmImport(true);
    } catch {
      setImportMsg("无法读取文件：请选择有效的 JSON 进度导出。");
      setPendingImport(null);
      setConfirmImport(false);
      showToast(false, "导入失败：无效 JSON");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const applyImport = () => {
    if (!pendingImport) return;
    const ok = importProgress(pendingImport, { keepTheme: true });
    setConfirmImport(false);
    setPendingImport(null);
    if (ok) {
      setImportMsg("导入成功（已保留当前主题）。");
      showToast(true, "导入成功");
    } else {
      setImportMsg("导入失败：文件格式无效。");
      showToast(false, "导入失败：格式无效");
    }
  };

  return (
    <main className="flex flex-1 flex-col gap-5">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">设置 Settings</h1>
        <p className="mt-1 text-sm text-slate-500">进度保存在本机浏览器 localStorage</p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          每日 XP 目标
        </h2>
        <p className="mt-1 text-xs text-slate-500">建议 30–100，按你的节奏调整</p>
        <div className="mt-3 flex items-center gap-3">
          <input
            type="range"
            min={20}
            max={200}
            step={10}
            value={state.dailyGoal}
            onChange={(e) => setDailyGoal(Number(e.target.value))}
            className="flex-1 accent-teal-600"
            aria-label="Daily XP goal"
          />
          <input
            type="number"
            min={10}
            max={500}
            value={state.dailyGoal}
            onChange={(e) => setDailyGoal(Number(e.target.value) || 50)}
            className="w-20 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-center dark:border-slate-700 dark:bg-slate-950"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">主题 Theme</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {themes.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              className={`min-h-[3.5rem] rounded-2xl border-2 px-2 py-3 text-center text-sm font-medium transition ${
                state.theme === t.id
                  ? "border-teal-500 bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
              }`}
            >
              <div>{t.label}</div>
              <div className="text-[10px] opacity-70">{t.labelEn}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          进度导出 / 导入
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          导出 JSON 备份；导入会覆盖当前进度（默认保留本机主题）。
        </p>
        {lastExport && (
          <p className="mt-2 text-xs text-slate-500" role="status">
            上次导出：{formatExportHint(lastExport)}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="min-h-[2.75rem] rounded-2xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            导出 JSON
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="min-h-[2.75rem] rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
          >
            选择文件导入…
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => onFileChosen(e.target.files?.[0] ?? null)}
          />
        </div>
        {confirmImport && (
          <div className="mt-3 rounded-2xl border border-amber-300 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/40">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              确认用导入文件覆盖当前进度？此操作不可撤销。
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={applyImport}
                className="min-h-[2.5rem] rounded-2xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white"
              >
                确认覆盖导入
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmImport(false);
                  setPendingImport(null);
                }}
                className="min-h-[2.5rem] rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold dark:border-slate-600"
              >
                取消
              </button>
            </div>
          </div>
        )}
        {importMsg && (
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-300" role="status">
            {importMsg}
          </p>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">数据概览</h2>
        <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-300">
          <li>总 XP：{state.totalXp}</li>
          <li>
            连续打卡：{state.streak} 天（最长 {state.longestStreak}）
          </li>
          <li>已完成课程：{state.completedLessons.length}</li>
          <li>已学单词：{Object.values(state.words).filter((w) => w.learned).length}</li>
        </ul>
        <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
          日期键使用浏览器本地时区的 YYYY-MM-DD（Asia/Shanghai 设备即东八区自然日）。
        </p>
      </section>

      <section className="rounded-3xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/40">
        <h2 className="text-sm font-semibold text-rose-800 dark:text-rose-200">
          重置进度 Reset progress
        </h2>
        <p className="mt-1 text-xs text-rose-700/80 dark:text-rose-300/80">
          清除 streak、XP、单词进度。主题设置会保留。此操作不可撤销。
        </p>
        {!confirmReset ? (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="mt-3 min-h-[2.75rem] rounded-2xl border border-rose-300 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200"
          >
            重置全部进度…
          </button>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                resetAll();
                setConfirmReset(false);
                showToast(true, "进度已重置");
              }}
              className="min-h-[2.75rem] rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              确认重置
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="min-h-[2.75rem] rounded-2xl border border-slate-300 px-4 py-2.5 text-sm font-semibold dark:border-slate-600"
            >
              取消
            </button>
          </div>
        )}
      </section>

      <p className="pb-4 text-center text-xs text-slate-400">
        Daily English · 本地学习 · 无账号
      </p>

      {toast && <FeedbackToast correct={toast.correct} message={toast.msg} />}
    </main>
  );
}
