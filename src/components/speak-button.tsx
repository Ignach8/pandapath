import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { SpeechLang } from "@/content/types";
import { buzz, speak } from "@/lib/audio";
import { colors } from "@/theme";

type Props = { text: string; lang: SpeechLang; size?: number; slowToo?: boolean; label?: string };

/** Botón de altavoz: voz normal y, opcionalmente, una tortuga para voz lenta. */
export function SpeakButton({ text, lang, size = 56, slowToo = true, label }: Props) {
  const [busy, setBusy] = useState(false);
  const play = (slow: boolean) => {
    buzz("tap");
    setBusy(true);
    speak(text, lang, { slow, onDone: () => setBusy(false) });
  };
  return (
    <View style={s.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ?? "Play audio"}
        onPress={() => play(false)}
        style={[s.btn, { width: size, height: size, borderRadius: size / 2, backgroundColor: busy ? colors.skyDark : colors.sky }]}
      >
        <Text style={{ fontSize: size * 0.46 }}>🔊</Text>
      </Pressable>
      {slowToo && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Slow audio"
          onPress={() => play(true)}
          style={[s.btn, { width: size * 0.7, height: size * 0.7, borderRadius: size, backgroundColor: colors.skySoft }]}
        >
          <Text style={{ fontSize: size * 0.32 }}>🐢</Text>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  btn: { alignItems: "center", justifyContent: "center", borderBottomWidth: 4, borderBottomColor: "rgba(0,0,0,0.18)" },
});
