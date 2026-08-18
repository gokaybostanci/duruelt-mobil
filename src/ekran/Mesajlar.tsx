import { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, RefreshControl, Pressable, Linking } from "react-native";
import { api } from "../lib/api";
import { s } from "../lib/stil";

type Mesaj = { id: number; adSoyad: string; telefon?: string; konu?: string; mesaj: string; tarih: string; okundu: boolean };
type Paged = { ogeler: Mesaj[] };

export default function Mesajlar() {
  const [veri, setVeri] = useState<Paged | null>(null);
  const [yuk, setYuk] = useState(false);

  const yukle = useCallback(async () => {
    setYuk(true);
    try { setVeri(await api.get<Paged>("/admin/messages?boyut=50")); }
    catch { /* sessiz */ } finally { setYuk(false); }
  }, []);
  useEffect(() => { yukle(); }, [yukle]);

  return (
    <View style={s.sayfa}>
      <Text style={s.baslik}>Mesajlar</Text>
      <FlatList
        data={veri?.ogeler ?? []}
        keyExtractor={(x) => String(x.id)}
        refreshControl={<RefreshControl refreshing={yuk} onRefresh={yukle} />}
        ListEmptyComponent={!yuk ? <Text style={s.soluk}>Mesaj yok.</Text> : null}
        renderItem={({ item }) => (
          <View style={[s.kart, !item.okundu && { borderLeftWidth: 4, borderLeftColor: s.renk.marka }]}>
            <Text style={s.satirBaslik}>{item.adSoyad}{item.okundu ? "" : "  •"}</Text>
            {!!item.konu && <Text style={s.soluk}>{item.konu}</Text>}
            <Text style={{ marginTop: 4 }}>{item.mesaj}</Text>
            {!!item.telefon && (
              <Pressable style={[s.dugme, { marginTop: 10 }]} onPress={() => Linking.openURL(`tel:${item.telefon}`)}>
                <Text style={s.dugmeYazi}>📞 {item.telefon}</Text>
              </Pressable>
            )}
          </View>
        )}
      />
    </View>
  );
}
