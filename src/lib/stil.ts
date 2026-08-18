import { StyleSheet } from "react-native";
const renk = { marka: "#0096ff", ok: "#16a34a", uyari: "#f59e0b", tehlike: "#ef4444", zemin: "#f1f5f9", kart: "#ffffff", ink: "#1e293b", soluk: "#64748b" };
export const s = {
  renk,
  ...StyleSheet.create({
    sayfa: { flex: 1, backgroundColor: renk.zemin, padding: 16 },
    kart: { backgroundColor: renk.kart, borderRadius: 14, padding: 14, marginBottom: 10 },
    baslik: { fontSize: 20, fontWeight: "800", color: renk.ink, marginBottom: 10 },
    satirBaslik: { fontSize: 15, fontWeight: "700", color: renk.ink },
    soluk: { color: renk.soluk, fontSize: 13 },
    girdi: { backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10, fontSize: 16 },
    dugme: { backgroundColor: renk.marka, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 6 },
    dugmeYazi: { color: "#fff", fontWeight: "700", fontSize: 16 },
    hata: { color: renk.tehlike, marginBottom: 8, fontWeight: "600" },
    rozet: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, color: "#fff", fontSize: 11, fontWeight: "700", overflow: "hidden" },
  }),
};
export const TL = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " ₺";
export const DURUM_AD: Record<number, string> = { 1: "Onay Bekliyor", 2: "Hazırlanıyor", 3: "Kargolandı", 4: "Teslim Edildi", 5: "İptal", 6: "İade", 7: "Online Şifre" };
export const DURUM_RENK: Record<number, string> = { 1: "#f59e0b", 2: "#0096ff", 3: "#8b5cf6", 4: "#16a34a", 5: "#ef4444", 6: "#ef4444", 7: "#f59e0b" };
