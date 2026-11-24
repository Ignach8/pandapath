import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { DialogueTurn, Ex } from "@/content/types";
import { useT } from "@/i18n";
import { buzz, sfx, speak } from "@/lib/audio";
import { shuffle } from "@/lib/rand";
import { useApp } from "@/store/app-store";
import { colors } from "@/theme";
import { Panda } from "../panda";
import { SpeakButton } from "../speak-button";
import type { ExProps } from "./types";

type ScrollViewHandle = NonNullable<Parameters<typeof ScrollView>[0]["ref"]> extends infer R ? (R extends { current: infer C } ? NonNullable<C> : never) : never;
type DG = Extract<Ex, { t: "dialogue" }>;
type Line = { who: "panda" | "you"; h: string; p: string; m: string };

/** Conversación guiada: Bambú habla, tú eliges la respuesta adecuada y la escuchas. */
export function Dialogue({ ex, auto }: ExProps<DG>) {
  const { t, l } = useT();
  const showPinyin = useApp((s) => s.showPinyin);
  const [step, setStep] = useState(0);
  const [lines, setLines] = useState<Line[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const mistakes = useRef(0);
  const scroll = useRef<ScrollViewHandle>(null);

  const turn: DialogueTurn | undefined = ex.turns[step];

  // opciones barajadas por turno
  const [opts, setOpts] = useState<{ h: string; p: string; m: string; ok: boolean }[]>([]);
  useEffect(() => {
    if (!turn) return;
    if (turn.who === "panda") {
      setLines((x) => [...x, { who: "panda", h: turn.h.replace(/ /g, ""), p: turn.p, m: l(turn.m) }]);
      speak(turn.h.replace(/ /g, ""), ex.lang);
      const next = setTimeout(() => setStep((n) => n + 1), 1600);
      return () => clearTimeout(next);
    }
    setOpts(shuffle(turn.options.map((o) => ({ h: o.h.replace(/ /g, ""), p: o.p, m: l(o.m), ok: o.ok }))));
  }, [step]);

  useEffect(() => {
    if (step >= ex.turns.length) auto({ ok: mistakes.current <= 1, soft: true, note: mistakes.current ? `✗ ${mistakes.current}` : undefined });
  }, [step]);

  useEffect(() => {
    scroll.current?.scrollToEnd({ animated: true });
  }, [lines.length, step]);

  const choose = (i: number) => {
    const o = opts[i];
    if (!o.ok) {
      mistakes.current += 1;
      sfx("wrong");
      buzz("bad");
      setWrong(i);
      setTimeout(() => setWrong(null), 500);
      return;
    }
    sfx("correct");
    buzz("ok");
    setLines((x) => [...x, { who: "you", h: o.h, p: o.p, m: o.m }]);
    speak(o.h, ex.lang);
    setStep((n) => n + 1);
  };

  return (
    <View style={{ flex: 1, gap: 10 }}>
      <Text style={s.prompt}>{ex.title}</Text>
      <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ gap: 10, paddingBottom: 8 }}>
        {lines.map((ln, i) => (
          <View key={i} style={[s.row, ln.who === "you" && { flexDirection: "row-reverse" }]}>
            {ln.who === "panda" && <Panda size={44} />}
            <View style={[s.bubble, ln.who === "you" ? s.you : s.panda]}>
              <Text style={s.han}>{ln.h}</Text>
              {showPinyin ? <Text style={s.py}>{ln.p}</Text> : null}
              <Text style={s.tr}>{ln.m}</Text>
            </View>
            <SpeakButton text={ln.h} lang={ex.lang} size={34} slowToo={false} />
          </View>
        ))}
      </ScrollView>
      {turn?.who === "you" && (
        <View style={{ gap: 8 }}>
          <Text style={s.hint}>{t("ex_talk_pick")}</Text>
          {opts.map((o, i) => (
            <Pressable key={o.h} accessibilityRole="button" onPress={() => choose(i)} style={[s.opt, wrong === i && { borderColor: colors.red, backgroundColor: colors.redSoft }]}>
              <Text style={s.optHan}>{o.h}</Text>
              {showPinyin ? <Text style={s.optPy}>{o.p}</Text> : null}
              <Text style={s.optTr}>{o.m}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  prompt: { fontSize: 18, fontWeight: "800", color: colors.ink },
  row: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  bubble: { maxWidth: "70%", borderRadius: 18, padding: 12, gap: 2 },
  panda: { backgroundColor: colors.white, borderWidth: 2, borderColor: colors.line },
  you: { backgroundColor: colors.skySoft, borderWidth: 2, borderColor: colors.sky },
  han: { fontSize: 22, fontWeight: "700", color: colors.ink },
  py: { fontSize: 14, color: colors.bambooDark, fontWeight: "700" },
  tr: { fontSize: 13.5, color: colors.inkSoft },
  hint: { color: colors.inkSoft, fontWeight: "800", fontSize: 13, textTransform: "uppercase", letterSpacing: 0.8 },
  opt: { backgroundColor: colors.white, borderWidth: 2, borderColor: colors.line, borderBottomWidth: 4, borderRadius: 14, padding: 10 },
  optHan: { fontSize: 20, fontWeight: "700", color: colors.ink },
  optPy: { fontSize: 13.5, color: colors.bambooDark, fontWeight: "700" },
  optTr: { fontSize: 13, color: colors.inkSoft },
});
