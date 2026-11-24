import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { Ex } from "@/content/types";
import { useT } from "@/i18n";
import { speak } from "@/lib/audio";
import { colors } from "@/theme";
import { SpeakButton } from "../speak-button";
import type { ExProps } from "./types";

export function Intro({ ex, bind }: ExProps<Extract<Ex, { t: "intro" }>>) {
  const { t, l } = useT();
  const w = ex.word;
  const lang = w.level === 0 ? "en-US" : "zh-CN";
  useEffect(() => {
    bind(() => ({ ok: true, silent: true }));
    speak(w.h, lang);
    return () => bind(null);
  }, [w.h]);
  return (
    <View style={s.wrap}>
      <Text style={s.tag}>{t("ex_new_word")}</Text>
      <View style={s.card}>
        <Text style={[s.word, w.level === 0 && { fontSize: 44 }]} accessibilityLabel={w.h}>
          {w.h}
        </Text>
        <Text style={s.pinyin}>{w.p}</Text>
        <SpeakButton text={w.h} lang={lang} size={64} />
        <Text style={s.meaning}>{l(w.m)}</Text>
        {w.level === 0 && <Text style={s.small}>{w.m.en}</Text>}
        <Text style={s.hint}>{t("ex_tap_hear")}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "center", gap: 16, paddingHorizontal: 8 },
  tag: { color: colors.skyDark, fontWeight: "900", fontSize: 14, letterSpacing: 1, textTransform: "uppercase" },
  card: { backgroundColor: colors.white, borderRadius: 24, borderWidth: 2, borderColor: colors.line, borderBottomWidth: 5, padding: 24, alignItems: "center", gap: 14 },
  word: { fontSize: 76, color: colors.ink, fontWeight: "700" },
  pinyin: { fontSize: 24, color: colors.bambooDark, fontWeight: "800" },
  meaning: { fontSize: 22, color: colors.ink, textAlign: "center", fontWeight: "700" },
  small: { fontSize: 14, color: colors.inkSoft, textAlign: "center" },
  hint: { fontSize: 13, color: colors.inkSoft },
});
