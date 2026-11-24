import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Ex } from "@/content/types";
import { useT } from "@/i18n";
import { buzz, speak } from "@/lib/audio";
import { useApp } from "@/store/app-store";
import { colors } from "@/theme";
import { SpeakButton } from "../speak-button";
import { Tr, TrFold } from "../tr-text";
import type { ExProps } from "./types";

type MC = Extract<Ex, { t: "mc" }>;

export function Choice({ ex, locked, bind }: ExProps<MC>) {
  const { t, ti } = useT();
  const showPinyin = useApp((s) => s.showPinyin);
  const [sel, setSel] = useState<number | null>(null);

  useEffect(() => {
    if (ex.say?.auto) speak(ex.say.text, ex.say.lang);
  }, [ex]);

  useEffect(() => {
    bind(sel === null ? null : () => ({ ok: sel === ex.ans, correct: ex.opts[ex.ans].label, note: ex.why }));
  }, [sel, ex]);

  const hidden = ex.say?.hideText;
  return (
    <ScrollView contentContainerStyle={s.wrap} showsVerticalScrollIndicator={false}>
      {ex.passage && (
        <View style={s.passage}>
          {ex.passage.title ? <Text style={s.passTitle}>{ex.passage.title}</Text> : null}
          <Text style={s.passText}>{ex.passage.text}</Text>
          <TrFold en={ex.passage.text} />
        </View>
      )}
      <Text style={s.prompt}>{ex.big ? t("ex_pick_meaning") : ti(ex.stem)}</Text>
      {!ex.big && !ex.say?.hideText ? <Tr en={ex.stem} /> : null}
      {ex.say?.hideText && ex.say.lang === "en-US" ? <TrFold en={ex.say.text} /> : null}
      <View style={s.stemRow}>
        {ex.say && <SpeakButton text={ex.say.text} lang={ex.say.lang} size={hidden ? 76 : 52} />}
        {!hidden && ex.big && (
          <View style={{ flex: 1 }}>
            <Text style={s.big}>{ex.stem}</Text>
            {ex.stemSub && (showPinyin || ex.say?.lang === "en-US") ? <Text style={s.sub}>{ex.stemSub}</Text> : null}
          </View>
        )}
        {!hidden && !ex.big && ex.stemSub ? <Text style={[s.sub, { flex: 1 }]}>{ex.stemSub}</Text> : null}
      </View>
      <View style={s.opts}>
        {ex.opts.map((o, i) => {
          const picked = sel === i;
          const showRight = locked && i === ex.ans;
          const showWrong = locked && picked && i !== ex.ans;
          return (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityState={{ selected: picked }}
              disabled={locked}
              onPress={() => {
                buzz("tap");
                setSel(i);
              }}
              style={[s.opt, picked && s.optSel, showRight && s.optRight, showWrong && s.optWrong]}
            >
              <Text style={[s.optNum, picked && { color: colors.skyDark }]}>{i + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[s.optText, /[一-鿿]/.test(o.label) && { fontSize: 24 }]}>{o.label}</Text>
                <Tr en={o.label} style={{ fontSize: 13, marginTop: 2 }} />
                {o.sub && showPinyin ? <Text style={s.optSub}>{o.sub}</Text> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 16, paddingBottom: 24 },
  prompt: { fontSize: 20, fontWeight: "800", color: colors.ink },
  stemRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  big: { fontSize: 44, fontWeight: "700", color: colors.ink },
  sub: { fontSize: 18, color: colors.bambooDark, fontWeight: "700" },
  opts: { gap: 10 },
  opt: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.white, borderWidth: 2, borderColor: colors.line, borderBottomWidth: 4, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14 },
  optSel: { borderColor: colors.sky, backgroundColor: colors.skySoft },
  optRight: { borderColor: colors.bamboo, backgroundColor: colors.bambooSoft },
  optWrong: { borderColor: colors.red, backgroundColor: colors.redSoft },
  optNum: { width: 28, height: 28, borderRadius: 8, borderWidth: 2, borderColor: colors.line, textAlign: "center", lineHeight: 24, fontWeight: "800", color: colors.inkSoft },
  optText: { fontSize: 17, color: colors.ink, fontWeight: "600" },
  optSub: { fontSize: 14, color: colors.bambooDark, marginTop: 2 },
  passage: { backgroundColor: colors.white, borderRadius: 16, borderWidth: 2, borderColor: colors.line, padding: 14, gap: 6 },
  passTitle: { fontWeight: "900", color: colors.skyDark, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 },
  passText: { fontSize: 15.5, lineHeight: 23, color: colors.ink },
});
