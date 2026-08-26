const SB = "https://qgawtutaqukuxctcoxnv.supabase.co";
const KEY = "sb_publishable_W6Dcujy_B3GAU3DmpgC7PA_SEMG9mB3";

type Tokens = { access_token: string; refresh_token: string };
let tokens: Tokens | null = JSON.parse(localStorage.getItem("cp_tokens") || "null");

export const isLogged = () => !!tokens;

let refreshing: Promise<boolean> | null = null;
function refresh(): Promise<boolean> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    try {
      const r = await fetch(`${SB}/auth/v1/token?grant_type=refresh_token`, {
        method: "POST",
        headers: { apikey: KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: tokens!.refresh_token }),
      });
      if (!r.ok) return false;
      tokens = await r.json();
      localStorage.setItem("cp_tokens", JSON.stringify(tokens));
      return true;
    } finally {
      setTimeout(() => (refreshing = null), 500);
    }
  })();
  return refreshing;
}

export async function api<T = any>(path: string, opts: RequestInit = {}, retry = true): Promise<T> {
  const r = await fetch(SB + path, {
    ...opts,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${tokens ? tokens.access_token : KEY}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  if (r.status === 401 && retry && tokens?.refresh_token) {
    if (await refresh()) return api<T>(path, opts, false);
    logout();
    throw new Error("auth");
  }
  if (!r.ok) throw new Error(await r.text());
  const txt = await r.text();
  return (txt ? JSON.parse(txt) : null) as T;
}

export async function login(email: string, password: string) {
  const r = await fetch(`${SB}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) throw new Error("credenciais inválidas");
  tokens = await r.json();
  localStorage.setItem("cp_tokens", JSON.stringify(tokens));
}

export function logout() {
  localStorage.removeItem("cp_tokens");
  tokens = null;
  location.reload();
}

export async function bootAuth() {
  if (tokens?.refresh_token) {
    const ok = await refresh();
    if (!ok) { logout(); return false; }
  }
  return !!tokens;
}

async function write(method: string, path: string, body?: any, extra?: Record<string, string>, attempt = 1): Promise<any> {
  try {
    return await api(`/rest/v1/${path}`, {
      method,
      headers: { Prefer: "resolution=merge-duplicates", ...(extra || {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 700 * attempt));
      return write(method, path, body, extra, attempt + 1);
    }
    throw e;
  }
}
export const upsert = (table: string, conflict: string, body: any) =>
  write("POST", `${table}?on_conflict=${conflict}`, body);
export const patch = (pathq: string, body: any) => write("PATCH", pathq, body);
export const insert = (table: string, body: any) =>
  write("POST", table, body, { Prefer: "return=representation" });
