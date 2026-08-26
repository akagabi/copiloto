import { Stat, SectionTitle } from "../components/ui";
import { dm, weekStart, today } from "../lib/util";

export default function Corpo({ body }: { body: any }) {
  if (!body) return <p className="mt-8 text-center text-sm text-muted">carregando…</p>;
  const { health, workouts, score, prs } = body;
  const hd = [...health].reverse();
  const t = today(), ws = weekStart(t);

  const stepsRows = hd.filter((x: any) => x.steps != null);
  const latest = stepsRows[0];
  const prev7 = stepsRows.slice(1, 8);
  const avg = prev7.length ? prev7.reduce((s: number, x: any) => s + x.steps, 0) / prev7.length : null;
  const dPct = avg ? Math.round((100 * (latest.steps - avg)) / avg) : null;

  const wk = workouts.filter((x: any) => x.date >= ws);
  const wkVol = wk.reduce((s: number, x: any) => s + (+x.volume_kg || 0), 0) / 1000;
  const lifts = wk.filter((x: any) => +x.volume_kg > 0).length;
  const fut = wk.filter((x: any) => x.focus === "football").length;

  const wSeries = hd.filter((x: any) => x.weight_kg != null);
  const fSeries = hd.filter((x: any) => x.body_fat_pct != null);
  const lSeries = hd.filter((x: any) => x.lean_mass_kg != null);
  const sc = score[score.length - 1];
  const allVol = workouts.reduce((s: number, x: any) => s + (+x.volume_kg || 0), 0);

  const trend = (arr: any[], f: string) =>
    arr.length > 1 ? +arr[0][f] - +arr[arr.length - 1][f] : null;
  const fmtD = (v: number | null, u: string) =>
    v === null ? undefined : `${v >= 0 ? "▲ +" : "▼ "}${Math.abs(v).toFixed(1)}${u}`;
  const tone = (v: number | null, good: "up" | "down") =>
    v === null ? "flat" : (v >= 0 ? (good === "up" ? "up" : "down") : (good === "up" ? "down" : "up"));

  return (
    <>
      <SectionTitle hint="· teus números, ao vivo">Central</SectionTitle>
      <div className="grid grid-cols-2 gap-2.5">
        <Stat wide accent="text-emerald-500" value={latest ? latest.steps.toLocaleString("pt-BR") : "—"}
          label={`passos · ${latest ? dm(latest.date) : ""}`}
          delta={dPct === null ? undefined : `${dPct >= 0 ? "▲ +" : "▼ "}${Math.abs(dPct)}% vs média 7d`}
          deltaTone={dPct === null ? "flat" : dPct >= 0 ? "up" : "down"} />
        <Stat wide accent="text-amber-500" value={wkVol.toFixed(1)} unit="t" label="volume da semana"
          delta={`${lifts} treino${lifts !== 1 ? "s" : ""}${fut ? ` + ${fut} ⚽` : ""}`} deltaTone="up" />
        <Stat accent="text-rose-500" value={sc?.comp_strength ?? "—"} label="score de força · 1RM ÷ peso"
          delta={sc?.meta?.components?.map((c: any) => `${c.p.slice(0, 4).toLowerCase()} ,${c.x.toFixed(2).slice(2)}`).join(" · ")} />
        <Stat accent="text-sky-500" value={wSeries.length ? (+wSeries[0].weight_kg).toFixed(1) : "—"} unit="kg" label="peso"
          delta={wSeries.length > 1 ? fmtD(trend(wSeries, "weight_kg"), " kg") : "1ª medida — a curva começa aqui"}
          deltaTone={tone(trend(wSeries, "weight_kg"), "down")} />
        {fSeries.length > 0 && (
          <Stat accent="text-rose-500" value={(+fSeries[0].body_fat_pct).toFixed(1)} unit="%" label="gordura corporal"
            delta={fSeries.length > 1 ? fmtD(trend(fSeries, "body_fat_pct"), " pp") : "balança · confirmar no DXA"}
            deltaTone={tone(trend(fSeries, "body_fat_pct"), "down")} />
        )}
        {lSeries.length > 0 && (
          <Stat accent="text-amber-500" value={(+lSeries[0].lean_mass_kg).toFixed(1)} unit="kg" label="massa magra"
            delta={lSeries.length > 1 ? fmtD(trend(lSeries, "lean_mass_kg"), " kg") : "o número que importa"}
            deltaTone={tone(trend(lSeries, "lean_mass_kg"), "up")} />
        )}
        <Stat value={Math.round(allVol / 1000)} unit="t" label="total já levantado" />
        <Stat value={prs.length} label="exercícios com PR" delta="recorde pessoal (1RM estim.)" />
      </div>
      <p className="mt-4 px-1 text-xs text-muted">
        Passos e peso entram sozinhos às 23h55. Treinos sincronizam do Gravl toda madrugada.
      </p>
    </>
  );
}
