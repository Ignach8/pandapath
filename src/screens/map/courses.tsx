import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, H1, Progress } from "@/components/ui";
import { COURSES, courseWordCount, flatLessons, getUnits } from "@/content";
import { useT } from "@/i18n";
import { useApp } from "@/store/app-store";
import { colors } from "@/theme";

/** Mapa de contenidos: todos los cursos, su avance y entrada al detalle por unidad. */
export function Courses() {
  const { t, l } = useT();
  const courseId = useApp((s) => s.courseId);
  const done = useApp((s) => s.done);
  const skip = useApp((s) => s.skipTo);

  const row = (id: string) => {
    const c = COURSES.find((x) => x.id === id)!;
    const lessons = flatLessons(id);
    const passed = lessons.filter((x) => done[x.lesson.id] || x.index <= (skip[id] ?? -1)).length;
    return (
      <Card key={id} onPress={() => router.push({ pathname: "/map/[id]", params: { id } })} style={[s.card, courseId === id && { borderColor: colors.bamboo }]}>
        <Text style={{ fontSize: 30 }}>{c.flag}</Text>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={s.line}>
            <Text style={s.title}>{c.family === "toefl" ? "TOEFL iBT" : l(c.title)}</Text>
            {courseId === id && <Text style={s.cur}>{t("current")}</Text>}
          </View>
          <Text style={s.sub}>{l(c.subtitle)}</Text>
          <Text style={s.meta}>
            {t("units_n", { n: getUnits(id).length })} · {t("words_n", { n: courseWordCount(c) })}
          </Text>
          <Progress value={lessons.length ? passed / lessons.length : 0} height={10} />
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={s.root} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={s.scroll}>
        <H1>🗺️ {t("courses_title")}</H1>
        <Text style={s.section}>{t("courses_hsk")}</Text>
        {COURSES.filter((c) => c.family === "hsk").map((c) => row(c.id))}
        <Text style={s.section}>{t("courses_toefl")}</Text>
        {row("toefl")}
        <Text style={s.note}>{t("hsk_note")}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },
  section: { fontSize: 14, fontWeight: "900", color: colors.inkSoft, textTransform: "uppercase", letterSpacing: 1, marginTop: 8 },
  card: { flexDirection: "row", gap: 12, alignItems: "center" },
  line: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 18, fontWeight: "900", color: colors.ink },
  cur: { fontSize: 11, fontWeight: "900", color: colors.white, backgroundColor: colors.bamboo, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, overflow: "hidden" },
  sub: { color: colors.inkSoft, fontSize: 13.5 },
  meta: { color: colors.inkSoft, fontSize: 12.5, fontWeight: "700" },
  note: { color: colors.inkSoft, fontSize: 12, marginTop: 8 },
});
