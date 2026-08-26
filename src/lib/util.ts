export const iso = (d: Date) => d.toISOString().slice(0, 10);
export const today = () => {
  const d = new Date();
  return iso(new Date(d.getTime() - d.getTimezoneOffset() * 60000));
};
export function weekStart(dstr: string) {
  const d = new Date(dstr + "T12:00:00");
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow);
  return iso(d);
}
export const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
export const MESES = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
export const CORE = ["cre", "caf", "cel", "son", "fum"];
export const dm = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;
export const cn = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(" ");

export const DOMAIN_COLOR: Record<string, string> = {
  treino: "bg-amber-500", sono: "bg-sky-500", nutricao: "bg-emerald-500",
  mente: "bg-violet-500", saude: "bg-rose-500", corpo: "bg-emerald-500",
  evento: "bg-rose-500", vida: "bg-violet-500",
};
