import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Panda } from "@/components/panda";
import { Card, H1 } from "@/components/ui";
import { K, useT } from "@/i18n";
import { dueWords, useApp } from "@/store/app-store";
import { colors } from "@/theme";
import { Quests } from "../learn/quests";

const DRILLS: { id: string; icon: string; key: K; sub: K }[] = [
  { id: "listen", icon: "🎧", key: "drill_listen", sub: "drill_listen_sub" },
  { id: "tones", icon: "🎼", key: "drill_tones", sub: "drill_tones_sub" },
  { id: "speak", icon: "🎤", key: "drill_speak", sub: "drill_speak_sub" },
  { id: "write", icon: "✍️", key: "drill_write", sub: "drill_write_sub" },
];

export function Practice() {
  const { t } = useT();
  const srs = useApp((s) => s.srs);
  const due = dueWords(srs).length;
  const go = (id: string) => router.push({ pathname: "/lesson/[id]", params: { id } });

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <ScrollView contentContainerStyle={s.scroll}>
        <H1>{t("practice_title")}</H1>
        <Card onPress={() => go("review")} style={s.review}>
          <Panda size={70} mood={due ? "think" : "happy"} />
          <View style={{ flex: 1 }}>
            <Text style={s.rTitle}>{t("review_due")}</Text>
            <Text style={s.rSub}>{due ? t("review_sub", { n: due }) : t("review_none")}</Text>
          </View>
        </Card>

        <Quests />

        <Text style={s.section}>{t("drills")}</Text>
        {DRILLS.map((d) => (
          <Card key={d.id} onPress={() => go(`drill:${d.id}`)} style={s.drill}>
            <Text style={{ fontSize: 30 }}>{d.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.dTitle}>{t(d.key)}</Text>
              <Text style={s.dSub}>{t(d.sub)}</Text>
            </View>
            <Text style={{ color: colors.inkSoft, fontSize: 20 }}>›</Text>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  scroll: { padding: 16, gap: 14 },
  review: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.skySoft, borderColor: colors.sky },
  rTitle: { fontSize: 20, fontWeight: "900", color: colors.ink },
  rSub: { color: colors.inkSoft, fontSize: 14, marginTop: 2 },
  section: { fontSize: 14, fontWeight: "900", color: colors.inkSoft, textTransform: "uppercase", letterSpacing: 1, marginTop: 6 },
  drill: { flexDirection: "row", alignItems: "center", gap: 14 },
  dTitle: { fontSize: 17, fontWeight: "900", color: colors.ink },
  dSub: { fontSize: 13.5, color: colors.inkSoft },
});
