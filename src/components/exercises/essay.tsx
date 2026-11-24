import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { Ex } from "@/content/types";
import { useT } from "@/i18n";
import { useListen } from "@/lib/use-listen";
import { colors } from "@/theme";
import { SpeakButton } from "../speak-button";
import { Button } from "../ui";
import type { ExProps } from "./types";

type ES = Extract<Ex, { t: "essay" }>;

const countWords = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

/** Redacción y entrevista del TOEFL: escribe (o dicta), recibe una revisión automática y compara con un modelo. */
export function Essay({ ex, locked, bind }: ExProps<ES>) {
  const { t } = useT();
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const base = useRef("");
  const mic = useListen("en-US", { continuous: true });

  useEffect(() => {
    if (mic.listening) setText((base.current + " " + mic.transcript).trim());
  }, [mic.transcript, mic.listening]);

  useEffect(() => {
    bind(submitted ? () => ({ ok: true, soft: true, silent: true }) : null);
  }, [submitted]);

  const words = countWords(text);
  const enough = words >= Math.min(ex.minWords, 8);
  const checks = ex.checks.map((c) => ({ label: c.label, ok: new RegExp(c.re, "im").test(text) }));

  return (
    <ScrollView contentContainerStyle={{ gap: 14, paddingBottom: 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <Text style={s.kind}>{ex.kind === "email" ? "Write an Email" : ex.kind === "discussion" ? "Write for an Academic Discussion" : "Take an Interview"}</Text>
      <View style={s.prompt}>
        <Text style={s.promptText}>{ex.stem}</Text>
        {ex.context ? <Text style={s.context}>{ex.context}</Text> : null}
        <SpeakButton text={ex.stem} lang="en-US" size={44} slowToo={false} />
      </View>
      <TextInput
        multiline
        value={text}
        editable={!submitted && !locked}
        onChangeText={(v) => {
          base.current = v;
          setText(v);
        }}
        placeholder={t("ex_type_here")}
        placeholderTextColor={colors.lockedDark}
        textAlignVertical="top"
        style={s.input}
        accessibilityLabel={ex.stem}
      />
      <View style={s.bar}>
        <Text style={[s.count, words >= ex.minWords && { color: colors.bambooDark }]}>
          {words} / {ex.minWords} {t("ex_words")}
        </Text>
        {ex.voice && mic.available && !submitted && (
          <Pressable onPress={() => (mic.listening ? mic.stop() : (base.current = text, mic.start()))} style={[s.mic, mic.listening && { backgroundColor: colors.red }]}>
            <Text style={{ fontSize: 18 }}>{mic.listening ? "⏹" : "🎤"}</Text>
            <Text style={s.micText}>{mic.listening ? t("ex_listening") : t("ex_dictate")}</Text>
          </Pressable>
        )}
      </View>
      {!submitted ? (
        <Button label={t("ex_submit")} disabled={!enough} onPress={() => setSubmitted(true)} />
      ) : (
        <View style={{ gap: 12 }}>
          <View style={s.box}>
            <Text style={s.boxTitle}>{t("ex_checklist")}</Text>
            {checks.map((c) => (
              <Text key={c.label} style={[s.check, { color: c.ok ? colors.bambooDark : colors.redDark }]}>
                {c.ok ? "✓" : "✗"} {c.label}
              </Text>
            ))}
            <Text style={[s.check, { color: words >= ex.minWords ? colors.bambooDark : colors.redDark }]}>
              {words >= ex.minWords ? "✓" : "✗"} {ex.minWords}+ {t("ex_words")}
            </Text>
          </View>
          <View style={[s.box, { backgroundColor: colors.bambooSoft, borderColor: colors.bamboo }]}>
            <Text style={s.boxTitle}>{t("ex_model")}</Text>
            <Text style={s.model}>{ex.model}</Text>
            <SpeakButton text={ex.model} lang="en-US" size={44} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  kind: { color: colors.skyDark, fontWeight: "900", fontSize: 13, letterSpacing: 1, textTransform: "uppercase" },
  prompt: { backgroundColor: colors.white, borderRadius: 16, borderWidth: 2, borderColor: colors.line, padding: 14, gap: 8, alignItems: "flex-start" },
  promptText: { fontSize: 17, fontWeight: "700", color: colors.ink, lineHeight: 24 },
  context: { fontSize: 15, color: colors.inkSoft, lineHeight: 22 },
  input: { minHeight: 150, backgroundColor: colors.white, borderRadius: 16, borderWidth: 2, borderColor: colors.line, padding: 14, fontSize: 16, color: colors.ink },
  bar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  count: { color: colors.inkSoft, fontWeight: "800" },
  mic: { flexDirection: "row", gap: 6, alignItems: "center", backgroundColor: colors.bamboo, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  micText: { color: colors.white, fontWeight: "800" },
  box: { backgroundColor: colors.white, borderRadius: 16, borderWidth: 2, borderColor: colors.line, padding: 14, gap: 6 },
  boxTitle: { fontWeight: "900", color: colors.ink, fontSize: 15 },
  check: { fontSize: 15, fontWeight: "700" },
  model: { fontSize: 15.5, lineHeight: 23, color: colors.ink },
});
