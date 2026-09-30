"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { cancelSpeech } from "@/lib/speak";

function canSpeak(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function SpeakButton({
  text,
  label = "朗读",
  className = "",
  size = "md",
}: {
  text: string;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const [supported] = useState(() => typeof window !== "undefined" && canSpeak());
  const [speaking, setSpeaking] = useState(false);
  const skipTextCancel = useRef(true);

  // Cleanup on unmount only — no setState
  useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, []);

  // Cancel when the spoken text changes (not on initial mount) — no setState
  useEffect(() => {
    if (skipTextCancel.current) {
      skipTextCancel.current = false;
      return;
    }
    cancelSpeech();
  }, [text]);

  const speak = useCallback(
    (e?: MouseEvent) => {
      e?.stopPropagation();
      e?.preventDefault();
      if (!canSpeak() || !text.trim()) return;
      try {
        cancelSpeech();
        const u = new SpeechSynthesisUtterance(text.trim());
        u.lang = "en-US";
        u.rate = 0.95;
        u.onstart = () => setSpeaking(true);
        u.onend = () => setSpeaking(false);
        u.onerror = () => setSpeaking(false);
        window.speechSynthesis.speak(u);
      } catch {
        setSpeaking(false);
      }
    },
    [text]
  );

  if (!supported) return null;

  const pad = size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-base";

  return (
    <button
      type="button"
      onClick={speak}
      aria-label={`${label}: ${text}`}
      title={label}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-teal-200 bg-teal-50 text-teal-700 transition hover:bg-teal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300 dark:hover:bg-teal-900 ${pad} ${speaking ? "animate-pulse ring-2 ring-teal-400/50" : ""} ${className}`}
    >
      <span aria-hidden>{speaking ? "🔊" : "🔈"}</span>
    </button>
  );
}
