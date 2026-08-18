import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, AppState } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import { tokenAl, tokenYaz } from "./lib/api";
import { birTur, izinIste } from "./lib/bildirim";
import { s } from "./lib/stil";
import Giris from "./ekran/Giris";
import Ozet from "./ekran/Ozet";
import Siparisler from "./ekran/Siparisler";
import Mesajlar from "./ekran/Mesajlar";

const YOKLAMA_MS = 30_000;   // kullanıcı tercihi: gecikme sorun değil, ek servis istemiyoruz

export default function App() {
  const [girisli, setGirisli] = useState<boolean | null>(null);
  const [ekran, setEkran] = useState<"ozet" | "siparisler" | "mesajlar">("ozet");
  const [rozet, setRozet] = useState({ mesaj: 0, onay: 0 });
  const zamanlayici = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { tokenAl().then((t) => setGirisli(!!t)); izinIste(); }, []);

  // Yoklama YALNIZ uygulama ÖN PLANDAYKEN çalışır: arka planda pil yakmasın.
  useEffect(() => {
    if (!girisli) return;
    const basla = () => {
      if (zamanlayici.current) return;
      birTur().then((a) => a && setRozet({ mesaj: a.okunmamisMesaj, onay: a.onayBekleyen }));
      zamanlayici.current = setInterval(async () => {
        const a = await birTur();
        if (a) setRozet({ mesaj: a.okunmamisMesaj, onay: a.onayBekleyen });
      }, YOKLAMA_MS);
    };
    const dur = () => { if (zamanlayici.current) { clearInterval(zamanlayici.current); zamanlayici.current = null; } };
    basla();
    const ab = AppState.addEventListener("change", (d) => (d === "active" ? basla() : dur()));
    return () => { dur(); ab.remove(); };
  }, [girisli]);

  // Bildirime dokununca ilgili ekrana git
  useEffect(() => {
    const ab = Notifications.addNotificationResponseReceivedListener((r) => {
      const link = String((r.notification.request.content.data as any)?.link ?? "");
      setEkran(link.includes("mesaj") ? "mesajlar" : "siparisler");
    });
    return () => ab.remove();
  }, []);

  if (girisli === null) return <View style={s.sayfa} />;
  if (!girisli) return (
    <SafeAreaProvider><SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" /><Giris onGirdi={() => setGirisli(true)} />
    </SafeAreaView></SafeAreaProvider>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: s.renk.zemin }}>
        <StatusBar style="dark" />
        <View style={{ flex: 1 }}>
          {ekran === "ozet" && <Ozet git={(e) => setEkran(e as any)} />}
          {ekran === "siparisler" && <Siparisler />}
          {ekran === "mesajlar" && <Mesajlar />}
        </View>
        <View style={{ flexDirection: "row", backgroundColor: "#fff", paddingVertical: 8 }}>
          <Sekme ad="Özet" aktif={ekran === "ozet"} bas={() => setEkran("ozet")} />
          <Sekme ad="Siparişler" aktif={ekran === "siparisler"} bas={() => setEkran("siparisler")} sayi={rozet.onay} />
          <Sekme ad="Mesajlar" aktif={ekran === "mesajlar"} bas={() => setEkran("mesajlar")} sayi={rozet.mesaj} />
          <Sekme ad="Çıkış" aktif={false} bas={() => { tokenYaz(null); setGirisli(false); }} />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function Sekme({ ad, aktif, bas, sayi }: { ad: string; aktif: boolean; bas: () => void; sayi?: number }) {
  return (
    <Pressable style={{ flex: 1, alignItems: "center", paddingVertical: 6 }} onPress={bas}>
      <Text style={{ fontWeight: "700", color: aktif ? s.renk.marka : s.renk.soluk }}>
        {ad}{sayi ? ` (${sayi})` : ""}
      </Text>
    </Pressable>
  );
}
