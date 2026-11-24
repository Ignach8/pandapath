import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Ex } from "@/content/types";
import { useT } from "@/i18n";
import { buzz, sfx, speak } from "@/lib/audio";
import { shuffle } from "@/lib/rand";
import { colors } from "@/theme";
import type { ExProps } from "./types";

type M = Extract<Ex, { t: "match" }>;

export function Match({ ex, auto }: ExProps<M>) {
  const { t } = useT();
  const left = useMemo(() => shuffle(ex.pairs.map((p, i) => ({ i, label: p.a, say: p.say }))), [ex]);
  const right = useMemo(() => shuffle(ex.pairs.map((p, i) => ({ i, label: p.b }))), [ex]);
  const [selL, setSelL] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [bad, setBad] = useState<string | null>(null);
  const mistakes = useRef(0);

  useEffect(() => {
    if (done.length === ex.pairs.length) {
      const ok = mistakes.current <= 2;
      auto({ ok, soft: true, note: ok ? undefined : ex.pairs.map((p) => `${p.a} = ${p.b}`).join("  ·  ") });
    }
  }, [done]);

  const pickLeft = (i: number, say?: string) => {
    buzz("tap");
    setSelL(i);
    if (say) speak(say, ex.sayLang ?? "zh-CN");
  };
  const pickRight = (i: number) => {
    if (selL === null) return;
    if (selL === i) {
      sfx("correct");
      buzz("ok");
      setDone((d) => [...d, i]);
    } else {
      mistakes.current += 1;
      sfx("wrong");
      buzz("bad");
      setBad(`r${i}`);
      setTimeout(() => setBad(null), 450);
    }
    setSelL(null);
  };

  return (
    <View style={{ gap: 14 }}>
      <Text style={s.prompt}>{t("ex_match")}</Text>
      <View style={s.cols}>
        <View style={s.col}>
          {left.map((x) => (
            <Pressable
              key={`l${x.i}`}
              disabled={done.includes(x.i)}
              onPress={() => pickLeft(x.i, x.say)}
              style={[s.cell, selL === x.i && s.sel, done.includes(x.i) && s.done]}
            >
              <Text style={[s.cellText, { fontSize: 22 }]}>{x.label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={s.col}>
          {right.map((x) => (
            <Pressable
              key={`r${x.i}`}
              disabled={done.includes(x.i)}
              onPress={() => pickRight(x.i)}
              style={[s.cell, done.includes(x.i) && s.done, bad === `r${x.i}` && s.bad]}
            >
              <Text style={s.cellText}>{x.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  prompt: { fontSize: 20, fontWeight: "800", color: colors.ink },
  cols: { flexDirection: "row", gap: 12 },
  col: { flex: 1, gap: 10 },
  cell: { minHeight: 58, justifyContent: "center", backgroundColor: colors.white, borderWidth: 2, borderColor: colors.line, borderBottomWidth: 4, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 8 },
  cellText: { color: colors.ink, fontWeight: "700", fontSize: 14, textAlign: "center" },
  sel: { borderColor: colors.sky, backgroundColor: colors.skySoft },
  done: { opacity: 0.35, borderColor: colors.bamboo, backgroundColor: colors.bambooSoft },
  bad: { borderColor: colors.red, backgroundColor: colors.redSoft },
});
