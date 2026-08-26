import type { ReactNode } from "react";
import { cn } from "../lib/util";

export function Card({ children, className, glow }: { children: ReactNode; className?: string; glow?: boolean }) {
  return (
    <div className={cn(
      "rounded-2xl border bg-card p-4 border-border",
      glow && "border-primary/70 shadow-[0_4px_28px_-14px] shadow-primary",
      className)}>{children}</div>
  );
}

export function SectionTitle({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <h2 className="mt-7 mb-2.5 px-1 font-display text-[13px] font-bold uppercase tracking-[0.08em] text-muted">
      <span className="text-fg">{children}</span>
      {hint && <span className="ml-2 font-normal normal-case tracking-normal text-muted">{hint}</span>}
    </h2>
  );
}

export function Stat({ value, unit, label, delta, deltaTone = "flat", accent, wide, children }: {
  value: ReactNode; unit?: string; label: string; delta?: string;
  deltaTone?: "up" | "down" | "flat"; accent?: string; wide?: boolean; children?: ReactNode;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-border bg-card px-4 pb-3 pt-3.5",
      wide && "col-span-2")}>
      <div className={cn("font-display text-[33px] font-bold leading-none", accent)}>
        {value}{unit && <span className="text-base font-semibold text-muted"> {unit}</span>}
      </div>
      <div className="mt-1.5 text-[10px] uppercase tracking-[0.08em] text-muted">{label}</div>
      {delta && (
        <div className={cn("mt-0.5 font-display text-[11.5px] font-bold",
          deltaTone === "up" && "text-emerald-500", deltaTone === "down" && "text-rose-500",
          deltaTone === "flat" && "text-muted")}>{delta}</div>
      )}
      {children}
    </div>
  );
}

export function Row({ done, color, title, sub, right, onClick, dim }: {
  done?: boolean; color?: string; title: ReactNode; sub?: ReactNode; right?: ReactNode;
  onClick?: () => void; dim?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} disabled={!onClick}
      className={cn("mb-1.5 flex w-full items-center gap-3 rounded-xl border-l-4 bg-raise px-2.5 py-2.5 text-left",
        "transition active:scale-[0.985] disabled:cursor-default",
        color || "border-border", (done || dim) && "opacity-45")}>
      {onClick !== undefined && (
        <span className={cn("relative h-[27px] w-[27px] flex-none rounded-[9px] border-2",
          done ? "border-emerald-500 bg-emerald-500" : "border-border bg-surface2")}>
          {done && <span className="absolute inset-0 flex items-center justify-center text-[15px] font-extrabold text-bg">✓</span>}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className={cn("block text-[14.5px] text-fg", done && "line-through")}>{title}</span>
        {sub && <span className="block text-[11px] text-muted">{sub}</span>}
      </span>
      {right && <span className="flex-none font-display text-[11.5px] font-bold text-muted">{right}</span>}
    </button>
  );
}
