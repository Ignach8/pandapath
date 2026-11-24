import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import type { Ex } from "@/content/types";
import { normEn } from "@/lib/pinyin";
import { colors } from "@/theme";
import { SpeakButton } from "../speak-button";
import type { ExProps } from "./types";

type T = Extract<Ex, { t: "type" }>;

/** Completar palabras (TOEFL «Complete the Words») o escribir la palabra que falta. */
export function Typing({ ex, locked, bind }: ExProps<T>) {
  const [text, setText] = useState("");

  useEffect(() => {
    bind(
      text.trim()
        ? () => ({
            ok: ex.ans.some((a) => normEn(a) === normEn(text)),
            correct: `${ex.before ?? ""}${ex.ans[0]}${ex.after ?? ""}`,
            note: ex.why,
          })
        : null,
    );
  }, [text, ex]);

  return (
    <View style={{ gap: 16 }}>
      <Text style={s.prompt}>{ex.stem}</Text>
      {ex.say && <SpeakButton text={ex.say.text} lang={ex.say.lang} size={52} />}
      <View style={s.line}>
        <Text style={s.fixed}>{ex.before}</Text>
        <TextInput
          value={text}
          onChangeText={setText}
          editable={!locked}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
          accessibilityLabel={ex.stem}
          style={s.input}
          placeholder="…"
          placeholderTextColor={colors.lockedDark}
        />
        <Text style={s.fixed}>{ex.after}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  prompt: { fontSize: 20, fontWeight: "800", color: colors.ink },
  line: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 2, backgroundColor: colors.white, borderRadius: 16, borderWidth: 2, borderColor: colors.line, padding: 14 },
  fixed: { fontSize: 20, color: colors.ink, fontWeight: "600" },
  input: { minWidth: 70, fontSize: 20, fontWeight: "800", color: colors.bambooDark, borderBottomWidth: 3, borderBottomColor: colors.sky, paddingVertical: 2, paddingHorizontal: 4 },
});
