export function StatCard({
  icon,
  label,
  value,
  sub,
  accent = "teal",
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  accent?: "teal" | "amber" | "violet" | "rose" | "sky";
}) {
  const accents = {
    teal: "from-teal-500/15 to-teal-500/5 border-teal-500/20",
    amber: "from-amber-500/15 to-amber-500/5 border-amber-500/20",
    violet: "from-violet-500/15 to-violet-500/5 border-violet-500/20",
    rose: "from-rose-500/15 to-rose-500/5 border-rose-500/20",
    sky: "from-sky-500/15 to-sky-500/5 border-sky-500/20",
  };

  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br p-3.5 shadow-sm ${accents[accent]} dark:border-white/10`}
    >
      <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
        <span aria-hidden>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        {value}
      </div>
      {sub && (
        <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{sub}</div>
      )}
    </div>
  );
}
