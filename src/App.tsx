import { useEffect, useState, useCallback } from "react";
import { bootAuth, isLogged, login, logout } from "./lib/api";
import { loadCore, loadBody } from "./lib/data";
import Hoje from "./screens/Hoje";
import Corpo from "./screens/Corpo";
import Progresso from "./screens/Progresso";
import Arsenal from "./screens/Arsenal";
import { cn } from "./lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { CalendarCheck, HeartPulse, LineChart, Package } from "lucide-react";

const TABS = [
  { k: "hoje", n: "Hoje", I: CalendarCheck },
  { k: "corpo", n: "Corpo", I: HeartPulse },
  { k: "prog", n: "Progresso", I: LineChart },
  { k: "arsenal", n: "Arsenal", I: Package },
];

export default function App() {
  const [ready, setReady] = useState(false);
  const [logged, setLogged] = useState(isLogged());
  const [tab, setTab] = useState("hoje");
  const [st, setSt] = useState<any>(null);
  const [body, setBody] = useState<any>(null);
  const [, force] = useState(0);
  const reload = useCallback(() => force((n) => n + 1), []);

  const [email, setEmail] = useState("gabesuit@gmail.com");
  const [pass, setPass] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => { (async () => {
    if (isLogged()) { const ok = await bootAuth(); setLogged(ok); }
    setReady(true);
  })(); }, []);

  useEffect(() => { if (logged) {
    loadCore().then(setSt).catch(console.error);
    loadBody().then(setBody).catch(console.error);
  } }, [logged]);

  useEffect(() => { window.scrollTo(0, 0); }, [tab]);

  async function doLogin() {
    setMsg("entrando…");
    try { await login(email.trim(), pass); setLogged(true); setMsg(""); }
    catch { setMsg("email ou senha incorretos"); }
  }

  if (!ready) return null;

  if (!logged) return (
    <div className="mx-auto mt-[14vh] max-w-[340px] px-4">
      <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Copiloto</h1>
      <p className="mb-4 text-xs text-muted">teu banco, teus dados</p>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" autoComplete="username"
        className="mb-2.5 w-full rounded-xl border border-border bg-card px-3 py-3 outline-none focus:border-primary" />
      <input value={pass} onChange={(e) => setPass(e.target.value)} type="password" autoComplete="current-password"
        placeholder="senha" onKeyDown={(e) => e.key === "Enter" && doLogin()}
        className="mb-2.5 w-full rounded-xl border border-border bg-card px-3 py-3 outline-none focus:border-primary" />
      <button onClick={doLogin}
        className="w-full rounded-xl bg-primary py-3 font-display font-bold text-white active:scale-[0.98]">Entrar</button>
      <p className="mt-2 min-h-[18px] text-[13px] text-primary">{msg}</p>
    </div>
  );

  return (
    <>
      <div className="mx-auto max-w-[640px] px-3.5 pb-28 pt-4">
        {!st ? <p className="mt-10 text-center text-sm text-muted">carregando…</p> : (
          <>
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                {tab === "hoje" && <Hoje st={st} reload={reload} />}
                {tab === "corpo" && <Corpo body={body} />}
                {tab === "prog" && <Progresso body={body} st={st} />}
                {tab === "arsenal" && <Arsenal st={st} reload={reload} />}
              </motion.div>
            </AnimatePresence>
            <p className="mt-6 text-center text-[11px] text-muted">
              v3.1 · <button onClick={logout} className="underline">sair</button>
            </p>
          </>
        )}
      </div>
      <nav className="fixed inset-x-0 bottom-0 border-t border-border/70 bg-bg/80 px-3
        pb-[calc(0.55rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[520px] justify-center gap-1">
          {TABS.map(({ k, n, I }) => (
            <button key={k} onClick={() => setTab(k)}
              className="relative flex-1 rounded-2xl px-1 py-2">
              {tab === k && (
                <motion.span layoutId="navpill" transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-2xl border border-border bg-card" />
              )}
              <span className={cn("relative flex flex-col items-center gap-1 transition-colors",
                tab === k ? "text-fg" : "text-muted")}>
                <I className="h-[18px] w-[18px]" strokeWidth={2.2} />
                <span className="font-display text-[10.5px] font-bold tracking-wide">{n}</span>
              </span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
