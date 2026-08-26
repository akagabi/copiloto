import { motion } from "motion/react";
import { Flame, ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function SmokeFree({ days, best }: { days: number; best: number }) {
  const milestones = [7, 30, 90, 180, 365];
  const next = milestones.find((m) => m > days) ?? 365;
  const prev = [...milestones].reverse().find((m) => m <= days) ?? 0;
  const pct = Math.min(100, Math.round(((days - prev) / (next - prev)) * 100));
  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/12 via-card to-card p-5">
      <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
      <div className="relative flex items-end justify-between">
        <div>
          <div className="flex items-center gap-1.5 font-display text-[10.5px] font-bold uppercase tracking-[0.16em] text-emerald-500">
            <Flame className="h-3.5 w-3.5" /> sem fumar
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="font-display text-[52px] font-bold leading-none tracking-tight text-fg">{days}</motion.span>
            <span className="pb-1 text-lg font-semibold text-muted">dias</span>
          </div>
        </div>
        <div className="pb-1 text-right">
          <div className="font-display text-[11px] font-bold text-muted">recorde</div>
          <div className="font-display text-xl font-bold text-fg2">{best}d</div>
        </div>
      </div>
      <div className="relative mt-4">
        <div className="mb-1.5 flex justify-between font-display text-[10.5px] font-semibold text-muted">
          <span>próxima marca: {next} dias</span>
          <span>faltam {next - days}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface2">
          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-emerald-500/70 to-emerald-500" />
        </div>
      </div>
    </div>
  );
}

export function NowCard({ now, next, eta }: { now: string; next?: string; eta?: number }) {
  return (
    <motion.div layout
      className="relative overflow-hidden rounded-3xl border border-primary/50 bg-gradient-to-br from-primary/10 via-card to-card p-5
                 shadow-[0_10px_40px_-24px] shadow-primary">
      <div className="absolute -left-10 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
      <div className="relative">
        <div className="flex items-center gap-1.5 font-display text-[10.5px] font-bold uppercase tracking-[0.16em] text-primary">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          agora
        </div>
        <motion.div key={now} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 text-[21px] font-bold leading-snug tracking-tight">{now}</motion.div>
        {next && (
          <div className="mt-3.5 flex items-center justify-between border-t border-dashed border-border pt-3 text-[13.5px] text-fg2">
            <span className="flex min-w-0 items-center gap-1.5">
              <ArrowRight className="h-3.5 w-3.5 flex-none text-muted" />
              <span className="truncate">{next}</span>
            </span>
            {eta !== undefined && (
              <span className="ml-2 flex flex-none items-center gap-1 rounded-full bg-surface2 px-2.5 py-1
                               font-display text-[11px] font-bold text-fg2">
                <Clock className="h-3 w-3" />
                {eta >= 60 ? `${Math.floor(eta / 60)}h${String(eta % 60).padStart(2, "0")}` : `${eta} min`}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function Pill({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "emerald" | "primary" }) {
  return (
    <span className={cn("rounded-full border px-2.5 py-1.5 font-display text-[11.5px] font-bold",
      tone === "muted" && "border-border bg-card text-fg2",
      tone === "emerald" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
      tone === "primary" && "border-primary/30 bg-primary/10 text-primary")}>{children}</span>
  );
}
