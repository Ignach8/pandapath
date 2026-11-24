import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SpeakButton } from "@/components/speak-button";
import { Button, Card, H1 } from "@/components/ui";
import { getUnits } from "@/content";
import type { Unit } from "@/content/types";
import { useT } from "@/i18n";
import { useApp } from "@/store/app-store";
import { colors } from "@/theme";

const findUnit = (id: string): Unit | undefined => getUnits(id.split("-")[0]).find((u) => u.id === id);

/** Guía de la unidad (equivalente al «libro de guía»): explicaciones, vocabulario y frases clave con audio. */
export function Guide({ unitId }: { unitId: string }) {
  const { t, l } = useT();
  const showPinyin = useApp((s) => s.showPinyin);
  const unit = findUnit(unitId);
  if (!unit) return null;
  const en = unit.courseId === "toefl";
  const lang = en ? "en-US" : "zh-CN";

  return (
    <SafeAreaView style={s.root} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.kicker}>
          {t("guide_title")} · {t("unit_n", { n: unit.index + 1 })}
        </Text>
        <H1>
          {unit.icon} {l(unit.title)}
        </H1>

        {unit.guide.map((g, i) => (
          <Card key={i} style={{ gap: 6 }}>
            <Text style={s.gTitle}>{l(g.title)}</Text>
            <Text style={s.gBody}>{l(g.body)}</Text>
          </Card>
        ))}

        {unit.words.length > 0 && (
          <>
            <Text style={s.section}>{t("guide_words")}</Text>
            <Card style={{ gap: 12 }}>
              {unit.words.map((w) => (
                <View key={w.id} style={s.wordRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.han}>{w.h}</Text>
                    {(showPinyin || en) && <Text style={s.py}>{w.p}</Text>}
                    <Text style={s.mean}>{l(w.m)}</Text>
                  </View>
                  <SpeakButton text={w.h} lang={lang} size={42} />
                </View>
              ))}
            </Card>
          </>
        )}

        {unit.sentences.length > 0 && unit.courseId !== "toefl" && (
          <>
            <Text style={s.section}>{t("guide_sentences")}</Text>
            <Card style={{ gap: 12 }}>
              {unit.sentences.map((x, i) => (
                <View key={i} style={s.wordRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.han}>{x.h.replace(/ /g, "")}</Text>
                    {showPinyin && <Text style={s.py}>{x.p}</Text>}
                    <Text style={s.mean}>{l(x.m)}</Text>
                  </View>
                  <SpeakButton text={x.h.replace(/ /g, "")} lang="zh-CN" size={42} />
                </View>
              ))}
            </Card>
          </>
        )}

        <Button
          label={t("guide_practice")}
          onPress={() => {
            const first = unit.lessons[0];
            router.replace({ pathname: "/lesson/[id]", params: { id: first.id } });
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },
  kicker: { fontSize: 12, fontWeight: "900", color: colors.skyDark, textTransform: "uppercase", letterSpacing: 1 },
  section: { fontSize: 14, fontWeight: "900", color: colors.inkSoft, textTransform: "uppercase", letterSpacing: 1, marginTop: 6 },
  gTitle: { fontSize: 18, fontWeight: "900", color: colors.ink },
  gBody: { fontSize: 15.5, lineHeight: 23, color: colors.inkSoft },
  wordRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  han: { fontSize: 24, fontWeight: "700", color: colors.ink },
  py: { fontSize: 15, color: colors.bambooDark, fontWeight: "700" },
  mean: { fontSize: 14, color: colors.inkSoft },
});
