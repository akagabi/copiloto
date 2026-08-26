import { useEffect, useState, useCallback } from "react";
import { bootAuth, isLogged, login, logout } from "./lib/api";
import { loadCore, loadBody } from "./lib/data";
import Hoje from "./screens/Hoje";
import Corpo from "./screens/Corpo";
import Progresso from "./screens/Progresso";
import Arsenal from "./screens/Arsenal";
import { cn } from "./lib/util";

const TABS = [
  { k: "hoje", n: "HOJE" }, { k: "corpo", n: "CORPO" },
  { k: "prog", n: "PROGRESSO" }, { k: "arsenal", n: "ARSENAL" },
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
            {tab === "hoje" && <Hoje st={st} reload={reload} />}
            {tab === "corpo" && <Corpo body={body} />}
            {tab === "prog" && <Progresso body={body} st={st} />}
            {tab === "arsenal" && <Arsenal st={st} reload={reload} />}
            <p className="mt-6 text-center text-[11px] text-muted">
              v3.0 · <button onClick={logout} className="underline">sair</button>
            </p>
          </>
        )}
      </div>
      <nav className="fixed inset-x-0 bottom-0 flex justify-center gap-1.5 border-t border-border
        bg-bg/85 px-3 pb-[calc(0.6rem+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl">
        {TABS.map((x) => (
          <button key={x.k} onClick={() => setTab(x.k)}
            className={cn("max-w-[120px] flex-1 rounded-2xl py-2.5 font-display text-[11.5px] font-bold tracking-wide transition",
              tab === x.k ? "border border-border bg-card text-fg" : "text-muted")}>{x.n}</button>
        ))}
      </nav>
    </>
  );
}
