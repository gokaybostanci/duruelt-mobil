import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { girisYap } from "../lib/api";
import { s } from "../lib/stil";

export default function Giris({ onGirdi }: { onGirdi: (ad: string) => void }) {
  const [ka, setKa] = useState(""); const [pa, setPa] = useState("");
  const [yuk, setYuk] = useState(false); const [hata, setHata] = useState<string | null>(null);

  async function gonder() {
    setHata(null); setYuk(true);
    try { const r = await girisYap(ka.trim(), pa); onGirdi(r.adSoyad); }
    catch (e) { setHata(e instanceof Error ? e.message : "Giriş başarısız"); }
    finally { setYuk(false); }
  }

  return (
    <View style={[s.sayfa, { justifyContent: "center" }]}>
      <Text style={st.logo}>duru<Text style={{ color: s.renk.marka }}>elt</Text></Text>
      <Text style={[s.soluk, { textAlign: "center", marginBottom: 24 }]}>Yönetim Paneli</Text>
      <TextInput style={s.girdi} placeholder="Kullanıcı adı" autoCapitalize="none"
        value={ka} onChangeText={setKa} />
      <TextInput style={s.girdi} placeholder="Parola" secureTextEntry
        value={pa} onChangeText={setPa} onSubmitEditing={gonder} />
      {hata && <Text style={s.hata}>{hata}</Text>}
      <Pressable style={[s.dugme, yuk && { opacity: 0.6 }]} onPress={gonder} disabled={yuk}>
        {yuk ? <ActivityIndicator color="#fff" /> : <Text style={s.dugmeYazi}>Giriş yap</Text>}
      </Pressable>
    </View>
  );
}
const st = StyleSheet.create({
  logo: { fontSize: 34, fontWeight: "800", textAlign: "center", color: "#1e293b" },
});
