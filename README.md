# Duru ELT — Mobil Panel (Android)

duruelt.com yönetim panelinin mobil sürümü. **Ayrı proje**, ama kendi API'si yok:
panelin kullandığı uçların **aynısını** kullanır (`https://www.duruelt.com.tr/api`).
Dolayısıyla panelde düzelen bir iş kuralı burada da kendiliğinden düzelir.

## Neler var
- Giriş (panel kullanıcı adı/parolası; token telefonda **SecureStore**'da şifreli durur)
- **Özet**: onay bekleyen, kargo bekleyen, ödeme sorunu, "bankada para var" alarmı, gerçek satış/tahsilat
- **Siparişler**: filtre + arama, tek dokunuşla **Onayla** ve **Bankaya Sor** (mutabakat sorgusu)
- **Mesajlar**: okunmamış işaretli, numaraya dokun → ara
- **Bildirim**: uygulama açıkken 30 sn'de bir yoklar; yeni sipariş/mesajda telefon bildirimi gösterir,
  bildirime dokununca ilgili ekrana gider

## Bildirim neden "yoklamalı"?
Firebase/push altyapısı bilinçli olarak KURULMADI (ek hesap + sunucu tarafı gönderim kodu gerektirir).
Uygulama ön plandayken sunucuya sorar; bedeli en fazla yarım dakika gecikme, kazancı sıfır ek altyapı.
Pil için: yoklama yalnız uygulama **ön plandayken** çalışır, arka plana geçince durur.

## Kurulum (geliştirme)
```bash
npm install
npm start          # Expo Go ile telefonda anında dene
```

## APK üretimi
Bu depo Play Store'a değil, **doğrudan APK** dağıtımına ayarlıdır (`eas.json` → profil `apk`,
`buildType: apk`, `distribution: internal`).

```bash
npm i -g eas-cli
eas login          # tek seferlik Expo hesabı
npm run apk        # bulutta derler, sonunda indirilebilir .apk linki verir
```

APK'yı telefona kopyalayıp kurun (Ayarlar → "Bilinmeyen kaynaklara izin ver").

> Yerelde derlemek isterseniz Android SDK + JDK 17 gerekir; bu depo bulut derlemesine göre
> ayarlandığı için ek kurulum gerekmez.

## Yapılandırma
API adresi `app.json` → `expo.extra.apiKok`. Test sunucusuna bakmak için burayı değiştirin.
