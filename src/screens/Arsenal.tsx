import { Row, SectionTitle } from "../components/ui";
import { patch, upsert } from "../lib/api";
import type { InvItem, Mission } from "../lib/data";

const PRI: Record<number, string> = { 1: "bg-rose-500", 2: "bg-amber-500", 3: "bg-border" };

export default function Arsenal({ st, reload }: { st: any; reload: () => void }) {
  const inv: InvItem[] = st.inventory;
  const bosses: Mission[] = st.missions.filter((m: Mission) => m.kind === "boss");

  const dueAgain = (m: Mission) => {
    const oc = st.once[m.key];
    if (!oc?.done || !m.recur_months || !oc.done_at) return { done: !!oc?.done, note: null as string | null };
    const due = new Date(oc.done_at);
    due.setMonth(due.getMonth() + m.recur_months);
    if (due < new Date()) return { done: false, note: "venceu — hora de repetir" };
    return { done: true, note: `próxima: ${due.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })}` };
  };
  const doneCount = bosses.filter((m) => dueAgain(m).done).length;

  async function acquire(it: InvItem) {
    it.status = "tenho"; it.qty = it.preset_qty; it.daily_burn = it.preset_burn; reload();
    try { await patch(`inventory?key=eq.${it.key}`, { status: "tenho", qty: it.preset_qty,
      daily_burn: it.preset_burn, acquired_at: new Date().toISOString() }); }
    catch { it.status = "preciso"; reload(); }
  }
  async function restock(it: InvItem) {
    const old = it.qty; it.qty = it.preset_qty; reload();
    try { await patch(`inventory?key=eq.${it.key}`, { qty: it.preset_qty, acquired_at: new Date().toISOString() }); }
    catch { it.qty = old; reload(); }
  }
  async function toggleBoss(m: Mission) {
    const cur = st.once[m.key];
    const v = !(cur?.done);
    st.once[m.key] = { done: v, done_at: v ? new Date().toISOString() : null }; reload();
    try { await upsert("one_time_checks", "mission_key",
      { mission_key: m.key, done: v, done_at: v ? new Date().toISOString() : null }); }
    catch { st.once[m.key] = cur; reload(); }
  }

  const sideOf = (it: InvItem) => {
    if (it.status === "preciso") return it.price_hint || "";
    if (it.kind === "consumable" && it.qty != null && it.daily_burn) {
      const days = Math.floor(it.qty / it.daily_burn);
      return days <= 7
        ? <span className="text-rose-500">repor em ~{days}d</span>
        : <span className="text-emerald-500">~{days}d restantes</span>;
    }
    return <span className="text-emerald-500">✓</span>;
  };

  return (
    <>
      <SectionTitle hint="· toca quando conseguir">Preciso</SectionTitle>
      {inv.filter((i) => i.status === "preciso").map((it) => (
        <Row key={it.key} accent={PRI[it.priority] || PRI[2]} title={it.name}
          right={sideOf(it)} onClick={() => acquire(it)} />
      ))}
      <SectionTitle hint="· consumíveis avisam quando repor">Tenho</SectionTitle>
      {inv.filter((i) => i.status === "tenho").map((it) => (
        <Row key={it.key} accent={PRI[it.priority] || PRI[2]} title={it.name}
          sub={it.kind === "consumable" ? "toca p/ registrar reposição" : undefined}
          right={sideOf(it)} onClick={it.kind === "consumable" ? () => restock(it) : undefined} />
      ))}
      <SectionTitle hint={`· ${doneCount}/${bosses.length}`}>Setup</SectionTitle>
      {bosses.map((m) => {
        const s = dueAgain(m);
        return <Row key={m.key} done={s.done} accent="bg-rose-500" title={m.label}
          sub={s.note || m.note} onClick={() => toggleBoss(m)} />;
      })}
      <div className="h-4" />
    </>
  );
}
