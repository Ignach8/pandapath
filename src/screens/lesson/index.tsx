import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Exercise, Result } from "@/components/exercises";
import { Panda } from "@/components/panda";
import { Button, Progress } from "@/components/ui";
import type { Ex } from "@/content/types";
import { useT } from "@/i18n";
import { buzz, sfx, stopSpeaking } from "@/lib/audio";
import { buildLesson } from "@/lib/builder";
import { HEART_REFILL_COST, HEART_REGEN_MS, dueWords, useApp } from "@/store/app-store";
import { colors } from "@/theme";

type Phase = "answer" | "feedback" | "done";

const wordIdsOf = (ex: Ex): string[] => {
  if (ex.t === "intro") return [ex.word.id];
  if (ex.t === "match") return ex.wordIds ?? [];
  if (ex.t === "mc" || ex.t === "bank" || ex.t === "trace" || ex.t === "speak") return ex.wordId ? [ex.wordId] : [];
  return [];
};

export function LessonScreen({ lessonId }: { lessonId: string }) {
  const { t, lang, tr } = useT();
  const app = useApp();
  const practice = lessonId === "review" || lessonId.startsWith("drill:");

  const built = useMemo(() => {
    const s = useApp.getState();
    return buildLesson(lessonId, lang, { dueIds: dueWords(s.srs), learnedIds: Object.keys(s.srs), courseId: s.courseId });
  }, [lessonId]);

  const [queue, setQueue] = useState<Ex[]>(built?.ex ?? []);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("answer");
  const [result, setResult] = useState<Result | null>(null);
  const [canCheck, setCanCheck] = useState(false);
  const [quit, setQuit] = useState(false);
  const [noHearts, setNoHearts] = useState(false);
  const [summary, setSummary] = useState<{ xp: number; gems: number; acc: number; stars: number } | null>(null);
  const checkRef = useRef<(() => Result) | null>(null);
  const stats = useRef({ correct: 0, total: 0, words: {} as Record<string, boolean>, retried: new Set<Ex>() });

  useEffect(() => {
    app.refreshHearts();
    if (!practice && useApp.getState().hearts <= 0) setNoHearts(true);
    return stopSpeaking;
  }, []);

  const ex = queue[idx];

  const bind = useCallback((fn: (() => Result) | null) => {
    checkRef.current = fn;
    setCanCheck(!!fn);
  }, []);

  const advance = useCallback(() => {
    stopSpeaking();
    checkRef.current = null;
    setCanCheck(false);
    setResult(null);
    if (idx + 1 >= queue.length) {
      finish();
      return;
    }
    setIdx((i) => i + 1);
    setPhase("answer");
  }, [idx, queue.length]);

  const commit = useCallback(
    (r: Result) => {
      if (phase !== "answer" || !ex) return;
      if (r.skipped) {
        advance();
        return;
      }
      const st = stats.current;
      const real = ex.t !== "intro";
      for (const id of wordIdsOf(ex)) st.words[id] = ex.t === "intro" ? st.words[id] ?? true : (st.words[id] ?? true) && r.ok;
      if (r.silent) {
        advance();
        return;
      }
      if (real) {
        st.total += 1;
        if (r.ok) st.correct += 1;
      }
      sfx(r.ok ? "correct" : "wrong");
      buzz(r.ok ? "ok" : "bad");
      if (!r.ok && !r.soft) {
        if (!practice) app.loseHeart();
        if (!st.retried.has(ex)) {
          st.retried.add(ex);
          setQueue((q) => [...q, ex]);
        }
      }
      setResult(r);
      setPhase("feedback");
    },
    [phase, ex, advance, practice],
  );

  const onCheck = () => {
    const fn = checkRef.current;
    if (fn) commit(fn());
  };

  const onContinue = () => {
    if (!practice && useApp.getState().hearts <= 0 && result && !result.ok && !result.soft) {
      setNoHearts(true);
      return;
    }
    advance();
  };

  function finish() {
    const st = stats.current;
    const acc = st.total ? st.correct / st.total : 1;
    const xp = st.correct * 10 + 5 + (acc >= 0.95 ? 5 : 0);
    const gems = 2 + (acc >= 0.95 ? 2 : 0);
    const stars = app.completeLesson({ lessonId, xp, gems, correct: st.correct, total: st.total, wordResults: st.words });
    if (practice) app.grantHeart();
    sfx("complete");
    setSummary({ xp, gems, acc, stars });
    setPhase("done");
  }

  if (!built || !ex) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.center}>
          <Text style={s.title}>{t("loading")}</Text>
          <Button label={t("close")} onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  if (phase === "done" && summary) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.center}>
          <Panda size={170} mood="cheer" />
          <Text style={s.title}>{t("lesson_complete")}</Text>
          <Text style={s.stars}>{"⭐".repeat(summary.stars)}</Text>
          <View style={s.stats}>
            <Stat label={t("xp_earned")} value={`+${summary.xp}`} color={colors.goldDark} />
            <Stat label={t("accuracy")} value={`${Math.round(summary.acc * 100)}%`} color={colors.bambooDark} />
            <Stat label={t("gems_earned")} value={`+${summary.gems} 💎`} color={colors.skyDark} />
          </View>
          <Text style={s.streak}>
            🔥 {t("streak_label")}: {app.streak} {t("days")}
          </Text>
        </View>
        <View style={s.footer}>
          <Button label={t("cont")} onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const good = result?.ok;
  const wait = Math.max(1, Math.ceil((app.heartsAt + HEART_REGEN_MS - Date.now()) / 60000));

  return (
    <SafeAreaView style={s.root}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={s.header}>
          <Pressable accessibilityRole="button" accessibilityLabel={t("close")} onPress={() => setQuit(true)} hitSlop={12}>
            <Text style={s.x}>✕</Text>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Progress value={idx / queue.length} />
          </View>
          {!practice && <Text style={s.hearts}>❤️ {app.hearts}</Text>}
        </View>

        <View style={s.body}>
          <Exercise key={`${idx}-${queue.length}`} ex={ex} locked={phase !== "answer"} bind={bind} auto={commit} />
        </View>

        {phase === "answer" ? (
          <View style={s.footer}>
            <Button label={ex.t === "intro" ? t("cont") : t("check")} disabled={!canCheck} onPress={onCheck} />
          </View>
        ) : (
          <View style={[s.footer, s.fb, { backgroundColor: good ? colors.bambooSoft : colors.redSoft }]}>
            <Text style={[s.fbTitle, { color: good ? colors.bambooDark : colors.redDark }]}>
              {good ? "✓ " + t("correct") : "✗ " + t("wrong")}
            </Text>
            {!good && result?.correct ? (
              <Text style={[s.fbBody, { color: colors.redDark }]}>
                {t("correct_answer")} {result.correct}{tr(result.correct) ? `\n${tr(result.correct)}` : ""}
              </Text>
            ) : null}
            {result?.note ? <Text style={[s.fbBody, { color: good ? colors.bambooDark : colors.redDark }]}>{result.note}{tr(result.note) ? `\n${tr(result.note)}` : ""}</Text> : null}
            <Button tone={good ? "primary" : "danger"} label={t("cont")} onPress={onContinue} />
          </View>
        )}
      </KeyboardAvoidingView>

      <Modal transparent animationType="fade" visible={quit} onRequestClose={() => setQuit(false)}>
        <View style={s.scrim}>
          <View style={s.dialog}>
            <Panda size={90} mood="sad" />
            <Text style={s.title}>{t("quit_title")}</Text>
            <Text style={s.dText}>{t("quit_body")}</Text>
            <Button label={t("quit_no")} onPress={() => setQuit(false)} style={{ alignSelf: "stretch" }} />
            <Button tone="ghost" label={t("quit_yes")} onPress={() => router.back()} style={{ alignSelf: "stretch" }} />
          </View>
        </View>
      </Modal>

      <Modal transparent animationType="fade" visible={noHearts} onRequestClose={() => setNoHearts(false)}>
        <View style={s.scrim}>
          <View style={s.dialog}>
            <Panda size={90} mood="sleep" />
            <Text style={s.title}>{t("no_hearts")}</Text>
            <Text style={s.dText}>{t("no_hearts_body")}</Text>
            <Text style={s.dText}>{t("hearts_wait", { m: wait })}</Text>
            <Button
              label={t("hearts_refill", { n: HEART_REFILL_COST })}
              disabled={app.gems < HEART_REFILL_COST}
              onPress={() => {
                if (app.refillHearts()) {
                  setNoHearts(false);
                  advance();
                }
              }}
              style={{ alignSelf: "stretch" }}
            />
            <Button
              tone="secondary"
              label={t("hearts_practice")}
              onPress={() => {
                setNoHearts(false);
                router.replace("/practice");
              }}
              style={{ alignSelf: "stretch" }}
            />
            <Button tone="ghost" label={t("close")} onPress={() => router.back()} style={{ alignSelf: "stretch" }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={s.stat}>
      <Text style={[s.statV, { color }]}>{value}</Text>
      <Text style={s.statL}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  header: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 6 },
  x: { fontSize: 22, color: colors.inkSoft, fontWeight: "900" },
  hearts: { fontSize: 16, fontWeight: "900", color: colors.redDark },
  body: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  footer: { padding: 16, gap: 10 },
  fb: { paddingBottom: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  fbTitle: { fontSize: 22, fontWeight: "900" },
  fbBody: { fontSize: 15, fontWeight: "600", lineHeight: 21 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 24 },
  title: { fontSize: 26, fontWeight: "900", color: colors.ink, textAlign: "center" },
  stars: { fontSize: 36 },
  stats: { flexDirection: "row", gap: 12, marginTop: 6 },
  stat: { backgroundColor: colors.white, borderRadius: 16, borderWidth: 2, borderColor: colors.line, paddingVertical: 12, paddingHorizontal: 16, alignItems: "center", minWidth: 96 },
  statV: { fontSize: 22, fontWeight: "900" },
  statL: { fontSize: 12, color: colors.inkSoft, fontWeight: "800", textTransform: "uppercase" },
  streak: { fontSize: 18, fontWeight: "800", color: colors.peachDark },
  scrim: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 24 },
  dialog: { backgroundColor: colors.cream, borderRadius: 24, padding: 22, alignItems: "center", gap: 10 },
  dText: { fontSize: 15, color: colors.inkSoft, textAlign: "center" },
});
