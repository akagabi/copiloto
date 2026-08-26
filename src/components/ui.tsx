import type { ReactNode } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Card({ children, className, glow }: { children: ReactNode; className?: string; glow?: boolean }) {
  return (
    <div className={cn("rounded-3xl border border-border bg-card p-4",
      glow && "border-primary/40 shadow-[0_8px_36px_-24px] shadow-primary", className)}>{children}</div>
  );
}

export function SectionTitle({ children, hint, right }: { children: ReactNode; hint?: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-2.5 mt-7 flex items-baseline justify-between px-1">
      <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.1em] text-fg">
        {children}
        {hint && <span className="ml-2 font-normal normal-case tracking-normal text-muted">{hint}</span>}
      </h2>
      {right}
    </div>
  );
}

export function Stat({ value, unit, label, delta, deltaTone = "flat", accent, wide, spark }: {
  value: ReactNode; unit?: string; label: string; delta?: ReactNode;
  deltaTone?: "up" | "down" | "flat"; accent?: string; wide?: boolean; spark?: ReactNode;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}
      className={cn("relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-card to-card/60 px-4 pb-3.5 pt-4",
        wide && "col-span-2")}>
      {spark && <div className="absolute right-3 top-3 opacity-90">{spark}</div>}
      <div className={cn("font-display text-[34px] font-bold leading-none tracking-tight", accent || "text-fg")}>
        {value}{unit && <span className="text-base font-semibold text-muted"> {unit}</span>}
      </div>
      <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.09em] text-muted">{label}</div>
      {delta && (
        <div className={cn("mt-1 font-display text-[11.5px] font-bold",
          deltaTone === "up" && "text-emerald-500", deltaTone === "down" && "text-primary",
          deltaTone === "flat" && "text-muted")}>{delta}</div>
      )}
    </motion.div>
  );
}

export function Row({ done, accent, title, sub, right, onClick }: {
  done?: boolean; accent?: string; title: ReactNode; sub?: ReactNode; right?: ReactNode; onClick?: () => void;
}) {
  const Comp: any = onClick ? motion.button : motion.div;
  return (
    <Comp {...(onClick ? { onClick, whileTap: { scale: 0.985 }, type: "button" } : {})}
      layout initial={{ opacity: 0 }} animate={{ opacity: done ? 0.5 : 1 }}
      className={cn("mb-2 flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-raise px-3 py-3 text-left",
        "transition-colors hover:border-border")}>
      {accent && <span className={cn("h-8 w-1 flex-none rounded-full", accent)} />}
      {onClick && (
        <span className={cn("relative grid h-7 w-7 flex-none place-items-center rounded-lg border-2 transition-colors",
          done ? "border-emerald-500 bg-emerald-500" : "border-border bg-surface2")}>
          {done && (
            <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <Check className="h-4 w-4 text-bg" strokeWidth={3.5} />
            </motion.span>
          )}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className={cn("block text-[14.5px] leading-snug text-fg", done && "line-through")}>{title}</span>
        {sub && <span className="mt-0.5 block text-[11.5px] leading-snug text-muted">{sub}</span>}
      </span>
      {right && <span className="flex-none font-display text-[11.5px] font-bold text-muted">{right}</span>}
    </Comp>
  );
}
