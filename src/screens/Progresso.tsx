import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Card, SectionTitle, Stat } from "../components/ui";
import { dm, iso, today, weekStart, cn } from "../lib/util";
import type { Mission } from "../lib/data";

function Tip({ active, payload, label, unit, name }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-border bg-card/95 px-3 py-2 shadow-xl backdrop-blur">
      <div className="font-display text-[10px] font-bold uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className="font-display text-lg font-bold text-fg">
          {typeof payload[0].value === "number" ? payload[0].value.toLocaleString("pt-BR") : payload[0].value}
        </span>
        <span className="text-[11px] font-semibold text-muted">{unit}</span>
      </div>
      <div className="text-[10px] text-muted">{name}</div>
    </div>
  );
}
const CURSOR = { fill: "rgba(127,127,127,0.07)", radius: 8 };

export default function Progresso({ body, st }: { body: any; st: any }) {
  if (!body) return <p className="mt-8 text-center text-sm text-muted">carregando…</p>;
  const { health, workouts, prs } = body;
  const t = today(), ws = weekStart(t);
  const prevWs = iso(new Date(+new Date(ws + "T12:00:00") - 7 * 86400000));

  const inRange = (a: any[], from: string, to?: string) =>
    a.filter((x) => x.date >= from && (!to || x.date < to));
  const vol = (a: any[]) => a.reduce((s, x) => s + (+x.volume_kg || 0), 0) / 1000;
  const lifts = (a: any[]) => a.filter((x) => +x.volume_kg > 0).length;
  const stepsAvg = (a: any[]) => {
    const r = a.filter((x) => x.steps != null);
    return r.length ? Math.round(r.reduce((s, x) => s + x.steps, 0) / r.length) : 0;
  };
  const thisW = inRange(workouts, ws), lastW = inRange(workouts, prevWs, ws);
  const dv = vol(thisW) - vol(lastW);
  const dl = lifts(thisW) - lifts(lastW);
  const sa = stepsAvg(inRange(health, ws)), sl = stepsAvg(inRange(health, prevWs, ws));

  const weeks: Record<string, number> = {};
  workouts.forEach((x: any) => {
    const k = weekStart(x.date);
    weeks[k] = (weeks[k] || 0) + (+x.volume_kg || 0) / 1000;
  });
  const volData = Object.keys(weeks).sort().slice(-8)
    .map((k) => ({ semana: dm(k), t: +weeks[k].toFixed(1), atual: k === ws }));

  const stepsData = health.filter((x: any) => x.steps != null).slice(-14)
    .map((x: any) => ({ dia: dm(x.date), passos: x.steps, hoje: x.date === t }));

  const weightData = health.filter((x: any) => x.weight_kg != null)
    .map((x: any) => ({ dia: dm(x.date), kg: +(+x.weight_kg).toFixed(1) }));

  const days14: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    days14.push(iso(new Date(d.getTime() - d.getTimezoneOffset() * 60000)));
  }
  const DOW = ["D", "S", "T", "Q", "Q", "S", "S"];
  const dailyMissions: Mission[] = st.missions.filter((m: Mission) => m.kind === "daily");

  return (
    <>
      <SectionTitle hint="· vs a anterior">Semana</SectionTitle>
      <div className="grid grid-cols-2 gap-2.5">
        <Stat wide accent="text-amber-500" value={vol(thisW).toFixed(1)} unit="t" label="volume"
          delta={lastW.length ? `${dv >= 0 ? "▲ +" : "▼ "}${Math.abs(dv).toFixed(1)} t vs semana passada` : "1ª semana medida"}
          deltaTone={!lastW.length ? "flat" : dv >= 0 ? "up" : "down"} />
        <Stat accent="text-rose-500" value={lifts(thisW)} label="treinos"
          delta={lastW.length ? `${dl >= 0 ? "▲ +" : "▼ "}${Math.abs(dl)}` : undefined}
          deltaTone={dl >= 0 ? "up" : "down"} />
        <Stat accent="text-emerald-500" value={sa ? (sa / 1000).toFixed(1) : "—"} unit="k" label="passos/dia"
          delta={sl ? `${sa - sl >= 0 ? "▲ +" : "▼ "}${Math.abs((sa - sl) / 1000).toFixed(1)}k` : undefined}
          deltaTone={sa >= sl ? "up" : "down"} />
      </div>

      <SectionTitle hint="· toneladas">Volume por semana</SectionTitle>
      <Card className="px-1 pb-1 pt-3">
        <ResponsiveContainer width="100%" height={170}>
          <BarChart data={volData} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
            <XAxis dataKey="semana" tickLine={false} axisLine={false} fontSize={10} stroke="var(--color-muted)" />
            <YAxis width={26} tickLine={false} axisLine={false} fontSize={10} stroke="var(--color-muted)" />
            <Tooltip cursor={CURSOR} content={<Tip unit="t" name="volume levantado" />} />
            <Bar dataKey="t" radius={[6, 6, 3, 3]} isAnimationActive={false}>
              {volData.map((d, i) => (
                <Cell key={i} fill={d.atual ? "var(--color-amber)" : "var(--color-amber-dim)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <SectionTitle hint="· 14 dias">Passos</SectionTitle>
      <Card className="px-1 pb-1 pt-3">
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={stepsData} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
            <XAxis dataKey="dia" tickLine={false} axisLine={false} fontSize={9.5} stroke="var(--color-muted)"
              interval="preserveStartEnd" />
            <YAxis width={30} tickLine={false} axisLine={false} fontSize={10} stroke="var(--color-muted)"
              tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
            <Tooltip cursor={CURSOR} content={<Tip unit="passos" name="no dia" />} />
            <Bar dataKey="passos" radius={[6, 6, 3, 3]} isAnimationActive={false}>
              {stepsData.map((d: any, i: number) => (
                <Cell key={i} fill={d.hoje ? "var(--color-emerald)" : "var(--color-emerald-dim)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <SectionTitle hint="· tendência">Peso</SectionTitle>
      <Card className="px-1 pb-1 pt-3">
        {weightData.length < 2 ? (
          <p className="px-3 py-6 text-sm text-muted">pesa alguns dias que a curva aparece aqui</p>
        ) : (
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={weightData} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-sky)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--color-sky)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
              <XAxis dataKey="dia" tickLine={false} axisLine={false} fontSize={10} stroke="var(--color-muted)" />
              <YAxis width={34} domain={["dataMin - 1", "dataMax + 1"]} tickLine={false} axisLine={false}
                fontSize={10} stroke="var(--color-muted)" />
              <Tooltip cursor={CURSOR} content={<Tip unit="kg" name="peso corporal" />} />
              <Area isAnimationActive={false} type="monotone" dataKey="kg" stroke="var(--color-sky)" strokeWidth={2.5}
                fill="url(#wg)" dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      <SectionTitle hint="· 14 dias">Hábitos</SectionTitle>
      <Card className="overflow-x-auto">
        <div className="min-w-[420px]">
          <div className="mb-1.5 flex gap-1">
            <span className="w-[130px] flex-none" />
            {days14.map((d) => (
              <span key={d} className="flex-1 text-center font-display text-[9px] text-muted">
                {DOW[new Date(d + "T12:00:00").getDay()]}
              </span>
            ))}
          </div>
          {dailyMissions.map((m) => (
            <div key={m.key} className="mb-1 flex items-center gap-1">
              <span className="w-[130px] flex-none truncate text-xs text-fg2">
                {m.label.replace(/^[^\p{L}]+/u, "").split("(")[0].trim()}
              </span>
              {days14.map((d) => (
                <span key={d} className={cn("h-4 flex-1 rounded",
                  st.daily[`${d}|${m.key}`] ? "bg-emerald-500" : "bg-surface2",
                  d === t && "ring-2 ring-inset ring-primary")} />
              ))}
            </div>
          ))}
        </div>
      </Card>

      <SectionTitle hint="· 1RM estimado">Recordes</SectionTitle>
      {prs.slice(0, 10).map((p: any, i: number) => (
        <div key={i} className="mb-1.5 flex items-baseline gap-2.5 rounded-2xl border border-border bg-card px-3.5 py-2.5">
          <span className="flex-1 text-[13.5px] text-fg2">{p.exercise_name}</span>
          <span className="font-display text-base font-bold">{Math.round(p.value)}
            <span className="text-[11px] font-normal text-muted"> kg</span></span>
          <span className="font-display text-[10.5px] text-muted">{p.achieved_at ? dm(String(p.achieved_at)) : ""}</span>
        </div>
      ))}
      <div className="h-4" />
    </>
  );
}
