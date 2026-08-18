import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, RefreshControl, TextInput, Alert, ActivityIndicator } from "react-native";
import { api } from "../lib/api";
import { s, TL, DURUM_AD, DURUM_RENK } from "../lib/stil";

type Satir = { id: number; siparisTarihi: string; durum: number; odemeTipi: number; odemeDurum?: number;
  musteriAd: string; musteriTel?: string; okulAd?: string; genelToplam: number };
type Paged = { ogeler: Satir[]; toplamKayit: number };

export default function Siparisler() {
  const [veri, setVeri] = useState<Paged | null>(null);
  const [durum, setDurum] = useState("1");
  const [ara, setAra] = useState("");
  const [yuk, setYuk] = useState(false);
  const [aksiyon, setAksiyon] = useState<number | null>(null);

  const yukle = useCallback(async () => {
    setYuk(true);
    try {
      const q = new URLSearchParams({ boyut: "50", sirala: "tarih_desc" });
      if (durum) q.set("durum", durum);
      if (ara.trim()) q.set("ara", ara.trim());
      setVeri(await api.get<Paged>(`/admin/orders?${q}`));
    } catch (e) { Alert.alert("Hata", e instanceof Error ? e.message : "Liste alınamadı"); }
    finally { setYuk(false); }
  }, [durum, ara]);
  useEffect(() => { yukle(); }, [durum]);

  async function bankayaSor(id: number) {
    setAksiyon(id);
    try {
      const r = await api.post<{ durum: number; aciklama?: string; provizyonKodu?: string; tutar?: number }>(
        `/admin/orders/${id}/bankaya-sor`);
      const ad: Record<number, string> = { 0: "Sorgu tanımlı değil", 1: "Bankaya ulaşılamadı", 2: "Yapılandırma hatası",
        3: "Bankada kayıt yok", 4: "Tahsilat yok", 5: "TAHSİLAT VAR ✔", 6: "Belirsiz" };
      Alert.alert(`#${id} — ${ad[r.durum] ?? r.durum}`,
        [r.aciklama, r.provizyonKodu && `Provizyon: ${r.provizyonKodu}`, r.tutar && TL(r.tutar)]
          .filter(Boolean).join("\n") || "—");
    } catch (e) { Alert.alert("Hata", e instanceof Error ? e.message : "Sorgu başarısız"); }
    finally { setAksiyon(null); }
  }

  function onayla(id: number) {
    Alert.alert("Onay", `#${id} onaylansın mı? Müşteriye bildirim gider.`, [
      { text: "Vazgeç", style: "cancel" },
      { text: "Onayla", onPress: async () => {
          setAksiyon(id);
          try { await api.post(`/admin/orders/${id}/approve`); await yukle(); }
          catch (e) { Alert.alert("Onaylanamadı", e instanceof Error ? e.message : ""); }
          finally { setAksiyon(null); }
        } },
    ]);
  }

  return (
    <View style={s.sayfa}>
      <Text style={s.baslik}>Siparişler</Text>
      <TextInput style={s.girdi} placeholder="Sipariş no / müşteri ara" value={ara}
        onChangeText={setAra} onSubmitEditing={yukle} returnKeyType="search" />
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
        {[["1", "Onay bekleyen"], ["2", "Hazırlanıyor"], ["", "Tümü"]].map(([d, ad]) => (
          <Pressable key={d} onPress={() => setDurum(d)}
            style={[s.kart, { marginBottom: 0, paddingVertical: 8, paddingHorizontal: 12 },
              durum === d && { backgroundColor: s.renk.marka }]}>
            <Text style={{ fontWeight: "700", color: durum === d ? "#fff" : s.renk.ink, fontSize: 13 }}>{ad}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={veri?.ogeler ?? []}
        keyExtractor={(x) => String(x.id)}
        refreshControl={<RefreshControl refreshing={yuk} onRefresh={yukle} />}
        ListEmptyComponent={!yuk ? <Text style={s.soluk}>Kayıt yok.</Text> : null}
        renderItem={({ item }) => (
          <View style={s.kart}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={s.satirBaslik}>#{item.id} · {TL(item.genelToplam)}</Text>
              <Text style={[s.rozet, { backgroundColor: DURUM_RENK[item.durum] ?? "#64748b" }]}>
                {DURUM_AD[item.durum] ?? item.durum}
              </Text>
            </View>
            <Text style={s.soluk}>{item.musteriAd}{item.okulAd ? ` · ${item.okulAd}` : ""}</Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              {item.durum === 1 && (item.odemeTipi === 2 || item.odemeDurum === 1) && (
                <Pressable style={[s.dugme, { flex: 1, marginTop: 0, backgroundColor: s.renk.ok }]}
                  onPress={() => onayla(item.id)} disabled={aksiyon === item.id}>
                  <Text style={s.dugmeYazi}>✔ Onayla</Text>
                </Pressable>
              )}
              {item.durum === 1 && item.odemeTipi !== 2 && (
                <Pressable style={[s.dugme, { flex: 1, marginTop: 0, backgroundColor: "#334155" }]}
                  onPress={() => bankayaSor(item.id)} disabled={aksiyon === item.id}>
                  {aksiyon === item.id ? <ActivityIndicator color="#fff" />
                    : <Text style={s.dugmeYazi}>🏦 Bankaya sor</Text>}
                </Pressable>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}
