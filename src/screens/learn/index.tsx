import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Panda } from "@/components/panda";
import { Button, Card, Chip } from "@/components/ui";
import { flatLessons, getCourse, getUnits } from "@/content";
import type { LessonDef, Unit } from "@/content/types";
import { K, useT } from "@/i18n";
import { buzz, voiceSupport } from "@/lib/audio";
import { lessonKindIcon } from "@/lib/builder";
import { useApp } from "@/store/app-store";
import { colors, unitColors } from "@/theme";

const OFFSETS = [0, 36, 58, 36, 0, -36, -58, -36];
const NODE = 90;
const HEADER = 128;

export function Learn() {
  const { t, l, tl } = useT();
  const courseId = useApp((s) => s.courseId);
  const done = useApp((s) => s.done);
  const skipTo = useApp((s) => s.skipTo[courseId] ?? -1);
  const { streak, gems, hearts } = useApp();
  const refreshHearts = useApp((s) => s.refreshHearts);
  const course = getCourse(courseId);
  const units = useMemo(() => getUnits(courseId), [courseId]);
  const flat = useMemo(() => flatLessons(courseId), [courseId]);
  const [toast, setToast] = useState("");
  const [noZh, setNoZh] = useState(false);
  const [hideZh, setHideZh] = useState(false);
  const list = useRef<FlatList<Unit>>(null);

  useEffect(() => {
    refreshHearts();
    voiceSupport().then((v) => setNoZh(course.family === "hsk" && !v.zh));
  }, [courseId]);

  // primera lección sin completar
  const currentIdx = useMemo(() => {
    for (const f of flat) if (f.index > skipTo && !done[f.lesson.id]) return f.index;
    return flat.length;
  }, [flat, done, skipTo]);

  const heights = useMemo(() => units.map((u) => HEADER + u.lessons.length * NODE + 32), [units]);
  const offsets = useMemo(() => {
    let acc = 0;
    return heights.map((h) => (acc += h) - h);
  }, [heights]);

  const currentUnit = Math.max(0, flat[Math.min(currentIdx, flat.length - 1)]?.unit.index ?? 0);
  useEffect(() => {
    const id = setTimeout(() => list.current?.scrollToIndex({ index: currentUnit, animated: false, viewPosition: 0.05 }), 60);
    return () => clearTimeout(id);
  }, [courseId]);

  const open = (lesson: LessonDef, index: number) => {
    buzz("tap");
    if (index > currentIdx) {
      setToast(t("lesson_locked"));
      setTimeout(() => setToast(""), 2200);
      return;
    }
    router.push({ pathname: "/lesson/[id]", params: { id: lesson.id } });
  };

  const openTtsSettings = async () => {
    try {
      if (Platform.OS === "android") await Linking.sendIntent("com.android.settings.TTS_SETTINGS");
      else await Linking.openSettings();
    } catch {
      Linking.openSettings();
    }
  };

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <View style={s.top}>
        <Pressable onPress={() => router.push("/courses")} style={s.course} accessibilityRole="button">
          <Text style={{ fontSize: 22 }}>{course.flag}</Text>
          <Text style={s.courseText}>{course.family === "toefl" ? "TOEFL" : l(course.title)}</Text>
          <Text style={{ color: colors.inkSoft }}>▾</Text>
        </Pressable>
        <View style={s.chips}>
          <Chip icon="🔥" label={streak} color={colors.peachDark} />
          <Chip icon="💎" label={gems} color={colors.skyDark} />
          <Chip icon="❤️" label={hearts} color={colors.redDark} />
        </View>
      </View>

      {noZh && !hideZh && (
        <Card style={{ backgroundColor: colors.goldSoft, borderColor: colors.gold, gap: 6, marginHorizontal: 16, marginBottom: 8, padding: 12 }}>
          <Text style={s.warnT}>🔈 {t("tts_missing_title")}</Text>
          <Text style={s.warnB}>{t("tts_missing_body")}</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button small tone="gold" label={t("tts_open")} onPress={openTtsSettings} style={{ flex: 1 }} />
            <Button small tone="ghost" label="✕" onPress={() => setHideZh(true)} />
          </View>
        </Card>
      )}
      <FlatList
        ref={list}
        data={units}
        keyExtractor={(u) => u.id}
        getItemLayout={(_, i) => ({ length: heights[i], offset: offsets[i], index: i })}
        onScrollToIndexFailed={() => {}}
        initialNumToRender={4}
        windowSize={5}
        maxToRenderPerBatch={4}
        renderItem={({ item: unit }) => {
          const c = unitColors[unit.colorIdx];
          return (
            <View style={{ height: heights[unit.index], paddingHorizontal: 16 }}>
              <View style={[s.banner, { backgroundColor: c.main, borderBottomColor: c.dark }]}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={s.bannerKicker}>
                    {t("unit_n", { n: unit.index + 1 })}
                    {unit.skill ? ` · ${t(("skill_" + unit.skill) as K)}` : ""}
                  </Text>
                  <Text style={s.bannerTitle} numberOfLines={2}>
                    {unit.icon} {l(unit.title)}
                  </Text>
                  {unit.subtitle ? (
                    <Text style={s.bannerSub} numberOfLines={1}>
                      {tl(unit.subtitle)}
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t("guide")}
                  onPress={() => router.push({ pathname: "/guide/[id]", params: { id: unit.id } })}
                  style={[s.guideBtn, { borderBottomColor: c.dark }]}
                >
                  <Text style={{ fontSize: 18 }}>📖</Text>
                  <Text style={[s.guideText, { color: c.dark }]}>{t("guide")}</Text>
                </Pressable>
              </View>
              <View style={{ alignItems: "center", paddingTop: 14 }}>
                {unit.lessons.map((lesson, k) => {
                  const g = flat.find((f) => f.lesson.id === lesson.id)?.index ?? 0;
                  const isDone = !!done[lesson.id] || g <= skipTo;
                  const isCurrent = g === currentIdx;
                  const locked = g > currentIdx;
                  return (
                    <View key={lesson.id} style={{ height: NODE, width: 150, alignItems: "center", justifyContent: "center", transform: [{ translateX: OFFSETS[k % OFFSETS.length] }] }}>
                      {isCurrent && (
                        <View style={s.start}>
                          <Text style={[s.startText, { color: c.dark }]}>{t("stage_start")}</Text>
                        </View>
                      )}
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`${t(("k_" + lesson.kind) as K)}`}
                        onPress={() => open(lesson, g)}
                        style={[
                          s.node,
                          isDone && { backgroundColor: colors.gold, borderBottomColor: colors.goldDark },
                          isCurrent && { backgroundColor: c.main, borderBottomColor: c.dark },
                          locked && { backgroundColor: colors.locked, borderBottomColor: colors.lockedDark },
                        ]}
                      >
                        <Text style={{ fontSize: 28, opacity: locked ? 0.45 : 1 }}>{locked ? "🔒" : isDone ? "✓" : lessonKindIcon(lesson.kind)}</Text>
                      </Pressable>
                      <Text style={s.nodeLabel} numberOfLines={1}>
                        {t(("k_" + lesson.kind) as K)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        }}
        ListFooterComponent={
          <View style={{ alignItems: "center", padding: 24, gap: 6 }}>
            <Panda size={90} mood="sleep" />
            <Text style={{ color: colors.inkSoft }}>{course.family === "hsk" ? t("hsk_note") : t("toefl_note")}</Text>
          </View>
        }
      />
      {toast ? (
        <View style={s.toast}>
          <Text style={s.toastText}>{toast}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 8 },
  course: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.white, borderRadius: 14, borderWidth: 2, borderColor: colors.line, paddingHorizontal: 10, paddingVertical: 6 },
  courseText: { fontWeight: "900", color: colors.ink, fontSize: 16 },
  chips: { flexDirection: "row", gap: 6 },
  banner: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 18, padding: 14, borderBottomWidth: 5, minHeight: 92 },
  bannerKicker: { color: "rgba(255,255,255,0.85)", fontWeight: "900", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8 },
  bannerTitle: { color: colors.white, fontWeight: "900", fontSize: 19 },
  bannerSub: { color: "rgba(255,255,255,0.9)", fontSize: 14 },
  guideBtn: { backgroundColor: colors.white, borderRadius: 14, borderBottomWidth: 4, paddingHorizontal: 12, paddingVertical: 8, alignItems: "center" },
  guideText: { fontWeight: "900", fontSize: 12 },
  node: { width: 72, height: 66, borderRadius: 36, borderBottomWidth: 6, alignItems: "center", justifyContent: "center", alignSelf: "center" },
  nodeLabel: { position: "absolute", bottom: -2, fontSize: 11, fontWeight: "800", color: colors.inkSoft, width: 150, textAlign: "center" },
  start: { position: "absolute", top: -6, backgroundColor: colors.white, borderRadius: 10, borderWidth: 2, borderColor: colors.line, paddingHorizontal: 8, paddingVertical: 2, zIndex: 2 },
  startText: { fontWeight: "900", fontSize: 11 },
  warnT: { fontWeight: "900", color: colors.ink, fontSize: 16 },
  warnB: { color: colors.inkSoft, lineHeight: 20 },
  toast: { position: "absolute", bottom: 24, left: 24, right: 24, backgroundColor: colors.ink, borderRadius: 14, padding: 14 },
  toastText: { color: colors.white, fontWeight: "700", textAlign: "center" },
});
