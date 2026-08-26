import { api } from "./api";
import { today, weekStart, iso } from "./util";

export type Mission = {
  key: string; kind: string; label: string; domain: string; anchor: string;
  time_hint: string | null; note: string | null; recur_months: number | null;
  sort: number; meta: any;
};
export type DayItem = { id: number; date: string; text: string; done: boolean };
export type CalEvent = { id: number; date: string; title: string; start_ts: string | null };
export type InvItem = {
  key: string; name: string; kind: string; status: string; qty: number | null;
  unit: string | null; daily_burn: number | null; price_hint: string | null;
  priority: number; preset_qty: number | null; preset_burn: number | null;
};
export type HealthDay = {
  date: string; steps: number | null; weight_kg: number | null;
  body_fat_pct: number | null; lean_mass_kg: number | null;
};
export type Workout = { date: string; name: string; volume_kg: number | null; focus: string | null };
export type PR = { exercise_name: string; value: number; achieved_at: string };

export async function loadCore() {
  const t = today(), ws = weekStart(t);
  const since = iso(new Date(Date.now() - 40 * 86400000));
  const [missions, dc, wc, oc, items, events, inventory, smoke] = await Promise.all([
    api<Mission[]>("/rest/v1/missions?active=eq.true&order=sort"),
    api<any[]>(`/rest/v1/daily_checks?date=gte.${since}&select=date,mission_key,done`),
    api<any[]>(`/rest/v1/weekly_checks?week_start=eq.${ws}&select=mission_key,done`),
    api<any[]>("/rest/v1/one_time_checks?select=mission_key,done,done_at"),
    api<DayItem[]>(`/rest/v1/day_items?or=(date.eq.${t},and(date.lt.${t},done.is.false))&order=created_at`),
    api<CalEvent[]>(`/rest/v1/calendar_events?date=eq.${t}&order=start_ts`),
    api<InvItem[]>("/rest/v1/inventory?order=sort"),
    api<{ date: string }[]>("/rest/v1/smoke_events?select=date&order=date"),
  ]);
  const dates = smoke.map((s) => s.date).sort();
  const last = dates[dates.length - 1];
  const dayDiff = (a: string, b: string) =>
    Math.round((+new Date(b + "T12:00:00") - +new Date(a + "T12:00:00")) / 86400000);
  const smokeDays = last ? dayDiff(last, today()) : 0;
  let smokeBest = smokeDays;
  for (let i = 1; i < dates.length; i++) smokeBest = Math.max(smokeBest, dayDiff(dates[i - 1], dates[i]) - 1);
  const daily: Record<string, boolean> = {};
  dc.forEach((c) => (daily[`${c.date}|${c.mission_key}`] = c.done));
  const weekly: Record<string, boolean> = {};
  wc.forEach((c) => (weekly[c.mission_key] = c.done));
  const once: Record<string, { done: boolean; done_at: string | null }> = {};
  oc.forEach((c) => (once[c.mission_key] = { done: c.done, done_at: c.done_at }));
  return { missions, daily, weekly, once, items, events, inventory, smokeDays, smokeBest };
}

export async function loadBody() {
  const [health, workouts, score, prs] = await Promise.all([
    api<HealthDay[]>("/rest/v1/health_daily?select=date,steps,weight_kg,body_fat_pct,lean_mass_kg&order=date"),
    api<Workout[]>("/rest/v1/workouts?select=date,name,volume_kg,focus&order=date"),
    api<any[]>("/rest/v1/score_snapshots?select=date,comp_strength,meta&order=date"),
    api<PR[]>("/rest/v1/prs?select=exercise_name,value,achieved_at&kind=eq.e1rm&order=value.desc"),
  ]);
  return { health, workouts, score, prs };
}
