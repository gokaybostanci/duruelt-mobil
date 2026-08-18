// YOKLAMALI BİLDİRİM (kullanıcı tercihi: "biraz gecikmeli olsun önemli değil").
// Firebase/push altyapısı YOK — uygulama açıkken 30 saniyede bir panelin canlı akış ucunu sorar,
// yeni sipariş/mesaj varsa TELEFONUN KENDİ bildirimini gösterir. Bu yüzden ek servis, ek hesap
// ve ek maliyet gerekmiyor; bedeli en fazla yarım dakikalık gecikme.
import * as Notifications from "expo-notifications";
import { api } from "./api";

export type CanliOlay = { tip: string; id: number; baslik: string; ozet: string; zaman: string; link: string };
type Akis = {
  olaylar: CanliOlay[]; sonSiparisId: number; sonMesajId: number;
  okunmamisMesaj: number; onayBekleyen: number; bankadaParaVar: number;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: true,
    shouldShowBanner: true, shouldShowList: true,
  }),
});

export async function izinIste() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") await Notifications.requestPermissionsAsync();
}

let sonSiparis = 0, sonMesaj = 0, ilk = true;

/** Bir tur yoklar; yeni olay varsa bildirim gösterir ve sayaçları döner. */
export async function birTur(): Promise<Akis | null> {
  try {
    const a = await api.get<Akis>(`/admin/canli?sonSiparisId=${sonSiparis}&sonMesajId=${sonMesaj}`);
    // İlk turda bildirim ATMA: uygulama her açıldığında eski siparişler "yeni geldi" diye
    // bildirim yağdırırdı. Sadece imleçleri öğrenip sonraki turlarda farkı bildiriyoruz.
    if (!ilk) {
      for (const o of a.olaylar) {
        await Notifications.scheduleNotificationAsync({
          content: { title: o.baslik, body: o.ozet, data: { link: o.link } },
          trigger: null,
        });
      }
    }
    sonSiparis = a.sonSiparisId; sonMesaj = a.sonMesajId; ilk = false;
    return a;
  } catch { return null; }   // ağ yoksa sessiz geç, sonraki tur dener
}
