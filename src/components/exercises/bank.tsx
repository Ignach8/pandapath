import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Ex } from "@/content/types";
import { useT } from "@/i18n";
import { buzz, speak } from "@/lib/audio";
import { shuffle } from "@/lib/rand";
import { colors } from "@/theme";
import { SpeakButton } from "../speak-button";
import type { ExProps } from "./types";

type B = Extract<Ex, { t: "bank" }>;

/** Armar una frase, un pinyin o una palabra tocando fichas. */
export function Bank({ ex, locked, bind }: ExProps<B>) {
  const { t } = useT();
  const tiles = useMemo(() => shuffle(ex.tokens.map((label, id) => ({ id, label }))), [ex]);
  const [picked, setPicked] = useState<number[]>([]);

  useEffect(() => {
    if (ex.say?.auto) speak(ex.say.text, ex.say.lang);
  }, [ex]);

  useEffect(() => {
    const labels = picked.map((id) => ex.tokens[id]);
    bind(
      picked.length
        ? () => ({
            ok: labels.join(ex.join) === ex.ans.join(ex.join),
            correct: ex.ans.join(ex.join),
            note: ex.hint,
          })
        : null,
    );
  }, [picked, ex]);

  const toggle = (id: number) => {
    if (locked) return;
    buzz("tap");
    if (ex.lang === "zh-CN" && !picked.includes(id) && ex.join === "") speak(ex.tokens[id], "zh-CN");
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };

  const isHan = ex.lang === "zh-CN" && ex.join === "";
  const prompt = ex.say ? ex.stem : ex.lang === "zh-CN" ? t("ex_translate") : t("ex_build_sentence");

  return (
    <View style={{ gap: 16 }}>
      <Text style={s.prompt}>{prompt}</Text>
      {ex.say ? <SpeakButton text={ex.say.text} lang={ex.say.lang} size={64} /> : <Text style={s.stem}>{ex.stem}</Text>}
      <View style={s.answer}>
        {picked.map((id) => (
          <Pressable key={id} onPress={() => toggle(id)} style={[s.tile, s.tilePicked]}>
            <Text style={[s.tileText, isHan && { fontSize: 24 }]}>{ex.tokens[id]}</Text>
          </Pressable>
        ))}
      </View>
      <View style={s.bank}>
        {tiles.map((x) => (
          <Pressable key={x.id} disabled={picked.includes(x.id)} onPress={() => toggle(x.id)} style={[s.tile, picked.includes(x.id) && s.tileUsed]}>
            <Text style={[s.tileText, isHan && { fontSize: 24 }, picked.includes(x.id) && { opacity: 0 }]}>{x.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  prompt: { fontSize: 20, fontWeight: "800", color: colors.ink },
  stem: { fontSize: 18, color: colors.inkSoft, fontWeight: "600" },
  answer: { minHeight: 64, borderTopWidth: 2, borderBottomWidth: 2, borderColor: colors.line, flexDirection: "row", flexWrap: "wrap", gap: 8, paddingVertical: 8, alignItems: "center" },
  bank: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center", paddingTop: 8 },
  tile: { backgroundColor: colors.white, borderWidth: 2, borderColor: colors.line, borderBottomWidth: 4, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },
  tilePicked: { borderColor: colors.sky },
  tileUsed: { backgroundColor: colors.line, borderColor: colors.line },
  tileText: { fontSize: 17, fontWeight: "700", color: colors.ink },
});
