import { router } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Panda } from "@/components/panda";
import { Button, Card, H1 } from "@/components/ui";
import type { Lang } from "@/content/types";
import { K, useT } from "@/i18n";
import { useApp } from "@/store/app-store";
import { colors } from "@/theme";

const LANGS: { id: Lang; label: string }[] = [
  { id: "es", label: "🇪🇸 Español" },
  { id: "en", label: "🇬🇧 English" },
  { id: "zh", label: "🇨🇳 中文" },
];

export function Profile() {
  const { t } = useT();
  const app = useApp();
  const [confirm, setConfirm] = useState(false);
  const seen = Object.keys(app.srs).length;
  const badges: { icon: string; key: K; on: boolean }[] = [
    { icon: "🌱", key: "badge_first", on: Object.keys(app.done).length > 0 },
    { icon: "🔥", key: "badge_streak3", on: app.streak >= 3 },
    { icon: "💯", key: "badge_xp100", on: app.xp >= 100 },
    { icon: "📚", key: "badge_words50", on: seen >= 50 },
    { icon: "🏅", key: "badge_perfect", on: app.perfect > 0 },
  ];

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.head}>
          <Panda size={96} />
          <View style={{ flex: 1 }}>
            <H1>{t("profile_title")}</H1>
            <Text style={s.sub}>🔥 {app.streak} {t("days")}</Text>
          </View>
        </View>

        <View style={s.grid}>
          <Stat icon="⚡" label={t("total_xp")} value={app.xp} />
          <Stat icon="💎" label={t("gems")} value={app.gems} />
          <Stat icon="📖" label={t("words_seen")} value={seen} />
        </View>

        <Text style={s.section}>{t("badges")}</Text>
        <View style={s.badges}>
          {badges.map((b) => (
            <View key={b.key} style={[s.badge, !b.on && { opacity: 0.35 }]}>
              <Text style={{ fontSize: 30 }}>{b.icon}</Text>
              <Text style={s.badgeText}>{t(b.key)}</Text>
            </View>
          ))}
        </View>

        <Text style={s.section}>{t("settings")}</Text>
        <Card style={{ gap: 14 }}>
          <Text style={s.label}>{t("ui_language")}</Text>
          <View style={s.row}>
            {LANGS.map((l) => (
              <Pressable key={l.id} onPress={() => app.setLang(l.id)} style={[s.pill, app.uiLang === l.id && s.pillOn]} accessibilityRole="button">
                <Text style={[s.pillText, app.uiLang === l.id && { color: colors.white }]}>{l.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={s.label}>{t("daily_goal")}</Text>
          <View style={s.row}>
            {[10, 20, 30, 50].map((g) => (
              <Pressable key={g} onPress={() => app.set({ dailyGoal: g })} style={[s.pill, app.dailyGoal === g && s.pillOn]} accessibilityRole="button">
                <Text style={[s.pillText, app.dailyGoal === g && { color: colors.white }]}>{g}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={s.label}>{t("tts_speed")}</Text>
          <View style={s.row}>
            {[false, true].map((slow) => (
              <Pressable key={String(slow)} onPress={() => app.set({ slowTts: slow })} style={[s.pill, app.slowTts === slow && s.pillOn]} accessibilityRole="button">
                <Text style={[s.pillText, app.slowTts === slow && { color: colors.white }]}>{slow ? "🐢 " + t("speed_slow") : t("speed_normal")}</Text>
              </Pressable>
            ))}
          </View>

          <Toggle label={t("show_pinyin")} value={app.showPinyin} onChange={(v) => app.set({ showPinyin: v })} />
          <Toggle label={t("sound_fx")} value={app.sound} onChange={(v) => app.set({ sound: v })} />
          <Toggle label={t("haptics")} value={app.haptics} onChange={(v) => app.set({ haptics: v })} />
        </Card>

        <Button tone="secondary" label={`🗺️ ${t("courses_title")}`} onPress={() => router.push("/courses")} />
        <Button tone="ghost" label={t("reset")} onPress={() => setConfirm(true)} />

        <Text style={s.credits}>
          {t("hsk_note")}{"\n"}
          Vocabulario: complete-hsk-vocabulary (MIT) · CC-CEDICT (CC BY-SA 4.0) · Trazos: hanzi-writer + Make Me a Hanzi (Arphic PL){"\n"}
          {t("toefl_note")} TOEFL® is a registered trademark of ETS; PandaPath is not affiliated with or endorsed by ETS.
        </Text>
      </ScrollView>

      <Modal transparent animationType="fade" visible={confirm} onRequestClose={() => setConfirm(false)}>
        <View style={s.scrim}>
          <View style={s.dialog}>
            <Text style={s.dTitle}>{t("reset")}</Text>
            <Text style={s.dText}>{t("reset_confirm")}</Text>
            <Button tone="danger" label={t("reset")} onPress={() => { app.reset(); setConfirm(false); router.replace("/onboarding"); }} style={{ alignSelf: "stretch" }} />
            <Button tone="ghost" label={t("cancel")} onPress={() => setConfirm(false)} style={{ alignSelf: "stretch" }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <View style={s.stat}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text style={s.statV}>{value}</Text>
      <Text style={s.statL}>{label}</Text>
    </View>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={s.toggle}>
      <Text style={s.label}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.bamboo, false: colors.locked }} accessibilityLabel={label} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  scroll: { padding: 16, gap: 14, paddingBottom: 40 },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  sub: { color: colors.peachDark, fontWeight: "800", fontSize: 16 },
  grid: { flexDirection: "row", gap: 10 },
  stat: { flex: 1, backgroundColor: colors.white, borderRadius: 16, borderWidth: 2, borderColor: colors.line, borderBottomWidth: 4, padding: 12, alignItems: "center" },
  statV: { fontSize: 22, fontWeight: "900", color: colors.ink },
  statL: { fontSize: 11, fontWeight: "800", color: colors.inkSoft, textTransform: "uppercase", textAlign: "center" },
  section: { fontSize: 14, fontWeight: "900", color: colors.inkSoft, textTransform: "uppercase", letterSpacing: 1 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badge: { width: 96, alignItems: "center", gap: 4, backgroundColor: colors.white, borderRadius: 16, padding: 10, borderWidth: 2, borderColor: colors.line },
  badgeText: { fontSize: 11.5, fontWeight: "800", color: colors.ink, textAlign: "center" },
  label: { fontWeight: "800", color: colors.ink, fontSize: 15 },
  row: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  pill: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.white },
  pillOn: { backgroundColor: colors.bamboo, borderColor: colors.bambooDark },
  pillText: { fontWeight: "800", color: colors.ink },
  toggle: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  credits: { color: colors.inkSoft, fontSize: 12, lineHeight: 18, marginTop: 8 },
  scrim: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 24 },
  dialog: { backgroundColor: colors.cream, borderRadius: 24, padding: 22, alignItems: "center", gap: 10 },
  dTitle: { fontSize: 22, fontWeight: "900", color: colors.ink },
  dText: { color: colors.inkSoft, textAlign: "center", fontSize: 15 },
});
