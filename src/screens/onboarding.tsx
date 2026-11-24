import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Panda } from "@/components/panda";
import { Button, H1 } from "@/components/ui";
import type { Lang } from "@/content/types";
import { K, useT } from "@/i18n";
import { useApp } from "@/store/app-store";
import { colors } from "@/theme";

const LANGS: { id: Lang; label: string }[] = [
  { id: "es", label: "🇪🇸 Español" },
  { id: "en", label: "🇬🇧 English" },
  { id: "zh", label: "🇨🇳 中文" },
];
const GOALS: { xp: number; key: K }[] = [
  { xp: 10, key: "goal_1" },
  { xp: 20, key: "goal_2" },
  { xp: 30, key: "goal_3" },
  { xp: 50, key: "goal_4" },
];

export function Onboarding() {
  const { t, lang } = useT();
  const setLang = useApp((s) => s.setLang);
  const finish = useApp((s) => s.finishOnboarding);
  const [step, setStep] = useState(0);
  const [family, setFamily] = useState<"hsk" | "toefl">("hsk");
  const [level, setLevel] = useState(1);
  const [goal, setGoal] = useState(20);

  const Option = ({ on, onPress, title, sub }: { on: boolean; onPress: () => void; title: string; sub?: string }) => (
    <Pressable accessibilityRole="button" onPress={onPress} style={[s.opt, on && s.optOn]}>
      <Text style={s.optT}>{title}</Text>
      {sub ? <Text style={s.optS}>{sub}</Text> : null}
    </Pressable>
  );

  return (
    <SafeAreaView style={s.root}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={{ alignItems: "center", gap: 8 }}>
          <Panda size={150} mood={step === 3 ? "cheer" : "happy"} />
          <H1 style={{ textAlign: "center" }}>{t("welcome_title")}</H1>
          <Text style={s.sub}>{t("welcome_sub")}</Text>
        </View>

        {step === 0 && (
          <View style={s.group}>
            <Text style={s.q}>{t("pick_ui")}</Text>
            {LANGS.map((x) => (
              <Option key={x.id} on={lang === x.id} onPress={() => setLang(x.id)} title={x.label} />
            ))}
          </View>
        )}
        {step === 1 && (
          <View style={s.group}>
            <Text style={s.q}>{t("pick_course")}</Text>
            <Option on={family === "hsk"} onPress={() => setFamily("hsk")} title={`🇨🇳 ${t("course_hsk")}`} sub={t("course_hsk_sub")} />
            <Option on={family === "toefl"} onPress={() => setFamily("toefl")} title={`🇺🇸 ${t("course_toefl")}`} sub={t("course_toefl_sub")} />
          </View>
        )}
        {step === 2 && family === "hsk" && (
          <View style={s.group}>
            <Text style={s.q}>{t("pick_level")}</Text>
            <View style={s.levels}>
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <Pressable key={n} onPress={() => setLevel(n)} style={[s.lvl, level === n && s.optOn]} accessibilityRole="button">
                  <Text style={s.lvlT}>{n >= 7 ? "7–9" : n}</Text>
                </Pressable>
              ))}
            </View>
            {level === 1 && <Text style={s.sub}>{t("level_zero")}</Text>}
          </View>
        )}
        {step === 3 && (
          <View style={s.group}>
            <Text style={s.q}>{t("goal_title")}</Text>
            {GOALS.map((g) => (
              <Option key={g.xp} on={goal === g.xp} onPress={() => setGoal(g.xp)} title={`${t(g.key)} · ${g.xp} XP`} />
            ))}
          </View>
        )}
      </ScrollView>
      <View style={s.footer}>
        <Button
          label={step === 3 ? t("start") : t("next")}
          onPress={() => {
            const skipLevel = step === 1 && family === "toefl";
            if (skipLevel) return setStep(3);
            if (step < 3) return setStep(step + 1);
            finish({ courseId: family === "toefl" ? "toefl" : `hsk${level}`, goal });
            router.replace("/");
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  scroll: { padding: 20, gap: 18 },
  sub: { color: colors.inkSoft, textAlign: "center", fontSize: 16, lineHeight: 23 },
  group: { gap: 10 },
  q: { fontSize: 20, fontWeight: "900", color: colors.ink },
  opt: { backgroundColor: colors.white, borderWidth: 2, borderColor: colors.line, borderBottomWidth: 4, borderRadius: 16, padding: 14, gap: 2 },
  optOn: { borderColor: colors.bamboo, backgroundColor: colors.bambooSoft },
  optT: { fontSize: 18, fontWeight: "800", color: colors.ink },
  optS: { fontSize: 14, color: colors.inkSoft },
  levels: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  lvl: { width: 64, height: 64, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.white, borderWidth: 2, borderColor: colors.line, borderBottomWidth: 4 },
  lvlT: { fontSize: 20, fontWeight: "900", color: colors.ink },
  footer: { padding: 16 },
});
