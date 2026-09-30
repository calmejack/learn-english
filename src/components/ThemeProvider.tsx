"use client";

import { useEffect } from "react";
import { useProgressContext } from "@/hooks/ProgressProvider";
import type { ThemeMode } from "@/lib/types";

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  const preferDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = theme === "dark" || (theme === "system" && preferDark);
  root.classList.toggle("dark", dark);
  root.dataset.theme = theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { state, hydrated } = useProgressContext();

  useEffect(() => {
    if (!hydrated || !state) return;
    applyTheme(state.theme);

    if (state.theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [hydrated, state?.theme, state]);

  return <>{children}</>;
}
