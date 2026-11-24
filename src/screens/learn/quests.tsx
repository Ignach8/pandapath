import { StyleSheet, Text, View } from "react-native";
import { Button, Card, Progress } from "@/components/ui";
import { useT } from "@/i18n";
import { sfx } from "@/lib/audio";
import { todayKey, useApp } from "@/store/app-store";
import { colors } from "@/theme";

/** Misiones diarias: meta de XP, lecciones y aciertos. */
export function Quests() {
  const { t } = useT();
  const daily = useApp((s) => s.daily);
  const goal = useApp((s) => s.dailyGoal);
  const claim = useApp((s) => s.claimQuest);
  const fresh = daily.date === todayKey();
  const today = fresh ? daily : { xp: 0, lessons: 0, correct: 0, claimed: [] as string[] };

  const items = [
    { id: "xp", label: t("q_xp", { n: goal }), cur: today.xp, max: goal, gems: 5 },
    { id: "lessons", label: t("q_lessons", { n: 2 }), cur: today.lessons, max: 2, gems: 5 },
    { id: "correct", label: t("q_correct", { n: 15 }), cur: today.correct, max: 15, gems: 5 },
  ];

  return (
    <Card style={{ gap: 12 }}>
      <Text style={s.title}>🎯 {t("quests")}</Text>
      {items.map((q) => {
        const done = q.cur >= q.max;
        const claimed = today.claimed.includes(q.id);
        return (
          <View key={q.id} style={{ gap: 6 }}>
            <View style={s.row}>
              <Text style={s.label}>{q.label}</Text>
              <Text style={s.count}>
                {Math.min(q.cur, q.max)}/{q.max}
              </Text>
            </View>
            <Progress value={q.cur / q.max} color={done ? colors.gold : colors.sky} height={12} />
            {done && !claimed && (
              <Button
                small
                tone="gold"
                label={t("claim", { n: q.gems })}
                onPress={() => {
                  sfx("complete");
                  claim(q.id, q.gems);
                }}
              />
            )}
            {claimed && <Text style={s.claimed}>✓ {t("claimed")}</Text>}
          </View>
        );
      })}
    </Card>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 18, fontWeight: "900", color: colors.ink },
  row: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontWeight: "700", color: colors.ink },
  count: { fontWeight: "800", color: colors.inkSoft },
  claimed: { color: colors.bambooDark, fontWeight: "800", fontSize: 13 },
});
