import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Ex } from "@/content/types";
import { useT } from "@/i18n";
import { buzz, speak, stopSpeaking } from "@/lib/audio";
import { normHan, similarity, wordF1 } from "@/lib/pinyin";
import { useListen } from "@/lib/use-listen";
import { useApp } from "@/store/app-store";
import { colors } from "@/theme";
import { SpeakButton } from "../speak-button";
import { Button } from "../ui";
import type { ExProps } from "./types";

type SP = Extract<Ex, { t: "speak" }>;

const score = (said: string, target: string, lang: SP["lang"]) =>
  lang === "zh-CN" ? similarity(normHan(said), normHan(target)) : wordF1(said, target);

/** Pronunciación: escucha el modelo, repítelo y obtén un puntaje (o autoevalúate sin reconocimiento de voz). */
export function Speak({ ex, auto }: ExProps<SP>) {
  const { t } = useT();
  const showPinyin = useApp((s) => s.showPinyin);
  const mic = useListen(ex.lang);
  const [result, setResult] = useState<number | null>(null);
  const [tries, setTries] = useState(0);
  const threshold = ex.lang === "zh-CN" ? 0.75 : 0.7;

  useEffect(() => {
    speak(ex.text, ex.lang);
    return stopSpeaking;
  }, [ex.text]);

  useEffect(() => {
    if (mic.listening || !mic.transcript || result !== null) return;
    const sc = score(mic.transcript, ex.text, ex.lang);
    setResult(sc);
    setTries((n) => n + 1);
    if (sc >= threshold) {
      buzz("ok");
      auto({ ok: true, soft: true, note: `${t("ex_heard")} ${mic.transcript}` });
    }
  }, [mic.listening, mic.transcript]);

  const retry = () => {
    setResult(null);
    mic.reset();
    mic.start();
  };

  const failedTwice = result !== null && result < threshold && tries >= 2;
  useEffect(() => {
    if (failedTwice) auto({ ok: false, soft: true, correct: ex.text, note: `${t("ex_heard")} ${mic.transcript}` });
  }, [failedTwice]);

  return (
    <View style={{ gap: 16 }}>
      <Text style={s.prompt}>{t("ex_say")}</Text>
      <View style={s.card}>
        <Text style={[s.text, ex.lang !== "zh-CN" && { fontSize: 24, lineHeight: 32 }]}>{ex.text}</Text>
        {ex.sub && (showPinyin || ex.lang !== "zh-CN") ? <Text style={s.sub}>{ex.sub}</Text> : null}
        {ex.meaning ? <Text style={s.meaning}>{ex.meaning}</Text> : null}
        <SpeakButton text={ex.text} lang={ex.lang} size={56} />
      </View>

      {mic.available ? (
        <View style={s.micArea}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("ex_hold_mic")}
            onPress={() => (mic.listening ? mic.stop() : result !== null ? retry() : mic.start())}
            style={[s.mic, mic.listening && { backgroundColor: colors.red, borderBottomColor: colors.redDark }]}
          >
            <Text style={{ fontSize: 34 }}>{mic.listening ? "⏹" : "🎤"}</Text>
          </Pressable>
          <Text style={s.micLabel}>{mic.listening ? t("ex_listening") : t("ex_hold_mic")}</Text>
          {mic.transcript ? (
            <Text style={s.heard}>
              {t("ex_heard")} {mic.transcript}
            </Text>
          ) : null}
          {result !== null && (
            <Text style={[s.score, { color: result >= threshold ? colors.bambooDark : colors.redDark }]}>
              {t("ex_score")}: {Math.round(result * 100)}%
            </Text>
          )}
          {mic.error === "not-allowed" ? <Text style={s.note}>🎤 ✗</Text> : null}
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          <Text style={s.note}>{t("ex_no_stt")}</Text>
          <Button label={t("ex_self_ok")} onPress={() => auto({ ok: true, soft: true })} />
          <Button tone="secondary" label={t("ex_self_retry")} onPress={() => speak(ex.text, ex.lang)} />
        </View>
      )}
      <Button tone="ghost" small label={t("ex_skip_voice")} onPress={() => auto({ ok: true, skipped: true, silent: true })} />
    </View>
  );
}

const s = StyleSheet.create({
  prompt: { fontSize: 20, fontWeight: "800", color: colors.ink },
  card: { backgroundColor: colors.white, borderRadius: 20, borderWidth: 2, borderColor: colors.line, borderBottomWidth: 5, padding: 20, alignItems: "center", gap: 10 },
  text: { fontSize: 40, fontWeight: "700", color: colors.ink, textAlign: "center" },
  sub: { fontSize: 18, color: colors.bambooDark, fontWeight: "700", textAlign: "center" },
  meaning: { fontSize: 16, color: colors.inkSoft, textAlign: "center" },
  micArea: { alignItems: "center", gap: 8 },
  mic: { width: 82, height: 82, borderRadius: 41, backgroundColor: colors.bamboo, borderBottomWidth: 5, borderBottomColor: colors.bambooDark, alignItems: "center", justifyContent: "center" },
  micLabel: { color: colors.inkSoft, fontWeight: "700" },
  heard: { color: colors.ink, fontSize: 16, textAlign: "center" },
  score: { fontSize: 18, fontWeight: "900" },
  note: { color: colors.inkSoft, fontSize: 14, textAlign: "center", lineHeight: 20 },
});
