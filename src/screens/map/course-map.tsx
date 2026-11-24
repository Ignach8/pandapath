import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Modal, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, H1 } from "@/components/ui";
import { flatLessons, getCourse, getUnits } from "@/content";
import type { Unit } from "@/content/types";
import { K, useT } from "@/i18n";
import { lessonKindIcon } from "@/lib/builder";
import { useApp } from "@/store/app-store";
import { colors, unitColors } from "@/theme";

export function CourseMap({ courseId }: { courseId: string }) {
  const { t, l, tl } = useT();
  const course = getCourse(courseId);
  const units = getUnits(courseId);
  const flat = flatLessons(courseId);
  const done = useApp((s) => s.done);
  const skip = useApp((s) => s.skipTo[courseId] ?? -1);
  const current = useApp((s) => s.courseId);
  const [jump, setJump] = useState<Unit | null>(null);

  const firstIndex = (u: Unit) => flat.find((f) => f.unit.id === u.id)?.index ?? 0;

  return (
    <SafeAreaView style={s.root} edges={["top", "bottom"]}>
      <FlatList
        data={units}
        keyExtractor={(u) => u.id}
        initialNumToRender={12}
        contentContainerStyle={s.scroll}
        ListHeaderComponent={
          <View style={{ gap: 10, marginBottom: 6 }}>
            <H1>
              {course.flag} {t("map_title")} · {course.family === "toefl" ? "TOEFL" : l(course.title)}
            </H1>
            {current !== courseId && (
              <Button
                label={t("switch_course")}
                onPress={() => {
                  useApp.getState().setCourse(courseId);
                  router.dismissTo("/");
                }}
              />
            )}
          </View>
        }
        renderItem={({ item: u }) => {
          const c = unitColors[u.colorIdx];
          const first = firstIndex(u);
          const unitDone = u.lessons.every((x) => done[x.id] || (flat.find((f) => f.lesson.id === x.id)?.index ?? 0) <= skip);
          return (
            <Card style={{ gap: 10, borderColor: c.main }}>
              <View style={s.line}>
                <Text style={{ fontSize: 26 }}>{u.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.kicker}>
                    {t("unit_n", { n: u.index + 1 })}
                    {u.skill ? ` · ${t(("skill_" + u.skill) as K)}` : ""}
                    {unitDone ? " ✓" : ""}
                  </Text>
                  <Text style={s.title} numberOfLines={2}>
                    {l(u.title)}
                  </Text>
                  {u.subtitle ? (
                    <Text style={s.sub} numberOfLines={1}>
                      {tl(u.subtitle)}
                    </Text>
                  ) : null}
                </View>
              </View>
              <View style={s.chips}>
                {u.lessons.map((x) => (
                  <Text key={x.id} style={[s.chip, done[x.id] ? { backgroundColor: colors.goldSoft } : null]}>
                    {lessonKindIcon(x.kind)} {t(("k_" + x.kind) as K)}
                  </Text>
                ))}
              </View>
              <View style={s.line}>
                <Button small tone="secondary" label={`📖 ${t("guide")}`} style={{ flex: 1 }} onPress={() => router.push({ pathname: "/guide/[id]", params: { id: u.id } })} />
                {first > skip + 1 && <Button small tone="ghost" label={t("jump_here")} style={{ flex: 1 }} onPress={() => setJump(u)} />}
              </View>
            </Card>
          );
        }}
      />
      <Modal transparent animationType="fade" visible={!!jump} onRequestClose={() => setJump(null)}>
        <View style={s.scrim}>
          <View style={s.dialog}>
            <Text style={s.dTitle}>{t("jump_here")}</Text>
            <Text style={s.dText}>{t("jump_confirm")}</Text>
            <Button
              label={t("ok")}
              style={{ alignSelf: "stretch" }}
              onPress={() => {
                if (jump) {
                  useApp.getState().jumpTo(courseId, firstIndex(jump));
                  useApp.getState().setCourse(courseId);
                }
                setJump(null);
                router.dismissTo("/");
              }}
            />
            <Button tone="ghost" label={t("cancel")} style={{ alignSelf: "stretch" }} onPress={() => setJump(null)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },
  line: { flexDirection: "row", alignItems: "center", gap: 10 },
  kicker: { fontSize: 12, fontWeight: "900", color: colors.inkSoft, textTransform: "uppercase", letterSpacing: 0.8 },
  title: { fontSize: 17, fontWeight: "900", color: colors.ink },
  sub: { color: colors.inkSoft, fontSize: 13.5 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { fontSize: 12, fontWeight: "700", color: colors.ink, backgroundColor: colors.cream, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, overflow: "hidden" },
  scrim: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 24 },
  dialog: { backgroundColor: colors.cream, borderRadius: 24, padding: 22, alignItems: "center", gap: 10 },
  dTitle: { fontSize: 22, fontWeight: "900", color: colors.ink },
  dText: { color: colors.inkSoft, textAlign: "center", fontSize: 15 },
});
