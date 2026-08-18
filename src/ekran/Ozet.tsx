import { useCallback, useState } from "react";
import { View, Text, ScrollView, RefreshControl, Pressable } from "react-native";
import { api } from "../lib/api";
import { s, TL } from "../lib/stil";

type Dash = { onayBekleyen: number; kargoBekleyen: number; buAyCiro: number; toplamSiparis: number;
  havaleOnayBekleyen: number; odemeSorunu: number; okulTeslimBekleyen: number; bankadaParaVar?: number };
type Satis = { toplamSiparis: number; toplamTutar: number; odenenTutar: number;
  iptalAdet?: number; iptalTutar?: number; odemesizDenemeAdet?: number };

export default function Ozet({ git }: { git: (ekran: string) => void }) {
  const [d, setD] = useState<Dash | null>(null);
  const [sat, setSat] = useState<Satis | null>(null);
  const [yuk, setYuk] = useState(false);

  const yukle = useCallback(async () => {
    setYuk(true);
    try {
      const [a, b] = await Promise.all([
        api.get<Dash>("/admin/reports/dashboard"),
        api.get<Satis>("/admin/reports/sales").catch(() => null),
      ]);
      setD(a); if (b) setSat(b);
    } catch { /* ekranda eski veri kalsın */ } finally { setYuk(false); }
  }, []);
  useState(() => { yukle(); return undefined; });

  return (
    <ScrollView style={s.sayfa} refreshControl={<RefreshControl refreshing={yuk} onRefresh={yukle} />}>
      <Text style={s.baslik}>Özet</Text>

      {/* EN YÜKSEK ÖNCELİK: bankada para var ama sipariş tamamlanmamış */}
      {!!d?.bankadaParaVar && (
        <Pressable style={[s.kart, { borderWidth: 3, borderColor: s.renk.tehlike }]} onPress={() => git("siparisler")}>
          <Text style={{ color: s.renk.tehlike, fontWeight: "800", fontSize: 16 }}>
            🚨 BANKADA PARA VAR — {d.bankadaParaVar} sipariş
          </Text>
          <Text style={s.soluk}>Banka çekimi onayladı ama sipariş düşmedi. Hemen kontrol edin.</Text>
        </Pressable>
      )}

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        <Kutu l="Onay Bekleyen" v={d?.onayBekleyen} renk={s.renk.uyari} bas={() => git("siparisler")} />
        <Kutu l="Kargo Bekleyen" v={d?.kargoBekleyen} renk={s.renk.marka} bas={() => git("siparisler")} />
        <Kutu l="Ödeme Sorunu" v={d?.odemeSorunu} renk={s.renk.tehlike} bas={() => git("siparisler")} />
        <Kutu l="Okulda Teslim" v={d?.okulTeslimBekleyen} renk="#8b5cf6" />
      </View>

      {sat && (
        <View style={s.kart}>
          <Text style={s.satirBaslik}>Satış (gerçek)</Text>
          <Sat l="Sipariş" v={String(sat.toplamSiparis)} />
          <Sat l="Tutar" v={TL(sat.toplamTutar)} />
          <Sat l="Tahsil edilen" v={TL(sat.odenenTutar)} renk={s.renk.ok} />
          {!!sat.iptalAdet && (
            <Text style={[s.soluk, { marginTop: 8 }]}>
              ⛔ {sat.iptalAdet} iptal/iade ({TL(sat.iptalTutar ?? 0)}) toplamlara dahil değildir.
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function Kutu({ l, v, renk, bas }: { l: string; v?: number; renk: string; bas?: () => void }) {
  return (
    <Pressable style={[s.kart, { flexGrow: 1, minWidth: "45%" }]} onPress={bas}>
      <Text style={s.soluk}>{l}</Text>
      <Text style={{ fontSize: 26, fontWeight: "800", color: renk }}>{v ?? "—"}</Text>
    </Pressable>
  );
}
function Sat({ l, v, renk }: { l: string; v: string; renk?: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 }}>
      <Text style={s.soluk}>{l}</Text>
      <Text style={{ fontWeight: "700", color: renk ?? s.renk.ink }}>{v}</Text>
    </View>
  );
}
