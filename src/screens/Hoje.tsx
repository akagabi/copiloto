import { useState } from "react";
import { Card, Row, SectionTitle } from "../components/ui";
import { upsert, patch, insert } from "../lib/api";
import { CORE, DIAS, MESES, today, weekStart } from "../lib/util";
import type { CalEvent, DayItem, Mission } from "../lib/data";

const BLOCKS: [string, string, number, number][] = [
  ["manha", "🌅 Manhã", 6, 12], ["tarde", "☀️ Tarde", 12, 18], ["noite", "🌙 Noite", 18, 24],
];
const NOMINAL: Record<string, string> = { manha: "08:00", tarde: "15:00", noite: "21:30" };
const BORDER: Record<string, string> = {
  treino: "border-l-amber-500", sono: "border-l-sky-500", nutricao: "border-l-emerald-500",
  mente: "border-l-violet-500", saude: "border-l-rose-500", corpo: "border-l-emerald-500",
  evento: "border-l-rose-500", vida: "border-l-violet-500",
};

type Entry = {
  id: string; kind: "missao" | "item" | "evento" | "semanal";
  label: string; note?: string | null; time: string | null; showTime: boolean;
  block: string; done: boolean; domain: string; old?: boolean; raw?: any;
};

function blockOf(hm?: string | null) {
  const h = hm ? parseInt(hm.slice(0, 2), 10) : new Date().getHours();
  for (const [k, , a, b] of BLOCKS) if (h >= a && h < b) return k;
  return h < 6 ? "manha" : "noite";
}
function dayLabel(m: Mission, d: string) {
  if (m.key !== "tre" || !m.meta?.day_labels) return m.label;
  return m.meta.day_labels[String(new Date(d + "T12:00:00").getDay())] || m.label;
}

export default function Hoje({ st, reload }: { st: any; reload: () => void }) {
  const [text, setText] = useState("");
  const [date, setDate] = useState(today());
  const [busy, setBusy] = useState("");
  const t = today();

  const entries: Entry[] = [];
  st.events.forEach((e: CalEvent) => {
    const hm = e.start_ts ? new Date(e.start_ts).toTimeString().slice(0, 5) : null;
    entries.push({ id: `ev${e.id}`, kind: "evento", label: e.title, time: hm, showTime: !!hm,
      block: hm ? blockOf(hm) : "manha", done: false, domain: "evento" });
  });
  st.missions.filter((m: Mission) => m.kind === "daily").forEach((m: Mission) => {
    entries.push({ id: m.key, kind: "missao", label: dayLabel(m, t), note: m.note,
      time: m.time_hint || NOMINAL[m.anchor] || "15:00", showTime: !!m.time_hint,
      block: m.anchor || "tarde", done: !!st.daily[`${t}|${m.key}`], domain: m.domain, raw: m });
  });
  st.items.forEach((it: DayItem) => {
    entries.push({ id: `di${it.id}`, kind: "item", label: it.text, time: null, showTime: false,
      block: blockOf(), done: it.done, domain: "vida", old: it.date < t, raw: it });
  });

  const now = new Date().getHours() * 60 + new Date().getMinutes();
  const pend = entries.filter((e) => !e.done).map((e) => ({
    ...e, min: e.time ? +e.time.slice(0, 2) * 60 + +e.time.slice(3) : null }));
  const timed = pend.filter((e) => e.min !== null).sort((a, b) => a.min! - b.min!);
  let cur = null as any;
  for (const e of timed) { if (e.min! <= now) cur = e; else break; }
  if (!cur) cur = pend.find((e) => e.min === null) || timed[0];
  const next = timed.find((e) => e !== cur && e.min! > now);
  const eta = next ? next.min! - now : 0;

  async function toggleDaily(m: Mission, done: boolean) {
    setBusy(m.key);
    st.daily[`${t}|${m.key}`] = !done; reload();
    try {
      await upsert("daily_checks", "date,mission_key",
        { date: t, mission_key: m.key, done: !done, updated_at: new Date().toISOString() });
      if (m.key === "cre") {
        const inv = st.inventory.find((i: any) => i.key === "creatina");
        if (inv?.status === "tenho" && inv.qty != null && inv.daily_burn) {
          inv.qty = Math.max(0, inv.qty + (!done ? -inv.daily_burn : inv.daily_burn));
          patch(`inventory?key=eq.creatina`, { qty: inv.qty }).catch(() => {});
        }
      }
    } catch { st.daily[`${t}|${m.key}`] = done; reload(); }
    setBusy("");
  }
  async function toggleItem(it: DayItem) {
    it.done = !it.done; reload();
    try { await patch(`day_items?id=eq.${it.id}`, { done: it.done }); }
    catch { it.done = !it.done; reload(); }
  }
  async function toggleWeekly(m: Mission) {
    const v = !st.weekly[m.key]; st.weekly[m.key] = v; reload();
    try { await upsert("weekly_checks", "week_start,mission_key",
      { week_start: weekStart(t), mission_key: m.key, done: v, updated_at: new Date().toISOString() }); }
    catch { st.weekly[m.key] = !v; reload(); }
  }
  async function add() {
    const v = text.trim(); if (!v) return;
    setText("");
    try {
      const rows = await insert("day_items", { date, text: v });
      if (date <= t) { st.items.push(rows[0]); reload(); }
    } catch { /* ignore */ }
  }

  const d = new Date();
  const wins = entries.filter((e) => e.done).length +
    st.missions.filter((m: Mission) => m.kind === "weekly" && st.weekly[m.key]).length;
  const start = new Date("2026-08-20T12:00:00");
  const win = Math.min(30, Math.max(3, Math.round((Date.now() - +start) / 86400000) + 1));
  let hits = 0;
  for (let i = 0; i < win; i++) {
    const dd = new Date(); dd.setDate(dd.getDate() - i);
    const ds = new Date(dd.getTime() - dd.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    CORE.forEach((k) => { if (st.daily[`${ds}|${k}`]) hits++; });
  }
  const consist = Math.round((100 * hits) / (CORE.length * win));

  return (
    <>
      <header className="flex items-center justify-between px-1 pb-3 pt-0.5">
        <div>
          <div className="font-display text-xl font-bold capitalize">{DIAS[d.getDay()]}</div>
          <div className="text-[11px] font-semibold tracking-wide text-muted">
            {d.getDate()} de {MESES[d.getMonth()]}
          </div>
        </div>
        <div className="flex gap-1.5">
          <span className="rounded-full border border-border bg-card px-2.5 py-1.5 font-display text-[11.5px] font-bold text-fg2">
            🏆 <b className="text-emerald-500">{wins}</b> hoje
          </span>
          <span className="rounded-full border border-border bg-card px-2.5 py-1.5 font-display text-[11.5px] font-bold text-fg2">
            consist. <b className="text-emerald-500">{consist}%</b>
          </span>
        </div>
      </header>

      <Card glow className="px-4.5 py-4">
        <div className="font-display text-[10.5px] font-bold tracking-[0.14em] text-primary">AGORA</div>
        <div className="mt-0.5 text-[19px] font-bold">{cur ? cur.label : "Tudo em dia 🙌"}</div>
        {next && (
          <div className="mt-2.5 flex items-baseline justify-between border-t border-dashed border-border pt-2.5 text-[13.5px] text-fg2">
            <span>depois: {next.label}</span>
            <span className="font-display text-xs font-semibold text-muted">
              {eta >= 60 ? `em ${Math.floor(eta / 60)}h${String(eta % 60).padStart(2, "0")}` : `em ${eta} min`}
            </span>
          </div>
        )}
      </Card>

      <div className="mt-3.5 flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()} placeholder="+ adicionar ao dia…"
          className="min-w-0 flex-1 rounded-2xl border border-border bg-card px-3.5 py-3 text-[15px] outline-none placeholder:text-muted focus:border-primary" />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="w-[46px] rounded-2xl border border-border bg-card px-1 text-[11px] text-muted outline-none" />
        <button onClick={add} className="rounded-2xl bg-primary px-5 text-[22px] font-bold text-white active:scale-95">+</button>
      </div>

      {BLOCKS.map(([bk, bname]) => {
        const list = entries.filter((e) => e.block === bk)
          .sort((a, b) => ((a.time || "99") < (b.time || "99") ? -1 : 1));
        if (!list.length) return null;
        const isNow = bk === blockOf();
        return (
          <Card key={bk} glow={isNow} className="mt-4 pb-2">
            <div className="flex items-baseline justify-between px-1 pb-2.5">
              <span className="font-display text-sm font-bold">{bname}</span>
              {isNow && <span className="font-display text-[10px] font-bold tracking-[0.1em] text-primary">· AGORA</span>}
            </div>
            {list.map((e) => (
              <Row key={e.id} done={e.done} color={BORDER[e.domain]}
                title={e.kind === "evento" ? <b>📌 {e.label}</b> : e.label}
                sub={e.kind === "evento" ? "compromisso de hoje" : e.old ? "veio de outro dia" : e.note}
                right={e.showTime ? e.time : undefined}
                dim={busy === e.id}
                onClick={e.kind === "evento" ? undefined : () =>
                  e.kind === "missao" ? toggleDaily(e.raw, e.done) : toggleItem(e.raw)} />
            ))}
          </Card>
        );
      })}

      <SectionTitle>Da semana</SectionTitle>
      {st.missions.filter((m: Mission) => m.kind === "weekly").map((m: Mission) => (
        <Row key={m.key} done={!!st.weekly[m.key]} color={BORDER[m.domain]} title={m.label}
          onClick={() => toggleWeekly(m)} />
      ))}
    </>
  );
}
