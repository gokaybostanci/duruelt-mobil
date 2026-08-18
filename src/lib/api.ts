// Panel API istemcisi. Mobil uygulama PANELİN KULLANDIĞI UÇLARIN AYNISINI kullanır —
// ayrı bir mobil API yok, dolayısıyla panelde düzelen her şey burada da düzelir.
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const KOK = (Constants.expoConfig?.extra as any)?.apiKok ?? "https://www.duruelt.com.tr";
const ANAHTAR = "duruelt.token";

let bellekToken: string | null = null;

export async function tokenAl(): Promise<string | null> {
  if (bellekToken) return bellekToken;
  bellekToken = await SecureStore.getItemAsync(ANAHTAR);
  return bellekToken;
}
export async function tokenYaz(t: string | null) {
  bellekToken = t;
  if (t) await SecureStore.setItemAsync(ANAHTAR, t);
  else await SecureStore.deleteItemAsync(ANAHTAR);
}

export class YetkiHatasi extends Error {}

async function istek<T>(yol: string, secenek: RequestInit = {}): Promise<T> {
  const t = await tokenAl();
  const r = await fetch(`${KOK}/api${yol}`, {
    ...secenek,
    headers: {
      "Content-Type": "application/json",
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      ...(secenek.headers ?? {}),
    },
  });
  if (r.status === 401) { await tokenYaz(null); throw new YetkiHatasi("Oturum süresi doldu, tekrar giriş yapın."); }
  const j = await r.json().catch(() => null);
  if (!r.ok || j?.basarili === false) throw new Error(j?.hata?.mesaj ?? `Sunucu hatası (${r.status})`);
  return (j?.veri ?? j) as T;
}

export const api = {
  get: <T>(yol: string) => istek<T>(yol),
  post: <T>(yol: string, govde?: unknown) =>
    istek<T>(yol, { method: "POST", body: govde ? JSON.stringify(govde) : "{}" }),
};

export async function girisYap(kullaniciAdi: string, parola: string) {
  const r = await fetch(`${KOK}/api/auth/admin/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kullaniciAdi, parola }),
  });
  const j = await r.json().catch(() => null);
  const token = j?.veri?.accessToken;
  if (!r.ok || !token) throw new Error(j?.hata?.mesaj ?? "Kullanıcı adı ya da parola hatalı.");
  await tokenYaz(token);
  return { adSoyad: j.veri.adSoyad as string, rol: j.veri.rol as string | null };
}
