export function FeedbackToast({
  correct,
  message,
}: {
  correct: boolean;
  message?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none fixed inset-x-4 bottom-24 z-50 mx-auto max-w-lg rounded-2xl px-4 py-3 text-center text-sm font-semibold shadow-lg anim-toast-in ${
        correct
          ? "bg-emerald-600 text-white"
          : "bg-rose-600 text-white"
      }`}
    >
      {message ?? (correct ? "正确！+XP" : "再试一次")}
    </div>
  );
}
